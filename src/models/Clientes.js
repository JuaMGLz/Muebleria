import { Schema, model } from "mongoose";

const clienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    telefono: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    rfc: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    direccion: {
      calle: { type: String, required: true, trim: true },
      numero: { type: String, required: true, trim: true },
      colonia: { type: String, required: true, trim: true },
      municipio: { type: String, required: true, trim: true },
      estado: { type: String, required: true, trim: true },
      cp: { type: String, required: true, trim: true },
    },

    activo: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("Cliente", clienteSchema);
