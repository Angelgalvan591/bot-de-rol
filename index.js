const http = require('http');

// Crear un servidor básico para que Render y UptimeRobot tengan una URL que visitar
http.createServer((req, res) => {
  res.write("El bot sigue encendido");
  res.end();
}).listen(process.env.PORT || 3000);

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== CONFIG =====
const casas = [
  "﹒♡﹒Casa Alteira﹒★",
  "﹒ ＋﹒Casa Viperthon ﹕✧",
  "﹒ᶻz﹒Casa Nocturnis﹒✿",
  "﹑♡﹒Casa Valoryon﹒⌒"
];

const afinidades = [
  "Fuego 🔥",
  "Agua 🌊",
  "Aire 🌪️",
  "Tierra 🌿",
  "Luz ✨",
  "Oscuridad 🌑"
];

const titulos = [
  { nivel: 1, nombre: "Aprendiz" },
  { nivel: 5, nombre: "Iniciado" },
  { nivel: 10, nombre: "Adepto" },
  { nivel: 20, nombre: "Maestro" }
];

// ===== MISIONES =====
const misiones = [
  { texto: "Practica un hechizo básico", xp: 20 },
  { texto: "Explora una zona mágica", xp: 25 },
  { texto: "Ayuda a otro estudiante", xp: 15 },
  { texto: "Recolecta ingredientes mágicos", xp: 20 },
  { texto: "Investiga un objeto extraño", xp: 30 },
  { texto: "Protege una zona encantada", xp: 35 },
  { texto: "Completa una actividad de tu club", xp: 25 },
  { texto: "Derrota a un ser sombra", xp: 40 },
  { texto: "Sella una grieta de energía oscura", xp: 45 },
  { texto: "Sobrevive a una prueba mágica prohibida", xp: 50 },
  { texto: "Escolta a un estudiante herido hasta un lugar seguro", xp: 30 },
  { texto: "Investiga presencias extrañas durante la noche", xp: 35 },
  { texto: "Enfrenta una ilusión creada por magia antigua", xp: 40 },
  { texto: "Recupera un artefacto corrompido", xp: 45 },
  { texto: "Resiste la influencia de un ente oscuro", xp: 50 },
  { texto: "Encuentra un libro perdido en la biblioteca", xp: 15 },
  { texto: "Lleva un mensaje secreto a otra casa", xp: 20 },
  { texto: "Practica un hechizo de defensa avanzada", xp: 30 },
  { texto: "Crea un amuleto protector", xp: 25 },
  { texto: "Observa criaturas mágicas sin ser detectado", xp: 35 },
  { texto: "Investiga un fenómeno meteorológico raro", xp: 20 },
  { texto: "Entrena con tu afinidad durante una hora", xp: 30 },
  { texto: "Resuelve un acertijo del maestro de magia", xp: 40 },
  { texto: "Ayuda a un estudiante perdido en la noche", xp: 25 },
  { texto: "Recolecta ingredientes raros para un elixir", xp: 45 }
];

const misionesSecretas = [
  { texto: "Descifra un manuscrito prohibido", xp: 80 },
  { texto: "Adéntrate en una cámara sellada por Astra", xp: 100 },
  { texto: "Invoca un espíritu ancestral para obtener conocimiento", xp: 120 },
  { texto: "Restaura un artefacto antiguo olvidado", xp: 90 },
  { texto: "Explora la dimensión oculta de las casas", xp: 110 }
];

// ===== SPINS =====
const spins = [
  { texto: "Objeto común", rareza: "Común", color: 0xaaaaaa },
  { texto: "Pergamino antiguo", rareza: "Común", color: 0xaaaaaa },
  { texto: "Poción básica", rareza: "Común", color: 0xaaaaaa },

  { texto: "Mascota mágica", rareza: "Raro", color: 0x4fa3ff },
  { texto: "Varita de aprendiz", rareza: "Raro", color: 0x4fa3ff },
  { texto: "Amuleto protector", rareza: "Raro", color: 0x4fa3ff },
  { texto: "Mapa de tesoro oculto", rareza: "Raro", color: 0x4fa3ff },

  { texto: "Hechizo ancestral", rareza: "Épico", color: 0xa855f7 },
  { texto: "Libro de encantamientos olvidados", rareza: "Épico", color: 0xa855f7 },
  { texto: "Cristal de energía pura", rareza: "Épico", color: 0xa855f7 },

  { texto: "Artefacto legendario", rareza: "Legendario", color: 0xffc107 },
  { texto: "Varita de maestro antiguo", rareza: "Legendario", color: 0xffc107 },
  { texto: "Amuleto de la creación", rareza: "Legendario", color: 0xffc107 },
  { texto: "Mascota legendaria: Dragón de luz", rareza: "Legendario", color: 0xffc107 }
];

