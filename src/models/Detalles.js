import { Schema, model } from "mongoose";

const detalleSchema = new Schema(
  {
    venta_id: {
      type: String,  // Nombre de la venta (no es un ObjectId)
      required: true,
    },
    nombreCliente: {
      type: String,  // Nombre del cliente asociado a este detalle
      required: true,
    },
    nombreProducto: {
      type: String,  // Nombre del producto asociado al detalle de la venta
      required: true,
    },
    cantidad: {
      type: Number,  // Cantidad del producto
      required: true,
    },
    precio_unitario: {
      type: Number,  // Precio unitario del producto
      required: true,
    },
    descuento: {
      type: Number,  // Descuento aplicado al producto
      required: false,
      default: 0,
    },
    subtotal: {
      type: Number,  // Subtotal por el producto (cantidad * precio_unitario - descuento)
      required: true,
    }
  },
  { timestamps: true, versionKey: false }
);

export default model("Detalle", detalleSchema);


