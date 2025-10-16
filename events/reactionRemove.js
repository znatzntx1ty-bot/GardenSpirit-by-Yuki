const fs = require("fs");
const filePath = "./reactionRoles.json";

module.exports = {
  name: "messageReactionRemove",
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
    const roleId = emojiData.role;

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        console.log(`❎ Removed role ${roleId} from ${user.tag}`);
      }
    } catch (err) {
      console.error("Error removing role:", err);
    }
  },
};
