<?php
require_once __DIR__ . '/../../../models/Areas/AreaModel.php';
require_once __DIR__ . '/../../../models/Subareas/SubareaModel.php';
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';

$areamodel = new AreaModel();
$subareamodel = new SubareaModel();
$especialistamodel = new EspecialistaModel();

$areas = $areamodel->obtenerareas();
?>
<!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='utf-8' />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/calendar.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js'></script>
</head>

<body>
    <div class="container-fluid vh-100">
        <div class="page p-4">
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
                        <label for="filtro-subarea" class="filtro-title">Sub área</label>
                        <select class="form-select filtro" id="filtro-subarea" disabled>
                            <option value="" disabled selected>Seleccionar</option>
                        </select>
                        <label for="filtro-especialista" class="filtro-title">Especialista</label>
                        <select class="form-select filtro" id="filtro-especialista" disabled>
                            <option value="" disabled selected>Seleccionar</option>
                        </select>
                    </div>
                    <div class="calendar-actions" style="display: flex; gap: 1rem; align-items: center;">
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

                        <button class="btn-add-cita">+ Nueva cita</button>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-grow-1 overflow-hidden">
                <div id="calendar" class="flex-grow-1 h-100 overflow-auto"></div>

                <!-- Sidebar -->
                <div class="calendar-sidebar p-3" style="width: 300px;">
                    <div id="mini-calendar"></div>

                    <div class="mt-4">
                        <h6 class="fw-bold">Citas seleccionadas</h6>
                        <div class="appointment-box">
                            <small class="text-muted">LUN 12</small>
                            <div class="fw-semibold">Lic. Carlos Medina</div>
                            <div>Área: Psicológico</div>
                            <div>Horario: 8:30am - 9:00am</div>
                        </div>
                        <!-- Repite esta estructura por cada cita -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="modalCita" class="modal-cita-custom">
        <div class="modal-cita-header">Nueva cita</div>
        <div class="d-flex align-items-center mb-3">
            <input type="text" id="dniPaciente" class="form-control" placeholder="DNI del paciente" style="max-width: 220px;">
            <button class="btn-add-paciente ms-2" title="Agregar nuevo paciente"><i class="fas fa-user-plus"></i></button>
        </div>
        <div id="horariosSeleccionados" class="mb-3"></div>
        <div class="add-horario-row mb-4">
            <input type="date" id="nuevoHorarioFecha" class="form-control" style="max-width: 160px;">
            <input type="time" id="nuevoHorarioHora" class="form-control" style="max-width: 160px;">
            <button id="btnAgregarHorario" class="btn btn-success"><i class="fas fa-plus"></i></button>
        </div>
        <div class="modal-cita-footer text-end w-100">
            <button class="btn-pagar-cita">Pagar</button>
        </div>
    </div>
</body>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script src="../../../assets/js/calendar.js"></script>

</html>