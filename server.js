require("dotenv").config();
const path = require("path");
const express = require("express");
const { createClient } = require("@libsql/client");

const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || "";

if (!APP_PASSWORD) {
  console.warn(
    "[aviso] No has definido APP_PASSWORD en el entorno. La app quedará sin protección por contraseña."
  );
}

// Base de datos: usa Turso (libSQL remoto) si hay credenciales, si no un
// archivo SQLite local (útil solo para desarrollo/pruebas en tu máquina).
const dbUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
const dbAuthToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient(
  dbAuthToken ? { url: dbUrl, authToken: dbAuthToken } : { url: dbUrl }
);

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS estado (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      datos TEXT NOT NULL,
      actualizado_en TEXT NOT NULL
    )
  `);
}

const app = express();
app.use(express.json({ limit: "2mb" }));

// --- Auth muy simple: una única contraseña compartida (app de un solo usuario) ---
function requireAuth(req, res, next) {
  if (!APP_PASSWORD) return next(); // sin contraseña configurada, no se protege
  const header = req.get("x-app-password") || "";
  if (header === APP_PASSWORD) return next();
  return res.status(401).json({ error: "contraseña incorrecta" });
}

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (!APP_PASSWORD || password === APP_PASSWORD) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: "contraseña incorrecta" });
});

app.get("/api/state", requireAuth, async (req, res) => {
  try {
    const r = await db.execute("SELECT datos, actualizado_en FROM estado WHERE id = 1");
    if (!r.rows.length) return res.json({ datos: null, actualizado_en: null });
    const row = r.rows[0];
    res.json({ datos: JSON.parse(row.datos), actualizado_en: row.actualizado_en });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "error leyendo el estado" });
  }
});

app.put("/api/state", requireAuth, async (req, res) => {
  try {
    const datos = JSON.stringify(req.body || {});
    const ahora = new Date().toISOString();
    await db.execute({
      sql: `INSERT INTO estado (id, datos, actualizado_en) VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET datos = excluded.datos, actualizado_en = excluded.actualizado_en`,
      args: [datos, ahora],
    });
    res.json({ ok: true, actualizado_en: ahora });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "error guardando el estado" });
  }
});

app.use(express.static(path.join(__dirname, "public")));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Entreno escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error("No se pudo inicializar la base de datos:", e);
    process.exit(1);
  });
