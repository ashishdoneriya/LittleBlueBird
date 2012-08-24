package com.lbb.entity
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.By
import java.util.Date
import net.liftweb.http.js.JsExp
import net.liftweb.common.Box
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.json.JsonAST
import net.liftweb.json.JsonAST._
import com.lbb.gui.MappedDateExtended
import net.liftweb.common.Full
import java.util.concurrent.ScheduledExecutorService
import com.lbb.util.Emailer
import com.lbb.TypeOfCircle
import org.joda.time.Minutes
import scala.util.Random
import org.joda.time.DateTime
import scala.collection.mutable.Map
import com.lbb.util.LbbLogger
import net.liftweb.mapper.MappedDateTime
import com.lbb.gui.MappedDateTimeExtended

/**
 * 
 * 
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` bigint(20) NOT NULL auto_increment,
  `viewer_id` bigint(20) NOT NULL,
  `circle_id` bigint(20) NOT NULL,
  `remind_date` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `IDX_UNQ_VIEWER_CIRCLE_DATE` (`viewer_id`,`circle_id`,`remind_date`),
  KEY `IDX_VIEWER_ID` (`viewer_id`),
  KEY `IDX_CIRCLE_ID` (`circle_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3374 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reminders`
--
ALTER TABLE `reminders`
  ADD CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`viewer_id`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reminders_ibfk_3` FOREIGN KEY (`circle_id`) REFERENCES `circles` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

 */

class Reminder extends LongKeyedMapper[Reminder] with LbbLogger { 
  
  def getSingleton = Reminder
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  object viewer extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "viewer_id"
  }
  
  object circle extends MappedLongForeignKey(this, Circle) {
    override def dbColumnName = "circle_id"
  }
  
  object remind_date extends MappedDateTimeExtended(this)
  
  override def hashCode = {
    val hash = viewer.hashCode() + circle.hashCode() + remind_date.hashCode()
    //debug(this.toString()+": hash = "+hash)
    hash
  }
  
  override def equals(r:Any) = {
    val same = r.hashCode() == this.hashCode()
    //debug("same = "+same)
    same
  }
  
  override def delete_! = {
    Reminder.removeScheduledReminder(this)
    super.delete_!
  }
  
  override def save = {
    val saved = super.save()
    debug("Saved Reminder to db: "+this)
    val executor = createReminderExecutor
    executor.map(ex => if(saved) Reminder.addScheduledReminder(this, ex))
    saved
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = { 
    viewer.map(_.asJsShallow) match {
      case Full(person) => List(("person", person))
      case _ => Nil
    }
  }
  
  private def createReminderExecutor = {
    for(circle <- this.circle.obj) yield { 
      // add a random number of minutes so that the reminders won't all fire 
      // at the same time.  rand can be anything between the 0th and the 720th minute
      // of the day... 0=midnight,  720=noon
      val rand = new Random().nextInt(12*60)
      val delay = Reminder.calcDelay(new Date, remind_date)
      val runnable = new Runnable {
        def run = {
          Emailer.notifyEventComingUp(viewer, circle);
          delete_! 
        }
      }
      val time = new Date(new DateTime().plusMinutes(delay+rand).getMillis())
      debug("Schedule reminder="+this+" to fire on "+time )
      schedule(60*(delay+rand), runnable)
    }
  }
  
  def schedule(secondsfromnow:Int,runnable:Runnable) = {
    import java.util.concurrent._
    import java.util._
    val ex = Executors.newSingleThreadScheduledExecutor()
    ex.schedule(runnable, secondsfromnow, TimeUnit.SECONDS)
    ex
  }
  
}

object Reminder extends Reminder with LongKeyedMetaMapper[Reminder] {
  
  private val scheduledReminders:Map[Reminder, ScheduledExecutorService] = Map[Reminder, ScheduledExecutorService]()
  
  override def dbTableName = "reminders" // define the DB table name
    
  def findByNameAndEvent(userId:Long, circleId:Long) = findAll(By(Reminder.viewer, userId), By(Reminder.circle, circleId))
  
  def findByNameEventAndDate(userId:Long, circleId:Long, date:Date) = 
    findAll(By(Reminder.viewer, userId), By(Reminder.circle, circleId), By(Reminder.remind_date, date))
    
