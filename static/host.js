/*
 * host.js
 * used by the host to play videos in the queue and receive videos from clients
 */

/* Set up Faye */
var fayeClient = new Faye.Client('http://faye.audiopod.me');
var subscription = fayeClient.subscribe('/' + String(room_id), messageReceived);
console.log("Listening for messages from faye in channel /" + room_id);

var player;
var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
var iOSvid = "";
var initialized = false;
var queueTemplate;
var skipIndex = 0;
var skipMessages = [ "Not feelin' it? Skip it!", "WORST song ever??? Click here to skip it!", "Hate this song? Click here to skip it!", "Who even picked this? Click here to skip!", "Don't like this song? Click here to skip it!"];

function Message(type, data) {
    this.type = type;
    this.data = data;
}

function processMessage(messageString)
{
    messageString = JSON.parse(messageString);
    return new Message(messageString.type, messageString.data);
}


$(document).ready(function() {
    queueTemplate = _.template($("#queueEntryTemplate").html());
    $('[data-toggle="tooltip"]').tooltip();
    $(".initialHide").hide();
    $("#ios").children().hide();
    if (iOS) {
        $("#ios").children().show();
        $("#ios").click(function() { if (iOSvid != "") player.loadVideoById(iOSvid); });
    }
    $("#skiptext").click(skipVideo);
});

function messageReceived(m) {
    var message = processMessage(m);
    if (message.type == "queueVideo")
        return queueVideo(message.data);
}

function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        playerVars : {
            rel: '0',
            modestbranding: '1',
            iv_load_policy: '3',
        },
        events: {
            'onError': onVideoError,
            'onStateChange': onPlayerStateChange
        }
    });
    updateQueueStatus();
}

function onVideoError(event) {
    console.log("Error");
    player.stopVideo(); // in case this is the last video in the queue
    playNextVideo();
}

// when video ends
function onPlayerStateChange(event) {        
    if(event.data === 0) {          
        playNextVideo();
    }
    if (event.data === 1)
        updateNowPlaying();
}

function initIfNeeded()
{
    if (! initialized)
    {
        initialized = true;
        $(".initialHide").show();
    }
}

function playNextVideo()
{
    initIfNeeded();
    if (queueLength() == 0)
    {
        return;
    }
    var vid = $("#up-next").children().first().attr('id').slice(0, -6);
    $("#up-next").children().first().fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); updateQueueStatus(); });
    iOSvid = vid;
    player.loadVideoById(vid);
}

function queueLength()
{
    return $("#up-next").children().length - $("#queueEmpty").length;
}

function queueVideo(video)
{
    if (video.e)
    {
        fun_func();
        return;
    }
    notify(video.title);
    var state = player.getPlayerState();
    if ($("#queueEmpty").length && (state == -1 || state == 5 || state == 0 ))
    {
        initIfNeeded();
        player.loadVideoById(video.vid);
        return;
    }
    $(queueTemplate({video : video})).hide().appendTo("#up-next").fadeIn('slow');
    $(".deletebutton").click(deleteFromQueue);
    $(".nextbutton").click(moveToFront);
    $(".nowbutton").click(playNow);
    updateQueueStatus();
}

function skipVideo()
{
    player.stopVideo(); // in case this is the last video in the queue
    playNextVideo();
    if (skipIndex == skipMessages.length)
        skipIndex = 0;
    $("#skiptext").fadeOut('slow', function() { $(this).html(skipMessages[skipIndex]); }).fadeIn('slow');
    skipIndex++;
}

function updateQueueStatus()
{
    var message ="<div class='list-group-item alert alert-info' role='alert' id='queueEmpty'>Your queue is empty! Search for a song, or send your friends to audiopod.me/" + room_id +"</div>"
    if ($("#queueEmpty").length)
    {
        if (queueLength() != 0)
            $("#queueEmpty").remove();
    }
    else if (queueLength() == 0)
        $("#up-next").append(message).slideDown('slow');
}

function updateNowPlaying()
{
    var message = 'Now Playing: "<%= video_name %>"';
    message = _.template(message);
    message = message({video_name : player.getVideoData().title});
    if ($("#nowPlaying").text() == message)
        return;
    $('#nowPlaying').animate({'opacity': 0}, 500, function () {
        $(this).text(message);
    }).animate({'opacity': 1}, 500);
}

function anchorSearchResults()
{
    $(".searchResultEntry").click(function(event) {
        var v_id = event.currentTarget.id;
        var video = _.findWhere(searchResults, {vid: v_id});
        queueVideo(video);
        $("#collapseSearch").collapse();
        $("#searchResults").children().fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); });
        $("#searchText").val("")
        /* show notification on screen */
    });
}

function deleteFromQueue()
{
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); updateQueueStatus(); });
}

function moveToFront()
{
    var el = $(this).closest(".queueEntry");
    el.fadeOut('slow', function() { $(this).prependTo($(el).parent()).fadeIn('slow'); })
}

function playNow()
{
    var v_id = $(this).closest(".queueEntry").attr('id');
    v_id = v_id.substr(0,v_id.length-6);
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); updateQueueStatus(); });
    player.loadVideoById(v_id);
}

function notify(title)
{
    new PNotify({
        title: 'Video Added',
        text: ("" + title),
        type: 'info',
        delay: 1500
    });
}

var fun_keys = [],
    fun = "38,38,40,40,37,39,37,39,66,65";
$(document)
    .keydown(function (e) {
        fun_keys.push(e.keyCode);
        if (fun_keys.toString()
            .indexOf(fun) >= 0) {
            $(document)
                .unbind('keydown', arguments.callee);
            fun_func()
        }
    });

function fun_func() {
    player.loadVideoById("dQw4w9WgXcQ")
}