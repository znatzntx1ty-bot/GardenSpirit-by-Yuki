const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ ลบช่องที่เลือก (เฉพาะแอดมิน)")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("เลือกช่องที่ต้องการลบ")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    // ป้องกันไม่ให้บอทลบ category หรือช่อง voice โดยไม่ได้ตั้งใจ
    if (channel.type !== 0 && channel.type !== 15) {
      return interaction.reply({
        content: "⚠️ ลบได้เฉพาะช่องข้อความ (Text Channel) เท่านั้น!",
        ephemeral: true,
      });
    }

    // ยืนยันก่อนลบ
    await interaction.reply({
      content: `❓ แน่ใจไหมว่าจะลบช่อง <#${channel.id}> ?\n(ระบบจะลบภายใน 3 วินาที...)`,
      ephemeral: true,
    });

    setTimeout(async () => {
      try {
        await channel.delete(`Deleted by ${interaction.user.tag}`);
        console.log(`🗑️ Channel ${channel.name} deleted by ${interaction.user.tag}`);
      } catch (err) {
        console.error("❌ Error deleting channel:", err);
        await interaction.followUp({
          content: "เกิดข้อผิดพลาดในการลบช่อง ❌",
          ephemeral: true,
        });
      }
    }, 3000);
  },
};
