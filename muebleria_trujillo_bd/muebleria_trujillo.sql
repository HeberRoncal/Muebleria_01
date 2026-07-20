-- BASE DE DATOS: muebleria_trujillo


-- Configuración inicial de codificación y zona horaria
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- CREACIÓN DE LA BASE DE DATOS
-- --------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `muebleria_trujillo` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `muebleria_trujillo`;

-- --------------------------------------------------------------------
-- ELIMINACIÓN DE TABLAS EXISTENTES (Para evitar conflictos)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `pedido_items`;
DROP TABLE IF EXISTS `pedidos`;
DROP TABLE IF EXISTS `producto_etiquetas`;
DROP TABLE IF EXISTS `producto_imagenes`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `contactos`;
DROP TABLE IF EXISTS `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE `categorias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `descripcion` VARCHAR(300) DEFAULT NULL,
  `imagen` VARCHAR(255) DEFAULT 'img/categoria_default.jpg',
  `orden` INT DEFAULT 0,
  `activa` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `productos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(500) NOT NULL,
  `categoria_id` INT NOT NULL,
  `precio` DECIMAL(10, 2) NOT NULL,
  `precio_anterior` DECIMAL(10, 2) DEFAULT NULL,
  `imagen` VARCHAR(255) DEFAULT 'img/producto_default.jpg',
  `stock` INT DEFAULT 10,
  `disponible` TINYINT(1) DEFAULT 1,
  `destacado` TINYINT(1) DEFAULT 0,
  `material` VARCHAR(100) DEFAULT NULL,
  `dimensiones` VARCHAR(100) DEFAULT NULL,
  `peso` VARCHAR(50) DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_productos_categorias` 
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_precio_positivo` CHECK (`precio` >= 0),
  CONSTRAINT `chk_precio_anterior_positivo` CHECK (`precio_anterior` IS NULL OR `precio_anterior` >= 0),
  CONSTRAINT `chk_stock_positivo` CHECK (`stock` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `producto_imagenes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `producto_id` INT NOT NULL,
  `imagen` VARCHAR(255) NOT NULL,
  CONSTRAINT `fk_producto_imagenes_productos` 
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `producto_etiquetas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `producto_id` INT NOT NULL,
  `etiqueta` VARCHAR(50) NOT NULL,
  CONSTRAINT `fk_producto_etiquetas_productos` 
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin', 'editor') DEFAULT 'editor',
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `contactos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `asunto` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `pais` VARCHAR(50) DEFAULT 'Perú',
  `tipo` ENUM('cliente', 'proveedor', 'otro') DEFAULT 'cliente',
  `categoria_interes` VARCHAR(100) DEFAULT NULL,
  `leido` TINYINT(1) DEFAULT 0,
  `respondido` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `pedidos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_nombre` VARCHAR(100) NOT NULL,
  `cliente_email` VARCHAR(150) NOT NULL,
  `cliente_telefono` VARCHAR(50) DEFAULT NULL,
  `cliente_direccion` VARCHAR(255) DEFAULT NULL,
  `estado` ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
  `total` DECIMAL(10, 2) NOT NULL,
  `notas` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `pedido_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pedido_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `precio_unitario` DECIMAL(10, 2) NOT NULL,
  CONSTRAINT `fk_pedido_items_pedidos` 
    FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pedido_items_productos` 
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_cantidad_positiva` CHECK (`cantidad` >= 1),
  CONSTRAINT `chk_precio_unitario_positivo` CHECK (`precio_unitario` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




-- 1. Insertar categorías base
INSERT INTO `categorias` (`id`, `nombre`, `slug`, `descripcion`, `imagen`, `orden`, `activa`) VALUES
(1, 'Sala', 'sala', 'Muebles para tu sala de estar', 'img/categoria2.jpg', 1, 1),
(2, 'Dormitorio', 'dormitorio', 'Descansa con estilo', 'img/categoria1.jpg', 2, 1),
(3, 'Oficina', 'oficina', 'Productividad y confort', 'img/categoria3.jpg', 3, 1),
(4, 'Comedor', 'comedor', 'Reuniones familiares', 'img/categoria2.jpg', 4, 1),
(5, 'Cocina', 'cocina', 'Funcionalidad y diseño', 'img/categoria3.jpg', 5, 1),
(6, 'Jardín', 'jardin', 'Muebles para exteriores y jardines', 'img/categoria_default.jpg', 6, 1),
(7, 'Otros', 'otros', 'Accesorios y otros tipos de muebles', 'img/categoria_default.jpg', 7, 1);

-- 2. Insertar productos
INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `categoria_id`, `precio`, `precio_anterior`, `imagen`, `stock`, `destacado`, `material`, `dimensiones`, `peso`, `color`) VALUES
-- Sala (categoria_id = 1)
(1, 'Sofá Moderno 3 Cuerpos', 'Tapizado en tela premium, estructura de madera sólida y espuma de alta densidad para un confort excepcional.', 1, 1200.00, 1500.00, 'img/producto1.jpg', 8, 1, 'Tela premium y madera', '220x90x85 cm', '45 kg', 'Gris oscuro'),
(2, 'Mesa de Centro Roble', 'Madera maciza de roble con acabado satinado y patas metálicas negras. Diseño escandinavo atemporal.', 1, 350.00, NULL, 'img/producto2.jpg', 15, 0, 'Roble macizo y metal', '100x60x45 cm', '18 kg', 'Natural'),
(3, 'Estante Biblioteca', '6 repisas regulables, ideal para libros, decoración y televisores de hasta 55". Fácil montaje.', 1, 480.00, 650.00, 'img/producto3.jpg', 12, 0, 'MDF laminado', '180x80x30 cm', '25 kg', 'Blanco'),
(4, 'Lámpara de Pie Arco', 'Diseño contemporáneo con brazo de metal dorado y pantalla de lino. Luz cálida regulable.', 1, 180.00, NULL, 'img/producto6.jpg', 20, 0, 'Metal y lino', '180x40 cm', '8 kg', 'Dorado/Blanco'),

-- Dormitorio (categoria_id = 2)
(5, 'Cómoda 6 Cajones', 'Amplio espacio de almacenamiento con cajones de cierre suave y tiraderas metálicas modernas.', 2, 620.00, NULL, 'img/producto5.jpg', 6, 1, 'Madera MDF', '120x80x45 cm', '35 kg', 'Blanco'),
(6, 'Velador Minimalista', 'Diseño compacto con cajón y repisa inferior. Perfecto junto a tu cama. Disponible en blanco y nogal.', 2, 195.00, NULL, 'img/producto4.jpg', 18, 0, 'Madera', '40x40x55 cm', '6 kg', 'Blanco'),
(7, 'Cabecera Tapizada', 'Tapizado en terciopelo con botones decorativos. Disponible para camas de 1.5 y 2 plazas.', 2, 420.00, 580.00, 'img/producto1.jpg', 10, 0, 'Terciopelo y madera', '160x120 cm', '12 kg', 'Verde'),

-- Oficina (categoria_id = 3)
(8, 'Silla Ergonómica Pro', 'Soporte lumbar ajustable, reposabrazos 4D, altura neumática y malla transpirable de alta calidad.', 3, 290.00, NULL, 'img/producto4.jpg', 25, 0, 'Malla y plástico', '60x60x110 cm', '15 kg', 'Negro'),
(9, 'Escritorio en L', 'Superficie amplia en forma de L con gestión de cables integrada. Ideal para home office productivo.', 3, 750.00, NULL, 'img/producto3.jpg', 7, 1, 'MDF y metal', '150x150x75 cm', '40 kg', 'Negro'),
(10, 'Archivador Metálico', '3 cajones con cerradura, riel telescópico y base con ruedas. Capacidad para carpetas A4 y oficio.', 3, 290.00, 380.00, 'img/producto2.jpg', 14, 0, 'Acero', '40x60x100 cm', '20 kg', 'Gris'),

-- Comedor (categoria_id = 4)
(11, 'Mesa Comedor 6 Personas', 'Tablero de madera maciza con patas metálicas. Diseño robusto y elegante para reuniones familiares.', 4, 1100.00, NULL, 'img/producto1.jpg', 5, 0, 'Madera maciza y metal', '180x90x75 cm', '50 kg', 'Nogal'),
(12, 'Sillas Comedor x4', 'Set de 4 sillas tapizadas en cuero sintético. Estructura de acero negro mate, fácil limpieza.', 4, 560.00, NULL, 'img/producto5.jpg', 8, 0, 'Cuero sintético y acero', '45x50x90 cm', '24 kg (total)', 'Negro'),
(13, 'Vitrina Vajillera', 'Puertas de vidrio templado con luz LED interior. Exhibe tu vajilla con elegancia. 4 repisas.', 4, 720.00, 920.00, 'img/producto6.jpg', 4, 0, 'Madera y vidrio', '120x40x180 cm', '55 kg', 'Blanco'),

-- Cocina (categoria_id = 5)
(14, 'Isla de Cocina', 'Con tablero de granito, 2 cajones y espacio inferior abierto. Incluye 2 taburetes altos a juego.', 5, 1350.00, NULL, 'img/producto2.jpg', 3, 1, 'Granito y madera', '150x80x90 cm', '80 kg', 'Negro/Gris'),
(15, 'Alacena Superior', 'Mueble superior para cocina con 2 puertas abatibles. Acabado melamínico resistente a la humedad.', 5, 280.00, NULL, 'img/producto3.jpg', 20, 0, 'Melamina', '80x35x70 cm', '15 kg', 'Blanco'),
(16, 'Taburete de Barra x2', 'Set de 2 taburetes con asiento acolchado giratorio y reposapiés. Altura regulable de 60 a 80 cm.', 5, 240.00, 320.00, 'img/producto4.jpg', 16, 0, 'Metal y cuero sintético', '35x35x75 cm', '10 kg (total)', 'Negro');

-- imagenes secundarias de demostracion
INSERT INTO `producto_imagenes` (`producto_id`, `imagen`) VALUES
(1, 'img/producto1_detalle1.jpg'),
(1, 'img/producto1_detalle2.jpg'),
(5, 'img/producto5_detalle1.jpg'),
(9, 'img/producto3_detalle1.jpg');

-- etiquetas de demostracion
INSERT INTO `producto_etiquetas` (`producto_id`, `etiqueta`) VALUES
(1, 'sala'), (1, 'sofa'), (1, 'destacado'),
(2, 'sala'), (2, 'mesa'), (2, 'madera'),
(5, 'dormitorio'), (5, 'comoda'),
(8, 'oficina'), (8, 'silla'), (8, 'ergonomico'),
(9, 'oficina'), (9, 'escritorio'), (9, 'destacado'),
(14, 'cocina'), (14, 'isla'), (14, 'granito');

-- usuario administrador base
-- contraseña encriptada equivale a 'admin123' usando hash bcrypt de 12 rondas
INSERT INTO `usuarios` (`nombre`, `email`, `password`, `rol`, `activo`) VALUES
('Administrador', 'admin@muebleriatrujillo.com', '$2a$12$e0M2/1aT044gPugwH49.O.X6jR6jA/G.uEaA59U7137Z22kO3uTfe', 'admin', 1);

-- registros de contacto de ejemplo
INSERT INTO `contactos` (`nombre`, `email`, `telefono`, `asunto`, `mensaje`, `pais`, `tipo`, `categoria_interes`, `leido`, `respondido`) VALUES
('Juan Pérez', 'juan.perez@email.com', '987654321', 'Cotización de Sofá', 'Buenas tardes, desearía saber el costo de envío a Arequipa del Sofá de 3 cuerpos. Muchas gracias.', 'Perú', 'cliente', 'Sala', 1, 0),
('María Gómez', 'maria.gomez@email.com', '912345678', 'Consulta sobre Escritorio', 'Hola, ¿el escritorio en L viene armado o en caja desmontado?', 'Perú', 'cliente', 'Oficina', 0, 0);

-- ====================================================================
-- FIN DEL SCRIPT SQL
-- ====================================================================
