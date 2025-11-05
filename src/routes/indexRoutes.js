import { Router } from "express";
import Categoria from "../models/Categorias.js";
import Producto from "../models/Productos.js";
import Inventario from "../models/Inventario.js";
import Cliente from "../models/Clientes.js";
import Venta from "../models/Ventas.js";
import Detalle from "../models/Detalles.js";
import Administrador from "../models/Administradores.js";
import Proveedor from "../models/Proveedores.js";

import qrcode from "qrcode";
import path from "path";
import fs from "fs/promises";

const router = Router();

//--- Rutas para la página de inicio ---
router.get(["/", "/plantilla"], (req, res) => {
  res.render("plantilla", { isHomePage: true });
});

//--- Rutas de Categoría ----------------------------------
router.get("/categoria/agregar", async (req, res) => {
  try {
    const categorias = await Categoria.find().lean();
    res.render("categoria", {
      isHomePage: false,
      categorias: categorias, // Pasar las categorías a la vista
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.render("categoria", {
      isHomePage: false,
      categorias: [],
    });
  }
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

router.get("/editarCategoria/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id).lean();
    res.render("editarCategoria", { categoria });
  } catch (error) {
    console.error("Error al obtener la categoría:", error);
    res.redirect("/categoria/agregar");
  }
});

router.post("/editarCategoria/:id", async (req, res) => {
  const { id } = req.params;
  await Categoria.findByIdAndUpdate(id, req.body);
  res.redirect("/categoria/agregar");
});

router.get("/eliminarCategoria/:id", async (req, res) => {
  const { id } = req.params;
  await Categoria.findByIdAndDelete(id);
  res.redirect("/categoria/agregar");
});

//--- Rutas de Producto ---
router.get("/producto/agregar", async (req, res, next) => {
  try {
    const categorias = await Categoria.find({ activa: true })
      .sort({ nombre: 1 })
      .lean();
    const productos = await Producto.find().lean();
    
    // Convertir rutas absolutas a URLs relativas
    const productosConQRCorregido = productos.map(producto => {
      if (producto.qr && producto.qr.startsWith('D:\\')) {
        // Extraer solo el nombre del archivo
        const filename = path.basename(producto.qr);
        return {
          ...producto,
          qr: `/qr-images/${filename}`
        };
      }
      return producto;
    });

    res.render("producto", { 
      isHomePage: false, 
      categorias,
      productos: productosConQRCorregido
    });
  } catch (e) {
    next(e);
  }
});

router.post("/producto/agregar", async (req, res) => {
  try {
    const qrDirectory = path.join("D:", "muebleria", "src", "Qr");
    await fs.mkdir(qrDirectory, { recursive: true });

    const {
      nombre,
      nombreCategoria,
      descripcion,
      marca,
      precio,
      garantia_meses,
      color,
      material,
      peso,
      medidas,
    } = req.body;

    const qrDataString = `
Producto: ${nombre}
Categoría: ${nombreCategoria}
Descripción: ${descripcion}
Marca: ${marca}
Precio: $${precio} MXN
Garantía: ${garantia_meses} meses
Color: ${color}
Material: ${material}
Peso: ${peso} kg
Medidas (LxAnxAl): ${medidas.largo}cm x ${medidas.ancho}cm x ${medidas.alto}cm
    `.trim();

    const safeName = req.body.nombre.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `${Date.now()}_${safeName}.png`;

    const filePath = path.join(qrDirectory, filename);

    await qrcode.toFile(filePath, qrDataString);

    // Guardar solo la ruta relativa
    const productoData = {
      ...req.body,
      qr: `/qr-images/${filename}`, // Ruta relativa
    };

    const producto = new Producto(productoData);
    await producto.save();

    const mensajeExito = encodeURIComponent(
      "¡Producto registrado con éxito! QR guardado."
    );
    res.redirect(`/producto/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el producto o generar QR:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el producto."
    );
    res.redirect(`/producto/agregar?error=${mensajeError}`);
  }
});

// Agregar estas rutas para editar y eliminar productos
router.get("/editarProducto/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).lean();
    const categorias = await Categoria.find({ activa: true }).lean();
    
    res.render("editarProducto", { 
      producto,
      categorias 
    });
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.redirect("/producto/agregar");
  }
});

// Ruta para procesar la edición
router.post("/editarProducto/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar el QR antiguo
    const productoAntiguo = await Producto.findById(id);
    if (productoAntiguo.qr) {
      try {
        // Extraer la ruta absoluta del QR antiguo
        const qrPath = productoAntiguo.qr.startsWith('/qr-images/') 
          ? path.join('D:', 'muebleria', 'src', 'Qr', path.basename(productoAntiguo.qr))
          : productoAntiguo.qr;
        
        await fs.unlink(qrPath);
      } catch (error) {
        console.error("Error al eliminar QR antiguo:", error);
      }
    }

    // Generar nuevo QR
    const qrDirectory = path.join("D:", "muebleria", "src", "Qr");
    await fs.mkdir(qrDirectory, { recursive: true });

    const {
      nombre,
      nombreCategoria,
      descripcion,
      marca,
      precio,
      garantia_meses,
      color,
      material,
      peso,
      medidas,
    } = req.body;

    const qrDataString = `
Producto: ${nombre}
Categoría: ${nombreCategoria}
Descripción: ${descripcion}
Marca: ${marca}
Precio: $${precio} MXN
Garantía: ${garantia_meses} meses
Color: ${color}
Material: ${material}
Peso: ${peso} kg
Medidas (LxAnxAl): ${medidas.largo}cm x ${medidas.ancho}cm x ${medidas.alto}cm
    `.trim();

    const safeName = nombre.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `${Date.now()}_${safeName}.png`;
    const filePath = path.join(qrDirectory, filename);

    await qrcode.toFile(filePath, qrDataString);

    // Actualizar producto con nuevo QR
    const productoActualizado = {
      ...req.body,
      qr: `/qr-images/${filename}`,
    };

    await Producto.findByIdAndUpdate(id, productoActualizado);

    const mensajeExito = encodeURIComponent("¡Producto actualizado con éxito!");
    res.redirect(`/producto/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar el producto."
    );
    res.redirect(`/producto/agregar?error=${mensajeError}`);
  }
});

router.get("/eliminarProducto/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Producto.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Producto eliminado con éxito!");
    res.redirect(`/producto/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar el producto."
    );
    res.redirect(`/producto/agregar?error=${mensajeError}`);
  }
});


//--- Rutas de Inventario ---
//--- Rutas de Inventario ---
router.get("/inventario/agregar", async (req, res, next) => {
  try {
    const productos = await Producto.find({ activa: true })
      .sort({ nombre: 1 })
      .lean();
    const inventarios = await Inventario.find().lean(); // Agregar esta línea
    res.render("inventario", { 
      isHomePage: false, 
      productos,
      inventarios // Pasar inventarios a la vista
    });
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

// Rutas para editar inventario
router.get("/editarInventario/:id", async (req, res) => {
  try {
    const inventario = await Inventario.findById(req.params.id).lean();
    const productos = await Producto.find({ activa: true }).lean();
    res.render("editarInventario", { 
      inventario,
      productos 
    });
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    res.redirect("/inventario/agregar");
  }
});

router.post("/editarInventario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Inventario.findByIdAndUpdate(id, req.body);
    const mensajeExito = encodeURIComponent("¡Inventario actualizado con éxito!");
    res.redirect(`/inventario/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar el inventario:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar el inventario."
    );
    res.redirect(`/inventario/agregar?error=${mensajeError}`);
  }
});

