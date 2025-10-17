const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("เช็กสถานะของบอท!"),
  async execute(interaction) {
    try {
      if (interaction.replied || interaction.deferred) return;
      await interaction.reply({
        content: `✅ ${interaction.client.user.tag} ออนไลน์แล้ว! เวลา ${new Date().toLocaleTimeString()}`,
        ephemeral: false,
      });
    } catch (err) {
      console.error(err);
      if (!interaction.replied)
        await interaction.reply({
          content: `❌ GardenSpirit ล่มเนื่องจากข้อผิดพลาด:\n\`\`\`${err.message}\`\`\``,
          ephemeral: true,
        });
    }
  },
};
