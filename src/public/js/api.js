// nuevo evento (webhook)
export const saveEvent = (eventData, token) => { 
    console.log('Enviando señal a nuestro servidor (/api/create)...');
    
    return fetch('/api/create', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/create no fue OK');
        console.log('¡Servidor contestó OK!');
    })
    .catch(error => {
        console.error('¡Error llamando la api!:', error);
        alert('Error al guardar: ${error.message}');
    });
};

// borrar evento (webhook)
export const deleteEvent = (eventId, token) => { 
    if (!eventId) {
        alert('Error: No se ha seleccionado ningún ID de evento.');
        return Promise.reject('No event ID');
    }
    
    console.log('Enviando señal de borrado a nuestro servidor (/api/delete)...', eventId);
    
    return fetch('/api/delete', { 
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: eventId })
    })
    .then(response => {
        if (response.status === 401) throw new Error('Contraseña (token) incorrecta.');
        if (!response.ok) throw new Error('La respuesta de /api/delete no fue OK');
        console.log('¡Servidor contestó OK al borrar!');
    })
    .catch(error => {
        console.error('¡Error llamando a /api/delete!:', error);
        alert('Error al borrar: ${error.message}');
    });
};