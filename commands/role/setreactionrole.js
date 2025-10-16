const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setreactionrole")
    .setDescription("🪻 ตั้งค่า Reaction Role ด้วยตนเอง")
    .addStringOption(option =>
      option
        .setName("message_id")
        .setDescription("ใส่ ID ของข้อความที่ต้องการให้คนกดรับยศ")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("อีโมจิที่จะใช้")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("เลือกยศที่จะมอบให้เมื่อกดอีโมจิ")
        .setRequired(true)
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString("message_id");
    const emoji = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");
    const channel = interaction.channel;

    const filePath = path.join(__dirname, "../../reactionRoles.json");

    // โหลด reactionRoles.json
    let reactionRoles = {};
    if (fs.existsSync(filePath)) {
      reactionRoles = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    if (!reactionRoles[messageId]) reactionRoles[messageId] = {};
    reactionRoles[messageId][emoji] = { role: role.id };

    fs.writeFileSync(filePath, JSON.stringify(reactionRoles, null, 2));

    // ดึงข้อความ
    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) {
      return interaction.reply({
        content: "❌ ไม่พบข้อความตาม Message ID ที่ระบุ",
        ephemeral: true,
      });
    }

    // react emoji ให้ข้อความ
    try {
      await message.react(emoji);
    } catch (err) {
      console.error("⚠️ ไม่สามารถ react emoji ได้:", err);
      return interaction.reply({
        content: "❌ ไม่สามารถ react อีโมจิได้ ตรวจสอบว่า emoji ใช้ได้หรือไม่",
        ephemeral: true,
      });
    }

    // ตอบกลับยืนยัน
    await interaction.reply({
      content: `✨ บันทึก Reaction Role สำเร็จ!\n📩 ข้อความ: ${messageId}\n😀 อีโมจิ: ${emoji}\n🎖️ ยศ: ${role}`,
      ephemeral: true,
    });
  },
};
