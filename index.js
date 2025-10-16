require("dotenv").config();
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

// 🧩 ตั้งค่า Webhook สำหรับแจ้งเตือน
const WEBHOOK_URL = "https://discord.com/api/webhooks/1428472728490606633/yeQhav-QsyFgqDcp0jC445L7FzVSdD-c7B1Q9hn0skVJWqOYmpEzp_2pj2iLECz5848p";

// 🌸 สร้าง client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 🌼 โหลดคำสั่ง Slash
if (fs.existsSync("./commands")) {
  const commandFolders = fs.readdirSync("./commands");
  for (const folder of commandFolders) {
    const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const command = require(`./commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
    }
  }
}

// 🌿 Express Server (Render)
const app = express();

// ✅ หน้าเว็บหลักให้ UptimeRobot ping
app.get("/", (req, res) => res.send("🌸 GardenSpirit is alive!"));

// ✅ หน้าเว็บล้าง Cache
app.get("/clean", async (req, res) => {
  try {
    const tempDir = "/tmp";
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      fs.rmSync(path.join(tempDir, file), { recursive: true, force: true });
    }
    console.clear();
    console.log("🧹 Cache cleared successfully!");

    // แจ้งเตือนใน Discord ผ่าน Webhook
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "GardenSpirit Monitor",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/4144/4144784.png",
        embeds: [
          {
            title: "🧹 Cache Cleared",
            description: `ระบบได้ล้าง cache สำเร็จเมื่อ <t:${Math.floor(Date.now() / 1000)}:R>`,
            color: 0x3498db,
            footer: { text: `เวลา: ${new Date().toLocaleString("th-TH")}` },
          },
        ],
      }),
    });

    res.send("🧹 Cache cleared successfully!");
  } catch (err) {
    console.error("❌ Error clearing cache:", err);
    res.status(500).send("Error clearing cache.");
  }
});

app.listen(process.env.PORT || 3000, () => console.log("✅ Uptime Server Started"));

// 🚀 เข้าสู่ระบบ Discord
client.login(process.env.TOKEN);

// 💚 แจ้งตอนบอทออนไลน์
client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} is online!`);

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "GardenSpirit Monitor",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/4144/4144784.png",
        embeds: [
          {
            title: "✅ GardenSpirit Bot Online",
            description: `บอท **${client.user.username}** ออนไลน์แล้วเมื่อ <t:${Math.floor(Date.now() / 1000)}:R>`,
            color: 0x00ff99,
            footer: { text: `เวลา: ${new Date().toLocaleString("th-TH")}` },
          },
        ],
      }),
    });
  } catch (e) {
    console.error("ส่ง webhook แจ้งออนไม่สำเร็จ:", e);
  }
});

// 💀 แจ้งตอนบอทดับหรือ error
process.on("uncaughtException", async (err) => {
  console.error("🚨 บอทเกิดข้อผิดพลาด:", err);

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "GardenSpirit Monitor",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/4144/4144784.png",
        embeds: [
          {
            title: "❌ GardenSpirit Bot Offline",
            description: `บอท **GardenSpirit by Yuki** ดับหรือหยุดทำงาน!\n\`\`\`${err.message}\`\`\``,
            color: 0xff0000,
            footer: { text: `เวลา: ${new Date().toLocaleString("th-TH")}` },
          },
        ],
      }),
    });
  } catch (e) {
    console.error("ส่ง webhook แจ้งดับไม่สำเร็จ:", e);
  }

  process.exit(1);
});
