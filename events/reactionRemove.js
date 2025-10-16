const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch().catch(() => null);

    const emoji = reaction.emoji.name;
    const message = reaction.message;
    const guild = message.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const roleMap = {
      "🎮": "1427109467530465313",
      "💫": "1426980018419925072",
      "🌸": "1426979381233848320",
    };

    const roleId = roleMap[emoji];
    if (!roleId) return;

    try {
      await member.roles.remove(roleId);
      console.log(`❎ Removed role ${roleId} from ${user.tag}`);
    } catch (err) {
      console.error("Error removing role:", err);
    }
  },
};
