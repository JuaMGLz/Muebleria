import { Router } from "express";
import Categoria from "../models/Categorias.js";
import Producto from "../models/Productos.js";
import Inventario from "../models/Inventario.js";

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
  const categoria = Categoria(req.body);
  await categoria.save();
  res.redirect("/");
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
  const producto = Producto(req.body);
  await producto.save();
  res.redirect("/");
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
  const inventario = Inventario(req.body);
  await inventario.save();
  res.redirect("/");
});

export default router;
