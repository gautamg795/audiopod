/*
 * homepage.js
 * used to create a new custom url
 */

 $("#urlButton").click(goToRoom);

 $('#urlText').bind('keypress', function(e) {
	if(e.keyCode==13){
		goToRoom();
	}
});

function goToRoom()
{
	var url = $("#urlText").val() || room_id;
	url = url.trim().replace(/\s+/g, '-').replace(/[^\w-]/g,'').replace(/-+/g, '-').replace(/^-+/g,'').replace(/-+$/g,'').substr(0, 32) || room_id;
	document.location.href = "/" + url + "/host";
}