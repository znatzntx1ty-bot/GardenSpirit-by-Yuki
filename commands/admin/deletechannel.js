const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ ลบหลายช่องพร้อมกัน (เฉพาะแอดมิน)")
    .addChannelOption(option =>
      option
        .setName("channel1")
        .setDescription("เลือกช่องที่ต้องการลบช่องแรก")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName("channel2")
        .setDescription("เลือกช่องที่จะลบเพิ่ม (ไม่บังคับ)")
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName("channel3")
        .setDescription("เลือกช่องที่จะลบเพิ่ม (ไม่บังคับ)")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channels = [
      interaction.options.getChannel("channel1"),
      interaction.options.getChannel("channel2"),
      interaction.options.getChannel("channel3"),
    ].filter(Boolean); // ลบช่องที่ไม่ได้เลือกออก

    if (!channels.length) {
      return interaction.reply({
        content: "⚠️ กรุณาเลือกอย่างน้อย 1 ช่องเพื่อลบ!",
        ephemeral: true,
      });
    }

    // ตรวจสอบสิทธิ์ก่อน
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ คุณไม่มีสิทธิ์ลบช่องนี้!",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `⚠️ จะลบช่องเหล่านี้ใน 3 วินาที:\n${channels.map(ch => `• <#${ch.id}>`).join("\n")}`,
      ephemeral: true,
    });

    // หน่วงเวลา 3 วินาทีก่อนลบ
    setTimeout(async () => {
      for (const channel of channels) {
        try {
          if (channel.type === ChannelType.GuildText) {
            await channel.delete(`Deleted by ${interaction.user.tag}`);
            console.log(`🗑️ Deleted channel: ${channel.name}`);
          } else {
            console.log(`⚠️ Skipped non-text channel: ${channel.name}`);
          }
        } catch (err) {
          console.error(`❌ Error deleting ${channel.name}:`, err);
        }
      }

      await interaction.followUp({
        content: `✅ ลบช่องทั้งหมดเรียบร้อยแล้ว!\n${channels.map(ch => `❌ ${ch.name}`).join("\n")}`,
        ephemeral: true,
      });
    }, 3000);
  },
};
