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
  registerCommands();
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "Error executing command.", flags: 64 });
      }
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "embedModal") {
    try {
      const title = interaction.fields.getTextInputValue("embedTitle");
      const description = interaction.fields.getTextInputValue("embedDesc");
      const image = interaction.fields.getTextInputValue("embedImage");
      const thumb = interaction.fields.getTextInputValue("embedThumb");
      const color = interaction.fields.getTextInputValue("embedColor") || "#3498db";

      // Validation
      if (color && !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
        return await interaction.reply({ content: "Invalid hex color format.", flags: 64 });
      }
      if (image && !image.startsWith("http")) {
        return await interaction.reply({ content: "Image URL must start with http/https.", flags: 64 });
      }
      if (thumb && !thumb.startsWith("http")) {
        return await interaction.reply({ content: "Thumbnail URL must start with http/https.", flags: 64 });
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: "Made By Kai" });

      if (image) embed.setImage(image);
      if (thumb) embed.setThumbnail(thumb);

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Embed creation failed:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Something went wrong while creating the embed.", flags: 64 });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

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
    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error("Slash command registration failed:", err);
  }
}
