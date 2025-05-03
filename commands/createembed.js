const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createembed")
    .setDescription("Create a custom embed"),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("embedModal")
      .setTitle("Create Custom Embed");

    const input1 = new TextInputBuilder()
      .setCustomId("embedTitle")
      .setLabel("Title")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const input2 = new TextInputBuilder()
      .setCustomId("embedDesc")
      .setLabel("Description")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const input3 = new TextInputBuilder()
      .setCustomId("embedImage")
      .setLabel("Image URL (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const input4 = new TextInputBuilder()
      .setCustomId("embedThumb")
      .setLabel("Thumbnail URL (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const input5 = new TextInputBuilder()
      .setCustomId("embedFooter")
      .setLabel("Footer Text (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const row1 = new ActionRowBuilder().addComponents(input1);
    const row2 = new ActionRowBuilder().addComponents(input2);
    const row3 = new ActionRowBuilder().addComponents(input3);
    const row4 = new ActionRowBuilder().addComponents(input4);
    const row5 = new ActionRowBuilder().addComponents(input5);

    await interaction.showModal(modal.addComponents(row1, row2, row3, row4, row5));
  }
};
