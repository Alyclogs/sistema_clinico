<?php
require_once __DIR__ . '/../../../models/Estados/EstadoModel.php';
session_start();

if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: http://localhost/SistemaClinico/views/login.php");
    exit();
}
$estadoModel = new EstadoModel();
$estados = $estadoModel->obtenerEstados();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Gestión de Estados - Sistema Clínico</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/table.css">
</head>

<body>
    <section class="page-container vh-100">
        <div class="row">
            <div class="col-md-2">
                <div class="d-flex flex-column flex-shrink-0 p-3 text-bg-light rounded-4 mb-4" style="max-width: 280px; margin: auto;">
                    <h1 class="text-center mb-3"><i class="bi bi-check-circle-fill me-2"></i>Gestión de Estados</h1>
                    <p class="text-center">Aquí puedes gestionar los estados de los usuarios del sistema.</p>
                </div>
            </div>
            <div class="col-md-10">
                <div class="container mt-4">
                    <div class="card page-card">
                        <div class="card-header page-card-header rounded-4">
                            <div class="d-flex justify-content-between align-items-center my-3">
                                <h2 class="mb-0 text-secondary"><i class="bi bi-toggle-on me-2"></i>Gestión de Estados</h2>
                                <button class="btn btn-primary btn-add-estado" data-bs-toggle="modal" data-bs-target="#estadoModal">
                                    <i class="bi bi-plus-circle-fill me-1"></i> Agregar Estado
                                </button>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle">
                                        <thead class="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaEstadosBody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="estadoModal" tabindex="-1" aria-labelledby="estadoModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="estadoModalLabel">Gestión de Estado</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="estadoModalBody"></div>
                        <div class="modal-footer justify-content-center">
                            <div id="botonesModalEstado">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="btnGuardarEstado">Guardar Cambios</button>
                            </div>
                            <div id="mensajeEstado" class="my-3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../../../assets/js/tablaEstados.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>