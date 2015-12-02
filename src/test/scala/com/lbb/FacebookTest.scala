package com.lbb
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
//import net.liftweb.ext_api.facebook.FacebookConnect

@RunWith(classOf[JUnitRunner])
class FacebookTest extends FunSuite with AssertionsForJUnit {

  // java...
  // http://mrepo.happyfern.com/sites/facebook-java-api/facebook-java-api/apidocs/index.html
  
  // scala/lift...
  // https://github.com/lift/examples/blob/master/nuggets/hellofbc/src/main/scala/fbc/example/snippet/ConnectSnippet.scala
  
  val appkey = "136122483829"
  val appsecret = "1114cbd7ad691b8a4517b888f78b8a4b"
  
  test("FBConnect") {
    //val f = new FacebookConnect(appkey, appsecret) // don't have a version of this compiled against scala 2.10.x only 2.9.x
    //f.client
  }  
    
}