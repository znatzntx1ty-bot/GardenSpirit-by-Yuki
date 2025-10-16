// 🌸 GardenSpirit by Yuki — Stable Render + BetterStack Version
// ✅ รองรับระบบ uptime, /status, /clearlog, และโหลด slash commands อัตโนมัติ

const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บหลัก สำหรับ uptime
app.get("/", (req, res) => {
  res.send("🌷 GardenSpirit by Yuki is running 24/7 — Powered by Render & BetterStack!");
});

// ✅ Route สำหรับ BetterStack ตรวจสุขภาพ
app.get("/status", (req, res) => {
  res.status(200).send("✅ GardenSpirit bot is alive and running smoothly!");
});

// 🧹 Route สำหรับล้าง log (optional)
app.get("/clearlog", (req, res) => {
  console.clear();
  res.send("🧹 Logs cleared successfully!");
});

// 🚀 เริ่มต้นเซิร์ฟเวอร์ Express
app.listen(PORT, () => {
  console.log(`✅ Web server is running on port ${PORT}`);
});

// 🌿 ตั้งค่า Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 📦 โหลดคำสั่งทั้งหมดจากโฟลเดอร์ /commands
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ โหลดคำสั่ง: ${command.data.name}`);
    } else {
      console.warn(`⚠️ ข้ามไฟล์ ${filePath} (ไม่มี data หรือ execute)`);
    }
  }
}

// 🧠 เมื่อบอทออนไลน์
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ⚡ ระบบรับ Slash Commands
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในคำสั่ง ${interaction.commandName}:`, error);
    await interaction.reply({
      content: "⚠️ มีบางอย่างผิดพลาดขณะรันคำสั่งนี้!",
      ephemeral: true,
    });
  }
});

// 🪄 ล็อกอินบอทด้วย TOKEN จาก .env
client.login(process.env.TOKEN);
