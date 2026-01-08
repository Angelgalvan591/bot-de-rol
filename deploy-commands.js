require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("registrar_oc")
    .setDescription("Registra tu OC y asigna tu casa")
    .addStringOption(opt =>
      opt.setName("nombre")
        .setDescription("Nombre de tu OC")
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName("personalidad")
        .setDescription("Describe la personalidad")
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Muestra tu perfil astral"),

  new SlashCommandBuilder()
    .setName("mision")
    .setDescription("Recibe una misión"),

  new SlashCommandBuilder()
    .setName("completar")
    .setDescription("Completa tu misión actual"),

  new SlashCommandBuilder()
    .setName("spin")
    .setDescription("Gira el destino una vez al día"),

  new SlashCommandBuilder()
    .setName("ranking_casas")
    .setDescription("Muestra el ranking de casas"),

  new SlashCommandBuilder()
    .setName("lore")
    .setDescription("Consulta el conocimiento desbloqueado")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("⏳ Registrando comandos slash...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Comandos registrados correctamente");
  } catch (error) {
    console.error(error);
  }
})();
