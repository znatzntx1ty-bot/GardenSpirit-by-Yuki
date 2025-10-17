const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บสำหรับ uptime
app.get("/", (req, res) => {
  res.send("🌷 GardenSpirit is blooming and alive!");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🧠 Discord Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// 📂 โหลดคำสั่งทั้งหมด
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ คำสั่ง ${file} ไม่มี data หรือ execute`);
  }
}

// 🌿 เมื่อบอทพร้อม
client.once("ready", () => {
  console.log(`🌸 ${client.user.tag} พร้อมทำงานแล้ว!`);

  // 🌈 ระบบปลุกตัวเอง (ฟรี)
  setInterval(async () => {
    try {
      const res = await fetch(`https://${process.env.RENDER_URL || "gardenspirit-by-yuki.onrender.com"}`);
      console.log(`🔁 Pinged self at ${new Date().toLocaleTimeString()} | Status: ${res.status}`);
    } catch (err) {
      console.error("⚠️ Ping failed:", err.message);
    }
  }, 5 * 60 * 1000); // ทุก 5 นาที

  // 🚨 แจ้งเตือนบอทออน (Webhook Discord)
  if (process.env.WEBHOOK_URL) {
    fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `✅ **${client.user.tag} ออนไลน์แล้ว!** เวลา ${new Date().toLocaleTimeString()}`,
      }),
    });
  }
});

// ⚙️ ฟังคำสั่ง Slash
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ เกิดข้อผิดพลาดในการรันคำสั่งนี้!",
      ephemeral: true,
    });
  }
});

client.login(process.env.TOKEN);
