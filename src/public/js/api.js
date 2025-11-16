// CREAR
export const saveEvent = (eventData, token) => { 
    console.log('Enviando señal para creación de evento...');
    
    return fetch('/api/events', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/events no fue OK');
        console.log('Creación de evento exitosa!');
        return Promise.resolve(response);
    })
    .catch(error => {
        console.error('¡Error llamando la api!:', error);
        alert(`Error al guardar: ${error.message}`);
        return Promise.reject(error);
    });
};

// BORRAR
export const deleteEvent = (eventId, token) => { 
    if (!eventId) {
        alert('Error: No se ha seleccionado ningún ID de evento.');
        return Promise.reject('No event ID');
    }
    
    console.log('Borrando evento del calendario, ID:', eventId);
    
    return fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/events (DELETE) no fue OK');
        console.log('Se borró el evento con éxito!');
        return Promise.resolve(response);
    })
    .catch(error => {
        console.error('Error llamando a /api/events (DELETE):', error);
        alert(`Error al borrar: ${error.message}`);
        return Promise.reject(error);
    });
};

// EDITAR
export const updateEvent = (eventData, token) => { 
    const eventId = eventData.eventId;
    
    if (!eventId) {
        alert('Error: No hay ID de evento para actualizar.');
        return Promise.reject('No event ID for update');
    }
    
    console.log('Editando evento del calendario... ID:', eventId);
    
    return fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/events (PUT) no fue OK');
        console.log('Edición de evento exitosa!');
        return Promise.resolve(response);
    })
    .catch(error => {
        console.error('Error llamando a /api/events (PUT):', error);
        alert(`Error al actualizar: ${error.message}`);
        return Promise.reject(error);
    });
};