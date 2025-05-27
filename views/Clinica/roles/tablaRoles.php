<?php
require_once __DIR__ . '/../../../models/Roles/RoleModel.php';
session_start();

if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: http://localhost/SistemaClinico/views/login.php");
    exit();
}
$roleModel = new RoleModel();
$roles = $roleModel->obtenerRoles();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Gestión de Roles - Sistema Clínico</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/tablaRoles.css">
</head>

<body>
    <div class="container mt-4">
        <div class="card page-card">
            <div class="card-header page-card-header rounded-4">
                <div class="d-flex justify-content-between align-items-center my-3">
                    <h2 class="mb-0 text-secondary"><i class="bi bi-person-badge me-2"></i>Gestión de Roles</h2>
                    <button class="btn btn-primary btn-add-rol" data-bs-toggle="modal" data-bs-target="#rolModal">
                        <i class="bi bi-plus-circle-fill me-1"></i> Agregar Rol
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tablaRolesBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="rolModal" tabindex="-1" aria-labelledby="rolModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="rolModalLabel">Gestión de Rol</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="rolModalBody"></div>
                <div class="modal-footer justify-content-center">
                    <div id="botonesModalRol">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="btnGuardarRol">Guardar Cambios</button>
                    </div>
                    <div id="mensajeRol" class="my-3"></div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="../../../assets/js/tablaRoles.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>