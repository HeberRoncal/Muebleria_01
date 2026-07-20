/**rutas-productos*/
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Producto, ProductoImagen, ProductoEtiqueta } = require('../models/Producto');
const Categoria = require('../models/Categoria');
const { proteger, admin } = require('../middleware/auth');

// Función de ayuda para serializar el producto al formato JSON esperado por el frontend
const serializarProducto = (prod) => {
  const p = prod.toJSON();
  p.imagenes = prod.imagenesSecundarias ? prod.imagenesSecundarias.map(i => i.imagen) : [];
  p.etiquetas = prod.etiquetasRel ? prod.etiquetasRel.map(e => e.etiqueta) : [];
  p.descuento = prod.getDescuento(); // Virtual
  
  // Añadir compatibilidad con el campo string 'categoria' para el frontend
  p.categoria = prod.categoriaRel ? prod.categoriaRel.nombre : 'Otros';

  delete p.imagenesSecundarias;
  delete p.etiquetasRel;
  delete p.categoriaRel;
  return p;
};

/** GET /api/productos - Obtener todos los productos con filtros y paginación */
router.get('/', async (req, res) => {
  try {
    const { categoria, buscar, minPrecio, maxPrecio, disponible, destacado, pagina = 1, limite = 12 } = req.query;
    
    const filtro = {};
    
    // Filtro por Categoría (nombre o slug)
    if (categoria) {
      const cat = await Categoria.findOne({
        where: {
          [Op.or]: [{ nombre: categoria }, { slug: categoria }]
        }
      });
      if (cat) {
        filtro.categoriaId = cat.id;
      } else {
        filtro.categoriaId = null; // Fuerza un resultado vacío si la categoría no existe
      }
    }
    
    if (disponible !== undefined) {
      filtro.disponible = disponible === 'true';
    }
    
    if (destacado !== undefined) {
      filtro.destacado = destacado === 'true';
    }
    
    if (minPrecio || maxPrecio) {
      filtro.precio = {};
      if (minPrecio) filtro.precio[Op.gte] = Number(minPrecio);
      if (maxPrecio) filtro.precio[Op.lte] = Number(maxPrecio);
    }
    
    if (buscar) {
      filtro[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
        { descripcion: { [Op.like]: `%${buscar}%` } }
      ];
    }

    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;
    
    const { count, rows } = await Producto.findAndCountAll({
      where: filtro,
      include: [
        { model: Categoria, as: 'categoriaRel', attributes: ['nombre'] },
        { model: ProductoImagen, as: 'imagenesSecundarias', attributes: ['imagen'] },
        { model: ProductoEtiqueta, as: 'etiquetasRel', attributes: ['etiqueta'] }
      ],
      limit,
      offset,
      order: [['id', 'DESC']],
      distinct: true // Evita conteo erróneo por las asociaciones 1:N
    });

    const productosSerializados = rows.map(serializarProducto);

    res.json({
      exito: true,
      data: productosSerializados,
      paginacion: {
        pagina: Number(pagina),
        limite: limit,
        total: count,
        paginas: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** GET /api/productos/:id - Obtener producto por ID */
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoriaRel', attributes: ['nombre'] },
        { model: ProductoImagen, as: 'imagenesSecundarias', attributes: ['imagen'] },
        { model: ProductoEtiqueta, as: 'etiquetasRel', attributes: ['etiqueta'] }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }
    
    res.json({ exito: true, data: serializarProducto(producto) });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** POST /api/productos - Crear producto (admin) */
router.post('/', proteger, admin, async (req, res) => {
  try {
    const { categoria, imagenes, etiquetas, ...rest } = req.body;
    
    // Obtener id de la categoría por su nombre
    let categoriaId = 7; // 'Otros' por defecto
    if (categoria) {
      const cat = await Categoria.findOne({ where: { nombre: categoria } });
      if (cat) categoriaId = cat.id;
    }

    const producto = await Producto.create({
      ...rest,
      categoriaId
    });

    // Guardar imágenes si existen
    if (imagenes && Array.isArray(imagenes)) {
      await Promise.all(imagenes.map(img => ProductoImagen.create({
        productoId: producto.id,
        imagen: img
      })));
    }

    // Guardar etiquetas si existen
    if (etiquetas && Array.isArray(etiquetas)) {
      await Promise.all(etiquetas.map(tag => ProductoEtiqueta.create({
        productoId: producto.id,
        etiqueta: tag
      })));
    }

    // Cargar con asociaciones completas para responder
    const productoCompleto = await Producto.findByPk(producto.id, {
      include: [
        { model: Categoria, as: 'categoriaRel', attributes: ['nombre'] },
        { model: ProductoImagen, as: 'imagenesSecundarias', attributes: ['imagen'] },
        { model: ProductoEtiqueta, as: 'etiquetasRel', attributes: ['etiqueta'] }
      ]
    });

    res.status(201).json({ exito: true, data: serializarProducto(productoCompleto) });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** PUT /api/productos/:id - Actualizar producto (admin) */
router.put('/:id', proteger, admin, async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }

    const { categoria, imagenes, etiquetas, ...rest } = req.body;
    
    if (categoria) {
      const cat = await Categoria.findOne({ where: { nombre: categoria } });
      if (cat) rest.categoriaId = cat.id;
    }

    await producto.update(rest);

    // Actualizar imágenes secundarias
    if (imagenes && Array.isArray(imagenes)) {
      await ProductoImagen.destroy({ where: { productoId: producto.id } });
      await Promise.all(imagenes.map(img => ProductoImagen.create({
        productoId: producto.id,
        imagen: img
      })));
    }

    // Actualizar etiquetas
    if (etiquetas && Array.isArray(etiquetas)) {
      await ProductoEtiqueta.destroy({ where: { productoId: producto.id } });
      await Promise.all(etiquetas.map(tag => ProductoEtiqueta.create({
        productoId: producto.id,
        etiqueta: tag
      })));
    }

    // Volver a consultar completo
    const productoCompleto = await Producto.findByPk(producto.id, {
      include: [
        { model: Categoria, as: 'categoriaRel', attributes: ['nombre'] },
        { model: ProductoImagen, as: 'imagenesSecundarias', attributes: ['imagen'] },
        { model: ProductoEtiqueta, as: 'etiquetasRel', attributes: ['etiqueta'] }
      ]
    });

    res.json({ exito: true, data: serializarProducto(productoCompleto) });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** DELETE /api/productos/:id - Eliminar producto (admin) */
router.delete('/:id', proteger, admin, async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado' });
    }
    
    // Eliminación física
    await producto.destroy();
    res.json({ exito: true, mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

module.exports = router;