<?php
// Obtención de los servicios, áreas y subáreas
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';
$especialistaModel = new EspecialistaModel();
$servicios = $especialistaModel->obtenerServiciosConAreasYSubareas();

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Obtener los servicios ya registrados para el especialista
$serviciosAsignados = $id ? $especialistaModel->obtenerServiciosPorEspecialista($id) : [];

// Crear arrays para marcar checkboxes
$serviciosMarcados = [];
$areasMarcadas = [];
$subareasMarcadas = [];

foreach ($serviciosAsignados as $registro) {
    $serviciosMarcados[$registro['idservicio']] = true;
    $areasMarcadas[$registro['idservicio']][$registro['idarea']] = true;
    if (!is_null($registro['idsubarea'])) {
        $subareasMarcadas[$registro['idarea']][$registro['idsubarea']] = true;
    }
}
?>

<form id="servicioForm">
    <input type="hidden" id="idespecialista" name="idespecialista" value="<?php echo $id ?>">

    <div class="container">
        <!-- Primera fila: Servicios -->
        <div class="row mb-3 pb-3 align-items-center" style="border-bottom:0.25px solid #76869E">
            <div class="col-auto">
                <label>Servicios:</label>
            </div>
            <?php foreach ($servicios as $servicio): ?>
                <div class="col-auto">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" 
                               name="servicios[]" 
                               value="<?php echo $servicio['idservicio']; ?>" 
                               id="servicio_<?php echo $servicio['idservicio']; ?>"
                               <?php echo isset($serviciosMarcados[$servicio['idservicio']]) ? 'checked' : ''; ?>>
                        <label class="form-check-label" for="servicio_<?php echo $servicio['idservicio']; ?>">
                            <?php echo ucfirst(strtolower($servicio['servicio'])); ?>
                        </label>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        
        
              <div class="row mb-3 pb-3 align-items-center" style="border-bottom:0.25px solid #76869E">
        
        <!-- Segunda fila: Áreas -->
        <?php foreach ($servicios as $servicio): ?>
            <div class="row mb-2 align-items-center">
                <div class="col-auto">
                    <label>Áreas de <?php echo ucfirst(strtolower($servicio['servicio'])); ?>:</label>
                </div>
                <?php foreach ($servicio['areas'] as $area): ?>
                    <div class="col-auto">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" 
                                   name="areas[<?php echo $servicio['idservicio']; ?>][]" 
                                   value="<?php echo $area['idarea']; ?>" 
                                   id="area_<?php echo $servicio['idservicio'] . '_' . $area['idarea']; ?>"
                                   <?php echo isset($areasMarcadas[$servicio['idservicio']][$area['idarea']]) ? 'checked' : ''; ?>>
                            <label class="form-check-label" for="area_<?php echo $servicio['idservicio'] . '_' . $area['idarea']; ?>">
                                <?php echo ucfirst(strtolower($area['area'])); ?>
                            </label>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
        
        
    </div>

      <div class="row mb-3 pb-3 align-items-center" style="border-bottom:0.25px solid #76869E">
        <!-- Tercera fila: Subáreas -->
        <div class="row mb-2">
            <div class="col-12">
                <label>Especialidades:</label>
            </div>
        </div>
        <?php foreach ($servicios as $servicio): ?>
            <?php foreach ($servicio['areas'] as $area): ?>
                <?php if (!empty($area['subareas'])): ?>
                    <div class="row mb-2 align-items-center">
                        <div class="col-auto">
                            <label>Área <?php echo ucfirst(strtolower($area['area'])); ?>:</label>
                        </div>
                        <?php foreach ($area['subareas'] as $subarea): ?>
                            <div class="col-auto">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" 
                                           name="subareas[<?php echo $area['idarea']; ?>][]" 
                                           value="<?php echo $subarea['idsubarea']; ?>" 
                                           id="subarea_<?php echo $subarea['idsubarea']; ?>"
                                           <?php echo isset($subareasMarcadas[$area['idarea']][$subarea['idsubarea']]) ? 'checked' : ''; ?>>
                                    <label class="form-check-label" for="subarea_<?php echo $subarea['idsubarea']; ?>">
                                        <?php echo ucfirst(strtolower($subarea['subarea'])); ?>
                                    </label>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endforeach; ?>
    </div>  </div>
</form>
