import { Router } from "express";
import Categoria from "../models/Categorias.js";
import Producto from "../models/Productos.js";
import Inventario from "../models/Inventario.js";
import Cliente from "../models/Clientes.js";
import Venta from "../models/Ventas.js";
import Detalle from "../models/Detalles.js";

const router = Router();

//--- Rutas para la página de inicio ---
router.get(["/", "/plantilla"], (req, res) => {
  res.render("plantilla", { isHomePage: true });
});

//--- Rutas de Categoría ---
router.get("/categoria/agregar", (req, res) => {
  res.render("categoria", { isHomePage: false });
});

router.post("/categoria/agregar", async (req, res) => {
  try {
    const categoria = new Categoria(req.body);
    await categoria.save();
    const mensajeExito = encodeURIComponent("¡Categoría registrada con éxito!");
    res.redirect(`/categoria/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar la categoría:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar la categoría."
    );
    res.redirect(`/categoria/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Producto ---
router.get("/producto/agregar", async (req, res, next) => {
  try {
    const categorias = await Categoria.find({ activa: true })
      .sort({ nombre: 1 })
      .lean();
    res.render("producto", { isHomePage: false, categorias });
  } catch (e) {
    next(e);
  }
});

router.post("/producto/agregar", async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    const mensajeExito = encodeURIComponent("¡Producto registrado con éxito!");
    res.redirect(`/producto/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el producto:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el producto."
    );
    res.redirect(`/producto/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Inventario ---
router.get("/inventario/agregar", async (req, res, next) => {
  try {
    const productos = await Producto.find({ activa: true })
      .sort({ nombre: 1 })
      .lean();
    res.render("inventario", { isHomePage: false, productos });
  } catch (e) {
    next(e);
  }
});

router.post("/inventario/agregar", async (req, res) => {
  try {
    const inventario = new Inventario(req.body);
    await inventario.save();
    const mensajeExito = encodeURIComponent(
      "¡Inventario registrado con éxito!"
    );
    res.redirect(`/inventario/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el inventario:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el inventario."
    );
    res.redirect(`/inventario/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Cliente ---
router.get("/cliente/agregar", (req, res) => {
  res.render("cliente", { isHomePage: false });
});

router.post("/cliente/agregar", async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    const mensajeExito = encodeURIComponent("¡Cliente registrado con éxito!");
    res.redirect(`/cliente/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el cliente:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el cliente."
    );
    res.redirect(`/cliente/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Venta ---
router.get("/venta/agregar", async (req, res, next) => {
  try {
    const clientes = await Cliente.find({ activo: true })
      .sort({ nombre: 1 })
      .lean();
    res.render("venta", { isHomePage: false, clientes });
  } catch (e) {
    next(e);
  }
});

router.post("/venta/agregar", async (req, res) => {
  try {
    const venta = new Venta(req.body);
    await venta.save();
    const mensajeExito = encodeURIComponent("¡Venta registrada con éxito!");
    res.redirect(`/venta/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar la venta:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar la venta."
    );
    res.redirect(`/venta/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Detalle ---
router.get("/detalle/agregar", async (req, res, next) => {
  try {
    const [productos, clientes, ventas] = await Promise.all([
      Producto.find({ activa: true }).sort({ nombre: 1 }).lean(),
      Cliente.find({ activo: true }).sort({ nombre: 1 }).lean(),
      Venta.find().sort({ fecha: -1 }).lean(),
    ]);

    const ventasConDetalles = await Promise.all(
      ventas.map(async (venta) => {
        const cliente = await Cliente.findById(venta.nombreCliente).lean();
        return {
          ...venta,
          nombreCliente: cliente ? cliente.nombre : "Cliente desconocido",
          total: venta.total || 0,
        };
      })
    );
    res.render("detalle", {
      isHomePage: false,
      productos,
      clientes,
      ventas: ventasConDetalles,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/detalle/agregar", async (req, res) => {
  try {
    const detalle = new Detalle({
      venta_id: req.body.venta_id,
      nombreCliente: req.body.nombreCliente,
      nombreProducto: req.body.nombreProducto,
      cantidad: req.body.cantidad,
      precio_unitario: req.body.precio_unitario,
      descuento: req.body.descuento || 0,
      subtotal:
        req.body.cantidad * req.body.precio_unitario -
        (req.body.descuento || 0),
    });
    await detalle.save();
    const mensajeExito = encodeURIComponent(
      "¡Detalle de venta registrado con éxito!"
    );
    res.redirect(`/detalle/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al guardar el detalle:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al guardar el detalle de venta."
    );
    res.redirect(`/detalle/agregar?error=${mensajeError}`);
  }
});

export default router;
