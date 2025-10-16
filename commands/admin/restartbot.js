const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restartbot")
    .setDescription("🔄 รีสตาร์ทบอท (เฉพาะแอดมิน)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    // ✅ ตรวจสิทธิ์
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "⚠️ คุณไม่มีสิทธิ์ใช้คำสั่งนี้",
        ephemeral: true,
      });
    }

    // ✅ แจ้งสถานะเริ่มรีสตาร์ท
    await interaction.reply("🔄 กำลังรีสตาร์ทบอท โปรดรอสักครู่...");

    // ✅ แจ้งก่อนปิดตัว
    const guild = interaction.guild;
    const logChannel = guild.channels.cache.find(ch => ch.name === "🌸｜bot-logs" || ch.name === "bot-logs");

    if (logChannel) {
      await logChannel.send(`⚙️ **บอทได้รับคำสั่งรีสตาร์ทโดย:** ${interaction.user.tag}`);
    }

    // ✅ สั่ง Render รีสตาร์ท (จำลองโดย kill process)
    setTimeout(() => {
      process.exit(0);
    }, 3000);
  },
};
