export const buildCalendar = (calendarEl) => {
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "timeGridWeek",
        slotDuration: "00:30:00",
        slotLabelInterval: "00:30:00",
        slotMinTime: "09:00:00",
        slotMaxTime: "18:00:00",
        selectable: true,
        //nowIndicator: true,
        editable: true,
        locale: "es",
        headerToolbar: false,
        hiddenDays: [0],
        slotLabelFormat: {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // usa true si quieres formato AM/PM
        },
        dayHeaderFormat: {
            weekday: "long",
            day: "2-digit",
        },
        eventClick: function (info) {
            if (info.event.extendedProps.multiple) {
                console.log("Evento múltiple clickeado:", info.event);
            }
            console.log("Evento individual clickeado:", info.event);
        },
        /*
        eventMouseEnter: function (info) {
            const event = info.event;
    
            if (event.extendedProps.multiple && event.extendedProps.citas) {
                const cuadrados = info.el.querySelectorAll('.avatar');
    
                cuadrados.forEach(cuadrado => {
                    cuadrado.addEventListener('mouseenter', function () {
                        const citaId = this.dataset.id;
                        const cita = event.extendedProps.citas.find(c => c.idcita == citaId);
                        if (cita) {
                            mostrarTooltipCita(cita, this);
                        }
                    });
    
                    cuadrado.addEventListener('mouseleave', function () {
                        setTimeout(() => {
                            ocultarTooltip();
                        }, 1000)
                    });
                });
            } else if (event.extendedProps.cita && event.classNames.includes('cita-agendada-evento')) {
                mostrarTooltipCita(event.extendedProps.cita, info.el);
            }
        },
        eventMouseLeave: function (info) {
            setTimeout(() => {
                ocultarTooltip();
            }, 1500)
        }
            */
    });
    calendar.on('datesSet', function () {
        updateCalendarDateRange(calendar);
    });
    // Personaliza el renderizado de los eventos para permitir HTML en el título
    calendar.setOption('eventContent', function (arg) {
        if (arg.event.classNames.includes('fc-slot-custom-content') || arg.event.classNames.includes('multiples-citas-evento')) {
            return { html: arg.event.title };
        }
    });
    document.getElementById('prev-week').addEventListener('click', function () {
        calendar.prev();
        updateCalendarDateRange(calendar);
    });

    document.getElementById('next-week').addEventListener('click', function () {
        calendar.next();
        updateCalendarDateRange(calendar);
    });
    return calendar;
}

export function updateCalendarDateRange(calendar) {
    const start = calendar.view.activeStart;
    const end = calendar.view.activeEnd;

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    const startStr = start.toLocaleDateString("es-ES", options).toUpperCase();
    const endStr = new Date(end - 1)
        .toLocaleDateString("es-ES", options)
        .toUpperCase();

    document.getElementById(
        "calendar-dates"
    ).textContent = `${startStr} - ${endStr}`;
}

export const buildMiniCalendar = (miniCalendarEl) => new FullCalendar.Calendar(miniCalendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    headerToolbar: {
        left: "prev",
        center: "title",
        right: "next",
    },
    selectable: true,
    dateClick: function (info) {
        calendar.gotoDate(info.dateStr);
        updateCalendarDateRange();
    },
});