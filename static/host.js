/*
 * host.js
 * used by the host to play videos in the queue and receive videos from clients
 */

/* Set up Faye */
var fayeClient = new Faye.Client('http://faye.audiopod.me');
var subscription = fayeClient.subscribe('/' + String(room_id), messageReceived)
subscription.then(function() {
    console.log("Listening for messages in channel /" + room_id);
});
var queueSubscription = fayeClient.subscribe('/' + String(room_id) + "/queueData", messageReceived)
queueSubscription.then(function() {
    sendMessage("", new Message("queueRequest", null));
});

/* Global variables */
var player;
var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
var iOSvid = "";
var initialized = false;
var queueTemplate;
var skipIndex = 0;
var skipMessages = ["Not feelin' it? Skip it!", "WORST song ever??? Click here to skip it!", "Hate this song? Click here to skip it!", "Who even picked this? Click here to skip!", "Don't like this song? Click here to skip it!"];
var uuid = guid();



function Message(type, data) {
    this.type = type;
    this.data = data;
}

/**
 * Creates a Message object for parsing
 * @param  {String} messageString JSON string from Faye
 * @return {Message}               A Message object
 */
function processMessage(messageString) {
    messageString = JSON.parse(messageString);
    return new Message(messageString.type, messageString.data);
}

/**
 * Send a message to Faye
 * @param  {String} endpoint Where to send the message, with leading slash
 * @param  {Message} message  The data to send
 */
function sendMessage(endpoint, message) {
    return fayeClient.publish("/" + String(room_id) + endpoint, JSON.stringify(message));
}

/**
 * Callback for Faye when a message is received
 * @param  {String} m Raw JSON string from Faye
 */
function messageReceived(m) {
    var message = processMessage(m);
    if (message.type == "queueVideo")
        return queueVideo(message.data);
    if (message.type == "queueRequest")
        return queueRequest();
    if (message.type == "queueData")
        return checkHost(message.data.sender);
}


/* Page init code */
$(document).ready(function() {
    queueTemplate = _.template($("#queueEntryTemplate").html());
    $('[data-toggle="tooltip"]').tooltip();
    $(".initialHide").hide();
    $("#ios").children().hide();
    if (iOS) {
        $("#ios").children().show();
        $("#ios").click(function() {
            if (iOSvid != "") player.loadVideoById(iOSvid);
        });
    }
    $("#skiptext").click(skipVideo);
});




/* Callback for when YT API is ready */
function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        playerVars: {
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

/* YT Player calls these two functions as necessary */
function onVideoError(event) {
    console.log("Error");
    player.stopVideo(); // in case this is the last video in the queue
    playNextVideo();
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        // Video ended
        playNextVideo();
    }
    if (event.data === 1)
    // Video started playing
        updateNowPlaying();
}


/**
 * Show the YT Player if it is still hidden
 */
function initIfNeeded() {
    if (!initialized) {
        initialized = true;
        $(".initialHide").show();
    }
}

/**
 * Find the next video in the queue and play it
 */
function playNextVideo() {
    initIfNeeded();
    if (queueLength() == 0) {
        return;
    }
    var vid = $("#up-next").children().first().attr('id').slice(0, -6);
    $("#up-next").children().first().fadeTo('slow', 0).slideUp(500, function() {
        $(this).remove();
        updateQueueStatus();
    });
    iOSvid = vid;
    player.loadVideoById(vid);
}

/**
 * Make sure that we are the only host
 * @param  {String} id UUID from the incoming ping
 */
function checkHost(id) {
    if (id == uuid)
    // Wait 3 seconds -- maybe someone else's ping is still incoming
        setTimeout(function() {
        queueSubscription.cancel();
    }, 8000);
    else if (id < uuid) {
        alert("Looks like someone's already hosting in this audiopod. Sending you back to the guest page!");
        window.location.replace("../");
    }
}

/**
 * Gets the length of the queue
 * @return {Integer} length of queue
 */
function queueLength() {
    return $("#up-next").children().length - $("#queueEmpty").length;
}

/**
 * Incoming request for the queue from a client
 * Send back a message with appropriate data
 */
function queueRequest() {
    var queue = [];
    if (queueLength())
        $("#up-next").children().each(function() {
            queue.push($(this).attr('id').slice(0, -6))
        });
    var m = new Message("queueData", {
        sender: uuid,
        queue: queue
    });
    sendMessage("/queueData", m);
}

