const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("📢 ให้บอทพูดแทนในข้อความหรือห้องที่กำหนด")
    .addStringOption(opt =>
      opt.setName("message").setDescription("ข้อความที่ต้องการให้บอทพูด").setRequired(true))
    .addChannelOption(opt =>
      opt.setName("channel").setDescription("ห้องที่ต้องการให้พูด (ถ้าไม่ใส่จะพูดในห้องนี้)"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const message = interaction.options.getString("message");
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    await channel.send(message);
    await interaction.reply({ content: `✅ ส่งข้อความใน ${channel} เรียบร้อยแล้ว!`, ephemeral: true });
  }
};
