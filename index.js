// 🌸 GardenSpirit by Yuki - Stable Admin Version
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ หน้าเว็บสำหรับ uptime
app.get("/", (req, res) => {
  res.send("🌷 GardenSpirit by Yuki is alive and running!");
});

app.listen(PORT, () => console.log(`✅ Server online on port ${PORT}`));

// ✅ สร้าง client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// ✅ โหลดคำสั่งทั้งหมดจากโฟลเดอร์ /commands
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  const folderNames = fs.readdirSync(commandsPath);
  for (const folder of folderNames) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else if ("name" in command && "execute" in command) {
        client.commands.set(command.name, command);
        console.log(`✅ Loaded legacy command: ${command.name}`);
      } else {
        console.warn(`⚠️ Skipping invalid command file: ${file}`);
      }
    }
  }
} else {
  console.log("⚠️ No commands folder found, skipping command loading.");
}

// ✅ โหลด events (ไม่พังถ้าไม่มีโฟลเดอร์)
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
} else {
  console.log("⚠️ No events folder found, skipping event loading.");
}

// ✅ รับคำสั่งจาก Discord
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command =
    client.commands.get(interaction.commandName) ||
    client.commands.find(
      (cmd) => cmd.data?.name === interaction.commandName
    );

  if (!command) {
    console.error(`❌ Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`💥 Error executing ${interaction.commandName}:`, error);
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

// ✅ เมื่อบอทออนไลน์
client.once("ready", () => {
  console.log(`🌼 Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
