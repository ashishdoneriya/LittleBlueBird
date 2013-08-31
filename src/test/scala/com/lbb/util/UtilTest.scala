package com.lbb.util
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import javax.swing.ImageIcon
import java.net.URL
import net.liftweb.db.StandardDBVendor
import net.liftweb.mapper.Schemifier
import net.liftweb.mapper.DB
import com.lbb.entity.Circle
import com.lbb.entity.Gift
import com.lbb.entity.AuditLog
import com.lbb.entity.Friend
import net.liftweb.util.Props
import com.lbb.entity.Reminder
import net.liftweb.db.DefaultConnectionIdentifier
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Recipient
import net.liftweb.common.Box
import com.lbb.entity.User
import java.util.Date
import java.util.GregorianCalendar
import org.joda.time.DateTime

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
    val exp = "202CB9";
    val act = Util.hashPass("123")
    assert(exp===act)
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