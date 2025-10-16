// 🌸 GardenSpirit by Yuki — Clean Admin-Ready Version

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

// 🌐 Express web server (for uptime on Render)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌸 GardenSpirit by Yuki is running 24/7!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🤖 สร้าง client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

// 🧠 เก็บ Slash Commands
client.commands = new Collection();

// 📂 โหลดคำสั่งจาก /commands
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Skipped invalid command file: ${file}`);
    }
  }
}

// 📂 โหลด events จาก /events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`🎯 Loaded event: ${event.name}`);
}

// 🎮 จัดการ Slash Command interaction
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`❌ Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`💥 Error executing command ${interaction.commandName}:`, error);
    const replyMsg = { content: "⚠️ เกิดข้อผิดพลาดในการประมวลผลคำสั่งนี้", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyMsg);
    } else {
      await interaction.reply(replyMsg);
    }
  }
});

// 🚀 เข้าสู่ระบบ
client
  .login(process.env.TOKEN)
  .then(() => console.log(`🌷 Logged in as GardenSpirit by Yuki`))
  .catch(err => console.error("❌ Login failed:", err));