/**
 * Add a video to the queue manually or by callback
 * @param  {Object} video Object containing video metadata
 */
function queueVideo(video) {
    if (video.e) {
        fun_func();
        return;
    }
    notify(video.title);
    var state = player.getPlayerState();
    if ($("#queueEmpty").length && (state == -1 || state == 5 || state == 0)) {
        initIfNeeded();
        player.loadVideoById(video.vid);
        return;
    }
    $(queueTemplate({
        video: video
    })).hide().appendTo("#up-next").fadeIn('slow');
    $(".deletebutton").click(deleteFromQueue);
    $(".nextbutton").click(moveToFront);
    $(".nowbutton").click(playNow);
    updateQueueStatus();
}

/**
 * Callback for the skip button
 */
function skipVideo() {
    player.stopVideo(); // in case this is the last video in the queue
    playNextVideo();
    if (skipIndex == skipMessages.length)
        skipIndex = 0;
    $("#skiptext").fadeOut('slow', function() {
        $(this).html(skipMessages[skipIndex]);
    }).fadeIn('slow');
    skipIndex++;
}

/**
 * If the queue is empty, push an "empty queue" message in there and vice versa
 */
function updateQueueStatus() {
    var message = "<div class='list-group-item alert alert-info' role='alert' id='queueEmpty'>Your queue is empty! Search for a song, or send your friends to audiopod.me/" + room_id + "</div>"
    if ($("#queueEmpty").length) {
        if (queueLength() != 0)
            $("#queueEmpty").remove();
    } else if (queueLength() == 0)
        $("#up-next").append(message).slideDown('slow');
}

/**
 * Update the now playing text at the top of the screen
 */
function updateNowPlaying() {
    var message = 'Now Playing: "<%= video_name %>"';
    message = _.template(message);
    message = message({
        video_name: player.getVideoData().title
    });
    if ($("#nowPlaying").text() == message)
        return;
    $('#nowPlaying').animate({
        'opacity': 0
    }, 500, function() {
        $(this).text(message);
    }).animate({
        'opacity': 1
    }, 500);
}

/**
 * Makes the search results clickable and binds the click handler to them
 */
function anchorSearchResults() {
    $(".searchResultEntry").click(function(event) {
        var v_id = event.currentTarget.id;
        var video = _.findWhere(searchResults, {
            vid: v_id
        });
        queueVideo(video);
        $("#collapseSearch").collapse();
        $("#searchResults").children().fadeTo('slow', 0).slideUp(500, function() {
            $(this).remove();
        });
        $("#searchText").val("")
    });
}

/**
 * Callback for the Remove button
 */
function deleteFromQueue() {
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() {
        $(this).remove();
        updateQueueStatus();
    });
}

/**
 * Callback for the Play Next button
 */
function moveToFront() {
    var el = $(this).closest(".queueEntry");
    el.fadeOut('slow', function() {
        $(this).prependTo($(el).parent()).fadeIn('slow');
    })
}

/**
 * Callback for the Play Now button
 */
function playNow() {
    var v_id = $(this).closest(".queueEntry").attr('id');
    v_id = v_id.substr(0, v_id.length - 6);
    $(this).closest(".queueEntry").fadeTo('slow', 0).slideUp(500, function() {
        $(this).remove();
        updateQueueStatus();
    });
    player.loadVideoById(v_id);
}

/**
 * Creates a popup notification when a video is queued
 * @param  {String} title The video title
 */
function notify(title) {
    new PNotify({
        title: 'Video Added',
        text: ("" + title),
        type: 'info',
        delay: 1500
    });
}

/**
 * Creates a random UUID string
 * @return {String} UUID
 */
function guid() {
    if (!Date.now) {
        Date.now = function() {
            return new Date().getTime();
        }
    }
    return Date.now();
}

var fun_keys = [],
    fun = "38,38,40,40,37,39,37,39,66,65";
$(document)
    .keydown(function(e) {
        fun_keys.push(e.keyCode);
        if (fun_keys.toString()
            .indexOf(fun) >= 0) {
            $(document)
                .unbind('keydown', arguments.callee);
            fun_func()
        }
    });

function fun_func() {
    initIfNeeded();
    player.loadVideoById("dQw4w9WgXcQ")
}