// Ruta para eliminar inventario
router.get("/eliminarInventario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Inventario.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Inventario eliminado con éxito!");
    res.redirect(`/inventario/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar el inventario:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar el inventario."
    );
    res.redirect(`/inventario/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Cliente ---
router.get("/cliente/agregar", async (req, res) => {
  try {
    const clientes = await Cliente.find().lean(); // Agregar esta línea
    res.render("cliente", { 
      isHomePage: false,
      clientes // Pasar clientes a la vista
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.render("cliente", {
      isHomePage: false,
      clientes: []
    });
  }
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

// Rutas para editar cliente
router.get("/editarCliente/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    res.render("editarCliente", { cliente });
  } catch (error) {
    console.error("Error al obtener el cliente:", error);
    res.redirect("/cliente/agregar");
  }
});

router.post("/editarCliente/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Cliente.findByIdAndUpdate(id, req.body);
    const mensajeExito = encodeURIComponent("¡Cliente actualizado con éxito!");
    res.redirect(`/cliente/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar el cliente:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar el cliente."
    );
    res.redirect(`/cliente/agregar?error=${mensajeError}`);
  }
});

// Ruta para eliminar cliente
router.get("/eliminarCliente/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Cliente.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Cliente eliminado con éxito!");
    res.redirect(`/cliente/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar el cliente."
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
    
    // Obtener ventas con nombres de clientes
    const ventas = await Venta.find().lean();
    
    // Poblar los nombres de clientes
    const ventasConNombres = await Promise.all(
      ventas.map(async (venta) => {
        const cliente = await Cliente.findById(venta.nombreCliente).lean();
        return {
          ...venta,
          nombreCliente: cliente ? cliente.nombre : "Cliente no encontrado",
          // Convertir QR a ruta relativa si es necesario
          qr: venta.qr && venta.qr.startsWith('/qr-images/') ? venta.qr : null
        };
      })
    );

    res.render("venta", { 
      isHomePage: false, 
      clientes,
      ventas: ventasConNombres
    });
  } catch (e) {
    next(e);
  }
});

router.post("/venta/agregar", async (req, res) => {
  try {
    const qrDirectory = path.join("D:", "muebleria", "src", "Qr");
    await fs.mkdir(qrDirectory, { recursive: true });

    const {
      nombreCliente, // Este es el ID del cliente
      fecha,
      total,
      estado
    } = req.body;

    // Buscar el cliente para obtener su nombre
    const cliente = await Cliente.findById(nombreCliente);
    const nombreClienteReal = cliente ? cliente.nombre : "Cliente no encontrado";

    const qrDataString = `
Venta - Comprobante
Cliente: ${nombreClienteReal}
Fecha: ${fecha}
Total: $${total} MXN
Estado: ${estado}
    `.trim();

    const safeName = `venta_${nombreClienteReal.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
    const filename = `${Date.now()}_${safeName}.png`;
    const filePath = path.join(qrDirectory, filename);

    await qrcode.toFile(filePath, qrDataString);

    // Guardar solo la ruta relativa
    const ventaData = {
      ...req.body,
      qr: `/qr-images/${filename}`, // Ruta relativa
    };

    const venta = new Venta(ventaData);
    await venta.save();

    const mensajeExito = encodeURIComponent(
      "¡Venta registrada con éxito! QR guardado."
    );
    res.redirect(`/venta/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar la venta o generar QR:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar la venta."
    );
    res.redirect(`/venta/agregar?error=${mensajeError}`);
  }
});

// Rutas para editar venta
router.get("/editarVenta/:id", async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).lean();
    const clientes = await Cliente.find({ activo: true }).lean();
    res.render("editarVenta", { 
      venta,
      clientes 
    });
  } catch (error) {
    console.error("Error al obtener la venta:", error);
    res.redirect("/venta/agregar");
  }
});

