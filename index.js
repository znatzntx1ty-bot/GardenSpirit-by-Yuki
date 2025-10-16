// 🌸 GardenSpirit by Yuki - Main Bot File

const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 🔧 โหลด config (ใช้ตอน deploy commands)
const config = require("./config.json");

// 🌐 สร้างเว็บเซิร์ฟสำหรับ uptime (Render)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌷 GardenSpirit by Yuki is running 24/7!"));
app.listen(PORT, () => console.log(`✅ Server is live on port ${PORT}`));

// 🎮 ตั้งค่า Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 📘 โหลดคำสั่งทั้งหมดจากโฟลเดอร์ /commands
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`📗 Loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Command ${file} is missing data or execute.`);
    }
  }
}

// 🎧 โหลด events ทั้งหมดจากโฟลเดอร์ /events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`🎀 Loaded event: ${event.name}`);
}

// 🚀 Event: บอทออนไลน์
client.once(Events.ClientReady, (c) => {
  console.log(`🌼 Logged in as ${c.user.tag}!`);
});

// ⚙️ Event: ตรวจจับคำสั่ง Slash Command
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "❌ เกิดข้อผิดพลาดในการรันคำสั่งนี้", ephemeral: true });
  }
});

// 🪴 Login เข้าบอท
client.login(process.env.TOKEN);
