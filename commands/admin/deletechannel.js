const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

    // ✅ ดึงข้อมูล guild ใหม่ล่าสุด (เห็นห้องใหม่ทันที)
    const freshGuild = await interaction.client.guilds.fetch(interaction.guildId);
    const channels = await freshGuild.channels.fetch();

    // ✅ ดึงเฉพาะช่องข้อความ (จำกัด 25 ช่องเพื่อป้องกัน error)
    const textChannels = Array.from(channels.values())
      .filter(ch => ch.type === ChannelType.GuildText)
      .slice(0, 25)
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
      content: "🧹 โปรดเลือกช่องที่ต้องการลบ (เลือกได้หลายช่อง):",
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
      const selectedChannels = selectedIds.map(id => {
        const ch = channels.get(id);
        return ch ? `#${ch.name}` : "ช่องไม่พบ";
      });

      // ✅ ปุ่มยืนยัน / ยกเลิก
      const confirmBtn = new ButtonBuilder()
        .setCustomId("confirm_delete")
        .setLabel("✅ ยืนยันลบ")
        .setStyle(ButtonStyle.Danger);

      const cancelBtn = new ButtonBuilder()
        .setCustomId("cancel_delete")
        .setLabel("❌ ยกเลิก")
        .setStyle(ButtonStyle.Secondary);

      const buttonRow = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

      await selectInteraction.reply({
        content: `⚠️ คุณแน่ใจหรือไม่ว่าจะลบช่องต่อไปนี้?\n\n${selectedChannels.join("\n")}`,
        components: [buttonRow],
        ephemeral: false,
      });

      const buttonCollector = selectInteraction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 20000,
      });

      buttonCollector.on("collect", async btnInteraction => {
        if (btnInteraction.user.id !== interaction.user.id)
          return btnInteraction.reply({
            content: "คุณไม่ได้เป็นคนสั่งคำสั่งนี้",
            ephemeral: true,
          });

        if (btnInteraction.customId === "confirm_delete") {
          const deleted = [];
          const failed = [];

          for (const id of selectedIds) {
            const ch = channels.get(id);
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
          if (deleted.length > 0)
            result += `✅ ลบสำเร็จ: ${deleted.join(", ")}\n`;
          if (failed.length > 0)
            result += `⚠️ ลบไม่สำเร็จ: ${failed.join(", ")}\n`;
          if (result === "") result = "⚠️ ไม่มีช่องใดถูกลบ";

          await btnInteraction.update({
            content: result,
            components: [],
          });
          buttonCollector.stop();
        }

        if (btnInteraction.customId === "cancel_delete") {
          await btnInteraction.update({
            content: "❌ ยกเลิกการลบช่องแล้ว",
            components: [],
          });
          buttonCollector.stop();
        }
      });

      buttonCollector.on("end", async () => {
        try {
          await selectInteraction.editReply({
            components: [],
            content: "⌛ หมดเวลายืนยัน (ใช้ /deletechannel ใหม่เพื่อเริ่มอีกครั้ง)",
          });
        } catch {}
      });
    });

    collector.on("end", async () => {
      try {
        await replyMsg.edit({
          components: [],
          content: "⌛ หมดเวลาการเลือกช่องแล้ว (ใช้ /deletechannel ใหม่เพื่อเริ่มอีกครั้ง)",
        });
      } catch {}
    });
  },
};
