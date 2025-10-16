const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ เลือกช่องที่จะลบ (เลือกได้สูงสุด 5 ช่อง)")
    .addChannelOption(option =>
      option
        .setName("channel1")
        .setDescription("เลือกช่องที่จะลบช่องที่ 1")
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(option =>
      option
        .setName("channel2")
        .setDescription("เลือกช่องที่จะลบช่องที่ 2 (ไม่บังคับ)")
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(option =>
      option
        .setName("channel3")
        .setDescription("เลือกช่องที่จะลบช่องที่ 3 (ไม่บังคับ)")
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(option =>
      option
        .setName("channel4")
        .setDescription("เลือกช่องที่จะลบช่องที่ 4 (ไม่บังคับ)")
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(option =>
      option
        .setName("channel5")
        .setDescription("เลือกช่องที่จะลบช่องที่ 5 (ไม่บังคับ)")
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: "⚠️ คุณไม่มีสิทธิ์ใช้คำสั่งนี้", ephemeral: true });
    }

    const deleted = [];
    const failed = [];

    for (let i = 1; i <= 5; i++) {
      const channel = interaction.options.getChannel(`channel${i}`);
      if (!channel) continue;

      try {
        await channel.delete(`Deleted by ${interaction.user.tag}`);
        deleted.push(`#${channel.name}`);
      } catch (err) {
        console.error(err);
        failed.push(`#${channel.name}`);
      }
    }

    let result = "";
    if (deleted.length) result += `✅ ลบสำเร็จ: ${deleted.join(", ")}\n`;
    if (failed.length) result += `⚠️ ลบไม่สำเร็จ: ${failed.join(", ")}`;
    if (!result) result = "⚠️ ไม่มีช่องที่ถูกลบ";

    await interaction.reply(result);
  },
};
