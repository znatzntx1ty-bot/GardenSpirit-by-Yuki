const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlogchannel")
    .setDescription("📜 ตั้งค่าช่องที่ใช้สำหรับบันทึก log การทำงานของบอท")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("เลือกห้อง log ที่ต้องการ")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    // โหลดไฟล์ config.json
    let config = {};
    try {
      config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
    } catch {
      config = {};
    }

    // บันทึกค่า log channel ID
    config.logChannelId = channel.id;
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ ตั้งค่าห้อง log เป็น <#${channel.id}> เรียบร้อยแล้ว!`,
      ephemeral: true,
    });
  },
};
