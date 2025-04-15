let tg = window.Telegram.WebApp;

document.getElementById("send").addEventListener("click", () => {
  const instrument = document.getElementById("instrument").value;
  const time = document.getElementById("time").value;
  const language = document.getElementById("language").value;

  const data = {
    instrument,
    time,
    language
  };

  // Отправляем данные боту
  tg.sendData(JSON.stringify(data));
  tg.close(); // Закрывает Mini App
});