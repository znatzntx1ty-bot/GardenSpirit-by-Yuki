// 🌸 GardenSpirit by Yuki — Main Bot File

const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN) {
  console.error("❌ ERROR: Discord Bot Token is missing! Add TOKEN in Render Environment Variables.");
  process.exit(1);
}

// 🌐 สร้างเว็บเซิร์ฟเวอร์ให้ Render ตรวจ uptime
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌼 GardenSpirit by Yuki is running 24/7!"));
app.listen(PORT, () => console.log(`✅ Server is live on port ${PORT}`));

// 🤖 ตั้งค่า Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 📦 โหลดคำสั่งทั้งหมดจาก /commands
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.data.name, command);
  }
}

// 🎯 โหลด event ทั้งหมดจาก /events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const eventFile = require(path.join(eventsPath, file));
  if (typeof eventFile === "function") eventFile(client);
}

// 🚀 Login เข้าบอท
client.login(TOKEN)
  .then(() => console.log("🌸 Logged in as GardenSpirit by Yuki"))
  .catch(err => console.error("❌ Login failed:", err));
