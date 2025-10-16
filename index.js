// 🌸 GardenSpirit by Yuki
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.get("/", (req, res) => res.send("🌼 GardenSpirit by Yuki is running!"));
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));

// 🌷 สร้าง client Discord
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

// 🌿 โหลดคำสั่งทั้งหมดจาก /commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// 🌻 โหลด events ทั้งหมดจาก /events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const event = require(path.join(eventsPath, file));
  if (event.name && typeof event.execute === "function") {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// 🍀 ฟัง Slash Commands ที่ถูกเรียก
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
    console.error("⚠️ Error executing command:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "เกิดข้อผิดพลาดตอนรันคำสั่งนี้ 💥", ephemeral: true });
    } else {
      await interaction.reply({ content: "เกิดข้อผิดพลาดตอนรันคำสั่งนี้ 💥", ephemeral: true });
    }
  }
});

// 🪴 เข้าสู่ระบบบอท
client.login(TOKEN)
  .then(() => console.log("🌸 Logged in as GardenSpirit by Yuki"))
  .catch(err => console.error("❌ Login failed:", err));
