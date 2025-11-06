// src/models/Administradores.js (CommonJS)
const mongoose = require("mongoose");

const administradorSchema = new mongoose.Schema(
  {
    nombreUsuario: { type: String, required: true },
    correo: { type: String, required: true },
    contraseña: { type: String, required: true },
    administrador: { type: Boolean, default: true },
  },
  { collection: "administradores" }
);

module.exports = mongoose.model("Administrador", administradorSchema);

