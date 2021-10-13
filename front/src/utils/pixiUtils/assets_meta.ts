export const assets = [
  {name: 'bunnyHead', url: './assets/bunnyHead.png'},
  {name: 'bunnyArm', url: './assets/bunnyArm.png'},
  {name: 'bunnyBody', url: './assets/bunnyBody.png'},
  {name: 'bubble99', url: './assets/Bubbles99px.png'},
  {name: 'background', url: './assets/background.png'},
  {name: 'tree1', url: './assets/tree1.png'},
];

// 소스코드에서 어셋 import해서 사용하는 방법
// // remember the assets manifest we created before? You need to import it here
// Loader.shared.add(assets);

// // this will start the load of the files
// Loader.shared.load();

// // In the future, when the download finishes you will find your entire asset like this
// Loader.shared.resources["the name you gave your asset in the manifest"];
// // You will probably want `.data` or `.texture` or `.sound` of this object
// // however for Pixi objects there is are better ways of creating them...
