<?php
$base_url = 'http://localhost/SistemaClinico/';
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
    <link rel="stylesheet" href="<?php echo $base_url ?>assets/css/pagos.css">
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

                    <div class="page-content row">
                        <div class="pagos-tablas">
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
                                        <input type="text" class="form-control search-control" id="inputBuscarCita" placeholder="Buscar usuario por DNI, nombres o apellidos">

                                    </div>

                                </div>

                                <div id="pagosTabla">


                                </div>
                            </div>



                        </div>

                        <div class="previsualizacion-ticket">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>






<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="<?php echo $base_url ?>assets/js/pagos/tablaPagos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>