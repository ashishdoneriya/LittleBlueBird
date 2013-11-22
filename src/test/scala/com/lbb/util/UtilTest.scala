package com.lbb.util

import java.net.URL

import org.joda.time.DateTime
import org.junit.runner.RunWith
import org.scalatest.FunSuite
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.junit.JUnitRunner

import com.lbb.entity.AuditLog
import com.lbb.entity.Circle
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Friend
import com.lbb.entity.Gift
import com.lbb.entity.Recipient
import com.lbb.entity.Reminder
import com.lbb.entity.User

import javax.swing.ImageIcon
import net.liftweb.common.Box
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.db.StandardDBVendor
import net.liftweb.json.JsonAST.JObject
import net.liftweb.json.JsonParser
import net.liftweb.mapper.DB
import net.liftweb.mapper.Schemifier
import net.liftweb.util.Props

@RunWith(classOf[JUnitRunner])
class UtilTest extends FunSuite with AssertionsForJUnit with LbbLogger {

  
  
  // TODO create a real db pool
  def initDb = {
     
    // this stuff goes in Boot.scala
    val vendor =  
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3307/bdunklau", //"jdbc:h2:~/test", //"jdbc:mysql://localhost:3306/littlebluebird",
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

    DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
     
    Schemifier.schemify(true, Schemifier.infoF _, User)
    Schemifier.schemify(true, Schemifier.infoF _, Circle)
    Schemifier.schemify(true, Schemifier.infoF _, CircleParticipant)
    Schemifier.schemify(true, Schemifier.infoF _, Gift)
    Schemifier.schemify(true, Schemifier.infoF _, Recipient)
    Schemifier.schemify(true, Schemifier.infoF _, Reminder)
    Schemifier.schemify(true, Schemifier.infoF _, AuditLog)
    Schemifier.schemify(true, Schemifier.infoF _, Friend)
        
  }
  
  
  test("determine usernames like Brent") {
    initDb
    
    val exp = List("Brent") // depends on what's in the db at the time
    val actual = Util.determineUsernamesLike("Brent")
    assert(actual===exp)
    assert("Brent"===actual.head) 
  }
  
  
  // 2013-08-06
  test("hash pass") {
    val exp = "332996";
    val act = Util.hashPass("Beverly1")
    assert(exp===act)
  }
  
  
  test("parse json") {
    val json = "{\"data\":[{\"name\":\"Eric Moore\",\"id\":\"7913493\"},{\"name\":\"Becky Harbert Dunklau\",\"id\":\"16801180\"},{\"name\":\"Brandon Dunklau\",\"id\":\"16804186\"},{\"name\":\"David Landers\",\"id\":\"16834125\"},{\"name\":\"Rebecca O'Bier Davis\",\"id\":\"18807150\"},{\"name\":\"Leslie Sookma Rortvedt\",\"id\":\"18811063\"},{\"name\":\"Mary Karavatakis\",\"id\":\"100000444159168\"},{\"name\":\"Troy Nelson\",\"id\":\"100000492467918\"},{\"name\":\"Ivan Pugh\",\"id\":\"100000501133257\"},{\"name\":\"Philip Holamon\",\"id\":\"100000531982506\"},{\"name\":\"Jennie Flowers Tatum\",\"id\":\"100000623048420\"},{\"name\":\"Erik Hansen\",\"id\":\"100000681082643\"},{\"name\":\"Lucy Nicole Collins\",\"id\":\"100000795588383\"},{\"name\":\"Shelly Rogers Bradshaw\",\"id\":\"100000808958118\"},{\"name\":\"Doug Dunklau\",\"id\":\"100000922568062\"},{\"name\":\"Keith \u0166eeple\",\"id\":\"100001061123342\"},{\"name\":\"Byron Ford\",\"id\":\"100001163737541\"},{\"name\":\"Marian Ashwill\",\"id\":\"100001308005599\"},{\"name\":\"Kristin Shockley Green\",\"id\":\"100001460589842\"},{\"name\":\"Neil Clark\",\"id\":\"100001597951066\"},{\"name\":\"Chris Quillin\",\"id\":\"100002350468813\"},{\"name\":\"Joe Shankles\",\"id\":\"100003818634080\"},{\"name\":\"Tara Andreason Cloutman\",\"id\":\"100003824026203\"},{\"name\":\"Joe Battista\",\"id\":\"100003921956806\"},{\"name\":\"Chris Curry\",\"id\":\"100004117389265\"},{\"name\":\"Stacy Wilson\",\"id\":\"100004233605659\"},{\"name\":\"Nancy Phillips\",\"id\":\"100004642742766\"},{\"name\":\"Angie Fields Zumwalt\",\"id\":\"100005734893581\"}],\"paging\":{\"next\":\"https:\\/\\/graph.facebook.com\\/569956369\\/friends?limit=0&offset=0&access_token=CAAAAH7GIRHUBANmfZBJWNcBlEf4DAnbHZBjxT55cKnsZBmroKDGm8s395ZCLguktEw8sqZB6BUzIyAcXGRB2Vy4muhqbXgbDAfIqVJ9NLkXWKZBUpTMwLWZBEpSzcU5btKBtIPMDDoCnL6xsZCjJZAtdOEuokkI64qxvz7LKSYvHMcRc85vVykIJI99QubfBHiFSKZAQATBL953QZDZD&__after_id=100005734893581\"}}"
    val expectedCSV = "'7913493', '16801180', '16804186', '16834125', '18807150', '18811063', '100000444159168', '100000492467918', '100000501133257', '100000531982506', '100000623048420', '100000681082643', '100000795588383', '100000808958118', '100000922568062', '100001061123342', '100001163737541', '100001308005599', '100001460589842', '100001597951066', '100002350468813', '100003818634080', '100003824026203', '100003921956806', '100004117389265', '100004233605659', '100004642742766', '100005734893581'"
    val csvIds = Util.facebookFriendsToCSV(json)  
    assert(expectedCSV === csvIds)
  }
  
  
  test("make map from json") {
    val json = "{\"data\":[{\"name\":\"Eric Moore\",\"id\":\"7913493\"},{\"name\":\"Becky Harbert Dunklau\",\"id\":\"16801180\"},{\"name\":\"Brandon Dunklau\",\"id\":\"16804186\"},e\":\"David Landers\",\"id\":\"16834125\"},{\"name\":\"Rebecca O'Bier Davis\",\"id\":\"18807150\"},\"paging\":{\"next\":\"https:\\/\\/graph.facebook.com\\/569956369\\/friends?limit=0&offset=0&access_token=CAAAAH7GIRHUBANmfZBJWNcBlEf4DAnbHZBjxT55cKnsZBmroKDGm8s395ZCLguktEw8sqZB6BUzIyAcXGRB2Vy4muhqbXgbDAfIqVJ9NLkXWKZBUpTMwLWZBEpSzcU5btKBtIPMDDoCnL6xsZCjJZAtdOEuokkI64qxvz7LKSYvHMcRc85vVykIJI99QubfBHiFSKZAQATBL953QZDZD&__after_id=100005734893581\"}}"
    val objs = Util.makeListOfMaps(json)  
    objs.map(ooo => ooo.get("id"))
    println(objs)
  }
  
  
  
