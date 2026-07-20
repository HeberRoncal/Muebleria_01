/**seed*/
require('dotenv').config();
const { sequelize } = require('./config/db');
const Categoria = require('./models/Categoria');
const { Producto, ProductoImagen, ProductoEtiqueta } = require('./models/Producto');
const Usuario = require('./models/Usuario');

const categoriasData = [
  { nombre: 'Sala', descripcion: 'Muebles para tu sala de estar', imagen: 'img/categoria2.jpg', orden: 1 },
  { nombre: 'Dormitorio', descripcion: 'Descansa con estilo', imagen: 'img/categoria1.jpg', orden: 2 },
  { nombre: 'Oficina', descripcion: 'Productividad y confort', imagen: 'img/categoria3.jpg', orden: 3 },
  { nombre: 'Comedor', descripcion: 'Reuniones familiares', imagen: 'img/categoria2.jpg', orden: 4 },
  { nombre: 'Cocina', descripcion: 'Funcionalidad y diseño', imagen: 'img/categoria3.jpg', orden: 5 },
  { nombre: 'Jardín', descripcion: 'Muebles para exteriores y jardines', imagen: 'img/categoria_default.jpg', orden: 6 },
  { nombre: 'Otros', descripcion: 'Accesorios y otros tipos de muebles', imagen: 'img/categoria_default.jpg', orden: 7 }
];

const productosData = [
  {
    nombre: 'Sofá Moderno 3 Cuerpos',
    descripcion: 'Tapizado en tela premium, estructura de madera sólida y espuma de alta densidad para un confort excepcional.',
    categoria: 'Sala',
    precio: 1200,
    precioAnterior: 1500,
    imagen: 'img/producto1.jpg',
    stock: 8,
    destacado: true,
    especificaciones: { material: 'Tela premium y madera', dimensiones: '220x90x85 cm', peso: '45 kg', color: 'Gris oscuro' }
  },
  {
    nombre: 'Mesa de Centro Roble',
    descripcion: 'Madera maciza de roble con acabado satinado y patas metálicas negras. Diseño escandinavo atemporal.',
    categoria: 'Sala',
    precio: 350,
    imagen: 'img/producto2.jpg',
    stock: 15,
    especificaciones: { material: 'Roble macizo y metal', dimensiones: '100x60x45 cm', peso: '18 kg', color: 'Natural' }
  },
  {
    nombre: 'Estante Biblioteca',
    descripcion: '6 repisas regulables, ideal para libros, decoración y televisores de hasta 55". Fácil montaje.',
    categoria: 'Sala',
    precio: 480,
    precioAnterior: 650,
    imagen: 'img/producto3.jpg',
    stock: 12,
    especificaciones: { material: 'MDF laminado', dimensiones: '180x80x30 cm', peso: '25 kg', color: 'Blanco' }
  },
  {
    nombre: 'Lámpara de Pie Arco',
    descripcion: 'Diseño contemporáneo con brazo de metal dorado y pantalla de lino. Luz cálida regulable.',
    categoria: 'Sala',
    precio: 180,
    imagen: 'img/producto6.jpg',
    stock: 20,
    especificaciones: { material: 'Metal y lino', dimensiones: '180x40 cm', peso: '8 kg', color: 'Dorado/Blanco' }
  },
  {
    nombre: 'Cómoda 6 Cajones',
    descripcion: 'Amplio espacio de almacenamiento con cajones de cierre suave y tiraderas metálicas modernas.',
    categoria: 'Dormitorio',
    precio: 620,
    imagen: 'img/producto5.jpg',
    stock: 6,
    destacado: true,
    especificaciones: { material: 'Madera MDF', dimensiones: '120x80x45 cm', peso: '35 kg', color: 'Blanco' }
  },
  {
    nombre: 'Velador Minimalista',
    descripcion: 'Diseño compacto con cajón y repisa inferior. Perfecto junto a tu cama. Disponible en blanco y nogal.',
    categoria: 'Dormitorio',
    precio: 195,
    imagen: 'img/producto4.jpg',
    stock: 18,
    especificaciones: { material: 'Madera', dimensiones: '40x40x55 cm', peso: '6 kg', color: 'Blanco' }
  },
  {
    nombre: 'Cabecera Tapizada',
    descripcion: 'Tapizado en terciopelo con botones decorativos. Disponible para camas de 1.5 y 2 plazas.',
    categoria: 'Dormitorio',
    precio: 420,
    precioAnterior: 580,
    imagen: 'img/producto1.jpg',
    stock: 10,
    especificaciones: { material: 'Terciopelo y madera', dimensiones: '160x120 cm', peso: '12 kg', color: 'Verde' }
  },
  {
    nombre: 'Silla Ergonómica Pro',
    descripcion: 'Soporte lumbar ajustable, reposabrazos 4D, altura neumática y malla transpirable de alta calidad.',
    categoria: 'Oficina',
    precio: 290,
    imagen: 'img/producto4.jpg',
    stock: 25,
    especificaciones: { material: 'Malla y plástico', dimensiones: '60x60x110 cm', peso: '15 kg', color: 'Negro' }
  },
  {
    nombre: 'Escritorio en L',
    descripcion: 'Superficie amplia en forma de L con gestión de cables integrada. Ideal para home office productivo.',
    categoria: 'Oficina',
    precio: 750,
    imagen: 'img/producto3.jpg',
    stock: 7,
    destacado: true,
    especificaciones: { material: 'MDF y metal', dimensiones: '150x150x75 cm', peso: '40 kg', color: 'Negro' }
  },
  {
    nombre: 'Archivador Metálico',
    descripcion: '3 cajones con cerradura, riel telescópico y base con ruedas. Capacidad para carpetas A4 y oficio.',
    categoria: 'Oficina',
    precio: 290,
    precioAnterior: 380,
    imagen: 'img/producto2.jpg',
    stock: 14,
    especificaciones: { material: 'Acero', dimensiones: '40x60x100 cm', peso: '20 kg', color: 'Gris' }
  },
  {
    nombre: 'Mesa Comedor 6 Personas',
    descripcion: 'Tablero de madera maciza con patas metálicas. Diseño robusto y elegante para reuniones familiares.',
    categoria: 'Comedor',
    precio: 1100,
    imagen: 'img/producto1.jpg',
    stock: 5,
    especificaciones: { material: 'Madera maciza y metal', dimensiones: '180x90x75 cm', peso: '50 kg', color: 'Nogal' }
  },
  {
    nombre: 'Sillas Comedor x4',
    descripcion: 'Set de 4 sillas tapizadas en cuero sintético. Estructura de acero negro mate, fácil limpieza.',
    categoria: 'Comedor',
    precio: 560,
    imagen: 'img/producto5.jpg',
    stock: 8,
    especificaciones: { material: 'Cuero sintético y acero', dimensiones: '45x50x90 cm', peso: '24 kg (total)', color: 'Negro' }
  },
  {
    nombre: 'Vitrina Vajillera',
    descripcion: 'Puertas de vidrio templado con luz LED interior. Exhibe tu vajilla con elegancia. 4 repisas.',
    categoria: 'Comedor',
    precio: 720,
    precioAnterior: 920,
    imagen: 'img/producto6.jpg',
    stock: 4,
    especificaciones: { material: 'Madera y vidrio', dimensiones: '120x40x180 cm', peso: '55 kg', color: 'Blanco' }
  },
  {
    nombre: 'Isla de Cocina',
    descripcion: 'Con tablero de granito, 2 cajones y espacio inferior abierto. Incluye 2 taburetes altos a juego.',
    categoria: 'Cocina',
    precio: 1350,
    imagen: 'img/producto2.jpg',
    stock: 3,
    destacado: true,
    especificaciones: { material: 'Granito y madera', dimensiones: '150x80x90 cm', peso: '80 kg', color: 'Negro/Gris' }
  },
  {
    nombre: 'Alacena Superior',
    descripcion: 'Mueble superior para cocina con 2 puertas abatibles. Acabado melamínico resistente a la humedad.',
    categoria: 'Cocina',
    precio: 280,
    imagen: 'img/producto3.jpg',
    stock: 20,
    especificaciones: { material: 'Melamina', dimensiones: '80x35x70 cm', peso: '15 kg', color: 'Blanco' }
  },
  {
    nombre: 'Taburete de Barra x2',
    descripcion: 'Set de 2 taburetes con asiento acolchado giratorio y reposapiés. Altura regulable de 60 a 80 cm.',
    categoria: 'Cocina',
    precio: 240,
    precioAnterior: 320,
    imagen: 'img/producto4.jpg',
    stock: 16,
    especificaciones: { material: 'Metal y cuero sintético', dimensiones: '35x35x75 cm', peso: '10 kg (total)', color: 'Negro' }
  }
];

const seedDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    // Recrear tablas (limpia todos los registros y estructuras previas)
    await sequelize.sync({ force: true });
    console.log('🗑️ Tablas recreadas limpiamente.');

    // 1. Insertar categorías
    const categoriasCreadas = await Categoria.bulkCreate(categoriasData);
    console.log(`✅ ${categoriasCreadas.length} categorías insertadas`);

    // Crear mapa de nombres de categorías a IDs para asignación de claves foráneas
    const catMap = {};
    categoriasCreadas.forEach(cat => {
      catMap[cat.nombre] = cat.id;
    });

    // 2. Insertar productos
    for (const p of productosData) {
      const categoriaId = catMap[p.categoria] || catMap['Otros'];
      
      const nuevoProducto = await Producto.create({
        nombre: p.nombre,
        descripcion: p.descripcion,
        categoriaId,
        precio: p.precio,
        precioAnterior: p.precioAnterior || null,
        imagen: p.imagen,
        stock: p.stock || 10,
        destacado: p.destacado || false,
        material: p.especificaciones?.material || null,
        dimensiones: p.especificaciones?.dimensiones || null,
        peso: p.especificaciones?.peso || null,
        color: p.especificaciones?.color || null
      });

      // Insertar imágenes adicionales de demostración (tabla normalizada)
      await ProductoImagen.create({
        productoId: nuevoProducto.id,
        imagen: nuevoProducto.imagen
      });

      // Insertar etiquetas de demostración (tabla normalizada)
      const tags = [nuevoProducto.nombre.split(' ')[0].toLowerCase()];
      if (nuevoProducto.destacado) tags.push('destacado');
      await Promise.all(tags.map(tag => ProductoEtiqueta.create({
        productoId: nuevoProducto.id,
        etiqueta: tag
      })));
    }
    console.log(`✅ ${productosData.length} productos insertados`);

    // 3. Crear usuario administrador
    await Usuario.create({
      nombre: 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@muebleriatrujillo.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      rol: 'admin'
    });
    console.log('✅ Usuario admin creado');

    console.log('\n🎉 Base de datos MySQL sembrada correctamente por script');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el sembrado de base de datos MySQL:', error.message);
    process.exit(1);
  }
};

seedDB();