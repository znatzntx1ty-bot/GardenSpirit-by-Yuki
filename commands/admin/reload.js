const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("🔄 โหลดคำสั่งใหม่โดยไม่ต้องรีสตาร์ทบอท")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("command")
        .setDescription("ชื่อคำสั่งที่ต้องการรีโหลด (เว้นว่างไว้เพื่อรีโหลดทั้งหมด)")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const commandName = interaction.options.getString("command");
    const commandsPath = path.join(__dirname, "..");

    try {
      if (commandName) {
        // รีโหลดเฉพาะคำสั่งเดียว
        let found = false;

        for (const folder of fs.readdirSync(commandsPath)) {
          const folderPath = path.join(commandsPath, folder);
          for (const file of fs.readdirSync(folderPath)) {
            const filePath = path.join(folderPath, file);
            if (file === `${commandName}.js`) {
              delete require.cache[require.resolve(filePath)];
              const newCommand = require(filePath);
              interaction.client.commands.set(newCommand.data.name, newCommand);
              found = true;

              const embed = new EmbedBuilder()
                .setColor(0x00ff7f)
                .setTitle("✅ รีโหลดสำเร็จ")
                .setDescription(`โหลดคำสั่ง **/${commandName}** สำเร็จแล้ว!`)
                .setTimestamp();

              return interaction.editReply({ embeds: [embed] });
            }
          }
        }

        if (!found) {
          return interaction.editReply({
            content: `⚠️ ไม่พบคำสั่งชื่อ \`${commandName}\``,
          });
        }
      } else {
        // รีโหลดทั้งหมด
        interaction.client.commands.clear();

        for (const folder of fs.readdirSync(commandsPath)) {
          const folderPath = path.join(commandsPath, folder);
          const commandFiles = fs
            .readdirSync(folderPath)
            .filter(file => file.endsWith(".js"));

          for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            interaction.client.commands.set(command.data.name, command);
          }
        }

        const embed = new EmbedBuilder()
          .setColor(0x00bfff)
          .setTitle("🔁 รีโหลดคำสั่งทั้งหมดสำเร็จ")
          .setDescription("คำสั่งทั้งหมดถูกโหลดใหม่เรียบร้อยแล้ว!")
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        content: `❌ เกิดข้อผิดพลาดในการรีโหลดคำสั่ง: \`${error.message}\``,
      });
    }
  },
};
