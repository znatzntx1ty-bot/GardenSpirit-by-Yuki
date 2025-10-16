const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const filePath = './reactionRoles.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setreactionrole')
    .setDescription('🎮 ตั้งค่า Reaction Role ด้วยตัวเอง')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('🆔 ID ของข้อความที่ต้องการให้ React')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('😄 อีโมจิที่ใช้')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('🏷 ยศที่จะให้เมื่อกดอีโมจิ')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('removeroles')
        .setDescription('🧹 ยศที่ต้องการลบออก (คั่นด้วย ,)')
        .setRequired(false)),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');
    const removeroles = interaction.options.getString('removeroles');
    const channel = interaction.channel;

    try {
      const message = await channel.messages.fetch(messageId);
      await message.react(emoji);

      let data = {};
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath));
      }

      // บันทึกข้อมูล Reaction Role
      data[messageId] = data[messageId] || {};
      data[messageId][emoji] = {
        role: role.id,
        remove: removeroles ? removeroles.split(',').map(r => r.replace(/[<@&>]/g, '').trim()) : []
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      await interaction.reply({
        content: `✅ ตั้งค่า Reaction Role สำเร็จ!\n📨 ข้อความ: \`${messageId}\`\n😄 อีโมจิ: ${emoji}\n🏷 ยศ: ${role}\n🧹 ลบยศ: ${removeroles || 'ไม่มี'}`,
        ephemeral: true
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ ไม่พบข้อความหรือเกิดข้อผิดพลาด!', ephemeral: true });
    }
  },
};
