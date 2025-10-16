// 🌸 GardenSpirit-by-Yuki - Stable Render Version

const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// 🩷 หน้าเว็บสำหรับ uptime render
app.get("/", (req, res) => {
  res.send("🌸 GardenSpirit Bot is running 24/7!");
});
app.listen(PORT, () => console.log(`✅ Server is live on port ${PORT}`));

// 🧠 สร้าง client Discord
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

// 🎀 โหลด event ทั้งหมดจาก /events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const eventFile = require(path.join(eventsPath, file));
  if (typeof eventFile === "function") eventFile(client);
}

// 🚀 ล็อกอินเข้า Discord ด้วย TOKEN จาก Render Environment
client.login(process.env.TOKEN)
  .then(() => console.log("🌸 Logged in as GardenSpirit by Yuki"))
  .catch(err => console.error("❌ Login failed:", err));
