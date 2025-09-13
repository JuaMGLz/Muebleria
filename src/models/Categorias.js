import { Schema, model } from "mongoose";

const categoriaSchema = new Schema(
  {
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
    activa: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("Categoria", categoriaSchema);

