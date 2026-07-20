/**modelo-pedido*/
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Producto } = require('./Producto');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  clienteNombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre del cliente es obligatorio' }
    }
  },
  clienteEmail: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: { msg: 'Por favor ingrese un email válido' },
      notEmpty: { msg: 'El email del cliente es obligatorio' }
    }
  },
  clienteTelefono: {
    type: DataTypes.STRING(50)
  },
  clienteDireccion: {
    type: DataTypes.STRING(255)
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El total no puede ser negativo' }
    }
  },
  notas: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'pedidos'
});

const PedidoItem = sequelize.define('PedidoItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pedidoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'La cantidad mínima es 1' }
    }
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El precio unitario no puede ser negativo' }
    }
  }
}, {
  tableName: 'pedido_items',
  timestamps: false
});

// Configurar relaciones de pedidos e items
Pedido.hasMany(PedidoItem, { foreignKey: 'pedidoId', as: 'items', onDelete: 'CASCADE' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'pedidoId' });

PedidoItem.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });
Producto.hasMany(PedidoItem, { foreignKey: 'productoId' });

module.exports = { Pedido, PedidoItem };