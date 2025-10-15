const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testwelcome")
    .setDescription("🔧 ทดสอบระบบ Welcome / Goodbye"),

  async execute(interaction) {
    const member = interaction.member;

    // Embed welcome
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#ffb6c1")
      .setTitle("🌸 ยินดีต้อนรับ (โหมดทดสอบ)")
      .setDescription(`ยินดีต้อนรับ <@${member.id}> เข้าสู่ **${interaction.guild.name}** 🌷`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "GardenSpirit Test Mode", iconURL: interaction.guild.iconURL() });

    // Embed goodbye
    const goodbyeEmbed = new EmbedBuilder()
      .setColor("#d1c4e9")
      .setTitle("👋 ลาก่อน (โหมดทดสอบ)")
      .setDescription(`จำลองการออกของ ${member.user.username}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "GardenSpirit Test Mode", iconURL: interaction.guild.iconURL() });

    await interaction.reply({
      content: "✅ ส่งข้อความจำลองแล้ว!",
      ephemeral: true,
    });

    const testChannel = interaction.channel;
    await testChannel.send({ embeds: [welcomeEmbed] });
    await testChannel.send({ embeds: [goodbyeEmbed] });
  },
};
