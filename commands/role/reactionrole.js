const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const filePath = "./reactionRoles.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("🎮 ตั้งค่า Reaction Role อัตโนมัติ")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName("messageid").setDescription("ใส่ ID ข้อความ").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("emoji").setDescription("ใส่ชื่ออีโมจิ (เช่น ⭐ หรือชื่อ custom emoji)").setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role").setDescription("เลือกยศที่จะให้เมื่อกด").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("remove").setDescription("ใส่ role ID ที่ต้องลบ (ถ้ามีหลายอันให้คั่นด้วย , )")
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");
    const emoji = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");
    const removeRaw = interaction.options.getString("remove");
    const remove = removeRaw ? removeRaw.split(",").map(r => r.trim()) : [];

    let data = {};
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath));
    }

    if (!data[messageId]) data[messageId] = {};
    data[messageId][emoji] = { role: role.id, remove };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    await interaction.reply({
      content: `✅ บันทึก Reaction Role สำเร็จ!\n📩 ข้อความ: ${messageId}\n😀 อีโมจิ: ${emoji}\n🎖 ยศ: ${role.name}`,
      ephemeral: true,
    });
  },
};
