const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🚀 เริ่ม deploy ${commands.length} คำสั่ง...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Deploy คำสั่ง Slash สำเร็จ!");
  } catch (error) {
    console.error(error);
  }
})();
