// nuevo evento (webhook)
export const saveEvent = (eventData) => { 
    console.log('Enviando señal a nuestro servidor (/api/create)...');
    
    return fetch('/api/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Respuesta de la api no fue OK');
        console.log('¡serverr respondió OK!');
    })
    .catch(error => {
        console.error('¡Error llamando la api!:', error);
        alert('No se pudo guardar el evento.');
    });
};

// borrar evento (webhook)
export const deleteEvent = (eventId) => { 
    if (!eventId) {
        alert('Error: No se ha seleccionado ningún ID de evento.');
        return Promise.reject('No event ID');
    }
    
    console.log('Enviando señal de borrado a nuestro servidor (/api/delete)...', eventId);
    
    return fetch('/api/delete', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: eventId })
    })
    .then(response => {
        if (!response.ok) throw new Error('La respuesta de /api/delete no fue OK');
        console.log('¡Servidor contestó OK al borrar!');
    })
    .catch(error => {
        console.error('¡Error llamando a /api/delete!:', error);
        alert('No se pudo borrar el evento.');
    });
};