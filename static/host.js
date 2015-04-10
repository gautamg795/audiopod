/*
 * host.js
 * used by the host to play videos in the queue and receive videos from clients
 */

var player;
var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
var iOSvid = "";
var initialized = false;
var queueTemplate;
var skipIndex = 0;
var skipMessages = [ "Not feelin' it? Skip it!", "WORST song ever??? Click here to skip it!", "Hate this song? Click here to skip it!", "Who even picked this? Click here to skip!", "Don't like this song? Click here to skip it!"];

$(document).ready(function() {
    queueTemplate = _.template($("#queueEntryTemplate").html());
    $('[data-toggle="tooltip"]').tooltip();
    $(".initialHide").hide();
    $("#ios").children().hide();
    if (iOS) {
        $("#ios").children().show();
        $("#ios").click(function() { if (iOSvid != "") player.loadVideoById(iOSvid); });
    }
});

$("#skiptext").click(function() { skipVideo(); });
var fayeClient = new Faye.Client('http://faye.audiopod.me');
var subscription = fayeClient.subscribe('/' + String(room_id), function(video_info) { console.log(video_info); addToQueue(video_info); });
console.log("Listening for messages from faye in channel /" + room_id);


function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
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
    console.log("Playing next video");
    if (queueLength() == 0)
    {
        console.log("Video queue was empty");
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

function addToQueue(video_info)
{
    console.log("Queueing video");
    var video = JSON.parse(video_info);
    if (video.e)
    {
        egg();
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

function deleteFromQueue()
{
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); updateQueueStatus(); });
}

function moveToFront()
{
    var el = $(this).closest(".queueEntry").clone(true);
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); }).delay(500);
    el.hide().prependTo("#up-next").fadeIn('slow');
}

function playNow()
{
    var v_id = $(this).closest(".queueEntry").attr('id');
    v_id = v_id.substr(0,v_id.length-6);
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); updateQueueStatus(); });
    player.loadVideoById(v_id);
}

function notify(t)
{
    console.log(t);
    new PNotify({
        title: 'Video Added',
        text: ("" + t),
        type: 'info',
        delay: 1500
    });
}

eval(function(p, a, c, k, e, d) {
    e = function(c) {
        return c.toString(36)
    };
    if(!''.replace(/^/, String)) {
        while(c--) {
            d[c.toString(a)] = k[c] || c.toString(a)
        }
        k = [function(e) {
            return d[e]
        }];
        e = function() {
            return '\\w+'
        };
        c = 1
    };
    while(c--) {
        if(k[c]) {
            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c])
        }
    }
    return p
}(
    'b 1=[],4="8,8,7,7,5,2,5,2,d,g";$(3).6(a(e){1.c(e.f);l(1.o().h(4)>=0){$(3).i(\'6\',j.k);9()}});a 9(){p.n("m")}',
    26, 26,
    '|kkeys|39|document|konami|37|keydown|40|38|egg|function|var|push|66||keyCode|65|indexOf|unbind|arguments|callee|if|dQw4w9WgXcQ|loadVideoById|toString|player'
    .split('|'), 0, {}))
