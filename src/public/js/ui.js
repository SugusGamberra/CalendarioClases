// ID de borrar evento
let eventIdToDelete = null;

// cerrar modales
const closeModal = (modalEl) => {
    modalEl.setAttribute('aria-hidden', 'true');
};

// listeners de ver y crear
export const initModalHandlers = (modals) => {
    
    // ver:
    modals.view.closeBtn.addEventListener('click', () => closeModal(modals.view.el));
    modals.view.backdrop.addEventListener('click', () => closeModal(modals.view.el));

    // crear:
    modals.create.closeBtn.addEventListener('click', () => closeModal(modals.create.el));
    modals.create.backdrop.addEventListener('click', () => closeModal(modals.create.el));

    // registro del id a borrar:
    return {
        registerEventIdToDelete: (id) => {
            eventIdToDelete = id;
        },
        getEventIdToDelete: () => eventIdToDelete,
        clearEventIdToDelete: () => {
            eventIdToDelete = null;
        }
    };
};

// efecto particulas footer
export const initFooterEffect = (footerEl, effectFn) => {
    if (footerEl) {
        footerEl.addEventListener('mousemove', effectFn);
    }
};

// boton cerrar sesions
export const initLogoutButton = (buttonEl, onClickCallback) => {
    if (buttonEl) {
        buttonEl.addEventListener('click', onClickCallback);
    }
};