// Ruta para procesar la edición de venta
router.post("/editarVenta/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar el QR antiguo
    const ventaAntigua = await Venta.findById(id);
    if (ventaAntigua.qr) {
      try {
        // Extraer la ruta absoluta del QR antiguo
        const qrPath = ventaAntigua.qr.startsWith('/qr-images/') 
          ? path.join('D:', 'muebleria', 'src', 'Qr', path.basename(ventaAntigua.qr))
          : ventaAntigua.qr;
        
        await fs.unlink(qrPath);
      } catch (error) {
        console.error("Error al eliminar QR antiguo:", error);
      }
    }

    // Generar nuevo QR
    const qrDirectory = path.join("D:", "muebleria", "src", "Qr");
    await fs.mkdir(qrDirectory, { recursive: true });

    const {
      nombreCliente, // Este es el ID del cliente
      fecha,
      total,
      estado
    } = req.body;

    // Buscar el cliente para obtener su nombre
    const cliente = await Cliente.findById(nombreCliente);
    const nombreClienteReal = cliente ? cliente.nombre : "Cliente no encontrado";

    const qrDataString = `
Venta - Comprobante
Cliente: ${nombreClienteReal}
Fecha: ${fecha}
Total: $${total} MXN
Estado: ${estado}
    `.trim();

    const safeName = `venta_${nombreClienteReal.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
    const filename = `${Date.now()}_${safeName}.png`;
    const filePath = path.join(qrDirectory, filename);

    await qrcode.toFile(filePath, qrDataString);

    // Actualizar venta con nuevo QR
    const ventaActualizada = {
      ...req.body,
      qr: `/qr-images/${filename}`,
    };

    await Venta.findByIdAndUpdate(id, ventaActualizada);

    const mensajeExito = encodeURIComponent("¡Venta actualizada con éxito!");
    res.redirect(`/venta/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar la venta:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar la venta."
    );
    res.redirect(`/venta/agregar?error=${mensajeError}`);
  }
});

