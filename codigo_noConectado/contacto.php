<?php
/**
 * FORMULARIO DE CONTACTO BACKEND (PHP + MySQL)
 * Diseñado para XAMPP (Apache y MySQL)
 * Registra los mensajes de contacto de forma asíncrona y segura (Prepared Statements)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. Conexión PDO a MySQL (mismo esquema de XAMPP)
$host = 'localhost';
$db   = 'muebleria_trujillo';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error de conexión con la base de datos: ' . $e->getMessage()
    ]);
    exit;
}

// Asegurar que la tabla `contactos` exista en la base de datos
try {
    $tabla_sql = "
    CREATE TABLE IF NOT EXISTS `contactos` (
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
    ";
    $pdo->exec($tabla_sql);
} catch (\PDOException $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al inicializar la tabla de contactos: ' . $e->getMessage()
    ]);
    exit;
}

// 2. Leer entrada JSON
$input_raw = file_get_contents('php://input');
$data = json_decode($input_raw, true);

if (!$data) {
    $data = $_POST;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = isset($data['nombre']) ? trim($data['nombre']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $asunto = isset($data['asunto']) ? trim($data['asunto']) : '';
    $telefono = isset($data['telefono']) ? trim($data['telefono']) : '';
    $mensaje = isset($data['mensaje']) ? trim($data['mensaje']) : '';
    $pais_code = isset($data['pais']) ? trim($data['pais']) : '';
    $tipo = isset($data['tipo']) ? trim($data['tipo']) : 'cliente';
    $categoria = isset($data['categoria']) ? trim($data['categoria']) : '';

    // Validar campos obligatorios
    if (empty($nombre) || empty($email) || empty($asunto) || empty($mensaje)) {
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Por favor complete todos los campos obligatorios (Nombre, Email, Asunto y Mensaje).'
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Por favor ingrese un correo electrónico válido.'
        ]);
        exit;
    }

    // Traducir código de país a nombre completo
    $paises = [
        'MX' => 'México',
        'PR' => 'Perú',
        'CO' => 'Colombia',
        'AR' => 'Argentina',
        'ES' => 'España',
        'CL' => 'Chile'
    ];
    $pais = isset($paises[$pais_code]) ? $paises[$pais_code] : 'Perú';

    // Validar enum de tipo
    if (!in_array($tipo, ['cliente', 'proveedor', 'otro'])) {
        $tipo = 'cliente';
    }

    try {
        // Insertar en la base de datos de manera 100% segura contra inyecciones SQL
        $stmt = $pdo->prepare("
            INSERT INTO contactos (nombre, email, telefono, asunto, mensaje, pais, tipo, categoria_interes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $nombre,
            $email,
            empty($telefono) ? null : $telefono,
            $asunto,
            $mensaje,
            $pais,
            $tipo,
            empty($categoria) ? null : $categoria
        ]);

        echo json_encode([
            'exito' => true,
            'mensaje' => '¡Tu mensaje ha sido enviado correctamente! Un asesor de Mueblería Trujillo se pondrá en contacto contigo a la brevedad.'
        ]);
        exit;

    } catch (\PDOException $e) {
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Error interno al procesar el mensaje: ' . $e->getMessage()
        ]);
        exit;
    }
} else {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Método no permitido.'
    ]);
    exit;
}
