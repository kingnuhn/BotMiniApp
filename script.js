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

let lastScrollTop = 0;
const scrollThreshold = 50; // Минимальное расстояние прокрутки для срабатывания анимации
let isScrolling = false;
let scrollTimeout;

document.addEventListener("DOMContentLoaded", function() {
  const sendButton = document.getElementById("send");
  
  sendButton.addEventListener("click", function() {
    if (isSignalActive) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = signalEndTime - now;
      alert(`Подождите ещё ${remaining} секунд для нового сигнала`);
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
    
    // Фиксируем сигнал
    const isBuy = Math.random() > 0.5;
    const signalType = isBuy ? "ПОКУПКА" : "ПРОДАЖА";
    const accuracy = (80 + Math.random() * 15).toFixed(2);

    // Обновляем интерфейс
    updateSignalDisplay(signalType, accuracy, isBuy);

    // Запускаем таймер
    startCountdown(button, duration);

    // Отправляем данные
    tg.sendData(JSON.stringify({
      instrument: document.getElementById("instrument").value,
      time: timeSelect.value,
      signal: signalType,
      accuracy: `${accuracy}%`,
      duration: duration
    }));

    isSignalActive = true;
  }

  function getDurationInSeconds(timeStr) {
    const times = {
      "1 минута": 60,
      "5 минут": 300,
      "15 минут": 900
    };
    return times[timeStr] || 60;
  }

  function updateSignalDisplay(signalType, accuracy, isBuy) {
    document.getElementById("instrumentDisplay").textContent = 
      document.getElementById("instrument").value;
    document.getElementById("signalType").textContent = signalType;
    document.getElementById("signalType").className = `signal-type ${isBuy ? 'buy' : 'sell'}`;
    document.getElementById("timeDisplay").textContent = 
      document.getElementById("time").value;
    document.getElementById("accuracyDisplay").textContent = `${accuracy}%`;
    
    document.getElementById("loading").style.display = "none";
    document.getElementById("signalResult").style.display = "block";
  }

  function startCountdown(button, duration) {
    button.classList.remove("analyzing");
    button.disabled = false;
    button.classList.add("disabled");
    
    signalEndTime = Math.floor(Date.now() / 1000) + duration;
    let remaining = duration;
    
    // Устанавливаем прогресс-бар
    button.style.setProperty('--progress', '100%');
    
    // Обновляем каждую секунду
    currentTimer = setInterval(() => {
      remaining--;
      
      // Обновляем прогресс-бар
      const progress = (remaining / duration) * 100;
      button.style.setProperty('--progress', `${progress}%`);
      
      // Обновляем текст кнопки
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      button.textContent = `🕒 ${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // По окончании времени
      if (remaining <= 0) {
        clearInterval(currentTimer);
        resetButton(button);
      }
    }, 1000);
  }

  function resetButton(button) {
    clearInterval(currentTimer);
    button.classList.remove("disabled");
    button.style.removeProperty('--progress');
    button.textContent = "ПОЛУЧИТЬ СИГНАЛ";
    isSignalActive = false;
    currentTimer = null;
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

    // Определяем направление прокрутки
    const scrollingDown = currentScroll > lastScrollTop;
    const scrollingUp = currentScroll < lastScrollTop;
    
    // Проверяем, достаточно ли прокрутили для срабатывания анимации
    if (Math.abs(currentScroll - lastScrollTop) > scrollThreshold) {
        if (scrollingDown) {
            // Прокрутка вниз - скрываем полоску
            timerContainer?.classList.add('hidden');
            bottomBar?.classList.add('hidden');
        } else if (scrollingUp) {
            // Прокрутка вверх - показываем полоску
            timerContainer?.classList.remove('hidden');
            bottomBar?.classList.remove('hidden');
        }
        
        lastScrollTop = currentScroll;
    }

    // Сбрасываем таймер при каждом событии прокрутки
    clearTimeout(scrollTimeout);
    
    // Устанавливаем таймер для сброса состояния прокрутки
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // Если прокрутка остановилась, показываем полоску
        timerContainer?.classList.remove('hidden');
        bottomBar?.classList.remove('hidden');
    }, 300); // Задержка в миллисекундах
}

// Добавляем обработчик события прокрутки
window.addEventListener('scroll', handleScroll, { passive: true });

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const timerContainer = document.querySelector('.timer-container');
    const bottomBar = document.querySelector('.bottom-bar');
    
    // Убедимся, что полоски видны при загрузке
    timerContainer?.classList.remove('hidden');
    bottomBar?.classList.remove('hidden');
});
