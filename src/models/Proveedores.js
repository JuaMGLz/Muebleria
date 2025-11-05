import { Schema, model } from "mongoose";

const proveedorSchema = new Schema(
  {
    razonSocial: {
      type: String,
      required: true,
      trim: true,
    },

    nombreContacto: {
      type: String,
      required: true,
      trim: true,
    },

    telefono: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // El email de un proveedor sí debería ser único
      trim: true,
      lowercase: true, // Buena práctica para emails
    },

    rfc: {
      type: String,
      required: true,
      unique: true, // El RFC de un proveedor también debe ser único
      trim: true,
      uppercase: true, // Buena práctica para RFCs
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
      // Usamos 'enum' para asegurar que el valor sea uno de los del <select>
      enum: [
        "Materia Prima",
        "Herrajes",
        "Mueble Terminado",
        "Servicios",
        "Otro",
      ],
    },

    // La estructura 'direccion' coincide con los names 'direccion[calle]', etc.
    direccion: {
      calle: { type: String, required: true, trim: true },
      numero: { type: String, required: true, trim: true },
      colonia: { type: String, required: true, trim: true },
      municipio: { type: String, required: true, trim: true },
      estado: { type: String, required: true, trim: true },
      cp: { type: String, required: true, trim: true },
    },

    // Datos bancarios (los dejamos al nivel principal para 
    // coincidir con name="banco" y name="clabe")
    banco: {
      type: String,
      required: false, // Son opcionales
      trim: true,
    },

    clabe: {
      type: String,
      required: false, // Son opcionales
      trim: true,
      // Podrías agregar validación de longitud, ej: maxlength: 18
    },

    activo: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    collection: "proveedores",
  },
  {
    timestamps: true, // Mantenemos tu configuración
    versionKey: false, // Mantenemos tu configuración
  }
);

export default model("Proveedor", proveedorSchema);