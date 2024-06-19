const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

// General settings
let gamePlaying = false;
const gravity = 0.5;
const speed = 6.2;
const size = [51, 36];
const jump = -11.5;
const cTenth = canvas.width / 10;

let index = 0,
    bestScore = localStorage.getItem('bestScore') || 0, 
    flight = jump, 
    flyHeight = (canvas.height / 2) - (size[1] / 2), 
    currentScore = 0, 
    pipes = [];

// Pipe settings
const pipeWidth = 78;
const pipeGap = 270;
const pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const setup = () => {
  currentScore = 0;
  flight = jump;

  // Set initial flyHeight (middle of screen - size of the bird)
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  // Setup first 3 pipes
  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
}

const render = () => {
  // Make the pipe and bird moving 
  index++;

  // Background first part 
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
  // Background second part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

  // Pipe display
  pipes.forEach(pipe => {
    // Pipe moving
    pipe[0] -= speed;

    // Top pipe
    ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
    // Bottom pipe
    ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

    // Give 1 point & create new pipe
    if (pipe[0] <= -pipeWidth) {
      currentScore++;
      bestScore = Math.max(bestScore, currentScore);
      localStorage.setItem('bestScore', bestScore);
      pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
    }

    // If hit the pipe, end
    if ([pipe[0] <= cTenth + size[0], pipe[0] + pipeWidth >= cTenth, pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]].every(elem => elem)) {
      gamePlaying = false;
      setup();
      vibrateDevice();
    }
  });

  // Draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);
    flyHeight = (canvas.height / 2) - (size[1] / 2);
    // Text accueil
    ctx.fillText(`Best score : ${bestScore}`, 85, 245);
    ctx.fillText('Tilt to play', 90, 535);
    ctx.font = "bold 30px courier";
  }

  document.getElementById('bestScore').textContent = `Best : ${bestScore}`;
  document.getElementById('currentScore').textContent = `Current : ${currentScore}`;

  // Tell the browser to perform anim
  window.requestAnimationFrame(render);
}

// Launch setup
setup();
img.onload = render;

// Request permission for iOS 13+ devices
function requestSensorPermission() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
  } else {
    // Handle regular non iOS 13+ devices
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

// Gyroscope control
let lastBeta = null;
function handleOrientation(event) {
  const { beta } = event; // beta represents the front-to-back tilt in degrees
  if (!gamePlaying) return;
  
  if (lastBeta !== null) {
    const delta = beta - lastBeta;
    if (delta > 15) { // Adjust the sensitivity threshold as needed
      flight = jump;
    }
  }
  lastBeta = beta;
}

// Function to vibrate the device
function vibrateDevice() {
  if ("vibrate" in navigator) {
    navigator.vibrate(200); // Vibrate for 200 milliseconds
  } else {
    console.log("Vibration API is not supported in this browser.");
  }
}

function save() {
  const content = document.getElementById("username").value;
  localStorage.setItem("username", content);
  console.log("Guardado su nombre de usuario");
}