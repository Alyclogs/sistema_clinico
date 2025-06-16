
import api from './api.js';
import { dayAfter, dateStrToDate, dateToDateStr, dayBefore, horaAHoraMinutos } from './date.js';
import { mostrarMensajeFlotante } from './utils.js';

let disponibilidadEspecialista = [];

// 1. Carga y normalización de la disponibilidad
export function actualizarDisponibilidadEspecialista(calendar, idespecialista) {
    return api.obtenerDisponibilidadEspecialista(idespecialista)
        .then(data => {
            disponibilidadEspecialista = data.map(d => ({
                ...d,
                es_excepcion: d.es_excepcion === '1',
                estado: d.estado ? d.estado.trim().toLowerCase() : null,
                dia: d.dia.toLowerCase()
            }));
            actualizarBusinessHours(calendar);
            if (!disponibilidadEspecialista.length) {
                mostrarMensajeFlotante("Especialista sin disponibilidad");
            }
            return disponibilidadEspecialista;
        });
}

export function actualizarBusinessHours(calendar) {
    const diasMap = {
        domingo: 0, lunes: 1, martes: 2, miércoles: 3,
        jueves: 4, viernes: 5, sábado: 6
    };
    const bh = [];

    // 1. Separar registros
    const regulares = disponibilidadEspecialista.filter(d => !d.es_excepcion);
    const cambios = disponibilidadEspecialista.filter(d => d.es_excepcion && d.estado === 'cambio de horario');
    const bloqueosTotales = disponibilidadEspecialista.filter(d => d.es_excepcion && d.estado === 'sin disponibilidad');

    // 2. Agrupar excepciones por día
    const bloqueosPorDia = {};
    bloqueosTotales.forEach(d => {
        (bloqueosPorDia[d.dia] = bloqueosPorDia[d.dia] || []).push(d);
    });
    const cambiosPorDia = {};
    cambios.forEach(d => {
        (cambiosPorDia[d.dia] = cambiosPorDia[d.dia] || []).push(d);
    });

    // 3. Construir franjas “regulares” descontando ambos tipos de excepción
    regulares.forEach(d => {
        let segmentos = [{ start: d.fechainicio, end: d.fechafin }];

        // restar bloqueos totales
        (bloqueosPorDia[d.dia] || []).forEach(exc => {
            segmentos = segmentos.flatMap(seg => recortarSegmento(seg, exc.fechainicio, exc.fechafin));
        });

        // restar cambios de horario
        (cambiosPorDia[d.dia] || []).forEach(exc => {
            segmentos = segmentos.flatMap(seg => recortarSegmento(seg, exc.fechainicio, exc.fechafin));
        });

        // añadir cada segmento resultante
        segmentos.forEach(seg => {
            bh.push({
                daysOfWeek: [diasMap[d.dia]],
                startTime: d.horainicio.slice(0, 5),
                endTime: d.horafin.slice(0, 5),
                startRecur: seg.start,
                endRecur: seg.end
            });
        });
    });

    // 4. Añadir las franjas de cambio de horario tal cual
    cambios.forEach(d => {
        bh.push({
            daysOfWeek: [diasMap[d.dia]],
            startTime: d.horainicio.slice(0, 5),
            endTime: d.horafin.slice(0, 5),
            startRecur: d.fechainicio,
            endRecur: d.fechafin
        });
    });

    calendar.setOption("businessHours", bh.length ? bh : {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '00:00',
        endTime: '00:00'
    });
    resaltarBloqueoAlmuerzo(calendar);
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

export function calcularDisponibilidadPorEspecialista(disponibilidades, citas) {
    const disponibilidadPorEspecialista = {};

    disponibilidades.forEach(d => {
        const id = d.idespecialista;
        const inicio = horaAHoraMinutos(d.horainicio);
        const fin = horaAHoraMinutos(d.horafin);
        const minutos = fin - inicio;

        if (!disponibilidadPorEspecialista[id]) {
            disponibilidadPorEspecialista[id] = { total: 0, ocupado: 0 };
        }

        disponibilidadPorEspecialista[id].total += minutos;
    });

    citas.forEach(c => {
        const id = c.idespecialista;
        if (!disponibilidadPorEspecialista[id]) return;

        const inicio = horaAHoraMinutos(c.hora_inicio);
        const fin = horaAHoraMinutos(c.hora_fin);
        const minutos = fin - inicio;

        disponibilidadPorEspecialista[id].ocupado += minutos;
    });

    const resultado = Object.entries(disponibilidadPorEspecialista).map(([id, tiempos]) => ({
        idespecialista: parseInt(id),
        minutos_disponibles: tiempos.total - tiempos.ocupado,
        minutos_ocupados: tiempos.ocupado,
        minutos_totales: tiempos.total
    }));

    resultado.sort((a, b) => b.minutos_disponibles - a.minutos_disponibles);

    return resultado;
}

// 3. Generación de “bloqueos” de refrigerio
export function generarEventosRefrigerio(calendar) {
    const eventos = [];
    const viewStart = calendar.view.activeStart;
    const viewEnd = calendar.view.activeEnd;

    // 1) Recolectar fechas con bloqueo total para ese día de la semana
    const fechasBloqueadas = new Set();
    disponibilidadEspecialista
        .filter(d => d.es_excepcion && d.estado === 'sin disponibilidad')
        .forEach(d => {
            const inicio = dateStrToDate(d.fechainicio);
            const fin = dateStrToDate(d.fechafin);
            let fecha = new Date(inicio);
            while (fecha <= fin) {
                const diaName = fecha
                    .toLocaleDateString('es-ES', { weekday: 'long' })
                    .toLowerCase();
                if (diaName === d.dia) {
                    fechasBloqueadas.add(dateToDateStr(fecha));
                }
                fecha.setDate(fecha.getDate() + 1);
            }
        });

    // 2) Generar el sombreado de refrigerio
    disponibilidadEspecialista.forEach(d => {
        if (!d.refrigerio_horainicio || !d.refrigerio_horafin) return;

        // convertir rangos de fecha
        const inicio = dateStrToDate(d.fechainicio);
        const fin = dateStrToDate(d.fechafin);
        let fecha = new Date(viewStart);

        // recortar tiempo a HH:mm
        const reIni = d.refrigerio_horainicio.slice(0, 5);
        const reFin = d.refrigerio_horafin.slice(0, 5);

        while (fecha <= viewEnd) {
            const diaName = fecha
                .toLocaleDateString('es-ES', { weekday: 'long' })
                .toLowerCase();
            const fechaStr = dateToDateStr(fecha);

            if (
                diaName === d.dia &&
                fecha >= inicio && fecha <= fin &&
                !fechasBloqueadas.has(fechaStr) &&
                // asegurarnos que el refrigerio está dentro de la jornada
                reIni >= d.horainicio.slice(0, 5) &&
                reFin <= d.horafin.slice(0, 5)
            ) {
                eventos.push({
                    start: `${fechaStr}T${reIni}`,
                    end: `${fechaStr}T${reFin}`,
                    display: 'background',
                    classNames: ['fc-blocked-almuerzo']
                });
            }
            fecha.setDate(fecha.getDate() + 1);
        }
    });
    return eventos;
}

export function resaltarBloqueoAlmuerzo(calendar) {
    // eliminar previos
    calendar.getEvents().forEach(e => {
        if (e.extendedProps?.tipo === 'almuerzo') {
            e.remove();
        }
    });
    // añadir nuevos
    generarEventosRefrigerio(calendar).forEach(ev => {
        calendar.addEvent({
            ...ev,
            extendedProps: { tipo: 'almuerzo' }
        });
    });
}