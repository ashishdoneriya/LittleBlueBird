
angular.module('UserModule', ['ngResource', 'ngCookies', 'ui', 'angularBootstrap.modal']).
  factory('UserSearch', function($resource) {
      var UserSearch = $resource('/gf/usersearch', {search:'@search'}, 
                    {
                      query: {method:'GET', isArray:true}
                    });

      return UserSearch;
  }).
  factory('User', function($resource) {
      var User = $resource('/gf/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', friends:'@friends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('AppRequest', function($resource){
      var AppRequest = $resource('/gf/apprequest', {requests:'@requests'}, 
                       {
                         save: {method:'POST', isArray:true}
                       });
      return AppRequest;
  }).
  factory('AppRequestAccepted', function($resource){
      var AppRequestAccepted = $resource('/gf/apprequestaccepted/:facebookId/:name', {facebookId:'@facebookId', email:'@email', name:'@name', fbreqids:'@fbreqids'}, 
                       {
                         save: {method:'POST', isArray:true}
                       });
      return AppRequestAccepted;
  }).
  factory('Logout', function($resource) {
      var Logout = $resource('/gf/logout', {}, {logout: {method:'POST'}});
      return Logout;
  }).
  factory('Reminder', function($resource) {
      var Reminder = $resource('/gf/reminders/:circleId', {circleId:'@circleId', userId:'@userId', remind_date:'@remind_date', people:'@people'},
                     {
                       query: {method:'GET', isArray:true},
                       delete: {method:'DELETE'},
                       save: {method:'POST', isArray:true}
                     });
                     
      return Reminder;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('/gf/gifts/:giftId/:updater', {giftId:'@giftId', updater:'@updater', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId', receivedate:'@receivedate'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'},
                    });

      return Gift;
  }).
  factory('Email', function($resource) {
      var Email = $resource('/gf/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', type:'@type', user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  })
  .factory('dimAdjuster', function() {
    var obj = {};
    
    obj.adjustedwidth = function(auser, limit) {
      if(!angular.isDefined(auser))
        return -1;
      var image = new Image();
      image.src = auser.profilepicUrl;
      var mindim = image.height < image.width ? image.height : image.width;
      if(auser.fullname == 'Eric Moore') {console.log(auser); console.log("mindim: "+mindim);}
      var ratio = mindim > limit ? limit / mindim : 1;
      if(auser.fullname == 'Eric Moore') console.log("ratio: "+ratio);
      var adj = ratio * image.width;
      if(auser.fullname == 'Eric Moore') console.log("adj: "+adj);
      return adj;
    };
    
    obj.adjustedheight = function(auser, limit) {
      if(!angular.isDefined(auser))
        return -1;
      var image = new Image();
      image.src = auser.profilepicUrl;
      var mindim = image.height < image.width ? image.height : image.width;
      var ratio = mindim > limit ? limit / mindim : 1;
      var adj = ratio * image.height;
      return adj;
    }; // obj.adjustHeight
    
    return obj;
  })
  .directive('btnEditCircle', function(){
      return {
        scope: false,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('friendStuff', function(){
      return {
        replace: false,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('btnAddCircle', function(){
      return {
        restrict: 'E',
        replace: true,
        transclude: false,
           controller: CircleCtrl,
        scope: false,
     templateUrl: 'templates/ddbtn-addcircle.html',
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('giftActions', function(){
      return {
        // The linking function will add behavior to the template
        link: function(scope, element, attrs) {
           $('.dropdown-toggle').dropdown();
        }
      }
  })
  .directive('searchUsers', function(){
      return {
        scope:false,
        // The linking function will add behavior to the template
        link: function(scope, element, attrs, controller) {
           element.bind("keyup", 
             function() {
               scope.query(scope.search);
             }
           );
        }
      }
  })
  .run(function($rootScope, $location, UserSearch) {

    $rootScope.usersearch = '';
    $rootScope.people = [];
  
    $rootScope.query = function(sss) {
      console.log("app-UserModule: rootScope.query() -----------------------");
      $rootScope.usersearch = 'loading';
      var lbbpeople = UserSearch.query({search:sss}, 
                      function() {
                        $rootScope.usersearch = 'loaded'; 
                        $rootScope.people.splice(0, $rootScope.people.length); // effectively refreshes the people list
                        
                        // uncomment for facebook integration
                        //for(var i=0; i < $rootScope.user.friends.length; i++) {
                        //  if(!lbbNamesContainFbName(lbbpeople, $rootScope.user.friends[i].fullname))
                        //    $rootScope.people.push($rootScope.user.friends[i]);
                        //}
                        for(var i=0; i < lbbpeople.length; i++) {
                          $rootScope.people.push(lbbpeople[i]);
                        }
                        $rootScope.noonefound = $rootScope.people.length==0 ? true : false; 
                      }, 
                      function() {$rootScope.people.splice(0, $rootScope.people.length);$rootScope.usersearch = '';}
                    );
    };
    
  });
