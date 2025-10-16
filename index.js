// GardenSpirit Admin Bot - index.js
const express = require("express");
const fs = require("fs");
const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บ uptime
app.get("/", (req, res) => res.send("🌸 GardenSpirit Admin Bot is running!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🧧 ตั้งค่า client
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

// 📂 โหลดคำสั่งทั้งหมด
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// 🎯 โหลด config.json (ใช้เก็บ logChannelId)
let config = {};
try {
  config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
} catch {
  config = {};
}

// 🪄 ฟังก์ชันส่ง log
async function sendLog(client, content) {
  if (!config.logChannelId) return;
  const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setDescription(content)
    .setTimestamp();
  await channel.send({ embeds: [embed] }).catch(() => {});
}

// 🌸 เมื่อบอทพร้อมใช้งาน
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  sendLog(client, `🟢 บอท ${client.user.username} ออนไลน์แล้ว!`);
});

// 🎮 เมื่อมี interaction (slash command)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
    // ✅ log ทุกครั้งที่ใช้คำสั่ง
    sendLog(client, `⚙️ **${interaction.user.tag}** ใช้คำสั่ง: \`/${interaction.commandName}\``);
  } catch (error) {
    console.error(error);
    sendLog(client, `❌ มี error ระหว่างรันคำสั่ง \`/${interaction.commandName}\`: \n\`\`\`${error.message}\`\`\``);
    await interaction.reply({ content: "เกิดข้อผิดพลาด!", ephemeral: true });
  }
});

// 🚨 จับ error เฉย ๆ เผื่อ log
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  sendLog(client, `🚨 Unhandled Error: \`${error.message}\``);
});

client.login(process.env.TOKEN);
