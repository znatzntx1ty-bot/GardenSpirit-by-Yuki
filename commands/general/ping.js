// /commands/ping.js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("เช็กสถานะของบอท!"),

  async execute(interaction) {
    try {
      // ป้องกันการตอบซ้ำ
      if (interaction.replied || interaction.deferred) return;

      // เวลาไทย 🇹🇭
      const now = new Date();
      const thaiTime = now.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        hour12: false,
      });

      // ตอบกลับ
      await interaction.reply({
        content: `✅ ${interaction.client.user.tag} ออนไลน์แล้ว! 🇹🇭 เวลา ${thaiTime}`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("❌ Ping command error:", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: `❌ GardenSpirit ล่มเนื่องจากข้อผิดพลาด:\n\`\`\`${err.message}\`\`\``,
          ephemeral: true,
        });
      }
    }
  },
};
