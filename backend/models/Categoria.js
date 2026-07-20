/**modelo-categoria*/
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'El nombre ya está registrado'
    },
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' }
    }
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(300)
  },
  imagen: {
    type: DataTypes.STRING(255),
    defaultValue: 'img/categoria_default.jpg'
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  hooks: {
    beforeValidate: (categoria) => {
      if (categoria.nombre && !categoria.slug) {
        categoria.slug = categoria.nombre
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
          .replace(/\s+/g, '-');   // Reemplazar espacios con guiones
      }
    }
  }
});

module.exports = Categoria;