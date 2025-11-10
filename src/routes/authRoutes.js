// src/routes/authRoutes.js (CJS)
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const Administrador = require("../models/Administradores.js"); 

// ==========================================================
// ✅ MEJORA DE SEGURIDAD: Importar el middleware anti-caché
// ==========================================================
const { noCache } = require("../middlewares/noregresar.js"); 

const router = Router();

// Define el layout para las páginas de login/error
const LOGIN_LAYOUT = { layout: "empty" };

// ==========================================================
// ✅ MEJORA DE SEGURIDAD: Aplicar noCache al GET /login
// ==========================================================
router.get("/login", noCache, (req, res) => { 
  if (req.session && req.session.user) return res.redirect("/");
  
  res.render("login", LOGIN_LAYOUT); // Usa el layout sin menú
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;
    
    // 1. Falla por campos vacíos
    if (!usuario || !contraseña) {
      return res.render("login", { error: "Completa usuario y contraseña", ...LOGIN_LAYOUT });
    }

    const doc = await Administrador.findOne({
      $or: [{ nombreUsuario: usuario }, { correo: usuario }],
    });

    // 2. Falla por usuario no encontrado
    if (!doc) return res.render("login", { error: "Usuario no encontrado", ...LOGIN_LAYOUT }); 

    const ok = await bcrypt.compare(contraseña, doc.contraseña || "");
    
    // 3. Falla por contraseña incorrecta
    if (!ok) return res.render("login", { error: "Contraseña incorrecta", ...LOGIN_LAYOUT }); 

    // Inicio de sesión exitoso
    req.session.user = {
      _id: doc._id.toString(),
      nombreUsuario: doc.nombreUsuario,
      administrador: !!doc.administrador,
    };

    res.redirect("/");
  } catch (e) {
    console.error(e);
    // 4. Falla por error general
    res.render("login", { error: "Ocurrió un error. Intenta de nuevo.", ...LOGIN_LAYOUT });
  }
});

// GET /logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Nota: Eliminar o comentar la sección opcional de /setup-admin si no la usas.

module.exports = router;