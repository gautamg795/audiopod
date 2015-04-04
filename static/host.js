/* host.js
 * used by the host to play videos in the queue and receive videos from clients
 */

var player;
var videoQueue = [];

function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}


// when video ends
function onPlayerStateChange(event) {        
    if(event.data === 0) {          
        playNextVideo();
    }
}

function playNextVideo()
{
    console.log("Playing next video");
    if (videoQueue.length == 0) {
        console.log("Video queue was empty");
        return;
    }
    var id = videoQueue.shift();
    player.loadVideoById(id);
}

function addToQueue(vid)
{
    videoQueue.push(vid);
    /*
     * TODO: Update the HTML on the page to add it to the "up next"
     */
    var state = player.getPlayerState();
    if (videoQueue.length == 1 && (state == -1 || state == 5 || state == 0 ))
        playNextVideo();
}

function skipVideo()
{
    player.stopVideo(); // in case this is the last video in the queue
    playNextVideo();
}