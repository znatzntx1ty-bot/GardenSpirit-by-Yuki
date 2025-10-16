const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    console.log(`🌀 ReactionRemove detected: ${reaction.emoji.name} by ${user.tag}`);

    const { message, emoji } = reaction;
    const guild = message.guild;
    if (!guild) return;

    const roleMap = {
      "🎮": "1426979381233848320", // ตัวอย่าง
      "⚔️": "142697971929071626",
      "😎": "1426980018419925072",
    };

    const roleId = roleMap[emoji.name];
    if (!roleId) return;

    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(roleId);
    if (role && member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      console.log(`🧹 Removed role ${role.name} from ${member.user.tag}`);
    }
  },
};
