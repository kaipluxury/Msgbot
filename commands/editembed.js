const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editembed")
    .setDescription("Edit a previously sent embed")
    .addStringOption(option =>
      option.setName("message_id").setDescription("ID of the message to edit").setRequired(true))
    .addStringOption(option =>
      option.setName("new_title").setDescription("New title for the embed").setRequired(true))
    .addStringOption(option =>
      option.setName("new_desc").setDescription("New description").setRequired(true))
    .addStringOption(option =>
      option.setName("new_color").setDescription("HEX color like #e74c3c").setRequired(false)),
    
  async execute(interaction) {
    const messageId = interaction.options.getString("message_id");
    const newTitle = interaction.options.getString("new_title");
    const newDesc = interaction.options.getString("new_desc");
    const newColor = interaction.options.getString("new_color") || "#3498db";

    try {
      const msg = await interaction.channel.messages.fetch(messageId);
      const editedEmbed = new EmbedBuilder()
        .setTitle(newTitle)
        .setDescription(newDesc)
        .setColor(newColor)
        .setTimestamp();

      await msg.edit({ embeds: [editedEmbed] });
      await interaction.reply({ content: "Embed updated successfully.", ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "Failed to edit message. Make sure the ID is correct.", ephemeral: true });
    }
  }
};
