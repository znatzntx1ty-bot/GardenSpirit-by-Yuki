const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearcache")
    .setDescription("🧹 ล้างแคชของบอท (เฉพาะแอดมิน)"),
  async execute(interaction) {
    await interaction.reply("คำสั่งนี้ถูกรันจากระบบหลักใน index.js แล้วครับ~");
  },
};
