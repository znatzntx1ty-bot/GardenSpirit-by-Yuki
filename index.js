const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บ uptime สำหรับ Render
app.get("/", (req, res) => {
  res.send("🌷 GardenSpirit is alive and running!");
});
app.listen(PORT, () => console.log(`✅ Web server started on port ${PORT}`));

// 🧠 สร้าง client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 📂 โหลดคำสั่งจากโฟลเดอร์ commands
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// 🎮 เมื่อบอทพร้อมใช้งาน
client.once("ready", () => {
  console.log(`🌸 Logged in as ${client.user.tag}`);
});

// ⚙️ ระบบ slash command
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "⚠️ มีบางอย่างผิดพลาด!", ephemeral: true });
  }
});

// 🌷 โหลดระบบต้อนรับ & ลา
require("./events/welcomeGoodbye")(client);

// 🔑 Login บอท
client.login(process.env.TOKEN);
