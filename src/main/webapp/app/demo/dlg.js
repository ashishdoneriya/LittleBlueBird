
angular.module('dialog-demo', [])
  .directive('dialog', function() {
    return {
      scope: 'isolate',
      locals: {
          header: 'bind', 
          show: 'prop',
          close: 'exp',
          primary: 'exp'
      },
      templateUrl: 'dialog.html',
      transclude: true
    };
  });


function DialogCtrl($scope) {
  $scope.title = 'Modal header';
  $scope.body = "<p>One fine body…</p>"
}