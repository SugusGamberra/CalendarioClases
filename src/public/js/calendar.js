document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendario');

    const apiKey = window.calendarConfig.apiKey;
    const calendarId = window.calendarConfig.calendarId;
    const notionCalendarId = window.calendarConfig.notionCalendarId;
    const makeWebhookUrl = window.calendarConfig.makeWebhookUrl;

    const modal = document.getElementById('event-modal');
    const modalTitle = modal.querySelector('.event-modal__title');
    const modalTime = modal.querySelector('.event-modal__time');
    const modalDescription = modal.querySelector('.event-modal__description');
    const modalCloseBtn = modal.querySelector('.event-modal__close');
    const modalBackdrop = modal.querySelector('.event-modal__backdrop');

    const createModal = document.getElementById('create-event-modal');
    const createModalTitleInput = createModal.querySelector('#event-title-input');
    const createModalSaveBtn = createModal.querySelector('#create-modal-save');
    const createModalCloseBtn = createModal.querySelector('#create-modal-close');
    const createModalBackdrop = createModal.querySelector('#create-modal-backdrop');

    let currentSelectionInfo = null;

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
        selectable: true,
        selectMirror: true,
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
        eventSources: [
            {
                googleCalendarId: calendarId,
                className: 'gcal-event'
            },
            {
                googleCalendarId: notionCalendarId,
                color: '#ff9e4380',
                className: 'notion-event'
            }
        ],

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
        },
        select: function(selectionInfo) {
            currentSelectionInfo = selectionInfo;
            createModalTitleInput.value = '';
            createModal.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                createModalTitleInput.focus();
            }, 100);
            calendar.unselect(); 
        }
        
    });

    calendar.render();

    // Lógica para cerrar el modal y guardar

    const closeCreateModal = () => {
        createModal.setAttribute('aria-hidden', 'true');
        currentSelectionInfo = null;
    };

    const saveEvent = () => {
        const title = createModalTitleInput.value;
        if (!title || !currentSelectionInfo) {
            closeCreateModal();
            return;
        }

        console.log('Enviando señal a Make...');

        fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                start: currentSelectionInfo.startStr,
                end: currentSelectionInfo.endStr
            })
        })
        .then(response => {
            console.log('Evento enviado a Make correctamente');
            setTimeout(() => {
                calendar.refetchEvents(); 
            }, 3000);

            closeCreateModal();
        })
        .catch(error => {
            console.error('Error mandando el webhook!:', error);
            alert('Algo ha fallado al mandar la señal.');
        });

        closeCreateModal();
    };

    createModalCloseBtn.addEventListener('click', closeCreateModal);
    createModalBackdrop.addEventListener('click', closeCreateModal);
    createModalSaveBtn.addEventListener('click', saveEvent);

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