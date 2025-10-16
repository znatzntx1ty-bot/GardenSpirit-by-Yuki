const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../reactionRoles.json");

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return;

    console.log(`🌀 ReactionAdd detected: ${reaction.emoji.name || reaction.emoji.id} by ${user.tag}`);

    if (!fs.existsSync(filePath)) return;

    const data = JSON.parse(fs.readFileSync(filePath));
    const guild = reaction.message.guild;
    const guildData = data[guild.id];
    if (!guildData) {
      console.log(`⚠️ No config for guild ${guild.id}`);
      return;
    }

    const messageData = guildData[reaction.message.id];
    if (!messageData) {
      console.log(`⚠️ No config for message ${reaction.message.id}`);
      return;
    }

    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const emojiConfig = messageData[emojiKey];
    if (!emojiConfig) {
      console.log(`⚠️ No config for emoji ${emojiKey}`);
      return;
    }

    const member = await guild.members.fetch(user.id);
    const { role, remove } = emojiConfig;

    for (const r of remove) {
      if (member.roles.cache.has(r)) await member.roles.remove(r);
    }

    await member.roles.add(role);
    console.log(`✅ Added role ${role} to ${user.tag}`);
  },
};
