<?php
session_start();
require_once __DIR__ . '/../../../models/Pacientes/PacienteModel.php';

if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: http://localhost/SistemaClinico/views/login.php");
    exit();
}
$idusuario = $_SESSION['idusuario'];

$id = isset($_GET['id']) ? $_GET['id'] : null;
$paciente = null;
if ($id) {
    $pacienteModel = new PacientesModel();
    $paciente = $pacienteModel->obtenerPacientePorId($id);
    if (!$paciente) {
        echo '<div class="alert alert-danger">No se encontró el paciente.</div>';
        return;
    }
}
?>
<!DOCTYPE html>
<html lang='es'>

<head>
    <meta charset='utf-8' />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/general.css">
    <link rel="stylesheet" href="../../../assets/css/agenda.css">
    <link rel="stylesheet" href="../../../assets/css/resumen-paciente.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />
</head>

<body>
    <div>
        <div class="caja-principal" style="min-height: 100%;">
            <div class="lado-izquierdo">
                <?php include '../../../sections/menu.php'; ?>
            </div>
            <div class="lado-derecho">
                <?php include '../../../sections/header.php'; ?>
                <input type="hidden" id="idUsuario" value="<?php echo $idusuario; ?>" />
                <div class="page p-4">

                    <div class="d-flex flex-grow-1 overflow-hidden">
                        <div style="width:80%">
                            <div class="main-container">
                                <div class="detalles-container">
                                    <div class="paciente-detalles-container">
                                        <div class="paciente-detalles-main">
                                            <div class="paciente-detalles-row mb-4">
                                                <img id="pacienteFoto" src="<?= htmlspecialchars($paciente['foto']) ?>" width="100px" height="100px"></img>
                                                <div class="paciente-detalles">
                                                    <span id="pacienteNombre" class="subtitle-bold"><?= htmlspecialchars($paciente['nombres']) . ' ' . htmlspecialchars($paciente['apellidos']) ?></span>
                                                    <span id="pacienteEdad"><?= htmlspecialchars($paciente['fecha_nacimiento']) ?></span>
                                                    <span id="pacienteDni">DNI: <?= htmlspecialchars($paciente['dni']) ?></span>
                                                </div>
                                            </div>
                                            <div class="paciente-detalles">
                                                <div id="datosApoderadoTitle" class="subtitle-bold">Datos del apoderado (<?= htmlspecialchars($paciente['parentezco']) ?>)</div>
                                                <ul id="datosApoderado">
                                                    <li>Nombres y apellidos: <?= htmlspecialchars($paciente['apoderado_nombres']) . ' ' . htmlspecialchars($paciente['apoderado_apellidos']) ?></li>
                                                    <li>DNI: <?= htmlspecialchars($paciente['apoderado_dni']) ?></li>
                                                    <li>Celular: <?= htmlspecialchars($paciente['apoderado_telefono']) ?></li>
                                                    <li>Correo: <?= htmlspecialchars($paciente['apoderado_correo']) ?></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <button class="paciente-opciones"><i class="bi bi-three-dots"></i></i></button>
                                    </div>
                                    <div class="paciente-historial">
                                        <div class="paciente-container">
                                            <div class="container-cabecera">
                                                <span class="cabecera-titulo">HISTORIAL CLÍNICO</span>
                                                <button id="btnCompletarFormulario" class="btn completar-formulario">
                                                    <svg id="INFO_PACIENTE" data-name="INFO PACIENTE" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.83 10.85" style="height: 9px; width: 9px">
                                                        <defs>
                                                            <style>
                                                                .cls-014 {
                                                                    fill: none;
                                                                    stroke: #fff;
                                                                    stroke-linecap: round;
                                                                    stroke-linejoin: round;
                                                                    stroke-width: .85px;
                                                                }
                                                            </style>
                                                        </defs>
                                                        <g id="Quote_request" data-name="Quote request">
                                                            <path class="cls-014" d="M3.01,10.41h-1.74c-.47,0-.85-.38-.85-.85V1.27c0-.47.38-.85.85-.85h4.06c.23,0,.45.09.6.25l.85.85c.15.15.25.36.25.6v2.33" />
                                                            <path class="cls-014" d="M8.96,4.91c.33-.33.87-.33,1.2,0,.33.33.33.87,0,1.2l-3.5,3.5c-.06.06-.13.11-.21.15l-1.19.62c-.16.08-.36.06-.49-.08-.13-.13-.16-.33-.08-.49l.62-1.19c.04-.08.09-.15.15-.21l3.5-3.5Z" />
                                                            <line class="cls-014" x1="2.12" y1="3.64" x2="5.33" y2="3.64" />
                                                            <line class="cls-014" x1="2.12" y1="5.33" x2="5.33" y2="5.33" />
                                                            <line class="cls-014" x1="2.12" y1="7.03" x2="3.64" y2="7.03" />
                                                        </g>
                                                    </svg>
                                                    Completar formulario</button>
                                            </div>
                                            <div class="container-body" id="pacienteHistorial"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="resumen-container">
                                    <div class="paciente-container">
                                        <div class="container-cabecera">
                                            <span class="cabecera-titulo">RESUMEN DEL PACIENTE</span>
                                        </div>
                                        <div id="editor"></div>
                                    </div>
                                    <div class="paciente-resumenes"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="sidebar p-3">
                            <?php include '../agenda/barraCitas.php' ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>
<script type="module" src="../../../assets/js/especialistas/barraCitas.js"></script>
<script type="module" src="../../../assets/js/paciente/pacienteDetalles.js"></script>
<script>
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Empieza a escribir...',
    });
</script>

</html>