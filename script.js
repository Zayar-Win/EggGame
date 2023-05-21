window.addEventListener("load", function () {
  const canvas =
    document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1280;
  canvas.height = 720;

  ctx.lineWidth = 3;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.font = "40px Helvetica";
  ctx.textAlign = "center";

  class Egg {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 40;
      this.margin = this.collisionRadius * 2;
      this.collisionX =
        this.margin +
        Math.random() *
          (this.game.width - this.margin * 2);
      this.collisionY =
        this.game.topMargin +
        Math.random() *
          (this.game.height -
            this.game.topMargin -
            this.margin);
      this.spriteWidth = 110;
      this.spriteHeight = 135;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.image = document.getElementById("egg");
      this.spriteX;
      this.spriteY;
      this.hatchTimer = 0;
      this.hatchInterval = 10000;
      this.markForDeletion = false;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.spriteX,
        this.spriteY
      );
      if (this.game.debugMode) {
        context.beginPath();
        context.save();
        context.globalAlpha = 0.5;
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.fill();
        context.restore();
        context.stroke();
        const hatchTimeInSecond = (
          this.hatchTimer * 0.001
        ).toFixed(0);
        context.fillText(
          hatchTimeInSecond,
          this.collisionX,
          this.collisionY -
            this.collisionRadius * 2.5
        );
      }
    }

    update(deltaTime) {
      this.spriteX =
        this.collisionX - this.width * 0.5;
      this.spriteY =
        this.collisionY - this.height * 0.5 - 30;
      let collisionObjects = [
        this.game.player,
        ...this.game.obstacle,
        ...this.game.enemies,
      ];
      collisionObjects.forEach((object) => {
        let [
          isCollision,
          distance,
          sumOfRadii,
          dx,
          dy,
        ] = this.game.checkCollision(
          this,
          object
        );
        if (isCollision) {
          let unit_x = dx / distance;
          let unit_y = dy / distance;
          this.collisionX =
            object.collisionX +
            (sumOfRadii + 1) * unit_x;
          this.collisionY =
            object.collisionY +
            (sumOfRadii + 1) * unit_y;
        }
      });

      if (
        this.collisionX < this.collisionRadius
      ) {
        this.collisionX = this.collisionRadius;
      } else if (
        this.collisionX >
        this.game.width - this.collisionRadius
      ) {
        this.collisionX =
          this.game.width - this.collisionRadius;
      }

      if (
        this.collisionY >
        this.game.height - this.collisionRadius
      ) {
        this.collisionY =
          this.game.height -
          this.collisionRadius * 4;
      }

      if (this.hatchTimer > this.hatchInterval) {
        this.markForDeletion = true;
        this.game.removeGameObject();
        this.game.larvas.push(
          new Larva(
            this.game,
            this.collisionX,
            this.collisionY
          )
        );
      }

      this.hatchTimer += deltaTime;
    }
  }

  class Larva {
    constructor(game, x, y) {
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.collisionRadius = 30;
      this.spriteWidth = 150;
      this.spriteHeight = 150;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.speedY = 2;
      this.markForDeletion = false;
      this.image =
        document.getElementById("larva");
    }

    draw(context) {
      context.drawImage(
        this.image,
        0,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debugMode) {
        context.beginPath();
        context.save();
        context.globalAlpha = 0.5;
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.fill();
        context.restore();
        context.stroke();
      }
    }

    update() {
      this.spriteX =
        this.collisionX - this.width * 0.5;
      this.spriteY =
        this.collisionY - this.height * 0.5 - 50;
      this.collisionY -= this.speedY;

      //larva safe
      if (this.collisionY < this.game.topMargin) {
        console.log("hello");
        this.markForDeletion = true;
        this.game.removeGameObject();
        for (let i = 0; i < 3; i++) {
          this.game.particles.push(
            new FireFly(
              this.game,
              this.collisionX,
              this.collisionY,
              "Yellow"
            )
          );
        }
        this.game.score++;
      }

      //touch with enemy

      this.game.enemies.forEach((enemy) => {
        if (
          this.game.checkCollision(this, enemy)[0]
        ) {
          this.markForDeletion = true;
          this.game.removeGameObject();
          this.game.lostScore++;
          for (let i = 0; i < 3; i++) {
            this.game.particles.push(
              new Spark(
                this.game,
                this.collisionX,
                this.collisionY,
                "blue"
              )
            );
            console.log(this.game.particles);
          }
        }
      });
    }
  }

  class Particle {
    constructor(game, x, y, color) {
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.color = color;
      this.collisionRadius = Math.random() * 5;
      this.speedX = Math.random() * 2 - 2;
      this.speedY = Math.random() * 2;
      this.angle = 0;
      this.va = Math.random() * 0.01 + 0.05;
      this.markForDeletion = false;
    }

    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(
        this.collisionX,
        this.collisionY,
        this.collisionRadius,
        0,
        Math.PI * 2
      );
      context.fill();
      context.stroke();
      context.restore();
    }
  }

  class FireFly extends Particle {
    update() {
      this.angle += this.va;
      this.collisionX +=
        Math.cos(this.angle) * this.speedX;
      this.collisionY -= this.speedY;
      if (
        this.collisionY < this.collisionRadius
      ) {
        this.markForDeletion = true;
        this.game.removeGameObject();
      }
    }
  }

  class Spark extends Particle {
    update() {
      this.angle += this.va * 0.05;
      this.collisionX +=
        Math.cos(this.angle) * this.speedX;
      this.collisionY -=
        Math.sin(this.angle) * this.speedY;
      if (this.collisionRadius > 0.1)
        this.collisionRadius -= 0.01;
      if (this.collisionRadius < 0.2) {
        this.markForDeletion = true;
        this.game.removeGameObject();
      }
    }
  }

  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX =
        Math.random() * this.game.width;
      this.collisionY =
        Math.random() * this.game.height;
      this.collisionRadius = 50;
      this.image =
        document.getElementById("obstacles");
      this.spriteWidth = 250;
      this.spriteHeight = 250;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX =
        this.collisionX - this.width * 0.5;
      this.spriteY =
        this.collisionY - this.height * 0.5 - 80;
      this.frameX = Math.floor(Math.random() * 4);
      this.frameY = Math.floor(Math.random() * 3);
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debugMode) {
        context.beginPath();
        context.save();
        context.globalAlpha = 0.5;
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.fill();
        context.restore();
        context.stroke();
      }
    }

    update() {}
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.collisionX =
        this.game.width +
        Math.random() * this.game.width * 0.5;
      this.collisionY =
        this.game.topMargin +
        Math.random() * this.game.height -
        this.game.topMargin -
        this.collisionRadius;
      this.collisionRadius = 30;
      this.spriteWidth = 140;
      this.spriteHeight = 260;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.image =
        document.getElementById("enemy");
      this.spriteX;
      this.spriteY;
      this.speedX = Math.random(4) * 3 + 0.5;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.spriteX,
        this.spriteY
      );
      if (this.game.debugMode) {
        context.beginPath();
        context.save();
        context.globalAlpha = 0.5;
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.fill();
        context.restore();
        context.stroke();
      }
    }

    update() {
      this.spriteX =
        this.collisionX - this.width * 0.5;
      this.spriteY =
        this.collisionY - this.height * 0.5 - 60;
      this.collisionX -= this.speedX;

      if (this.spriteX + this.width < 0) {
        this.collisionX =
          this.game.width +
          Math.random() * this.game.width * 0.5;
        this.collisionY =
          this.game.topMargin +
          Math.random() * this.game.height;
      }

      const collisionObjects = [
        this.game.player,
        ...this.game.obstacle,
      ];
      collisionObjects.forEach((object) => {
        let [
          isCollision,
          distance,
          sumOfRadii,
          dx,
          dy,
        ] = this.game.checkCollision(
          this,
          object
        );
        if (isCollision) {
          let unit_x = dx / distance;
          let unit_y = dy / distance;
          this.collisionX =
            object.collisionX +
            (sumOfRadii + 1) * unit_x;
          this.collisionY =
            object.collisionY +
            (sumOfRadii + 1) * unit_y;
        }
      });
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5;
      this.collisionRadius = 30;
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.distance = 0;
      this.speedModifier = 5;
      this.image =
        document.getElementById("bull");
      this.spriteWidth = 255;
      this.spriteHeight = 255;
      this.spriteX;
      this.spriteY;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.frameX = 0;
      this.frameY = 0;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debugMode) {
        context.beginPath();
        context.save();
        context.globalAlpha = 0.5;
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.fill();
        context.restore();
        context.stroke();
      }
      context.beginPath();
      context.moveTo(
        this.collisionX,
        this.collisionY
      );
      context.lineTo(
        this.game.mouse.x,
        this.game.mouse.y
      );
      context.stroke();
    }

    update() {
      this.dx =
        this.game.mouse.x - this.collisionX;
      this.dy =
        this.game.mouse.y - this.collisionY;
      const angle = Math.atan2(this.dy, this.dx);
      if (angle < -1.17) this.frameY = 0;
      else if (angle < -0.39) this.frameY = 1;
      else if (angle < 0.39) this.frameY = 2;
      else if (angle < 1.17) this.frameY = 3;
      else if (angle < 1.96) this.frameY = 4;
      else if (angle < 2.74) this.frameY = 5;
      else if (angle < -2.74 || angle > 2.74)
        this.frameY = 6;
      else if (angle < -1.96) this.frameY = 7;
      this.distance = Math.sqrt(
        this.dx * this.dx + this.dy * this.dy
      );
      if (this.distance > this.speedModifier) {
        this.speedX =
          this.dx / this.distance || 0;
        this.speedY =
          this.dy / this.distance || 0;
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }

      this.spriteX =
        this.collisionX - this.width * 0.5;
      this.spriteY =
        this.collisionY - this.height * 0.5 - 100;

      this.collisionX +=
        this.speedX * this.speedModifier;
      this.collisionY +=
        this.speedY * this.speedModifier;

      //horizontal boundary
      if (
        this.collisionX < this.collisionRadius
      ) {
        this.collisionX = this.collisionRadius;
      } else if (
        this.collisionX >
        this.game.width - this.collisionRadius
      ) {
        this.collisionX =
          this.game.width - this.collisionRadius;
      }
      //vertical boundary

      if (
        this.collisionY <
        this.game.topMargin + this.collisionRadius
      ) {
        this.collisionY =
          this.game.topMargin +
          this.collisionRadius;
      } else if (
        this.collisionY >
        this.game.height - this.collisionRadius
      ) {
        this.collisionY =
          this.game.height - this.collisionRadius;
      }

      //check for collision
      this.game.obstacle.forEach((obstacle) => {
        let [
          isCollision,
          distance,
          sumOfRadii,
          dx,
          dy,
        ] = this.game.checkCollision(
          this,
          obstacle
        );

        if (isCollision) {
          let unit_x = dx / distance;
          let unit_y = dy / distance;
          this.collisionX =
            obstacle.collisionX +
            (sumOfRadii + 1) * unit_x;
          this.collisionY =
            obstacle.collisionY +
            (sumOfRadii + 1) * unit_y;
        }
      });
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.player = new Player(this);
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };
      this.gameObjects = [];
      this.numbOfObstacles = 5;
      this.numbOfMaxEggs = 10;
      this.obstacle = [];
      this.eggs = [];
      this.enemies = [];
      this.larvas = [];
      this.particles = [];
      this.obstacleBuffer = 150;
      this.topMargin = 260;
      this.debugMode = false;
      this.eggTimer = 0;
      this.eggInterval = 500;
      this.timeStamp = 0;
      this.fps = 70;
      this.score = 0;
      this.gameScore = 50;
      this.lostScore = 0;
      this.enemyCount = 10;
      this.interval = 1000 / this.fps;
      canvas.addEventListener(
        "mousedown",
        (e) => {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
          this.mouse.pressed = true;
        }
      );

      canvas.addEventListener("mouseup", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
      });

      canvas.addEventListener(
        "mousemove",
        (e) => {
          if (this.mouse.pressed) {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
          }
        }
      );
      window.addEventListener("keydown", (e) => {
        if (e.key === "d") {
          this.debugMode = !this.debugMode;
        }
      });
    }

    render(context, deltaTime) {
      if (this.timeStamp > this.interval) {
        ctx.clearRect(
          0,
          0,
          this.width,
          this.height
        );
        this.gameObjects = [
          this.player,
          ...this.eggs,
          ...this.obstacle,
          ...this.enemies,
          ...this.larvas,
          ...this.particles,
        ];
        this.gameObjects.sort((a, b) => {
          return a.collisionY - b.collisionY;
        });
        this.gameObjects.forEach((object) => {
          object.draw(context);
          object.update(deltaTime);
        });

        this.timeStamp = 0;
      }
      this.timeStamp += deltaTime;

      if (
        this.eggTimer > this.eggInterval &&
        this.eggs.length < this.numbOfMaxEggs
      ) {
        this.addEgg();
        this.eggTimer = 0;
      } else {
        this.eggTimer += deltaTime;
      }

      context.save();
      context.textAlign = "left";
      context.fillText(
        "Score " + this.score,
        100,
        100
      );
      context.restore();
    }

    addEgg() {
      this.eggs.push(new Egg(this));
    }

    addEnemy() {
      this.enemies.push(new Enemy(this));
    }

    removeGameObject() {
      this.eggs = this.eggs.filter(
        (egg) => !egg.markForDeletion
      );
      this.larvas = this.larvas.filter(
        (larva) => !larva.markForDeletion
      );
      this.particles = this.particles.filter(
        (particle) => !particle.markForDeletion
      );
    }

    checkCollision(a, b) {
      let dx = a.collisionX - b.collisionX;
      let dy = a.collisionY - b.collisionY;
      let distance = Math.hypot(dy, dx);
      let sumOfRadii =
        a.collisionRadius + b.collisionRadius;
      return [
        distance < sumOfRadii,
        distance,
        sumOfRadii,
        dx,
        dy,
      ];
    }

    init() {
      let attampt = 0;

      for (let i = 0; i < this.enemyCount; i++) {
        this.addEnemy();
      }

      while (
        this.obstacle.length <
          this.numbOfObstacles &&
        attampt < 500
      ) {
        let overlap = false;
        let testObstacle = new Obstacle(this);
        this.obstacle.forEach((obstacle) => {
          let dx =
            testObstacle.collisionX -
            obstacle.collisionX;
          let dy =
            testObstacle.collisionY -
            obstacle.collisionY;
          let distance = Math.hypot(dy, dx);
          let sumOfRadii =
            testObstacle.collisionRadius +
            obstacle.collisionRadius;
          if (
            distance <
            sumOfRadii + this.obstacleBuffer
          ) {
            overlap = true;
          }
          attampt++;
        });
        let margin =
          testObstacle.collisionRadius * 2;
        if (
          !overlap &&
          testObstacle.collisionX >
            testObstacle.width * 0.5 &&
          testObstacle.collisionX <
            this.width - testObstacle.width &&
          testObstacle.collisionY >
            this.topMargin + margin &&
          testObstacle.collisionY <
            this.height - margin
        ) {
          this.obstacle.push(testObstacle);
        }
      }
    }
  }

  const game = new Game(canvas);
  game.init();

  let lastTime = 0;
  function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }

  animate(0);
});
