import fetch from "node-fetch"; // หรือถ้าใช้ require ให้เขียนแบบนี้:
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// 🌸 หน้าเว็บสำหรับ uptime check
app.get("/", (req, res) => res.send("🌷 GardenSpirit is blooming and alive!"));
app.listen(PORT, () => console.log(`🪴 Server running on port ${PORT}`));

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

// 📂 โหลดคำสั่งทั้งหมดจาก /commands
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

// 📂 โหลด event จาก /events (ถ้ามี)
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
  console.log(`🌸 ${client.user.tag} พร้อมใช้งานแล้ว!`);

  // 🩷 แจ้งเตือนกลับมาออนไลน์
  if (process.env.WEBHOOK_URL) {
    fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `✅ **${client.user.tag}** ออนไลน์แล้ว! เวลา ${new Date().toLocaleString("th-TH", {
          timeZone: "Asia/Bangkok",
        })}`,
      }),
    });
  }
});

// ⏱️ ปลุกตัวเองทุก 5 นาที
setInterval(async () => {
  try {
    const res = await fetch(`https://${process.env.RENDER_URL || "gardenspirit-by-yuki.onrender.com"}`);
    console.log(`📡 Ping self at ${new Date().toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" })}`);
  } catch (err) {
    console.error("⚠️ Ping failed:", err.message);
  }
}, 5 * 60 * 1000);

// 💬 ฟังคำสั่ง Slash
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    // ✅ แก้บั๊ก "Interaction has already been acknowledged."
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: `❌ GardenSpirit ล่มเนื่องจากข้อผิดพลาด:\n\`\`\`${err.message}\`\`\``,
        ephemeral: true,
      });
    } else {
      console.log("⚠️ Interaction ถูกตอบไปแล้ว ข้ามการตอบซ้ำ");
    }
  }
});

// 🌱 แจ้งเตือนเมื่อบอทดับหรือรีสตาร์ต
process.on("exit", async code => {
  if (process.env.WEBHOOK_URL) {
    await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `❌ **${process.env.BOT_NAME || "GardenSpirit"}** ปิดตัวลง (Code ${code})`,
      }),
    });
  }
});

// 💥 แจ้งเตือนเมื่อเกิด error รุนแรง
process.on("uncaughtException", async err => {
  console.error("💥 พบข้อผิดพลาดรุนแรง:", err);
  if (process.env.WEBHOOK_URL) {
    await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `💥 **${process.env.BOT_NAME || "GardenSpirit"}** ล่มเนื่องจาก:\n\`\`\`${err.message}\`\`\``,
      }),
    });
  }
  process.exit(1);
});

// ♻️ Log การ reconnect เพื่อ debug
client.on("shardReconnecting", () => {
  console.log("♻️ กำลังเชื่อมต่อใหม่...");
});
client.on("shardResume", () => {
  console.log("✅ บอทกลับมาเชื่อมต่อเรียบร้อยแล้ว!");
});

setInterval(() => {
  fetch("https://gardenspirit-by-yuki.koyeb.app").catch(() => console.log("Ping failed"));
}, 5 * 60 * 1000); // ping ทุก 5 นาที

// 🚀 เข้าสู่ระบบ
client.login(process.env.TOKEN);
