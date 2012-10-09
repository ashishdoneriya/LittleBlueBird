
function FacebookFriendsCtrl($scope, $cookieStore, facebookFriends) {

  $scope.userId = $cookieStore.get("userId");

  $scope.fbid = $cookieStore.get("fbid");
  
  $scope.foocookie_func = function() {return $cookieStore.get("foocookie");}
  
  $scope.foocookie = $cookieStore.get("foocookie");
  
  $scope.setcookie = function(xxx) {
    $cookieStore.put("foocookie", xxx);
  }
}