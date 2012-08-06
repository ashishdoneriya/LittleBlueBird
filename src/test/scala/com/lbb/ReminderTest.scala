package com.lbb
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import net.liftweb.db.StandardDBVendor
import net.liftweb.mapper.Schemifier
import net.liftweb.mapper.DB
import com.lbb.entity.Circle
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.util.Props
import net.liftweb.common.Box
import com.lbb.entity.Reminder
import com.lbb.entity.User
import java.util.Date
import org.joda.time.DateTime

@RunWith(classOf[JUnitRunner])
class ReminderTest extends FunSuite with AssertionsForJUnit {

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
    Schemifier.schemify(true, Schemifier.infoF _, Reminder)
  }
  
  /**
   * rem4 represents a reminder we get from the db
   * Notice the Map doesn't actually contain rem4 but the assert 
   * is true because rem4 represents the same data as rem1
   */
  test("pick reminders out of map") {
    val d1 = new Date
    Thread.sleep(1000)
    val d2 = new Date
    Thread.sleep(1000)
    val d3 = new Date
    val rem1 = Reminder.create.viewer(1).circle(1).remind_date(d1)
    val rem2 = Reminder.create.viewer(2).circle(2).remind_date(d2)
    val rem3 = Reminder.create.viewer(3).circle(3).remind_date(d3)
    val map = Map(rem1 -> d1, rem2 -> d2, rem3 -> d3)
    
    // same as 1
    val rem4 = Reminder.create.viewer(1).circle(1).remind_date(d1)
    
    val rem5 = Reminder.create.viewer(1).circle(1).remind_date(d2)
    
    assert(map.contains(rem4))
    assert(!map.contains(rem5))
  }
  
}