// function showResponse(response){
// 	var responseString = JSON.stringify(response, '', 2);
// 	document.getElementById('response').innerHTML +=responseString;
// }

var search = function(){ };
	

function onClientLoad(){
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