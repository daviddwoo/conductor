// const options = { probabilityThreshold: 0.7 };
// const classifier = ml5.soundClassifier('SpeechCommands18w', options, modelReady);

// function modelReady() {
//   // classify sound
//   classifier.classify(gotResult);
// }

// function gotResult(error, result) {
//   if (error) {
//     console.log(error);
//     return;
//   }
//   // log the result
//   console.log('result', result);
//   const closestResult = result.find((word) => word.confidence > 0.95);
//   console.log(closestResult.label)
// }

// // Create a new SketchRNN Instance
// const model = ml5.sketchRNN('cat', modelReady);

// // When the model is loaded
// function modelReady() {
//   console.log('SketchRNN Model Loaded!');
// }
// // Reset the model's current stat
// model.reset();
// // Generate a new stroke
// model.generate(gotSketch);

// function gotSketch(err, result) {
//   // Do something with the result
// }