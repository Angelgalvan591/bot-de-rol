const http = require('http');
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

// ===== 1. SERVIDOR PARA RENDER & UPTIMEROBOT =====
// Usamos process.env.PORT porque Render lo asigna dinámicamente
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.write("El bot de rol Astra está vivo.");
  res.end();
}).listen(port, () => {
  console.log(`🚀 Servidor web activo en el puerto ${port}`);
});

// ===== 2. CONFIGURACIÓN DEL CLIENTE (INTENTS CORREGIDOS) =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Necesario para leer comandos y mensajes
    GatewayIntentBits.GuildMembers    // Necesario para temas de rol y perfiles
  ]
});

// ===== 3. BASE DE DATOS LOCAL (SOPORTE PARA RENDER) =====
const DATA_FILE = "data.json";
let data = { usuarios: {}, casas: {} };

// Función para cargar datos de forma segura
function cargarDatos() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const contenido = fs.readFileSync(DATA_FILE, "utf8");
      data = JSON.parse(contenido);
    } catch (e) {
      console.error("❌ Error al leer data.json, se usará una base vacía.");
    }
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  }
}

// Guardar datos
function guardarDatos() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

cargarDatos();

// ===== 4. CONFIGURACIÓN DEL ROL =====
const casas = [
  "﹒♡﹒Casa Alteira﹒★",
  "﹒ ＋﹒Casa Viperthon ﹕✧",
  "﹒ᶻz﹒Casa Nocturnis﹒✿",
  "﹑♡﹒Casa Valoryon﹒⌒"
];

const afinidades = [
  "Fuego 🔥", "Agua 🌊", "Aire 🌪️", "Tierra 🌿", "Luz ✨", "Oscuridad 🌑"
];

const titulos = [
  { nivel: 1, nombre: "Aprendiz" },
  { nivel: 5, nombre: "Iniciado" },
  { nivel: 10, nombre: "Adepto" },
  { nivel: 20, nombre: "Maestro" }
];

const misiones = [
  { texto: "Practica un hechizo básico", xp: 20 },
  { texto: "Explora una zona mágica", xp: 25 },
  { texto: "Ayuda a otro estudiante", xp: 15 },
  { texto: "Recolecta ingredientes mágicos", xp: 20 },
  { texto: "Investiga un objeto extraño", xp: 30 },
  { texto: "Protege una zona encantada", xp: 35 },
  { texto: "Derrota a un ser sombra", xp: 40 },
  { texto: "Recupera un artefacto corrompido", xp: 45 }
];

const misionesSecretas = [
  { texto: "Descifra un manuscrito prohibido", xp: 80 },
  { texto: "Adéntrate en una cámara sellada por Astra", xp: 100 },
  { texto: "Invoca un espíritu ancestral", xp: 120 }
];

const spins = [
  { texto: "Objeto común", rareza: "Común", color: 0xaaaaaa },
  { texto: "Mascota mágica", rareza: "Raro", color: 0x4fa3ff },
  { texto: "Hechizo ancestral", rareza: "Épico", color: 0xa855f7 },
  { texto: "Artefacto legendario", rareza: "Legendario", color: 0xffc107 }
];

const lore = [
  "Antes de las casas, existía el Círculo Estelar.",
  "Astra no fue creada, despertó.",
  "La magia responde a quienes perseveran."
];

// ===== 5. FUNCIONES AUXILIARES =====
function xpNecesaria(nivel) { return nivel * 100; }

function obtenerTitulo(nivel) {
  let titulo = "Aprendiz";
  for (const t of titulos) { if (nivel >= t.nivel) titulo = t.nombre; }
  return titulo;
}

