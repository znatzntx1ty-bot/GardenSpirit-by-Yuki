const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("🗑️ เลือกลบหลายช่องพร้อมกัน (เฉพาะแอดมิน)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "⚠️ คุณไม่มีสิทธิ์ใช้คำสั่งนี้",
        ephemeral: true,
      });
    }

    // 🧠 ดึงเฉพาะ 25 ห้องแรก เพื่อไม่ให้ Discord พัง
    const textChannels = interaction.guild.channels.cache
      .filter(ch => ch.type === ChannelType.GuildText)
      .first(25)
      .map(ch => ({
        label: `#${ch.name}`,
        value: ch.id,
      }));

    if (textChannels.length === 0) {
      return interaction.reply({
        content: "😕 ไม่มีช่องข้อความในเซิร์ฟเวอร์นี้ให้ลบ",
        ephemeral: true,
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("deletechannel_select")
      .setPlaceholder("เลือกช่องที่ต้องการลบ (เลือกได้หลายช่อง)")
      .addOptions(textChannels)
      .setMinValues(1)
      .setMaxValues(textChannels.length);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const replyMsg = await interaction.reply({
      content: "🧹 โปรดเลือกช่องที่คุณต้องการลบ (เลือกได้หลายช่อง):",
      components: [row],
      ephemeral: false,
    });

    const collector = replyMsg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on("collect", async selectInteraction => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return selectInteraction.reply({
          content: "⚠️ คุณไม่ได้เป็นคนสั่งลบ",
          ephemeral: true,
        });
      }

      const selectedIds = selectInteraction.values;
      const deleted = [];
      const failed = [];

      await selectInteraction.deferReply({ ephemeral: false });

      for (const id of selectedIds) {
        const ch = interaction.guild.channels.cache.get(id);
        if (!ch) continue;

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

      await selectInteraction.editReply({
        content: result,
        components: [],
      });
    });

    collector.on("end", async () => {
      try {
        await replyMsg.edit({
          components: [],
          content: "⌛ หมดเวลาการเลือกช่องแล้ว (ใช้ /deletechannel ใหม่เพื่อเริ่มอีกครั้ง)",
        });
      } catch (e) {}
    });
  },
};
