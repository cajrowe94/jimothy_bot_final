var imageAPI = 'http://api.duckduckgo.com/?q='; //duck duck go image search url
var addtoUrl = '&format=json'; //add this to end of URL to format into json

var getJSON = require('get-json'); //module for loading json
const download = require('image-downloader'); //download images with link
var fs = require('fs'); //file system module
var unirest = require('unirest');

var b64content; //media variable to change

var imagePic;

var userNames = []; //holds chosen user
var bannerURL; //holds banner url of user
var laTrends = []; //trends in los angeles array
var chosenTrend;
var chosenPic;
var chosenNews;
var prevNews;
var pics = []; //array to hold fetched images
var news = [];
var formattedNews;
var finalNews;

var randomExp = [
	'wow',
	'thats crazy',
	'cant believe that happened',
	'can you believe this?',
	'get outta here!',
	'i would have loved to see that',
	'this is why i love that guy',
	'get a load of this!',
	'seriously??',
	'omg what',
	'blew my mind for real',
	'insane if you ask me',
	'ohhhhhhhh',
	'lol',
	'???? jeez',
	'still tryna believe this',
	'LOL',
	'absolutely incredible',
	'gnarly af',
	'frickin cray',
	'bruh no lol',
	'please tell me this isnt real!',
	'thatll do i guess',
	'wasnt what i expected honestly',
	'say what??',
	'CRAZY!',
	'thats enough of that'
];

var woeIds = [
	'2442047', //LA
	'2379574', //Chicago
	'2514815' //D.C.
];

/*----------------------------------------------------------------*/
/*------------------INITIALIZE CONNECTION WITH API----------------*/
/*----------------------------------------------------------------*/
console.log("THE BOT IS STARTING.");
//import the twit package
var Twit  = require('twit');
//make a new Twit object with API keys
var T = new Twit({
  consumer_key:         'CysQ4rrHhg3hOkTF23zNi5VZg',
  consumer_secret:      '6roeJT2zJ1GdfQ3MBNZSKr1qIjZx2ny2nzeHxndYphJg53qtzz',
  access_token:         '992233978470989825-TnejKIKEKMDpHiuxQn6csmxuzrPKcBj',
  access_token_secret:  'HFiphXmsHStN7ND1p1nYQvtIhtycWwQD2sslz9leSjruz',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})
/*----------------------------------------------------------------*/
/*-----------------------MAIN WORKING AREA------------------------*/
/*----------------------------------------------------------------*/
populateTrends(woeIds[getRandomInt(0, woeIds.length-1)]); //populate trends array
setInterval(function(){
	getTrends(woeIds[getRandomInt(0, woeIds.length-1)]); //get trends every ___ seconds
	console.log("\n********");
	console.log(chosenTrend);
	console.log("********\n");
}, 10000);
/*----------------------------------------------------------------*/
/*------------------------GET TOP 50 TRENDS-----------------------*/
/*----------------------------------------------------------------*/

function populateTrends(woeID){
	T.get('trends/place', {id: woeID}, function (err, data, response) { //get trends with WOEID of Los Angeles
		    if (err) console.log(err);
				else var tweets = data;

		    JSON.stringify(tweets, undefined, 2); //if you dont do this it will look like ----> [Object]
		    laTrends = tweets[0].trends; //give the top 50 trends to laTrends var

		    chosenTrend = laTrends[getRandomInt(0, laTrends.length-1)].name;
		    while(chosenTrend.substring(0, 1) == '#'){ //keep choosing one until it doesn't contain a hashtag
					chosenTrend = laTrends[getRandomInt(0, laTrends.length-1)].name;
				}
			console.log(chosenTrend);
			getnewImage(chosenTrend);
	});

}
/*----------------------------------------------------------------*/
/*------------------------GET TOP 50 TRENDS-----------------------*/
/*----------------------------------------------------------------*/
function getTrends(woeID){
	T.get('trends/place', {id: woeID}, function (err, data, response) { //get trends with WOEID of Los Angeles
		    var tweets = data; //assign received data into tweets var
		    JSON.stringify(tweets, undefined, 2); //if you dont do this it will look like ----> [Object]
		    laTrends = tweets[0].trends; //give the top 50 trends to laTrends var

		    chosenTrend = laTrends[getRandomInt(0, laTrends.length-1)].name;
		    while(chosenTrend.substring(0, 1) == '#'){ //keep choosing one until it doesn't contain a hashtag
				chosenTrend = laTrends[getRandomInt(0, laTrends.length-1)].name;
			}
			searchThis(chosenTrend, 10);
	});
}
/*----------------------------------------------------------------*/
/*-----------------------POST A MEDIA TWEET-----------------------*/
/*----------------------------------------------------------------*/

