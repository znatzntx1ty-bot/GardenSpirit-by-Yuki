// 🌸 GardenSpirit Bot - Always Online + Auto Clean Version
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ หน้าเว็บหลัก (ไว้ให้ UptimeRobot ping)
app.get("/", (req, res) => {
  res.send("🌸 GardenSpirit Bot is running 24/7!");
});

// ✅ หน้าเว็บสำหรับล้าง cache อัตโนมัติ
app.get("/clean", (req, res) => {
  try {
    const tempDir = "/tmp";
    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
    }

    console.clear();
    console.log("🧹 Cache cleared successfully!");
    res.send("🧹 Cache cleared successfully!");
  } catch (err) {
    console.error("❌ Error clearing cache:", err);
    res.status(500).send("Error clearing cache.");
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🧧 ตั้งค่า Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 🩵 โหลดคำสั่ง (ถ้ามีโฟลเดอร์ /commands)
const fsCommands = fs.readdirSync("./commands", { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const folder of fsCommands) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// 🎮 เมื่อบอทพร้อม
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: "online",
    activities: [{ name: "👀 Watching over Garden", type: 0 }]
  });
});

// 📦 ตอบสนองคำสั่ง
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "เกิดข้อผิดพลาด!", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
