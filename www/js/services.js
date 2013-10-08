// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};

  
var app = angular.module('project', ['ngResource', 'User', 'Email', 'Gift', 'Circle', 'CircleParticipant']).
  config(function($locationProvider){ 
    $locationProvider.hashPrefix('#').html5Mode(false);
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
  }).
  factory('Password', function($resource) {
      var Password = $resource('http://www.littlebluebird.com/gf/rest/password/:userId/:currentpass/:newpass', {userId:'@userId', currentpass:'@currentpass', newpass:'@newpass'}, 
                    {
                      check: {method:'GET', isArray:false},
                      reset: {method:'POST'}
                    });

      return Password;
  }).
  factory('Friend', function($resource) {
      var Friend = $resource('http://www.littlebluebird.com/gf/rest/friend/:userId/:friendId', {userId:'@userId', friendId:'@friendId'},
                    {
                      delete: {method:'DELETE'}
                    });
      return Friend;
  }).
  factory('UPC', function($resource) {
      var UPC = $resource('http://www.littlebluebird.com/gf/rest/barcode/:code', {code:'@code'},
                    {
                      lookup: {method:'GET', isArray:false}
                    });
      return UPC;
  }).
  factory('Version', function($resource) {
      var Version = $resource('http://www.littlebluebird.com/gf/rest/version', {},
                    {
                      query: {method:'GET', isArray:false}
                    });
      return Version;
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