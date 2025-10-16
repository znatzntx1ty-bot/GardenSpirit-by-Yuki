// 🌸 GardenSpirit by Yuki — Admin & Utility Core

const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บ uptime
app.get("/", (req, res) => {
  res.send("🌸 GardenSpirit by Yuki is running smoothly!");
});
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🎋 ตั้งค่า Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 🧩 โหลดคำสั่งทั้งหมดในโฟลเดอร์ /commands
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
    } else {
      console.warn(`⚠️ คำสั่ง ${filePath} ไม่มี data หรือ execute`);
    }
  }
}

// 🎯 Event: เมื่อบอทออนไลน์
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const logChannel =
    client.channels.cache.find(ch => ch.name === "🌸｜bot-logs") ||
    client.channels.cache.find(ch => ch.name === "bot-logs");

  if (logChannel) {
    const now = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
    await logChannel.send(`✅ **บอทกลับมาออนไลน์แล้ว!** (${now})`);
  }
});

// ⚙️ Event: เมื่อมี Interaction
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing command: ${interaction.commandName}`, error);

    const logChannel =
      interaction.guild.channels.cache.find(ch => ch.name === "🌸｜bot-logs") ||
      interaction.guild.channels.cache.find(ch => ch.name === "bot-logs");

    if (logChannel) {
      await logChannel.send(
        `⚠️ **เกิดข้อผิดพลาดในคำสั่ง:** \`${interaction.commandName}\`\n\`\`\`${error.message}\`\`\``
      );
    }

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "⚠️ เกิดข้อผิดพลาดในการทำงานของคำสั่งนี้",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "⚠️ เกิดข้อผิดพลาดในการทำงานของคำสั่งนี้",
        ephemeral: true,
      });
    }
  }
});

// 🔌 Login
client.login(process.env.TOKEN || "YOUR_RENDER_ENV_TOKEN_HERE");
