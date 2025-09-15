import { Schema, model } from "mongoose";

const inventarioSchema = new Schema(
  {
    nombreProducto: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      unique: false,
    },

    ubicacion: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },

    sucursal: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("Inventario", inventarioSchema);
