// jshint esversion:6,node:true


var FuzzyMatching = require('fuzzy-matching');
var fm = new FuzzyMatching(['Challenge']); // Need this because the word "Challenge" is sometimes a little screwy

var a = ['Challenege', 'Chalenge', 'aiowufhiawfh', 'egnellahC', 'Challenge'];

a.forEach((e) => {
	console.log(JSON.stringify(fm.get(e), null, 2));
});
