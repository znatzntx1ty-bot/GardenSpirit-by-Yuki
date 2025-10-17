const { REST, Routes } = require("discord.js");
require("dotenv").config();
const fs = require("fs");

// โหลดคำสั่งทั้งหมดจากโฟลเดอร์ /commands
const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🧹 กำลังล้างคำสั่งเก่าทั้งหมด...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );
    console.log("✅ ล้างคำสั่งเก่าเรียบร้อยแล้ว!");

    console.log("🚀 กำลังลงคำสั่งใหม่ทั้งหมด...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Deploy คำสั่งใหม่สำเร็จแล้ว!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดขณะ deploy คำสั่ง:", error);
  }
})();
