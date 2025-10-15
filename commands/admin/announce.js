const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("📢 ส่งประกาศขั้นโปร พร้อมปุ่มลิงก์ / รูป / สี / โลโก้เซิร์ฟ")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("ห้องที่ต้องการประกาศ")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("หัวข้อ")
        .setDescription("หัวข้อของประกาศ")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("ข้อความ")
        .setDescription("เนื้อหาประกาศหลัก")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("รายละเอียดเสริม")
        .setDescription("ข้อมูลเพิ่มเติม จะอยู่เป็น field แยก")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("ลิงก์ปุ่ม")
        .setDescription("ใส่ URL ถ้าต้องการให้มีปุ่ม (https://...)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("ชื่อปุ่ม")
        .setDescription("ข้อความบนปุ่ม เช่น ดูเพิ่มเติม / Join Now")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("รูปภาพหรือgif")
        .setDescription("ลิงก์รูปหรือ GIF (https://...)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("สี")
        .setDescription("สี Embed (Red, Blue, #ff66cc)")
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName("ใส่โลโก้เซิร์ฟไหม")
        .setDescription("เลือกว่าจะใส่โลโก้เซิร์ฟไหม")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const title = interaction.options.getString("หัวข้อ");
    const content = interaction.options.getString("ข้อความ");
    const details = interaction.options.getString("รายละเอียดเสริม");
    const imageUrl = interaction.options.getString("รูปภาพหรือgif");
    const colorInput = interaction.options.getString("สี") || "#f7c6ff";
    const showThumbnail = interaction.options.getBoolean("ใส่โลโก้เซิร์ฟไหม");
    const buttonUrl = interaction.options.getString("ลิงก์ปุ่ม");
    const buttonLabel = interaction.options.getString("ชื่อปุ่ม") || "🔗 ดูรายละเอียด";

    const embed = new EmbedBuilder()
      .setColor(colorInput)
      .setTitle(`🌸 ${title}`)
      .setDescription(content)
      .setFooter({
        text: `ประกาศโดย ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (details) {
      embed.addFields({ name: "รายละเอียดเพิ่มเติม", value: details });
    }

    if (imageUrl) embed.setImage(imageUrl);
    if (showThumbnail) embed.setThumbnail(interaction.guild.iconURL({ dynamic: true }));

    const components = [];
    if (buttonUrl) {
      const button = new ButtonBuilder()
        .setLabel(buttonLabel)
        .setURL(buttonUrl)
        .setStyle(ButtonStyle.Link);
      components.push(new ActionRowBuilder().addComponents(button));
    }

    await channel.send({ embeds: [embed], components });
    await interaction.reply({ content: `✅ ส่งประกาศสำเร็จที่ ${channel}`, ephemeral: true });
  },
};
