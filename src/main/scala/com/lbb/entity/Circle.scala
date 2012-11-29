package com.lbb.entity
import java.text.SimpleDateFormat
import java.util.Date
import scala.collection.mutable.ListBuffer
import scala.xml.Text
import org.joda.time.DateTime
import org.joda.time.Days
import com.lbb.gui.MappedDateExtended
import com.lbb.util.DateChangeListener
import com.lbb.util.Emailer
import com.lbb.TypeOfCircle
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JsExp
import net.liftweb.mapper.By
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedBoolean
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.MappedInt
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedString
import net.liftweb.util.FieldError
import net.liftweb.json.JsonAST
import com.lbb.util.LbbLogger
import com.lbb.gui.MappedDateObservable

/**
 * READY TO DEPLOY
 * 
 * ID
 * NAME
 * EXPIRATION_DATE
 * DATE_DELETED
 * CUTOFF_DATE
 * TYPE
 */

/**
 * 
CREATE TABLE IF NOT EXISTS `circles` (
  `ID` bigint(20) NOT NULL auto_increment,
  `NAME` varchar(255) default NULL,
  `EXPIRATION_DATE` datetime default NULL,
  `DATE_DELETED` date default NULL,
  `CUTOFF_DATE` datetime default NULL,
  `type` varchar(255) default NULL,
  PRIMARY KEY  (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=366 ;

 */

class Circle extends LongKeyedMapper[Circle] with DateChangeListener with LbbLogger { 
  
  def getSingleton = Circle
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  override def validate:List[FieldError] = {
    debug("Circle.validate...")
    super.validate
  }
  
  object name extends MappedString(this, 140) {
    override def displayName = "Name"
    override def dbIndexed_? = true
    
    override def validate:List[FieldError] = {
      this.is match {
        case s if(s.trim()=="") => {
          val list = List(FieldError(this, Text(displayName+" is required")))
          val ff = (list :: super.validate :: Nil).flatten
          ff
        }
        case _ => super.validate
      }
    }
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = {
    debug("supplementalJs:  for circle '"+this.name+"'  ("+this.id+")");
    val dateString = date.is match {
      case null => ""
      case d:Date => new SimpleDateFormat("M/d/yyyy").format(d)
    }
    
    val jsonReminders = reminders.map(r => {
      val js = r.asJs
      //debug("reminders.asJs: "+js)
      js})
      
    val jsReminders = JsArray(jsonReminders)
    
    List(("dateStr", dateString), ("receiverLimit", receiverLimit), ("reminders", jsReminders), ("isExpired", isExpired))  
  }
  
//  object deleted extends MappedBoolean(this) {
//    override def _toForm:Box[NodeSeq] = Empty
//  }
  
  // Keep track of the date the circle was deleted, not just the boolean value
  object date_deleted extends MappedDateObservable(this, this) {
    override def dbColumnName = "date_deleted"
  
    override def apply(d:Date) = {
      debug("apply: d = "+d+"  evtlistener="+evtlistener)
      
      val obj = super.apply(d)
      evtlistener.dateDeletedSet(obj)
      obj
    }
  }
  
  // legacy db field - not going anything with this field at this time 5/21/12
  object cutoff_date extends MappedDateExtended(this) {
    override def dbColumnName = "cutoff_date"
  }
  
  // https://github.com/lift/framework/blob/master/persistence/mapper/src/main/scala/net/liftweb/mapper/MappedDate.scala
  // TODO duplicated code here and in User
  // TODO must make this a required field
  object date extends MappedDateObservable(this, this) {
    override def displayName = "Event Date"
    override def dbColumnName = "expiration_date"
      
    var err:List[FieldError] = Nil
    
    final val dateFormat = new SimpleDateFormat("MM/dd/yyyy")
    
    override def asHtml = is match {
      case null => Text("")
      case _ => Text(dateFormat.format(is))
    }
    
    override def format(d:Date) = d match {
      case null => ""
      case _ => dateFormat.format(d)
    }
    
    val Pat = """(\d){1,2}/(\d){1,2}/(\d){4}""".r
    
    override def parse(s:String) = s match {
      case Pat(m, d, y) => err = Nil; debug("parse: case Pat(m, d, y): errors..."); err.foreach(debug(_)); Full(dateFormat.parse(s))
      case "" => err = FieldError(this, Text(displayName+" is required")) :: Nil; debug("parse: case \"\": errors..."); err.foreach(debug(_)); this.set(null); Empty
      case _ => err = FieldError(this, Text(displayName+" must be MM/dd/yyyy format")) :: Nil; debug("parse: case _ :  errors..."); err.foreach(debug(_)); this.set(null); Empty
    }
    
    override def validate:List[FieldError] = err
  
    override def apply(d:Date) = {
      debug("apply: d = "+d+"  evtlistener="+evtlistener)
      
      evtlistener.dateUnset
      val obj = super.apply(d)
      evtlistener.dateSet(obj)
      obj
    }
  
  }
  
  object circleType extends MappedString(this, 140) {
    override def displayName = "Type"
    override def dbColumnName = "type"
    override def dbIndexed_? = true
  }
  
