package com.lbb.util
import java.util.concurrent.ScheduledExecutorService
import java.util.Date
import scala.collection.mutable.Map
import org.joda.time.DateTime
import org.joda.time.Minutes
import com.lbb.entity.Circle
import com.lbb.entity.Reminder
import com.lbb.entity.User
import com.lbb.TypeOfCircle
import scala.util.Random

object ReminderUtil {
  
  private val scheduledReminders:Map[Reminder, ScheduledExecutorService] = Map[Reminder, ScheduledExecutorService]()
  
  def addScheduledReminder(r:Reminder, ex:ScheduledExecutorService) = {
    scheduledReminders.put(r, ex)
    println("ReminderUtil.addScheduledReminder: just added this reminder/executor: "+r)
  }
  
  def removeScheduledReminder(r:Reminder) = {
    val ex = scheduledReminders.remove(r)
    ex.map(e => e.shutdownNow())
    println("ReminderUtil.removeScheduledReminder: just removed this reminder/executor: "+r)
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
  
  def createReminderExecutor(r:Reminder) = {
    for(circle <- r.circle.obj) yield { 
      // add a random number of minutes so that the reminders won't all fire 
      // at the same time.  rand can be anything between the 0th and the 720th minute
      // of the day... 0=midnight,  720=noon
      val rand = new Random().nextInt(12*60)
      val delay = calcDelay(new Date, r.remind_date)
      val runnable = new Runnable {
        def run = {
          Emailer.notifyEventComingUp(r.viewer, r.circle);
          r.delete_! 
        }
      }
      val time = new Date(new DateTime().plusMinutes(delay+rand).getMillis())
      println("ReminderUtil.createReminderExecutor: Schedule reminder="+r+" to fire on "+time )
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
  
  def createReminders(c:Circle) = {
    println("ReminderUtil.createReminders:  c.date = "+c.date)
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
    println("ReminderUtil.createReminders:  peopletonotify = "+peopletonotify.size)
    
    val rem = for(person <- peopletonotify) yield {
      for(d <- dates) yield {
        Reminder.create.viewer(person).circle(c).remind_date(new Date(d.getMillis()))
      }
    }
    println("ReminderUtil.createReminders:  rem.flatten = "+rem.flatten.size)
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
    
      val reminders = for(d <- dates) yield {
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