// Ruta para eliminar venta
router.get("/eliminarVenta/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar el QR antes de eliminar la venta
    const venta = await Venta.findById(id);
    if (venta.qr) {
      try {
        const qrPath = venta.qr.startsWith('/qr-images/') 
          ? path.join('D:', 'muebleria', 'src', 'Qr', path.basename(venta.qr))
          : venta.qr;
        
        await fs.unlink(qrPath);
      } catch (error) {
        console.error("Error al eliminar QR:", error);
      }
    }

    await Venta.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Venta eliminada con éxito!");
    res.redirect(`/venta/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar la venta:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar la venta."
    );
    res.redirect(`/venta/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Detalle (Reporte Financiero) ---
router.get("/detalle/agregar", async (req, res) => {
  try {
    const [detalles, productos, clientes, ventas] = await Promise.all([
      Detalle.find().lean(),
      Producto.find({ activa: true }).sort({ nombre: 1 }).lean(),
      Cliente.find({ activo: true }).sort({ nombre: 1 }).lean(),
      Venta.find().sort({ fecha: -1 }).lean(),
    ]);

    const ventasConNombres = await Promise.all(
      ventas.map(async (venta) => {
        const cliente = await Cliente.findById(venta.nombreCliente).lean();
        return {
          ...venta,
          nombreCliente: cliente ? cliente.nombre : "Cliente no encontrado",
        };
      })
    );

    res.render("detalle", {
      isHomePage: false,
      detalles: detalles,
      productos: productos,
      clientes: clientes,
      ventas: ventasConNombres,
    });
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    res.render("detalle", {
      isHomePage: false,
      detalles: [],
      productos: [],
      clientes: [],
      ventas: [],
    });
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
      subtotal: req.body.cantidad * req.body.precio_unitario - (req.body.descuento || 0),
    });
    await detalle.save();
    const mensajeExito = encodeURIComponent("¡Detalle registrado con éxito!");
    res.redirect(`/detalle/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el detalle:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el detalle."
    );
    res.redirect(`/detalle/agregar?error=${mensajeError}`);
  }
});

router.get("/editarDetalle/:id", async (req, res) => {
  try {
    const detalle = await Detalle.findById(req.params.id).lean();
    const [productos, clientes, ventas] = await Promise.all([
      Producto.find({ activa: true }).sort({ nombre: 1 }).lean(),
      Cliente.find({ activo: true }).sort({ nombre: 1 }).lean(),
      Venta.find().sort({ fecha: -1 }).lean(),
    ]);

    // Procesar ventas para incluir nombreCliente
    const ventasConNombres = await Promise.all(
      ventas.map(async (venta) => {
        const cliente = await Cliente.findById(venta.nombreCliente).lean();
        return {
          ...venta,
          nombreCliente: cliente ? cliente.nombre : "Cliente no encontrado",
        };
      })
    );

    res.render("editarDetalle", { 
      detalle,
      productos,
      clientes,
      ventas: ventasConNombres  // Usar ventasConNombres en lugar de ventas
    });
  } catch (error) {
    console.error("Error al obtener el detalle:", error);
    res.redirect("/detalle/agregar");
  }
});

router.post("/editarDetalle/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const detalleActualizado = {
      venta_id: req.body.venta_id,
      nombreCliente: req.body.nombreCliente,
      nombreProducto: req.body.nombreProducto,
      cantidad: req.body.cantidad,
      precio_unitario: req.body.precio_unitario,
      descuento: req.body.descuento || 0,
      subtotal: req.body.cantidad * req.body.precio_unitario - (req.body.descuento || 0),
    };

    await Detalle.findByIdAndUpdate(id, detalleActualizado);
    const mensajeExito = encodeURIComponent("¡Detalle actualizado con éxito!");
    res.redirect(`/detalle/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar el detalle:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar el detalle."
    );
    res.redirect(`/detalle/agregar?error=${mensajeError}`);
  }
});

