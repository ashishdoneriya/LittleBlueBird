


// see https://github.com/phonegap-build/BarcodeScanner/blob/master/README.md

  $scope.scan = function() {
  
    try {
	    var scanner = window.cordova.require("cordova/plugin/BarcodeScanner");
	
	    scanner.scan(
	      function (result) {
	        $scope.scanresult = result.text;
	        $scope.scanformat = result.format;
	        $scope.barcodelookup(result.text, result.format);
	      }, 
	      function (error) {
	          alert("Scanning failed: " + error);
	      }
	    );
	    
    }
    catch(err) {
      alert('Error:'+err.message);
    }
  }
  
  
  $scope.barcodelookup = function(barcode, formatIgnoredAtTheMoment) {
  
    //635753490879  one hit
    //075371080043  two hits
  
    var upcresult = UPC.lookup({code:barcode}, 
                          function() {
                              alert('begin success fn');
                              console.log('upcresult', upcresult);
                              alert('calling DOMParser');
						      parser=new DOMParser();
						      xml=parser.parseFromString(upcresult.xml,"text/xml");
                              alert('got xml');
							  console.log('upcresult.xml', upcresult.xml);
							  console.log('xml', xml);
							  $scope.testjson = xmlToJson(xml);
                              alert('converted to json');
							  
							  $scope.products = [];
							  if(!angular.isDefined($scope.testjson.ItemLookupResponse.Items.Item)) {
							    console.log("not even defined");
							  }
							  else if(angular.isDefined($scope.testjson.ItemLookupResponse.Items.Item.length)) {
							    // multiple products returned
							    for(var i=0; i < $scope.testjson.ItemLookupResponse.Items.Item.length; ++i) {
							      var product = {name: $scope.testjson.ItemLookupResponse.Items.Item[i].ItemAttributes.Title.text, url:$scope.testjson.ItemLookupResponse.Items.Item[i].DetailPageURL.text};
							      $scope.products.push(product);
							    }
							  }
							  else {
							    // only one product returned
							    var product = {name: $scope.testjson.ItemLookupResponse.Items.Item.ItemAttributes.Title.text, url:$scope.testjson.ItemLookupResponse.Items.Item.DetailPageURL.text};
							    $scope.products.push(product);
							  }
                              alert('done');
							  
                          }, 
                          function() {console.log('UPC.lookup() failed')});
  
  }
  
  
  
  // got this from: http://davidwalsh.name/convert-xml-json
  // Changes XML to JSON
  function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
		//console.log('obj:', obj);
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if(nodeName == '#text') nodeName = 'text'; // my own hack 2013-08-21 because angular doesn't like json elements whose names start with #
			//console.log('nodeName:', nodeName);
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
  };
  
  