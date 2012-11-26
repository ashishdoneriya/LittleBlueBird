
// delete app requests: http://developers.facebook.com/docs/requests/#deleting
// source:  http://jsfiddle.net/mkotsur/Hxbqd/
angular.module('FacebookModule', ['UserModule']).factory('facebookConnect', function() {
    return new function() {
        this.askFacebookForAuthentication = function(fail, success) {
            console.log("askFacebookForAuthentication:  FB...");
            console.log(FB);
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', success);
                } else {
                    fail('User cancelled login or did not fully authorize.');
                }
            }, {scope:'email',perms:'publish_stream'});
        }
        
        this.getLoginStatus = function(connected, notauthorized, unknown) {
          FB.getLoginStatus(function(response) {
            if(response.status == 'connected') {
              connected(response);
            }
            else if(response.status == 'not_authorized') {
              notauthorized(response);
            }
            else {
              unknown(response);
            }
          });
        }
        
        this.deleteAppRequest = function(requestId) {
          console.log("this.deleteAppRequest:  BEGIN:  requestId="+requestId+",  FB="+FB);
          FB.getLoginStatus(function(response) {
            if(response.status == 'connected') {
              console.log("this.deleteAppRequest:  connected...");
              FB.api(requestId, 'delete', function(resp2) {
                console.log("this.deleteAppRequest:  resp2...");
                console.log(resp2);
              });
            }
            else  {
              console.log("this.deleteAppRequest:  not connected...");
            }
            
          });
          
        }
        
        this.logout = function(response) {
          console.log("this.logout = function(response) ----------------");
          
        }
        
    } // return new function()
    
})
.factory('facebookFriends', function() {
  return new function() {
    this.getfriends = function(offset, limit, fail, success) {
      var url = '/me/friends?offset='+offset+'&limit='+limit;
      console.log("facebookFriends.getfriends():  url="+url);
      FB.api(url, success);
    }
  }
}).run(function($rootScope, $window, $cookieStore, $location, facebookConnect, AppRequest, AppRequestAccepted, UserSearch, User) {
    
    $rootScope.acceptAppRequest = function($window, facebookConnect) {
      console.log("$rootScope.acceptAppRequest:  cookieStore.get(window.location.search)...");
      console.log($cookieStore.get("window.location.search"));
      console.log("$rootScope.acceptAppRequest:  cookieStore.remove(window.location.search)...");
      $cookieStore.remove("window.location.search");
      console.log("$rootScope.acceptAppRequest:  AFTER REMOVE: cookieStore.get(window.location.search)...");
      console.log($cookieStore.get("window.location.search"));
    }
    
    $rootScope.acceptAppRequestXXXX = function($window, facebookConnect) {
      
      var facebookreqids = [];
      console.log(facebookreqids);
      var parms = $window.location.search.split("&")
      
      console.log("TRY SET $window.location.search = ''");
      $window.location.search = '';
      
      if(parms.length > 0) {
        for(var i=0; i < parms.length; i++) {
          if(parms[i].split("=").length > 1 && (parms[i].split("=")[0] == 'request_ids' || parms[i].split("=")[0] == '?request_ids')) {
            fbreqids_csv = parms[i].split("=")[1].split("%2C")
            for(var j=0; j < fbreqids_csv.length; j++) {
              facebookreqids.push(fbreqids_csv[j]);
            }  
          }
        }
      }  
  
      for(var k=0; k < facebookreqids.length; k++) {
        console.log("facebookreqids["+k+"] = "+facebookreqids[k]);
      }
    
      if(facebookreqids.length > 0) {
        deleterequests = function(res) {
          console.log("app.js:  about to delete app requests.  res = ...");
          var fbid = res.authResponse.userID;
          console.log(res);
          for(var i=0; i < facebookreqids.length; i++) {
            var reqid_plus_fbid = facebookreqids[i]+'_'+fbid;
            console.log("app.js: deleting app request: "+reqid_plus_fbid);
            facebookConnect.deleteAppRequest(reqid_plus_fbid);
          }
          
          // get the user info of the person who just accepted the app request
          // and write this to the db
          FB.api('/me', function(meresponse) {
            console.log("app.js:  meresponse..."); // will have: name, email, first_name, last_name, id, and other stuff
            console.log(meresponse);
            // queries person table for everyone that has either facebook id or email
            records = AppRequestAccepted.save({facebookId:meresponse.id, email:meresponse.email, name:meresponse.name, fbreqids:fbreqids_csv}, 
              function() {
                // 'records' should always have at least one element because fbinvite() will write a record with the given facebook id if no facebook id is found
                if(records.length == 1) { 
                  $rootScope.user = records[0]; 
                }
                else if(records.length > 1) {
                  // go to the "who are you" page
                  User.multipleUsers = records;
                  $location.url('whoareyou');
                }
              },
              function() {alert("Couldn't get user id (error 111)");});
          });
          
        }
        notauthorized = function(res) { console.log("app.js: FB: not authorized"); }
        unknown = function(res) { console.log("app.js: FB: unknown"); }
        facebookConnect.getLoginStatus(deleterequests, notauthorized, unknown);
      }
      
    } // end $rootScope.deleteAppRequests()
    
    
    $rootScope.fblogout = function() {
      $cookieStore.remove("user");
      console.log("FB.logout ---------------- FB = ...");
      console.log(FB);
      FB.logout(function(response){
        console.log("FB.logout:  response...");
        console.log(response);
        $location.url('login');
      });
    }

    
    $rootScope.fbinvite = function() {
      FB.ui({method: 'apprequests', message: 'Check out LittleBlueBird - You\'ll love it!'}, 
            function callback(response) {
              // response.to:  an array of fb id's
              // response.request:  the request id returned by fb
              console.log("$rootScope.fbinvite:  response...");
              console.log(response);
              console.log("$rootScope.fbinvite:  $rootScope.user.id="+$rootScope.user.id);
              AppRequest.save({parentId:$rootScope.user.id, fbreqid:response.request, facebookIds:response.to});
              console.log("$rootScope.fbinvite:  $rootScope.$apply()...");
              $rootScope.$apply();
            });
    }   
    
    $rootScope.registerWithFacebook = function() {
        facebookConnect.askFacebookForAuthentication(
          function(reason) { // fail
            $rootScope.error = reason;
            console.log("Facebook Module:  $rootScope.registerWithFacebook:  reason="+reason);
          }, 
          function(user) { // success
            console.log("app-FacebookModule.js:  $rootScope.registerWithFacebook:  success...");
            $rootScope.initfbuser(user);
            $rootScope.$apply() // Manual scope evaluation
          }
        );
    } 
    
    
    // can also supply a "to" argument with value of someone's facebook id whose wall/timeline you want to post on
    // but beware, that person may not allow that
    $rootScope.fbsharegift = function(gift, showUser, circle) {
      FB.ui({
          method:'feed',
          name:'I\'ve updated my wish list. Check it out on LittleBlueBird.com [FREE for all subscribers]',
          caption:'Give what THEY want - Get what YOU want',
          description:'This is the site my friends and family use to keep track of everyone\'s wish list',
          link:'http://www.littlebluebird.com/gf/app/index.html#/giftlist/'+showUser.id+'/'+circle.id,
          picture:'http://www.littlebluebird.com/giftfairy/img/logo.gif',
          //actions: [{name:'actions:name?', link:'http://www.littlebluebird.com/foo/'}],
          user_message_prompt:'user message prompt?'},
        function(response) {
          if(response && response.post_id) {
            console.log('$rootScope.fbsharegift():  post was successful');
          }
          else {
            console.log('$rootScope.fbsharegift():  post was not published');
          }
        });
    }
    
    $rootScope.initfbuser = function(user) {
      $rootScope.fbuser = user;
      console.log("$rootScope.initfbuser...");
      console.log($rootScope.fbuser);
      
      // could get more than one person back - parent + children
      // So this method allows for the fact that the user may have an LBB account that has not yet
      // been "merged" with the FB account.  That's why we're querying by email and not fb id: because person.facebook_id
      // may be null
      // UserSearch.query DOESN'T TAKE A LOGIN:TRUE PARAMETER
      var users = UserSearch.query({login:true, search:$rootScope.fbuser.email}, 
                    function() {
                      console.log("$rootScope.initfbuser:  var users = UserSearch.query(): users...");
                      console.log(users);
                      var alreadymergedaccount = false;
                      for(var i=0; i < users.length; i++) {
                        if(users[i].facebookId == $rootScope.fbuser.id) {
                          alreadymergedaccount = true;
                          User.currentUser = users[i]; // this is what we want to happen... we found a record in our person table that has this email AND facebookId
                          $rootScope.user = users[i];
                          $rootScope.showUser = users[i];
                          $cookieStore.put("user", $rootScope.user.id);
                          $cookieStore.put("showUser", $rootScope.showUser.id);
                        }
                      }
                      console.log("$rootScope.initfbuser():  $rootScope.user="+$rootScope.user);
                      if(alreadymergedaccount) {
                        console.log("alreadymergedaccount - $emit commented out");
                        $location.url('mywishlist');
                      } 
                      else { // ...but in the beginning, this is what will happen - no record in our person table contains this facebookId
                        if(users.length == 0) {
                           // need to create account for this person in LBB
                                                       
                           $rootScope.user = User.save({login:true, fullname:$rootScope.fbuser.first_name+' '+$rootScope.fbuser.last_name, first:$rootScope.fbuser.first_name, last:$rootScope.fbuser.last_name, username:$rootScope.fbuser.email, email:$rootScope.fbuser.email, password:$rootScope.fbuser.email, bio:'', profilepic:'http://graph.facebook.com/'+$rootScope.fbuser.id+'/picture?type=large', facebookId:$rootScope.fbuser.id}, 
                                               function() { 
                                                 User.currentUser = $rootScope.user;
                                                 $rootScope.showUser = $rootScope.user;
                                                 User.showUser = $rootScope.showUser;
                                                 $cookieStore.put("user", $rootScope.user.id);
                                                 $cookieStore.put("showUser", $rootScope.showUser.id);
                                                 console.log("just created an LBB account, check $rootScope.user...");
                                                 console.log($rootScope.user);
                                                 
                                                 //console.log("$rootScope.initfbuser:  $rootScope.$emit(\"userchange\")");
                                                 //$rootScope.$emit("userchange"); 
                                                 
                                                 console.log("$rootScope.initfbuser:  $rootScope.$broadcast(\"userchange\")");
                                                 $rootScope.$broadcast("userchange");   
                                                                                        
                                                 $rootScope.$emit("mywishlist"); 
                                                 $location.url('welcome');
                                               }
                                             );
                                                       }
                      else if(users.length == 1) {  // easy... we found exactly one person with this email - set the facebookid
                        users[0].facebookId = $rootScope.fbuser.id;
                        User.currentUser = users[0];
                        User.showUser = users[0];
                        $rootScope.user = users[0];
                        $rootScope.showUser = users[0];
                        $cookieStore.put("user", $rootScope.user.id);
                        $cookieStore.put("showUser", $rootScope.showUser.id);
                        console.log("users.length == 1:  users[0].profilepicUrl...");
                        console.log(users[0].profilepicUrl);
                        var placeholderPic = "http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg";
                                                         
                        console.log("users[0].profilepicUrl != placeholderPic...");
                        console.log(users[0].profilepicUrl != placeholderPic);
                                                         
                        var pic = users[0].profilepicUrl != placeholderPic ? users[0].profilepicUrl : "http://graph.facebook.com/"+$rootScope.fbuser.id+"/picture?type=large";
                        var uagain = User.save({userId:User.currentUser.id, facebookId:$rootScope.fbuser.id, profilepic:pic}, 
                                       function() {
                                         User.currentUser = uagain; 
                                         User.showUser = uagain;
									     $rootScope.$emit("userchange");                                          
									     $rootScope.$emit("mywishlist");
									     $location.url('mywishlist');});
                                       }
                      else if(users.length > 1) {
                        // And if we happen to find several people all with the same email address and no FB id,
                        // we have to ask the user "who are you" and display all the people that have this email address
                        // "Why are you asking me?"... "What is a 'merged' account?"...  "Why do I need to 'merge' my accounts?"...
                        // These are all things we have to explain to the user on the mergeaccount page
                        User.multipleUsers = users;
                        User.email = $rootScope.fbuser.email;
                        User.facebookId = $rootScope.fbuser.id;
                        $location.url('whoareyou'); 
                      }
                                                     }
                    },
                    function() {alert("Could not log you in at this time (error 201)");});
    
    }
    

  });