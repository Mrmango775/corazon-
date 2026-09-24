const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const floatParticles = [];
const burstParticles = [];
const FLOAT_COUNT = 140;

const BLUE_SHADES = [
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#2563eb",
    "#bfdbfe",
    "#1d4ed8"
];

class Particle {
    constructor(x, y, type) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.type = type;
        this.color = BLUE_SHADES[Math.floor(Math.random() * BLUE_SHADES.length)];
        
        if (type === "float") {
            this.size = Math.random() * 2 + 1;
            this.speedY = -Math.random() * 1 - 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.life = Math.random();
            this.maxLife = 100;
        } else {
            // Forma del corazón matemático para el estallido
            const t = Math.random() * Math.PI * 2;
            this.x = x;
            this.y = y;
            
            // Ecuación paramétrica del corazón
            const heartX = 16 * Math.pow(Math.sin(t), 3);
            const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            const scale = Math.random() * 12 + 8;
            this.destX = x + heartX * (scale / 16);
            this.destY = y + heartY * (scale / 16);
            
            const angle = Math.atan2(this.destY - y, this.destX - x);
            const speed = Math.random() * 6 + 2;
            
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            
            this.size = Math.random() * 2.5 + 1;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }
    }

    update() {
        if (this.type === "float") {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < 0) this.y = canvas.height;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedX *= 0.95;
            this.speedY *= 0.95;
            this.life -= this.decay;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Inicializar partículas flotantes
for (let i = 0; i < FLOAT_COUNT; i++) {
    floatParticles.push(new Particle(null, null, "float"));
}

function spawnHeartBurst(x, y) {
    const count = 140;
    for (let i = 0; i < count; i++) {
        burstParticles.push(new Particle(x, y, "burst"));
    }
}

window.addEventListener('click', (event) => {
    spawnHeartBurst(event.clientX, event.clientY);
});

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    floatParticles.forEach(p => {
        p.update();
        p.draw();
    });

    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];
        p.update();
        p.draw();
        if (p.life <= 0) {
            burstParticles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

animate();