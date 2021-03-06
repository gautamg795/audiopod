/*
 * search.js
 * handles searching and stores results in searchResults var
 */
var compiledTemplate;
$(document).ready(function() {
    compiledTemplate = _.template($("#searchResultsTemplate").html());
});
var searchResults = [];
$("#searchButton").click(function() { search(); });

$('#searchText').bind('keypress', function(e) {
	if(e.keyCode==13){
		search();
	}
});


var search = function(){ console.log("Attempt to search before API was ready"); };
	

function onClientLoad(){
	console.log("onClientLoad called");
	gapi.client.setApiKey('AIzaSyBO6rT1hTjzEYWmVI2g7IqK_8I_0ZC5J7c');
	gapi.client.load('youtube', 'v3', function(){
		search = function () {
				var query = $("#searchText").val();
				if (query == "")
				{
			        $("#searchResults").children().fadeOut(500, function() { $(this).remove(); });
			        return;
				}
				var videoid = query.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				if (videoid) {
					var request = gapi.client.youtube.search.list({
						q: videoid,
						part: 'snippet',
						maxResults: 10,
						type: "video"
					});
					request.execute(addByUrl);

					return;
				}
				var request = gapi.client.youtube.search.list({
					q: query, 
					part: 'snippet',
					maxResults: 10,
					type: "video"
				});
				request.execute(onSearchResponse);
					}
				});
		// document.getElementById('response').value += '1';
}

function addByUrl(response){
	console.log(response);
	searchResults = []; // clear old results
	var resArray = response.result.items;
	var idx;
	for (idx = 0; idx < resArray.length; idx++)
	{
		var video = new Object();
		video.vid = resArray[idx].id.videoId;
		video.title = resArray[idx].snippet.title;
		video.thumbnail = resArray[idx].snippet.thumbnails.medium.url;
		video.author = resArray[idx].snippet.channelTitle;
		video.description = resArray[idx].snippet.description;
		searchResults.push(video);
	}
	if (searchResults.length == 0)
	{
		var result = "<div class='alert alert-warning' role='alert'>Sorry, no results were found.</div>";
		$("#searchResults").empty();
		$(result).hide().appendTo("#searchResults").fadeIn(1000);
		return;
	}
	queueVideo(searchResults[0]);
	$("#searchText").val("")
}

function onSearchResponse(response){
	console.log(response);
	searchResults = []; // clear old results
	var resArray = response.result.items;
	var idx;
	for (idx = 0; idx < resArray.length; idx++)
	{
		var video = new Object();
		video.vid = resArray[idx].id.videoId;
		video.title = resArray[idx].snippet.title;
		video.thumbnail = resArray[idx].snippet.thumbnails.medium.url;
		video.author = resArray[idx].snippet.channelTitle;
		video.description = resArray[idx].snippet.description;
		searchResults.push(video);
	}
	if (searchResults.length == 0)
	{
		var result = "<div class='alert alert-warning' role='alert'>Sorry, no results were found.</div>";
		$("#searchResults").empty();
		$(result).hide().appendTo("#searchResults").fadeIn(1000);
		return;
	}
	var context = {videos : searchResults};
	$("#searchResults").empty();
	var result = compiledTemplate(context);
	$("#collapseSearch").collapse();
	$(result).hide().appendTo("#searchResults").fadeIn(1000);
	anchorSearchResults();
}