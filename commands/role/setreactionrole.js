const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setreactionrole')
    .setDescription('🎮 ตั้งค่า Reaction Role ด้วยตนเอง')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('🆔 ID ของข้อความที่ต้องการใช้')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('😄 อีโมจิที่จะใช้')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('🏷 ยศที่จะให้เมื่อกด')
        .setRequired(true)),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');
    const channel = interaction.channel;

    try {
      const message = await channel.messages.fetch(messageId);
      await message.react(emoji);

      // บันทึกลงไฟล์ JSON
      const fs = require('fs');
      const filePath = './reactionRoles.json';
      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath));
      }

      // เก็บข้อมูล Reaction Role
      data[messageId] = data[messageId] || {};
      data[messageId][emoji] = role.id;

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      await interaction.reply({ content: `✅ ตั้งค่า Reaction Role สำเร็จ!\nข้อความ: \`${messageId}\`\nอีโมจิ: ${emoji}\nยศ: ${role}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ ไม่พบข้อความหรือเกิดข้อผิดพลาด!', ephemeral: true });
    }
  },
};
