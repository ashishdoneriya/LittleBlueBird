// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};

  
var app = angular.module('project', ['ngResource']).
  config(function($locationProvider){ 
    $locationProvider.hashPrefix('#').html5Mode(false);
  }).
  factory('User', function($resource) {
      var User = $resource('http://www.littlebluebird.com/gf/rest/users/:userId', {userId:'@userId', fullname:'@fullname', first:'@first', last:'@last', email:'@email', username:'@username', 
                                                 password:'@password', dateOfBirth:'@dateOfBirth', bio:'@bio', profilepic:'@profilepic', login:'@login', 
                                                 creatorId:'@creatorId', creatorName:'@creatorName', facebookId:'@facebookId', friends:'@friends', lbbfriends:'@lbbfriends',
                                                 notifyonaddtoevent:'@notifyonaddtoevent', notifyondeletegift:'@notifyondeletegift', 
                                                 notifyoneditgift:'@notifyoneditgift', notifyonreturngift:'@notifyonreturngift'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      find: {method:'GET', isArray:false}, 
                      save: {method:'POST'}
                    });

      return User;
  }).
  factory('FacebookUser', function($resource) {
      var FacebookUser = $resource('http://www.littlebluebird.com/gf/rest/fb/:facebookId/:email/:first/:last', {facebookId:'@facebookId', email:'@email', first:'@first', last:'#last'}, 
                    {
                      findOrCreate: {method:'GET', isArray:true}
                    });

      return FacebookUser;
  }).
  factory('MergeUsers', function($resource){
      var MergeUsers = $resource('http://www.littlebluebird.com/gf/rest/mergeusers/:userId/:facebookId/:email', {userId:'@userId', facebookId:'@facebookId', email:'@email'}, 
                       {
                         save: {method:'POST', isArray:false}
                       });
      return MergeUsers;
  })
.factory('Circle', function($resource) {
      var Circle = $resource('http://www.littlebluebird.com/gf/rest/circles/:circleId', {circleId:'@circleId', circleType:'@circleType', name:'@name', expirationdate:'@expirationdate', creatorId:'@creatorId', participants:'@participants', datedeleted:'@datedeleted'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      activeEvents: {method:'GET', isArray:true}, 
                      expiredEvents: {method:'GET', isArray:true},
                      save: {method:'POST'}
                    });
      console.log("CircleModule:  created Circle factory");              
      return Circle;
  })
.factory('CircleParticipant', function($resource) {
      var CircleParticipant = $resource('http://www.littlebluebird.com/gf/rest/circleparticipants/:circleId', {circleId:'@circleId', userId:'@userId', inviterId:'@inviterId', 
                                         participationLevel:'@participationLevel', who:'@who', email:'@email', circle:'@circle', adder:'@adder',
                                         notifyonaddtoevent:'@notifyonaddtoevent'}, 
                    {
                      query: {method:'GET', isArray:false}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'}
                    });

      return CircleParticipant;
  }).
  factory('Reminder', function($resource) {
      var Reminder = $resource('http://www.littlebluebird.com/gf/rest/reminders/:circleId', {circleId:'@circleId', userId:'@userId', remind_date:'@remind_date', people:'@people'},
                     {
                       query: {method:'GET', isArray:true},
                       delete: {method:'DELETE'},
                       save: {method:'POST', isArray:true}
                     });
                     
      return Reminder;
  }).
  factory('Password', function($resource) {
      var Password = $resource('http://www.littlebluebird.com/gf/rest/password/:userId/:currentpass/:newpass', {userId:'@userId', currentpass:'@currentpass', newpass:'@newpass'}, 
                    {
                      check: {method:'GET', isArray:false},
                      reset: {method:'POST'}
                    });

      return Password;
  }).
  factory('Email', function($resource) {
      var Email = $resource('http://www.littlebluebird.com/gf/rest/email', {to:'@to', from:'@from', subject:'@subject', message:'@message', type:'@type', user:'@user'}, 
                    {
                      send: {method:'POST'}
                    });

      return Email;
  }).
  factory('Gift', function($resource) {
      var Gift = $resource('http://www.littlebluebird.com/gf/rest/gifts/:giftId/:updater', {giftId:'@giftId', updater:'@updater', viewerId:'@viewerId', recipientId:'@recipientId', recipients:'@recipients', circleId:'@circleId', description:'@description', url:'@url', addedBy:'@addedBy', status:'@status', senderId:'@senderId', senderName:'@senderName', reallyWants:'@reallyWants', deleted:'@deleted', urlAff:'@urlAff', affiliateId:'@affiliateId', receivedate:'@receivedate'}, 
                    {
                      query: {method:'GET', isArray:true}, 
                      delete: {method:'DELETE'},
                      save: {method:'POST'},
                    });

      return Gift;
  });
  
  
app.directive('jqueryMobileTpl', function () {
    return {
        link: function (scope, elm, attr) {
            //elm.trigger('create');
        }
    };
});
app.directive('repeatDone', function () {
    return function (scope, element, attrs) {
        // When the last element is rendered
        if (scope.$last) { 
            element.parent().parent().trigger('create');
        }
    }
});