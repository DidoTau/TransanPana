import Telebot from "telebot";

import fetch from "node-fetch";

const bot = new Telebot("5819225779:AAHc88mQ6HZMu10hnokIHdsqVbtD-tztAAg");

bot.on(/\/start (.+)/, (msg, match) => {
  console.log(match);
  fetch(`https://api.xor.cl/red/bus-stop/${match.match[1]}`)
    .then((response) => response.json())
    .then((data) => {
      // filter services with valid=true
      const validServices = data.services.filter((element) => element.valid);

      let servicesText = validServices.map((element) => {
        let buses = element.buses.map((bus) => {
          return `${bus.meters_distance} Metros. Entre ${bus.min_arrival_time} y ${bus.max_arrival_time}  minutos \n`;
        });
        return `Servicio ${element.id}: 

        ${buses}`;
      });
      // construir un string con los servicios y sus atributos
      validServices.forEach((element) => {});
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
