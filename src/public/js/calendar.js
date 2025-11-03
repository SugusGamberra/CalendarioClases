document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendario');

    const apiKey = window.calendarConfig.apiKey;
    const calendarId = window.calendarConfig.calendarId;

    const modal = document.getElementById('event-modal');
    const modalTitle = modal.querySelector('.event-modal__title');
    const modalTime = modal.querySelector('.event-modal__time');
    const modalDescription = modal.querySelector('.event-modal__description');
    const modalCloseBtn = modal.querySelector('.event-modal__close');
    const modalBackdrop = modal.querySelector('.event-modal__backdrop');

    // Formateo de hora en español
    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Función para CERRAR el modal
    const closeModal = () => {
        modal.setAttribute('aria-hidden', 'true');
    };

    // Asignamos los clics para cerrar
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // EL CALENDARIO
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek', 
        locale: 'es',
        weekends: false,
        allDaySlot: false,
        slotMinTime: '07:00:00',
        slotMaxTime: '20:00:00',
        height: 'auto',
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
        },

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        
        // Conexión con Google Calendar
        googleCalendarApiKey: apiKey,
        events: {
            googleCalendarId: calendarId,
            className: 'gcal-event'
        },

        // Clic en evento del calendario
        eventClick: function(info) {
            info.jsEvent.preventDefault();
            modalTitle.textContent = info.event.title;
            const startTime = formatTime(info.event.start);
            const endTime = formatTime(info.event.end);
            modalTime.textContent = `${startTime} - ${endTime}`;
            if (info.event.extendedProps.description) {
                modalDescription.innerHTML = info.event.extendedProps.description;
            } else {
                modalDescription.innerHTML = 'No hay descripción disponible.';
            }
            modal.setAttribute('aria-hidden', 'false');
        }
    });

    calendar.render();

    // Partículas en el footer
    const footerInner = document.querySelector('.footer__inner');

    if (footerInner) {
        footerInner.addEventListener('mousemove', function(e) {
            const particle = document.createElement('span');
            particle.classList.add('particle-effect');
            particle.style.top = (e.pageY - 15) + 'px';
            particle.style.left = (e.pageX - 5) + 'px';
            particle.innerHTML = Math.random() > 0.5 ? '🤍' : '✨';
            const randomX = (Math.random() - 0.5) * 50;
            particle.style.setProperty('--random-x', randomX + 'px');
            document.body.appendChild(particle);
            setTimeout(() => {
                particle.remove();
            }, 1000);
        });
    }
});