const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🌸 GardenSpirit is running!");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Map();

// โหลดคำสั่งทั้งหมดจากโฟลเดอร์ commands
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// Event: เมื่อบอทออนไลน์
client.once("ready", async () => {
  console.log(`🌷 Logged in as ${client.user.tag}`);

  // โหลด config.json เพื่อตรวจว่ามีห้อง log มั้ย
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  } catch {
    config = {};
  }

  const logChannelId = config.logChannelId;
  if (logChannelId) {
    try {
      const logChannel = await client.channels.fetch(logChannelId);
      if (logChannel) {
        const time = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
        logChannel.send(`✅ บอทกลับมาออนไลน์แล้ว! (${time})`);
      }
    } catch (err) {
      console.error("ไม่สามารถส่ง log ได้:", err);
    }
  }
});

// Event: เมื่อใช้คำสั่ง
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "⚠️ เกิดข้อผิดพลาดในการทำงานของคำสั่งนี้",
      ephemeral: true,
    });
  }
});

client.login(process.env.TOKEN);
