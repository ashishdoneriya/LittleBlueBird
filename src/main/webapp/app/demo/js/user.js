
function UserCatCtrl($route) {
  var self = this;

  $route.when('/users',
              {template: 'partials/user-list.html',   controller: UserListCtrl});
  $route.when('/register',
              {template: 'partials/register.html',   controller: UserListCtrl});
  $route.when('/users/:userId',
              {template: 'partials/user-detail.html', controller: UserDetailCtrl});
  $route.otherwise({redirectTo: '/', controller: UserCatCtrl});

  $route.onChange(function(){
    self.params = $route.current.params;
  });

  $route.parent(this);
}

//UserCatCtrl.$inject = ['$route'];


function UserCtrl(User_) {
  var scope = this;
 
  scope.newUser = function() {
    User_.save({first:scope.first, last:scope.last, username:scope.username, email:scope.email, password:scope.password, bio:scope.bio, dateOfBirth:scope.dateOfBirth});
    scope.users = User_.query();
  }
} 
  
  //UserCtrl.$inject = ['User_'];


function UserListCtrl(User_) {
  //this.orderProp = 'age';
  this.users = User_.query();
}

//UserListCtrl.$inject = ['User'];


function UserDetailCtrl(User_) {
  var self = this;
  self.user = User_.get({userId: self.params.userId}, function(user) {
  //  self.mainImageUrl = phone.images[0];
  });

  //self.setImage = function(imageUrl) {
  //  self.mainImageUrl = imageUrl;
  //}
}

//UserDetailCtrl.$inject = ['User'];