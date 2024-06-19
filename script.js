const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

// general settings
let gamePlaying = false;
const gravity = .5;
const speed = 6.2;
const size = [51, 36];
const cTenth = (canvas.width / 10);

let index = 0,
    bestScore = 0, 
    flight = 0, 
    flyHeight, 
    currentScore, 
    pipes;

// pipe settings
const pipeWidth = 78;
const pipeGap = 270;
const pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const setup = () => {
  currentScore = 0;
  flight = 0;

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  // setup first 3 pipes
  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
}

const render = () => {
  // make the pipe and bird moving 
  index++;

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background first part 
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
  // background second part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

  // pipe display
  if (gamePlaying){
    pipes.map(pipe => {
      // pipe moving
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

      // give 1 point & create new pipe
      if(pipe[0] <= -pipeWidth){
        currentScore++;
        // check if it's the best score
        bestScore = Math.max(bestScore, currentScore);
        localStorage.setItem('bestScore', bestScore);
        console.log('La mejor puntuacion anterior fue ', localStorage.getItem('bestScore'));

        // remove & create new pipe
        pipes = [...pipes.slice(1), [pipes[pipes.length-1][0] + pipeGap + pipeWidth, pipeLoc()]];
        console.log(pipes);

        // otro localStorage
        localStorage.setItem('currentScore', currentScore);
        console.log('La cantidad de caños que pasaste antes fue ', localStorage.getItem('currentScore'));
        const nombreusuario = localStorage.getItem("username");
        const bestScoree = localStorage.getItem("bestScore");

        const datos = {
          game: 'Flappy Bird',
          event: 'bestScore',
          player : nombreusuario,
          value: parseInt(bestScoree)
        }
        // Convertir datos a JSON si es necesario
        var datosJSON = JSON.stringify(datos);
        // ws.send(datosJSON);
      }

      // if hit the pipe, end
      if ([
        pipe[0] <= cTenth + size[0], 
        pipe[0] + pipeWidth >= cTenth, 
        pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]
      ].every(elem => elem)) {
        gamePlaying = false;
        setup();
        vibrateDevice();
      }
    })
  }
  // draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);
    flyHeight = (canvas.height / 2) - (size[1] / 2);
    // text accueil
    ctx.fillText(`Best score : ${bestScore}`, 85, 245);
    ctx.fillText('Tilt to play', 90, 535);
    ctx.font = "bold 30px courier";
  }

  document.getElementById('bestScore').innerHTML = `Best : ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `Current : ${currentScore}`;

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
}

// launch setup
setup();
img.onload = render;

// start game on tilt
window.addEventListener('deviceorientation', (event) => {
  if (!gamePlaying) {
    gamePlaying = true;
  }
});

// Function to save the username
function save(){
  const content = document.getElementById("username").value;
  localStorage.setItem("username", content);
  console.log("Guardado su nombre de usuario");
}

const nombreslogueados = localStorage.getItem("username");

// Conectar al WebSocket
var ws = new WebSocket('wss://gamehubmanager.azurewebsites.net/ws');

// Manejar mensajes recibidos del servidor WebSocket
ws.onmessage = function(event) {
    console.log('Mensaje recibido del servidor:', event.data);
    const datos = JSON.parse(event.data);
    console.log(datos);
};

// Manejar errores
ws.onerror = function(event) {
    console.error('Error en la conexión WebSocket:', event);
};

// Manejar el cierre de la conexión
ws.onclose = function(event) {
    console.log('Conexión WebSocket cerrada:', event);
};

// Gyroscope control
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (event) => {
    const { beta } = event; // beta represents the front-to-back tilt in degrees
    if (gamePlaying) {
      // Use the gyroscope to control flight
      flight = (beta - 90) * -0.1; // Adjust sensitivity as needed
    }
  });
} else {
  console.log('DeviceOrientationEvent is not supported');
}

// Function to vibrate the device
function vibrateDevice() {
  if ("vibrate" in navigator) {
    navigator.vibrate(200); // Vibrate for 200 milliseconds
  } else {
    console.log("Vibration API is not supported in this browser.");
  }
}