const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// 🩵 โหลดคำสั่งทั้งหมดจากโฟลเดอร์ commands
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ โหลดคำสั่ง: ${command.data.name}`);
    } else {
      console.log(`⚠️ ข้ามไฟล์ ${filePath} (ไม่มี data หรือ execute)`);
    }
  }
}

// 🧭 สร้าง REST Client
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// 🚀 Deploy คำสั่งทั้งหมดเข้าเซิร์ฟ
(async () => {
  try {
    console.log("🛠️ กำลัง Deploy คำสั่งทั้งหมด...");

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ คำสั่งทั้งหมดถูก Deploy เรียบร้อย!");
  } catch (error) {
    console.error("❌ มีข้อผิดพลาดตอน Deploy:", error);
  }
})();