function tweetThisMedia(text){ //posts a tweet with media attached
b64content = fs.readFileSync('images/trendPic.jpg', { encoding: 'base64' });
// first we must post the media to Twitter
T.post('media/upload', { media_data: b64content }, function (err, data, response) {
  // now we can assign alt text to the media, for use by screen readers and
  // other text-based presentations and interpreters
  var mediaIdStr = data.media_id_string
  var altText = "Yo banner done been dithered";
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

  T.post('media/metadata/create', meta_params, function (err, data, response) {
    if (!err) {
      // now we can reference the media and post a tweet (media will attach to the tweet)
      var params = { status: text, media_ids: [mediaIdStr] }

      T.post('statuses/update', params, function (err, data, response) {
        //console.log(data);
      });
    }
  })
})
}
/*----------------------------------------------------------------*/
/*-----------------------DOWNLOAD AN IMAGE------------------------*/
/*----------------------------------------------------------------*/
function saveImage(imageURL){ //send function an image URL
	const options = {
		url: imageURL,
		dest: 'images/trendPic.jpg'} //path to save the image

	download.image(options)
	  .then(({ filename, image }) => {
	    console.log('File saved to', filename);
	    tweetThisMedia(userNames[getRandomInt(0, userNames.length-1)] + " " + formattedNews.replace("<b>", "") + '... ' + randomExp[getRandomInt(0, randomExp.length-1)] + ' #' + chosenTrend.replace(" ", ""));
	  })
	  .catch((err) => {
	    console.error(err)
	  })
}
/*----------------------------------------------------------------*/
/*---------------------------NEWS SEARCH--------------------------*/
/*----------------------------------------------------------------*/
function getNews(term){
	unirest.get("https://contextualwebsearch-websearch-v1.p.mashape.com/api/Search/NewsSearchAPI?count=50&q="+term+"&autocorrect=true")
	.header("X-Mashape-Key", "squIunOAmNmsh4W7HduHeUTxjtgCp10N0KnjsnEOfdX7ZUzakS")
	.header("X-Mashape-Host", "contextualwebsearch-websearch-v1.p.mashape.com")
	.end(function (result) {
		news = result.body.value;
		chosenNews = news[getRandomInt(0, news.length-1)].title;
		formattedNews = chosenNews.replace("</b>", "");
	});
	saveImage(chosenPic);
}
/*----------------------------------------------------------------*/
/*---------------------------IMAGE SEARCH-------------------------*/
/*----------------------------------------------------------------*/
function getnewImage(term){
	unirest.get("https://contextualwebsearch-websearch-v1.p.mashape.com/api/Search/ImageSearchAPI?count=50&q=" + term + "&autoCorrect=false")
	.header("X-Mashape-Key", "squIunOAmNmsh4W7HduHeUTxjtgCp10N0KnjsnEOfdX7ZUzakS")
	.header("X-Mashape-Host", "contextualwebsearch-websearch-v1.p.mashape.com")
	.end(function (result) {
	  pics = result.body.value;
	  chosenPic = pics[getRandomInt(0, pics.length-1)].url;
	  getNews(chosenTrend);
	});


}
/*----------------------------------------------------------------*/
/*-----------------------SEARCH FOR TWEETS------------------------*/
/*----------------------------------------------------------------*/
function searchThis(keyword, num){ //parameters for the searchable keyword and how many you want printed
	var term = keyword; //assign params to local variables
	var number = num;

	var params = {
		q: term, //what do you want to search for? just a keyword, or keyword + date
		count: number //how many tweets do you want returned?
	}

	T.get('search/tweets', params, gotData); //get request for retrieving data

	function gotData(err, data, response) { //once the data has got gotted, run this function

		if (userNames.length > 5) userNames = [];

		var tweets = data.statuses; //collect all the statuses in the returned JSON
		for (var i = 0; i < tweets.length; i++){
			var newString = ''; //string to hold the removed username

			if (tweets[i].text.includes('@')){ //probe the tweets for usernames
				var n = tweets[i].text.indexOf('@'); //get index of the @

				while (tweets[i].text.substring(n, n+1) != " " && tweets[i].text.substring(n, n+1) != ":"){ //add to the new string until you hit a space
						newString+=tweets[i].text.substring(n, n+1);
						n++;
				}
			}
			if(newString.substring(0, 1) == '@'){
				userNames.push(newString);
			}
			}
		}
		getnewImage(chosenTrend);
}
/*----------------------------------------------------------------*/
/*----------------------------POST A TWEET------------------------*/
/*----------------------------------------------------------------*/
function tweetThis(text){ //call this function to tweet anything
	var tweet = text; //assign parameter to tweet var

	var tweetText = {
		status: tweet
	}

	T.post('statuses/update', tweetText, postData); //use the .post function to send out tweet

	function postData(err, data, response){ //callback function
		err ? console.log(err) : console.log("Sucessfully tweeted."+'\n'+"Tweet: "+tweetText.status+'\n'+"-------------");
	};
}
/*----------------------------------------------------------------*/
/*----------------------------RANDOM FUNCTIONS--------------------*/
/*----------------------------------------------------------------*/
function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max){
    return Math.random() * (max - min) + min;
}