  def reminders = {
    import net.liftweb.mapper.{OrderBy, Ascending}
    Reminder.findAll(By(Reminder.circle, this.id), OrderBy(Reminder.remind_date, Ascending))
  }
  
  def participants = CircleParticipant.findAll(By(CircleParticipant.circle, this.id))
  
  // new&improved version of 'participants' above
  // return a List[User] not just the fkeys
  def participantList = participants.map(fk => fk.person.obj.open_!)
  
  def receivers = participantList.filter(_.isReceiver(this))//.map(_.asJsShallow)
  def givers = participantList.filter(!_.isReceiver(this))//.map(_.asJsShallow)
  
  def isExpired = {
    val ret = new DateTime(date.is) isBefore(new DateTime())
//    debug("Circle "+id.is+" isExpired: new DateTime(date.is)="+new DateTime(date.is));
//    debug("Circle "+id.is+" isExpired: new DateTime()="+new DateTime());
    debug("Circle "+id.is+" isExpired: "+ret+": "+new DateTime(date.is)+" isBefore "+new DateTime()+" => "+(new DateTime(date.is) isBefore(new DateTime())));
    ret
  }
  
  def isDeleted = {
    date_deleted.is != null
  }
  
  def add(p:List[User], i:User, receiver:Boolean):Circle = {
    p foreach { u => {
      val participationLevel = if(receiver) {"Receiver"} else {"Giver"}
      val saved = CircleParticipant.create.circle(this).person(u).inviter(i).participationLevel(participationLevel).save
      saved match {
        case true => Emailer.addedtocircle(u, i, this)
        case false => Emailer.erroradding(i, u, this)
      }
    } }
    this
  }
  
  def add(p:List[User], i:User):Circle = {
    //add(p,i,true)
    p foreach { u => {
      val participationLevel = if(limitReached) {"Giver"} else {"Receiver"}
      val saved = CircleParticipant.create.circle(this).person(u).inviter(i).participationLevel(participationLevel).save
      saved match {
        case true => Emailer.addedtocircle(u, i, this)
        case false => Emailer.erroradding(i, u, this)
      }
    } }
    this
  }
  
  def add(receivers:List[User], givers:List[User], inviter:User):Circle = {
    add(receivers, inviter, true)
    add(givers, inviter, false)
  }
  
  def containsAll(recipients:List[User]) = {
    val justreceivers = recipients.filter(r => r.isReceiver(this))
    justreceivers.size == recipients.size
  }
  
  object creator extends MappedInt(this) {
    override def ignoreField_? = true
  }
  
  private val receiversToSave:ListBuffer[Long] = ListBuffer()
  private val giversToSave:ListBuffer[Long] = ListBuffer()
  
  def add(id:Long) = {
    receiversToSave.append(id)
  }
  
  def addgiver(id:Long) = {
    giversToSave.append(id)
  }
  
  override def save() = {
    val inserting = id.is == -1
    
    val saved = super.save();
    
    if(inserting) {
      val receiverSet = receiversToSave.toSet
      receiverSet foreach { r => CircleParticipant.create.circle(this).person(r).inviter(creator.is).participationLevel("Receiver").save() }
      receiversToSave.drop(0)
      
      val giverSet = giversToSave.toSet
      giverSet foreach { r => CircleParticipant.create.circle(this).person(r).inviter(creator.is).participationLevel("Giver").save() }
      giversToSave.drop(0)
    }
    
    saved
  }
  
  private def limitReached = receiverLimit != -1 && receiverCount == receiverLimit
  
  private def receiverCount = participantList.filter(_.isReceiver(this)).size
  
  def receiverLimit = circleType.is match {
    case s:String if(s.equals(TypeOfCircle.birthday.toString())) => 1
    case s:String if(s.equals(TypeOfCircle.christmas.toString())) => -1
    case s:String if(s.equals(TypeOfCircle.mothersday.toString())) => 1
    case s:String if(s.equals(TypeOfCircle.fathersday.toString())) => 1
    case s:String if(s.equals(TypeOfCircle.graduation.toString())) => 1
    case s:String if(s.equals(TypeOfCircle.babyshower.toString())) => 1
    case s:String if(s.equals(TypeOfCircle.valentinesday.toString())) => -1
    case s:String if(s.equals(TypeOfCircle.anniversary.toString())) => 2
    case s:String if(s.equals(TypeOfCircle.other.toString())) => 1
    case _ => -1
  }
  
  def daysaway = {
    val then = new DateTime(date.is.getTime())
    val now = new DateTime()
    Days.daysBetween(now, then).getDays
  }
  
  /**
   * Listener event that fires when date is set.  See apply() in date
   */
  def dateUnset = {
    Reminder.deleteReminders(this)
  }
  
  /**
   * Listener event that fires when date is set.  See apply() in date
   */
  def dateSet(c:Circle) = {
    val reminders = Reminder.createReminders(c)
    reminders.foreach(_.save)
  }
  
  /**
   * Listener event that fires when date_deleted is set.  See apply() in date_deleted
   */
  def dateDeletedSet(c:Circle) = Reminder.deleteReminders(c)
}

object Circle extends Circle with LongKeyedMetaMapper[Circle] {
  override def dbTableName = "circles" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(circleType, name, date)
}