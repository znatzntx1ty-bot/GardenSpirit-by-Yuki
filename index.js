// 🌸 GardenSpirit by Yuki - Main Bot File
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// โหลด config
const config = require("./config.json");

// 🌐 Render uptime server
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌿 GardenSpirit by Yuki is running 24/7!"));
app.listen(PORT, () =>
  console.log(`✅ Server is live on port ${PORT}`)
);

// 🧩 ตั้งค่า Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 📘 โหลดคำสั่งจากโฟลเดอร์ /commands
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.data.name, command);
  }
}

// 📗 โหลด events ทั้งหมดจากโฟลเดอร์ /events
const eventsPath = path.join(__dirname, "events");
for (const file of fs
  .readdirSync(eventsPath)
  .filter((f) => f.endsWith(".js"))) {
  const eventFile = require(path.join(eventsPath, file));
  if (typeof eventFile === "function") eventFile(client);
}

// 📢 เมื่อบอทพร้อมใช้งาน
client.once(Events.ClientReady, (readyClient) => {
  console.log(`🌼 Logged in as ${readyClient.user.tag}!`);
});

// 🧠 ตอบคำสั่ง / (Slash Commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "⚠️ มีบางอย่างผิดพลาดระหว่างรันคำสั่งนี้!",
      ephemeral: true,
    });
  }
});

// 🔐 เข้าสู่ระบบ Discord
client.login(process.env.TOKEN);
