const {
  Client,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  Events,
  Collection
} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

// Keep-alive server for Railway
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("✅ Keep-alive server on port 3000"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "Error executing command", ephemeral: true });
      }
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "embedModal") {
    const title = interaction.fields.getTextInputValue("embedTitle");
    const description = interaction.fields.getTextInputValue("embedDesc");
    const image = interaction.fields.getTextInputValue("embedImage");
    const thumb = interaction.fields.getTextInputValue("embedThumb");
    const footer = interaction.fields.getTextInputValue("embedFooter");
    const color = interaction.fields.getTextInputValue("embedColor") || "#3498db";

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (image) embed.setImage(image);
    if (thumb) embed.setThumbnail(thumb);
    if (footer) embed.setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
