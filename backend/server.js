/**server*/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { conectarDB, sequelize } = require('./config/db');

const app = express();

/**middleware*/
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**rutas*/
app.use('/api/productos', require('./routes/productos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/contacto', require('./routes/contacto'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pedidos', require('./routes/pedidos'));

/**ruta raiz*/
app.get('/', (req, res) => {
  res.json({
    nombre: 'Mueblería Trujillo API (MySQL/XAMPP)',
    version: '1.0.0',
    estado: 'activo',
    database: 'MySQL',
    endpoints: {
      productos: '/api/productos',
      categorias: '/api/categorias',
      contacto: '/api/contacto',
      auth: '/api/auth',
      pedidos: '/api/pedidos'
    }
  });
});

/**manejo de errores*/
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    exito: false,
    mensaje: err.message || 'Error interno del servidor'
  });
});

/**ruta no encontrada*/
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: 'Ruta no encontrada'
  });
});

/**conexion a mysql y arranque del servidor*/
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Conectar a MySQL/MariaDB en XAMPP
    await conectarDB();
    
    // 2. Sincronizar modelos con la base de datos (sin borrar datos existentes)
    await sequelize.sync();
    console.log('✅ Modelos de Sequelize sincronizados con la BD MySQL.');

    // 3. Levantar Express
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();