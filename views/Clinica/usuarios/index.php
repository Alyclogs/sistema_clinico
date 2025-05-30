<?php
require_once __DIR__ . '/../../../models/Users/UserModel.php';
session_start();

$base_url = 'http://localhost/SistemaClinico/';
if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
    header("Location: " . $base_url . "views/login.php");
    exit();
}

if ($_SESSION['rol'] !== 'SuperUsuario') {
    // Puedes redirigir al inicio, o mostrar un mensaje de acceso denegado
    header("Location: " . $base_url . "views/login.php");
    exit();
}

$userModel = new UsuarioModel();
$roles = $userModel->obtenerRoles();
$estados = $userModel->obtenerEstados();


?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Usuarios</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo $base_url ?>assets/css/table.css">
    <link rel="stylesheet" href="<?php echo $base_url ?>assets/css/general.css">
</head>

<body>
    <div class="container-fluid">
        <div class="caja-principal" style="min-height: 100%;">


            <div class="lado-izquierdo">
                <?php include '../../../sections/menu.php'; ?>
            </div>


            <div class="lado-derecho">
                <?php include '../../../sections/header.php'; ?>
                <div class="col page-container">

                    <div class="page-content">
                        <div class="content-header page-content-header">
                            <div class="d-flex justify-content-between align-items-center my-3">
                                <div class="input-group search-group" style="max-width: 300px;">
                                    <span class="input-group-text">
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="13.24px"
                                            height="13.26px" viewBox="0 0 13.24 13.26" style="overflow:visible;enable-background:new 0 0 13.24 13.26;"
                                            xml:space="preserve">
                                            <style type="text/css">
                                                .st0 {
                                                    fill: #76869E;
                                                }
                                            </style>
                                            <defs>
                                            </defs>
                                            <path class="st0" d="M9.25,8.05C9.85,7.22,10.2,6.2,10.2,5.1c0-3.4-3.33-6.03-6.9-4.79c-1.4,0.48-2.51,1.6-2.99,3
	c-1.23,3.57,1.4,6.9,4.79,6.9c1.1,0,2.12-0.35,2.95-0.95l3.76,3.76c0.32,0.33,0.85,0.33,1.17,0c0.34-0.34,0.34-0.89,0-1.23
	L9.25,8.05z M8.31,3.99c0.91,2.69-1.63,5.23-4.32,4.32c-0.98-0.33-1.77-1.12-2.1-2.1C0.98,3.52,3.52,0.98,6.21,1.89
	C7.19,2.22,7.98,3.01,8.31,3.99" />
                                        </svg>
                                    </span>
                                    <input type="text" class="form-control search-control" id="inputBuscarUsuario" placeholder="Buscar usuario por DNI, nombres o apellidos">

                                </div>
                                <button class="btn btn-add-user" data-bs-toggle="modal" data-bs-target="#usuarioModal">
                                    <!-- Generator: Adobe Illustrator 25.2.3, SVG Export Plug-In  -->
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="17px"
                                        height="17.22px" viewBox="0 0 17 17.22" style="overflow:visible;enable-background:new 0 0 17 17.22;" xml:space="preserve">
                                        <style type="text/css">
                                            .st001 {
                                                fill: #FFFFFF;
                                            }
                                        </style>
                                        <defs>
                                        </defs>
                                        <g>
                                            <g>
                                                <g>
                                                    <path class="st001" d="M3.46,3.5h5.72c0.43,0,0.77-0.34,0.77-0.77V2.69h1.14c0.56,0,1.01,0.45,1.01,1.01v3.89
				c0,0.15,0.12,0.27,0.27,0.27c0.15,0,0.27-0.12,0.27-0.27V3.44c0-0.85-0.7-1.55-1.55-1.55H9.95V1.58c0-0.43-0.34-0.77-0.77-0.77
				H8.61L8.56,0.66C8.41,0.26,8.04,0,7.62,0h-2.6C4.6,0,4.23,0.26,4.09,0.66L4.03,0.81H3.46c-0.43,0-0.77,0.34-0.77,0.77v1.15
				C2.69,3.15,3.03,3.5,3.46,3.5z M3.23,1.73C3.07,1.6,3.31,1.34,3.31,1.34h0.97c0.12,0,0.22-0.07,0.26-0.19l0.1-0.31
				C4.7,0.66,4.87,0.54,5.07,0.54h2.29c0.2,0,0.37,0.13,0.43,0.31l0.1,0.31c0.04,0.11,0.14,0.19,0.26,0.19h0.98
				c0,0,0.23,0.25,0.29,0.38v0.94C9.35,2.8,9.25,2.9,9.12,2.96H3.3C3.18,2.9,3.07,2.8,3.23,2.67V1.73L3.23,1.73z" />
                                                    <path class="st001" d="M4.78,2.42h2.88c0.15,0,0.27-0.12,0.27-0.27C7.92,2,7.8,1.88,7.65,1.88H4.78C4.63,1.88,4.51,2,4.51,2.15
				C4.51,2.3,4.63,2.42,4.78,2.42z" />
                                                    <path class="st001" d="M10.62,5.11H7.17c-0.15,0-0.27,0.12-0.27,0.27c0,0.15,0.12,0.27,0.27,0.27h3.45c0.15,0,0.27-0.12,0.27-0.27
				C10.89,5.23,10.77,5.11,10.62,5.11z" />
                                                    <path class="st001" d="M10.62,7.53H7.17c-0.15,0-0.27,0.12-0.27,0.27c0,0.15,0.12,0.27,0.27,0.27h3.45c0.15,0,0.27-0.12,0.27-0.27
				C10.89,7.65,10.77,7.53,10.62,7.53z" />
                                                    <path class="st001" d="M10.62,9.95H1.81c-0.15,0-0.27,0.12-0.27,0.27s0.12,0.27,0.27,0.27h8.81c0.15,0,0.27-0.12,0.27-0.27
				S10.77,9.95,10.62,9.95z" />
                                                    <path class="st001" d="M1.54,8.28c-0.02,0.08,0,0.16,0.05,0.23c0.05,0.06,0.13,0.1,0.21,0.1h3.64c0.08,0,0.16-0.04,0.21-0.1
				c0.05-0.06,0.07-0.15,0.05-0.23C5.55,7.53,5.07,6.94,4.46,6.65C4.72,6.4,4.85,6.03,4.79,5.63c-0.08-0.47-0.44-0.85-0.9-0.95
				C3.13,4.51,2.45,5.09,2.45,5.82c0,0.32,0.13,0.62,0.34,0.83C2.19,6.94,1.71,7.53,1.54,8.28z M5.09,8.07H2.17
				C2.43,7.43,3,7,3.63,7S4.82,7.43,5.09,8.07z M3.63,5.08c0.35,0,0.64,0.29,0.64,0.64c0,0.35-0.29,0.64-0.64,0.64
				c-0.35,0-0.64-0.29-0.64-0.64C2.99,5.37,3.28,5.08,3.63,5.08z" />
                                                    <path class="st001" d="M16.69,6.18C15.97,5.21,14.63,5.3,14,6.19l-3.53,5.03c-0.19,0.27-0.33,0.57-0.43,0.88H1.81
				c-0.15,0-0.27,0.12-0.27,0.27c0,0.15,0.12,0.27,0.27,0.27h8.03c-0.01,0.06-0.02,0.12-0.03,0.19l-0.12,1.7H1.81
				c-0.15,0-0.27,0.12-0.27,0.27c0,0.15,0.12,0.27,0.27,0.27h8.91c0.15,0,0.27-0.12,0.27-0.27c0-0.05-0.02-0.1-0.04-0.14l0.9-0.38
				c0.09-0.04,0.17-0.09,0.26-0.13v1.52c0,0.56-0.45,1.01-1.01,1.01H1.55c-0.56,0-1.01-0.45-1.01-1.01V3.44
				c0-0.56,0.46-1.02,1.02-1.02h0.5c0.15,0,0.27-0.12,0.27-0.27S2.2,1.88,2.05,1.88h-0.5C0.69,1.88,0,2.58,0,3.43v12.23
				c0,0.86,0.69,1.55,1.55,1.55h9.54c0.86,0,1.55-0.69,1.55-1.55v-1.94c0.2-0.17,0.37-0.36,0.52-0.57l3.51-5.01
				C17.09,7.55,17.12,6.75,16.69,6.18z M11.54,13.82l-1.29,0.55l0.1-1.4c0.01-0.15,0.04-0.3,0.08-0.45l1.52,1.08
				C11.81,13.69,11.68,13.76,11.54,13.82z M12.63,12.94c-0.08,0.11-0.17,0.21-0.26,0.31L10.61,12c0.06-0.12,0.13-0.24,0.21-0.35
				l3.08-4.34l1.82,1.29L12.63,12.94z M16.17,7.96l-0.15,0.21L14.2,6.88l0,0l0.15-0.21c0.22-0.31,0.56-0.47,0.91-0.47
				c0.22,0,0.45,0.07,0.64,0.2C16.4,6.76,16.52,7.46,16.17,7.96z" />
                                                </g>
                                            </g>
                                        </g>
                                    </svg>
                                    Nuevo registro
                                </button>
                            </div>
                            <div class="content-body">
                                <div class="table-responsive">
                                    <table class="table align-middle">
                                        <thead>
                                            <tr>
                                                <th><span>Nombres y Apellidos</span></th>
                                                <th><span>DNI</span></th>
                                                <th><span>Celular</span></th>
                                                <th><span>Correo</span></th>
                                                <th><span>Rol</span></th>
                                            </tr>
                                        </thead>
                                        <tbody id="tablaUsuariosBody"></tbody>
                                    </table>
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
                        <button type="button" class="btn btn-primary btn-guardar" id="btnGuardarUsuario">Guardar Cambios</button>
                    </div>

                </div>

                <div id="mensaje" class="my-3"></div>

            </div>
        </div>
    </div>
    <!--<img src="../../../assets/img/Recurso 38.png" alt="Decoración" class="body-bg-img" />-->
</body>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="<?php echo $base_url ?>assets/js/usuarios/tablaUsuarios.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>

</html>