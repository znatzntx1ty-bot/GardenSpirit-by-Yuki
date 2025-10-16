const { REST, Routes } = require("discord.js");
require("dotenv").config();

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

// โหลดคำสั่งทั้งหมดจาก /commands
const fs = require("fs");
const path = require("path");
const commands = [];

const commandsPath = path.join(__dirname, "commands");
for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🧹 Deleting ALL old global commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    console.log("✅ Cleared global commands");

    console.log("🧹 Deleting ALL old guild commands...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
    console.log("✅ Cleared guild commands");

    console.log(`🚀 Deploying ${commands.length} new guild commands...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

    console.log("🎯 Successfully deployed fresh commands!");
  } catch (error) {
    console.error("❌ Error deploying commands:", error);
  }
})();
