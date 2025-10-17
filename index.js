// 🌸 GardenSpirit-by-Yuki (Stable + Command Loader + Auto Uptime)
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌿 หน้าเว็บเช็กสถานะ
app.get("/", (req, res) => res.send("🌿 GardenSpirit is alive!"));
app.get("/status", (req, res) => res.status(200).send("✅ Status OK"));
app.get("/clearlog", (req, res) => { console.clear(); res.send("🧹 Logs cleared"); });

// 🌸 เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🌼 ตั้งค่า Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 🌸 โหลดคำสั่งทั้งหมดจาก /commands
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`🧩 Loaded command: ${command.data.name}`);
    }
  }
}

// 🌸 โหลด events (ถ้ามี)
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 🌸 ตอบสนองคำสั่ง Slash
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "⚠️ คำสั่งมีปัญหาครับ", ephemeral: true });
  }
});

// 🌿 แจ้งเตือนสถานะ
client.once("ready", () => {
  console.log(`🌸 Logged in as ${client.user.tag}`);
  sendWebhook("✅ บอทกลับมาออนไลน์แล้ว 🌿");
});

// 🌿 ระบบแจ้งเตือน Error
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled:", error);
  sendWebhook(`⚠️ บอทมีปัญหา:\n\`\`\`${error.message}\`\`\``);
});
process.on("uncaughtException", (error) => {
  console.error("❌ Crash:", error);
  sendWebhook(`🚨 บอทล่ม:\n\`\`\`${error.message}\`\`\``);
});

// 🌿 ระบบกัน Render หลับ (Ping ตัวเองทุก 4 นาที)
setInterval(() => {
  fetch("https://gardenspirit-by-yuki.onrender.com").catch(() => {});
}, 240000);

// 🌿 ฟังก์ชันส่งแจ้งเตือนเข้า Discord
function sendWebhook(message) {
  if (!process.env.WEBHOOK_URL) return;
  fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  }).catch(() => {});
}

// 🌸 เริ่มรันบอท
client.login(process.env.TOKEN);
