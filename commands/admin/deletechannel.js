const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ ลบหลายช่องพร้อมกัน (เฉพาะแอดมิน)")
    .addStringOption(option =>
      option
        .setName("channels")
        .setDescription("ใส่ชื่อช่องที่ต้องการลบ (คั่นด้วยช่องว่าง เช่น general chat1 chat2)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const input = interaction.options.getString("channels");
    const channelNames = input.split(/\s+/).map(n => n.trim()).filter(Boolean);

    const deleted = [];
    const notFound = [];
    const failed = [];

    await interaction.deferReply({ ephemeral: true });

    for (const name of channelNames) {
      const ch = interaction.guild.channels.cache.find(c => c.name === name);

      if (!ch) {
        notFound.push(name);
        continue;
      }

      if (ch.type === 4) { // Category
        failed.push(`${name} (เป็นหมวดหมู่)`);
        continue;
      }

      try {
        await ch.delete(`Deleted by ${interaction.user.tag}`);
        deleted.push(name);
      } catch (err) {
        console.error(`❌ ลบ ${name} ไม่ได้:`, err);
        failed.push(`${name} (${err.message})`);
      }
    }

    let result = "";
    if (deleted.length) result += `✅ ลบสำเร็จ: ${deleted.join(", ")}\n`;
    if (notFound.length) result += `❌ ไม่พบช่อง: ${notFound.join(", ")}\n`;
    if (failed.length) result += `⚠️ ลบไม่สำเร็จ: ${failed.join(", ")}\n`;

    if (!result) result = "⚠️ ไม่มีช่องใดถูกลบ";

    await interaction.editReply({ content: result });
  },
};
