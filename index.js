// 🌸 GardenSpirit-by-Yuki Discord Bot
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ✅ สร้าง Express server สำหรับ uptime
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌷 GardenSpirit is alive!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ✅ สร้าง client Discord
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

// 🧩 โหลด Slash Commands อัตโนมัติ
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
      console.log(`⚠️ คำสั่ง ${filePath} ไม่มี data หรือ execute`);
    }
  }
}

// ⚙️ โหลด Events อัตโนมัติ
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 🔹 Event: บอทพร้อมใช้งาน
client.once("ready", () => {
  console.log(`🌸 GardenSpirit พร้อมให้บริการแล้วในชื่อ ${client.user.tag}!`);
});

// 🔹 Event: จัดการ Slash Command
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`❌ ไม่พบคำสั่ง ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "⚠️ เกิดข้อผิดพลาดระหว่างรันคำสั่งนี้!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "⚠️ เกิดข้อผิดพลาดระหว่างรันคำสั่งนี้!",
        ephemeral: true,
      });
    }
  }
});

// 🔹 โหลดระบบ Reaction Exclusive Role
require("./events/reactionExclusiveRole");
require("./events/reactionExclusiveRemove");

// ✅ เข้าสู่ระบบบอท
client.login(process.env.TOKEN);
