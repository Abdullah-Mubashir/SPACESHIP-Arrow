class SpaceShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.highScoreDisplay.textContent = this.highScore;
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Player properties
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 40,
            height: 40,
            speed: 5
        };
        
        // Game state
        this.bullets = [];
        this.enemies = [];
        this.keys = {};
        this.enemySpawnRate = 60; // Frames between enemy spawns
        this.frameCount = 0;
        this.baseEnemySpeed = 2;
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }
    
    getEnemySpeed() {
        // Increase speed based on score
        const speedIncrease = Math.floor(this.score / 50) * 1.0;
        return this.baseEnemySpeed + speedIncrease;
    }
    
    spawnEnemy() {
        const enemy = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: this.getEnemySpeed()
        };
        this.enemies.push(enemy);
    }
    
    shoot() {
        const bullet = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7
        };
        this.bullets.push(bullet);
    }
    
    update() {
        // Player movement
        if (this.keys['ArrowLeft']) this.player.x = Math.max(0, this.player.x - this.player.speed);
        if (this.keys['ArrowRight']) this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        if (this.keys['Space'] && this.frameCount % 10 === 0) this.shoot();
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
        
        // Spawn and update enemies
        if (this.frameCount % this.enemySpawnRate === 0) {
            this.spawnEnemy();
        }
        
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // Check for collision with bullets
            for (let bullet of this.bullets) {
                if (this.checkCollision(bullet, enemy)) {
                    this.score += 10;
                    this.scoreDisplay.textContent = this.score;
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        this.highScoreDisplay.textContent = this.highScore;
                        localStorage.setItem('highScore', this.highScore);
                    }
                    return false;
                }
            }
            
            // Check for collision with player
            if (this.checkCollision(enemy, this.player)) {
                this.gameOver();
                return false;
            }
            
            return enemy.y < this.canvas.height;
        });
        
        this.frameCount++;
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player (triangle shape)
        this.ctx.fillStyle = '#0ff';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw bullets
        this.ctx.fillStyle = '#0ff';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw enemies
        this.ctx.fillStyle = '#f00';
        for (let enemy of this.enemies) {
            this.ctx.beginPath();
            this.ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            this.ctx.lineTo(enemy.x, enemy.y);
            this.ctx.lineTo(enemy.x + enemy.width, enemy.y);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    gameOver() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            alert(`New High Score: ${this.highScore}!\nGame Over!`);
        } else {
            alert(`Game Over! Score: ${this.score}\nHigh Score: ${this.highScore}`);
        }
        location.reload();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpaceShooter();
});
