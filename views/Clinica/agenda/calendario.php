<?php
session_start();
require_once __DIR__ . '/../../../models/Areas/AreaModel.php';
require_once __DIR__ . '/../../../models/Subareas/SubareaModel.php';
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';

$areamodel = new AreaModel();
$subareamodel = new SubareaModel();
$especialistamodel = new EspecialistaModel();
$base_url = 'http://localhost/SistemaClinico/';
$areas = $areamodel->obtenerareas();
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
                                        <label for="filtro-area" class="filtro-title">Área</label>
                                        <select class="form-select filtro" id="filtro-area">
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
                                        <label for="filtro-subarea" class="filtro-title">Subárea </label>
                                        <select class="form-select filtro" id="filtro-subarea" disabled>
                                            <option value="" disabled selected>Seleccionar</option>
                                        </select>
                                        <label for="filtro-especialista" class="filtro-title">Especialista</label>
                                        <select class="form-select filtro" id="filtro-especialista" disabled>
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
                                <div class="modal-cita-header">
                                    <h2>Nueva Cita</h2>
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
                                <div id="pacienteSeleccionado" class="paciente-seleccionado" style="display:none;">
                                    <span class="avatar-iniciales"></span>
                                    <div id="pacienteCita" class="paciente-cita">
                                        <div id="pacienteSelNombre" class="paciente-nombre"></div>
                                        <div id="pacienteSelDetalles" class="paciente-detalles">
                                            <span class="pacientesel-edad"></span>
                                            <span class="pacientesel-dni">
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" id="idUsuario" value=<?php echo $idusuario ?> />
                                <div class="subtitulo" style="display: none;">CITAS SELECCIONADAS</div>
                                <div class="no-horarios-selected">No se han seleccionado citas.
                                    Seleccione sus citas en la agenda</div>
                                <div class="modal-cita-body">
                                    <div id="horariosSeleccionados" class="citas-lista"></div>
                                    <div class="footer-modal">
                                        <button id="btnReservar" class="btn-reservar">Reservar</button>
                                        <button id="btnPagar" class="btn-pagar">Pagar</button>
                                    </div>
                                </div>
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

                <div id="mensaje" class="my-3" style="display: flex; max-width: 100%;"></div>

            </div>
        </div>
    </div>
</body>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script src="../../../assets/js/calendar.js"></script>

</html>