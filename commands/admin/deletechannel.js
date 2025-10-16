const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ ลบช่องที่เลือก (เฉพาะแอดมิน)")
    .addChannelOption(option =>
      option
        .setName("channel1")
        .setDescription("เลือกช่องที่ต้องการลบ (ช่องที่ 1)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName("channel2")
        .setDescription("เลือกช่องที่ต้องการลบ (ช่องที่ 2, ไม่บังคับ)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName("channel3")
        .setDescription("เลือกช่องที่ต้องการลบ (ช่องที่ 3, ไม่บังคับ)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channels = [
      interaction.options.getChannel("channel1"),
      interaction.options.getChannel("channel2"),
      interaction.options.getChannel("channel3"),
    ].filter(Boolean);

    await interaction.deferReply({ ephemeral: true });

    const deleted = [];
    const failed = [];

    for (const ch of channels) {
      try {
        await ch.delete(`Deleted by ${interaction.user.tag}`);
        deleted.push(`#${ch.name}`);
      } catch (err) {
        console.error(`❌ ลบ ${ch.name} ไม่ได้:`, err);
        failed.push(`#${ch.name}`);
      }
    }

    let result = "";
    if (deleted.length > 0) result += `✅ ลบสำเร็จ: ${deleted.join(", ")}\n`;
    if (failed.length > 0) result += `⚠️ ลบไม่สำเร็จ: ${failed.join(", ")}\n`;
    if (result === "") result = "⚠️ ไม่มีช่องใดถูกลบ";

    await interaction.editReply({ content: result });
  },
};
