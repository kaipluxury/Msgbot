const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createembed")
    .setDescription("Create a custom embed"),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("embedModal")
      .setTitle("Create Custom Embed");

    const inputs = [
      ["embedTitle", "Title", TextInputStyle.Short],
      ["embedDesc", "Description", TextInputStyle.Paragraph],
      ["embedImage", "Image URL (optional)", TextInputStyle.Short],
      ["embedThumb", "Thumbnail URL (optional)", TextInputStyle.Short],
      ["embedColor", "Hex Color (e.g. #ff0000)", TextInputStyle.Short]
    ].map(([id, label, style]) =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(id)
          .setLabel(label)
          .setStyle(style)
          .setRequired(false)
      )
    );

    await interaction.showModal(modal.addComponents(...inputs));
  }
};
