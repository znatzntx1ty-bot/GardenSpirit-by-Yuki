const fs = require("fs");
const filePath = "./reactionRoles.json";

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return;
    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath));
    const messageId = reaction.message.id;
    const emoji = reaction.emoji.name;
    const messageData = data[messageId];
    if (!messageData) return;

    const emojiData = messageData[emoji];
    if (!emojiData) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const { role, remove } = emojiData;

    try {
      for (const r of remove || []) {
        if (member.roles.cache.has(r)) await member.roles.remove(r);
      }
      await member.roles.add(role);
      console.log(`✅ Added role ${role} to ${user.tag}`);
    } catch (err) {
      console.error("Error adding role:", err);
    }
  },
};
