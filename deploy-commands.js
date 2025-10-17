require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");

const commands = [];
const folders = fs.readdirSync("./commands");

for (const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith(".js"));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// 📡 Deploy commands
(async () => {
  try {
    console.log(`🔄 กำลังอัปโหลด ${commands.length} คำสั่ง...`);
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log(`✅ โหลดคำสั่งสำเร็จ ${data.length} รายการ!`);
  } catch (error) {
    console.error(`❌ Error: ${error}`);
  }
})();
