import { Schema, model } from "mongoose";

const productoSchema = new Schema(
  {
    nombreCategoria: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    nombre: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    descripcion: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    marca: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    garantia_meses: {
      type: Number,
      required: true,
      unique: false,
    },

    color: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    material: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    medidas: {
      largo: { type: Number, required: true, unique: false },
      ancho: { type: Number, required: true, unique: false },
      alto: { type: Number, required: true, unique: false },
    },
    peso: {
      type: Number,
      required: true,
      unique: false,
    },
    precio: {
      type: Number,
      required: true,
      unique: false,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("Producto", productoSchema);