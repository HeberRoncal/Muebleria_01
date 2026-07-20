/**config-db*/
const { Sequelize } = require('sequelize');

// Inicializar Sequelize con variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME || 'muebleria_trujillo',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desactivar logs detallados de SQL para mantener la consola limpia
    define: {
      timestamps: true,
      underscored: true // Convierte camelCase en JS a snake_case en MySQL (ej: createdAt -> created_at)
    }
  }
);

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente.');
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, conectarDB };