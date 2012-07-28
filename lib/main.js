/*!
 * Twitter Library for Firefox Addons v1.0a
 * Abdullah Diaa / @AbdullahDiaa
 *
 * Copyright 2012
 * MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * Date: 28 July 2012 3:30PM
 */

exports.main = function(options) {
	 const 	ss = require("simple-storage"),
			data = require("self").data,
			{Cc,Ci,Cu} = require("chrome"),
			oAuth = require("oAuth").oAuth,	
			tbb = require("toolbarbutton"),
			Twitter = require("Twitter").Twitter,
			panels = require("panel"),
			tabs = require("tabs");
			
	//updating SSL staus everytime when the addon is being loaded
	if(ss.storage.twitter){
		Twitter.https(function(data){
			// if "HTTPS ONLY" is enabled
			if(data.always_use_https){
				ss.storage.twitter['https'] = "https://";
				// @LOG : HTTPS enabled
				console.log("HTTPS enabled");
			}else{
				ss.storage.twitter['https'] = "http://";
				// @LOG : HTTPS disabled
				console.log("HTTPS disabled");
			}
		});
		//latest since_id for uptodate requests
		ss.storage.since_id = {};
		
		ss.storage.hashtags = [];
		sql.execute("select hashtag from hashtags;",function(result,status){
		  for(var i=0;i<result.rows;i++){
		    for(var j=0;j<result.cols;j++){
				ss.storage.hashtags.push("#" + result.data[i][j]);
		    }
		  }
		});
		sql.execute("select mention from mentions;",function(result,status){
		  for(var i=0;i<result.rows;i++){
		    for(var j=0;j<result.cols;j++){
				ss.storage.hashtags.push("@" + result.data[i][j]);
		    }
		  }
		});
	}
	
	// insert the twitter Toolbar Button in the nav bar before the Home button with "TwitterPanel" associated
    // Create Twitter Toolbar Button
	let toolbarbutton = tbb.ToolbarButton({
		id: "twitter-toolbarbutton",
		label: "",
		alwaysShowLabel: true,
		title: "Twitter",
		image: data.url("twitter-icon.png"),
		onCommand: function () {
        // check if twitter oAuth data is stored locally 
    	if(!ss.storage.twitter){
			// if not stored => initialze the oAuth library to get data and store it in the simple-storage
			oAuth.init({
                tbb : toolbarbutton,
				loginUrl : "https://api.twitter.com/oauth/authorize",
				apiUrl : "https://api.twitter.com/",
				apiKey : "",
				secretKey : "",
				afterAuthorizeCallback : function(data){
					// after authorization get the data and store it in the "twitter" object in simple-storage
					ss.storage.twitter = {};
					ss.storage.twitter['apiKey'] = data.apiKey;
					ss.storage.twitter['secretKey'] = data.secretKey;
					ss.storage.twitter['requestToken'] = data.requestToken;
					ss.storage.twitter['accessToken'] = data.accessToken;
					ss.storage.twitter['requestTokenSecret'] = data.requestTokenSecret;
					ss.storage.twitter['accessTokenSecret'] = data.accessTokenSecret;
					ss.storage.twitter['pinCode'] = data.pinCode;
					ss.storage.twitter['userid'] = data.userid;
					ss.storage.twitter['screenname'] = data.screenname;
					ss.storage.twitter['refresh_first_time'] = true;
					//Default Settings
					ss.storage.twitter.settings = {};
					//ss.storage.twitter.settings[''] = ;
					
					// @LOG : Quota Usage = VALUE
					console.log("Quota Usage = " + ss.quotaUsage);
					
					// check for SSL if always enabled or not from settings
					Twitter.https(function(data){
						// if "HTTPS ONLY" is enabled
						if(data.always_use_https){
							ss.storage.twitter['https'] = "https://";
							// @LOG : HTTPS enabled
							console.log("HTTPS enabled");
						}else{
							ss.storage.twitter['https'] = "http://";
							// @LOG : HTTPS disabled
							console.log("HTTPS disabled");
						}
					});
				}
			});
		}
		if(ss.storage.twitter['refresh_first_time']){
			TwitterPanel.postMessage("postAllMessages");
			ss.storage.twitter['refresh_first_time'] = false;
		}
		}
	});
	toolbarbutton.moveTo({
		toolbarID: "nav-bar",
		forceMove: true
	});
    
	// setting userChrome.css to change label CSS in the toolbar button
    let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
            .getService(Ci.nsIStyleSheetService);
    let ios = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService);
    let chromeStylesheet = data.url("chrome.css");
    let chromeStylesheetUri = ios.newURI(chromeStylesheet, null, null);
    sss.loadAndRegisterSheet(chromeStylesheetUri, sss.AGENT_SHEET);
};

// remove data on uninstall
exports.onUnload = function (reason) {
    //var ss = require("simple-storage");
    //ss.storage.twitter = null;
	//ss.storage.since_id = {};
	//ss.storage.hashtags = [];
    //console.log(ss.storage.twitter);
};