// ===== ASTRA BOT | INDEX PRINCIPAL =====
const http = require("http");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

// ===== LOG DE ARRANQUE =====
console.log("🚀 Iniciando Astra...");

// ===== SERVIDOR WEB (Render / UptimeRobot) =====
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.write("Astra Bot está activo.");
  res.end();
}).listen(PORT, () => {
  console.log(`🌐 Servidor web escuchando en puerto ${PORT}`);
});

// ===== CLIENTE DISCORD =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ===== VERIFICAR TOKEN =====
console.log("🔑 TOKEN existe:", !!process.env.TOKEN);

// ===== ARCHIVO DE DATOS =====
const DATA_FILE = "data.json";
let data = { usuarios: {}, casas: {} };

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log("📝 data.json creado");
} else {
  data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  console.log("📂 data.json cargado");
}

function guardarDatos() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== CONFIGURACIÓN DEL ROL =====
const casas = [
  "﹒♡﹒Casa Alteira﹒★",
  "﹒ ＋﹒Casa Viperthon ﹕✧",
  "﹒ᶻz﹒Casa Nocturnis﹒✿",
  "﹑♡﹒Casa Valoryon﹒⌒"
];

const afinidades = [
  "Fuego 🔥", "Agua 🌊", "Aire 🌪️", "Tierra 🌿", "Luz ✨", "Oscuridad 🌑"
];

const misiones = [
  { texto: "Practica un hechizo básico", xp: 20 },
  { texto: "Explora una zona mágica", xp: 25 },
  { texto: "Ayuda a otro estudiante", xp: 15 },
  { texto: "Recolecta ingredientes mágicos", xp: 20 },
  { texto: "Investiga un objeto extraño", xp: 30 },
  { texto: "Protege una zona encantada", xp: 35 }
];

// ===== READY =====
client.once("ready", async () => {
  console.log(`✨ Astra conectada como ${client.user.tag}`);

  const commands = [
    {
      name: "registrar_oc",
      description: "Registra tu personaje",
      options: [
        { name: "nombre", description: "Nombre del OC", type: 3, required: true },
        { name: "personalidad", description: "Personalidad", type: 3, required: true }
      ]
    },
    { name: "perfil", description: "Ver tu perfil" },
    { name: "mision", description: "Recibir una misión" },
    { name: "completar", description: "Completar tu misión" }
  ];

  await client.application.commands.set(commands);
  console.log("✅ Comandos registrados");
});

// ===== INTERACCIONES =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;

  // REGISTRAR OC
  if (interaction.commandName === "registrar_oc") {
    const nombre = interaction.options.getString("nombre");
    const personalidad = interaction.options.getString("personalidad");

    const casa = casas[Math.floor(Math.random() * casas.length)];
    const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)];

    data.usuarios[userId] = {
      nombre,
      personalidad,
      casa,
      afinidad,
      xp: 0,
      mision: null
    };

    guardarDatos();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Destino sellado")
          .setDescription(`**${nombre}** ha sido asignado a **${casa}**\nAfinidad: ${afinidad}`)
          .setColor(0x6a5acd)
      ]
    });
  }

  // PERFIL
  if (interaction.commandName === "perfil") {
    const u = data.usuarios[userId];
    if (!u) return interaction.reply("⛔ No estás registrado");

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🔮 Perfil de ${u.nombre}`)
          .setDescription(
            `🏛️ Casa: ${u.casa}\n` +
            `✨ Afinidad: ${u.afinidad}\n` +
            `📈 XP: ${u.xp}`
          )
          .setColor(0x5865f2)
      ]
    });
  }

  // MISION
  if (interaction.commandName === "mision") {
    const u = data.usuarios[userId];
    if (!u) return interaction.reply("⛔ Regístrate primero");
    if (u.mision) return interaction.reply("📜 Ya tienes una misión activa");

    const m = misiones[Math.floor(Math.random() * misiones.length)];
    u.mision = m;
    guardarDatos();

    return interaction.reply(`📜 Tu misión: **${m.texto}** (+${m.xp} XP)`);
  }

  // COMPLETAR
  if (interaction.commandName === "completar") {
    const u = data.usuarios[userId];
    if (!u || !u.mision) return interaction.reply("⛔ No tienes misión activa");

    u.xp += u.mision.xp;
    u.mision = null;
    guardarDatos();

    return interaction.reply("✅ Misión completada, has ganado XP");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN)
  .then(() => console.log("🟢 Login exitoso"))
  .catch(err => {
    console.error("❌ Error al conectar:");
    console.error(err.message);
  });