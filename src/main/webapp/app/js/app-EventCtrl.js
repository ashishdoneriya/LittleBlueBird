
function EventCtrl($rootScope, $scope) {

  $rootScope.activeitem = 'events';
  
  $scope.newcircleFunction = function(thetype, limit) {
    console.log("EventCtrl: $scope.newcircleFunction() --------------------------------");
  }
}