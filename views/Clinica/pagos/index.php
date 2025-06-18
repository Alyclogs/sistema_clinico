<?php

session_start();
$base_url = 'http://localhost/SistemaClinico/';
require_once "barcode-master/barcode.php";

// Crear instancia del generador
$generator = new barcode_generator();

// Datos para el QR
$codigo = "http://localhost/SistemaClinico";
$symbology = "qr";
$options = ['scale' => 5, 'padding' => 0];

// Generar imagen QR
$image = $generator->render_image($symbology, $codigo, $options);

// Capturar imagen en buffer
ob_start();
imagepng($image);
$imageData = ob_get_clean();

// Liberar memoria
imagedestroy($image);

// Codificar imagen en base64
$base64 = base64_encode($imageData);



require_once __DIR__ . '/../../../models/Pagos/PagosModel.php';
$pagomodel = new PagosModel();

$modalidades = $pagomodel->obtenerModalidades();
$opcionesPago = $pagomodel->obtenerOpcionesPago();

$opcionesAgrupadas = [];


foreach ($opcionesPago as $opcion) {
  // Suponiendo que el campo que conecta opción con modalidad es 'idmodalidad'
  $opcionesAgrupadas[$opcion['idmodalidad']][] = $opcion;
}



if (!isset($_SESSION['usuario']) || !isset($_SESSION['rol'])) {
  header("Location: " . $base_url . "views/login.php");
  exit();
}
$idusuario = $_SESSION['idusuario'];
$nombres_caja = mb_strtoupper($_SESSION['nombre'], 'UTF-8');




$codigoPago = $pagomodel->obtenerSiguienteCodigo(); // obtiene todas






?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagos</title>
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

        <div class="mensaje-alert">
          <div id="mensaje" class="my-3"></div>
        </div>

        <?php include '../../../sections/header.php'; ?>
        <div class="col page-container">

          <div class="page-content ">
            <div class="d-flex  align-items-center" style="    padding: 20px 37px;gap: 20px;">
              <div class="input-group search-group" style="max-width: 500px;">
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

              <div class="filtros-pagos">
                <label for="filtros-pagos">Filtros: </label>
                <select id="filtroEstado">
                  <option value="3">Deudas</option>
                  <option value="historial">Historial</option>
                </select>

              </div>

            </div>

            <div class="content-header page-content-header row">

              <div class="pagos-tablas">

                <div id="pagosTabla">


                </div>



              </div>
              <div class="caja-general-ticket">


                <div class="previsualizacion-ticket">
                  <div class="btn-imprimir">
                    <button class="btn btn-primary " id="imprimir-btn">IMPRIMIR</button>
                  </div>
                  <div class="encabezado-ticket my-3">
                    <p>Previsualización del ticket de pago</p>
                  </div>
                  <div class="scroll-ticket">
                    <div id="ticket" class="papel-ticket">
                      <div class="caja-cabeza-ticket">
                        <div class="cabeza-ticket">
                          <span>CORAZON GUERRERO</span>
                          <span>RUC No. : 20611418427</span>
                          <span>AV. SAN MARTIN No. 693 - S. J. L.</span>
                          <span>LIMA - LIMA - SAN JUAN DE LURIGANCHO</span>
                          <span>TELF: 01-3016765 - 907078280 </span>
                        </div>
                      </div>
                      <div class="caja-codigo-ticket">
                        <div class="codigo-ticket">
                          <span>TICKET DE PAGO</span>
                          <span id="codigo-voucher-ticket">**** - *****</span>
                        </div>
                      </div>
                      <div class="caja-nombres-ticket">
                        <div class="nombres-ticket">
                          <span id="cajero-nombre">CAJERO: <?php echo $nombres_caja ?></span>
                          <span id="cajero-fecha">FECHA: *************</span>
                          <span id="dni-papa">DNI: *************</span>
                          <span id="nombre-papa">NOMBRE: *************</span>
                        </div>
                      </div>

                      <div class="caja-productos-ticket">
                        <div class="encabezado-tabla-ticket">

                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-cantidad">
                              <span>CANT.</span>
                            </div>
                          </div>


                          <div class="ancho-encabezado">
                            <div class=" encabezado-tabla titulo-producto">
                              <span>PRODUCTO</span>
                            </div>
                          </div>

                          <div class="ancho-encabezado">
                            <div class=" encabezado-tabla titulo-precio">
                              <span>P.UNI.</span>
                            </div>
                          </div>

                          <div class="ancho-encabezado">
                            <div class=" encabezado-tabla titulo-total">
                              <span>TOTAL</span>
                            </div>
                          </div>
                        </div>
                        <div class="caja-descripcion-tabla" id="resumen-impresion">
                        </div>
                      </div>
                      <div class="caja-total-ticket">
                        <div class="total-tabla-ticket">
                          <div class="ancho-encabezado ancho-total">
                            <div class="encabezado-tabla titulo-total">
                              <span>TOTAL VENTA</span>
                            </div>
                          </div>
                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-total">
                              <span>S/.</span>
                            </div>
                          </div>
                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-total">
                              <span id="total-sub-total">*****</span>
                            </div>
                          </div>
                        </div>

                        <div class="total-tabla-ticket">
                          <div class="ancho-encabezado ancho-total">
                            <div class="encabezado-tabla titulo-total">
                              <span id="modalidad-pago-cancelado">PAGO CON *******</span>
                            </div>
                          </div>
                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-total">
                              <span>S/.</span>
                            </div>
                          </div>
                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-total">
                              <span id="total-venta">*****</span>
                            </div>
                          </div>
                        </div>

                        <div class="total-tabla-ticket">
                          <div class="ancho-encabezado ancho-total">
                            <div class="encabezado-tabla titulo-total">
                              <span>VUELTO</span>
                            </div>
                          </div>
                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-total">
                              <span>S/.</span>
                            </div>
                          </div>
                          <div class="ancho-encabezado">
                            <div class="encabezado-tabla titulo-total">
                              <span id="total-vuelto">00.00</span>
                            </div>
                          </div>
                        </div>
                        <div class="total-tabla-ticket">
                          <div class="ancho-encabezado ancho-monto">
                            <div class="encabezado-tabla titulo-total">
                              <span id="oracion-precio">************************************</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="caja-nombres-ticket">
                        <div class="nombres-ticket" style="border: 0.7px dashed #59636d;
    border-left: none;
    border-right: none; border-top:none">
                          <span id="cajero-nombre">CAJERO: <?php echo $nombres_caja ?></span>
                          <span>N° CAJA:01</span>
                        </div>
                      </div>




                      <div class="caja-gracias">
                        <div class="gracias-ticket">
                          <span>¡GRACIAS POR SU PREFERENCIA!</span>
                        </div>
                      </div>
                      <div class="caja-qr">
                        <div class="caja-imagen-qr">
                          <img src="data:image/png;base64,<?= $base64 ?>" alt="Código QR">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</body>

</html>

<script>
  document.getElementById("imprimir-btn").addEventListener("click", function() {
    window.print();
  });
</script>

<script>
  // Datos para tu JS
  window.modalidades = <?= json_encode($modalidades,     JSON_HEX_TAG) ?>;
  window.opcionesAgrupadas = <?= json_encode($opcionesAgrupadas, JSON_HEX_TAG) ?>;
  window.idUsuario = <?= json_encode($_SESSION['idusuario'], JSON_HEX_TAG) ?>;


  window.codigovoucherpago = <?= json_encode($codigoPago, JSON_HEX_TAG) ?>;
</script>


<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="<?php echo $base_url ?>assets/js/pagos/tablaPagos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>