router.get("/eliminarDetalle/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Detalle.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Detalle eliminado con éxito!");
    res.redirect(`/detalle/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar el detalle:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar el detalle."
    );
    res.redirect(`/detalle/agregar?error=${mensajeError}`);
  }
});


//--- Rutas de Administrador ---
//--- Rutas de Administrador ---
router.get("/administrador/agregar", async (req, res) => {
  try {
    const administradores = await Administrador.find().lean();
    res.render("administrador", { 
      isHomePage: false,
      administradores: administradores
    });
  } catch (error) {
    console.error("Error al obtener administradores:", error);
    res.render("administrador", {
      isHomePage: false,
      administradores: []
    });
  }
});

router.post("/administrador/agregar", async (req, res) => {
  try {
    const administrador = new Administrador(req.body);
    await administrador.save();
    const mensajeExito = encodeURIComponent("¡Administrador registrado con éxito!");
    res.redirect(`/administrador/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el administrador:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el administrador."
    );
    res.redirect(`/administrador/agregar?error=${mensajeError}`);
  }
});

router.get("/editarAdministrador/:id", async (req, res) => {
  try {
    const administrador = await Administrador.findById(req.params.id).lean();
    res.render("editarAdministrador", { administrador });
  } catch (error) {
    console.error("Error al obtener el administrador:", error);
    res.redirect("/administrador/agregar");
  }
});

router.post("/editarAdministrador/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Administrador.findByIdAndUpdate(id, req.body);
    const mensajeExito = encodeURIComponent("¡Administrador actualizado con éxito!");
    res.redirect(`/administrador/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar el administrador:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar el administrador."
    );
    res.redirect(`/administrador/agregar?error=${mensajeError}`);
  }
});

router.get("/eliminarAdministrador/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Administrador.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Administrador eliminado con éxito!");
    res.redirect(`/administrador/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar el administrador:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar el administrador."
    );
    res.redirect(`/administrador/agregar?error=${mensajeError}`);
  }
});

//--- Rutas de Proveedor ---
router.get("/proveedor/agregar", async (req, res) => {
  try {
    const proveedores = await Proveedor.find().lean();
    res.render("proveedor", { 
      isHomePage: false,
      proveedores: proveedores
    });
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.render("proveedor", {
      isHomePage: false,
      proveedores: []
    });
  }
});

router.post("/proveedor/agregar", async (req, res) => {
  try {
    const proveedor = new Proveedor(req.body);
    await proveedor.save();
    const mensajeExito = encodeURIComponent("¡Proveedor registrado con éxito!");
    res.redirect(`/proveedor/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al registrar el proveedor:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al registrar el proveedor."
    );
    res.redirect(`/proveedor/agregar?error=${mensajeError}`);
  }
});

router.get("/editarProveedor/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id).lean();
    res.render("editarProveedor", { proveedor });
  } catch (error) {
    console.error("Error al obtener el proveedor:", error);
    res.redirect("/proveedor/agregar");
  }
});

router.post("/editarProveedor/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Proveedor.findByIdAndUpdate(id, req.body);
    const mensajeExito = encodeURIComponent("¡Proveedor actualizado con éxito!");
    res.redirect(`/proveedor/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al actualizar el proveedor:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al actualizar el proveedor."
    );
    res.redirect(`/proveedor/agregar?error=${mensajeError}`);
  }
});

router.get("/eliminarProveedor/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Proveedor.findByIdAndDelete(id);
    const mensajeExito = encodeURIComponent("¡Proveedor eliminado con éxito!");
    res.redirect(`/proveedor/agregar?success=${mensajeExito}`);
  } catch (error) {
    console.error("Error al eliminar el proveedor:", error);
    const mensajeError = encodeURIComponent(
      "Hubo un error al eliminar el proveedor."
    );
    res.redirect(`/proveedor/agregar?error=${mensajeError}`);
  }
});

export default router;
