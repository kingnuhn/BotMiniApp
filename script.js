let tg = window.Telegram.WebApp;
tg.expand();

document.getElementById("send").addEventListener("click", function() {
  const btn = this;
  btn.disabled = true;
  btn.textContent = "Анализируем...";

  // Показать анимацию загрузки
  document.getElementById("loading").style.display = "block";
  document.getElementById("signalResult").style.display = "none";

  // Генерация сигнала через 5 секунд
  setTimeout(() => {
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
      instrument,
      time,
      signal: signalType,
      accuracy: `${accuracy}%`
    };
    tg.sendData(JSON.stringify(data));

    // Восстановить кнопку
    btn.disabled = false;
    btn.textContent = "ПОЛУЧИТЬ СИГНАЛ";
  }, 5000);
});