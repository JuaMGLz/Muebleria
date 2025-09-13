import { Router } from 'express';
import Categoria from '../models/Categorias.js';

const router = Router();

router.get('/', (req, res) => {
    res.render('categoria');
});


router.post("/categoria/agregar", async (req, res) => {
  const categoria = Categoria(req.body);
  await categoria.save();
  res.redirect("/");
});

router.get('/plantilla', (req, res) => {
    res.render('plantilla');
});

export default router;