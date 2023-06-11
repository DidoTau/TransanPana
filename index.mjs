import Telebot from "telebot";

import "dotenv/config";
import fetch from "node-fetch";
import mongoose from "mongoose";
import { parse } from "dotenv";
const telegramToken = process.env.TELEGRAM_TOKEN;

const bot = new Telebot({
  token: telegramToken,
  usePlugins: ["commandButton"],
});

// CONECTING TO BBDD IN MONGO USING MONGOOSE

await mongoose.connect("mongodb://127.0.0.1:27017/API");
console.log("Database ONLINE");

// SCHEMA FOR FAVORITES
const favoritesScheme = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: false },
  stopId: { type: String, required: true },
});
const Favorites = mongoose.model("favorites", favoritesScheme);

// BOT COMMANDS
bot.on(/\/ask (.+)/, (msg, match) => {
  fetch(`https://api.xor.cl/red/bus-stop/${match.match[1]}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(msg);
      // filter services with valid=true
      const validServices = data.services.filter((element) => element.valid);

      let servicesText = validServices
        .map((element) => {
          let buses = element.buses
            .map((bus) => {
              return `
            - A ${bus.meters_distance} mts de distancia. 
               Llega entre ${bus.min_arrival_time} y ${bus.max_arrival_time} minutos 
               `;
            })
            .join("");
          return ` Servicio ${element.id}: <pre> ${buses} </pre>`;
        })
        .join("");

      bot
        .sendMessage(
          msg.from.id,
          ` 
          <b> Hola ${msg.from.first_name}! </b>
        Este es el resumen de los recorridos en ${data.name}:
        ${servicesText} 
        `,
          { parseMode: "html", replyToMessage: msg.message_id }
        )
        .then(() => {
          console.log("Mensaje enviado");
        })
        .catch((error) => {
          // Manejo de errores
          console.error("Error:", error);
        });

      const query = {
        user: msg.from.id,
        name: data.name,
        stopId: data.id,
      };

      Favorites.findOneAndUpdate(
        query,
        {
          $setOnInsert: query,
        },
        { new: true, upsert: true }
      )
        .then((result) => {
          // El documento se actualizó o se creó uno nuevo
          console.log("Documento guardado:", result);
        })
        .catch((error) => {
          // Manejo de errores
          console.error("Error al guardar el documento:", error);
        });
    })
    .catch((error) => {
      // Manejo de errores
      console.error("Error:", error);
    });
});

bot.on("/favs", (msg) => {
  Favorites.find({ user: msg.chat.id })
    .then((data) => {
      let favoritesText = data.map((element) => {
        return [
          bot.inlineButton(element.name, {
            callback: `/ask ${element.stopId}`,
          }),
        ];
      });
      const replyMarkup = bot.inlineKeyboard(favoritesText);
      bot.sendMessage(msg.from.id, "Selecciona una parada", { replyMarkup });
    })
    .catch((error) => {
      // Manejo de errores
      console.error("Error:", error);
    });
});

bot.on("/help", (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `<b> Hola amig@ ${msg.chat.first_name}! </b>
    Estos son los comandos disponibles:
    <pre> /ask [código de parada] </pre>
    <pre> /favs </pre>
    <pre> /help </pre>
    `,
    { parseMode: "html", replyToMessage: msg.message_id }
  );
});

bot.start();
