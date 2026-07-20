/**modelo-contacto*/
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Contacto = sequelize.define('Contacto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: { msg: 'Por favor ingrese un email válido' },
      notEmpty: { msg: 'El email es obligatorio' }
    }
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  asunto: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El asunto es obligatorio' }
    }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El mensaje es obligatorio' },
      len: {
        args: [0, 2000],
        msg: 'El mensaje no puede exceder 2000 caracteres'
      }
    }
  },
  pais: {
    type: DataTypes.STRING(50),
    defaultValue: 'Perú'
  },
  tipo: {
    type: DataTypes.ENUM('cliente', 'proveedor', 'otro'),
    defaultValue: 'cliente'
  },
  categoriaInteres: {
    type: DataTypes.STRING(100)
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  respondido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'contactos'
});

module.exports = Contacto;