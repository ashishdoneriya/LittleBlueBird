package com.lbb
import java.text.DateFormat
import java.text.SimpleDateFormat
import scala.xml.Text
import net.liftweb.mapper.By
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedString
import org.joda.time.DateTime
import com.lbb.Emailer
import net.liftweb.util.FieldError
import net.liftweb.common.Full
import net.liftweb.common.Empty
import java.util.Date


class Circle extends LongKeyedMapper[Circle] { 
  
  def getSingleton = Circle
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  object name extends MappedString(this, 140) {
    override def displayName = "Name"
    override def dbIndexed_? = true
  }
  
  // https://github.com/lift/framework/blob/master/persistence/mapper/src/main/scala/net/liftweb/mapper/MappedDate.scala
  // TODO duplicated code here and in User
  // TODO must make this a required field
  object date extends MappedDate(this) {
    override def displayName = "Date"
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
      case "" => err = Nil; println("parse: case \"\": errors..."); err.foreach(println(_)); this.set(null); Empty
      case _ => err = FieldError(this, Text("Use MM/dd/yyyy format")) :: Nil; println("parse: case _ :  errors..."); err.foreach(println(_)); this.set(null); Empty
    }
    
    override def validate:List[FieldError] = err
  
  }
  
  object circleType extends MappedString(this, 140) {
    override def displayName = "Type"
    override def dbIndexed_? = true
  }
  
  def participants = CircleParticipant.findAll(By(CircleParticipant.circle, this.id))
  
  def isExpired = {
    new DateTime(date.is) isBefore(new DateTime())
  }
  
  def add(p:List[User], i:User, receiver:Boolean):Circle = {
    p foreach { u => {
      val saved = CircleParticipant.create.circle(this).person(u).inviter(i).receiver(receiver).save
      saved match {
        case true => Emailer.addedtocircle(u, i, this)
        case false => Emailer.erroradding(i, u, this)
      }
    } }
    this
  }
  
  def add(p:List[User], i:User):Circle = {
    add(p,i,true)
  }
  
  def add(receivers:List[User], givers:List[User], inviter:User):Circle = {
    add(receivers, inviter, true)
    add(givers, inviter, false)
  }
}

object Circle extends Circle with LongKeyedMetaMapper[Circle] {
  override def dbTableName = "circle" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(circleType, name, date)
}