<?php
require_once __DIR__ . '/../../../models/Especialistas/EspecialistaModel.php';
session_start();
$idusuario = $_SESSION['idusuario'];

$especialistaModel = new EspecialistaModel();
$especialista = $especialistaModel->obtenerEspecialistaPorId($idusuario);
?>

<div class="dropdown pe-2">
  <button
    class="btn btn-light d-flex align-items-center"
    type="button"
    id="userDropdown"
    data-bs-toggle="dropdown"
    aria-expanded="false"
    style="border: none; background: transparent; gap:4px">
    <img
      src="<?php echo htmlspecialchars($especialista['foto_especialista']); ?>"
      alt="Foto del especialista"
      id="especialistaFoto"
      class="rounded-circle me-2"
      width="40"
      height="40" />
    <span class="me-2" id="especialistaNombre"><?php echo htmlspecialchars($especialista['nom_especialista']) . ' ' . htmlspecialchars($especialista['ape_especialista']); ?></span>
    <i class="fas fa-chevron-down"></i>
  </button>
  <ul class="dropdown-menu" aria-labelledby="userDropdown">
    <li>
      <a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Mi Perfil</a>
    </li>
    <li>
      <a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Configuración</a>
    </li>
    <li>
      <hr class="dropdown-divider" />
    </li>
    <li>
      <a class="dropdown-item" href="#"><i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión</a>
    </li>
  </ul>
  <input type="hidden" name="idespecialista" id="idespecialista" value="<?php echo htmlspecialchars($especialista['idespecialista']); ?>">
</div>