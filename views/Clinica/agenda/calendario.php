<?php
session_start();
require_once __DIR__ . '/../../../models/Areas/AreaModel.php';
require_once __DIR__ . '/../../../models/Subareas/SubareaModel.php';
require_once __DIR__ . '/../../../models/Servicios/ServicioModel.php';
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';

$areamodel = new AreaModel();
$subareamodel = new SubareaModel();
$especialistamodel = new EspecialistaModel();
$serviciomodel = new ServicioModel();
$base_url = 'http://localhost/SistemaClinico/';
$areas = $areamodel->obtenerareas();
$servicios = $serviciomodel->obtenerservicios();
if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: " . $base_url . "views/login.php");
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
                <div class="page p-4">

                    <div class="d-flex flex-grow-1 overflow-hidden">
                        <div style="width:80%">
                            <div class="calendar-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
                                <div class="page-header w-100 d-flex justify-content-between align-items-center my-3">
                                    <div class="filtros d-flex align-items-center">
                                        <label for="filtro-servicio" class="filtro-title">Servicio</label>
                                        <select class="form-select filtro filtro-not-selected" id="filtro-servicio" style="background-color: #ff7e00; color: #fff !important;">
                                        </select>
                                        <label for="filtro-area" class="filtro-title">Área</label>
                                        <select class="form-select filtro filtro-not-selected" id="filtro-area">
                                            <option value="" disabled selected>Seleccionar</option>
                                            <?php
                                            foreach ($areas as $area) {
                                            ?>
                                                <option value="<?php echo htmlspecialchars($area['idarea']) ?>">
                                                    <?php echo htmlspecialchars($area['area']) ?></option>
                                            <?php
                                            }
                                            ?>
                                        </select>
                                        <label for="filtro-subarea" class="filtro-title" id="filtro-subarea-title">Subárea </label>
                                        <select class="form-select filtro filtro-not-selected" id="filtro-subarea" disabled>
                                            <option value="" disabled selected>Seleccionar</option>
                                        </select>
                                        <label for="filtro-especialista" class="filtro-title">Especialista</label>
                                        <select class="form-select filtro filtro-not-selected" id="filtro-especialista" disabled>
                                            <option value="" disabled selected>Seleccionar</option>
                                        </select>
                                    </div>
                                    <div class="calendar-actions" style="display: flex; gap: 1rem; align-items: center;">
                                        <div class="minicalendar-button">
                                            <button id="btnAbrirCalendario" class="btn btn-sm btn-light btn-calendario"><i class="bi bi-calendar"></i></button>
                                            <div class="minicalendar-modal" style="display: none;">
                                                <div id="mini-calendar"></div>
                                            </div>
                                        </div>
                                        <div class="calendar-nav d-flex align-items-center gap-2" style="max-width: 220px;">
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
                                            <div id="calendar-dates" style="font-weight: bold; text-align: center;"></div>
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
                                <div class="modal-cita-header">
                                    <h2 id="1">Nueva Cita</h2>
                                    <h2 id="2">Reprogramaciones</h2>
                                </div>
                                <div class="busqueda-paciente">
                                    <div class="input-icon">

                                        <input type="text" id="searchPaciente" placeholder="Buscar paciente" />
                                        <div id="resultadoPacientes" class="resultado-pacientes"></div>
                                    </div>
                                    <button id="btnAddPaciente" class="btn-icon" title="Agregar nuevo paciente" data-bs-toggle="modal" data-bs-target="#usuarioModal">

                                        <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.75 17.75">
                                            <defs>
                                                <style>
                                                    .cls-1add,
                                                    .cls-2add {
                                                        fill: #fff;
                                                        stroke: #f07e0b;
                                                        stroke-miterlimit: 10;
                                                        stroke-width: .75px;
                                                    }

                                                    .cls-2add {
                                                        fill-rule: evenodd;
                                                    }
                                                </style>
                                            </defs>
                                            <path class="cls-1add" d="M3.77,5.47c0-.47.38-.85.85-.85h.85v-.85c0-.47.38-.85.85-.85s.85.38.85.85v.85h.85c.47,0,.85.38.85.85s-.38.85-.85.85h-.85v.85c0,.47-.38.85-.85.85s-.85-.38-.85-.85v-.85h-.85c-.47,0-.85-.38-.85-.85Z" />
                                            <path class="cls-2add" d="M2.92.38h6.8c1.41,0,2.55,1.14,2.55,2.55v2.66c1.47.38,2.55,1.71,2.55,3.29,0,.73-.23,1.4-.61,1.95,1.84.63,3.17,2.37,3.16,4.43,0,1.17-.95,2.12-2.12,2.12H2.92c-1.41,0-2.55-1.14-2.55-2.55V2.92C.38,1.52,1.52.38,2.92.38ZM5.52,15.67c-.03-.14-.04-.28-.04-.42,0-.44.06-.87.18-1.27h-.81c-.47,0-.85-.38-.85-.85s.38-.85.85-.85h1.92c.27-.32.58-.61.92-.85h-2.84c-.47,0-.85-.38-.85-.85s.38-.85.85-.85h3.19s.07,0,.11,0c-.07-.27-.11-.56-.11-.86,0-1.58,1.08-2.92,2.55-3.29v-2.66c0-.47-.38-.85-.85-.85H2.92c-.47,0-.85.38-.85.85v11.9c0,.47.38.85.85.85h2.59ZM9.94,8.94c0-.94.76-1.7,1.7-1.7s1.7.76,1.7,1.7-.76,1.7-1.7,1.7-1.7-.76-1.7-1.7ZM7.81,15.67c-.24,0-.43-.2-.42-.44.01-1.63,1.34-2.96,2.97-2.96h2.55c1.64,0,2.96,1.32,2.97,2.96,0,.24-.18.44-.42.44h-7.65Z" />
                                        </svg>
                                    </button>
                                </div>
                                <div id="subPacienteSeleccionado" class="subtitulo" style="display: none;">PACIENTE SELECCIONADO</div>
                                <div id="pacienteSeleccionado" class="paciente-seleccionado" style="display:none;">
                                    <img id="pacienteSelFoto" class="avatar-iniciales"></img>
                                    <div id="pacienteCita" class="paciente-cita">
                                        <div id="pacienteSelNombre" class="paciente-nombre"></div>
                                        <div id="pacienteSelDetalles" class="paciente-detalles">
                                            <span class="pacientesel-edad"></span>
                                            <span class="pacientesel-dni">
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" id="idUsuario" value=<?php echo $idusuario ?> />
                                <div id="modalNuevaCita">
                                    <div id="subCitasSeleccionadas" class="subtitulo">CITAS SELECCIONADAS</div>
                                    <div class="no-horarios-selected">No se han seleccionado citas.
                                        Seleccione sus citas en la agenda</div>
                                    <div class="modal-cita-body">
                                        <div id="horariosSeleccionados" class="citas-lista" style="max-height: 520px; overflow-y: auto;"></div>
                                        <div class="agregar-horario" style="display: none;">
                                            <div class="calendario">
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="12.34px"
                                                    height="12.34px" viewBox="0 0 12.34 12.34" style="overflow:visible;enable-background:new 0 0 12.34 12.34;"
                                                    xml:space="preserve">
                                                    <style type="text/css">
                                                        .st008 {
                                                            fill: #76869E;
                                                        }
                                                    </style>
                                                    <defs>
                                                    </defs>
                                                    <g>
                                                        <g>
                                                            <g>
                                                                <g>
                                                                    <rect x="5.69" y="5.54" class="st008" width="0.96" height="0.96" />
                                                                    <path class="st008" d="M10.9,0.96h-0.58V0H9.35v0.96H2.99V0H2.03v0.96H1.45C0.65,0.96,0,1.61,0,2.41v8.49
                    c0,0.8,0.65,1.45,1.45,1.45h3.21h0.07h1.68c-0.33-0.28-0.62-0.6-0.86-0.96H4.73H4.65H1.45c-0.27,0-0.48-0.22-0.48-0.48V4.53
                    h10.41V5.5v0.05v0c0.36,0.24,0.69,0.53,0.96,0.86V5.54V5.5V2.41C12.34,1.61,11.7,0.96,10.9,0.96z M11.38,3.57H0.96V2.41
                    c0-0.27,0.22-0.48,0.48-0.48h0.58v0.96h0.96V1.93h6.36v0.96h0.96V1.93h0.58c0.27,0,0.48,0.22,0.48,0.48V3.57z" />
                                                                    <path class="st008" d="M9.08,5.84c-1.79,0-3.25,1.46-3.25,3.25s1.46,3.25,3.25,3.25s3.25-1.46,3.25-3.25S10.88,5.84,9.08,5.84z
                     M9.08,11.38c-1.26,0-2.29-1.03-2.29-2.29S7.82,6.8,9.08,6.8s2.29,1.03,2.29,2.29S10.34,11.38,9.08,11.38z" />
                                                                    <polygon class="st008" points="9.55,7.47 8.58,7.47 8.58,9.57 10.37,9.57 10.37,8.61 9.55,8.61 				" />
                                                                    <rect x="3.76" y="7.47" class="st008" width="0.96" height="0.96" />
                                                                    <rect x="1.83" y="7.47" class="st008" width="0.96" height="0.96" />
                                                                    <rect x="1.83" y="5.54" class="st008" width="0.96" height="0.96" />
                                                                    <rect x="1.83" y="9.4" class="st008" width="0.96" height="0.96" />
                                                                    <rect x="3.76" y="5.54" class="st008" width="0.96" height="0.96" />
                                                                    <rect x="3.76" y="9.4" class="st008" width="0.96" height="0.96" />
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </svg>
                                                <input type="date" id="nuevoHorarioFecha" />
                                            </div>
                                            <div class="reloj">
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="12.07px"
                                                    height="12.07px" viewBox="0 0 12.07 12.07" style="overflow:visible;enable-background:new 0 0 12.07 12.07;"
                                                    xml:space="preserve">
                                                    <style type="text/css">
                                                        .st009 {
                                                            fill: #76869E;
                                                        }
                                                    </style>
                                                    <defs>
                                                    </defs>
                                                    <g id="Layer_2_1_">
                                                        <path class="st009" d="M6.04,12.07C2.7,12.07,0,9.37,0,6.04S2.7,0,6.04,0s6.04,2.7,6.04,6.04S9.37,12.07,6.04,12.07z M6.04,0.93
        c-2.82,0-5.11,2.29-5.11,5.11s2.29,5.11,5.11,5.11s5.11-2.29,5.11-5.11S8.86,0.93,6.04,0.93z" />
                                                        <path class="st009" d="M8.48,9.06c-0.12,0-0.24-0.05-0.33-0.13L5.6,6.37C5.51,6.28,5.46,6.16,5.46,6.04V2.32
        c0-0.26,0.21-0.46,0.46-0.46c0.26,0,0.46,0.21,0.46,0.46v3.52l2.42,2.41c0.18,0.18,0.18,0.47,0,0.66c0,0,0,0,0,0
        C8.72,9.01,8.61,9.06,8.48,9.06z" />
                                                    </g>
                                                </svg>
                                                <div class="horario-input">
                                                    <input class="horario-sel" id="nuevoHorarioHora"></input>
                                                    <i class="bi bi-caret-down-fill" id="mostrarHorarios"></i>
                                                    <div class="resultado-pacientes" id="resultadoHorarios"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="footer-modal">
                                            <button id="btnReservar" class="btn-reservar">Reservar</button>
                                            <button id="btnPagar" class="btn-pagar">Pagar</button>
                                        </div>
                                    </div>
                                </div>
                                <div id="modalReprogramaciones" style="display: none;">
                                    <div id="subCitasPaciente" class="subtitulo">CITAS DEL PACIENTE</div>
                                    <div class="citas-container">Aquí se listarán las citas del paciente</div>
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
<script type="module" src="../../../assets/js/calendario/index.js"></script>

</html>