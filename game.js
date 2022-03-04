// This is the exportable link that is hosted on Teachable Machine for the trained models
const URL = "https://teachablemachine.withgoogle.com/models/NH3nuHom4/";

let model, webcam, labelContainer, maxPredictions, progressBars

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(250, 250, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    // for (let i = 0; i < maxPredictions; i++) { // and class labels
    //     labelContainer.appendChild(document.createElement("div"));
    //     labelContainer.childNodes[i].className = 'hello'
    //     // labelContainer.childNodes[i].appendChild(document.createElement("progress"))
    // }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

let closestResult;

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        progressBars = document.getElementById('progressContainer');
        // console.log('childNodes', progressBars.children[1].children);
        // labelContainer.childNodes[i].innerHTML = classPrediction;
        // labelContainer.childNodes[i].style.backgroundColor = 'red';
        // console.log(progressBars.children[0].children[0].style.cssText)
        progressBars.children[1].children[i].children[0].style.cssText = `width: ${prediction[i].probability.toFixed(2) * 100}%`;
        progressBars.children[1].children[i].children[0].innerHTML= `${prediction[i].probability.toFixed(2) * 100}%`
        if (prediction[i].probability > 0.99) closestResult = prediction[i].className;
    }
}

const reset = () => {
    window.location.reload();
}

// GAME
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
let score = 0;
let scoreText;

function preload ()
{
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
  this.add.image(400, 300, 'sky');
  
  //Platforms
  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

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

  //Stars
  stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

      child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.4));

  });

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  //Score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

let cursors;

function update ()
{
  cursors = this.input.keyboard.createCursorKeys();

//   if (cursors.left.isDown) {
//       player.setVelocityX(-160);
//       player.anims.play('left', true);
//   }
//   else if (cursors.right.isDown) {
//       player.setVelocityX(160);
//       player.anims.play('right', true);
//   }
//   else  {
//       player.setVelocityX(0);
//       player.anims.play('turn');
//   }

//   if (cursors.up.isDown && player.body.touching.down) {
//       player.setVelocityY(-330);
//   }
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

    if (closestResult === 'UP' && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar (player, star)
{
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('score: ' + score)
}
