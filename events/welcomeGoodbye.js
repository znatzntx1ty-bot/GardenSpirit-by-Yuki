const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = (client) => {
  // 🎉 ต้อนรับสมาชิกใหม่
  client.on("guildMemberAdd", async (member) => {
    const channel = member.guild.channels.cache.get(config.welcomeChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ffb6c1")
      .setTitle("🌸 ยินดีต้อนรับ!")
      .setDescription(`ยินดีต้อนรับ <@${member.id}> เข้าสู่ **${member.guild.name}** 🌷\nตอนนี้เรามีสมาชิกทั้งหมด **${member.guild.memberCount}** คนแล้ว!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "GardenSpirit Welcoming System", iconURL: member.guild.iconURL() })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  });

  // 👋 ลาสมาชิก
  client.on("guildMemberRemove", async (member) => {
    const channel = member.guild.channels.cache.get(config.goodbyeChannel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#d1c4e9")
      .setTitle("👋 ลาก่อน~")
      .setDescription(`ขอให้โชคดีนะ ${member.user.username} 🌸\nเหลือสมาชิกในเซิร์ฟตอนนี้ **${member.guild.memberCount}** คน`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "GardenSpirit Farewell System", iconURL: member.guild.iconURL() })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  });
};
