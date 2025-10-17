// 🌸 GardenSpirit by Yuki — Full System V2
require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// 🩷 หน้าเว็บ uptime (สำหรับ Render)
app.get("/", (req, res) => res.send("🌿 GardenSpirit by Yuki is alive and blooming!"));
app.listen(PORT, () => console.log(`✅ Web server running on port ${PORT}`));

// 🌷 Discord Client
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

// 🔧 โหลดคำสั่งทั้งหมดใน /commands
if (fs.existsSync("./commands")) {
  const folders = fs.readdirSync("./commands");
  for (const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const cmd = require(`./commands/${folder}/${file}`);
      if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
    }
  }
}

// 🌏 เวลาไทย
function thaiTime() {
  return new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok", hour12: false });
}

// 💌 ส่งข้อความเข้า Webhook
async function sendWebhook(msg) {
  if (!process.env.WEBHOOK_URL) return;
  await fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: msg }),
  }).catch(console.error);
}

// 🪄 ระบบแจ้งสถานะบอท
let lastNotify = 0;

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag} พร้อมใช้งานแล้ว!`);
  const now = Date.now();
  if (now - lastNotify > 60000) {
    await sendWebhook(`✅ **${client.user.tag} ออนไลน์แล้ว!** เวลา ${thaiTime()}`);
    lastNotify = now;
  }
});

// 🍂 แจ้งเตือนเมื่อบอท disconnect
client.on(Events.ShardDisconnect, async () => {
  const now = Date.now();
  if (now - lastNotify > 60000) {
    await sendWebhook(`❌ **${client.user.tag} หลุดการเชื่อมต่อ!** เวลา ${thaiTime()}`);
    lastNotify = now;
  }
});

// ⚙️ จัดการ Slash Commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({
        content: `❌ GardenSpirit ล่มเนื่องจากข้อผิดพลาด:\n\`\`\`${err.message}\`\`\``,
        ephemeral: true,
      });
    }
  }
});

// 🧹 คำสั่งล้าง cache (สำหรับแอดมินเท่านั้น)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "clearcache") return;

  if (!interaction.memberPermissions.has("Administrator"))
    return interaction.reply({ content: "🚫 ต้องเป็นแอดมินเท่านั้นถึงจะใช้คำสั่งนี้ได้", ephemeral: true });

  try {
    // ล้างแคชทั้งหมดของ Discord Client
    client.guilds.cache.clear();
    client.users.cache.clear();
    client.channels.cache.clear();

    await interaction.reply("🧹 เคลียร์แคชเรียบร้อยแล้ว! ✨");
    await sendWebhook(`🧹 ${client.user.tag} เคลียร์แคชแล้ว! เวลา ${thaiTime()}`);
  } catch (err) {
    await interaction.reply({ content: `❌ เกิดข้อผิดพลาด: ${err.message}`, ephemeral: true });
  }
});

// 🔁 แจ้งเตือนเมื่อ process ปิดตัว / error
process.on("exit", async code => {
  await sendWebhook(`⚠️ **${process.env.BOT_NAME || "GardenSpirit"}** ปิดตัวลง (Code: ${code}) เวลา ${thaiTime()}`);
});
process.on("uncaughtException", async err => {
  console.error("❌ บอทเจอข้อผิดพลาด:", err);
  await sendWebhook(`💥 **${process.env.BOT_NAME || "GardenSpirit"}** ล่มเนื่องจากข้อผิดพลาด:\n\`\`\`${err.message}\`\`\``);
  process.exit(1);
});

// 🚀 เข้าสู่ระบบ Discord
client.login(process.env.TOKEN);
