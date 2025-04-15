let tg;
try {
  tg = window.Telegram.WebApp;
  tg.expand();
} catch (e) {
  console.error("Telegram WebApp не доступен:", e);
  // Заглушка для тестирования вне Telegram
  tg = { 
    sendData: function(data) {
      console.log("Данные для отправки:", data);
    },
    close: function() {}
  };
}

// Ожидание полной загрузки DOM
document.addEventListener("DOMContentLoaded", function() {
  const sendButton = document.getElementById("send");
  
  if (!sendButton) {
    console.error("Кнопка не найдена!");
    return;
  }

  sendButton.addEventListener("click", function() {
    const button = this;
    button.disabled = true;
    button.textContent = "Анализируем...";

    // Показать анимацию загрузки
    document.getElementById("loading").style.display = "block";
    document.getElementById("signalResult").style.display = "none";

    // Генерация сигнала через 5 секунд
    setTimeout(() => {
      try {
        const instrument = document.getElementById("instrument").value;
        const time = document.getElementById("time").value;
        
        // Генерация случайного сигнала
        const isBuy = Math.random() > 0.5;
        const signalType = isBuy ? "ПОКУПКА" : "ПРОДАЖА";
        const accuracy = (80 + Math.random() * 15).toFixed(2);

        // Обновление интерфейса
        document.getElementById("instrumentDisplay").textContent = instrument;
        document.getElementById("signalType").textContent = signalType;
        document.getElementById("signalType").className = `signal-type ${isBuy ? 'buy' : 'sell'}`;
        document.getElementById("timeDisplay").textContent = time;
        document.getElementById("accuracyDisplay").textContent = `${accuracy}%`;

        // Скрыть загрузку и показать результат
        document.getElementById("loading").style.display = "none";
        document.getElementById("signalResult").style.display = "block";

        // Отправка данных в Telegram
        const data = {
          instrument: instrument,
          time: time,
          signal: signalType,
          accuracy: `${accuracy}%`
        };
        tg.sendData(JSON.stringify(data));

      } catch (error) {
        console.error("Ошибка при обработке:", error);
      } finally {
        button.disabled = false;
        button.textContent = "ПОЛУЧИТЬ СИГНАЛ";
      }
    }, 5000);
  });
});
