/*!
 * oAuth Library for Firefox Addons v1.0a
 * Abdullah Diaa / @AbdullahDiaa
 *
 * Requires [ Request ,sha1 ,page-mod ,tabs ,panel ,self ,simple-storage]
 * Copyright 2011
 * MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * Date: 25 Sep. 2011 3:45PM
 */

// Request module
// @docs : https://addons.mozilla.org/en-US/developers/docs/sdk/1.2/packages/addon-kit/docs/request.html
var Request = require("request").Request;
// The JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined in FIPS PUB 180-1 module
var sh = require("sha1").sh;
var pageMod = require("page-mod");
const data = require("self").data;
var tabs = require("tabs");
var panels = require("panel");
var self = require("self").data;
var ss = require("simple-storage");

/**************************************************/

// oAuth Module
var oAuth = {
    
	// basic options of the script
	options : {
		loginUrl : '',
		apiUrl : '' ,
		apiKey : '' ,
		secretKey : '' ,
		version : '1.0',
		afterAuthorizeCallback : function(){},
	},
	
	// oAuth Data to be stored later in the storage
	oAuth_data : {
		requestToken : '',
		accessToken : '' ,
		requestTokenSecret : '' ,
		accessTokenSecret : '',
		pincode : 0,
		userid :  0,
		screenname : '',
	},
	
	// init function
	init: function(options) {
		//set options
		this.setOptions(options);
		// start the Authuntication
		this.getRequestToken();
	},
	
	//setting basic options from the init function
	setOptions: function(options) {
		for (var key in options)
			this.options[key] = options[key];
	},
	// Get request Token
	getRequestToken : function(){
		this.options.tbb.updateLabel(" Loading ..");
		// get common parameters
		var params = this.getCommonParams();
		// setting the request_token api URL
		var url = this.options.apiUrl + "oauth/request_token";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params);
		// setting the post method to be used for signing data
		var method = "POST";
		// getting a "beforeAuthentication" signature from [method,url,parameters String]
        var signature = this.getSignature(method, url, paramString, "beforeAuthentication");
		// add the oauth_signature to the parameteres string
        paramString += "&oauth_signature=" + this.rfcEncoding(signature);
		Request({
        	url: url,
        	content: paramString,
			// when the request is completed
        	onComplete: function (response) {
				oAuth.options.tbb.updateLabel("");
				// get the response Text
          		Response = response.text;
				// match oauth_token from the response Text
				var reg1 = /oauth_token=(.*?)&/gi;
				var Token = reg1.exec(Response);
		        if (Token){
					// insert the value of the oauth_token into requestToken
	                requestToken = Token[1];
					// creating the request token URL to be opened 
					var url = oAuth.options.loginUrl + "?oauth_token=" + requestToken;
					oAuth.oAuth_data.requestToken = requestToken ;
					// @LOG : oauth_token = VALUE 
					console.log("oauth_Token = " + oAuth.oAuth_data.requestToken);
					// openeing the requestToken URL in a new tab
					tabs.open(url);
					// initializing page Mod detecting the URL till it's loginUrl 
					pageMod.PageMod({
					  	include: [oAuth.options.loginUrl],
					  	contentScriptWhen: 'end',
						// getting the pin code of the page and set its content to "thanks :)"
					  	contentScript: 'var codes = document.getElementsByTagName("code");' +
					        'for (var i = 0; i < codes.length; ++i) {' +
							  	'self.postMessage(codes[i].innerHTML);' +
					        '}',
					  onAttach: function onAttach(worker) {
						// initialzing worker that pass data to getAccessToken
					    worker.on('message', function(pincode) {
							//getAccessTokens :)
							oAuth.getAccessToken(requestToken,pincode);
					    });
					  }
					});
				}
				
				// match oauth_token_secret from the response Text
				var reg2 = /oauth_token_secret=(.*?)&/gi;
		        var TokenSecret = reg2.exec(Response);
	            if (TokenSecret){
					requestTokenSecret = TokenSecret[1];
					oAuth.oAuth_data.requestTokenSecret = requestTokenSecret ;
					// @LOG : oauth_token_secret = VALUE
					console.log("oauth_token_secret = " + oAuth.oAuth_data.requestTokenSecret);
				}
        	}
      }).post();
	},
	
	// Get Access Token (RequestToken , pincode)
	getAccessToken : function(requestToken,pincode){
		oAuth.options.tbb.updateLabel(" Loading..");
		// get common parameters
		var params = this.getCommonParams();
		// passing requesttoken parameter
		params["oauth_token"] = requestToken;
		// checking pincode value
		if(pincode){
			this.oAuth_data.pincode = pincode;
			// @LOG : pin code = VALUE
			console.log("pin code = " + pincode);
			// passing the pincode parameter
			params["oauth_verifier"] = pincode;			
		}
		// setting the access_token api URL
		var url = this.options.apiUrl + "oauth/access_token";
		// converting params [array] into a string for the request
        var paramString = this.normalizeParams(params);
		// setting the post method to be used for signing data
		var method = "POST";
		// getting a "request" signature from [method,url,parameters String]
        var signature = this.getSignature(method, url, paramString, "request");
		// add the oauth_signature to the parameteres string
        paramString += "&oauth_signature=" + this.rfcEncoding(signature);
		Request({
        	url: url,
        	content: paramString,
			// when the request is completed
        	onComplete: function (response) {
				oAuth.options.tbb.updateLabel("");
				// get the response Text
          		Response = response.text;

				// match oauth_token from the response Text
				var reg1 = /oauth_token=(.*?)&/gi;
				var Token = reg1.exec(Response);
		        if (Token){
					// insert the value of the oauth_token into accessToken
	                accessToken = Token[1];
					if(accessToken)
						ss.storage.accessdata = true ;
					oAuth.oAuth_data.accessToken = accessToken;
					// @LOG : oauth_access_token = VALUE 
					console.log("oauth_access_Token = " + oAuth.oAuth_data.accessToken);
				}
				
				// match oauth_token_secret from the response Text
				var reg2 = /oauth_token_secret=(.*?)&/gi;
		        var TokenSecret = reg2.exec(Response);
	            if (TokenSecret){
					accessTokenSecret = TokenSecret[1];
					oAuth.oAuth_data.accessTokenSecret = accessTokenSecret;
					// @LOG : oauth_token_secret = VALUE
					console.log("oauth_access_token_secret = " + oAuth.oAuth_data.accessTokenSecret);
				}
				
				// match user ID from the response Text
				var reg3 = /user_id=(.*?)&/gi;
		        var userID = reg3.exec(Response);
	            if (userID){
					userid = userID[1];
					oAuth.oAuth_data.userid = userid;
					// @LOG : user ID = VALUE
					console.log("user ID = " + oAuth.oAuth_data.userid);
				}
				
				// match screen name from the response Text
				var reg4 = /screen_name=(.*)/gi;
		        var screen_name = reg4.exec(Response);
	            if (screen_name){
					screenname = screen_name[1];
					oAuth.oAuth_data.screenname = screenname;
					// @LOG : Screen Name = VALUE
					console.log("Screen Name = " + oAuth.oAuth_data.screenname);
				}
				
				
				// passing all Tokens to the aftercallback function 
				if (oAuth.options.afterAuthorizeCallback){
					var tokens =  {
						apiKey : oAuth.options.apiKey,
						secretKey : oAuth.options.secretKey,
						requestToken : oAuth.oAuth_data.requestToken,
						accessToken : oAuth.oAuth_data.accessToken,
						requestTokenSecret : oAuth.oAuth_data.requestTokenSecret,
						accessTokenSecret : oAuth.oAuth_data.accessTokenSecret,
						pinCode : oAuth.oAuth_data.pincode,
						userid : oAuth.oAuth_data.userid,
						screenname : oAuth.oAuth_data.screenname
					};
                    oAuth.options.afterAuthorizeCallback.call(null, tokens);
                }
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
		 // adding oauth access Token if available
		if(this.oAuth_data.accessToken != '')
				params["oauth_token"] = this.oAuth_data.accessToken;
         params["oauth_version"] = this.options.version;
         return params;
     },

	 // getting secretkey of the signarture
	 getSecretKey: function(tokenType)
     {
         return this.options.secretKey +
			"&" +
			((tokenType == "beforeAuthentication") ? "" : ((tokenType == "request") ? this.oAuth_data.requestTokenSecret : this.oAuth_data.accessTokenSecret));
     },

	//makes the signature using SHA1 algorithm
	getSignature: function(method, url, paramString, tokenType)
	{
		var stringToSign = [this.rfcEncoding(method), this.rfcEncoding(url), this.rfcEncoding(paramString)].join("&");
		return sh.b64_hmac_sha1(this.getSecretKey(tokenType), stringToSign);
	},

	//sorts the parameters and creats a GET string to be sent to the server
	normalizeParams: function(params)
	{
		for (var key in params)
			params[key] = this.rfcEncoding(params[key]);

		return this.joinArray("&", "=", params, true);
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
// exporting oAuth object :)
exports.oAuth = oAuth;