// <('_')>

//jshint esversion:6,node:true

'use strict';

const Parser = require('rss-parser');
let parser = new Parser();

// For parsing cmd line stuff
const optionDefinitions = [
  { name: 'pages', alias: 'p', type: Number }
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

let pageLimit = options.pages || 1;
// Does something to ALL the posts on a subreddit.
// First argument is the subreddit to load RSS for.
// Second argument is the function to run on each one.
// For writing processFunction, know that posts have:
    // - title
    // - link
    // - pubDate
    // - author
    // - content (may need some html parsing here)
    // - contentSnippet
    // - id
function getPosts(subreddit, processFunction){

    let done = 0;
    while(done <= pageLimit){

    }
    parser.parseURL(`https://www.reddit.com/r/${subreddit}/.rss?count=25&after=t3_87u4di`, (err, feed) => {
        if(err){
            throw err;
        }

        feed.items.forEach(item => {
            // TODO Massage the thing a bit so that we just have markdown in the content
            processFunction(item);
        });
    });
}

getPosts('monsteraday', (post) => {
    // console.log(post.title + ':' + post.link);

    // Attempt to identify whether this is one of the daily monster posts.
    if(post.title.startsWith('Day ')){
        // console.log(`<a href=${post.link}>${post.title}</a>`); // If it is, output a link.
        console.log(JSON.stringify(post, null, 2));
    }

});

