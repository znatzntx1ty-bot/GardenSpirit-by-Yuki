require("dotenv").config();
const fs = require("fs");
const { REST, Routes } = require("discord.js");

const commands = [];
const folders = fs.readdirSync("./commands");
for (const folder of folders) {
  const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of files) {
    const command = require(`./commands/${folder}/${file}`);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🚀 Deploying ${commands.length} commands...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands deployed successfully!");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
})();
