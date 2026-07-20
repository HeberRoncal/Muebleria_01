/**rutas-categorias*/
const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');
const { Producto } = require('../models/Producto');
const { proteger, admin } = require('../middleware/auth');

/** GET /api/categorias - Obtener todas las categorías activas */
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { activa: true },
      order: [['orden', 'ASC']]
    });
    res.json({ exito: true, data: categorias });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** GET /api/categorias/:slug - Obtener categoría con sus productos */
router.get('/:slug', async (req, res) => {
  try {
    const categoria = await Categoria.findOne({
      where: { slug: req.params.slug, activa: true }
    });
    if (!categoria) {
      return res.status(404).json({ exito: false, mensaje: 'Categoría no encontrada' });
    }

    const productos = await Producto.findAll({
      where: { categoriaId: categoria.id, disponible: true },
      order: [['id', 'DESC']]
    });

    res.json({
      exito: true,
      data: { categoria, productos }
    });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** POST /api/categorias - Crear categoría (admin) */
router.post('/', proteger, admin, async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    res.status(201).json({ exito: true, data: categoria });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** PUT /api/categorias/:id - Actualizar categoría (admin) */
router.put('/:id', proteger, admin, async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ exito: false, mensaje: 'Categoría no encontrada' });
    }
    await categoria.update(req.body);
    res.json({ exito: true, data: categoria });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** DELETE /api/categorias/:id - Desactivar categoría (admin) */
router.delete('/:id', proteger, admin, async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ exito: false, mensaje: 'Categoría no encontrada' });
    }
    await categoria.update({ activa: false });
    res.json({ exito: true, mensaje: 'Categoría desactivada' });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

module.exports = router;