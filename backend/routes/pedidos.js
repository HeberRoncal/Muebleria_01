/**rutas-pedidos*/
const express = require('express');
const router = express.Router();
const { Pedido, PedidoItem } = require('../models/Pedido');
const { Producto } = require('../models/Producto');
const { proteger, admin } = require('../middleware/auth');

// Función de ayuda para serializar el pedido al formato JSON estructurado esperado por el frontend
const serializarPedido = (ped) => {
  const p = ped.toJSON();
  
  // Re-estructurar datos del cliente en un subobjeto como en MongoDB
  p.cliente = {
    nombre: p.clienteNombre,
    email: p.clienteEmail,
    telefono: p.clienteTelefono,
    direccion: p.clienteDireccion
  };

  // Limpiar campos planos
  delete p.clienteNombre;
  delete p.clienteEmail;
  delete p.clienteTelefono;
  delete p.clienteDireccion;

  // Adaptar items
  if (p.items) {
    p.items = p.items.map(item => {
      const itemAdaptado = {
        id: item.id,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario)
      };

      // Si el producto está poblado, asignarlo. Si no, retornar el ID
      if (item.producto) {
        itemAdaptado.producto = item.producto;
      } else {
        itemAdaptado.producto = item.productoId;
      }

      return itemAdaptado;
    });
  }

  return p;
};

/** GET /api/pedidos - Obtener todos los pedidos (admin) */
router.get('/', proteger, admin, async (req, res) => {
  try {
    const { estado, pagina = 1, limite = 20 } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;

    const limit = Number(limite);
    const offset = (Number(pagina) - 1) * limit;
    
    const { count, rows } = await Pedido.findAndCountAll({
      where: filtro,
      include: [{
        model: PedidoItem,
        as: 'items',
        include: [{
          model: Producto,
          as: 'producto',
          attributes: ['nombre', 'imagen']
        }]
      }],
      limit,
      offset,
      order: [['id', 'DESC']],
      distinct: true
    });

    const pedidosSerializados = rows.map(serializarPedido);

    res.json({
      exito: true,
      data: pedidosSerializados,
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

/** GET /api/pedidos/:id - Obtener pedido por ID (admin) */
router.get('/:id', proteger, admin, async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [{
        model: PedidoItem,
        as: 'items',
        include: [{
          model: Producto,
          as: 'producto',
          attributes: ['nombre', 'imagen', 'precio']
        }]
      }]
    });

    if (!pedido) {
      return res.status(404).json({ exito: false, mensaje: 'Pedido no encontrado' });
    }

    res.json({ exito: true, data: serializarPedido(pedido) });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

/** POST /api/pedidos - Crear pedido */
router.post('/', async (req, res) => {
  try {
    const { cliente, items, notas } = req.body;

    if (!cliente || !cliente.nombre || !cliente.email || !items || items.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos del cliente e items del pedido son obligatorios'
      });
    }

    // Calcular el total de manera dinámica basándonos en la cantidad y precioUnitario de cada producto
    const total = items.reduce((sum, item) => {
      return sum + (Number(item.precioUnitario) * Number(item.cantidad));
    }, 0);

    // Crear la cabecera del pedido en MySQL
    const nuevoPedido = await Pedido.create({
      clienteNombre: cliente.nombre,
      clienteEmail: cliente.email,
      clienteTelefono: cliente.telefono || null,
      clienteDireccion: cliente.direccion || null,
      total,
      notas: notas || null
    });

    // Crear los detalles (items) de la orden vinculados con el pedido recién creado
    await Promise.all(items.map(item => PedidoItem.create({
      pedidoId: nuevoPedido.id,
      productoId: item.producto, // ID del producto
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    })));

    // Volver a consultar con todos sus datos y relaciones pobladas para la respuesta
    const pedidoCompleto = await Pedido.findByPk(nuevoPedido.id, {
      include: [{
        model: PedidoItem,
        as: 'items',
        include: [{
          model: Producto,
          as: 'producto',
          attributes: ['nombre', 'imagen', 'precio']
        }]
      }]
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Pedido creado correctamente',
      data: serializarPedido(pedidoCompleto)
    });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** PUT /api/pedidos/:id - Actualizar estado del pedido (admin) */
router.put('/:id', proteger, admin, async (req, res) => {
  try {
    const { estado, notas } = req.body;
    const update = {};
    if (estado) update.estado = estado;
    if (notas) update.notas = notas;

    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      return res.status(404).json({ exito: false, mensaje: 'Pedido no encontrado' });
    }
    
    await pedido.update(update);

    // Cargar completo para responder
    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [{
        model: PedidoItem,
        as: 'items',
        include: [{
          model: Producto,
          as: 'producto',
          attributes: ['nombre', 'imagen', 'precio']
        }]
      }]
    });

    res.json({ exito: true, data: serializarPedido(pedidoCompleto) });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: error.message });
  }
});

/** DELETE /api/pedidos/:id - Eliminar pedido (admin) */
router.delete('/:id', proteger, admin, async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      return res.status(404).json({ exito: false, mensaje: 'Pedido no encontrado' });
    }
    
    // Eliminación física (se borrarán los items en cascada automáticamente por la clave foránea en la BD)
    await pedido.destroy();
    res.json({ exito: true, mensaje: 'Pedido eliminado' });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: error.message });
  }
});

module.exports = router;