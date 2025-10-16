// 🌸 GardenSpirit by Yuki - Stable Render Version
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

// สร้าง express server สำหรับ uptime
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌿 GardenSpirit by Yuki is alive!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// สร้าง client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel],
});

client.commands = new Collection();

// โหลดคำสั่งทั้งหมดจาก /commands
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`📦 Loaded command: ${command.data.name}`);
    }
  }
}

// โหลด events ทั้งหมดจาก /events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const event = require(path.join(eventsPath, file));
  if (event.name && typeof event.execute === "function") {
    client.on(event.name, (...args) => event.execute(...args, client));
    console.log(`🎀 Loaded event: ${event.name}`);
  }
}

// Interaction Handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "⚠️ มีข้อผิดพลาดเกิดขึ้น", ephemeral: true });
  }
});

// Login
client.login(config.token).then(() => {
  console.log(`🌼 Logged in as ${client.user.tag}`);
});
