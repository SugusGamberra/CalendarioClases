// importación módulos
import { formatTime, createParticleEffect } from './utils.js';
import { saveEvent, deleteEvent } from './api.js';
import { initModalHandlers, initFooterEffect, initLogoutButton } from './ui.js';

// evento largo = allday

function transformarEventoLargoEnAllDay(eventData) {
    if (eventData.allDay) {
        return eventData;
    }

    if (eventData.start && eventData.end) {
        const start = new Date(eventData.start);
        const end = new Date(eventData.end);
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours >= 8) {
            eventData.allDay = true;
            eventData.startTime = ''; 
            eventData.endTime = '';
        }
    }
    return eventData;
}

// contraseña
const TOKEN_STORAGE_KEY = 'calendar_auth_token';

let cachedToken = null;

// listener del html
document.addEventListener('DOMContentLoaded', () => {

    // Calendario
    const calendarEl = document.getElementById('calendario');
    const { 
        apiKey, 
        calendarId, 
        notionCalendarId,
    } = calendarEl.dataset;

    // Modal ver
    const viewModalEl = document.getElementById('event-modal');
    const modalTitle = viewModalEl.querySelector('.event-modal__title');
    const modalTime = viewModalEl.querySelector('.event-modal__time');
    const modalDescription = viewModalEl.querySelector('.event-modal__description');
    
    // Modal crear
    const createModalEl = document.getElementById('create-event-modal');
    const createModalTitleInput = createModalEl.querySelector('#event-title-input');
    const createModalDescInput = createModalEl.querySelector('#event-desc-input');
    const createModalStartInput = createModalEl.querySelector('#event-start-input');
    const createModalEndInput = createModalEl.querySelector('#event-end-input');

    // Modal login
    const loginModalEl = document.getElementById('login-modal');
    const loginModalInput = loginModalEl.querySelector('#login-modal-input');
    
    // Modal confirmar
    const confirmModalEl = document.getElementById('confirm-modal');

    // modal alerta

    const alertModalEl = document.getElementById('alert-modal');

    // Footer y Logout
    const footerInner = document.querySelector('.footer__inner');
    const logoutButton = document.getElementById('logout-btn');

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
        },
        login: { 
            el: loginModalEl,
            input: loginModalEl.querySelector('#login-modal-input'),
            submitBtn: loginModalEl.querySelector('#login-modal-submit'),
            closeBtn: loginModalEl.querySelector('#login-modal-close'),
            backdrop: loginModalEl.querySelector('#login-modal-backdrop')
        },
        confirm: { 
            el: confirmModalEl,
            yesBtn: confirmModalEl.querySelector('#confirm-modal-yes'),
            noBtn: confirmModalEl.querySelector('#confirm-modal-no'),
            closeBtn: confirmModalEl.querySelector('#confirm-modal-close'),
            backdrop: confirmModalEl.querySelector('#confirm-modal-backdrop')
        },
        alert: {
            el: alertModalEl,
            title: alertModalEl.querySelector('.alert-modal__title'),
            description: alertModalEl.querySelector('#alert-modal-description'),
            okBtn: alertModalEl.querySelector('#alert-modal-ok'),
            backdrop: alertModalEl.querySelector('#alert-modal-backdrop')
        }
    });

    initFooterEffect(footerInner, createParticleEffect);
    
    initLogoutButton(logoutButton, () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        cachedToken = null;
        ui.showAlert("Sesión Cerrada", "La próxima vez se te pedirá la contraseña.");
    });


    // lógica del login
    async function getAuthToken() {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
            cachedToken = storedToken;
            return storedToken;
        }

        if (cachedToken) {
            return cachedToken;
        }
        
        try {
            const password = await ui.getAuthToken();
            cachedToken = password; 
            return password;
        } catch {
            return null;
        }
    }

    async function askToRememberToken(token) {
        if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
            return;
        }

        try {
            await ui.askToRememberToken();
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            await ui.showAlert("¡Sesión Guardada!", "No volverás a ver este mensaje en este navegador.");

        } catch {
            console.log("El usuario decidió no guardar la sesión.");
        }
    }


    // creación calendario
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        weekends: false,
        allDaySlot: true,
        allDayText:'☁️',
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        height: 'auto',
        selectable: true,
        selectMirror: true,
        nowIndicator: true, 
        slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        googleCalendarApiKey: apiKey,
        eventSources: [
            { googleCalendarId: calendarId, className: 'gcal-event', eventDataTransform: transformarEventoLargoEnAllDay },
            { googleCalendarId: notionCalendarId, color: '#ff9f43', className: 'notion-event', eventDataTransform: transformarEventoLargoEnAllDay }
        ],
        eventClick: (info) => {
            info.jsEvent.preventDefault();
            createModalEl.setAttribute('aria-hidden', 'true');
            ui.registerEventIdToDelete(info.event.id);
            modalTitle.textContent = info.event.title;
            const startTime = formatTime(info.event.start);
            const endTime = formatTime(info.event.end);
            modalTime.textContent = `${startTime} - ${endTime}`;
            modalDescription.innerHTML = info.event.extendedProps.description || 'No hay descripción disponible.';
            viewModalEl.setAttribute('aria-hidden', 'false');
        },
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

    
    // Botón guardar
    createModalEl.querySelector('#create-modal-save').addEventListener('click', async () => {
        const eventData = {
            title: createModalTitleInput.value,
            description: createModalDescInput.value,
            start: createModalStartInput.value,
            end: createModalEndInput.value,
        };

        if (!eventData.title || !eventData.start || !eventData.end) {
            return alert('¡Oye! El título, el inicio y el fin son obligatorios.');
        }

        try {
            const token = await getAuthToken(); 
            if (!token) return;

            await saveEvent(eventData, token);
            
            await askToRememberToken(token);

        } catch (err) {
            console.error("Fallo al guardar:", err);
        } finally {
            createModalEl.setAttribute('aria-hidden', 'true');
            setTimeout(() => calendar.refetchEvents(), 3000); 
        }
    });

    // botón borrar
    viewModalEl.querySelector('#modal-delete-btn').addEventListener('click', async () => {
        const eventId = ui.getEventIdToDelete();
        
        try {
            const token = await getAuthToken();
            if (!token) return;

            await deleteEvent(eventId, token);

            await askToRememberToken(token);

        } catch (err) {
            console.error("Fallo al borrar:", err);
        } finally {
            viewModalEl.setAttribute('aria-hidden', 'true');
            ui.clearEventIdToDelete();
            setTimeout(() => calendar.refetchEvents(), 5000);
        }
    });
    
});