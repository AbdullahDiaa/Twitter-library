/*!
 * Twitter Library
 * Abdullah Diaa / @AbdullahDiaa
 *
 * Requires [ Request ,sha1 ,simple-storage]
 * Copyright 2011
 * MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * Date: 24 Oct. 2011 8:26PM
 */

// Request module
// @docs : https://addons.mozilla.org/en-US/developers/docs/sdk/1.2/packages/addon-kit/docs/request.html
var Request = require("request").Request;
// The JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS PUB 180-1 module
var sh = require("sha1").sh;
var ss = require("simple-storage");

// Twitter Module
var Twitter = {
    
	// basic options of the script
	options : {
		loginUrl : "http://api.twitter.com/oauth/authorize",
		apiUrl : "http://api.twitter.com/",
		version : "1.0",
		afterAuthorizeCallback : function(){},
	},

	//setting basic options from the init function
	setOptions: function() {
		options = {
			apiKey : ss.storage.twitter['apiKey'],
			secretKey : ss.storage.twitter['secretKey'],
			requestToken : ss.storage.twitter['requestToken'],
			accessToken : ss.storage.twitter['accessToken'],
			requestTokenSecret : ss.storage.twitter['requestTokenSecret'],
			accessTokenSecret : ss.storage.twitter['accessTokenSecret'],
			pinCode : ss.storage.twitter['pinCode'],
			userid : ss.storage.twitter['userid'],
			screenname : ss.storage.twitter['screenname'],
			https : ss.storage.twitter['https'],
		};
		for (var key in options)
			this.options[key] = options[key];
	},
	
	// check if "HTTPS ONLY" enabled from user settings
	https: function (callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		// URL to get settings data of the user
		var url =  "https://api.twitter.com/1/account/settings.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		var oAuthHeader = this.normalizeParams(params,true);
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		Request({
			url: url,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},
	
	// verifying twitter credentials on the fly 
	verify: function (callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		// URL to get settings data of the user
		var url =  "https://api.twitter.com/1/account/verify_credentials.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		var oAuthHeader = this.normalizeParams(params,true);
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		Request({
			url: url,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.text);
			}
		}).get();
	},	
	
	//getting usertimeline
	usertimeline: function (count ,since_id ,max_id ,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['count'] = count;
		params['include_rts'] = true ;
		params['include_entities'] = true ;
		if(since_id)
			params['since_id'] = since_id;
		if(max_id != '')
			params['max_id'] = max_id;			
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/statuses/home_timeline.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			count : count,
			include_rts : true ,
			include_entities  :true,
		};
		if(since_id)
			contentData['since_id'] = since_id;
		if(max_id != '')
			contentData['max_id'] = max_id;
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},
	
	//getting mentions
	mentions: function (count ,since_id ,max_id,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['count'] = count;
		params['include_rts'] = true ;
		params['include_entities'] = false ;
		if(since_id)
			params['since_id'] = since_id;
		if(max_id != '')
			params['max_id'] = max_id;
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/statuses/mentions.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			count : count,
			include_rts : true ,
			include_entities  :false,
		};
		if(since_id)
			contentData['since_id'] = since_id;
		if(max_id != '')
			contentData['max_id'] = max_id;
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},
	//getting mentions
	list: function (list_id , slug ,since_id ,max_id,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['list_id'] = list_id;
		if(since_id)
			params['since_id'] = since_id;
		params['slug'] = slug;
		if(max_id != '')
			params['max_id'] = max_id;
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/lists/statuses.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			list_id : list_id
		};
		if(since_id)
			contentData['since_id'] = since_id;
		contentData['slug'] = slug;
		if(max_id != '')
			contentData['max_id'] = max_id;
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},

	//getting mentions
	lists: function (screen_name,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['screen_name'] = screen_name;
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/lists/all.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			screen_name : screen_name
		};
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},
	
	//getting mentions
	messages: function (count ,since_id ,max_id,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['count'] = count;
		params['include_rts'] = true ;
		params['include_entities'] = false ;
		if(since_id)
			params['since_id'] = since_id;
		if(max_id != '')
			params['max_id'] = max_id;
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/direct_messages.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			count : count,
			include_rts : true ,
			include_entities  :false,
		};
		if(since_id)
			contentData['since_id'] = since_id;
		if(max_id != '')
			contentData['max_id'] = max_id;
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},
	
	//getting mentions
	fav: function (count ,since_id ,max_id,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['count'] = count;
		params['include_rts'] = true ;
		params['include_entities'] = false ;
		if(since_id)
			params['since_id'] = since_id;
		if(max_id != '')
			params['max_id'] = max_id;
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/favorites.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			count : count,
			include_rts : true ,
			include_entities  :false,
		};
		if(since_id)
			contentData['since_id'] = since_id;
		if(max_id != '')
			contentData['max_id'] = max_id;
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},
	
	profile: function (count ,since_id ,max_id,callback) {
		// setting Twitter newly stored options
		this.setOptions();
		// get common parameters
		var params = this.getCommonParams();
		var oAuthHeader = this.normalizeParams(params,true);
		params['count'] = count;
		params['include_rts'] = true ;
		params['include_entities'] = false ;
		if(since_id)
			params['since_id'] = since_id;
		if(max_id != '')
			params['max_id'] = max_id;
		// URL to get settings data of the user
		var url =  this.options.https + "api.twitter.com/1/statuses/user_timeline.json";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params,false);
		// setting the post method to be used for signing data
		var method = "GET";
		var signature = this.getSignature(method, url, paramString, "access");
		// setting oAuth Header Data
		oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
		var contentData = 	{
			count : count,
			include_rts : true ,
			include_entities  :false,
		};
		if(since_id)
			contentData['since_id'] = since_id;
		if(max_id != '')
			contentData['max_id'] = max_id;
		Request({
			url: url,
			content : contentData,
			headers: {
				Authorization : "OAuth "+ oAuthHeader
			},
			onComplete: function (response) {
				callback(response.json);
			}
		}).get();
	},	
	
	/* 
	Retweet
	params => Status ID , callback function [optional]
	*/
	rt_tweet: function (status_id , callback) {
			// setting Twitter newly stored options
			this.setOptions();
			// get common parameters
			var params = this.getCommonParams();
			var oAuthHeader = this.normalizeParams(params,true);
			params['id'] = status_id;
			// URL to retweet the tweet 
			var url =   this.options.https + "api.twitter.com/1/statuses/retweet/" + status_id +".json";
			var paramString = this.normalizeParams(params,false);
			// setting the post method to be used for signing data
			var method = "POST";
			var signature = this.getSignature(method, url, paramString, "access");
			// setting oAuth Header Data
			oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
			// setting content data of the request
			var contentData = 	{
				id : status_id
			};
			// initializing the request
	      	Request({
			        url: url,
					content : contentData,
					headers: {
						Authorization : "OAuth "+ oAuthHeader
					},
			        onComplete: function (response) {
						callback(response.json);
					}
			      }).post();
	  },
	
	/* 
	Delete
	params => Status ID , callback function [optional]
	*/
	del_tweet: function (status_id , callback) {
			// setting Twitter newly stored options
			this.setOptions();
			// get common parameters
			var params = this.getCommonParams();
			var oAuthHeader = this.normalizeParams(params,true);
			params['id'] = status_id;
			// URL to retweet the tweet 
			var url =   this.options.https + "api.twitter.com/1/statuses/destroy.json";
			var paramString = this.normalizeParams(params,false);
			// setting the post method to be used for signing data
			var method = "POST";
			var signature = this.getSignature(method, url, paramString, "access");
			// setting oAuth Header Data
			oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
			// setting content data of the request
			var contentData = 	{
				id : status_id
			};
			// initializing the request
	      	Request({
			        url: url,
					content : contentData,
					headers: {
						Authorization : "OAuth "+ oAuthHeader
					},
			        onComplete: function (response) {
						callback(response.json);
					}
			      }).post();
	  },
	/* 
	Fav A tweet
	params => Status ID , callback function [optional]
	*/
	fav_tweet: function (status_id , fav_status, callback) {
			// setting Twitter newly stored options
			this.setOptions();
			// get common parameters
			var params = this.getCommonParams();
			var oAuthHeader = this.normalizeParams(params,true);
			params['id'] = status_id;
			// URL to create/destroy Favorite
			if(fav_status) 
				var url =   this.options.https + "api.twitter.com/1/favorites/create/" + status_id +".json";
			else
				var url =   this.options.https + "api.twitter.com/1/favorites/destroy/" + status_id +".json";
			var paramString = this.normalizeParams(params,false);
			// setting the post method to be used for signing data
			var method = "POST";
			var signature = this.getSignature(method, url, paramString, "access");
			// setting oAuth Header Data
			oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
			// setting content data of the request
			var contentData = 	{
				id : status_id
			};
			// initializing the request
	      	Request({
			        url: url,
					content : contentData,
					headers: {
						Authorization : "OAuth "+ oAuthHeader
					},
			        onComplete: function (response) {
						callback(response.json);
					}
			      }).post();
	  },
	/* 
	Update A tweet
	*/
	update_tweet: function (status , in_reply_to_status_id , callback) {
			// setting Twitter newly stored options
			this.setOptions();
			// get common parameters
			var params = this.getCommonParams();
			var oAuthHeader = this.normalizeParams(params,true);
			if(in_reply_to_status_id != '')
				params['in_reply_to_status_id'] = in_reply_to_status_id;
			params['include_entities'] = true ;
			params['status'] = status;
			// URL to create/destroy Favorite
			var url =   this.options.https + "api.twitter.com/1/statuses/update.json";
			var paramString = this.normalizeParams(params,false);
			// setting the post method to be used for signing data
			var method = "POST";
			var signature = this.getSignature(method, url, paramString, "access");
			// setting oAuth Header Data
			oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
			// setting content data of the request			
			var contentData = 	{
				include_entities : true ,
				status : status
			};
			if(in_reply_to_status_id != '')
				contentData['in_reply_to_status_id'] = in_reply_to_status_id;
			// initializing the request
	      	Request({
			        url: url,
					content : contentData,
					headers: {
						Authorization : "OAuth "+ oAuthHeader
					},
			        onComplete: function (response) {
						callback(response.json);
					}
			      }).post();
	  },	
	/* 
	Update A tweet
	*/
	update_dm: function (status , screen_name , callback) {
			// setting Twitter newly stored options
			this.setOptions();
			// get common parameters
			var params = this.getCommonParams();
			var oAuthHeader = this.normalizeParams(params,true);
			params['screen_name'] = screen_name  ;
			params['text'] = status;
			// URL to create/destroy Favorite
			var url =   this.options.https + "api.twitter.com/1/direct_messages/new.json";
			var paramString = this.normalizeParams(params,false);
			// setting the post method to be used for signing data
			var method = "POST";
			var signature = this.getSignature(method, url, paramString, "access");
			// setting oAuth Header Data
			oAuthHeader += '",oauth_signature="' + this.rfcEncoding(signature) + '"';
			// setting content data of the request
			var contentData = 	{
				screen_name : screen_name ,
				text : status
			};
			// initializing the request
	      	Request({
			        url: url,
					content : contentData,
					headers: {
						Authorization : "OAuth "+ oAuthHeader
					},
			        onComplete: function (response) {
						callback(response.json);
					}
			      }).post();
	  },
	// converting paramerters array into string
	getParamString: function(params){
		var arr = [], i = 0;
        for (var key in params)
			arr[i++] = key + "=" + params[key];
        return arr.join("&");
	},
	
	//encodes the special characters according to the RFC standard
	rfcEncoding: function(str)
     {
         var tmp = encodeURIComponent(str);
         tmp = tmp.replace('!', '%21');
         tmp = tmp.replace('*', '%2A');
         tmp = tmp.replace('(', '%28');
         tmp = tmp.replace(')', '%29');
         tmp = tmp.replace("'", '%27');
         return tmp;
     },

	//assigns the common parameters for all requests
	getCommonParams: function(params)
     {
         params = params || [];
         params["oauth_consumer_key"] = this.options.apiKey;
         params["oauth_nonce"] = (new Date()).getTime();
         params["oauth_signature_method"] = "HMAC-SHA1";
         params["oauth_timestamp"] = Math.ceil((new Date()).getTime() / 1000);
		 params["oauth_token"] = this.options.accessToken;
         params["oauth_version"] = this.options.version;
         return params;
     },

	 // getting secretkey of the signarture
	 getSecretKey: function(tokenType)
     {
         return this.options.secretKey +
			"&" +
			((tokenType == "beforeAuthentication") ? "" : ((tokenType == "request") ? this.options.requestTokenSecret : this.options.accessTokenSecret));
     },

	//makes the signature using SHA1 algorithm
	getSignature: function(method, url, paramString, tokenType)
	{
		var stringToSign = [this.rfcEncoding(method), this.rfcEncoding(url), this.rfcEncoding(paramString)].join("&");
		return sh.b64_hmac_sha1(this.getSecretKey(tokenType), stringToSign);
	},

	//sorts the parameters and creats a GET string to be sent to the server
     normalizeParams: function(params,header)
     {
         for (var key in params)
             params[key] = this.rfcEncoding(params[key]);
		// checking if the string for Header
		return (header) ? this.joinArray('",', '="', params, true) : this.joinArray("&", "=", params, true);
     },

	// join & = 
	joinArray: function(separator1, separator2, arr, sort)
	{
		var arrKeys = [];
		// pushing parameteres into arrKeys
		for (var key in arr)
			arrKeys.push(key);

		// sorting array for the request
		if (sort)
			arrKeys.sort();

		var newArr = [];
		for (var i = 0; i < arrKeys.length; i++){
			if (separator2 != ""){
				newArr.push(arrKeys[i] + separator2 + arr[arrKeys[i]]);
			}else{
				newArr.push(arrKeys[i]);
				newArr.push(arr[arrKeys[i]]);
			}
		}
		// return a string of array [key = value] items joined by &
		return newArr.join(separator1);
	}
};
// exporting Twitter object :)
exports.Twitter = Twitter;