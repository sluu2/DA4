var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update});

function preload() {
    /* MUSIC AND SOUNDS*/
    game.load.audio('isolation', 'assets/aud/isolation.ogg');
    game.load.audio('patrickwhy', 'assets/aud/patrickwhy.ogg');
    game.load.audio('fail', 'assets/aud/sad_violin.ogg');
    game.load.audio('ring', 'assets/aud/ring.ogg');
    game.load.audio('wrong', 'assets/aud/wrong.ogg');
    
    /* MENU AND HUD */
    game.load.image('background', 'assets/img/robot_factory.png');
    game.load.image('menu', 'assets/img/hud/menu.png');
    game.load.image('pauseButton', 'assets/img/hud/pause.png');
    game.load.image('end', 'assets/img/hud/end.png');
    game.load.spritesheet('speedind', 'assets/img/hud/speed.png', 40, 150);
    
    /* PLAYER AND OBJECTS */
    game.load.image('chain', 'assets/img/chain.png');
    game.load.spritesheet('patrick', 'assets/img/patrick.png', 61, 83);
    game.load.image('lavavat', 'assets/img/lavavat.png');
    
    game.load.image('ddr', 'assets/img/ddr.png');
    game.load.image('larrow', 'assets/img/left.png');
    game.load.image('darrow', 'assets/img/down.png');
    game.load.image('uarrow', 'assets/img/up.png');
    game.load.image('rarrow', 'assets/img/right.png');
    game.load.spritesheet('boundary', 'assets/img/boundary.png', 100, 100);
}

/* MAP VARIABLES */
var background;
var ddr;

/* HUD */
var menu;
var pauseButton;
var speedindicate;
var end;

/* SOUND VARIABLES */
var music;
var fail;
var patrickwhy;
var correct;
var incorrect;
     
/* TIMERS */
var riseTimer;
var diffTimer;
var diffSec;
var SPText;

/* GAME LOGIC TRACKER */
var inputcheck;
var spawned;
var difficulty;
var choosearrow;
var speed;
var rising;
var lose;

/* TEXT */
var scoreText;
var endtext;
var record;
    
/* WORLD OBJECTS */
var player;
var chain;
var vat;
var spawner;
var boundary;
var arrows;
var arrow;

/* MOVEMENT CONTROLS */
var cursors;

function create() {
    /* PHASER PHYSICS ENGINE USED A*/
    game.physics.startSystem(Phaser.Physics.Arcade);
    var style = { font: "32px Arial", fill: "#FFFFFF", align: "center" };
    
    /* GAME AUDIO */
    music = game.add.audio('isolation');
    patrickwhy = game.add.audio('patrickwhy');
    fail = game.add.audio('fail');
    correct = game.add.audio('ring');
    incorrect = game.add.audio('wrong');
     
    /* GAME LOGIC */
    setDiffSec = 25;     //SETS NUMBER OF SECONDS UNTIL DIFFICULTY CHANGES
    diffSec = setDiffSec;   
    difficulty = 1;     // 1 : EASY, 2: MEDIUM, 3: HARD
    speed = 0;
    record = 0;
    inputcheck = false;
    spawned = false;
    lose = false;
    rising = false;
    
    /* ADD OBJECTS TO THE GAME WORLD */
    background = game.add.sprite(0, 0, 'background');
    
    ddr = game.add.sprite(game.world.width - 210, 10, 'ddr');
    spawner = game.add.sprite(ddr.x + 50, ddr.y, 'boundary');
    spawner.visible = false;
    killer = game.add.sprite(ddr.x + 50, ddr.y + 580, 'boundary');
    killer.visible = false;
    
    vat = game.add.sprite(40 , game.world.height - 150, 'lavavat');
    chain = game.add.sprite(270, -465, 'chain');
    player = game.add.sprite(259.5, 0, 'patrick');
    boundary = game.add.sprite(ddr.x + 50, ddr.y + 470, 'boundary');
    
    /* HUD */
    speedindicate = game.add.sprite(ddr.x + 5, ddr.y + 5, 'speedind');
    SPText = game.add.text(ddr.x + 157, ddr.y+ 5, '' + diffSec, style);
    scoreText = game.add.text(64, 20, 'Score: ' + record, { fontSize: '36px', fill: '#FFF' });
    end = game.add.sprite(200, 250, 'end');
    end.visible = false;
    endtext = game.add.text(end.x + 85, end.y + (end.height / 2) - 13.5, 'FINAL SCORE: ' + record, { fontSize: '36px', fill: '#FFF' });
    endtext.visible = false;
    
    menu = game.add.sprite(0,0, 'menu');
    
    arrows = game.add.group();
    arrows.enableBody = true;
    arrows.physicsBodyType = Phaser.Physics.ARCADE;
    arrows.setAll('outOfBoundsKill', true);
    arrows.setAll('checkWorldBounds', true);
    
    //  Enabling Physics
    game.physics.arcade.enable(spawner);
    game.physics.arcade.enable(boundary);
    game.physics.arcade.enable(killer);
    
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(chain);
    game.physics.arcade.enable(vat);
    
    /* SET COLLISION SIZES */
    vat.body.setSize(500, 95, 0, 55);
    boundary.body.setSize(30, 30, 35, 35);
    
    /* PLAYER SECTION */
    //Player physics
    player.body.collideWorldBounds = true;

    //Player animations
    player.animations.add('blink', [0, 0, 0, 0, 0, 1], 5, true);
    player.animations.play('blink');
    /* END OF PLAYER SECTION*/
    
    /* TIMERS */
    diffTimer = game.time.create(false);
    diffTimer.loop(Phaser.Timer.SECOND, countDown, this);
    diffTimer.start();
    
    
    
    //  Directional Controls
    cursors = game.input.keyboard.createCursorKeys();
    
    /* MENU AND PAUSE SECTION */
    this.game.paused = true;
    this.pauseButton = this.game.add.sprite(16, 16, 'pauseButton');
    this.pauseButton.fixedToCamera = true;
    this.pauseButton.inputEnabled = true;
    this.pauseButton.events.onInputUp.add(function () {
        this.game.paused = true;
    },this);
    this.game.input.onDown.add(function () {
        if(this.game.paused) {
            menu.kill();
            this.game.paused = false;
        }
    },this);
}

