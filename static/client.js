/*
 * client.js
 * used by the client to search for videos and queue them 
 */

 var prefix = "mediabox_";
 var PUBNUB = PUBNUB.init({
 	publish_key: 'pub-c-460998f3-52f6-48f8-86c4-dfdb714a892e',
 	subscribe_key: 'sub-c-a3abf0ce-dbcf-11e4-bb6f-0619f8945a4f'
 });

 $(document).load(function(){
    if (youtube_id != null)
    {

        queueVideo(youtube_id);
        notify(youtube_id);
        window.setTimeout(
            // waits 3 seconds and then goes to client page
            function(){
                window.location.href='audiopid.me/room_id';
            }, 3000);
        
    }
});

 function queueVideo(video_info)
 {
 	PUBNUB.publish({
 		channel: String(prefix + room_id),
 		message: video_info,
 		error: function (error) {
      		// Handle error here
      		console.log(JSON.stringify(error));
  		}
	});
	console.log(video_info);
}

function notify(t)
{
	console.log(t);
	new PNotify({
		title: 'Success',
		text: ('"' + t + '" queued'),
		type: 'info',
		delay: 1500
	});
}

function anchorSearchResults()
{
	$(".searchResultEntry").click(function(event) {
		var v_id = event.currentTarget.id;
		var video = _.findWhere(searchResults, {vid: v_id});
		queueVideo(JSON.stringify(video));
		notify(video.title);
        $("#searchResults").children().fadeTo('slow', 0).slideUp(500, function() { $(this).remove(); });
		$("#searchText").val("")
		/* show notification on screen */
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
    '8 3=[],6="b,b,9,9,5,a,5,a,c,d";$(4).7(f(e){3.j(e.h);i(3.g().s(6)>=0){$(4).k(\'7\',q.r);8 2=p o();2.e=1;l(m.n(2))}});',
    29, 29,
    '||video|kkeys|document|37|konami|keydown|var|40|39|38|66|65||function|toString|keyCode|if|push|unbind|queueVideo|JSON|stringify|Object|new|arguments|callee|indexOf'
    .split('|'), 0, {}))