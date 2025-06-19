import { calcularEdad } from '../utils/date.js';

document.addEventListener('DOMContentLoaded', function () {
    let fnacPaciente = document.getElementById('pacienteEdad').textContent;
    document.getElementById('pacienteEdad').textContent += ` - ${calcularEdad(fnacPaciente)} años`;
})