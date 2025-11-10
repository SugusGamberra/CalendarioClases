// importación módulos
import { formatTime, createParticleEffect } from './utils.js';
import { saveEvent, deleteEvent } from './api.js';
import { initModalHandlers, initFooterEffect } from './ui.js';

// listener del html
document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendario');
    const { 
        apiKey, 
        calendarId, 
        notionCalendarId
    } = calendarEl.dataset;

    // ver
    const viewModalEl = document.getElementById('event-modal');
    const modalTitle = viewModalEl.querySelector('.event-modal__title');
    const modalTime = viewModalEl.querySelector('.event-modal__time');
    const modalDescription = viewModalEl.querySelector('.event-modal__description');
    
    // crear
    const createModalEl = document.getElementById('create-event-modal');
    const createModalTitleInput = createModalEl.querySelector('#event-title-input');
    const createModalDescInput = createModalEl.querySelector('#event-desc-input');
    const createModalStartInput = createModalEl.querySelector('#event-start-input');
    const createModalEndInput = createModalEl.querySelector('#event-end-input');

    // footer
    const footerInner = document.querySelector('.footer__inner');


    // handlers de la UI
    const ui = initModalHandlers({
        view: {
            el: viewModalEl,
            closeBtn: viewModalEl.querySelector('.event-modal__close'),
            backdrop: viewModalEl.querySelector('.event-modal__backdrop')
        },
        create: {
            el: createModalEl,
            closeBtn: createModalEl.querySelector('#create-modal-close'),
            backdrop: createModalEl.querySelector('#create-modal-backdrop')
        }
    });

    // inicializacion footer
    initFooterEffect(footerInner, createParticleEffect);


    // creación calendario
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
        
        // fuentes de eventos
        googleCalendarApiKey: apiKey,
        eventSources: [
            { googleCalendarId: calendarId, className: 'gcal-event' },
            { googleCalendarId: notionCalendarId, color: '#ff9f43', className: 'notion-event' }
        ],

        // clic (modal ver)
        eventClick: (info) => {
            info.jsEvent.preventDefault();
            createModalEl.setAttribute('aria-hidden', 'true');
            // ID de borrar (guardado)
            ui.registerEventIdToDelete(info.event.id);
            // Rellenar datos
            modalTitle.textContent = info.event.title;
            const startTime = formatTime(info.event.start);
            const endTime = formatTime(info.event.end);
            modalTime.textContent = `${startTime} - ${endTime}`;
            modalDescription.innerHTML = info.event.extendedProps.description || 'No hay descripción disponible.';
            // Abrir
            viewModalEl.setAttribute('aria-hidden', 'false');
        },

        // clci hueco vacío (crear)
        select: (selectionInfo) => {
            viewModalEl.setAttribute('aria-hidden', 'true');
            createModalTitleInput.value = '';
            createModalDescInput.value = '';
            createModalStartInput.value = selectionInfo.startStr.slice(0, 16);
            createModalEndInput.value = selectionInfo.endStr.slice(0, 16);
            createModalEl.setAttribute('aria-hidden', 'false');
            setTimeout(() => createModalTitleInput.focus(), 100);
            calendar.unselect(); 
        }
        
    });

    calendar.render();

    
    // botón guardar (crear)
    createModalEl.querySelector('#create-modal-save').addEventListener('click', () => {
        const eventData = {
            title: createModalTitleInput.value,
            description: createModalDescInput.value,
            start: createModalStartInput.value,
            end: createModalEndInput.value,
        };

        if (!eventData.title || !eventData.start || !eventData.end) {
            return alert('¡Oye! El título, el inicio y el fin son obligatorios.');
        }

        // Llamar API
        saveEvent(eventData).finally(() => {
            createModalEl.setAttribute('aria-hidden', 'true');
            setTimeout(() => calendar.refetchEvents(), 3000); 
        });
    });

    // botón borrar (ver)
    viewModalEl.querySelector('#modal-delete-btn').addEventListener('click', () => {
        const eventId = ui.getEventIdToDelete();
        
        // Llamar API
        deleteEvent(eventId).finally(() => {
            viewModalEl.setAttribute('aria-hidden', 'true');
            ui.clearEventIdToDelete();
            setTimeout(() => calendar.refetchEvents(), 5000);
        });
    });
    
});