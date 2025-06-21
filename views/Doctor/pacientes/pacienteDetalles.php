<?php
session_start();
require_once __DIR__ . '/../../../models/Pacientes/PacienteModel.php';
require_once __DIR__ . '/../../../models/Citas/CitasModel.php';

if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: http://localhost/SistemaClinico/views/login.php");
    exit();
}
$idusuario = $_SESSION['idusuario'];

$idpaciente = isset($_GET['idpaciente']) ? $_GET['idpaciente'] : null;
$paciente = null;
if ($idpaciente) {
    $pacienteModel = new PacientesModel();
    $paciente = $pacienteModel->obtenerPacientePorId($idpaciente);
    if (!$paciente) {
        echo '<div class="alert alert-danger">No se encontró el paciente.</div>';
        return;
    }
}
$idcita = isset($_GET['idcita']) ? $_GET['idcita'] : null;
$cita = null;
if ($idcita) {
    $citaModel = new CitasModel();
    $cita = $citaModel->obtenerCitaPorId($idcita);
    if (!$cita) {
        echo '<div class="alert alert-danger">No se encontró la cita.</div>';
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
    <link rel="stylesheet" href="../../../assets/css/barracitas.css">
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
                                            <div class="detalles-row">
                                                <input type="hidden" id="pacienteId" value="<?= htmlspecialchars($idpaciente) ?>">
                                                <input type="hidden" id="citaId" value="<?= htmlspecialchars($idcita) ?>">
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
                                                <div class="cabecera-body">
                                                    <span class="cabecera-titulo">Historial clínico</span>
                                                    <span class="cabecera-subtitulo">Inicia tu evaluación aquí</span>
                                                </div>
                                            </div>
                                            <div class="container-body" id="pacienteHistorial">
                                                <div class="historial-elements">
                                                    <div id="iniciarEvaluacionPsicológica" class="historial-element">
                                                        <div class="historial-bloque">
                                                            <svg id="INFO_PACIENTE" data-name="INFO PACIENTE" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.82 25.86" style="width: 24px; height: 24px;">
                                                                <defs>
                                                                    <style>
                                                                        .cls-015 {
                                                                            fill: none;
                                                                            stroke: #76869e;
                                                                            stroke-linecap: round;
                                                                            stroke-linejoin: round;
                                                                            stroke-width: 1.51px;
                                                                        }
                                                                    </style>
                                                                </defs>
                                                                <g id="g121">
                                                                    <g id="g127">
                                                                        <path id="path129" class="cls-015" d="M15.33,3.5c.9.23,1.74.58,2.52,1.04,0,0,.37-.37.79-.79.31-.3.72-.48,1.15-.48s.85.17,1.15.48c.37.37.78.78,1.15,1.15.31.3.48.72.48,1.15s-.17.84-.48,1.15c-.42.42-.79.79-.79.79.46.77.81,1.62,1.05,2.51h1.09c.9,0,1.62.73,1.62,1.62v1.64c0,.9-.73,1.62-1.62,1.62h-1.09c-.23.89-.59,1.74-1.05,2.51,0,0,.37.37.79.79.31.3.48.72.48,1.15s-.18.86-.49,1.16l-1.11,1.11c-.31.32-.73.49-1.17.49s-.85-.17-1.15-.48c-.42-.42-.79-.79-.79-.79-.78.46-1.62.81-2.52,1.04v1.12c0,.9-.73,1.62-1.62,1.62h-1.64c-.9,0-1.62-.73-1.62-1.62v-1.09c-.89-.23-1.73-.59-2.5-1.05,0,0-.37.37-.79.79-.3.31-.71.48-1.14.48s-.84-.17-1.14-.48c-.37-.37-.77-.78-1.14-1.15-.3-.31-.47-.72-.47-1.15s.17-.85.47-1.15c.42-.42.79-.79.79-.79-.46-.78-.81-1.62-1.04-2.52h-1.11c-.9,0-1.62-.73-1.62-1.62v-1.64c0-.9.73-1.62,1.62-1.62h1.05c.23-.89.59-1.74,1.05-2.51,0,0-.37-.37-.79-.79-.31-.3-.48-.72-.48-1.15s.17-.84.48-1.15c.37-.37.78-.78,1.15-1.15.31-.3.72-.48,1.15-.48s.85.17,1.15.48c.42.42.79.79.79.79.78-.46,1.62-.81,2.52-1.04v-1.12c0-.9.73-1.62,1.62-1.62h1.64c.9,0,1.62.73,1.62,1.62v1.12Z" />
                                                                    </g>
                                                                    <g id="g131">
                                                                        <path id="path133" class="cls-015" d="M12.91,8.07c2.69,0,4.87,2.18,4.87,4.87s-2.18,4.87-4.87,4.87-4.87-2.18-4.87-4.87,2.18-4.87,4.87-4.87Z" />
                                                                    </g>
                                                                </g>
                                                            </svg>
                                                            <span class="texto-bloque">Evaluación Psicológica</span>
                                                        </div>
                                                        <button class="btn btn-default">Iniciar</button>
                                                    </div>
                                                    <div id="iniciarEvaluacionFísica" class="historial-element">
                                                        <div class="historial-bloque">
                                                            <svg id="INFO_PACIENTE" data-name="INFO PACIENTE" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.82 25.86" style="width: 24px; height: 24px;">
                                                                <defs>
                                                                    <style>
                                                                        .cls-015 {
                                                                            fill: none;
                                                                            stroke: #76869e;
                                                                            stroke-linecap: round;
                                                                            stroke-linejoin: round;
                                                                            stroke-width: 1.51px;
                                                                        }
                                                                    </style>
                                                                </defs>
                                                                <g id="g121">
                                                                    <g id="g127">
                                                                        <path id="path129" class="cls-015" d="M15.33,3.5c.9.23,1.74.58,2.52,1.04,0,0,.37-.37.79-.79.31-.3.72-.48,1.15-.48s.85.17,1.15.48c.37.37.78.78,1.15,1.15.31.3.48.72.48,1.15s-.17.84-.48,1.15c-.42.42-.79.79-.79.79.46.77.81,1.62,1.05,2.51h1.09c.9,0,1.62.73,1.62,1.62v1.64c0,.9-.73,1.62-1.62,1.62h-1.09c-.23.89-.59,1.74-1.05,2.51,0,0,.37.37.79.79.31.3.48.72.48,1.15s-.18.86-.49,1.16l-1.11,1.11c-.31.32-.73.49-1.17.49s-.85-.17-1.15-.48c-.42-.42-.79-.79-.79-.79-.78.46-1.62.81-2.52,1.04v1.12c0,.9-.73,1.62-1.62,1.62h-1.64c-.9,0-1.62-.73-1.62-1.62v-1.09c-.89-.23-1.73-.59-2.5-1.05,0,0-.37.37-.79.79-.3.31-.71.48-1.14.48s-.84-.17-1.14-.48c-.37-.37-.77-.78-1.14-1.15-.3-.31-.47-.72-.47-1.15s.17-.85.47-1.15c.42-.42.79-.79.79-.79-.46-.78-.81-1.62-1.04-2.52h-1.11c-.9,0-1.62-.73-1.62-1.62v-1.64c0-.9.73-1.62,1.62-1.62h1.05c.23-.89.59-1.74,1.05-2.51,0,0-.37-.37-.79-.79-.31-.3-.48-.72-.48-1.15s.17-.84.48-1.15c.37-.37.78-.78,1.15-1.15.31-.3.72-.48,1.15-.48s.85.17,1.15.48c.42.42.79.79.79.79.78-.46,1.62-.81,2.52-1.04v-1.12c0-.9.73-1.62,1.62-1.62h1.64c.9,0,1.62.73,1.62,1.62v1.12Z" />
                                                                    </g>
                                                                    <g id="g131">
                                                                        <path id="path133" class="cls-015" d="M12.91,8.07c2.69,0,4.87,2.18,4.87,4.87s-2.18,4.87-4.87,4.87-4.87-2.18-4.87-4.87,2.18-4.87,4.87-4.87Z" />
                                                                    </g>
                                                                </g>
                                                            </svg>
                                                            <span class="texto-bloque">Evaluación Física</span>
                                                        </div>
                                                        <button class="btn btn-default">Iniciar</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="paciente-container">
                                        <div class="container-cabecera">
                                            <div class="cabecera-body">
                                                <span class="cabecera-titulo">Resumen del paciente</span>
                                                <span class="cabecera-subtitulo">Aquí podrás visualizar los datos de la última sesión realizada</span>
                                            </div>
                                        </div>
                                        <div class="ultimo-resumen" id="resumenUltimaCita">
                                            El paciente seleccionado aún no tiene citas de consulta agendadas con usted. En cuanto las tenga, podrá editar su resumen aquí.
                                        </div>
                                    </div>
                                </div>
                                <div class="resumen-container">
                                    <div id="editorResumen" class="paciente-container" style="display: none;">
                                        <div class="container-cabecera">
                                            <span class="cabecera-titulo">RESUMEN DEL PACIENTE</span>
                                        </div>
                                        <div id="editor"></div>
                                        <div class="botones-resumen">
                                            <button class="btn" id="btnCancelarResumen">Cancelar</button>
                                            <button class="btn btn-default" id="btnGuardarResumen">Guardar</button>
                                        </div>
                                    </div>
                                    <div id="pacienteResumenes" class="paciente-resumenes" style="display:none;"></div>
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
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script type="module" src="../../../assets/js/especialistas/barraCitas.js"></script>
<script type="module" src="../../../assets/js/paciente/pacienteDetalles.js"></script>

</html>