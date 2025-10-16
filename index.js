const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌸 GardenSpirit by Yuki is running 24/7!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

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
    } else {
      console.warn(`⚠️ คำสั่ง ${file} ไม่มี data หรือ execute`);
    }
  }
}

client.on("ready", () => {
  console.log(`🌼 Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return interaction.reply({ content: "❌ ไม่พบคำสั่งนี้!", ephemeral: true });

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "⚠️ เกิดข้อผิดพลาด!", ephemeral: true });
    } else {
      await interaction.reply({ content: "⚠️ เกิดข้อผิดพลาด!", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
