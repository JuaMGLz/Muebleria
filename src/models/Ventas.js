import { Schema, model } from "mongoose";

const ventaSchema = new Schema(
  {
    nombreCliente: {
      type: String,  // Usamos un campo de tipo String para el ID del cliente
      required: true
    },
    fecha: {
      type: Date,
      required: true
    },
    estado: {
      type: String,
      required: true,
    },
    metodo_pago: {
      type: String,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    descuento: {
      type: Number,
      required: true,
    },
    impuestos: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    notas: {
      type: String,
      required: false,
    },
    qr: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("Venta", ventaSchema);
