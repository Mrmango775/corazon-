const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let words = [];
let heartTargets = [];
let formationIndex = 0;
let animationState = 'idle'; // idle, forming, formed, fading
let fadeTimer = 0;

class FloatingWord {
    constructor(text, x, y, targetX, targetY) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.alpha = 0;
        this.scale = 1;
        this.isAtTarget = false;
    }
    update() {
        // Movimiento suave hacia la posición final (easing)
        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        this.x += dx * 0.08;
        this.y += dy * 0.08;

        // Aparición gradual
        if (this.alpha < 1) this.alpha += 0.05;

        // Comprobar si está cerca del objetivo
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            this.isAtTarget = true;
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#00bfff'; // Color azul brillante
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 20px Arial';
        // Centramos el texto en sus coordenadas
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function getHeartPoints(centerX, centerY, numPoints) {
    heartTargets = [];
    // Ecuaciones paramétricas para la forma de un corazón
    // t va de 0 a 2*PI para completar el ciclo
    for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        const scale = 15; // Ajusta el tamaño del corazón
        heartTargets.push({
            x: centerX + hx * scale,
            y: centerY + hy * scale
        });
    }
    return heartTargets;
}

function animate() {
    // Fondo oscuro con estela suave para dar sensación de fluidez
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (animationState === 'forming') {
        // Añade una palabra nueva cada ciertos fotogramas
        if (words.length < heartTargets.length && words.length === formationIndex) {
            const clickX = words.length === 0 ? canvas.width / 2 : words[0].x;
            const clickY = words.length === 0 ? canvas.height / 2 : words[0].y;
            const target = heartTargets[formationIndex];
            
            // Empiezan desde el centro o desde la posición anterior para un efecto fluido
            let startX = words.length === 0 ? clickX : words[formationIndex-1].x;
            let startY = words.length === 0 ? clickY : words[formationIndex-1].y;

            words.push(new FloatingWord("te amo", startX, startY, target.x, target.y));
            formationIndex++;
        }

        // Comprobar si todos los elementos llegaron al objetivo
        let allArrived = true;
        words.forEach(word => word.update());
        if (words.length > 0 && words.length === heartTargets.length) {
            words.forEach(word => {
                if (!word.isAtTarget) allArrived = false;
            });
        } else {
            allArrived = false;
        }

        if (allArrived) {
            animationState = 'formed';
            fadeTimer = 0;
        }
    } else if (animationState === 'formed') {
        // Mantenerlo formado unos instantes
        fadeTimer++;
        if (fadeTimer > 80) {
            animationState = 'fading';
        }
    } else if (animationState === 'fading') {
        // Desvanecer todos los elementos a la vez
        let allFaded = true;
        words.forEach(word => {
            word.alpha -= 0.03;
            if (word.alpha <= 0) word.alpha = 0;
            if (word.alpha > 0) allFaded = false;
        });
        
        if (allFaded) {
            // Limpiar para el siguiente clic
            words = [];
            formationIndex = 0;
            animationState = 'idle';
        }
    }

    // Asegurar que las palabras en movimiento siempre se dibujen
    words.forEach(word => word.draw());

    requestAnimationFrame(animate);
}

window.addEventListener('click', (e) => {
    // Si ya hay una animación en curso, la reiniciamos desde el clic
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    getHeartPoints(clickX, clickY, 90); // 90 palabras para formar el corazón
    animationState = 'forming';
    words = [];
    formationIndex = 0;
});

// Iniciar el bucle de animación
animate();