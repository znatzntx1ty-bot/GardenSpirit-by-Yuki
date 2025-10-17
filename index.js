require("dotenv").config();
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บสำหรับ uptime check
app.get("/", (req, res) => res.send("🌷 GardenSpirit is blooming and alive!"));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// 🌿 สร้าง client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 📦 โหลดคำสั่งทั้งหมดจากโฟลเดอร์ /commands
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`⚠️ คำสั่ง ${file} ไม่มี data หรือ execute`);
    }
  }
}

// 📂 โหลด Event จากโฟลเดอร์ /events (ถ้ามี)
if (fs.existsSync("./events")) {
  const eventFiles = fs.readdirSync("./events").filter(f => f.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// 🧠 Event หลัก: บอทพร้อมใช้งาน
client.once("ready", () => {
  console.log(`🌼 ${client.user.tag} พร้อมใช้งานแล้ว!`);

  // 🔁 ปลุกตัวเองทุก 5 นาที
  setInterval(async () => {
    try {
      const res = await fetch(`https://${process.env.RENDER_URL || "gardenspirit-by-yuki.onrender.com"}`);
      console.log(`🔁 Pinged self at ${new Date().toLocaleTimeString()} | Status: ${res.status}`);
    } catch (err) {
      console.error("⚠️ Ping failed:", err.message);
    }
  }, 5 * 60 * 1000); // ทุก 5 นาที

  // 🚨 แจ้งเตือน Discord ว่าบอทออนไลน์
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

// 🎯 ฟังคำสั่ง Slash Commands
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ มีข้อผิดพลาดในการรันคำสั่งนี้!",
      ephemeral: true,
    });
  }
});
// 🧩 แจ้งเตือนเมื่อบอทดับหรือรีสตาร์ต
process.on("exit", async (code) => {
  if (process.env.WEBHOOK_URL) {
    await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `⚠️ **${process.env.BOT_NAME || "GardenSpirit"}** กำลังปิดตัวลง... (Code: ${code})`,
      }),
    });
  }
});

process.on("uncaughtException", async (err) => {
  console.error("💥 บอทเจอข้อผิดพลาดรุนแรง:", err);
  if (process.env.WEBHOOK_URL) {
    await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `❌ **${process.env.BOT_NAME || "GardenSpirit"}** ล่มเนื่องจากข้อผิดพลาด:\n\`\`\`${err.message}\`\`\``,
      }),
    });
  }
  process.exit(1);
});

// 🚀 เข้าสู่ระบบ
client.login(process.env.TOKEN);
