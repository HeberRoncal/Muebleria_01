<?php
/**
 * BACKEND DE AUTENTICACIÓN (PHP + MySQL)
 * Diseñado para XAMPP (Apache y MySQL)
 * Proporciona endpoints seguros de Registro y Login con respuestas JSON y prevención de inyecciones SQL
 */

// 1. Configuración de cabeceras para respuestas API JSON y CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Iniciar sesión PHP de forma segura
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    // Habilitar cookie segura en HTTPS si está disponible
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', 1);
    }
    session_start();
}

// Manejar preflight OPTIONS de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. Conexión a la base de datos MySQL mediante PDO (XAMPP por defecto)
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
    // Si la base de datos no existe, intentar crearla
    try {
        $temp_pdo = new PDO("mysql:host=$host;charset=$charset", $user, $pass, $options);
        $temp_pdo->exec("CREATE DATABASE IF NOT EXISTS `muebleria_trujillo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $ex) {
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Error de conexión a la base de datos: ' . $ex->getMessage()
        ]);
        exit;
    }
}

// 3. Crear la tabla de usuarios si no existe y poblarla con el admin por defecto
try {
    $tabla_sql = "
    CREATE TABLE IF NOT EXISTS `usuarios_auth` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `nombre_completo` VARCHAR(100) NOT NULL,
        `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE,
        `correo_electronico` VARCHAR(150) NOT NULL UNIQUE,
        `contraseña_encriptada` VARCHAR(255) NOT NULL,
        `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($tabla_sql);

    // Verificar si ya existe el administrador en la tabla
    $stmt = $pdo->prepare("SELECT id FROM usuarios_auth WHERE correo_electronico = ?");
    $stmt->execute(['admin@muebleriatrujillo.com']);
    if (!$stmt->fetch()) {
        // Encriptar contraseña por defecto 'admin123'
        $hash_admin = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt_seed = $pdo->prepare("
            INSERT INTO usuarios_auth (nombre_completo, nombre_usuario, correo_electronico, contraseña_encriptada) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt_seed->execute(['Administrador', 'admin', 'admin@muebleriatrujillo.com', $hash_admin]);
    }
} catch (\PDOException $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al inicializar la tabla de usuarios: ' . $e->getMessage()
    ]);
    exit;
}

// 4. Leer cuerpo de la solicitud JSON (Fetch API envía JSON)
$input_raw = file_get_contents('php://input');
$data = json_decode($input_raw, true);

// Si no es JSON válido, intentar leer de $_POST (formularios tradicionales)
if (!$data) {
    $data = $_POST;
}

