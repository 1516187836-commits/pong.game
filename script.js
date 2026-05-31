const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');
const resetBtn = document.getElementById('resetBtn');

// Game variables
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;
const COMPUTER_SPEED = 4;

let playerScore = 0;
let computerScore = 0;
let gameRunning = true;

// Paddle objects
const player = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const computer = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: BALL_SPEED,
    vy: BALL_SPEED,
    radius: BALL_SIZE
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    player.y = Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, canvas.height - PADDLE_HEIGHT));
});

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    const netWidth = 2;
    const netGap = 15;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = netWidth;
    ctx.setLineDash([netGap, netGap]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Draw net
    drawNet();

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff00');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff0000');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');
}

// Update functions
function updatePlayer() {
    // Arrow keys control
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - PADDLE_SPEED);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(canvas.height - PADDLE_HEIGHT, player.y + PADDLE_SPEED);
    }
}

function updateComputer() {
    // Simple AI: follow the ball
    const computerCenter = computer.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    const difficulty = 0.7; // Reduce to make AI weaker (0-1)

    if (ballCenter < computerCenter - 35) {
        computer.y = Math.max(0, computer.y - COMPUTER_SPEED * difficulty);
    } else if (ballCenter > computerCenter + 35) {
        computer.y = Math.min(canvas.height - PADDLE_HEIGHT, computer.y + COMPUTER_SPEED * difficulty);
    }
}

function updateBall() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.vy = -ball.vy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height &&
        ball.vx < 0
    ) {
        ball.vx = -ball.vx;
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.vy += hitPos * 3;
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height &&
        ball.vx > 0
    ) {
        ball.vx = -ball.vx;
        ball.x = computer.x - ball.radius;

        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.vy += hitPos * 3;
    }

    // Ball out of bounds (left side - computer scores)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        computerScoreElement.textContent = computerScore;
        resetBall();
    }

    // Ball out of bounds (right side - player scores)
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreElement.textContent = playerScore;
        resetBall();
    }

    // Cap ball speed to prevent it from getting too fast
    const maxSpeed = BALL_SPEED * 1.5;
    if (Math.abs(ball.vx) > maxSpeed) {
        ball.vx = (ball.vx / Math.abs(ball.vx)) * maxSpeed;
    }
    if (Math.abs(ball.vy) > maxSpeed) {
        ball.vy = (ball.vy / Math.abs(ball.vy)) * maxSpeed;
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() - 0.5);
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
    resetBall();
}

function update() {
    if (gameRunning) {
        updatePlayer();
        updateComputer();
        updateBall();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
resetBtn.addEventListener('click', resetGame);

// Start the game
gameLoop();