// Selecciona el elemento <canvas> del HTML
const canvas = document.getElementById("canvas");

// Obtiene el contexto 2D del canvas para poder dibujar
let ctx = canvas.getContext("2d");

// Define las dimensiones del canvas (600x600 píxeles)
const window_height = 600;
const window_width = 600;
canvas.height = window_height;
canvas.width = window_width;

// Establece un color de fondo amarillo claro para el canvas
canvas.style.background = "#ff8";

/**
 * Clase que representa un círculo en movimiento dentro del canvas.
 */
class Circle {
  /**
   * Constructor de la clase Circle
   * @param {number} x - Posición inicial en el eje X
   * @param {number} y - Posición inicial en el eje Y
   * @param {number} radius - Radio del círculo
   * @param {string} color - Color del círculo
   * @param {string} text - Texto dentro del círculo
   * @param {number} speed - Velocidad del círculo
   */
  constructor(x, y, radius, color, text, speed) {
    this.posX = x; // Guarda la posición X inicial
    this.posY = y; // Guarda la posición Y inicial
    this.radius = radius; // Guarda el radio del círculo
    this.originalColor = color; // Guarda el color original del círculo
    this.currentColor = color; // Se usará para cambiar de color en colisión
    this.text = text; // Texto dentro del círculo
    this.speed = speed; // Velocidad del movimiento

    // Dirección inicial aleatoria en X e Y
    this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.dy = (Math.random() > 0.5 ? 1 : -1) * this.speed;
  }

  /**
   * Dibuja el círculo en el canvas.
   * @param {CanvasRenderingContext2D} context - El contexto 2D del canvas
   */
  draw(context) {
    context.beginPath(); // Inicia el dibujo

    // Rellena el círculo con el color actual
    context.fillStyle = this.currentColor;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.fill();

    // Dibuja el borde del círculo en color negro
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    // Dibuja el texto dentro del círculo
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillText(this.text, this.posX, this.posY);
  }

  /**
   * Actualiza la posición del círculo y maneja colisiones con los bordes.
   */
  update() {
    // Verifica colisiones con los bordes derecho e izquierdo
    if (
      this.posX + this.radius >= window_width ||
      this.posX - this.radius <= 0
    ) {
      this.dx = -this.dx; // Invierte la dirección en X
    }

    // Verifica colisiones con los bordes superior e inferior
    if (
      this.posY + this.radius >= window_height ||
      this.posY - this.radius <= 0
    ) {
      this.dy = -this.dy; // Invierte la dirección en Y
    }

    // Actualiza la posición del círculo
    this.posX += this.dx;
    this.posY += this.dy;
  }

  /**
   * Verifica si hay colisión con otro círculo y los hace rebotar correctamente.
   * @param {Circle} other - Otro círculo con el que puede colisionar
   */
  checkCollision(other) {
    let dx = other.posX - this.posX; // Diferencia de posición en X
    let dy = other.posY - this.posY; // Diferencia de posición en Y
    let distance = Math.sqrt(dx * dx + dy * dy); // Distancia entre los círculos

    // Si la distancia entre los círculos es menor que la suma de sus radios, hay colisión
    if (distance < this.radius + other.radius) {
      let angle = Math.atan2(dy, dx); // Ángulo de colisión

      // Calculamos las velocidades después del choque usando la conservación del momentum
      let speed1 = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      let speed2 = Math.sqrt(other.dx * other.dx + other.dy * other.dy);

      let direction1 = Math.atan2(this.dy, this.dx);
      let direction2 = Math.atan2(other.dy, other.dx);

      this.dx = speed2 * Math.cos(direction2);
      this.dy = speed2 * Math.sin(direction2);
      other.dx = speed1 * Math.cos(direction1);
      other.dy = speed1 * Math.sin(direction1);

      // **Corrección de posición** para evitar que los círculos se queden pegados
      let overlap = (this.radius + other.radius - distance) / 2;
      this.posX -= overlap * Math.cos(angle);
      this.posY -= overlap * Math.sin(angle);
      other.posX += overlap * Math.cos(angle);
      other.posY += overlap * Math.sin(angle);

      // **Cambio de color en la colisión**
      this.currentColor = "red";
      other.currentColor = "red";

      // **Después de 500ms, los círculos vuelven a su color original**
      setTimeout(() => {
        this.currentColor = this.originalColor;
        other.currentColor = other.originalColor;
      }, 500);

      // **Reproduce el sonido cuando ocurra la colisión**
      // Crea una nueva instancia de Audio para cada colisión
      const collisionSound = new Audio("./assets/momo.mp3");
      collisionSound.play(); // Reproduce el sonido de colisión en cada colisión
    }
  }
}

// **Generación de múltiples círculos**
let circles = [];

/**
 * Genera una posición aleatoria dentro del área del canvas sin tocar los bordes.
 * @param {number} radius - Radio del círculo
 * @param {number} limit - Límite del área (ancho o alto del canvas)
 * @returns {number} Posición aleatoria dentro del límite sin tocar los bordes
 */
function getRandomPosition(radius, limit) {
  return Math.random() * (limit - 2 * radius) + radius;
}

// Crea N círculos con propiedades aleatorias
for (let i = 0; i <5; i++) {
  let radius = Math.floor(Math.random() * 40 + 20); // Radio entre 20 y 60
  let x = getRandomPosition(radius, window_width);
  let y = getRandomPosition(radius, window_height);
  let speed = Math.random() * 2 + 1; // Velocidad entre 1 y 3
  let color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Color aleatorio en HSL
  let text = (i + 1).toString(); // Números del 1 al N

  let newCircle = new Circle(x, y, radius, color, text, speed);
  circles.push(newCircle);
}

/**
 * Función que actualiza el canvas y maneja las colisiones.
 */
function updateCircles() {
  requestAnimationFrame(updateCircles); // Llama a la función en el siguiente frame
  ctx.clearRect(0, 0, window_width, window_height); // Borra el canvas antes de redibujar

  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];
    circle.update(); // Mueve el círculo
    circle.draw(ctx); // Dibuja el círculo en su nueva posición

    // Compara con los otros círculos para detectar colisiones
    for (let j = i + 1; j < circles.length; j++) {
      circle.checkCollision(circles[j]);
    }
  }
}

// Inicia la animación
updateCircles();
