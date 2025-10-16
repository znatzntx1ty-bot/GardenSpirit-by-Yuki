const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../reactionRoles.json");

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return;

    console.log(`🌀 ReactionAdd detected: ${reaction.emoji.name} by ${user.tag}`);

    if (!fs.existsSync(filePath)) {
      console.log("⚠️ reactionRoles.json not found!");
      return;
    }

    const data = JSON.parse(fs.readFileSync(filePath));
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const messageData = data[reaction.message.id];
    if (!messageData) return;

    const emojiConfig = messageData[reaction.emoji.name];
    if (!emojiConfig) return;

    const { role, remove } = emojiConfig;

    // 🔸 ลบยศที่ระบุใน remove[]
    for (const r of remove) {
      if (member.roles.cache.has(r)) {
        await member.roles.remove(r);
        console.log(`🧹 Removed role ${r} from ${user.tag}`);
      }
    }

    // ✅ เพิ่มยศใหม่
    await member.roles.add(role);
    console.log(`✅ Added role ${role} to ${user.tag}`);
  },
};
