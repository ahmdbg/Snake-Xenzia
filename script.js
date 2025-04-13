const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const levelSelect = document.getElementById('levelSelect');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// Add after audio constants
eatSound.volume = 0.5;  // Set volume to 50%
gameOverSound.volume = 0.7;  // Set volume to 70%

// Level configurations
const levelSettings = {
    easy: {
        speed: 4,
        scoreMultiplier: 1,
        color: '#2ecc71'
    },
    medium: {
        speed: 8,
        scoreMultiplier: 1.5,
        color: '#3498db'
    },
    hard: {
        speed: 16,
        scoreMultiplier: 2,
        color: '#e67e22'
    },
    expert: {
        speed: 32,
        scoreMultiplier: 2.5,
        color: '#e74c3c'
    }
};

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 },
];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};
let dx = 0;
let dy = 0;
let score = 0;
let speed = 10;
let gameLoop;
let isGameRunning = false;
let currentLevel = 'easy';
let scoreMultiplier = 1;

// Draw initial game board
function drawInitialBoard() {
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Press Start to Play', canvas.width/4, canvas.height/2);
}

document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

function startGame() {
    // Get level settings
    const level = levelSettings[levelSelect.value];
    currentLevel = levelSelect.value;
    speed = level.speed;
    scoreMultiplier = level.scoreMultiplier;
    
    // Reset game state
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    isGameRunning = true;
    generateFood();
    
    // Clear any existing game loop
    if (gameLoop) clearInterval(gameLoop);
    
    // Start new game loop
    gameLoop = setInterval(drawGame, 1000/speed);
    
    // Hide controls
    levelSelect.style.display = 'none';
    startButton.style.display = 'none';
}

function drawGame() {
    if (dx !== 0 || dy !== 0) {
        // Move snake
        let newHead = {
            x: snake[0].x + dx,
            y: snake[0].y + dy
        };

        // Wrap around logic
        if (newHead.x < 0) {
            newHead.x = tileCount - 1;
        } else if (newHead.x >= tileCount) {
            newHead.x = 0;
        }
        
        if (newHead.y < 0) {
            newHead.y = tileCount - 1;
        } else if (newHead.y >= tileCount) {
            newHead.y = 0;
        }

        // Check self collision
        for (let i = 0; i < snake.length; i++) {
            if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(newHead);

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
            score += 10 * scoreMultiplier;
            eatSound.play();  // Play eating sound
            generateFood();
        } else {
            snake.pop();
        }
    }

    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake with gradient and rounded corners
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 
            ? '#2ecc71' // Head color
            : `hsl(145, ${60 + (index * 2)}%, 45%)`; // Body gradient
        
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 5);
        ctx.fill();
    });

    // Draw food with glow effect
    ctx.fillStyle = '#e74c3c';
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw score with shadow
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Level: ${currentLevel.toUpperCase()}`, 10, 30);
    ctx.fillText(`Score: ${Math.floor(score)}`, 10, 60);
    ctx.shadowBlur = 0;
    
    // Instructions text
    if (dx === 0 && dy === 0 && isGameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Use Arrow Keys to Start Moving', canvas.width/2, canvas.height - 20);
        ctx.textAlign = 'left';
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // Make sure food doesn't appear on snake
    snake.forEach(segment => {
        if (food.x === segment.x && food.y === segment.y) {
            generateFood();
        }
    });
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    gameOverSound.play();  // Play game over sound

    // Add game over overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game Over text with glow
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 20);

    // Score and level text
    ctx.shadowBlur = 5;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Level: ${currentLevel.toUpperCase()}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText(`Final Score: ${Math.floor(score)}`, canvas.width/2, canvas.height/2 + 50);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    
    // Show controls again
    levelSelect.style.display = 'block';
    startButton.style.display = 'block';
}

// Initial setup
drawInitialBoard();
startButton.addEventListener('click', startGame);
