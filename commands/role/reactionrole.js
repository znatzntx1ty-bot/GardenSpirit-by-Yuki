const { Events } = require("discord.js");
const config = require("../config.json");

module.exports = (client) => {
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();

    // จำกัดให้ทำงานเฉพาะช่องที่กำหนด (ถ้ามี)
    if (config.allowedChannelId && reaction.message.channel.id !== config.allowedChannelId) return;

    const emojiKey = reaction.emoji.id
      ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
      : reaction.emoji.name;

    const roleId = config.reactionRoles[emojiKey];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);

    // 🔁 ลบยศเก่าก่อน
    for (const id of Object.values(config.reactionRoles)) {
      if (member.roles.cache.has(id)) await member.roles.remove(id);
    }

    await member.roles.add(roleId);
    console.log(`${member.user.tag} รับยศใหม่`);
  });

  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();

    const emojiKey = reaction.emoji.id
      ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
      : reaction.emoji.name;

    const roleId = config.reactionRoles[emojiKey];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.remove(roleId);
    console.log(`${member.user.tag} ลบยศออก`);
  });
};
