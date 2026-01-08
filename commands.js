const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("registrar_oc")
    .setDescription("Registra tu OC creado en Gacha")
    .addStringOption(o =>
      o.setName("nombre")
        .setDescription("Nombre del OC")
        .setRequired(true))
    .addStringOption(o =>
      o.setName("personalidad")
        .setDescription("Describe la personalidad del OC")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("mision")
    .setDescription("Obtén una misión"),

  new SlashCommandBuilder()
    .setName("completar")
    .setDescription("Completa tu misión actual"),

  new SlashCommandBuilder()
    .setName("spin")
    .setDescription("Spin mágico diario")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Slash commands registrados");
})();
