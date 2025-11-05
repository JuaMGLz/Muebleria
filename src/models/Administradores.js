import { Schema, model } from "mongoose";

const administradorSchema = new Schema(
  {
    nombreUsuario: {
      type: String,
      required: true,
    },
    correo: {
      type: String,
      required: true,
    },
    contraseña: {
      type: String,
      required: true,
    },
    administrador: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "administradores",
  }
);

export default model("Administrador", administradorSchema);
