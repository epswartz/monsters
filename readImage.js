// <('_')>

// jshint esversion:6,node:true

// Exports a function which, when given an image file for a homebrew monster (screenshot of homebrewery, screenshot of roll20 compendium, or whatever) returns an object representing the monster.
// The returned object looks like this:

/*
{
    name: "Galeb Duhr",
    challenge_rating: "6", // Note this is a string, not a number - because some of them are fractions
    size: "Medium",
    type: "Elemental"
}
*/

// IMPORTANT NOTE: The fuzzy matching library I use calls a similarity function "distance", this is quite misleading.

var tesseract = require('node-tesseract');
var FuzzyMatching = require('fuzzy-matching');
const fs = require('fs');
var async = require('async');

var fm = new FuzzyMatching(['Challenge']); // Need this because the word "Challenge" is sometimes a little screwy
// TODO make fuzzy matcher for monster types so we can get that

var dir = 'resources';
var threshold = 0.2; // Default minimum similarity for

/*
// TODO finish this array and use it to check the CR found against the listed XP?
var xp = [
    {
        rating: '1/8',
        xp: '25'
    }
];
*/

// Possible options for CR. isNaN is failing me with the fractions so just going to do an includes on this array.
const CRs = ['1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

// When trying to find the word challenge a couple common false positives come up.
const defaultExceptions = ['cha', 'class']; // Add said common false positives to here. All lowercase.

// Supported filetypes.
const supportedTypes = ['png', 'jpg'];

// Comparison function for comparing the matches returned by fuzzy matching.
// Sorts ascending by distance, so that the least distance is first.
function compareMatches(a,b) {
  if (a.distance < b.distance)
    return 1;
  if (a.distance > b.distance)
    return -1;
  return 0;
}

// A function which returns the function you actually want.
module.exports = ({logging = false, threshold = 0.2, exceptions = defaultExceptions} = {logging: false, threshold: 0.2, exceptions: defaultExceptions}) => {

    return (file, callback) => {

        // My hacky way of turning logging on and off :)
        var log = () => {}; // At first, a function which does nothing.
        if(logging){ // But, if logging is true, it becomes a function which will actually log. :)
            log = console.log;
        }

        // Takes the text pulled from an image and comes back with the size.
        function extractSize(text){
            return null; // TODO
        }

        // Takes the text pulled from an image and comes back with the size.
        function extractName(text){
            return null; // TODO
        }

        // Takes the text pulled from an image and comes back with the size.
        function extractType(text){
            return null; // TODO
        }

        // Takes the text pulled from an image and comes back with the challenge rating. It's an inner function only so that it can see the filename for logging.
        function extractCR(text){
            log('Extracting CR from: ', file);
            let matches = []; // All matches below the threshold are put in here, and then we sort with a custom compare function to find the best one.
            var words = text.split(/[ ,\n]+/);

            let monster = {
                name: file.split('.')[0]
            };

            for(let idx = 0; idx < words.length; idx++){
                let fuzzy = fm.get(words[idx]);
                // If fuzzy matching picks up the word Challenge, it's above the threshold, isn't a known exception, and there's a number after that, grab it as the CR
                if(fuzzy.value === 'Challenge' && words.length > idx+1 && fuzzy.distance > threshold && CRs.includes(words[idx + 1]) && !isException(words[idx])){
                    fuzzy.index = idx; // Add corresponding index to the fuzzy match results
                    fuzzy.match = words[idx];
                    fuzzy.cr = words[idx + 1];
                    matches.push(fuzzy);
                }
            }
            matches.sort(compareMatches); // Sort ascending by distance to the word "Challenge"
            log('CR Matches for ', file, "\n", JSON.stringify(matches, null, 2));
            if(matches.length > 0) {
                return words[matches[0].index + 1]; // Keep this as a string because of the possibility that it's a fraction.
            }
        }

        // Checks a string against a list of common false positives. Inner function so that exceptions can be overriden.
        function isException(string){
            return exceptions.includes(string.toLowerCase());
        }

        // Checks whether a file is of a supported image type, using the file name and a list of supported types.
        function isSupported(fileName){
            let split = fileName.toLowerCase().split('.');
            return supportedTypes.includes(split[split.length - 1]);
        }

        let monsters = [];
        let filesDone = 0;
        let totalImageFiles = 0;
        if(isSupported(file)){
            // Recognize text of any language in any format
            log('Reading file: ', file);
            tesseract.process(file, (tessErr, text) => {
                if(tessErr) {
                    callback('Image Reader Error: ' + tessErr);
                } else {
                    let cr = extractCR(text);
                    let type = extractType(text);
                    let name = extractName(text);
                    let size = extractSize(text);
                    let ret = {
                        challenge_rating: cr,
                        name: name,
                        size: size,
                        type: type
                    };
                    log('Returning extracted monster: ', JSON.stringify(ret, null, 2));
                    callback(ret);
                }
            });
        }else{
            callback("Image Reader Error: File type not supported");
        }
    };
};

