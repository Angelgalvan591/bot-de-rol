const http = require("http");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

// ===== SERVIDOR WEB (Render / UptimeRobot) =====
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.write("Astra Bot está activo ✨");
  res.end();
}).listen(PORT, () => {
  console.log(`🌐 Web activa en puerto ${PORT}`);
});

// ===== CLIENTE DISCORD =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== BASE DE DATOS =====
const DATA_FILE = "data.json";
let data = { usuarios: {}, casas: {} };

if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
} else {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function guardar() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ===== CONFIGURACIÓN =====
const casas = [
  "﹒♡﹒Casa Alteira﹒★",
  "﹒ ＋﹒Casa Viperthon ﹕✧",
  "﹒ᶻz﹒Casa Nocturnis﹒✿",
  "﹑♡﹒Casa Valoryon﹒⌒"
];

const afinidades = ["Fuego 🔥", "Agua 🌊", "Aire 🌪️", "Tierra 🌿", "Luz ✨", "Oscuridad 🌑"];

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
  { texto: "Protege una zona encantada", xp: 35 }
];

const misionesSecretas = [
  { texto: "Descifra un manuscrito prohibido", xp: 80 },
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

// ===== FUNCIONES =====
const xpNecesaria = n => n * 100;
const obtenerTitulo = n => titulos.filter(t => n >= t.nivel).pop().nombre;

// ===== READY =====
client.once("ready", async () => {
  console.log(`✨ Astra conectada como ${client.user.tag}`);

  await client.application.commands.set([
    { name: "registrar_oc", description: "Registra tu OC", options: [
      { name: "nombre", type: 3, required: true, description: "Nombre" },
      { name: "personalidad", type: 3, required: true, description: "Personalidad" }
    ]},
    { name: "perfil", description: "Ver tu perfil" },
    { name: "mision", description: "Obtener misión" },
    { name: "completar", description: "Completar misión" },
    { name: "ranking_casas", description: "Ranking de casas" },
    { name: "spin", description: "Spin mágico" },
    { name: "lore", description: "Historia desbloqueada" }
  ]);
});

// ===== INTERACCIONES =====
client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;

  const u = data.usuarios[i.user.id];

  if (i.commandName === "registrar_oc") {
    const casa = casas[Math.floor(Math.random() * casas.length)];
    const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)];
    data.usuarios[i.user.id] = {
      nombre: i.options.getString("nombre"),
      personalidad: i.options.getString("personalidad"),
      casa, afinidad, nivel: 1, xp: 0, mision: null, lore: 0
    };
    guardar();
    return i.reply(`📜 Destino sellado: **${casa}** | ${afinidad}`);
  }

  if (i.commandName === "perfil") {
    if (!u) return i.reply("⛔ No estás registrado");
    return i.reply(
      `🔮 ${u.nombre}\n🏛️ ${u.casa}\n✨ Nivel ${u.nivel}\n🏅 ${obtenerTitulo(u.nivel)}`
    );
  }

  if (i.commandName === "mision") {
    if (!u) return i.reply("⛔ Regístrate primero");
    const pool = Math.random() < 0.15 ? misionesSecretas : misiones;
    u.mision = pool[Math.floor(Math.random() * pool.length)];
    guardar();
    return i.reply(`📜 ${u.mision.texto} (+${u.mision.xp} XP)`);
  }

  if (i.commandName === "completar") {
    if (!u?.mision) return i.reply("⛔ No tienes misión");
    u.xp += u.mision.xp;
    data.casas[u.casa] = (data.casas[u.casa] || 0) + 5;
    u.mision = null;

    while (u.xp >= xpNecesaria(u.nivel)) {
      u.xp -= xpNecesaria(u.nivel);
      u.nivel++;
      if (u.lore < lore.length) u.lore++;
    }

    guardar();
    return i.reply("✅ Misión completada");
  }

  if (i.commandName === "ranking_casas") {
    const r = Object.entries(data.casas).sort((a,b)=>b[1]-a[1]);
    return i.reply(r.map((c,i)=>`${i+1}. ${c[0]} — ${c[1]} pts`).join("\n") || "Sin datos");
  }

  if (i.commandName === "spin") {
    const s = spins[Math.floor(Math.random() * spins.length)];
    return i.reply({ embeds: [new EmbedBuilder().setTitle("🎲 Spin").setDescription(s.texto).setColor(s.color)] });
  }

  if (i.commandName === "lore") {
    if (!u || u.lore === 0) return i.reply("📜 Aún no desbloqueas historia");
    return i.reply(`📜 ${lore[u.lore - 1]}`);
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);