// Determinar la acción solicitada
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ====================================================================
// ACCIÓN: REGISTRO DE USUARIOS
// ====================================================================
if ($action === 'registro') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido. Use POST.']);
        exit;
    }

    $nombre = isset($data['nombre_completo']) ? trim($data['nombre_completo']) : '';
    $username = isset($data['nombre_usuario']) ? trim($data['nombre_usuario']) : '';
    $email = isset($data['correo_electronico']) ? trim($data['correo_electronico']) : '';
    $password = isset($data['password']) ? $data['password'] : '';
    $password_confirm = isset($data['password_confirm']) ? $data['password_confirm'] : '';

    // Validaciones del lado del servidor (Defensa en Profundidad)
    if (empty($nombre) || empty($username) || empty($email) || empty($password)) {
        echo json_encode(['exito' => false, 'mensaje' => 'Todos los campos son obligatorios.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['exito' => false, 'mensaje' => 'Formato de correo electrónico inválido.']);
        exit;
    }

    if (strlen($username) < 3) {
        echo json_encode(['exito' => false, 'mensaje' => 'El nombre de usuario debe tener al menos 3 caracteres.']);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode(['exito' => false, 'mensaje' => 'La contraseña debe tener al menos 6 caracteres.']);
        exit;
    }

    if ($password !== $password_confirm) {
        echo json_encode(['exito' => false, 'mensaje' => 'Las contraseñas no coinciden.']);
        exit;
    }

    try {
        // Verificar si el usuario o correo ya existen (Prepared Statements previenen SQL injection)
        $stmt = $pdo->prepare("SELECT id FROM usuarios_auth WHERE correo_electronico = ? OR nombre_usuario = ?");
        $stmt->execute([$email, $username]);
        if ($stmt->fetch()) {
            echo json_encode(['exito' => false, 'mensaje' => 'El nombre de usuario o correo electrónico ya están registrados.']);
            exit;
        }

        // Cifrar la contraseña con BCRYPT (Costo 12 para alta seguridad)
        $hash_password = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        // Insertar nuevo usuario
        $stmt_insert = $pdo->prepare("
            INSERT INTO usuarios_auth (nombre_completo, nombre_usuario, correo_electronico, contraseña_encriptada) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt_insert->execute([$nombre, $username, $email, $hash_password]);

        // Registrar sesión automáticamente
        $userId = $pdo->lastInsertId();
        
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['nombre'] = $nombre;

        echo json_encode([
            'exito' => true,
            'mensaje' => 'Registro e inicio de sesión exitosos.',
            'usuario' => [
                'id' => $userId,
                'nombre_completo' => $nombre,
                'nombre_usuario' => $username,
                'correo_electronico' => $email
            ]
        ]);
        exit;

    } catch (\PDOException $e) {
        echo json_encode(['exito' => false, 'mensaje' => 'Error interno al registrar el usuario: ' . $e->getMessage()]);
        exit;
    }
}

// ====================================================================
// ACCIÓN: INICIO DE SESIÓN (LOGIN)
// ====================================================================
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido. Use POST.']);
        exit;
    }

    $correo_o_usuario = isset($data['correo_o_usuario']) ? trim($data['correo_o_usuario']) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if (empty($correo_o_usuario) || empty($password)) {
        echo json_encode(['exito' => false, 'mensaje' => 'Todos los campos son obligatorios.']);
        exit;
    }

    try {
        // Buscar usuario por correo electrónico o nombre de usuario
        $stmt = $pdo->prepare("SELECT * FROM usuarios_auth WHERE correo_electronico = ? OR nombre_usuario = ?");
        $stmt->execute([$correo_o_usuario, $correo_o_usuario]);
        $user = $stmt->fetch();

        // Verificar existencia y comparar hash de la contraseña de forma segura
        if ($user && password_verify($password, $user['contraseña_encriptada'])) {
            
            // Regenerar ID de sesión para evitar Session Fixation
            session_regenerate_id(true);
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['nombre_usuario'];
            $_SESSION['nombre'] = $user['nombre_completo'];

            echo json_encode([
                'exito' => true,
                'mensaje' => 'Inicio de sesión exitoso.',
                'usuario' => [
                    'id' => $user['id'],
                    'nombre_completo' => $user['nombre_completo'],
                    'nombre_usuario' => $user['nombre_usuario'],
                    'correo_electronico' => $user['correo_electronico']
                ]
            ]);
            exit;
        } else {
            echo json_encode(['exito' => false, 'mensaje' => 'Usuario o contraseña incorrectos.']);
            exit;
        }

    } catch (\PDOException $e) {
        echo json_encode(['exito' => false, 'mensaje' => 'Error interno al procesar el ingreso: ' . $e->getMessage()]);
        exit;
    }
}

// ====================================================================
// ACCIÓN: OBTENER PERFIL DEL USUARIO DE SESIÓN
// ====================================================================
if ($action === 'perfil') {
    if (isset($_SESSION['user_id'])) {
        try {
            $stmt = $pdo->prepare("SELECT id, nombre_completo, nombre_usuario, correo_electronico, fecha_registro FROM usuarios_auth WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if ($user) {
                echo json_encode(['autenticado' => true, 'usuario' => $user]);
                exit;
            }
        } catch (\PDOException $e) {
            // Error silencioso, responder no autenticado
        }
    }
    echo json_encode(['autenticado' => false, 'mensaje' => 'No hay sesión activa.']);
    exit;
}

// ====================================================================
// ACCIÓN: CERRAR SESIÓN (LOGOUT)
// ====================================================================
if ($action === 'logout') {
    $_SESSION = array();
    
    // Destruir la cookie de sesión si existe
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    session_destroy();
    echo json_encode(['exito' => true, 'mensaje' => 'Sesión cerrada correctamente.']);
    exit;
}

// Si la ruta o acción no corresponde a ninguna conocida
echo json_encode([
    'exito' => false,
    'mensaje' => 'Endpoint no válido. Acciones soportadas: login, registro, perfil, logout.'
]);
exit;
