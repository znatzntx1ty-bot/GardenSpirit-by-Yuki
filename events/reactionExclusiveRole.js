const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return;
    const { message, emoji } = reaction;
    const guild = message.guild;
    if (!guild) return;

    // ✅ แผนที่อีโมจิ -> Role
    const roleMap = {
      "🎮": "1426979381233848320", // Free Fire
      "⚔️": "1426979771929071626", // ROV
      "🧩": "1426980018419925072", // Roblox
    };

    // ✅ กลุ่มยศที่ให้เลือกได้เพียง 1 เท่านั้น
    const exclusiveRoles = Object.values(roleMap);

    const roleId = roleMap[emoji.name];
    if (!roleId) return; // ถ้า emoji ไม่ตรงกับ map

    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(roleId);
    if (!role) return;

    // 🔥 ลบยศอื่น ๆ ในกลุ่ม exclusiveRoles ก่อน
    for (const r of exclusiveRoles) {
      if (member.roles.cache.has(r) && r !== roleId) {
        await member.roles.remove(r);
        console.log(`❌ Removed old exclusive role from ${member.user.tag}`);
      }
    }

    // ✅ ให้ยศใหม่
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
      console.log(`✅ Gave ${role.name} to ${member.user.tag}`);
    }
  },
};
