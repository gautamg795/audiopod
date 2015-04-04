/*
 * client.js
 * used by the client to search for videos and queue them 
 */

 var prefix = "mediabox_";
 var PUBNUB = PUBNUB.init({
 	publish_key: 'pub-c-41b0baa3-2397-4bcd-a6bf-b84e2eed005c',
 	subscribe_key: 'sub-c-28a59964-da96-11e4-81e6-0619f8945a4f'
 });

 function queueVideo(vid)
 {
 	PUBNUB.publish({
 		channel: String(prefix + room_id),
 		message: vid,
 		error: function (error) {
      		// Handle error here
      		console.log(JSON.stringify(error));
  		}
	});
	console.log("Published video with id " + vid);
}