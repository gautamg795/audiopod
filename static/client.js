/*
 * client.js
 * used by the client to search for videos and queue them
 */

var fayeClient = new Faye.Client('http://faye.audiopod.me');
var subscription = fayeClient.subscribe("/" + String(room_id) + "/queueData", messageReceived);
subscription.then(function() {
	refreshQueue();
});
var queueTemplate;


function Message(type, data) {
    this.type = type;
    this.data = data;
}

/* Page init code */
$(document).ready(function() {
    queueTemplate = _.template($("#queueEntryTemplate").html());
    updateQueueStatus();
    $("#refreshQueue").click(refreshQueue);
});


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

function messageReceived(m) {
	var message = processMessage(m);
	if (message.type == "queueData")
		return processQueueData(message.data.queue);
	else if (message.type == "queueAdd")
		return queueAdd(message.data);
	else if (message.type == "queueRemove")
		return queueRemove(message.data);
	else if (message.type == "queueFront")
		return queueFront(message.data);
}

/**
 * Adds a video to the host's queue
 * @param  {Object} video_info An object containing the video metadata
 */
function queueVideo(video_info) {
    var m = new Message("queueVideo", video_info);
    sendMessage("", m).then(function() {
        notify(video_info.title); // Ensures notification only shown on success
    });
}


/**
 * Creates a popup notification when a video is queued
 * @param  {String} title the video title
 */
function notify(title) {
    new PNotify({
        title: 'Success',
        text: ('"' + title + '" queued'),
        type: 'info',
        delay: 1500
    });
}

/**
 * Makes the search results clickable and binds the click handler to them.
 */
function anchorSearchResults() {
    $(".searchResultEntry").click(function(event) {
        var v_id = event.currentTarget.id;
        var video = _.findWhere(searchResults, {
            vid: v_id
        });
        queueVideo(video);
        $("#searchResults").children().fadeTo('slow', 0).slideUp(500, function() {
            $(this).remove();
        });
        $("#searchText").val("")
    });
}

/**
 * Gets the length of the queue
 * @return {Integer} length of queue
 */
function queueLength() {
    return $("#up-next").children().length - $("#queueEmpty").length;
}

/**
 * If the queue is empty, push an "empty queue" message in there and vice versa
 */
function updateQueueStatus() {
    var message = "<div class='list-group-item alert alert-info' role='alert' id='queueEmpty'>The queue is empty. Search for a song above!</div>"
    if ($("#queueEmpty").length) {
        if (queueLength() != 0)
            $("#queueEmpty").remove();
    } else if (queueLength() == 0)
        $("#up-next").append(message).slideDown('slow');
}

/**
 * Callback for when we receive queueData from host
 * @param  {Array} qd Array of Objects containing the video metadata
 */
function processQueueData(qd) {
    if (function() {
        if (qd.length == queueLength()) {
            var c = $("#up-next").children();
            for (var i = 0; i < qd.length; i++)
                if (qd[i].vid != c.eq(i).attr('id').slice(0, -6))
                    return false;
        } else
            return false;
        return true;
    }())
        return; // Return if the queue hasn't changed
	if (queueLength() > 0) {
		$("#up-next").children().fadeOut('slow', 0).slideUp(200, function() {
		    $(this).remove();
		    updateQueueStatus();
		});
	}
	qd.forEach(function(video) {
		$(queueTemplate({
		    video: video
		})).hide().appendTo("#up-next").fadeIn('slow');
	});
	updateQueueStatus();
}

/**
 * Callback for when host adds video to queue
 * @param  {Object} video Object containing video metadata
 */
function queueAdd(video) {
    $(queueTemplate({
        video: video
    })).hide().appendTo("#up-next").fadeIn('slow', function() {
        updateQueueStatus();
    });
}

/**
 * Callback for when host removes video from queue (or plays a video)
 * @param  {String} vid video id to remove
 */
function queueRemove(vid) {
	var el = $("#" + vid);
	if (!el.length)
		return;
	el.fadeTo('slow', 0).slideUp(500, function() {
        $(this).remove();
        updateQueueStatus();
    });
}

/**
 * Callback for when host moves video to front of queue
 * @param  {String} vid video id to move
 */
function queueFront(vid) {
	var el = $("#" + vid);
	if (!el.length)
		return refreshQueue();
	el.fadeOut('slow', function() {
	    $(this).prependTo($(el).parent()).fadeIn('slow');
	    updateQueueStatus();
	})
}

/**
 * Asks the queue for freshest queue data (and used by the refresh button)
 */
function refreshQueue() {
	var msg = new Message("queueRequest", null);
	sendMessage("", msg);
}

var fun_keys = [],
    fun = "38,38,40,40,37,39,37,39,66,65";
$(document).keydown(function(e) {
    fun_keys.push(e.keyCode);
    if (fun_keys.toString().indexOf(fun) >= 0) {
        $(document).unbind('keydown', arguments.callee);
        var video = new Object();
        video.e = 1;
        video.title = "Rick Astley - Never Gonna Give You Up";
        queueVideo(video);
    }
});