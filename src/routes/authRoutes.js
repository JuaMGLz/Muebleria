// src/routes/authRoutes.js (CJS)
const { Router } = require("express");
const bcrypt = require("bcryptjs");
import Administrador from "../models/Administradores.js";  

const router = Router();

// GET /login
router.get("/login", (req, res) => {
  if (req.session && req.session.user) return res.redirect("/");
  
  res.render("login", { layout: "empty" }); // <-- Usa el layout sin menú
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;
    if (!usuario || !contraseña) {
      return res.render("login", { error: "Completa usuario y contraseña" });
    }

    const doc = await Administrador.findOne({
      $or: [{ nombreUsuario: usuario }, { correo: usuario }],
    });

    if (!doc) return res.render("login", { error: "Usuario no encontrado" });

    const ok = await bcrypt.compare(contraseña, doc.contraseña || "");
    if (!ok) return res.render("login", { error: "Contraseña incorrecta" });

    req.session.user = {
      _id: doc._id.toString(),
      nombreUsuario: doc.nombreUsuario,
      administrador: !!doc.administrador,
    };

    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.render("login", { error: "Ocurrió un error. Intenta de nuevo." });
  }
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// // Opcional: sembrar admin
// router.get("/setup-admin", async (_req, res) => {
//   const ya = await Administrador.findOne({ administrador: true });
//   if (ya) return res.send("Ya existe un admin.");
//   const hash = await bcrypt.hash("admin123", 10);
//   await Administrador.create({
//     nombreUsuario: "admin",
//     correo: "admin@demo.com",
//     contraseña: hash,
//     administrador: true,
//   });
//   res.send("Listo: admin / admin123");
// });

module.exports = router;
