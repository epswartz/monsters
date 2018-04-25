// <('_')>

// jshint esversion:6,node:true

// IMPORTANT NOTE: The fuzzy matching library I use calls a similarity function "distance", this is quite misleading.

var tesseract = require('node-tesseract');
var FuzzyMatching = require('fuzzy-matching');
const fs = require('fs');
var async = require('async');

var fm = new FuzzyMatching(['Challenge']); // Need this because the word "Challenge" is sometimes a little screwy
// TODO make fuzzy matcher for monster types so we can get that

var folder = 'resources';
var threshold = 0.2; // Minimum similarity

// TODO finish this array and use it to check the CR found against the listed XP
var xp = [
    {
        rating: '1/8',
        xp: '25'
    }
];

// Possible options for CR. isNaN is failing me so just going to do an includes
const CRs = ['1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
// When trying to find the word challenge a couple common false positives come up.
const exceptions = ['cha', 'class']; // Add said exceptions to here. All lowercase.
function isException(string){
    return exceptions.includes(string.toLowerCase());
}

// Comparison function for comparing the matches returned by fuzzy matching.
// Sorts ascending by distance, so that the least distance is first.
function compareMatches(a,b) {
  if (a.distance < b.distance)
    return 1;
  if (a.distance > b.distance)
    return -1;
  return 0;
}

let monsters = [];
let filesDone = 0;
let totalImageFiles = 0;
async.series([
        (asyncCB) => {
            console.log('Reading files from dir: ', folder);
            fs.readdir(`./${folder}/`, (fileErr, files) => {
                if(fileErr){
                    asyncCB('FILE ERR: ' + fileErr);
                }
                files.forEach(file => {
                    if(file.toLowerCase().endsWith('.png')){ // TODO include other formats too because tesseract can handle them
                        totalImageFiles++;
                    }
                });
                files.forEach(file => {
                    if(file.endsWith('.png')){
                        // Recognize text of any language in any format
                        console.log('Reading file: ', file);
                        tesseract.process(__dirname + '/' + folder + '/' + file, (tessErr, text) => {
                            if(tessErr) {
                                asyncCB('TESS ERR: ' + tessErr);
                            } else {
                                console.log('Image read successful on file: ', file);
                                var words = text.split(/[ ,\n]+/);

                                let monster = {
                                    name: file.split('.')[0]
                                };

                                let matches = []; // All matches below the threshold are put in here, and then we
                                for(let idx = 0; idx < words.length; idx++){
                                    let fuzzy = fm.get(words[idx]);
                                    if(fuzzy.value === 'Challenge' && words.length > idx+1 && fuzzy.distance > threshold && CRs.includes(words[idx + 1]) && !isException(words[idx])){ // If fuzzy matching picks up the word Challenge and there's a number after that, grab it as the CR
                                        fuzzy.index = idx; // Add corresponding index to the fuzzy match results
                                        fuzzy.match = words[idx];
                                        fuzzy.cr = words[idx + 1];
                                        matches.push(fuzzy);
                                    }
                                }
                                matches.sort(compareMatches); // Sort ascending by distance to the word "Challenge"
                                console.log('Matches for ', file, "\n", JSON.stringify(matches, null, 2));
                                if(matches.length > 0) {
                                    monster.challenge_rating = words[matches[0].index + 1]; // Keep this as a string because of the possibility that it's a fraction.
                                }
                                monsters.push(monster); // Note we add it whether we found the CR or not, this is just for debug purposes mostly
                                filesDone++;
                                if(filesDone === totalImageFiles){
                                    asyncCB(null);
                                }
                            }
                        });
                    }
                });
            });
        }
    ],

    (err, results) => {
        if(err){
            console.error(err);
        }else{
            console.log('MONSTERS: ', JSON.stringify(monsters, null, 2));
        }
    }
);
