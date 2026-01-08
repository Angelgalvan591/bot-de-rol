const http = require('http');
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

console.log("🚀 Iniciando proceso de arranque...");

// ===== 1. SERVIDOR WEB (PRIMERO PARA RENDER) =====
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.write("Astra Bot está funcionando correctamente.");
  res.end();
}).listen(port, () => {
  console.log(`✅ Servidor web activo en el puerto ${port}`);
});

// ===== 2. CLIENTE CON INTENTS COMPLETOS =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== 3. MANEJO DE BASE DE DATOS LOCAL =====
const DATA_FILE = "data.json";
let data = { usuarios: {}, casas: {} };

try {
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    console.log("📂 Datos cargados correctamente.");
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    console.log("📝 Archivo data.json creado.");
  }
} catch (e) {
  console.error("⚠️ Error con data.json, se usará memoria temporal.");
}

function guardarDatos() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("❌ Error al guardar datos.");
  }
}

// ===== 4. CONFIGURACIÓN DEL ROL (Casas, Misiones, etc.) =====
const casas = ["﹒♡﹒Casa Alteira﹒★", "﹒ ＋﹒Casa Viperthon ﹕✧", "﹒ᶻz﹒Casa Nocturnis﹒✿", "﹑♡﹒Casa Valoryon﹒⌒"];
const afinidades = ["Fuego 🔥", "Agua 🌊", "Aire 🌪️", "Tierra 🌿", "Luz ✨", "Oscuridad 🌑"];
const misiones = [
  { texto: "Practica un hechizo básico", xp: 20 },
  { texto: "Explora una zona mágica", xp: 25 },
  { texto: "Ayuda a otro estudiante", xp: 15 }
];
// ... (puedes añadir el resto de tus misiones aquí)

// ===== 5. EVENTO READY =====
client.once("ready", async () => {
  console.log(`✨ EXITO: Astra activa como ${client.user.tag}`);
  
  const commands = [
    { name: 'registrar_oc', description: 'Registra tu personaje', options: [
        { name: 'nombre', description: 'Nombre', type: 3, required: true },
        { name: 'personalidad', description: 'Personalidad', type: 3, required: true }
    ]},
    { name: 'perfil', description: 'Mira tu perfil' },
    { name: 'mision', description: 'Pide una misión' }
  ];

  try {
    await client.application.commands.set(commands);
    console.log("✅ Comandos de barra (/) actualizados.");
  } catch (error) {
    console.error("❌ Error en comandos:", error);
  }
});

// ===== 6. LÓGICA DE INTERACCIONES (REGISTRAR, PERFIL, MISION) =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "registrar_oc") {
    const nombre = interaction.options.getString("nombre");
    const personalidad = interaction.options.getString("personalidad");
    const casa = casas[Math.floor(Math.random() * casas.length)];
    const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)];

    data.usuarios[interaction.user.id] = { nombre, personalidad, casa, afinidad, nivel: 1, xp: 0 };
    guardarDatos();

    return interaction.reply({ embeds: [new EmbedBuilder().setTitle("📜 Destino sellado").setDescription(`**${nombre}** ha sido asignado a **${casa}**`).setColor(0x6a5acd)] });
  }

  if (interaction.commandName === "perfil") {
    const u = data.usuarios[interaction.user.id];
    if (!u) return interaction.reply("⛔ No estás registrado.");
    return interaction.reply(`🔮 **Perfil de ${u.nombre}**\n🏛️ Casa: ${u.casa}\n✨ Nivel: ${u.nivel}`);
  }
});

// ===== 7. LOGIN CON CONTROL DE ERRORES =====
console.log("🔑 Intentando conectar a Discord...");
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ ERROR CRÍTICO EN LOGIN:");
  console.error(err.message);
  if (err.message.includes("Privileged intent")) {
    console.error("👉 SOLUCIÓN: Activa los 3 'Intents' en el Discord Developer Portal.");
  }
});