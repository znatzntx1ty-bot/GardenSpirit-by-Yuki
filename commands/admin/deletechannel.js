const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

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
    ].filter(Boolean);

    if (!channels.length) {
      return interaction.reply({
        content: "⚠️ กรุณาเลือกอย่างน้อย 1 ช่องเพื่อลบ!",
        ephemeral: true,
      });
    }

    // ตรวจสอบสิทธิ์ผู้ใช้
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        content: "❌ คุณไม่มีสิทธิ์ลบช่องนี้!",
        ephemeral: true,
      });
    }

    // ปุ่มยืนยัน
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_delete")
        .setLabel("✅ ยืนยันลบ")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancel_delete")
        .setLabel("❌ ยกเลิก")
        .setStyle(ButtonStyle.Secondary)
    );

    // ส่งข้อความพร้อมปุ่ม
    const message = await interaction.reply({
      content: `⚠️ ยืนยันจะลบช่องเหล่านี้ใช่ไหม?\n${channels
        .map(ch => `• <#${ch.id}>`)
        .join("\n")}`,
      components: [row],
      ephemeral: true,
    });

    // รอการคลิกปุ่ม 30 วินาที
    const filter = i =>
      ["confirm_delete", "cancel_delete"].includes(i.customId) &&
      i.user.id === interaction.user.id;

    const collector = message.createMessageComponentCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", async i => {
      if (i.customId === "confirm_delete") {
        for (const channel of channels) {
          try {
            if (channel.type === ChannelType.GuildText) {
              await channel.delete(`Deleted by ${interaction.user.tag}`);
              console.log(`🗑️ Deleted channel: ${channel.name}`);
            }
          } catch (err) {
            console.error(`❌ Error deleting ${channel.name}:`, err);
          }
        }

        await i.update({
          content: `✅ ลบช่องทั้งหมดเรียบร้อยแล้ว!\n${channels
            .map(ch => `❌ ${ch.name}`)
            .join("\n")}`,
          components: [],
        });
      } else {
        await i.update({
          content: "❌ ยกเลิกการลบช่องแล้ว!",
          components: [],
        });
      }
    });

    collector.on("end", async collected => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "⌛ หมดเวลา ยกเลิกการลบช่องแล้ว",
          components: [],
        });
      }
    });
  },
};
