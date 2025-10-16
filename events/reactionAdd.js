const { Events } = require("discord.js");

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return;

    // ✅ ตรวจว่าข้อมูล reaction ไม่สมบูรณ์ ต้อง fetch เพิ่ม
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        console.error("❌ Failed to fetch partial reaction:", err);
        return;
      }
    }

    const emoji = reaction.emoji.name;
    const message = reaction.message;
    const guild = message.guild;

    // ✅ ตรวจว่ามี guild และ member จริง
    if (!guild) return;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    // ✅ ตั้งค่า emoji-Role mapping
    const roleMap = {
      "🕹️": "1427109467530465313", // ตัวอย่าง role
      "🎮": "1426980018419925072",
      "🐉": "1426979381233848320",
    };

    const roleId = roleMap[emoji];
    if (!roleId) return;

    try {
      await member.roles.add(roleId);
      console.log(`✅ Added role ${roleId} to ${user.tag}`);
    } catch (err) {
      console.error("⚠️ Error adding role:", err);
    }
  },
};
