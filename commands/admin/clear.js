const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🧹 ลบข้อความจำนวนที่ต้องการ")
    .addIntegerOption(opt =>
      opt.setName("amount").setDescription("จำนวนข้อความที่จะลบ (1-100)").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100)
      return interaction.reply({ content: "⚠️ ใส่จำนวนระหว่าง 1 ถึง 100 เท่านั้น!", ephemeral: true });

    await interaction.channel.bulkDelete(amount, true).catch(err => {
      console.error(err);
      return interaction.reply({ content: "❌ ไม่สามารถลบข้อความได้ (อาจเกิน 14 วัน)", ephemeral: true });
    });

    await interaction.reply({ content: `✅ ลบข้อความ ${amount} ข้อความเรียบร้อยแล้ว!`, ephemeral: true });
  }
};
