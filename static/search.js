// function showResponse(response){
// 	var responseString = JSON.stringify(response, '', 2);
// 	document.getElementById('response').innerHTML +=responseString;
// }
$("#searchButton").click(function() { search(); });
var search = function(){ console.log("Attempt to search before API was ready"); };
	

function onClientLoad(){
	console.log("onClientLoad called");
	gapi.client.setApiKey('AIzaSyBO6rT1hTjzEYWmVI2g7IqK_8I_0ZC5J7c');
	gapi.client.load('youtube', 'v3', function(){
		search = function () {
				var toSearch;
				toSearch = document.getElementById("songtext").value;
				var request = gapi.client.youtube.search.list({
					q: toSearch , 
					part: 'snippet'
				});
				request.execute();
					}
				});
		// document.getElementById('response').value += '1';
}
function onSearchResponse(response){
//we have response as the youtube response
//we need video id, thumbnail
document.getElementById('testtext').value= "yup";
//document.getElementById('testtext').value = response;
}