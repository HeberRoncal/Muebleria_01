/**middleware-auth*/
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const proteger = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      exito: false,
      mensaje: 'No autorizado, token no encontrado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // findByPk utilizará automáticamente defaultScope que excluye la contraseña
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'El usuario ya no existe'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      exito: false,
      mensaje: 'No autorizado, token inválido'
    });
  }
};

const admin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    return res.status(403).json({
      exito: false,
      mensaje: 'No autorizado, se requiere rol de administrador'
    });
  }
};

module.exports = { proteger, admin };