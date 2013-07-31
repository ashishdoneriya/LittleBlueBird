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
  
  
  // testing the 'no profile pic' image
  test("adjusted dimensions 1") {
    val profilepicUrl = new URL("http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg")
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
    val profilepicUrl = new URL("http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg")
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
  
  
  // take any date and move it to 11:59pm on that same day
  test("ahead 23 hrs") {
    val expyear = 2013; val expmonth = 1; val expday = 30; val exphr = 23; val expmin = 59; val expsec = 59;
    val dt = new DateTime(expyear, expmonth, expday, 0, 0, 0, 0)
    val d = new Date(dt.getMillis)
    val newd = Util.ahead23hrs(d)
    val newdt = new DateTime(newd.getTime)
    val actyear = newdt.getYear
    val actmonth = newdt.getMonthOfYear
    val actday = newdt.getDayOfMonth
    val acthr = newdt.getHourOfDay
    val actmin = newdt.getMinuteOfHour
    val actsec = newdt.getSecondOfMinute
    assert(actyear===expyear)
    assert(actmonth===expmonth)
    assert(actday===expday)
    assert(acthr===exphr)
    assert(actmin===expmin)
    assert(actsec===expsec)
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