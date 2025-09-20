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
  // Cuando entras a esta URL, se muestra el formulario de categoría.
  // La variable isHomePage se establece en 'false' para ocultar la imagen principal.
  res.render("categoria", { isHomePage: false });
});
router.post("/categoria/agregar", async (req, res) => {
  const categoria = new Categoria(req.body);
  await categoria.save();
  res.redirect("/categoria/agregar");
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
  const producto = new Producto(req.body);
  await producto.save();
  res.redirect("/producto/agregar");
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
  const inventario = new Inventario(req.body);
  await inventario.save();
  res.redirect("/inventario/agregar");
});

//--- Rutas de Cliente ---
router.get("/cliente/agregar", (req, res) => {
  // Cuando entras a esta URL, se muestra el formulario de cliente.
  // La variable isHomePage se establece en 'false' para ocultar la imagen principal.
  res.render("cliente", { isHomePage: false });
});

router.post("/cliente/agregar", async (req, res) => {
  const cliente = new Cliente(req.body); // Asegúrate de tener un modelo 'Cliente'
  await cliente.save();
  res.redirect("/cliente/agregar"); // Redirigir a la página principal o a donde necesites
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
  const venta = new Venta(req.body); // Crear una nueva venta con los datos del formulario
  await venta.save();
  res.redirect("/venta/agregar"); // Redirigir a la página principal o a donde necesites
});

// Ruta GET para mostrar el formulario con productos, clientes y ventas
router.get("/detalle/agregar", async (req, res, next) => {
  try {
    const [productos, clientes, ventas] = await Promise.all([
      Producto.find({ activa: true }).sort({ nombre: 1 }).lean(),
      Cliente.find({ activo: true }).sort({ nombre: 1 }).lean(),
      Venta.find().sort({ fecha: -1 }).lean(), // Obtener todas las ventas
    ]);

    // Agregar nombre del cliente y total a cada venta
    const ventasConDetalles = await Promise.all(
      ventas.map(async (venta) => {
        // Encontrar el cliente de esta venta
        const cliente = await Cliente.findById(venta.nombreCliente).lean();

        return {
          ...venta,
          nombreCliente: cliente ? cliente.nombre : "Cliente desconocido",
          total: venta.total || 0, // Asegurarse de que el total esté disponible
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
    next(e); // Si ocurre un error, lo pasa al siguiente middleware de manejo de errores
  }
});

// Ruta POST para agregar el detalle
router.post("/detalle/agregar", async (req, res) => {
  try {
    const detalle = new Detalle({
      venta_id: req.body.venta_id, // Nombre de la venta seleccionada (nombreCliente + fecha)
      nombreCliente: req.body.nombreCliente, // Nombre del cliente seleccionado
      nombreProducto: req.body.nombreProducto, // Nombre del producto seleccionado
      cantidad: req.body.cantidad, // Cantidad
      precio_unitario: req.body.precio_unitario, // Precio unitario
      descuento: req.body.descuento || 0, // Descuento (opcional)
      subtotal:
        req.body.cantidad * req.body.precio_unitario -
        (req.body.descuento || 0), // Subtotal calculado
    });

    await detalle.save(); // Guardar el nuevo detalle en la base de datos

    res.redirect("/detalle/agregar"); // Redirigir al usuario a la página principal o donde necesites
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al guardar el detalle.");
  }
});

export default router;
