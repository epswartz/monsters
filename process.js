// <('_')>

// jshint esversion:6,node:true

var ir = require('./readImage.js')({logging: true}); // Initialize the image reader with default options.

ir('/home/ubuntu/monsters/resources/Wolf.png', (monster) => {
	console.log(JSON.stringify(monster, null, 2));
});