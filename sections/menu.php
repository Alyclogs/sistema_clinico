<?php
$base_url = 'http://localhost/SistemaClinico/';
$current_url = "https://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

// Supongamos que el rol está guardado en la sesión
$rol_usuario = $_SESSION['rol'] ?? ''; // Si no hay rol, cadena vacía

// Controlar la clase 'active' para un enlace específico
$activeUsuarios = (strpos($current_url, $base_url . 'views/Clinica/usuarios/index.php') === 0) ? 'active' : '';
$activeCalendario = (strpos($current_url, $base_url . 'views/Clinica/agenda/calendario.php') === 0) ? 'active' : '';
$activeEspecialista = (strpos($current_url, $base_url . 'views/Clinica/especialistas/index.php') === 0) ? 'active' : '';
$activePagos = (strpos($current_url, $base_url . 'views/Clinica/pagos/index.php') === 0) ? 'active' : '';


// Controlar visibilidad según rol
// Si el rol NO es 'SuperUsuario', ocultar el menú (display:none)
$displayUsuarios = ($rol_usuario === 'SuperUsuario') ? 'flex' : 'none';
?>


<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <title>ONG Corazón Guerrero</title>
  <!-- Bootstrap 5 CSS -->

  <link rel="stylesheet" href="<?php echo $base_url ?>assets/css/menu.css">
  <!-- Bootstrap 5 JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76A08EQmXpFZz5Jr/gkG6fsbCkJbEpHvvP4Ilc9e+OGP1zFjE0tQt4ZsPi6jizo" crossorigin="anonymous"></script>

</head>

