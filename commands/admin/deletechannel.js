const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ เลือกลบช่องได้ (สูงสุด 5 ช่อง)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "⚠️ คุณไม่มีสิทธิ์ใช้คำสั่งนี้",
        ephemeral: true,
      });
    }

    // ✅ ดึงห้องข้อความล่าสุด (จำกัด 5)
    const textChannels = interaction.guild.channels.cache
      .filter(ch => ch.type === ChannelType.GuildText)
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
      .first(5);

    if (!textChannels.length) {
      return interaction.reply("😕 ไม่มีช่องข้อความให้ลบในตอนนี้");
    }

    // ✅ สร้างลิสต์แสดงห้อง
    let list = textChannels
      .map((ch, i) => `${i + 1}. #${ch.name}`)
      .join("\n");

    await interaction.reply({
      content: `🧹 **เลือกลบช่องที่ต้องการ (สูงสุด 5 ช่อง)**\n\n${list}\n\nพิมพ์หมายเลขช่องที่ต้องการลบ เช่น \`1 3 4\``,
      ephemeral: false,
    });

    // ✅ รอข้อความตอบกลับ
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 20000 });

    collector.on("collect", async msg => {
      const numbers = msg.content
        .split(" ")
        .map(n => parseInt(n))
        .filter(n => !isNaN(n) && n >= 1 && n <= textChannels.length);

      if (numbers.length === 0) {
        await msg.reply("⚠️ โปรดพิมพ์หมายเลขช่องให้ถูกต้อง (1–5)");
        return;
      }

      const toDelete = numbers.map(n => textChannels[n - 1]);
      const deleted = [];
      const failed = [];

      for (const ch of toDelete) {
        try {
          await ch.delete(`Deleted by ${interaction.user.tag}`);
          deleted.push(`#${ch.name}`);
        } catch (err) {
          console.error(err);
          failed.push(`#${ch.name}`);
        }
      }

      let result = "";
      if (deleted.length) result += `✅ ลบสำเร็จ: ${deleted.join(", ")}\n`;
      if (failed.length) result += `⚠️ ลบไม่สำเร็จ: ${failed.join(", ")}\n`;
      if (!result) result = "⚠️ ไม่มีช่องใดถูกลบ";

      await msg.reply(result);
      collector.stop();
    });

    collector.on("end", collected => {
      if (!collected.size) {
        interaction.followUp("⌛ หมดเวลาการเลือกลบช่อง (20 วินาที)");
      }
    });
  },
};
