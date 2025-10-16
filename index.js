// 🌸 GardenSpirit Bot - Always Online + Auto Clean + Webhook Notification
const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // ✅ สำหรับส่ง webhook
const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Webhook URL ที่จะใช้แจ้งเตือน (เอามาจาก Discord)
const WEBHOOK_URL = "https://discord.com/api/webhooks/1428472728490606633/yeQhav-QsyFgqDcp0jC445L7FzVSdD-c7B1Q9hn0skVJWqOYmpEzp_2pj2iLECz5848p"; // 🔁 ใส่ของพี่แทนตรงนี้

// ฟังก์ชันส่งแจ้งเตือนผ่าน webhook
async function sendWebhookNotification(title, description, color = 0x2ecc71) {
  try {
    const payload = {
      embeds: [
        {
          title: title,
          description: description,
          color: color,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("❌ ไม่สามารถส่ง webhook ได้:", err);
  }
}

// ✅ หน้าเว็บหลัก (ให้ UptimeRobot ping)
app.get("/", (req, res) => {
  res.send("🌸 GardenSpirit is running 24/7!");
});

// ✅ หน้าเว็บล้าง cache
app.get("/clean", async (req, res) => {
  try {
    const tempDir = "/tmp";
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
    }
    console.clear();
    console.log("🧹 Cache cleared successfully!");

    await sendWebhookNotification(
      "🧹 Cache Cleared",
      `ระบบได้ล้าง cache สำเร็จเมื่อ <t:${Math.floor(Date.now() / 1000)}:R>`
    );

    res.send("🧹 Cache cleared successfully!");
  } catch (err) {
    console.error("❌ Error clearing cache:", err);
    res.status(500).send("Error clearing cache.");
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🧧 ตั้งค่า Discord Client
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

// 📦 โหลดคำสั่ง (ถ้ามีโฟลเดอร์ /commands)
const fsCommands = fs.readdirSync("./commands", { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const folder of fsCommands) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// 🎮 เมื่อบอทพร้อม
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: "online",
    activities: [{ name: "👀 Watching over Garden", type: 0 }],
  });

  await sendWebhookNotification(
    "✅ Bot Online",
    `บอท **${client.user.username}** ออนไลน์แล้วเมื่อ <t:${Math.floor(Date.now() / 1000)}:R>`,
    0x00ff99
  );
});

// 📦 ตอบคำสั่ง Slash
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await sendWebhookNotification("❌ Error", error.message, 0xff0000);
    await interaction.reply({ content: "เกิดข้อผิดพลาด!", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
