
    window.fbAsyncInit = function() {
        console.log("FB initing --------------- //connect.facebook.net/en_US/all.js");
        FB.init({
          appId      : '136122483829', // App ID
          channelUrl : 'http://www.littlebluebird.com/gf/channel.html', // Path to your Channel File
          status     : true, // check login status
          cookie     : true, // enable cookies to allow the server to access the session
          oauth      : true,
          xfbml      : true  // parse XFBML
        });
        
        $.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());
if ($.browser.chrome || $.browser.msie) {
    //FB.XD._origin = window.location.protocol + "//" + document.domain + "/" + FB.guid();
    //FB.XD.Flash.init();
    //FB.XD._transport = "flash";
  } else if ($.browser.opera) {
    FB.XD._transport = "fragment";
    FB.XD.Fragment._channelUrl = window.location.protocol + "//" + window.location.host + "/";
  }
        
        //angular.bootstrap(document, ['project']); // THIS IS WHAT'S CAUSING THE SECOND routeChangeStart event to fire !!!!!!!!!!!!!!!!!!!!!!!!!!!
        
    };

    // Load the SDK Asynchronously
    (function(d){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));