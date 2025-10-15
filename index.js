// 🌸 GardenSpirit by Yuki - Main Bot File
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const config = require("./config.json");

// 🌐 สร้างเว็บเซิร์ฟเวอร์ไว้ให้ Render ตรวจ uptime
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("🌿 GardenSpirit by Yuki is running 24/7!"));
app.listen(PORT, () => console.log(`✅ Server is live on port ${PORT}`));

// 🌸 ตั้งค่า Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// 🔹 โหลดคำสั่ง (จากโฟลเดอร์ /commands)
const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.data.name, command);
  }
}

// 🔹 โหลด event ทั้งหมด (จากโฟลเดอร์ /events)
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const eventFile = require(path.join(eventsPath, file));
  if (typeof eventFile === "function") eventFile(client);
}

// 🎉 Event: เมื่อบอทพร้อมทำงาน
client.once(Events.ClientReady, c => {
  console.log(`🌸 Logged in as ${c.user.tag}`);
});

// ⚙️ Event: เมื่อมีการใช้ Slash Command
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("❌ Command Error:", error);
    await interaction.reply({
      content: "⚠️ มีข้อผิดพลาดในการทำงานของคำสั่งนี้!",
      ephemeral: true,
    });
  }
});

// 🪴 ระบบต้อนรับ / ลาจาก
client.on(Events.GuildMemberAdd, async member => {
  const channel = member.guild.channels.cache.get(config.welcomeChannel);
  if (!channel) return;

  await channel.send(`🎉 ยินดีต้อนรับ <@${member.id}> เข้าสู่ ${member.guild.name}! 🌸`);
});

client.on(Events.GuildMemberRemove, async member => {
  const channel = member.guild.channels.cache.get(config.goodbyeChannel);
  if (!channel) return;

  await channel.send(`👋 ลาก่อน ${member.user.username} ขอให้โชคดีนะ! 💐`);
});

// 🔁 ระบบ Reaction Role
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  // จำกัดให้ทำงานเฉพาะช่องที่อนุญาต (ถ้ากำหนด)
  if (config.allowedChannelId && reaction.message.channel.id !== config.allowedChannelId) return;

  const emojiKey = reaction.emoji.id
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const roleId = config.reactionRoles?.[emojiKey];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  // 🔄 ลบยศเก่าก่อน
  for (const id of Object.values(config.reactionRoles)) {
    if (member.roles.cache.has(id)) await member.roles.remove(id);
  }

  await member.roles.add(roleId);
  console.log(`✅ ${member.user.tag} รับยศใหม่แล้ว`);
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const emojiKey = reaction.emoji.id
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const roleId = config.reactionRoles?.[emojiKey];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(roleId);
  console.log(`❎ ${member.user.tag} ถูกลบยศออก`);
});

// 🔑 ล็อกอิน
client.login(process.env.TOKEN);
