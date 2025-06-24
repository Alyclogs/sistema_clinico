export function formatearHora12h(hora24) {
    if (!hora24) return '';
    let [h, m] = hora24.split(':');
    h = parseInt(h);
    let suf = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m} ${suf}`;
}

// Sumar minutos a una hora en formato hh:mm
export function sumarMinutos(hora, minutos) {
    let [h, m] = hora.split(':').map(Number);
    let date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + minutos);
    let nh = date.getHours().toString().padStart(2, '0');
    let nm = date.getMinutes().toString().padStart(2, '0');
    return `${nh}:${nm}`;
}

export function diferenciaEnMinutos(horaInicio, horaFin) {
    const aMinutos = (hora) => {
        const partes = hora.split(':').map(Number);
        const horas = partes[0] || 0;
        const minutos = partes[1] || 0;
        const segundos = partes[2] || 0;
        return horas * 60 + minutos + segundos / 60;
    };

    const minutosInicio = aMinutos(horaInicio);
    const minutosFin = aMinutos(horaFin);

    return minutosFin - minutosInicio;
}

export function horaAHoraMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

export function calcularEdad(fechaNacStr) {
    const hoy = new Date();
    const partes = fechaNacStr.split('-');
    if (partes.length !== 3) return '';
    const anio = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    const fechaNac = new Date(anio, mes, dia);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad;
}

// Función helper para recortar un segmento {start,end} con un intervalo [a,b]
export function recortarSegmento(seg, a, b) {
    if (seg.end < a || seg.start > b) {
        // no solapan
        return [seg];
    }
    const out = [];
    if (seg.start < a) {
        out.push({ start: seg.start, end: dayBefore(a) });
    }
    if (seg.end > b) {
        out.push({ start: dayAfter(b), end: seg.end });
    }
    return out;
}

// Helpers de fechas
export function dateStrToDate(str) {
    return new Date(str + 'T00:00:00');
}
export function dateToDateStr(date) {
    return date.toISOString().slice(0, 10);
}
export function dayBefore(str) {
    const d = dateStrToDate(str);
    d.setDate(d.getDate() - 1);
    return dateToDateStr(d);
}
export function dayAfter(str) {
    const d = dateStrToDate(str);
    d.setDate(d.getDate() + 1);
    return dateToDateStr(d);
}
export function buildDate(fechaStr, horaStr) {
    return new Date(`${fechaStr}T${horaStr}:00`);
}

export function formatearFecha(fecha) {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function ajustarFecha(fechaStr, dias) {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day); // mes base 0
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
}

export function formatearFechaLocal(fechaStr) {
    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const opcionesFecha = { month: 'long', day: 'numeric', year: 'numeric' };
    const fechaTexto = fecha.toLocaleDateString('es-ES', opcionesFecha);
    return fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
}

export function formatearFechaFull(fechaStr) {
    const fecha = new Date(fechaStr);
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const fechaTexto = fecha.toLocaleString('es-ES', opciones);
    return fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
}