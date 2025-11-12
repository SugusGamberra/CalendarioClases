// nuevo evento (webhook)
export const saveEvent = (eventData, token) => { 
    console.log('Enviando señal de CREACIÓN a nuestro servidor (/api/create)...');
    const payload = { ...eventData, action: 'create' };
    
    return fetch('/api/create', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/create no fue OK');
        console.log('¡Servidor contestó OK a la creación!');
        return Promise.resolve(response);
    })
    .catch(error => {
        console.error('¡Error llamando la api!:', error);
        alert(`Error al guardar: ${error.message}`);
        return Promise.reject(error);
    });
};

// borrar evento (webhook)
export const deleteEvent = (eventId, token) => { 
    if (!eventId) {
        alert('Error: No se ha seleccionado ningún ID de evento.');
        return Promise.reject('No event ID');
    }
    
    console.log('Enviando señal de BORRADO a nuestro servidor (/api/create)...', eventId);
    
    const payload = { eventId: eventId, action: 'delete' };

    return fetch('/api/create', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/delete no fue OK');
        console.log('¡Servidor contestó OK al borrar!');
        return Promise.resolve(response);
    })
    .catch(error => {
        console.error('¡Error llamando a /api/delete!:', error);
        alert(`Error al borrar: ${error.message}`);
        return Promise.reject(error);
    });
};

// actualizar evento (webhook)
export const updateEvent = (eventData, token) => { 
    if (!eventData.eventId) {
        alert('Error: No hay ID de evento para actualizar.');
        return Promise.reject('No event ID for update');
    }
    
    console.log('Enviando señal de ACTUALIZACIÓN a nuestro servidor (/api/create)...', eventData.eventId);
    
    const payload = { ...eventData, action: 'update' };

    return fetch('/api/create', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/update no fue OK');
        console.log('¡Servidor contestó OK a la actualización!');
        return Promise.resolve(response);
    })
    .catch(error => {
        console.error('¡Error llamando a /api/update!:', error);
        alert(`Error al actualizar: ${error.message}`);
        return Promise.reject(error);
    });
};