function update() {
    game.physics.arcade.overlap(player, vat, gameOver, null, this);
    game.physics.arcade.overlap(arrow, killer, reSpawn, null, this);
    game.physics.arcade.overlap(arrow, boundary, checkInput, null, this);
    
    if (!lose) {
        if (!music.isPlaying)
            music.play('', 0, 0.5, false, true)
            
        if (!spawned) {
            spawned = true;
            choosearrow = game.rnd.integerInRange(1,4);
            switch (choosearrow){
                case 1:
                    spawnArrow('left');
                    break;
                case 2:
                    spawnArrow('down');
                    break;
                case 3:
                    spawnArrow('up');
                    break;
                case 4:
                    spawnArrow('right');
                    break;
                default:
                    break;
            }
        }
        else {
            arrow.body.velocity.y = speed;
        }
        
        if (!rising) {
            //20
            player.body.velocity.y = 50;
            chain.body.velocity.y = 50;
            
        }
        else {
            if (player.y !== 0){
                player.body.velocity.y = -10;
                chain.body.velocity.y = -10;
            }
            else {
                player.body.velocity.y = 0;
                chain.body.velocity.y = 0;
            }
        }
        
        /* CHANGES DIFFICULTY AFTER ALLOTTED TIME */
        if (diffSec == 0)
            changeDifficulty();
    }
    else {
        player.body.velocity.y = 0;
        chain.body.velocity.y = 0;
        vat.body.velocity.y = 0;
        music.stop();
        if (!fail.isPlaying){
            fail.play('', 0, 0.5, false, true);
        }
        
        endtext.text = 'FINAL SCORE: ' + record;
        endtext.visible = true;
        end.visible = true;
    }
}

function countDown() {
    if (difficulty !== 3)
        diffSec -= 1;
    SPText.text = '' + diffSec;
}

function changeDifficulty() {
    /* 1 = EASY, 2 = MEDIUM, 3 = HARD */
    if (difficulty < 3) {
        difficulty++;
        if (difficulty === 2)
        speedindicate.frame = 1;
    else
        speedindicate.frame = 2;
        diffSec = setDiffSec;
    }
}

function spawnArrow (arrowDir) {
    switch (arrowDir) {
        case 'left':
            arrow = arrows.create(spawner.x, spawner.y, 'larrow');
            break;
        case 'down':
            arrow = arrows.create(spawner.x, spawner.y, 'darrow');
            break;
        case 'up':
            arrow = arrows.create(spawner.x, spawner.y, 'uarrow');
            break;
        case 'right':
            arrow = arrows.create(spawner.x, spawner.y, 'rarrow');
            break;
        default:
            break;
    }
    arrow.body.setSize(30, 30, 35, 35);
    if (difficulty === 1)
        speed = game.rnd.integerInRange(200,600);
    else if (difficulty === 2)
        speed = game.rnd.integerInRange(400,800);
    else
        speed = game.rnd.integerInRange(600,1200);
    
}

function reSpawn(arrowDir, killer) {
    //test.text = 'RESPAWN';
    boundary.frame = 0;
    inputcheck = false;
    spawned = false;
}

function checkInput(arrowDir, boundary) {
    if (!inputcheck) {
        if (cursors.left.isDown && choosearrow == 1)
            goUp();
        else if (cursors.down.isDown && choosearrow == 2)
            goUp();
        else if (cursors.up.isDown && choosearrow == 3)
            goUp();
        else if (cursors.right.isDown && choosearrow == 4)
            goUp();
        else {
            rising = false;
            incorrect.play('', 0, 0.35, false, true);
            if (!patrickwhy.isPlaying)
                patrickwhy.play('', 0, 0.35, false, true);
        }
        inputcheck = true;
    }   
}

function goUp() {
    record += 1;
    scoreText.text = 'Score: ' + record;
    boundary.frame = 1;
    correct.play('', 0, 0.35, false, true);
    rising = true;
}

function gameOver(player, vat) {
    player.frame = 1;
    lose = true;
}