  // testing the 'no profile pic' image
  test("adjusted dimensions 1") {
    val profilepicUrl = new URL("http://www.littlebluebird.com/gf/img/Silhouette-male.gif")
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    assert(126===profilepicheight)
    assert(200===profilepicwidth)
    val adjustedheight = Util.calculateAdjustedHeight(150, profilepicUrl) 
    val adjustedwidth = Util.calculateAdjustedWidth(150, profilepicUrl)
    assert(150===adjustedheight)
    assert(238===adjustedwidth)
    val margintop = Util.calculateMarginTop(150, profilepicUrl)
    val marginleft = Util.calculateMarginLeft(150, profilepicUrl)
    assert("0px"===margintop)
    assert("-44px"===marginleft)
  }

  // testing a 640x480 image
  test("adjusted dimensions 2") {
    val profilepicUrl = new URL("https://sphotos-b.xx.fbcdn.net/hphotos-ash3/643996_10200122580774007_1126388505_n.jpg")
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    assert(640===profilepicheight)
    assert(480===profilepicwidth)
    val adjustedheight = Util.calculateAdjustedHeight(150, profilepicUrl)
    val adjustedwidth = Util.calculateAdjustedWidth(150, profilepicUrl)
    assert(200===adjustedheight)
    assert(150===adjustedwidth)
    val margintop = Util.calculateMarginTop(150, profilepicUrl)
    val marginleft = Util.calculateMarginLeft(150, profilepicUrl)
    assert("-25px"===margintop)
    assert("0px"===marginleft)
  }

