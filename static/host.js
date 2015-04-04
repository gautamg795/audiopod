/*
 * host.js
 * used by the host to play videos in the queue and receive videos from clients
 */

var player;
var videoQueue = [];
var prefix = "mediabox_";

$("#skipButton").click(function() { skipVideo(); });

var PUBNUB = PUBNUB.init({
        subscribe_key: 'sub-c-28a59964-da96-11e4-81e6-0619f8945a4f'
    });
PUBNUB.subscribe({
    channel: prefix + room_id,
    message: function(vid){ addToQueue(vid); },
    error: function (error) {
      // Handle error here
      console.log(JSON.stringify(error));
    }
})
console.log("Listening for messages from pubnub in channel " + prefix + room_id);
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
    console.log("Queueing video with id " + vid);
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