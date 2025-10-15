// 🌸 GardenSpirit by Yuki - Deploy Commands
const { REST, Routes } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const commands = [];
const foldersPath = "./commands";

// 🔹 โหลดคำสั่งทั้งหมดจากโฟลเดอร์หลัก
for (const folder of fs.readdirSync(foldersPath)) {
  const commandsPath = `${foldersPath}/${folder}`;
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const command = require(`./${commandsPath}/${file}`);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`⚠️ คำสั่ง ${file} ไม่มี data หรือ execute`);
    }
  }
}

// 💾 เตรียมเชื่อมต่อ API Discord
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// 🪄 Deploy!
(async () => {
  try {
    console.log("🔄 เริ่มการ deploy คำสั่ง (Slash Commands)...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ สำเร็จ! คำสั่งทั้งหมดถูกอัปเดตแล้ว 💫");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการ deploy:", error);
  }
})();
