const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// 🧩 โหลดคำสั่งทั้งหมดจากโฟลเดอร์ commands
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
      console.log(`⚠️ ข้ามไฟล์ ${filePath} (ไม่พบ data หรือ execute)`);
    }
  }
}

// 🪄 สร้าง REST Client
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// 🔧 Deploy คำสั่งเข้าเซิร์ฟเวอร์ที่ต้องการ
(async () => {
  try {
    console.log("🚀 กำลัง Deploy คำสั่งทั้งหมด...");

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, "1427386830247952414"), // 🔹 ใส่ ID เซิร์ฟที่นี่
      { body: commands }
    );

    console.log("✅ คำสั่งทั้งหมดถูก Deploy เรียบร้อย!");
  } catch (error) {
    console.error("❌ มีข้อผิดพลาดตอน Deploy:", error);
  }
})();
