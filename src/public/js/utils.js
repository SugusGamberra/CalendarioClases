// Formateo de hora
export const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// funcion partículas
export const createParticleEffect = (e) => {
    const particle = document.createElement('span');
    particle.classList.add('particle-effect');
    
    particle.style.top = (e.pageY - 15) + 'px';
    particle.style.left = (e.pageX - 5) + 'px';
    
    particle.innerHTML = Math.random() > 0.5 ? '🤍' : '✨​';
    
    const randomX = (Math.random() - 0.5) * 50;
    particle.style.setProperty('--random-x', randomX + 'px');

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
};