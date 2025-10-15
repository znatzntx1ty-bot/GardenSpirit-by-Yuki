const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("🎭 สร้างข้อความสำหรับกดอีโมจิรับยศ"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#ffd166")
      .setTitle("🎮 รับยศเกมของคุณได้ที่นี่!")
      .setDescription(
        "เลือกเกมที่คุณเล่นบ่อยโดยการกดอีโมจิ 👇\n\n" +
        "🎮 - **Free Fire**\n" +
        "⚔️ - **ROV**\n" +
        "🧩 - **Roblox**\n\n" +
        "*(สามารถเลือกได้เพียง 1 เกมเท่านั้น)*"
      )
      .setFooter({ text: "GardenSpirit • Reaction Roles" })
      .setTimestamp();

    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    // เพิ่มอีโมจิให้กับข้อความ
    await message.react("🎮");
    await message.react("⚔️");
    await message.react("🧩");
  },
};
