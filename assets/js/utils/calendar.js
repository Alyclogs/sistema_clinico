import { mostrarTooltipCita, ocultarTooltip } from "./cita.js";

export class calendarUI {
    calendar;
    miniCalendar;

    buildCalendar = (calendarEl) => {
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "timeGridWeek",
            slotDuration: "00:30:00",
            slotLabelInterval: "00:30:00",
            slotMinTime: "09:00:00",
            slotMaxTime: "18:00:00",
            selectable: true,
            editable: true,
            locale: "es",
            headerToolbar: false,
            hiddenDays: [0],
            slotLabelFormat: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            },
            dayHeaderFormat: {
                weekday: "long",
                day: "2-digit",
            },
            eventClick: function (info) {
                const event = info.event;

                if (event.classNames.includes('evento-single')) {
                    mostrarTooltipCita(event.extendedProps.cita, info.el);
                }
            },
            eventMouseLeave: function (info) {
                if (info.event.classNames.includes('evento-single')) {
                    setTimeout(() => {
                        ocultarTooltip();
                    }, 1500)
                }
            }
        });

        this.calendar.on('datesSet', function () {
            updateCalendarDateRange(this.calendar);
        });

        this.calendar.setOption('eventContent', function (arg) {
            if (
                arg.event.classNames.includes('fc-slot-custom-content') ||
                arg.event.classNames.includes('multiples-citas-evento')
            ) {
                return { html: arg.event.title };
            }
        });

        document.getElementById('prev-week').addEventListener('click', () => {
            this.calendar.prev();
            updateCalendarDateRange(this.calendar);
        });

        document.getElementById('next-week').addEventListener('click', () => {
            this.calendar.next();
            updateCalendarDateRange(this.calendar);
        });
        return this.calendar;
    };

    buildMiniCalendar = (miniCalendarEl, calendar = null) => {
        this.miniCalendar = new FullCalendar.Calendar(miniCalendarEl, {
            initialView: "dayGridMonth",
            locale: "es",
            headerToolbar: {
                left: "prev",
                center: "title",
                right: "next",
            },
            selectable: true,
            ...(calendar && {
                dateClick: function (info) {
                    calendar.gotoDate(info.dateStr);
                    updateCalendarDateRange(calendar);
                }
            })
        });
        return this.miniCalendar;
    };

    addEvent(event) {
        if (this.calendar) {
            this.calendar.addEvent(event);
        }
    }

    removeEvents(tipo) {
        if (!this.calendar) return;
        this.calendar.getEvents().forEach(ev => {
            if (ev.extendedProps?.tipo === tipo) {
                ev.remove();
            }
        });
    }

    setOption(option, value) {
        if (this.calendar) {
            this.calendar.setOption(option, value);
        }
    }
}

export function updateCalendarDateRange(calendar) {
    if (!calendar) return;
    const start = calendar.view.activeStart;
    const end = calendar.view.activeEnd;

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    const startStr = start.toLocaleDateString("es-ES", options).toUpperCase();
    const endStr = new Date(end - 1).toLocaleDateString("es-ES", options).toUpperCase();

    document.getElementById("calendar-dates").textContent = `${startStr} - ${endStr}`;
};

