package com.lbb.entity
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.By
import java.util.Date
import com.lbb.util.ReminderUtil
import net.liftweb.http.js.JsExp
import net.liftweb.common.Box
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.json.JsonAST
import net.liftweb.json.JsonAST._
import com.lbb.gui.MappedDateExtended
import net.liftweb.common.Full

class Reminder extends LongKeyedMapper[Reminder] { 
  
  def getSingleton = Reminder
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  object viewer extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "viewer_id"
  }
  
  object circle extends MappedLongForeignKey(this, Circle) {
    override def dbColumnName = "circle_id"
  }
  
  object remind_date extends MappedDateExtended(this)
  
  override def hashCode = {
    val hash = viewer.hashCode() + circle.hashCode() + remind_date.hashCode()
    //println(this.toString()+": hash = "+hash)
    hash
  }
  
  override def equals(r:Any) = {
    val same = r.hashCode() == this.hashCode()
    //println("same = "+same)
    same
  }
  
  override def delete_! = {
    ReminderUtil.removeScheduledReminder(this)
    super.delete_!
  }
  
  override def save = {
    val saved = super.save()
    println("Reminder.save: Saved Reminder to db: "+this)
    val executor = ReminderUtil.createReminderExecutor(this)
    executor.map(ex => if(saved) ReminderUtil.addScheduledReminder(this, ex))
    saved
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = { 
    viewer.map(_.asJsShallow) match {
      case Full(person) => List(("person", person))
      case _ => Nil
    }
  }
  
}

object Reminder extends Reminder with LongKeyedMetaMapper[Reminder] {
  override def dbTableName = "reminders" // define the DB table name
    
  def findByNameAndEvent(userId:Long, circleId:Long) = findAll(By(Reminder.viewer, userId), By(Reminder.circle, circleId))
  
  def findByNameEventAndDate(userId:Long, circleId:Long, date:Date) = 
    findAll(By(Reminder.viewer, userId), By(Reminder.circle, circleId), By(Reminder.remind_date, date))
    
}