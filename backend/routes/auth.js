/**rutas-auth*/
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { proteger } = require('../middleware/auth');

/** POST /api/auth/registro - Registrar usuario */
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ exito: false, mensaje: 'El email ya está registrado' });
    }

    const usuario = await Usuario.create({ nombre, email, password, rol });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      exito: true,
      token,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** POST /api/auth/login - Iniciar sesión */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ exito: false, mensaje: 'Email y contraseña son obligatorios' });
    }

    // Buscamos usando el scope 'withPassword' para incluir la contraseña encriptada en la validación
    const usuario = await Usuario.scope('withPassword').findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
    }

    const passwordCorrecto = await usuario.compararPassword(password);
    if (!passwordCorrecto) {
      return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      exito: true,
      token,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** GET /api/auth/perfil - Obtener perfil del usuario logueado */
router.get('/perfil', proteger, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    res.json({ exito: true, data: usuario });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

module.exports = router;