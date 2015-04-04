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
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// autoplay video
function onPlayerReady(event) {
    playNextVideo();
}

// when video ends
function onPlayerStateChange(event) {        
    if(event.data === 0) {          
        alert('done');
    }
}

function playNextVideo()
{
    console.log("Playing next video");
    if (videoQueue.length == 0)
        return;
    var id = videoQueue.shift();
    player.loadVideoById(id);
}
