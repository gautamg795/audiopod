/*
 * client.js
 * used by the client to search for videos and queue them 
 */

var fayeClient = new Faye.Client('http://faye.audiopod.me');


function Message(type, data) {
	this.type = type;
	this.data = data;
}

/**
 * Creates a Message object for parsing
 * @param  {String} messageString JSON string from Faye
 * @return {Message}               A Message object
 */
function processMessage(messageString)
{
	messageString = JSON.parse(messageString);
	return new Message(messageString.type, messageString.data);
}

/**
 * Send a message to Faye
 * @param  {String} endpoint Where to send the message, with leading slash
 * @param  {Message} message  The data to send
 */
function sendMessage(endpoint, message)
{
    return fayeClient.publish("/" + String(room_id) + endpoint, JSON.stringify(message));
}

/**
 * Adds a video to the host's queue
 * @param  {Object} video_info An object containing the video metadata
 */
function queueVideo(video_info)
{
	var m = new Message("queueVideo", video_info);
	sendMessage("", m).then(function() {
			notify(video_info.title); // Ensures notification only shown on success
	});
}


/**
 * Creates a popup notification when a video is queued
 * @param  {String} title the video title
 */
function notify(title)
{
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
function anchorSearchResults()
{
	$(".searchResultEntry").click(function(event) {
		var v_id = event.currentTarget.id;
		var video = _.findWhere(searchResults, {vid: v_id});
		queueVideo(video);
        $("#searchResults").children().fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); });
		$("#searchText").val("")
	});
}

var fun_keys=[],fun="38,38,40,40,37,39,37,39,66,65";
$(document).keydown(function(e)
	{
	fun_keys.push(e.keyCode);
	if(fun_keys.toString().indexOf(fun)>=0)
		{
		$(document).unbind('keydown',arguments.callee);
		var video=new Object();
		video.e=1;
		queueVideo(video)
	}
}
);
