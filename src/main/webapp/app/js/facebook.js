
    window.fbAsyncInit = function() {
        console.log("FB initing ---------------");
        FB.init({
          appId      : '136122483829', // App ID
          channelUrl : 'http://localhost/gf/app/channel.html', // Path to your Channel File
          status     : true, // check login status
          cookie     : true, // enable cookies to allow the server to access the session
          oauth      : true,
          xfbml      : true  // parse XFBML
        });
        
        angular.bootstrap(document, ['project']);
        
    };

    // Load the SDK Asynchronously
    (function(d){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));