  def getScheduledReminders = scheduledReminders
    
  /**
   * This is called from Boot.boot.  This method reads in all the reminders from the database and creates
   * Executors for them.  The reminders and the Executors are put into the map: Reminder.scheduledReminders
   */
  def boot = {
    debug("boot: enter")
    val reminders = Reminder.findAll()
    //shutdown any in the map first
    scheduledReminders.foreach(s => s._2.shutdownNow())
    scheduledReminders.empty
    reminders.foreach(r => {
      val box = r.createReminderExecutor
      box.map(ex => addScheduledReminder(r, ex))
    })
    debug("boot: exit")
  }
    
  def addScheduledReminder(r:Reminder, ex:ScheduledExecutorService) = {
    val o = scheduledReminders.put(r, ex)
    o.map(ox => ox.shutdownNow())
    debug("just added this reminder/executor: "+r)
  }
  
  def removeScheduledReminder(r:Reminder) = {
    val ex = scheduledReminders.remove(r)
    ex.map(e => e.shutdownNow())
    debug("just removed this reminder/executor: "+r)
  }
  

  def calc(d:DateTime, daysprior:Int) = {
    d.minusDays(daysprior)
  }
  
  /**
   * createReminderExecutor has to know how many minutes from now
   * to fire, not the absolute time it's supposed to fire - what a hassle
   */
  def calcDelay(now:Date, future:Date) = {
    // figure out midnight of "now"'s date
    val nowdt = new DateTime(now.getTime())
    val nowmn = new DateTime(nowdt.getYear, nowdt.getMonthOfYear(), nowdt.getDayOfMonth(),0,0,0,0)
    val futuredt = new DateTime(future.getTime())
    // how many minutes between midnight of now and midnight of the remind date
    val m1 = Minutes.minutesBetween(nowmn, futuredt).getMinutes()
    val m2 = Minutes.minutesBetween(nowmn, nowdt).getMinutes()
    val delay = m1 - m2
    delay
  }
  
  def createReminders(c:Circle) = {
    val priors = daysprior(c)
    
    val dates = for(p <- priors) yield {
      val jodatime = new DateTime(c.date.is.getTime())
      calc(jodatime, p)
    }
    
    
    val receivers = c.receiverLimit match {
      case 1 => Nil // if there's only one receiver, that person doesn't need any reminders
      case _ => c.receivers
    }
    
    val peopletonotify = (receivers :: c.givers :: Nil).flatten
    debug("peopletonotify = "+peopletonotify.size)
    
    val rem = for(person <- peopletonotify) yield {
      for(d <- dates) yield {
        Reminder.create.viewer(person).circle(c).remind_date(new Date(d.getMillis()))
      }
    }
    debug("rem.flatten = "+rem.flatten.size)
    rem.flatten
  }
  
  /**
   * If this person is the only receiver, we don't have to create reminders for him
   */
  def createReminders(circleId:Long, userId:Long) = {
    // below reads:  as long as the circle is not a 1-receiver circle OR as long as the person isn't a receiver
    for(circle <- Circle.findByKey(circleId); 
        person <- User.findByKey(userId); 
        if(circle.receiverLimit != 1 || !person.isReceiver(circle))) yield 
    {
      val priors = daysprior(circle)
      val dates = for(p <- priors) yield {
        val jodatime = new DateTime(circle.date.is.getTime())
        calc(jodatime, p)
      }
    
      val reminders = for(d <- dates; if(d.isAfterNow())) yield {
        Reminder.create.viewer(person).circle(circle).remind_date(new Date(d.getMillis()))
      }
      reminders
    }
    
  }
  
  private def daysprior(c:Circle) = c.circleType.is match {
    case s:String if(s == TypeOfCircle.christmas.toString) => List(3,7,14,30)
    case _ => List(3,7,14)
  }
  
  def deleteReminders(c:Circle) = {
    c.reminders.foreach(_.delete_!)
  }
  
  def deleteReminders(userId:Long, circleId:Long) = {
    Reminder.findByNameAndEvent(userId, circleId).foreach(r => r.delete_!)
  }  
    
}