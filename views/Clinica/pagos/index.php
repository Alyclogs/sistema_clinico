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

$modalidades = $pagomodel->obtenerModalidades(); // obtiene todas
$opcionesPago = $pagomodel->obtenerOpcionesPago(); // obtiene todas

$opcionesAgrupadas = [];

foreach ($opcionesPago as $opcion) {
    $opcionesAgrupadas[$opcion['idopcion']][] = $opcion;
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
    <link rel="stylesheet" href="<?php echo $base_url?>assets/css/table.css">
    <link rel="stylesheet" href="<?php echo $base_url?>assets/css/general.css">
    <link rel="stylesheet" href="<?php echo $base_url?>assets/css/pagos.css">
</head>


<body>
    <div class="container-fluid">
        <div class="caja-principal" style="min-height: 100%;">
           <div class="lado-izquierdo">
           <?php include '../../../sections/menu.php'; ?>
      </div>
      
              <div class="lado-derecho">
                  
                     <div class="mensaje-alert">
                 <div id="mensaje" class="my-3"></div></div>
                  
                  <?php include '../../../sections/header.php'; ?>
            <div class="col page-container">
             
                <div class="page-content ">
                
                    <div class="content-header page-content-header row">
                        
                          <div class="pagos-tablas">
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
                    
                    
                    <div class="container-medios-pago" style="display:none">
                        <div class="encabezado-medios-pagos">
                            <span>Medios de Pago</span>
                        </div>
                        
                        <div class="formulario-pago">
                            
                          <form class="form-pago" id="formPago">
                                 <input type="hidden" name="idUsuario" id="idUsuario" value=<?php echo $idusuario ?> />
                              <input type="hidden" id="ids-citas" name="ids_citas">
<input type="hidden" id="costos-citas" name="costos_citas">
<input type="hidden" id="codigo-voucher" name="codigo-voucher" value="<?php echo $codigoPago?>">

<input type="hidden" id="total-cita" name="costo_total">

<input type="hidden" id="id-paciente" name="id_paciente">
<input type="hidden" id="nombres-apoderado" >
<input type="hidden" id="dni-apoderado" >
<input type="hidden" id="detalle-subareas" name="detalle-subareas">

  <!-- Fila 1 -->
  
  <div class="form-container-two">
  <div class="form-row">
    <div class="form-group">
      <label for="modalidad-pago">Modalidad de Pago</label>
      
      <div class="campo-flex-end">
      <select class="form-select" id="modalidad-pago" name="modalidad-pago" required >
        <option value="">Seleccione</option>
         <?php foreach ($modalidades as $modalidad) { ?>
                    <option value="<?php echo htmlspecialchars($modalidad['idmodalidad']) ?>"><?php echo htmlspecialchars($modalidad['modalidad']) ?></option>
                <?php } ?>
      </select></div>
    </div>

    <div class="form-group">
      <label for="opcion-pago">Opción de Pago</label>
      <div class="campo-flex-end">
      <select class="form-select"  id="opcion-pago" name="opcion-pago" required > 
        <option value="">Seleccione</option>
        <!-- Opciones aquí -->
      </select></div>
    </div>
    
     <div class="form-group">
      <label for="codigo">Código de Operación</label>
       <div class="campo-flex-end">
      <input class="form-control"  type="text" id="codigo" name="codigo" required></div>
    </div>
    
    
  </div>

  <!-- Fila 2 -->
  <div class="form-row">
   

    <div class="form-group">
      <label for="monto">Monto Total</label>
          <div class="campo-flex-end">
      <input class="form-control"  type="number" id="monto" name="monto" min="0" readonly></div>
    </div>
    
     <div class="form-group">
      <label for="monto">Monto a Pagar</label>
        <div class="campo-flex-end">
     <input class="form-control" 
       type="number" 
       id="importexpagar" 
       name="importexpagar" 
       min="0" 
       step="0.01" 
       required></div>

    </div>
    
       <div class="form-group">
      <label for="monto">Vuelto</label>
     <div class="campo-flex-end">
     <input class="form-control" 
       type="number" 
       id="vuelto" 
       name="vuelto" 
       min="0" 
       step="0.01" 
       readonly >
</div>
    </div>
    
  </div>
  
  </div>
  
  
 <div id="botonesModal" style="justify-content:flex-end">
                   
                        <button type="button" class="btn btn-primary btn-guardar" id="btnGuardar">PAGAR</button>
                    </div>
</form>



                            
                        </div>
                        
                       
                        
                    </div>
                            
                            
                            
                            </div>
                    
                    <div class="caja-general-ticket">
                     <div class="previsualizacion-ticket">
                        <div class="encabezado-ticket my-3">
                            <p>Previsualización del ticket de pago</p>
                        </div>
                        
                       <div id="ticket"  class="papel-ticket">
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
                                   <span id="codigo-voucher-ticket">**** - *****</span>
                               </div>
                           </div>
                           
                           
                           <div class="caja-nombres-ticket">
                               <div class="nombres-ticket">
                                   <span id="cajero-nombre">CAJERO: <?php echo $nombres_caja?></span>
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
                                   </div></div>
                                   
                                   
                                  <div class="ancho-encabezado">
                                   <div class=" encabezado-tabla titulo-producto">
                                       <span>PRODUCTO</span>
                                   </div></div>
                                   
                                    <div class="ancho-encabezado">
                                      <div class=" encabezado-tabla titulo-precio">
                                       <span>P.UNI.</span>
                                   </div></div>
                                   
                                    <div class="ancho-encabezado">
                                      <div class=" encabezado-tabla titulo-total">
                                       <span>TOTAL</span>
                                   </div></div>
                                   
                               </div>
                               
                               <div class="caja-descripcion-tabla"  id="resumen-impresion">
                                
                               
                                   
                               </div>
                               
                               
                           </div>
                           
                           <div class="caja-total-ticket">
                                   <div class="total-tabla-ticket">
                                           <div class="ancho-encabezado ancho-total">
                                   <div class="encabezado-tabla titulo-total">
                                       <span>TOTAL VENTA</span>
                                   </div></div>
                                     <div class="ancho-encabezado">
                                   <div class="encabezado-tabla titulo-total">
                                       <span>S/.</span>
                                   </div></div>
                                     <div class="ancho-encabezado">
                                   <div class="encabezado-tabla titulo-total">
                                       <span id="total-sub-total">*****</span>
                                   </div></div>
                                   
                                   
                                   
                                   </div>
                                   
                                   
                                   <div class="total-tabla-ticket">
                                           <div class="ancho-encabezado ancho-total">
                                   <div class="encabezado-tabla titulo-total">
                                       <span id="modalidad-pago-cancelado">PAGO CON *******</span>
                                   </div></div>
                                     <div class="ancho-encabezado">
                                   <div class="encabezado-tabla titulo-total">
                                       <span>S/.</span>
                                   </div></div>
                                     <div class="ancho-encabezado">
                                   <div class="encabezado-tabla titulo-total">
                                       <span id="total-venta">*****</span>
                                   </div></div>
                                   
                                   
                                   
                                   </div>
                                   
                                   
                                   <div class="total-tabla-ticket">
                                           <div class="ancho-encabezado ancho-total">
                                   <div class="encabezado-tabla titulo-total">
                                       <span>VUELTO</span>
                                   </div></div>
                                     <div class="ancho-encabezado">
                                   <div class="encabezado-tabla titulo-total">
                                       <span>S/.</span>
                                   </div></div>
                                     <div class="ancho-encabezado">
                                   <div class="encabezado-tabla titulo-total">
                                       <span id="total-vuelto">00.00</span>
                                   </div></div>
                                   
                                   
                                   
                                   </div>
                                   
                                   
                                      <div class="total-tabla-ticket">
                                           <div class="ancho-encabezado ancho-monto">
                                   <div class="encabezado-tabla titulo-total">
                                       <span id="oracion-precio">************************************</span>
                                   </div></div>
                                  
                                   
                                   
                                   
                                   
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
                        
                        
                        
                          <div class="btn-imprimir">
                        <button class="btn btn-primary " id="imprimir-btn" >IMPRIMIR</button>
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
  document.getElementById("imprimir-btn").addEventListener("click", function () {
    window.print();
  });
</script>
   
              <script>
  const opcionesAgrupadas = <?php echo json_encode($opcionesAgrupadas); ?>;

  document.getElementById('modalidad-pago').addEventListener('change', function () {
    const modalidadSeleccionada = this.value;
    const opcionPagoSelect = document.getElementById('opcion-pago');
    const codigoInput = document.getElementById('codigo');

    // Limpiar opciones actuales
    opcionPagoSelect.innerHTML = '';

    let opcionesEncontradas = [];

    // Buscar opciones que coincidan con la modalidad seleccionada
    for (const areaId in opcionesAgrupadas) {
      const opciones = opcionesAgrupadas[areaId];

      opciones.forEach(opcion => {
        if (opcion.idmodalidad == modalidadSeleccionada) {
          opcionesEncontradas.push(opcion);
        }
      });
    }

    // Si hay más de una opción o la modalidad no es "4", mostrar "Seleccione"
    if (modalidadSeleccionada != '4' || opcionesEncontradas.length > 1) {
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Seleccione';
      opcionPagoSelect.appendChild(defaultOption);
    }

    // Agregar opciones encontradas
    opcionesEncontradas.forEach(opcion => {
      const option = document.createElement('option');
      option.value = opcion.idopcion;
      option.textContent = opcion.opcion;
      opcionPagoSelect.appendChild(option);
    });

    // Si es modalidad "Efectivo" (value = 4), poner texto en el input
    if (modalidadSeleccionada === '4') {
      codigoInput.value = 'No se necesita código';
      codigoInput.readOnly = true; // opcional: para que no lo puedan editar
    } else {
      codigoInput.value = '';
      codigoInput.readOnly = false;
    }
  });
</script>

<script>
  const montoInput = document.getElementById('monto');
  const importexPagarInput = document.getElementById('importexpagar');
  const vueltoInput = document.getElementById('vuelto');

  importexPagarInput.addEventListener('input', function () {
    const monto = parseFloat(montoInput.value) || 0;
    const pagado = parseFloat(importexPagarInput.value) || 0;

    const vuelto = pagado - monto;

    // Si el monto pagado es mayor o igual, mostrar el vuelto; si no, 0
    vueltoInput.value = vuelto >= 0 ? vuelto.toFixed(2) : '0.00';
  });
</script>



                            
                            
                            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="<?php echo $base_url?>assets/js/pagos/tablaPagos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
