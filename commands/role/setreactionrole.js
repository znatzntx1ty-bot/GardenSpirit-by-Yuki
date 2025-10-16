const fs = require("fs");
const path = require("path");

module.exports = {
  name: "setreactionrole",
  description: "🕹️ ตั้งค่า Reaction Role ด้วยตัวเอง",
  options: [
    {
      name: "message_id",
      description: "ใส่ ID ของข้อความที่ต้องการให้กดอีโมจิรับยศ",
      type: 3,
      required: true,
    },
    {
      name: "emoji",
      description: "อีโมจิที่จะใช้",
      type: 3,
      required: true,
    },
    {
      name: "role",
      description: "ยศที่จะให้เมื่อกดอีโมจิ",
      type: 8, // Role
      required: true,
    },
  ],

  async execute(interaction) {
    const messageId = interaction.options.getString("message_id");
    const emoji = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const channel = interaction.channel;
    const filePath = path.join(__dirname, "../../reactionRoles.json");

    // โหลดไฟล์ reactionRoles.json
    let reactionRoles = {};
    if (fs.existsSync(filePath)) {
      reactionRoles = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    if (!reactionRoles[messageId]) {
      reactionRoles[messageId] = {};
    }

    reactionRoles[messageId][emoji] = { role: role.id };

    // เขียนกลับไปที่ไฟล์ JSON
    fs.writeFileSync(filePath, JSON.stringify(reactionRoles, null, 2));

    // ดึงข้อความเป้าหมาย
    const message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
      return interaction.reply({
        content: "❌ ไม่พบข้อความตาม Message ID ที่ระบุ",
        ephemeral: true,
      });
    }

    // ✅ บอท react อีโมจิให้อัตโนมัติ
    try {
      await message.react(emoji);
    } catch (err) {
      console.error("⚠️ ไม่สามารถ react emoji ได้:", err);
      return interaction.reply({
        content: "❌ บอทไม่สามารถ react อีโมจินี้ได้ ตรวจสอบว่า emoji ใช้ได้หรือไม่",
        ephemeral: true,
      });
    }

    // ✅ ตอบกลับว่าสำเร็จ
    await interaction.reply({
      content: `✅ **บันทึก Reaction Role สำเร็จ!**\n\n📩 ข้อความ: ${messageId}\n${emoji} อีโมจิ: ${emoji}\n🎖️ ยศ: ${role}`,
      ephemeral: true,
    });
  },
};
