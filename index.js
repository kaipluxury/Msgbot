const {
  Client,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  Events,
  Collection,
  REST,
  Routes
} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

// Keep-alive server for Render / Railway
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
  registerCommands(); // Auto-register slash commands
});

client.on(Events.InteractionCreate, async interaction => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("Command execution failed:", error);
        await interaction.reply({ content: "Error executing command", ephemeral: true });
      }
    }
  }

  // Handle modal submission
  if (interaction.isModalSubmit() && interaction.customId === "embedModal") {
    try {
      const title = interaction.fields.getTextInputValue("embedTitle");
      const description = interaction.fields.getTextInputValue("embedDesc");
      const image = interaction.fields.getTextInputValue("embedImage");
      const thumb = interaction.fields.getTextInputValue("embedThumb");
      const footer = interaction.fields.getTextInputValue("embedFooter");
      const color = interaction.fields.getTextInputValue("embedColor") || "#3498db";

      // Validate length
      const totalLength = (title?.length || 0) + (description?.length || 0) + (footer?.length || 0);
      if (totalLength > 5900) {
        return await interaction.reply({
          content: "Embed too long. Reduce title, description, or footer.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

      if (image) embed.setImage(image);
      if (thumb) embed.setThumbnail(thumb);
      if (footer) embed.setFooter({ text: footer });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Embed creation failed:", err);
      await interaction.reply({
        content: "Something went wrong while creating the embed.",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// Register slash commands on startup
async function registerCommands() {
  const commands = [];
  const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered successfully.");
  } catch (err) {
    console.error("Slash command registration failed:", err);
  }
}
