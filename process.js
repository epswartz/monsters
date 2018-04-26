// <('_')>

// jshint esversion:6,node:true
var ir = require('./readImage.js')(); // Initialize the image reader with default options.

ir('/home/ubuntu/monsters/resources/Kenku.jpg', (err, monster) => {
	if(err){
		console.log(err);
	}else{
		console.log(JSON.stringify(monster, null, 2));
	}
});