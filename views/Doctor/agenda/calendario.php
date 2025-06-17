<?php
session_start();
require_once __DIR__ . '/../../../models/Areas/AreaModel.php';
require_once __DIR__ . '/../../../models/Subareas/SubareaModel.php';
require_once __DIR__ . '/../../../models/Servicios/ServicioModel.php';
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';

if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: http://localhost/SistemaClinico/views/login.php");
    exit();
}
$idusuario = $_SESSION['idusuario'];
?>
<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='utf-8' />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/calendar.css">
    <link rel="stylesheet" href="../../../assets/css/general.css">
    <link rel="stylesheet" href="../../../assets/css/agenda.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
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
                            <div class="calendar-toolbar" style="display: flex; justify-content: center; align-items: center; padding: 1rem;">
                                <div class="page-header w-100 d-flex justify-content-center align-items-center my-3">
                                    <div class="calendar-actions" style="display: flex; gap: 1rem; align-items: center;">
                                        <div class="minicalendar-button">
                                            <button id="btnAbrirCalendario" class="btn btn-sm btn-light btn-calendario"><i class="bi bi-calendar"></i></button>
                                            <div class="minicalendar-modal" style="display: none;">
                                                <div id="mini-calendar"></div>
                                            </div>
                                        </div>
                                        <div class="calendar-nav d-flex align-items-center gap-2">
                                            <button id="prev-week" class="btn btn-light btn-sm"><!-- Generator: Adobe Illustrator 25.2.3, SVG Export Plug-In  -->
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="6.66px"
                                                    height="7.59px" viewBox="0 0 6.66 7.59" style="overflow:visible;enable-background:new 0 0 6.66 7.59;" xml:space="preserve">
                                                    <style type="text/css">
                                                        .st0 {
                                                            fill: #76869E;
                                                        }
                                                    </style>
                                                    <defs>
                                                    </defs>
                                                    <path class="st0" d="M0.17,4.09l5.99,3.46c0.23,0.13,0.51-0.03,0.51-0.29V0.34c0-0.26-0.28-0.42-0.51-0.29L0.17,3.5
	C-0.06,3.63-0.06,3.96,0.17,4.09z" />
                                                </svg>
                                            </button>
                                            <div id="calendar-dates" style="font-weight: bold; min-width: 220px; text-align: center;"></div>
                                            <button id="next-week" class="btn btn-light btn-sm">
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="6.66px"
                                                    height="7.59px" viewBox="0 0 6.66 7.59" style="overflow:visible;enable-background:new 0 0 6.66 7.59;" xml:space="preserve">
                                                    <style type="text/css">
                                                        .st1 {
                                                            fill: #76869E;
                                                        }
                                                    </style>
                                                    <defs>
                                                    </defs>
                                                    <path class="st1" d="M6.49,3.5L0.51,0.05C0.28-0.08,0,0.08,0,0.34v6.91c0,0.26,0.28,0.42,0.51,0.29l5.99-3.46
	C6.72,3.96,6.72,3.63,6.49,3.5z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <!-- <button class="btn-add-cita">+ Nueva cita</button> -->
                                    </div>
                                </div>
                            </div>
                            <div id="calendar" class="flex-grow-1 h-100 overflow-auto"></div>
                        </div>
                        <!-- Sidebar -->
                        <div class="calendar-sidebar p-3">
                            <div id="modalCita" class="modal-cita-custom">
                                <div class="citas-navigation" style="display:flex; justify-content: end; margin-bottom: 16px; gap: 8px;">
                                    <div class="minicalendar-button">
                                        <button id="btnAbrirCalendarioCita" class="btn btn-sm btn-light btn-calendario"><i class="bi bi-calendar"></i></button>
                                        <div class="minicalendar-modal" style="display: none;">
                                            <div id="mini-calendar-cita"></div>
                                        </div>
                                    </div>
                                    <button id="prev-day" class="btn btn-light btn-sm">
                                        <svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.66 7.59" style="height: 10.1px; width: 8.9px;">
                                            <defs>
                                                <style>
                                                    .cls-001 {
                                                        fill: #76869e;
                                                    }
                                                </style>
                                            </defs>
                                            <path class="cls-001" d="M.17,4.09l5.99,3.46c.23.13.51-.03.51-.29V.34c0-.26-.28-.42-.51-.29L.17,3.5c-.23.13-.23.46,0,.59Z" />
                                        </svg>
                                    </button>
                                    <button id="next-day" class="btn btn-light btn-sm">
                                        <svg id="agenda_especialista" data-name="agenda especialista" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.66 7.59" style="height: 10.1px; width: 8.9px;">
                                            <defs>
                                                <style>
                                                    .cls-002 {
                                                        fill: #76869e;
                                                    }
                                                </style>
                                            </defs>
                                            <path class="cls-002" d="M6.49,3.5L.51.05c-.23-.13-.51.03-.51.29v6.91c0,.26.28.42.51.29l5.99-3.46c.23-.13.23-.46,0-.59Z" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="subtitulo mb-4">CITAS DEL DÍA</div>
                                <div class="citas-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="usuarioModal" tabindex="-1"
        aria-labelledby="usuarioModalLabel" aria-hidden="true"
        data-bs-backdrop="static" data-bs-keyboard="false">

        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-body" id="usuarioModalBody">
                </div>
                <div class="modal-footer justify-content-left">
                    <div id="botonesModal">
                        <button type="button" class="btn btn-secondary btn-cancelar" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary btn-guardar" id="btnGuardarPaciente">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script type="module" src="../../../assets/js/especialistas/agenda.js"></script>

</html>