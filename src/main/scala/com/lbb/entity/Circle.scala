package com.lbb.entity
import java.text.SimpleDateFormat
import java.util.Date
import scala.collection.mutable.ListBuffer
import scala.xml.Text
import org.joda.time.DateTime
import com.lbb.gui.MappedDateExtended
import com.lbb.gui.MappedStringExtended
import com.lbb.util.Emailer
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
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
import com.lbb.TypeOfCircle

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

case class CircleType(name:String, receiverLimit:Int)

case class Christmas extends CircleType("Christmas", -1)

class Circle extends LongKeyedMapper[Circle] { 
  
  def getSingleton = Circle
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  override def validate:List[FieldError] = {
    println("Circle.validate...")
    super.validate
  }
  
  object name extends MappedStringExtended(this, 140) {
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
    val dateString = date.is match {
      case null => ""
      case d:Date => new SimpleDateFormat("M/d/yyyy").format(d)
    }
    List(("dateStr", dateString), ("receiverLimit", receiverLimit))        
  }
  
//  object deleted extends MappedBoolean(this) {
//    override def _toForm:Box[NodeSeq] = Empty
//  }
  
  // Keep track of the date the circle was deleted, not just the boolean value
  object date_deleted extends MappedDateExtended(this) {
    override def dbColumnName = "date_deleted"
  }
  
  // legacy db field - not going anything with this field at this time 5/21/12
  object cutoff_date extends MappedDateExtended(this) {
    override def dbColumnName = "cutoff_date"
  }
  
  // https://github.com/lift/framework/blob/master/persistence/mapper/src/main/scala/net/liftweb/mapper/MappedDate.scala
  // TODO duplicated code here and in User
  // TODO must make this a required field
  object date extends MappedDateExtended(this) {
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
      case Pat(m, d, y) => err = Nil; println("parse: case Pat(m, d, y): errors..."); err.foreach(println(_)); Full(dateFormat.parse(s))
      case "" => err = FieldError(this, Text(displayName+" is required")) :: Nil; println("parse: case \"\": errors..."); err.foreach(println(_)); this.set(null); Empty
      case _ => err = FieldError(this, Text(displayName+" must be MM/dd/yyyy format")) :: Nil; println("parse: case _ :  errors..."); err.foreach(println(_)); this.set(null); Empty
    }
    
    override def validate:List[FieldError] = err
  
  }
  
  object circleType extends MappedString(this, 140) {
    override def displayName = "Type"
    override def dbColumnName = "type"
    override def dbIndexed_? = true
    
//    var chosenType:Box[TypeOfCircle.Value] = Empty
//    
//    override def _toForm: Box[Elem] = 
//      S.fmapFunc({s: List[String] => this.setFromAny(s)}){funcName =>
//      Full(appendFieldId(SHtml.selectObj[TypeOfCircle.Value](TypeOfCircle.values.toList.map(v => (v,v.toString)),
//          // this 'match' sets the default/selected value of the drop-down
//          TypeOfCircle.values.find(p => p.toString().equals(this.is)) match {
//            case None => Full(TypeOfCircle.christmas)
//            case Some(ctype) => Full(ctype)
//          }, 
//          selected => set(selected.toString()) )))
//    }
  }
  
  def participants = CircleParticipant.findAll(By(CircleParticipant.circle, this.id))
  
  // new&improved version of 'participants' above
  // return a List[User] not just the fkeys
  def participantList = participants.map(fk => fk.person.obj.open_!)
  
  def isExpired = {
    new DateTime(date.is) isBefore(new DateTime())
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
}

object Circle extends Circle with LongKeyedMetaMapper[Circle] {
  override def dbTableName = "circles" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(circleType, name, date)
}