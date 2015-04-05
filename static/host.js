/*
 * host.js
 * used by the host to play videos in the queue and receive videos from clients
 */

var player;
var videoQueue = [];
var prefix = "mediabox_";
var queueTemplate;
var index = 0;
var skipMessages = [ "Not feelin' it? Skip it!", "WORST song ever??? Skip it!", "Hate this song? Skip it!", "Did Gautam pick this song? Skip it!", "Don't like this song? Skip it!"];
$(document).ready(function() {
    queueTemplate = _.template($("#queueEntryTemplate").html());
});
$("#skipButton").click(function() { skipVideo(); });

var PUBNUB = PUBNUB.init({
        subscribe_key: 'sub-c-28a59964-da96-11e4-81e6-0619f8945a4f'
    });
PUBNUB.subscribe({
    channel: prefix + room_id,
    message: function(video_info){ addToQueue(video_info); },
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
    updateQueueStatus();
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
    var video = videoQueue.shift();
    $("#" + video.vid + "-queue").fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); });
    updateQueueStatus();
    player.loadVideoById(video.vid);
}

function addToQueue(video_info)
{
    console.log("Queueing video");
    var video = JSON.parse(video_info);
    $(queueTemplate({video : video})).hide().appendTo("#up-next").fadeIn('slow');
    $("#up-next").append();
    videoQueue.push(video);
    /*
     * TODO: Update the HTML on the page to add it to the "up next"
     */
    
    var state = player.getPlayerState();
    if (videoQueue.length == 1 && (state == -1 || state == 5 || state == 0 ))
        playNextVideo();
    updateQueueStatus();
}

function skipVideo()
{
    player.stopVideo(); // in case this is the last video in the queue
    playNextVideo();
    if (index == skipMessages.length) 
        index = 0;
    $("#skiptext").hide().html(skipMessages[index]).fadeIn('slow');
    index++;
}

function updateQueueStatus()
{
    var message ="<div class='list-group-item alert alert-info' role='alert' id='queueEmpty'>Your queue is empty! Search a song, or send your friends to songbox.io/client/" + room_id +"</div>"
    if ($("#queueEmpty").length)
    {
        if (videoQueue.length != 0)
            $("#queueEmpty").remove();
    }
    else if (videoQueue.length == 0)
        $("#up-next").append(message);
}

function anchorSearchResults()
{
    $(".searchResultEntry").click(function(event) {
        var v_id = event.currentTarget.id;
        var video = _.findWhere(searchResults, {vid: v_id});
        addToQueue(JSON.stringify(video));
        $("#collapseSearch").collapse();
        $("#searchResults").children().fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); });
        $("#searchText").val("")
        /* show notification on screen */
    });
}