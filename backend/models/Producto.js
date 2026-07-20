/**modelo-producto*/
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Categoria = require('./Categoria');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' },
      len: { args: [0, 100], msg: 'El nombre no puede exceder 100 caracteres' }
    }
  },
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La descripción es obligatoria' },
      len: { args: [0, 500], msg: 'La descripción no puede exceder 500 caracteres' }
    }
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'La categoría es obligatoria' }
    }
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El precio no puede ser negativo' }
    }
  },
  precioAnterior: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: null,
    validate: {
      min: { args: [0], msg: 'El precio no puede ser negativo' }
    }
  },
  imagen: {
    type: DataTypes.STRING(255),
    defaultValue: 'img/producto_default.jpg'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: { args: [0], msg: 'El stock no puede ser negativo' }
    }
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  material: {
    type: DataTypes.STRING(100)
  },
  dimensiones: {
    type: DataTypes.STRING(100)
  },
  peso: {
    type: DataTypes.STRING(50)
  },
  color: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'productos'
});

// Modelos secundarios para arrays normalizados
const ProductoImagen = sequelize.define('ProductoImagen', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'producto_imagenes',
  timestamps: false
});

const ProductoEtiqueta = sequelize.define('ProductoEtiqueta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  etiqueta: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'producto_etiquetas',
  timestamps: false
});

// Virtual para calcular descuento (solo lectura en código)
Producto.prototype.getDescuento = function() {
  if (this.precioAnterior && Number(this.precioAnterior) > Number(this.precio)) {
    return Math.round(((Number(this.precioAnterior) - Number(this.precio)) / Number(this.precioAnterior)) * 100);
  }
  return 0;
};

// Configurar asociaciones
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoriaRel' });
Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });

Producto.hasMany(ProductoImagen, { foreignKey: 'productoId', as: 'imagenesSecundarias', onDelete: 'CASCADE' });
ProductoImagen.belongsTo(Producto, { foreignKey: 'productoId' });

Producto.hasMany(ProductoEtiqueta, { foreignKey: 'productoId', as: 'etiquetasRel', onDelete: 'CASCADE' });
ProductoEtiqueta.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = { Producto, ProductoImagen, ProductoEtiqueta };