// ===== LORE =====
const lore = [
  "Antes de las casas, existía el Círculo Estelar.",
  "Astra no fue creada, despertó.",
  "La magia responde a quienes perseveran.",
  "El equilibrio mantiene unido el mundo."
];

// ===== FUNCIONES =====
function xpNecesaria(nivel) {
  return nivel * 100;
}

function obtenerTitulo(nivel) {
  let titulo = "Aprendiz";
  for (const t of titulos) {
    if (nivel >= t.nivel) titulo = t.nombre;
  }
  return titulo;
}

// ===== READY =====
client.once("ready", () => {
  console.log(`✨ Astra activa como ${client.user.tag}`);
});

// ===== INTERACCIONES =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const data = JSON.parse(fs.readFileSync("data.json"));

  // ===== REGISTRAR OC =====
  if (interaction.commandName === "registrar_oc") {
    const nombre = interaction.options.getString("nombre");
    const personalidad = interaction.options.getString("personalidad");
    const casa = casas[Math.floor(Math.random() * casas.length)];
    const afinidad = afinidades[Math.floor(Math.random() * afinidades.length)];

    data.usuarios[interaction.user.id] = {
      nombre,
      personalidad,
      casa,
      afinidad,
      nivel: 1,
      xp: 0,
      mision: null,
      lore: 0
    };

    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Destino sellado")
          .setDescription(
            `**${nombre}** ha sido observado por Astra.\n\n` +
            `🏛️ Casa: ${casa}\n` +
            `🔮 Afinidad: ${afinidad}\n` +
            `✨ Nivel: 1`
          )
          .setColor(0x6a5acd)
      ]
    });
  }

  // ===== PERFIL =====
  if (interaction.commandName === "perfil") {
    const u = data.usuarios[interaction.user.id];
    if (!u) return interaction.reply("⛔ No existes en los registros astrales");

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🔮 Perfil de ${u.nombre}`)
          .setDescription(
            `🏛️ Casa: ${u.casa}\n` +
            `🔮 Afinidad: ${u.afinidad}\n` +
            `🏅 Título: ${obtenerTitulo(u.nivel)}\n` +
            `✨ Nivel: ${u.nivel}\n` +
            `📈 XP: ${u.xp}/${xpNecesaria(u.nivel)}\n\n` +
            `📜 Misión: ${u.mision ? u.mision.texto : "Ninguna"}\n\n` +
            `🏛️ Reputación de la casa: ${data.casas[u.casa]}`
          )
          .setColor(0x5865f2)
      ]
    });
  }

  // ===== MISION =====
  if (interaction.commandName === "mision") {
    const u = data.usuarios[interaction.user.id];
    if (!u) return interaction.reply("⛔ Registra tu OC primero");

    const pool = Math.random() < 0.15 ? misionesSecretas : misiones;
    u.mision = pool[Math.floor(Math.random() * pool.length)];

    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Misión asignada")
          .setDescription(
            `✨ ${u.mision.texto}\n` +
            `📈 Recompensa: ${u.mision.xp} XP`
          )
          .setColor(0x3cb371)
      ]
    });
  }

  // ===== COMPLETAR =====
  if (interaction.commandName === "completar") {
    const u = data.usuarios[interaction.user.id];
    if (!u || !u.mision) return interaction.reply("⛔ No tienes misión");

    u.xp += u.mision.xp;
    data.casas[u.casa] += 5;
    u.mision = null;

    while (u.xp >= xpNecesaria(u.nivel)) {
      u.xp -= xpNecesaria(u.nivel);
      u.nivel++;
      if (u.lore < lore.length) u.lore++;
    }

    fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

    return interaction.reply("✅ La misión ha sido cumplida");
  }

  // ===== SPIN =====
  if (interaction.commandName === "spin") {
    const r = spins[Math.floor(Math.random() * spins.length)];
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎲 El destino gira")
          .setDescription(`Rareza: **${r.rareza}**\n✨ ${r.texto}`)
          .setColor(r.color)
      ]
    });
  }

  // ===== RANKING =====
  if (interaction.commandName === "ranking_casas") {
    const orden = Object.entries(data.casas).sort((a, b) => b[1] - a[1]);
    let texto = "";
    orden.forEach((c, i) => texto += `${i + 1}. ${c[0]} — ${c[1]} pts\n`);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏛️ Ranking de Casas")
          .setDescription(texto)
          .setColor(0xffc107)
      ]
    });
  }

  // ===== LORE =====
  if (interaction.commandName === "lore") {
    const u = data.usuarios[interaction.user.id];
    if (!u || u.lore === 0) return interaction.reply("📜 El conocimiento aún duerme");

    return interaction.reply(`📜 ${lore[u.lore - 1]}`);
  }
});

client.login(process.env.TOKEN);
