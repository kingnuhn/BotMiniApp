let tg;
try {
  tg = window.Telegram.WebApp;
  tg.expand();
} catch (e) {
  tg = { sendData: (data) => console.log("Данные для отправки:", data) };
}

let currentTimer = null;
let signalEndTime = 0;
let isSignalActive = false;

// Загружаем сохраненное состояние таймера
function loadTimerState() {
  // Дожидаемся, когда DOM полностью загрузится
  if (!document.getElementById("send")) {
    // Если DOM еще не загрузился, попробуем загрузить таймер позже
    setTimeout(loadTimerState, 100);
    return;
  }

  const savedEndTime = localStorage.getItem('signalEndTime');
  const savedSignalData = localStorage.getItem('signalData');
  
  if (savedEndTime) {
    const now = Math.floor(Date.now() / 1000);
    signalEndTime = parseInt(savedEndTime);
    
    // Проверяем, не истек ли уже таймер
    if (signalEndTime > now) {
      isSignalActive = true;
      
      // Блокируем выпадающие списки
      disableSelects();
      
      // Если есть сохраненные данные о сигнале, восстанавливаем их
      if (savedSignalData) {
        try {
          const signalData = JSON.parse(savedSignalData);
          
          // Обновляем отображение сигнала
          updateSignalDisplay(
            signalData.signal, 
            signalData.accuracy.replace('%', ''), 
            signalData.signal === "ПОКУПКА"
          );
          
          // Получаем ссылку на кнопку
          const button = document.getElementById("send");
          
          // Вычисляем оставшееся время
          const remainingTime = signalEndTime - now;
          const originalDuration = 60; // 1 минута в секундах
          
          console.log("Восстановление таймера:", remainingTime, "секунд осталось");
          
          // Применяем стили напрямую к кнопке
          button.classList.add("disabled");
          
          // Устанавливаем прогресс-бар
          const progress = (remainingTime / originalDuration) * 100;
          button.style.setProperty('--progress', `${progress}%`);
          
          // Обновляем текст кнопки
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;
          button.textContent = `🕒 ${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          // Запускаем таймер с оставшимся временем
          setTimeout(() => {
            startCountdown(button, remainingTime);
          }, 500);
          
        } catch (e) {
          console.error("Ошибка при восстановлении данных таймера:", e);
          clearTimerState();
        }
      }
    } else {
      // Если таймер истек, очищаем localStorage
      clearTimerState();
    }
  }
}

// Сохраняем состояние таймера
function saveTimerState(signalType, accuracy, isBuy, duration) {
  localStorage.setItem('signalEndTime', signalEndTime.toString());
  localStorage.setItem('signalData', JSON.stringify({
    instrument: document.getElementById("instrument").value,
    time: "1 минута",
    signal: signalType,
    accuracy: `${accuracy}%`,
    isBuy: isBuy
  }));
}

// Очищаем состояние таймера
function clearTimerState() {
  console.log("Очистка состояния таймера из localStorage");
  localStorage.removeItem('signalEndTime');
  localStorage.removeItem('signalData');
  isSignalActive = false;
  
  // Разблокируем выпадающие списки
  enableSelects();
  
  // Убедимся, что кнопка находится в правильном состоянии
  const button = document.getElementById("send");
  if (button) {
    resetButton(button);
  }
}

// Функция для блокировки выпадающих списков
function disableSelects() {
  const instrumentSelect = document.getElementById("instrument");
  const timeSelect = document.getElementById("time");
  
  if (instrumentSelect) {
    instrumentSelect.disabled = true;
    instrumentSelect.classList.add("disabled-select");
  }
  
  if (timeSelect) {
    timeSelect.disabled = true;
    timeSelect.classList.add("disabled-select");
  }
}

// Функция для разблокировки выпадающих списков
function enableSelects() {
  const instrumentSelect = document.getElementById("instrument");
  const timeSelect = document.getElementById("time");
  
  if (instrumentSelect) {
    instrumentSelect.disabled = false;
    instrumentSelect.classList.remove("disabled-select");
  }
  
  if (timeSelect) {
    timeSelect.disabled = false;
    timeSelect.classList.remove("disabled-select");
  }
}

let lastScrollTop = 0;
const scrollThreshold = 50; // Минимальное расстояние прокрутки для срабатывания анимации
let isScrolling = false;
let scrollTimeout;

// Theme management
function initTheme() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  const html = document.documentElement;
  
  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'default';
  html.setAttribute('data-theme', savedTheme);
  
  // Set active button
  themeButtons.forEach(btn => {
    if (btn.dataset.theme === savedTheme) {
      btn.classList.add('active');
    }
  });

  // Add click handlers
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      
      // Update theme
      html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      // Update active button
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme);

// Глобальная инициализация после полной загрузки страницы
window.addEventListener('load', function() {
  console.log("Страница полностью загружена");
  
  // Инициализируем адаптивную разметку
  adaptLayout();
  adjustLayout();
  
  // Инициализируем тему
  initTheme();
  
  // Инициализируем обработчики прокрутки
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Последним шагом загружаем состояние таймера - после того как все элементы инициализированы
  console.log("Пытаемся загрузить состояние таймера...");
  setTimeout(loadTimerState, 300);
  
  // Отладка состояния таймера
  setInterval(() => {
    if (isSignalActive) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = signalEndTime - now;
      console.log(
        "Статус таймера:", 
        isSignalActive ? "активен" : "неактивен", 
        "Осталось:", remaining, 
        "секунд, Кнопка:", 
        document.getElementById("send")?.className || "не найдена"
      );
    }
  }, 10000); // Проверяем каждые 10 секунд
});

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM загружен, инициализируем UI");
  
  const sendButton = document.getElementById("send");
  
  sendButton.addEventListener("click", function() {
    if (isSignalActive) {
      // Вместо alert сделаем кнопку мигающей для индикации, что нужно подождать
      const button = this;
      button.classList.add("shaking");
      
      // Убираем анимацию через некоторое время
      setTimeout(() => {
        button.classList.remove("shaking");
      }, 500);
      return;
    }

    const button = this;
    button.disabled = true;
    button.textContent = "🔄 Анализ...";
    button.classList.add("analyzing");

    setTimeout(() => {
      generateSignal(button);
    }, 2000);
  });

  function generateSignal(button) {
    const timeSelect = document.getElementById("time");
    const duration = getDurationInSeconds(timeSelect.value);
    
    // Блокируем выпадающие списки
    disableSelects();
    
    // Фиксируем сигнал
    const isBuy = Math.random() > 0.5;
    const signalType = isBuy ? "ПОКУПКА" : "ПРОДАЖА";
    const accuracy = (80 + Math.random() * 15).toFixed(2);

    // Обновляем интерфейс
    updateSignalDisplay(signalType, accuracy, isBuy);

    // Запускаем таймер
    startCountdown(button, duration);

    // Сохраняем состояние таймера
    saveTimerState(signalType, accuracy, isBuy, duration);

    // Отправляем данные
    tg.sendData(JSON.stringify({
      instrument: document.getElementById("instrument").value,
      time: "1 минута", // Всегда отправляем "1 минута"
      signal: signalType,
      accuracy: `${accuracy}%`,
      duration: duration
    }));

    isSignalActive = true;
  }

  function getDurationInSeconds(timeStr) {
    // Всегда возвращаем 60 секунд (1 минута) независимо от выбранного значения
    return 60;
  }

  function updateSignalDisplay(signalType, accuracy, isBuy) {
    document.getElementById("instrumentDisplay").textContent = 
      document.getElementById("instrument").value;
    document.getElementById("signalType").textContent = signalType;
    document.getElementById("signalType").className = `signal-type ${isBuy ? 'buy' : 'sell'}`;
    document.getElementById("timeDisplay").textContent = "1 минута"; // Всегда показываем "1 минута"
    document.getElementById("accuracyDisplay").textContent = `${accuracy}%`;
    
    document.getElementById("loading").style.display = "none";
    document.getElementById("signalResult").style.display = "block";
  }

  function startCountdown(button, duration) {
    console.log("Запуск таймера на", duration, "секунд");
    
    // Очищаем предыдущий таймер, если он был
    if (currentTimer) {
      clearInterval(currentTimer);
    }

    // Устанавливаем визуальные стили
    button.classList.remove("analyzing");
    button.classList.add("disabled");
    button.disabled = false; // Нужно для работы CSS
    
    // Если это новый таймер (не восстановленный)
    if (!isSignalActive) {
      signalEndTime = Math.floor(Date.now() / 1000) + duration;
    }
    
    let remaining = duration;
    const originalDuration = 60; // Базовая длительность для нормализации прогресса
    
    // Устанавливаем начальное значение прогресс-бара
    const initialProgress = (remaining / originalDuration) * 100;
    button.style.setProperty('--progress', `${initialProgress}%`);
    
    // Форматируем текст кнопки
    const formatButtonText = (rem) => {
      const minutes = Math.floor(rem / 60);
      const seconds = rem % 60;
      return `🕒 ${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Устанавливаем начальный текст
    button.textContent = formatButtonText(remaining);
    
    // Отладочная информация
    console.log("Стартовое время:", formatButtonText(remaining), "Прогресс:", initialProgress.toFixed(2) + "%");
    
    // Запускаем интервал обновления
    currentTimer = setInterval(() => {
      remaining--;
      
      // Обновляем прогресс-бар
      const progress = (remaining / originalDuration) * 100;
      button.style.setProperty('--progress', `${progress}%`);
      
      // Обновляем текст кнопки
      button.textContent = formatButtonText(remaining);
      
      // По окончании времени
      if (remaining <= 0) {
        console.log("Таймер завершен");
        clearInterval(currentTimer);
        resetButton(button);
        // Очищаем состояние таймера
        clearTimerState();
      }
    }, 1000);
    
    // Устанавливаем флаг, что таймер активен
    isSignalActive = true;
  }

  function resetButton(button) {
    console.log("Сброс кнопки в исходное состояние");
    
    if (currentTimer) {
      clearInterval(currentTimer);
      currentTimer = null;
    }
    
    // Разблокируем выпадающие списки
    enableSelects();
    
    button.classList.remove("disabled");
    button.style.removeProperty('--progress');
    button.textContent = "ПОЛУЧИТЬ СИГНАЛ";
    isSignalActive = false;
  }
});

function adjustLayout() {
    const windowHeight = window.innerHeight;
    const appContainer = document.querySelector('.app-container');
    
    if (windowHeight < 700) {
      appContainer.style.padding = '10px 0';
    } else {
      appContainer.style.padding = '20px';
    }
  }
  
  // Вызываем при загрузке и изменении размера окна
  window.addEventListener('load', adjustLayout);
  window.addEventListener('resize', adjustLayout);

function adjustLayout() {
    const windowHeight = window.innerHeight;
    const content = document.querySelector('.content-wrapper');
    const bottomBar = document.querySelector('.bottom-bar');
    
    if (windowHeight < 650) {
      content.style.padding = '10px';
      content.style.justifyContent = 'flex-start';
    } else {
      content.style.padding = '20px';
      content.style.justifyContent = 'center';
    }
    
    // Всегда прижимаем полосу к низу
    bottomBar.style.bottom = '0';
  }

function adaptLayout() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Дополнительные адаптивные настройки при необходимости
    if (window.innerHeight < 500) {
      document.body.style.padding = '5px';
    } else {
      document.body.style.padding = '10px';
    }
  }

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Оптимизация для тач-устройств
if (isMobile) {
  document.body.classList.add('touch-device');
  
  // Увеличиваем время обработки тапов
  document.addEventListener('touchend', function(e) {
    if (e.target.id === 'send') {
      e.preventDefault();
      e.target.click();
    }
    
  }, { passive: false });

if (window.Telegram && Telegram.WebApp) {
    // Учет области уведомлений в мобильном Telegram
    const viewport = document.querySelector('meta[name=viewport]');
    const viewportContent = viewport.getAttribute('content');
    viewport.setAttribute('content', viewportContent + ', viewport-fit=cover');
    
    // Подстройка под интерфейс Telegram
    document.documentElement.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`);
  }

function displayInstrument(instrument) {
    const display = document.getElementById("instrumentDisplay");
    
    // Для инструментов с "/" (EUR/USD)
    if (instrument.includes('/')) {
      const [first, second] = instrument.split('/');
      display.innerHTML = `${first}<span class="slash">/</span>${second}`;
    } 
    // Для инструментов без "/" (BTC)
    else {
      display.textContent = instrument;
    }
    
  }
}

document.getElementById("instrumentDisplay").innerHTML = 
  instrument.split('/').join('<span>/</span>');
  

  // Инициализация
  window.addEventListener('load', adaptLayout);
  window.addEventListener('resize', adaptLayout);

// Функция для обработки прокрутки
function handleScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const timerContainer = document.querySelector('.timer-container');
    const bottomBar = document.querySelector('.bottom-bar');
    const botHeader = document.querySelector('.bot-header');

    // Определяем направление прокрутки
    const scrollingDown = currentScroll > lastScrollTop;
    const scrollingUp = currentScroll < lastScrollTop;
    
    // Проверяем, достаточно ли прокрутили для срабатывания анимации
    if (Math.abs(currentScroll - lastScrollTop) > scrollThreshold) {
        if (scrollingDown) {
            // Прокрутка вниз - скрываем полоску и заголовок
            timerContainer?.classList.add('hidden');
            bottomBar?.classList.add('hidden');
            botHeader?.classList.add('hidden');
        } else if (scrollingUp) {
            // Прокрутка вверх - показываем полоску и заголовок
            timerContainer?.classList.remove('hidden');
            bottomBar?.classList.remove('hidden');
            botHeader?.classList.remove('hidden');
        }
        
        lastScrollTop = currentScroll;
    }

    // Сбрасываем таймер при каждом событии прокрутки
    clearTimeout(scrollTimeout);
    
    // Устанавливаем таймер для сброса состояния прокрутки
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // Если прокрутка остановилась, показываем полоску и заголовок
        timerContainer?.classList.remove('hidden');
        bottomBar?.classList.remove('hidden');
        botHeader?.classList.remove('hidden');
    }, 300); // Задержка в миллисекундах
}

// Добавляем обработчик события прокрутки
window.addEventListener('scroll', handleScroll, { passive: true });

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const timerContainer = document.querySelector('.timer-container');
    const bottomBar = document.querySelector('.bottom-bar');
    const botHeader = document.querySelector('.bot-header');
    
    // Убедимся, что все элементы видны при загрузке
    timerContainer?.classList.remove('hidden');
    bottomBar?.classList.remove('hidden');
    botHeader?.classList.remove('hidden');
});
