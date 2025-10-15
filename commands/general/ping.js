const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🔔 ตรวจสอบสถานะบอท"),
  async execute(interaction) {
    await interaction.reply("🏓 Pong! GardenSpirit พร้อมใช้งาน~");
  },
};
