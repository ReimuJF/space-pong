const DEFAULT_SPEED = 300;
const DEFAULT_COMPUTER_SHIP_SPEED = 250;

class SpaceGame {
    constructor() {
        this.game = new Phaser.Game(
            (window.innerWidth / 2 >= 480 ? Math.min(~~(window.innerWidth / 2), 1200) : 480),
            (window.innerHeight / 2 >= 600 ? Math.min(~~(window.innerHeight / 1.5), 900) : 600),
            Phaser.AUTO,
            "game",
            {
                preload: this.preload,
                create: this.create,
                update: this.update
            });
        this.score = 0;
        this.computerShipSpeed = DEFAULT_COMPUTER_SHIP_SPEED;
        this.ballSpeed = DEFAULT_SPEED;
        this.ballReleased = false;
    }

    preload = () => {
        this.game.load.image('Ship', './assets/bet.png');
        this.game.load.image('Ship2', './assets/bet2.png');
        this.game.load.image('ball', './assets/ball.png');
        this.game.load.image('background', './assets/starfield.jpg');
        this.game.load.image('star', './assets/star.png');
        this.game.load.image('logo', './assets/space.png');
        this.game.load.audio('bgm', './assets/audio/bgm.mp3');
        this.game.load.audio('sfx', './assets/audio/exp.wav');
        this.game.load.audio('win', './assets/audio/exp2.wav');
        this.game.load.audio('lose', './assets/audio/exp3.wav');
        this.game.load.spritesheet('kaboom', './assets/explode.png', 128, 128);
        this.game.load.spritesheet('kaboom2', './assets/explode2.png', 32, 32);
    }

    create = () => {
        this.music = this.game.add.audio('bgm');
        this.music.loop = true;
        this.music.play('', 0, 0.15, true);
        this.fxhit = this.game.add.audio('sfx');
        this.fxwin = this.game.add.audio('win');
        this.fxlose = this.game.add.audio('lose');
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.checkCollision.down = false;
        this.starfield = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.text = this.game.add.text(
            this.game.world.centerX,
            this.game.world.centerY - 30, '',
            { fill: '#efefef' });
        this.text.anchor.setTo(0.5);
        this.playerShip = this.createShip(this.game.world.centerX, this.game.height - 50, 'Ship');
        this.computerShip = this.createShip(this.game.world.centerX, 50, 'Ship2');
        this.textScore = this.game.add.text(12, 12, 'Score: ' + this.score, { fill: '#efefef' });
        this.ball = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ball');
        this.ball.anchor.setTo(0.5);
        this.game.physics.enable(this.ball, Phaser.Physics.ARCADE);
        this.ball.body.collideWorldBounds = true;
        this.ball.body.bounce.setTo(1);
        this.emitter = this.game.add.emitter(0, 0, 200);
        this.emitter.makeParticles('star');
        this.textH = this.game.add.text(
            this.game.world.centerX - 110,
            this.game.world.centerY + 10,
            'Controls:\
            \rArrows to move\
            \rShift+Arrows to boost\
            \rSpace to release ball\
            \rM to mute music\
            \rP to pause the game',
            { fill: '#efefef' }
        );
        this.explosion = this.createExplosions('kaboom');
        this.smallExplosion = this.createExplosions('kaboom2');
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.onDown.add(this.togglePause, this);
        this.logo = this.game.add.sprite(this.game.world.centerX - 225,
            this.game.world.centerY - 192,
            'logo');
        this.logo.fixedToCamera = true;
        this.startButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.ShiftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        this.muteButton = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
        this.pauseButton.onDown.add(this.togglePause, this);
        this.startButton.onDown.add(this.releaseBall, this);
        this.startButton.onDown.add(this.destroyLogo, this);
        this.startButton.onDown.add(this.revive, this);
        this.muteButton.onDown.add(this.toggleMute, this);
    }

    createShip(x, y, sprite) {
        let ship = this.game.add.sprite(x, y, sprite);
        ship.anchor.setTo(0.5);
        this.game.physics.enable(ship, Phaser.Physics.ARCADE);
        ship.body.collideWorldBounds = true;
        ship.body.bounce.setTo(1);
        ship.body.immovable = true;
        return ship;
    }

    createExplosions(sprite) {
        let group = this.game.add.group();
        for (let i = 0; i < 16; i++) {
            let explosion = group.create(0, 0, sprite, [0], false);
            explosion.anchor.setTo(0.5, 0.5);
            explosion.animations.add(sprite);
        }
        return group;
    }

    togglePause() {
        this.game.paused = !this.game.paused;
        if (this.game.paused) {
            this.textPause = this.game.add.text(
                this.game.world.centerX - 90,
                this.game.world.centerY - 20,
                'Game Paused',
                { fill: '#efefef' }
            );
        } else {
            this.textPause.destroy();
        }
    }

