// importación módulos
import { formatTime, createParticleEffect, wait } from './utils.js';
import { saveEvent, deleteEvent, updateEvent } from './api.js';
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
let currentSelectedEvent = null;

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
    const modalDeleteBtn = viewModalEl.querySelector('#modal-delete-btn'); 
    const modalEditBtn = viewModalEl.querySelector('#modal-edit-btn'); 
    
    // Modal crear/editar
    const createModalEl = document.getElementById('create-event-modal');
    const createModalTitleEl = createModalEl.querySelector('#create-modal-title');
    const createModalIdInput = createModalEl.querySelector('#event-id-input');
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
            currentSelectedEvent = info.event; 
            const isExternalEvent = info.event.classNames.includes('gcal-event') || info.event.classNames.includes('notion-event');
            if (!isExternalEvent) {
                // no es externo, mostrar botones de accion
                modalDeleteBtn.style.display = 'inline-block';
                modalEditBtn.style.display = 'inline-block';
                ui.registerEventIdToDelete(info.event.id);
            } else {
                // es externo, ocultaer los botones de accipn local
                modalDeleteBtn.style.display = 'none';
                modalEditBtn.style.display = 'none';
                ui.clearEventIdToDelete();
            }

            modalTitle.textContent = info.event.title;
            const startTime = formatTime(info.event.start);
            const endTime = formatTime(info.event.end);
            modalTime.textContent = `${startTime} - ${endTime}`;
            modalDescription.innerHTML = info.event.extendedProps.description || 'No hay descripción disponible.';
            viewModalEl.setAttribute('aria-hidden', 'false');
        },
        select: (selectionInfo) => {
            viewModalEl.setAttribute('aria-hidden', 'true');
            createModalTitleEl.textContent = 'Crear Nuevo Evento';
            createModalIdInput.value = '';
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

    
    // Botón para editar
    modalEditBtn.addEventListener('click', () => {
        if (!currentSelectedEvent) return;
        viewModalEl.setAttribute('aria-hidden', 'true');
        createModalTitleEl.textContent = 'Editar Evento'; 
        createModalIdInput.value = currentSelectedEvent.id;
        createModalTitleInput.value = currentSelectedEvent.title;
        createModalDescInput.value = currentSelectedEvent.extendedProps.description || '';
        const start = currentSelectedEvent.start.toISOString().slice(0, 16);
        const end = currentSelectedEvent.end.toISOString().slice(0, 16);
        
        createModalStartInput.value = start;
        createModalEndInput.value = end;

        createModalEl.setAttribute('aria-hidden', 'false');
        setTimeout(() => createModalTitleInput.focus(), 100);

        currentSelectedEvent = null;
    });


    // Botón guardar/actualizar
    createModalEl.querySelector('#create-modal-save').addEventListener('click', async () => {
        
        const isEditing = !!createModalIdInput.value; 

        const eventData = {
            title: createModalTitleInput.value,
            description: createModalDescInput.value,
            start: createModalStartInput.value,
            end: createModalEndInput.value,
        };
        
        if (isEditing) {
            eventData.eventId = createModalIdInput.value;
        }

        if (!eventData.title || !eventData.start || !eventData.end) {
            return alert('¡Oye! El título, el inicio y el fin son obligatorios.');
        }

        const fechaInicio = new Date(eventData.start);
        const fechaFin = new Date(eventData.end);

        if (fechaFin <= fechaInicio) {
            return alert('¡Oye, chatita! 😜 La fecha de fin no puede ser ANTES (o igual) que la fecha de inicio. ¡Revisa las horas!');
        }

        try {
            const token = await getAuthToken(); 
            if (!token) return;
            
            if (isEditing) {
                await updateEvent(eventData, token);
            } else {
                await saveEvent(eventData, token);
            }
            
            await askToRememberToken(token);

            await wait(3000); 
            calendar.refetchEvents();

        } catch (err) {
            console.error("Fallo al guardar/actualizar:", err);
        } finally {
            createModalEl.setAttribute('aria-hidden', 'true');
            createModalIdInput.value = ''; 
            createModalTitleEl.textContent = 'Crear Nuevo Evento';
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
            await wait(5000);
            calendar.refetchEvents();

        } catch (err) {
            console.error("Fallo al borrar:", err);
        } finally {
            viewModalEl.setAttribute('aria-hidden', 'true');
            ui.clearEventIdToDelete();
            currentSelectedEvent = null;
        }
    });
})