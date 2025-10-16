const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { exec } = require("child_process");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("♻️ รีโหลดและอัปเดตคำสั่งทั้งหมด (เฉพาะแอดมิน)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply({ content: "🔄 กำลังรีโหลดและอัปเดตคำสั่งทั้งหมด...", ephemeral: true });

    try {
      // โหลดคำสั่งทั้งหมดใหม่
      const commandFolders = fs.readdirSync("./commands");
      interaction.client.commands.clear();

      for (const folder of commandFolders) {
        const commandFiles = fs
          .readdirSync(`./commands/${folder}`)
          .filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
          delete require.cache[require.resolve(`../../commands/${folder}/${file}`)];
          const command = require(`../../commands/${folder}/${file}`);
          interaction.client.commands.set(command.data.name, command);
        }
      }

      // ✅ รัน deploy-commands.js เพื่ออัปเดต slash command กับ Discord
      exec("node deploy-commands.js", (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          return interaction.followUp({ content: `❌ เกิดข้อผิดพลาดตอนอัปเดตคำสั่ง:\n\`\`\`${error.message}\`\`\``, ephemeral: true });
        }

        console.log(stdout);
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ รีโหลดและอัปเดตคำสั่งทั้งหมดสำเร็จแล้ว!")
          .setDescription("คำสั่งทั้งหมดถูกรีโหลดและอัปเดตใน Discord เรียบร้อยแล้ว 🎉")
          .setTimestamp();

        interaction.followUp({ embeds: [embed], ephemeral: false });
      });

    } catch (err) {
      console.error(err);
      await interaction.followUp({
        content: `⚠️ เกิดข้อผิดพลาดในการรีโหลด:\n\`\`\`${err.message}\`\`\``,
        ephemeral: true,
      });
    }
  },
};
