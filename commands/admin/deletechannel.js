const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "deletechannel",
  description: "🗑️ ลบหลายช่องพร้อมกัน (เฉพาะแอดมิน)",
  options: [
    {
      name: "channels",
      description: "ใส่ชื่อช่องที่จะลบ (เว้นวรรคคั่นหลายชื่อได้ เช่น: channel1 channel2 channel3)",
      type: 3, // STRING
      required: true,
    },
  ],

  async execute(interaction) {
    // ✅ ตรวจสิทธิ์ก่อน
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้ (ต้องมีสิทธิ์ Manage Channels)",
        ephemeral: true,
      });
    }

    const input = interaction.options.getString("channels");
    const channelNames = input.split(/\s+/).map((name) => name.trim());
    const deleted = [];
    const notFound = [];
    const failed = [];

    await interaction.deferReply({ ephemeral: true });

    for (const name of channelNames) {
      const channel = interaction.guild.channels.cache.find(
        (c) => c.name === name
      );

      if (!channel) {
        notFound.push(name);
        continue;
      }

      try {
        await channel.delete(`Deleted by ${interaction.user.tag}`);
        deleted.push(name);
      } catch (err) {
        console.error(`❌ ลบช่อง ${name} ไม่สำเร็จ:`, err);
        failed.push(name);
      }
    }

    let resultMsg = "";

    if (deleted.length > 0)
      resultMsg += `✅ ลบช่องสำเร็จ: ${deleted.join(", ")}\n`;
    if (notFound.length > 0)
      resultMsg += `❌ ไม่พบช่อง: ${notFound.join(", ")}\n`;
    if (failed.length > 0)
      resultMsg += `⚠️ ลบช่องไม่สำเร็จ: ${failed.join(", ")}\n`;

    if (!resultMsg) resultMsg = "⚠️ ไม่มีช่องใดถูกลบ";

    await interaction.editReply({
      content: resultMsg,
      ephemeral: true,
    });
  },
};
