// nuevo evento (webhook)
export const saveEvent = (url, eventData) => {
    console.log('Enviando señal a Make...');
    
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Respuesta de Make no fue OK');
        console.log('¡Evento enviado a Make!');
    })
    .catch(error => {
        console.error('¡Error mandando el webhook!:', error);
        alert('No se pudo guardar el evento.');
    });
};

// borrar evento (webhook)
export const deleteEvent = (url, eventId) => {
    if (!eventId) {
        alert('Error: No se ha seleccionado ningún ID de evento.');
        return Promise.reject('No event ID');
    }
    
    console.log('Enviando señal de borrado a Make...', eventId);

    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: eventId })
    })
    .then(response => {
        if (!response.ok) throw new Error('Respuesta de Make no fue OK');
        console.log('¡Señal de borrado enviada!');
    })
    .catch(error => {
        console.error('¡Error mandando el webhook de borrado!:', error);
        alert('No se pudo borrar el evento.');
    });
};