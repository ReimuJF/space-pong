	var game = new Phaser.Game(480, 600, Phaser.AUTO, "game", { preload: preload, create: create, update: update });
	
	var logo;
	var textH;
    var playerShip;
    var computerShip;
    var ball;
	var explosions;
	var sexplosions;
	var score = 0;
	var computerShipSpeed = 250;
    var ballSpeed = 300;
	var ballReleased = false;
	
	var music;
	var fxhit;
	var fxwin;
	var fxlose;
	var starfield;
	var flag = true;
	var flag2 = true;
	var ShiftButton;
	
	var mmuteButton;
	var startButton;
	var pauseButton;
	
    
    function preload() {
        game.load.image('Ship', 'assets/bet.png');
		game.load.image('Ship2', 'assets/bet2.png');	
        game.load.image('ball', 'assets/ball.png');
        game.load.image('background', 'assets/starfield.jpg');
		game.load.image('star', 'assets/star.png');
		game.load.image('logo', 'assets/space.png');
		game.load.image('pause', 'assets/ppause.png');
		game.load.audio('bgm', 'assets/audio/bgm.mp3');
		game.load.audio('sfx', 'assets/audio/exp.wav');
		game.load.audio('win', 'assets/audio/exp2.wav');
		game.load.audio('lose', 'assets/audio/exp3.wav');
		game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
		game.load.spritesheet('kaboom2', 'assets/explode2.png', 32, 32);
    }
	

    function create() {
		music = game.add.audio('bgm');
	    	music.loop = true
		music.play('',0,0.15,true);
		fxhit = game.add.audio('sfx');
		fxwin = game.add.audio('win');
		fxlose = game.add.audio('lose');
	    game.physics.startSystem(Phaser.Physics.ARCADE);
		
		game.physics.arcade.checkCollision.down = false;
        starfield = game.add.tileSprite(0, 0, 480, 600, 'background');
		textScore = game.add.text(0, 0, 'Score: ' + score , {fill: '#efefef'});
		text = game.add.text(game.world.centerX, game.world.centerY-30, '', {fill: '#efefef'});
		text.anchor.setTo(0.5);
		playerShip = createShip(game.world.centerX-50, 550);
        computerShip = createShip2(game.world.centerX, 50);
		pauseButton = game.add.button(455, 5, 'pause', fpause, this);
		
		ball = game.add.sprite(game.world.centerX, game.world.centerY, 'ball');
        ball.anchor.setTo(0.5);
		game.physics.enable(ball, Phaser.Physics.ARCADE);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.setTo(1);
		
		
		
		emitter = game.add.emitter(0, 0, 200);
		emitter.makeParticles('star');
		
		logo = game.add.sprite(10, 100, 'logo');
		logo.fixedToCamera = true;
		textH = game.add.text(game.world.centerX-110, game.world.centerY+40, 'Controls:\nArrows to move\nShift+Arrows to boost\nSpace to release ball\n1 to mute music', {fill: '#efefef'});
		
		    explosions = game.add.group();

    for (var i = 0; i < 16; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }
	
		sexplosions = game.add.group();
	    for (var i = 0; i < 16; i++)
    {
        var explosionAnimation = sexplosions.create(0, 0, 'kaboom2', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom2');
    }
		
		cursors = game.input.keyboard.createCursorKeys();
		game.input.onDown.add(unpause, self);
		startButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		ShiftButton = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
		mmuteButton = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
		startButton.onDown.add(releaseBall, this);
		startButton.onDown.add(destroyLogo, this);
		startButton.onDown.add(revive, this);
		mmuteButton.onDown.add(MusicPause, this);
    }
	
	//function fpause(){
		//if (game.paused)
			//{
				//game.paused = false;
			//}
			//else
			//{
				//game.paused = true;
			//}
		//};
		
		//Ýòè äâå ôóíêöèè ðåàëèçîâàííû èç çà áàãà ñ ôðåéìâîðêîì.
	function fpause(){
        game.paused = true;
	}
	
	function unpause(){
	if (game.paused)
			{
				game.paused = false;
			}
	}
	
	function destroyLogo(){
	logo.kill();
	textH.destroy();
	}
	
	function MusicPause(){	
	if (game.sound.mute)
			{
				game.sound.mute = false;
			}
			else
			{
				game.sound.mute = true;
			}
	}
	
	function ShiftSpeedUp(){

	
	}
	
	function createShip(x, y) {
		
        var Ship = game.add.sprite(x, y, 'Ship');
        Ship.anchor.setTo(0.5);
	game.physics.enable(Ship, Phaser.Physics.ARCADE);
        Ship.body.collideWorldBounds = true;
        Ship.body.bounce.setTo(1);
        Ship.body.immovable = true;

        return Ship;
    }
	
		
	function createShip2(x, y) {
		
        var Ship = game.add.sprite(x, y, 'Ship2');
        Ship.anchor.setTo(0.5);
		game.physics.enable(Ship, Phaser.Physics.ARCADE);
        Ship.body.collideWorldBounds = true;
        Ship.body.bounce.setTo(1);
        Ship.body.immovable = true;

        return Ship;
    }
	
	    function releaseBall() {
        if (!ballReleased) {
            ball.body.velocity.x = 0;
            ball.body.velocity.y = ballSpeed;
            ballReleased = true;
        }
    }
		
	

    function update () {
   
	    starfield.tilePosition.y += 2;
		
		 playerShip.body.velocity.setTo(0, 0);

    if (cursors.left.isDown)
    {
        playerShip.body.velocity.x = -450;
    }
    else if (cursors.right.isDown)
    {
        playerShip.body.velocity.x = 450;
    }
	if (ShiftButton.isDown && cursors.left.isDown)
    {
        playerShip.body.velocity.x = -600;
    }
	 else if (ShiftButton.isDown && cursors.right.isDown)
    {
        playerShip.body.velocity.x = 600;
    }

        var playerShipHalfWidth = playerShip.width / 2;

        if (playerShip.x < playerShipHalfWidth) {
            playerShip.x = playerShipHalfWidth;
        }
        else if (playerShip.x > game.width - playerShipHalfWidth) {
            playerShip.x = game.width - playerShipHalfWidth;
        }
		
        if(computerShip.x - ball.x < -15) {
            computerShip.body.velocity.x = computerShipSpeed;
        }
        else if(computerShip.x - ball.x > 15) {
            computerShip.body.velocity.x = -computerShipSpeed;
        }
        else {
            computerShip.body.velocity.x = 0;
        }
		
		game.physics.arcade.collide(ball, playerShip, ballHitsShip, null, this);
        game.physics.arcade.collide(ball, computerShip, ballHitsShip, null, this);
		
		checkGoal();
    }
	
	 function ballHitsShip (_ball, _Ship) {

		var explosion = sexplosions.getFirstExists(false);
			explosion.reset(_Ship.body.x+70, _Ship.body.y+35);
			explosion.play('kaboom2', 30, false, true);
		
        var diff = 0;

        if (_ball.x < _Ship.x) {
            diff = _Ship.x - _ball.x;
            _ball.body.velocity.x = (-10 * diff);
        }
        else if (_ball.x > _Ship.x) {
            diff = _ball.x -_Ship.x;
            _ball.body.velocity.x = (10 * diff);
        }
        else {
            _ball.body.velocity.x = 2 + Math.random() * 8;
        }
		fxhit.play('',0,0.1);
    }
	
		function showText(txt, timeout) {
		text.setText(txt);
		setTimeout(function() {
			text.setText('');
		}, timeout);
	}
	
	    function checkGoal() {
        if (ball.y <= 25) {
			computerShip.kill();
			var explosion = explosions.getFirstExists(false);
			explosion.reset(computerShip.body.x+70, computerShip.body.y+35);
			explosion.play('kaboom', 30, false, true);
			computerShipSpeed += 100;
			ballSpeed += 110;
			score += 1;
			textScore.setText('Score: ' + score);
			showText('ENEMY SHIP ELIMINATED!', 1500);
			fxwin.play('',0,0.1);
			setBall();
	

        } else if (ball.y >= 550) {
			playerShip.kill();
			var explosion = explosions.getFirstExists(false);
			explosion.reset(playerShip.body.x+70, playerShip.body.y+35);
			explosion.play('kaboom', 30, false, true);
            		setBall();
			computerShipSpeed = 250;
			score = 0;
			textScore.setText('Score: ' + score);
			showText('YOU ARE DEFEATED!', 1500);
			ballSpeed = 300;
			fxlose.play('',0,0.1);			
        }
    }
	function revive(){
	computerShip.revive();
	playerShip.revive();
	}

    function setBall() {
        if (ballReleased) {
            ball.x = game.world.centerX;
            ball.y = game.world.centerY;
            ball.body.velocity.x = 0;
            ball.body.velocity.y = 0;
            ballReleased = false;
        }
		function render() {
}

        
    }