<body>

  <div class="menu-izquierdo">
    <div class="arriba-flex">
      <div class="logo-naranja">
        <img src="<?php echo $base_url ?>assets/img/logo-naranja.png">
      </div>

      <div class="menu-iconos">
        <div class="caja-menu">
          <div class="svg-menu">
            <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.86 17.86">
              <defs>
                <style>
                  .cls-menu {
                    fill: #76869e;
                    fill-rule: evenodd;
                    stroke-width: 0px;
                  }
                </style>
              </defs>
              <path class="cls-menu" d="m8.93,1.25C4.69,1.25,1.25,4.69,1.25,8.93s3.44,7.68,7.68,7.68,7.68-3.44,7.68-7.68S13.17,1.25,8.93,1.25ZM0,8.93C0,4,4,0,8.93,0s8.93,4,8.93,8.93-4,8.93-8.93,8.93S0,13.86,0,8.93Z" />
              <path class="cls-menu" d="m8.92,5.4c-.81,0-1.46.65-1.46,1.45s.65,1.45,1.46,1.45,1.46-.65,1.46-1.45-.65-1.45-1.46-1.45Zm-2.7,1.45c0-1.49,1.21-2.7,2.7-2.7s2.7,1.21,2.7,2.7-1.21,2.7-2.7,2.7-2.7-1.21-2.7-2.7Zm5.99,6.65c-1.7-1.84-4.86-1.78-6.57,0-.24.25-.63.26-.88.02-.25-.24-.26-.63-.02-.88,2.17-2.27,6.17-2.4,8.38,0,.23.25.22.65-.04.88s-.65.22-.88-.04Z" />
            </svg>
          </div>
        </div>
        <div class="caja-menu <?php echo $activeUsuarios; ?>" style="display: <?= $displayUsuarios ?>;" onclick="window.location.href='<?= $base_url ?>views/Clinica/usuarios/index.php'">
          <div class="svg-menu">

            <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.07 18.44">
              <defs>
                <style>
                  .cls-usuarios {
                    fill: none;
                    stroke: #76869e;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-width: 1.44px;
                  }
                </style>
              </defs>
              <g id="g337">
                <g id="g343">
                  <path id="path345" class="cls-usuarios" d="m11.87,10.64c0,1.57-1.27,2.83-2.83,2.83s-2.83-1.27-2.83-2.83,1.27-2.83,2.83-2.83,2.83,1.27,2.83,2.83Z" />
                </g>
                <g id="g347">
                  <path id="path349" class="cls-usuarios" d="m12.02,17.72c.75,0,1.27-.74,1.02-1.44-.59-1.64-2.16-2.81-4-2.81s-3.41,1.17-4,2.81c-.25.7.27,1.44,1.02,1.44h5.96Z" />
                </g>
                <g id="g351">
                  <path id="path353" class="cls-usuarios" d="m7.62,3.55c0,1.57-1.27,2.83-2.83,2.83s-2.83-1.27-2.83-2.83S3.22.72,4.78.72s2.83,1.27,2.83,2.83Z" />
                </g>
                <g id="g355">
                  <path id="path357" class="cls-usuarios" d="m8.09,7.97c-.78-.96-1.97-1.58-3.31-1.58-1.84,0-3.41,1.17-4,2.81-.25.7.27,1.44,1.02,1.44h4.41" />
                </g>
                <g id="g359">
                  <path id="path361" class="cls-usuarios" d="m10.45,3.55c0,1.57,1.27,2.83,2.83,2.83s2.83-1.27,2.83-2.83-1.27-2.83-2.83-2.83-2.83,1.27-2.83,2.83Z" />
                </g>
                <g id="g363">
                  <path id="path365" class="cls-usuarios" d="m9.98,7.97c.78-.96,1.97-1.58,3.31-1.58,1.84,0,3.41,1.17,4,2.81.25.7-.27,1.44-1.02,1.44h-4.41" />
                </g>
              </g>
            </svg>
          </div>


        </div>





        <div class="caja-menu <?php echo $activeEspecialista; ?>" onclick="window.location.href='<?= $base_url ?>views/Clinica/especialistas/index.php'">
          <div class="svg-menu">
            <svg id="USUARIOS" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.11 18.44">
              <defs>
                <style>
                  .cls-especialistas {
                    fill: none;
                    stroke: #76869e;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-width: 1.44px;
                  }
                </style>
              </defs>
              <path class="cls-especialistas" d="m7.65,2.02c.31-.78,1.06-1.3,1.9-1.3s1.59.52,1.9,1.3l1.34,3.43,3.67.21c.84.05,1.56.61,1.82,1.41.26.8,0,1.68-.65,2.21l-2.85,2.33.93,3.56c.21.81-.09,1.67-.77,2.17-.68.49-1.59.52-2.3.07l-3.1-1.99-3.1,1.99c-.71.45-1.62.43-2.3-.07-.68-.49-.99-1.35-.77-2.17l.93-3.56-2.85-2.33c-.65-.53-.91-1.41-.65-2.21.26-.8.98-1.36,1.82-1.41l3.67-.21,1.34-3.43Z" />
              <circle class="cls-especialistas" cx="9.55" cy="9.04" r="1.77" />
              <path class="cls-especialistas" d="m6.61,17.3v-3.62c0-.47.19-.92.52-1.25.34-.34.8-.53,1.28-.52h2.3c.48,0,.94.18,1.28.52.33.33.52.78.52,1.25v3.62l-2.95-1.89-2.95,1.89Z" />
            </svg>
          </div>
        </div>

        <div class="caja-menu <?php echo $activeCalendario; ?>" onclick="window.location.href='<?= $base_url ?>views/Clinica/agenda/calendario.php'">
          <div class="svg-menu">
            <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.84 17.85">
              <defs>
                <style>
                  .cls-calendario {
                    fill: #76869e;
                    stroke-width: 0px;
                  }
                </style>
              </defs>
              <rect class="cls-calendario " x="8.23" y="8.02" width="1.39" height="1.39" />
              <path class="cls-calendario" d="m15.75,1.39h-.84V0h-1.39v1.39H4.32V0h-1.39v1.39h-.84C.94,1.39,0,2.33,0,3.49v12.27c0,1.15.94,2.09,2.09,2.09h7.17c-.48-.4-.9-.87-1.24-1.39H2.09c-.38,0-.7-.31-.7-.7V6.55h15.06v1.46h0c.53.34,1,.76,1.39,1.25V3.49c0-1.15-.94-2.09-2.09-2.09Zm.7,3.76H1.39v-1.67c0-.38.31-.7.7-.7h.84v1.39h1.39v-1.39h9.2v1.39h1.39v-1.39h.84c.38,0,.7.31.7.7v1.67Z" />
              <path class="cls-calendario" d="m13.13,8.44c-2.59,0-4.71,2.11-4.71,4.71s2.11,4.71,4.71,4.71,4.71-2.11,4.71-4.71-2.11-4.71-4.71-4.71Zm0,8.02c-1.83,0-3.31-1.49-3.31-3.31s1.49-3.31,3.31-3.31,3.31,1.49,3.31,3.31-1.49,3.31-3.31,3.31Z" />
              <polygon class="cls-calendario" points="13.8 10.8 12.41 10.8 12.41 13.84 14.99 13.84 14.99 12.44 13.8 12.44 13.8 10.8" />
              <rect class="cls-calendario " x="5.44" y="10.8" width="1.39" height="1.39" />
              <rect class="cls-calendario " x="2.65" y="10.8" width="1.39" height="1.39" />
              <rect class="cls-calendario " x="2.65" y="8.02" width="1.39" height="1.39" />
              <rect class="cls-calendario " x="2.65" y="13.59" width="1.39" height="1.39" />
              <rect class="cls-calendario " x="5.44" y="8.02" width="1.39" height="1.39" />
              <rect class="cls-calendario " x="5.44" y="13.59" width="1.39" height="1.39" />
            </svg>
          </div>
        </div>

        <div class="caja-menu <?php echo $activePagos; ?>"" onclick=" window.location.href='<?= $base_url ?>views/Clinica/pagos/index.php'">
   <div class=" svg-menu">
          <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.51 28.59">
            <defs>
              <style>
                .cls-pagos {
                  fill: none;
                  stroke: #76869e;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  stroke-width: 1.51px;
                }
              </style>
            </defs>
            <g id="Invoice">
              <path class="cls-pagos" d="m11.77,9.55c0-1.22-.99-2.2-2.2-2.2s-2.2.99-2.2,2.2.99,2.2,2.2,2.2" />
              <path class="cls-pagos" d="m9.56,11.75c1.22,0,2.2.99,2.2,2.2s-.99,2.2-2.2,2.2-2.2-.99-2.2-2.2" />
              <line class="cls-pagos" x1="9.55" y1="4.06" x2="9.55" y2="7.36" />
              <line class="cls-pagos" x1="9.55" y1="19.47" x2="9.55" y2="16.17" />
              <path class="cls-pagos" d="m12.87,24.53c-1.82,0-3.3,1.48-3.3,3.3,0-1.82-1.48-3.3-3.3-3.3s-3.3,1.48-3.3,3.3c0-1.44-.92-2.66-2.2-3.11,0-4.12,0-21.77,0-21.77C.76,1.74,1.74.76,2.96.76h17.6" />
              <path class="cls-pagos" d="m12.85,24.53c1.82,0,3.3,1.48,3.3,3.3,0-1.44.92-2.66,2.2-3.11,0-4.12,0-21.77,0-21.77,0-1.26,1.06-2.27,2.34-2.2,1.14.07,2.07,1.1,2.07,2.24v6.56h-4.4" />
            </g>
          </svg>
        </div>
      </div>


      <div class="caja-menu">
        <div class="svg-menu">
          <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.12 19.15">
            <defs>
              <style>
                .cls-ajustes {
                  fill: none;
                  stroke: #76869e;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  stroke-width: 1.12px;
                }
              </style>
            </defs>
            <g id="g121">
              <g id="g127">
                <path id="path129" class="cls-ajustes" d="m11.36,2.59c.66.17,1.29.43,1.87.77,0,0,.28-.28.59-.59.23-.23.53-.35.85-.35s.63.13.85.35c.27.27.58.58.85.85.23.23.35.53.35.85s-.13.62-.35.85c-.31.31-.59.59-.59.59.34.57.6,1.2.77,1.86h.81c.66,0,1.2.54,1.2,1.2v1.21c0,.66-.54,1.2-1.2,1.2h-.81c-.17.66-.43,1.29-.77,1.86,0,0,.28.28.59.59.23.23.35.53.35.85s-.13.64-.37.86l-.83.82c-.23.23-.54.37-.87.37s-.63-.13-.85-.35c-.31-.31-.59-.59-.59-.59-.58.34-1.2.6-1.87.77v.83c0,.66-.54,1.2-1.2,1.2h-1.21c-.66,0-1.2-.54-1.2-1.2v-.81c-.66-.17-1.28-.43-1.85-.77,0,0-.28.28-.58.59-.22.23-.53.35-.85.35s-.62-.13-.85-.35c-.27-.27-.57-.58-.85-.85-.22-.23-.35-.53-.35-.85s.13-.63.35-.85c.31-.31.58-.59.58-.59-.34-.58-.6-1.2-.77-1.87h-.82c-.66,0-1.2-.54-1.2-1.2v-1.21c0-.66.54-1.2,1.2-1.2h.78c.17-.66.43-1.29.77-1.86,0,0-.28-.28-.59-.59-.23-.23-.35-.53-.35-.85s.13-.62.35-.85c.27-.27.58-.58.85-.85.23-.23.53-.35.85-.35s.63.13.85.35c.31.31.59.59.59.59.58-.34,1.2-.6,1.87-.77v-.83c0-.66.54-1.2,1.2-1.2h1.21c.66,0,1.2.54,1.2,1.2v.83Z" />
              </g>
              <g id="g131">
                <path id="path133" class="cls-ajustes" d="m9.56,5.97c1.99,0,3.6,1.61,3.6,3.6s-1.61,3.6-3.6,3.6-3.6-1.61-3.6-3.6,1.61-3.6,3.6-3.6Z" />
              </g>
            </g>
          </svg>
        </div>

      </div>
    </div>
  </div>

  <div class="abajo-flex">

    <div class="caja-menu" onclick="window.location.href='<?= $base_url ?>views/login.php'">
      <div class="svg-menu">

        <svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.78 18.4">
          <defs>
            <style>
              .cls-iconnaranja {
                fill: none;
                stroke: #f07e0b;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-width: 2.4px;
              }
            </style>
          </defs>
          <g id="g2797">
            <path id="path2799" class="cls-iconnaranja" d="m8.36,6.83V1.2" />
          </g>
          <g id="g2809">
            <path id="path2811" class="cls-iconnaranja" d="m3.6,4.66c-1.47,1.32-2.4,3.22-2.4,5.35,0,3.97,3.22,7.19,7.19,7.19s7.19-3.22,7.19-7.19c0-2.13-.93-4.03-2.4-5.35" />
          </g>
        </svg>
      </div>
    </div>
  </div>
  </div>
</body>

</html>