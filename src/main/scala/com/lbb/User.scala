package com.lbb

import java.text.SimpleDateFormat
import java.util.Date
import org.joda.time.DateMidnight
import org.joda.time.Years
import net.liftweb.common.Box
import net.liftweb.common.Full
import net.liftweb.mapper._
import net.liftweb.common.Empty
import net.liftweb.http.S
import net.liftweb.util.FieldError
import scala.xml.Text
import net.liftweb.json.JsonAST
import net.liftweb.common.Failure


/**
 * An O-R mapped "User" class that includes first name, last name, password and we add a "Personal Essay" to it
 * Lesson:  Don't have to implement validate here - use the inherited validate which will call validate on all the fields
 */
// TODO store user preferences
class User extends LongKeyedMapper[User] {
  def getSingleton = User
  
  def primaryKeyField = id
  object id extends MappedLongIndex(this)
  
  object first extends MappedString(this, 140) {
    override def displayName = "First Name"
  }
  
  object last extends MappedString(this, 140) {
    override def displayName = "Last Name"
  }  
  
  object email extends MappedEmail(this, 140) {
    override def displayName = "Email"
  }  
  
  object username extends MappedString(this, 140) {
    override def displayName = "Username"
    
    // http://scala-tools.org/mvnsites/liftweb-2.4-M4/#net.liftweb.mapper.MappedString
    override def validations = valUnique(displayName+" already exists") _ :: super.validations
  }
  
  object password extends MappedPassword(this) {
    override def displayName = "Password"
  }
  
  // https://github.com/lift/framework/blob/master/persistence/mapper/src/main/scala/net/liftweb/mapper/MappedDate.scala
  object dateOfBirth extends MappedDate(this) {

    override def displayName = "Date of Birth"
      
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
  
  object age extends MappedInt(this) {
    override def ignoreField_? = true
    override def is = {
      val dob = new DateMidnight(dateOfBirth.is)
      val now = new DateMidnight()
      val age = Years.yearsBetween(dob, now)
      age.getYears()
    }
  }

  // define an additional field for a personal essay
  object bio extends MappedTextarea(this, 2048) {
    override def textareaRows  = 10
    override def textareaCols = 50
    override def displayName = "Bio"
  }
  
  // query the circle_participant table to find out what circles you belong to
  def circles = CircleParticipant.findAll(By(CircleParticipant.person, this.id))
  
  // For active circles
  def giftlist(viewer:User, circle:Circle) = {     		
    val sql = "select g.* from gift g join recipient r on r.gift = g.id where r.person = "+this.id   
    println(sql)    
    val gifts = Gift.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
    gifts filter {g => viewer.canSee(this, g, circle)}
  }
  
  /**
   * 'this' person is the viewer
   */
  def canSee(recipient:User, gift:Gift, circle:Circle) = (this, recipient, gift.sender.obj, gift, circle) match {
    // You can't see the recipient's gift in the context of this circle, because in this circle
    // the 'recipient' is only a 'giver'
    case(_, r, _, _, c) if(!r.isReceiver(c)) => false 
    
    // You CAN see the gift in this context of this circle because:
    // - the circle is still active
    // - the item hasn't been bought
    // - and you (the viewer) are the one who added this gift
    case(v, _, Empty, g, c) if(!c.isExpired && v.addedThis(g)) => {
      if(gift.description=="gift11") println("case(v, _, Empty, g, c) if(!c.isExpired && v.addedThis(g))")
      true
    }
    
    // You CAN see this gift IF
    // - the circle is still active
    // - the item hasn't been bought
    // - you are a recipient of the gift AND the gift was added by another recipient
    case(v, _, Empty, g, c) if(!c.isExpired && g.isFor(v)) => {
      if(gift.description=="gift11") println("case(v, _, Empty, g, c) if(!c.isExpired && v.isRecipient(g))")
      g.wasAddedByARecipient
    }
    
    
    // You CAN see this gift IF
    // - the circle is still active
    // - the item hasn't been bought
    // - you are not the one receiving this gift
    case(v, _, Empty, g, c) if(!c.isExpired && g.isForSomeoneElse(v)) => {
      if(gift.description=="gift11") println("case(v, _, Empty, g, c) if(!c.isExpired && !v.isRecipient(g))")
      true
    }
    
    // This item HAS been bought.  You will be able to see it if...
    // - the circle is still active
    // - you added this item to your own list
    // - and you have not yet received this item
    case(v, r, s:Full[User], g, c) if(!c.isExpired && v.addedThis(g) && !g.hasBeenReceived) => {
      if(gift.description=="gift11") println("case(v, r, s:Full[User], g, c) if(!c.isExpired && v.addedThis(g) && !g.hasBeenReceived)")
      true
    }
    
    // This item HAS been bought.  You will be able to see it if...
    // - the circle is still active
    // - and you have not yet received this item
    case(v, r, s:Full[User], g, c) if(!c.isExpired && g.isFor(v) && g.wasAddedByARecipient && !g.hasBeenReceived) => {
      if(gift.description=="gift11") println("case(v, r, s:Full[User], g, c) if(!c.isExpired && v.isRecipient(g) && !g.hasBeenReceived)")
      true
    }
    
    // This item HAS been bought, but you CANNOT see it if...
    // - the gift is for someone else
    // - the gift has not been received
    case(v, _, s:Full[User], g, _) if(g.isForSomeoneElse(v) && !g.hasBeenReceived) => false
    
    // This item HAS been bought.  You will be able to see it if...
    // - the circle is expired
    // - the gift was bought in the expired circle
    case(_, _, s:Full[User], g, c) if(c.isExpired && g.circle.obj.map(_.id.is).openOr(-1)==c.id.is) => {
      if(gift.description=="gift11") println("case(_, _, s:Full[User], g, c) if(c.isExpired && g.circle.obj.map(_.id.is).openOr(-1)==c.id.is)")
      true
    }
    
    case(_, _, _, g, c) if(c.isExpired && !g.wasBoughtInThisCircle(c)) => false
    
    // the gift has been received in another circle, so you cannot see this gift in THIS circle
    case(_, _, s:Full[User], g, c) if(g.hasBeenReceivedInAnotherCircle(c)) => false
    
    case _ => {println("should catch this case"); true}

  }
  
  def isReceiver(c:Circle) = CircleParticipant.find(By(CircleParticipant.circle, c.id), By(CircleParticipant.person, this.id)) match {
    case f:Full[CircleParticipant] if(f.open_!.receiver.is) => true
    case _ => false
  }
  
  def addedThis(g:Gift) = {
    g.addedBy.is==this.id.is
  }
  
  def buy(g:Gift) = {
    g.sender(this).save()
  }
  
  def findByName(f:String, l:String) = {
    User.findAll(Cmp(User.first, OprEnum.Like, Full("%"+f.toLowerCase+"%"), Empty, Full("LOWER")),
        Cmp(User.last, OprEnum.Like, Full("%"+l.toLowerCase+"%"), Empty, Full("LOWER")))
  }
}

/**
 * The singleton that has methods for accessing the database
 */
object User extends User with LongKeyedMetaMapper[User] {
  
  override def dbTableName = "users" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(id, first, last, email,
  username, password, dateOfBirth, bio)
 
}
