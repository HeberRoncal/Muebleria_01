/**rutas-contacto*/
const express = require('express');
const router = express.Router();
const Contacto = require('../models/Contacto');
const { proteger, admin } = require('../middleware/auth');

/** POST /api/contacto - Enviar mensaje de contacto */
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje, pais, tipo, categoriaInteres } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, email, asunto y mensaje son obligatorios'
      });
    }

    const contacto = await Contacto.create({
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
      pais,
      tipo,
      categoriaInteres
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Mensaje enviado correctamente',
      data: contacto
    });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** GET /api/contacto - Obtener mensajes (admin) */
router.get('/', proteger, admin, async (req, res) => {
  try {
    const { leido, respondido, pagina = 1, limite = 20 } = req.query;
    const filtro = {};
    
    if (leido !== undefined) filtro.leido = leido === 'true';
    if (respondido !== undefined) filtro.respondido = respondido === 'true';

    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;
    
    const { count, rows } = await Contacto.findAndCountAll({
      where: filtro,
      limit,
      offset,
      order: [['id', 'DESC']]
    });

    res.json({
      exito: true,
      data: rows,
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

/** PUT /api/contacto/:id - Marcar como leido/respondido (admin) */
router.put('/:id', proteger, admin, async (req, res) => {
  try {
    const { leido, respondido } = req.body;
    const update = {};
    if (leido !== undefined) update.leido = leido;
    if (respondido !== undefined) update.respondido = respondido;

    const mensaje = await Contacto.findByPk(req.params.id);
    if (!mensaje) {
      return res.status(404).json({ exito: false, mensaje: 'Mensaje no encontrado' });
    }
    
    await mensaje.update(update);
    res.json({ exito: true, data: mensaje });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** DELETE /api/contacto/:id - Eliminar mensaje (admin) */
router.delete('/:id', proteger, admin, async (req, res) => {
  try {
    const mensaje = await Contacto.findByPk(req.params.id);
    if (!mensaje) {
      return res.status(404).json({ exito: false, mensaje: 'Mensaje no encontrado' });
    }
    
    await mensaje.destroy();
    res.json({ exito: true, mensaje: 'Mensaje eliminado' });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

module.exports = router;