// ID de borrar evento
let eventIdToDelete = null;

// funciones auxiliares
const closeModal = (modalEl) => {
    modalEl.setAttribute('aria-hidden', 'true');
};
const openModal = (modalEl) => {
    modalEl.setAttribute('aria-hidden', 'false');
};

// Inicializa TODOS los modales (Ver, Crear, Login, Confirmar)
export const initModalHandlers = (elements) => {
    
    // handlers ver y crear
    elements.view.closeBtn.addEventListener('click', () => closeModal(elements.view.el));
    elements.view.backdrop.addEventListener('click', () => closeModal(elements.view.el));
    elements.create.closeBtn.addEventListener('click', () => closeModal(elements.create.el));
    elements.create.backdrop.addEventListener('click', () => closeModal(elements.create.el));

    // logica del login
    const getAuthToken = () => {
        // promesa
        return new Promise((resolve, reject) => {
            
            // limpiar listeners y cerrar
            const cleanupAndClose = () => {
                elements.login.submitBtn.removeEventListener('click', onSubmit);
                elements.login.closeBtn.removeEventListener('click', onCancel);
                elements.login.backdrop.removeEventListener('click', onCancel);
                closeModal(elements.login.el);
            };
            
            const onSubmit = () => {
                const password = elements.login.input.value;
                if (!password) {
                    alert('Por favor, introduce una contraseña.');
                    return;
                }
                cleanupAndClose();
                resolve(password);
            };

            const onCancel = () => {
                cleanupAndClose();
                reject();
            };

            // inputs y listeners
            elements.login.input.value = '';
            elements.login.submitBtn.addEventListener('click', onSubmit, { once: true });
            elements.login.closeBtn.addEventListener('click', onCancel, { once: true });
            elements.login.backdrop.addEventListener('click', onCancel, { once: true });
            
            // Mostramos el modal
            openModal(elements.login.el);
            setTimeout(() => elements.login.input.focus(), 100);
        });
    };

    // Confirmar
    const askToRememberToken = () => {
        return new Promise((resolve, reject) => {
            
            const cleanupAndClose = () => {
                elements.confirm.yesBtn.removeEventListener('click', onYes);
                elements.confirm.noBtn.removeEventListener('click', onNo);
                elements.confirm.closeBtn.removeEventListener('click', onNo);
                elements.confirm.backdrop.removeEventListener('click', onNo);
                closeModal(elements.confirm.el);
            };

            const onYes = () => {
                cleanupAndClose();
                resolve();
            };

            const onNo = () => {
                cleanupAndClose();
                reject();
            };

            // listeners y mostrarlos
            elements.confirm.yesBtn.addEventListener('click', onYes, { once: true });
            elements.confirm.noBtn.addEventListener('click', onNo, { once: true });
            elements.confirm.closeBtn.addEventListener('click', onNo, { once: true });
            elements.confirm.backdrop.addEventListener('click', onNo, { once: true });
            
            openModal(elements.confirm.el);
        });
    };

    // logica de la alerta

    const showAlert = (title, message) => {
        return new Promise((resolve) => {
            elements.alert.title.textContent = title;
            elements.alert.description.textContent = message;

            const onOk = () => {
                elements.alert.okBtn.removeEventListener('click', onOk);
                elements.alert.backdrop.removeEventListener('click', onOk);
                closeModal(elements.alert.el);
                resolve();
            };

            // listeners y mostrarloss
            elements.alert.okBtn.addEventListener('click', onOk, { once: true });
            elements.alert.backdrop.addEventListener('click', onOk, { once: true });
            
            openModal(elements.alert.el);
        });
    };

    return {
        // Lógica de ID
        registerEventIdToDelete: (id) => { eventIdToDelete = id; },
        getEventIdToDelete: () => eventIdToDelete,
        clearEventIdToDelete: () => { eventIdToDelete = null; },
        getAuthToken,
        askToRememberToken,
        showAlert
    };
};

// efecto particulas footer
export const initFooterEffect = (footerEl, effectFn) => {
    if (footerEl) {
        footerEl.addEventListener('mousemove', effectFn);
    }
};

// boton cerrar sesion
export const initLogoutButton = (buttonEl, onClickCallback) => {
    if (buttonEl) {
        buttonEl.addEventListener('click', onClickCallback);
    }
};