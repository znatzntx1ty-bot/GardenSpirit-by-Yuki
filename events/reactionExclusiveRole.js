const fs = require('fs');
const filePath = './reactionRoles.json';

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (user.bot) return;

    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath));
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const messageData = data[reaction.message.id];

    if (!messageData) return;

    const emojiConfig = messageData[reaction.emoji.name];
    if (!emojiConfig) return;

    const { role, remove } = emojiConfig;

    // ลบยศที่ระบุใน remove[]
    for (const r of remove) {
      if (member.roles.cache.has(r)) {
        await member.roles.remove(r);
      }
    }

    // เพิ่มยศใหม่
    await member.roles.add(role);
  },
};
