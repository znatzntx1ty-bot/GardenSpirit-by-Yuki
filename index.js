const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("🌸 GardenSpirit by Yuki is running!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// สร้าง client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const fs = require("fs");
const path = require("path");

// โหลดคำสั่งทั้งหมด
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
      console.log(`🪄 โหลดคำสั่ง: ${command.data.name}`);
    } else {
      console.log(`⚠️ ข้ามไฟล์ ${filePath} (ไม่มี data หรือ execute)`);
    }
  }
}

// ✅ เมื่อบอทออนไลน์
client.once("ready", () => {
  console.log(`🌿 บอทออนไลน์แล้วในชื่อ ${client.user.tag}`);
});

// ✅ ตอบโต้กับ Slash Command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "❌ เกิดข้อผิดพลาดตอนรันคำสั่ง!", ephemeral: true });
  }
});

// เข้าสู่ระบบ Discord
client.login(process.env.TOKEN);
