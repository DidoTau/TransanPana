import Telebot from "telebot";
import "dotenv/config";
import fetch from "node-fetch";

const telegramToken = process.env.TELEGRAM_TOKEN;

const bot = new Telebot(telegramToken);

bot.on(/\/start (.+)/, (msg, match) => {
  console.log(match);
  fetch(`https://api.xor.cl/red/bus-stop/${match.match[1]}`)
    .then((response) => response.json())
    .then((data) => {
      // filter services with valid=true
      const validServices = data.services.filter((element) => element.valid);

      let servicesText = validServices
        .map((element) => {
          let buses = element.buses
            .map((bus) => {
              return `A ${bus.meters_distance} mts de distancia.\n 
                    Llega entre ${bus.min_arrival_time} y ${bus.max_arrival_time} minutos \n`;
            })
            .join("");
          return `Servicio ${element.id}: 

        ${buses} \n`;
        })
        .join("");

      console.log(servicesText);
      bot.sendMessage(
        msg.chat.id,
        `Hola ${msg.chat.first_name}!\n
        Este es el resumen de los recorridos para ${data.name}:\n
        ${servicesText}
        `
      );
    })
    .catch((error) => {
      // Manejo de errores
      console.error("Error:", error);
    });
});

bot.start();