// ===== 6. EVENTO READY & REGISTRO DE COMANDOS =====
client.once("ready", async () => {
  console.log(`✨ Astra activa como ${client.user.tag}`);

  const commands = [
    { name: 'registrar_oc', description: 'Registra tu personaje', options: [
        { name: 'nombre', description: 'Nombre del OC', type: 3, required: true },
        { name: 'personalidad', description: 'Personalidad', type: 3, required: true }
    ]},
    { name: 'perfil', description: 'Mira tu perfil de rol' },
    { name: 'mision', description: 'Pide una misión' },
    { name: 'completar', description: 'Completa tu misión actual' },
    { name: 'ranking_casas', description: 'Mira los puntos de las casas' },
    { name: 'spin', description: 'Gira el destino' },
    { name: 'lore', description: 'Lee fragmentos de historia' }
  ];

  try {
    await client.application.commands.set(commands);
    console.log("✅ Comandos registrados globalmente");
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
});

// ===== 7. LÓGICA DE INTERACCIONES =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // REGISTRAR OC
  if (interaction.commandName === "registrar_oc") {
    const nombre = interaction.options.getString("nombre");
    const personalidad = interaction.options.getString("personalidad");
    const casa = casas[Math.floor(Math.random() * casas.length)];
    const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)];

    data.usuarios[interaction.user.id] = {
      nombre, personalidad, casa, afinidad, nivel: 1, xp: 0, mision: null, lore: 0
    };

    guardarDatos();
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle("📜 Destino sellado").setDescription(`**${nombre}** ha sido asignado a **${casa}** con afinidad **${afinidad}**`).setColor(0x6a5acd)] });
  }

  // PERFIL
  if (interaction.commandName === "perfil") {
    const u = data.usuarios[interaction.user.id];
    if (!u) return interaction.reply("⛔ No estás registrado. Usa /registrar_oc");

    return interaction.reply({ embeds: [new EmbedBuilder().setTitle(`🔮 Perfil de ${u.nombre}`).setDescription(`🏛️ Casa: ${u.casa}\n🔮 Afinidad: ${u.afinidad}\n🏅 Título: ${obtenerTitulo(u.nivel)}\n✨ Nivel: ${u.nivel}\n📈 XP: ${u.xp}/${xpNecesaria(u.nivel)}`).setColor(0x5865f2)] });
  }

  // MISION
  if (interaction.commandName === "mision") {
    const u = data.usuarios[interaction.user.id];
    if (!u) return interaction.reply("⛔ Regístrate primero.");

    const pool = Math.random() < 0.15 ? misionesSecretas : misiones;
    u.mision = pool[Math.floor(Math.random() * pool.length)];

    guardarDatos();
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle("📜 Misión asignada").setDescription(`✨ ${u.mision.texto}\n📈 Recompensa: ${u.mision.xp} XP`).setColor(0x3cb371)] });
  }

  // COMPLETAR
  if (interaction.commandName === "completar") {
    const u = data.usuarios[interaction.user.id];
    if (!u || !u.mision) return interaction.reply("⛔ No tienes ninguna misión activa.");

    u.xp += u.mision.xp;
    data.casas[u.casa] = (data.casas[u.casa] || 0) + 5;
    u.mision = null;

    while (u.xp >= xpNecesaria(u.nivel)) {
      u.xp -= xpNecesaria(u.nivel);
      u.nivel++;
      if (u.lore < lore.length) u.lore++;
    }

    guardarDatos();
    return interaction.reply("✅ ¡Misión completada! Has ganado XP y puntos para tu casa.");
  }

  // RANKING
  if (interaction.commandName === "ranking_casas") {
    const orden = Object.entries(data.casas).sort((a, b) => b[1] - a[1]);
    let texto = orden.map((c, i) => `${i + 1}. ${c[0]} — ${c[1]} pts`).join("\n");
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle("🏛️ Ranking de Casas").setDescription(texto || "No hay puntos aún").setColor(0xffc107)] });
  }

  // SPIN
  if (interaction.commandName === "spin") {
    const r = spins[Math.floor(Math.random() * spins.length)];
    return interaction.reply({ embeds: [new EmbedBuilder().setTitle("🎲 El destino gira").setDescription(`Rareza: **${r.rareza}**\n✨ ${r.texto}`).setColor(r.color)] });
  }

  // LORE
  if (interaction.commandName === "lore") {
    const u = data.usuarios[interaction.user.id];
    if (!u || u.lore === 0) return interaction.reply("📜 No has desbloqueado fragmentos de historia aún.");
    return interaction.reply(`📜 **Fragmento #${u.lore}:** ${lore[u.lore - 1]}`);
  }
});

// LOGIN
client.login(process.env.TOKEN);