export const estadosCita = { '3': 'pendiente', '4': 'cancelado', '5': 'anulado' }

function getSVGPendiente(width = 11.15, height = 11.15) {
    return `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${width}px"
     height="${height}px" viewBox="0 0 ${width} ${height}" style="overflow:visible;enable-background:new 0 0 ${width} ${height};"
     xml:space="preserve">
<style type="text/css">
    .st010{fill-rule:evenodd;clip-rule:evenodd;fill:#F07E0B;}
    .st011{fill:#FFFFFF;}
</style>
<defs>
</defs>
<g>
    <g>
        <path class="st010" d="M5.57,0c3.08,0,5.57,2.5,5.57,5.57s-2.5,5.57-5.57,5.57C2.5,11.15,0,8.65,0,5.57S2.5,0,5.57,0"/>
    </g>
    <path class="st011" d="M7.82,8.34c-0.11,0-0.22-0.04-0.3-0.12L5.17,5.88C5.09,5.8,5.05,5.69,5.05,5.57V2.16
        c0-0.24,0.19-0.43,0.43-0.43c0.24,0,0.43,0.19,0.43,0.43V5.4l2.22,2.22c0.17,0.17,0.17,0.44,0,0.6c0,0,0,0,0,0
        C8.04,8.3,7.93,8.35,7.82,8.34z"/>
</g>
</svg>
`;
}

function getSVGAnulado(width = 11, height = 11) {
    return `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${width}px"
     height="${height}px" viewBox="0 0 ${width} ${height}" style="overflow:visible;enable-background:new 0 0 ${width} ${height};" xml:space="preserve">
<style type="text/css">
    .st012{fill:none;stroke:#E5252A;stroke-linecap:round;stroke-miterlimit:10;}
</style>
<defs>
</defs>
<g>
    <g id="g327_1_" transform="translate(492,135)">
        <path id="path329_1_" class="st012" d="M-481.5-129.5c0,2.76-2.24,5-5,5s-5-2.24-5-5c0-2.76,2.24-5,5-5S-481.5-132.26-481.5-129.5z"
            />
    </g>
    <g id="g331_1_" transform="translate(347,105)">
        <path id="path333_1_" class="st012" d="M-342.8-98.2l2.61-2.61"/>
    </g>
    <g id="g335_1_" transform="translate(407,105)">
        <path id="path337_1_" class="st012" d="M-400.2-98.2l-2.61-2.61"/>
    </g>
</g>
</svg>
`;
}

export const getSVGcancelado = (width = 11.15, height = 11.15) => {
    return `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${width}px"
     height="${height}px" viewBox="0 0 ${width} ${height}" style="overflow:visible;enable-background:new 0 0 ${width} ${height};"
     xml:space="preserve">
<style type="text/css">
    .st013{fill-rule:evenodd;clip-rule:evenodd;fill:#48B02C;}
    .st014{fill-rule:evenodd;clip-rule:evenodd;fill:#FFFFFF;}
</style>
<defs>
</defs>
<g>
    <path class="st013" d="M5.57,0c3.08,0,5.57,2.5,5.57,5.57s-2.5,5.57-5.57,5.57C2.5,11.15,0,8.65,0,5.57S2.5,0,5.57,0"/>
    <path class="st014" d="M3.81,8.29L1.78,6.13C1.56,5.89,1.5,5.54,1.65,5.26c0.26-0.47,0.87-0.52,1.2-0.16l1.57,1.68l2.49-2.33
        C6.94,4.43,6.96,4.41,6.99,4.4l1.16-1.08C8.38,3.1,8.73,3.03,9.01,3.19c0.47,0.26,0.52,0.87,0.16,1.2L5.6,7.73l0,0L4.36,8.88
        L3.81,8.29z"/>
</g>
</svg>
`;
}

export const getSVGCita = (estado) => {
    switch (estado) {
        case 'cita-pendiente':
            return getSVGPendiente();
        case 'cita-cancelado':
            return getSVGcancelado();
        case 'cita-anulado':
            return getSVGAnulado();
        default:
            return '';
    }
}

export function ocultarTooltip() {
    document.querySelectorAll('.custom-tooltip-cita').forEach(el => el.remove());
}

export function mostrarTooltipCita(cita, targetElement) {
    ocultarTooltip();

    const pacienteNombre = `${cita.paciente_nombres} ${cita.paciente_apellidos}`;
    const fechaNacimiento = cita.paciente_fecha_nacimiento;
    const edad = calcularEdad(fechaNacimiento);
    const especialista = `${cita.especialista_nombre} ${cita.especialista_apellidos ?? ''}`;
    const horario = `${formatearHora12h(cita.hora_inicio)} - ${formatearHora12h(cita.hora_fin)}`;
    //const color = stringToColor(pacienteNombre);
    //const iniciales = getInitials(cita.paciente_nombres, cita.paciente_apellidos);
    const svgEstado = getSVGCita(`cita-${estadosCita[cita.idestado]}`);

    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip-cita';
    tooltip.innerHTML = `
    <div class="mytooltip">
    <div class="tooltip-content">
        <div class="tooltip-header">
            <img class="avatar-iniciales" src="${cita.paciente_foto}">
            <div class="datos-paciente">
                <strong>${pacienteNombre}</strong>
                <div class="paciente-detalles">${fechaNacimiento} - ${edad} años</div>
                <div>DNI: ${cita.paciente_dni}</div>
            </div>
        </div>
        <div class="tooltip-footer">
            <div class="especialista"><strong>${especialista}</strong></div>
            <div class="svg-horario">
            ${svgEstado}
${horario}</div>
        </div>
        </div>
        <button class="btn btn-light btn-ver-cita" onclick="verCita(${cita.idcita})">Ver cita</button>
        </div>`;

    document.body.appendChild(tooltip);

    const rect = targetElement.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;

    targetElement._tooltip = tooltip;

    tooltip.addEventListener('mouseleave', function () {
        setTimeout(() => {
            ocultarTooltip();
        }, 1000)
    })
}