    destroyLogo() {
        this.logo.kill();
        this.textH.destroy();
    }

    toggleMute() {
        this.game.sound.mute = !this.game.sound.mute;
    }

    releaseBall() {
        if (!this.ballReleased) {
            this.ball.body.velocity.x = 0;
            this.ball.body.velocity.y = this.ballSpeed;
            this.ballReleased = true;
        }
    }

    update = () => {
        this.starfield.tilePosition.y += 2;
        this.playerShip.body.velocity.setTo(0, 0);
        this.handlePlayerMovement();
        this.handleComputerMovement();
        this.game.physics.arcade.collide(this.ball, this.playerShip, this.ballHitsShip, null, this);
        this.game.physics.arcade.collide(this.ball, this.computerShip, this.ballHitsShip, null, this);
        this.checkGoal();
    }

    handlePlayerMovement() {
        if (this.cursors.left.isDown) {
            this.playerShip.body.velocity.x = -600;
        } else if (this.cursors.right.isDown) {
            this.playerShip.body.velocity.x = 600;
        }
        if (this.ShiftButton.isDown && this.cursors.left.isDown) {
            this.playerShip.body.velocity.x = -1200;
        } else if (this.ShiftButton.isDown && this.cursors.right.isDown) {
            this.playerShip.body.velocity.x = 1200;
        }
        let playerShipHalfWidth = this.playerShip.width / 2;
        if (this.playerShip.x < playerShipHalfWidth) {
            this.playerShip.x = playerShipHalfWidth;
        } else if (this.playerShip.x > this.game.width - playerShipHalfWidth) {
            this.playerShip.x = this.game.width - playerShipHalfWidth;
        }
    }

    handleComputerMovement() {
        if (this.computerShip.x - this.ball.x < -15) {
            this.computerShip.body.velocity.x = this.computerShipSpeed;
        } else if (this.computerShip.x - this.ball.x > 15) {
            this.computerShip.body.velocity.x = -this.computerShipSpeed;
        } else {
            this.computerShip.body.velocity.x = 0;
        }
    }

    ballHitsShip = (ball, ship) => {
        this.drawExplosion(ship, "kaboom2");
        let diff = 0;
        if (this.ball.x < ship.x) {
            diff = ship.x - this.ball.x;
            ball.body.velocity.x = (-10 * diff);
        } else if (this.ball.x > ship.x) {
            diff = this.ball.x - ship.x;
            ball.body.velocity.x = (10 * diff);
        } else {
            ball.body.velocity.x = 2 + Math.random() * 8;
        }
        this.fxhit.play('', 0, 0.1);
    }

    drawExplosion(ship, animation) {
        try {
            const explosion = animation === 'kaboom' ? this.explosion.getFirstExists(false) : this.smallExplosion.getFirstExists(false);
            explosion.reset(ship.body.x + 70, ship.body.y + 35);
            explosion.play(animation, 30, false, true);
        } catch {
            console.error("there was an error");
            return;
        }
    }

    win() {
        this.computerShip.kill();
        this.drawExplosion(this.computerShip, 'kaboom');
        this.computerShipSpeed += 100;
        this.ballSpeed += 110;
        this.textScore.setText('Score: ' + ++this.score);
        this.showText('ENEMY SHIP ELIMINATED!', 1500);
        this.fxwin.play('', 0, 0.1);
        this.setBall();
    }

    lose() {
        this.playerShip.kill();
        this.drawExplosion(this.playerShip, 'kaboom');
        this.computerShipSpeed = DEFAULT_COMPUTER_SHIP_SPEED;
        this.score = 0;
        this.textScore.setText('Score: ' + this.score);
        this.showText('YOU ARE DEFEATED!', 1500);
        this.ballSpeed = DEFAULT_SPEED;
        this.fxlose.play('', 0, 0.1);
        this.setBall();
    }

    showText(txt, timeout) {
        this.text.setText(txt);
        setTimeout(() => {
            this.text.setText('');
        }, timeout);
    }

    checkGoal() {
        if (this.ball.y <= 25) {
            this.win();
        } else if (this.ball.y >= this.game.height - 35) {
            this.lose();
        }
    }

    revive() {
        this.computerShip.revive();
        this.playerShip.revive();
    }

    setBall() {
        if (this.ballReleased) {
            this.ball.x = this.game.world.centerX;
            this.ball.y = this.game.world.centerY;
            this.ball.body.velocity.x = 0;
            this.ball.body.velocity.y = 0;
            this.ballReleased = false;
        }

    }
}

const game = new SpaceGame();