  // testing the 'no profile pic' image
  test("adjusted dimensions 3") {
    val profilepicUrl = new URL("http://www.littlebluebird.com/gf/img/Silhouette-male.gif")
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    assert(126===profilepicheight)
    assert(200===profilepicwidth)
    val adjustedheight = Util.calculateAdjustedHeight(75, profilepicUrl) 
    val adjustedwidth = Util.calculateAdjustedWidth(75, profilepicUrl)
    assert(75===adjustedheight)
    assert(119===adjustedwidth)
    val margintop = Util.calculateMarginTop(75, profilepicUrl)
    val marginleft = Util.calculateMarginLeft(75, profilepicUrl)
    assert("0px"===margintop)
    assert("-22px"===marginleft)
  }
  
  
  /**
   * Util.dateIsPassed is how we check to see if a circle is expired or not  
   * This is a standard test - no funny business.  The circle expir date is 1/15/13 and 'now' is
   * 2/1/13 11am.  Obviously, the circle is now expired.  But see the next test
   */
  test("date is passed? #1") {
    val now =       new DateTime(2013, 02, 01, 11, 0, 0, 0)          // 2/1/13 11am
    val expirDate = new DateTime(2013, 01, 15, 0, 0, 0, 0).getMillis // 1/15/13 midnight
    val isPassed = Util.dateIsPassed(expirDate, now)
    assert(isPassed===true)
  }
  
  
  /**
   * In this test, the expirDate is before the 'now' date.  According to old logic (prior to 8/11/13)
   * we would say the circle is expired.  But not anymore, now we take a circle's expir date and roll it forward 1 day
   * BUT WE DON'T SAVE THIS ROLLED-FORWARD DATE TO THE DB.  We save the midnight date.
   * So even though 'expirDate' has technically passed, we say the circle is still active because the date hasn't passed 
   * by more than 1 day yet.
   */
  test("date is passed? #2") {
    val now =       new DateTime(2013, 02, 01, 23, 58, 0, 0)         // 2/1/13 11:58pm
    val expirDate = new DateTime(2013, 02, 01, 0, 0, 0, 0).getMillis // 2/1/13 midnight
    val isPassed = Util.dateIsPassed(expirDate, now)
    assert(isPassed===false)
  }
  
  /**
   * Just to make sure we haven't missed anything, here's a test where the 'now' is clearly before
   * the expirDate.  Expected result: the circle is not expired; the date has not passed.
   */
  test("date is passed? #3") {
    val now =       new DateTime(2013, 02, 01, 11, 0, 0, 0)          // 2/1/13 11am
    val expirDate = new DateTime(2013, 03, 01, 0, 0, 0, 0).getMillis // 3/1/13 midnight
    val isPassed = Util.dateIsPassed(expirDate, now)
    assert(isPassed===false)
  }
  
  
  test("read url") {
    val url = "http://sowacs.appspot.com/AWS/%5Bbdunklau@yahoo.com%5Decs.amazonaws.com/onca/xml?IdType=UPC&ItemId=635753490879&SearchIndex=All&Service=AWSECommerceService&AWSAccessKeyId=056DP6E1ENJTZNSNP602&Operation=ItemLookup&AssociateTag=wwwlittleb040-20"
    val res = io.Source.fromURL(url).mkString
    println(res)
  }
  
  
  test("List stuff") {
    val list = List(1,2,3,4)
    val l2 = list.filter(i => i > 5)
    l2 match {
      case x :: xs => println("Nil matched case x :: xs")
      case Nil => println("Nil matched case Nil")
      case _ => println("Nil matched case _")
    }
    
    list.size match {
      case 4 => println("list matched case 4")
      case _ => println("list matched case _")
    }
  }
  
}