//---------------Model Configuration---------------//

// This is the exportable link that is hosted on Teachable Machine for the trained models
const URL = "https://teachablemachine.withgoogle.com/models/8BQE-l1Yz/";

let model, webcam, labelContainer, maxPredictions, progressBars, closestResult

// Load the image model and setup the webcam
const init = async () => {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    //Load metadata uploaded from TM
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    //Webcam functionality
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(250, 250, flip);
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    //Append Webcam to DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
}

const loop = async () => {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

//Detects which motion has the highest probability
const predict = async () => {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        //Creating probability percentages
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);

        progressBars = document.getElementById('progressContainer');
        progressBars.children[1].children[i].children[0].style.cssText = `width: ${prediction[i].probability.toFixed(2) * 100}%`;
        progressBars.children[1].children[i].children[0].innerHTML= `${prediction[i].probability.toFixed(2) * 100}%`

        //Updating highest probability of motion for character movement
        if (prediction[i].probability > 0.99) closestResult = prediction[i].className;
    }
}

//Reset game
const reset = () => {
    window.location.reload();
}

//---------------Game configuration---------------//
const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 600,
  scene: {
      preload: preload,
      create: create,
      update: update
  },
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  parent: 'game'
};

let game = new Phaser.Game(config);

let platforms;
let player;
let stars;
let diamonds;
let score = 0;
let scoreText;

function preload ()
{
  this.load.image('sky', 'public/sky.png');
  this.load.image('ground', 'public/platform.png');
  this.load.image('star', 'public/star.png');
  this.load.image('diamond', 'public/diamond.png');
  this.load.spritesheet('dude', 'public/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('topground', 'public/topground.png', { frameWidth: 200, frameHeight: 100 });
}

function create ()
{
  this.add.image(400, 300, 'sky');
  
  //Platforms
  platforms = this.physics.add.staticGroup();

  for (let i = 0; i < 8; i++) {
    platforms.create(i * 100, 568, 'topground').setScale(0.8).refreshBody();
  }

  for (let i = 1; i < 11; i++) {
    platforms.create(400 + (30 * i), 400, 'topground').setScale(0.3).refreshBody();
  }

  for (let i = 0; i < 24; i++) {
    platforms.create(20 + (i * 10), 250, 'topground').setScale(0.3).refreshBody();
  }

  //Player
  player = this.physics.add.sprite(100, 450, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
      frameRate: 10,
      repeat: -1
  });
  
  this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4}],
      frameRate: 20
  })

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
      frameRate: 10,
      repeat: -1
  });

  //Diamonds
  diamonds = this.physics.add.group({
      key: 'diamond',
      repeat: 9,
      setXY: { x: 35, y: 0, stepX: 70 }
  });

  diamonds.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.4));
  });

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(diamonds, platforms);
  this.physics.add.overlap(player, diamonds, collectDiamond, null, this);

  //Score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

let cursors;

function update ()
{
  cursors = this.input.keyboard.createCursorKeys();

    if (closestResult === 'LEFT') {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (closestResult === 'RIGHT') {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else if (closestResult === 'STOP') {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (closestResult === 'JUMP' && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectDiamond (player, diamond)
{
  diamond.disableBody(true, true);
  score += 10;
  scoreText.setText('score: ' + score)
}

