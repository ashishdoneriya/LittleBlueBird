// 2013-05-31: Site doesn't run in IE when the js debugger is off because (I think) console.log is undefined
// This fixes that I hope.  See http://www.sitepoint.com/forums/showthread.php?575320-how-not-to-let-console-log%28%29-to-cause-error-on-IE-or-other-browsers
var debugging = true;//false; // true sends console.log() stuff to the console. false means that stuff won't appear in the console
if (typeof console == "undefined") var console = { log: function() {} };
else if (!debugging || typeof console.log == "undefined") console.log = function() {};



// 2013-07-23  $location is causing problems with jquery mobile: the browser back button stops working.  I think all links/routing stopped working.
//function LbbController($scope, Email, $rootScope, User, $location) {



// 2013-07-23  weird syntax needed for minification
var LbbController = ['$scope', 'Email', '$rootScope', 'User', 'Gift', 'Password', 'FacebookUser', 'MergeUsers', 'Circle', 'CircleParticipant', 'Reminder', 'Friend', 'UPC', // MUST END WITH A COMMA !
function($scope, Email, $rootScope, User, Gift, Password, FacebookUser, MergeUsers, Circle, CircleParticipant, Reminder, Friend, UPC) {

  $scope.footermenu = '';
  $scope.eventfilter = 'current';