package com.lbb.entity

import java.text.SimpleDateFormat
import java.util.Date
import scala.xml.Text
import org.joda.time.DateMidnight
import org.joda.time.Years
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.mapper._
import net.liftweb.util.FieldError
import scala.xml.NodeSeq
import scala.xml.Elem
import net.liftweb.http.S
import com.lbb.gui.MappedEmailExtended
import com.lbb.gui.MappedTextareaExtended
import com.lbb.gui.MappedStringExtended
import com.lbb.gui.MappedDateExtended
import net.liftweb.http.js.JsExp
import net.liftweb.http.JsonResponse
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JE.Str
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JString
import net.liftweb.json.JsonAST.JArray
import net.liftweb.http.js.JE.JsAnd
import net.liftweb.json.Serialization
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonAST.JObject
import net.liftweb.json.JsonAST.JInt
import net.liftweb.json.JsonAST


/**
 *  Outstanding changes to make:
 *  PARENT_ID
 *  DATE_CREATED
 *  DATE_UPDATED
 *  SUBSCRIPTION_LEVEL_ID
 *  SUBSCRIBERS_ALLOWED
 *  MEMBERSHIP_STATUS_ID
 *  EXPIRATION_DATE
 *  GENDER
 *  CITY
 *  STATE
 */

/**
 * 
CREATE TABLE IF NOT EXISTS `person` (
  `ID` bigint(20) NOT NULL auto_increment,
  `PARENT_ID` bigint(20) default NULL,
  `FIRSTNAME` varchar(64) default NULL,
  `LASTNAME` varchar(64) default NULL,
  `EMAIL` varchar(64) default NULL,
  `USERNAME` varchar(32) default NULL,
  `PASSWORD` varchar(255) default NULL,
  `DATE_CREATED` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `DATE_UPDATED` timestamp NULL default NULL,
  `SUBSCRIPTION_LEVEL_ID` bigint(20) default NULL,
  `SUBSCRIBERS_ALLOWED` int(11) NOT NULL default '0',
  `MEMBERSHIP_STATUS_ID` bigint(20) NOT NULL default '2',
  `EXPIRATION_DATE` bigint(20) default NULL,
  `BIO` varchar(2000) default NULL,
  `GENDER` varchar(8) NOT NULL default 'Female',
  `DOB` date default NULL,
  `CITY` varchar(100) default NULL,
  `STATE` varchar(100) default NULL,
  `PROFILE_PIC` varchar(1024) default NULL,
  PRIMARY KEY  (`ID`),
  UNIQUE KEY `UNIQUE_USERNAME` (`USERNAME`),
  KEY `SUBSCRIPTION_LEVEL_ID` (`SUBSCRIPTION_LEVEL_ID`),
  KEY `PARENT_ID` (`PARENT_ID`),
  KEY `MEMBERSHIP_STATUS_ID` (`MEMBERSHIP_STATUS_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=670 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `person`
--
ALTER TABLE `person`
  ADD CONSTRAINT `person_ibfk_3` FOREIGN KEY (`PARENT_ID`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `person_ibfk_4` FOREIGN KEY (`MEMBERSHIP_STATUS_ID`) REFERENCES `membership_status` (`ID`);

 */

// TODO let gender be null

/**
 * An O-R mapped "User" class that includes first name, last name, password and we add a "Personal Essay" to it
 * Lesson:  Don't have to implement validate here - use the inherited validate which will call validate on all the fields
 */
// TODO store user preferences
class User extends LongKeyedMapper[User] {
  def getSingleton = User
  
  def primaryKeyField = id
  object id extends MappedLongIndex(this)
  
  override def validate:List[FieldError] = {
    (first, last) match {
      case(f, l) if(f.is.trim()=="" && l.is.trim()=="") => {
        val list = List(FieldError(first, Text("Enter a first or last name")))
        val ff = (list :: super.validate :: Nil).flatten
        ff
      }
      case _ => super.validate
    }
  }
  
  object first extends MappedStringExtended(this, 140) {
    override def displayName = "First Name"
    override def dbColumnName = "firstname"
      
    override def _toForm:Box[Elem] = {
      val sup = super._toForm
      println("User.first._toForm: " + sup)
      println("User.first._toForm: " + this.fieldId)
      sup
    }
  }
  
  object last extends MappedStringExtended(this, 140) {
    override def displayName = "Last Name"
    override def dbColumnName = "lastname"
  }  
  
  object profilepic extends MappedStringExtended(this, 1028) {
    override def displayName = "Profile Pic"
    override def dbColumnName = "profile_pic"
  } 
  
  object email extends MappedEmailExtended(this, 140) {
    override def displayName = "Email"
  }  
  
  object username extends MappedStringExtended(this, 140) {
    override def displayName = "Username"
    
    // http://scala-tools.org/mvnsites/liftweb-2.4-M4/#net.liftweb.mapper.MappedString
    override def validations = valUnique(displayName+" already exists") _ :: super.validations
  
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
  
  // TODO mask password when json-ing
  // this was once a MappedPassword, but with angularjs talking over REST, there's no real point
  // Trying to use the db tables I have - not worry about migrating to some new version of tables.
  object password extends MappedStringExtended(this, 140) {
    override def displayName = "Password"
  }
  
  // https://github.com/lift/framework/blob/master/persistence/mapper/src/main/scala/net/liftweb/mapper/MappedDate.scala
  object dateOfBirth extends MappedDateExtended(this) {

    override def displayName = "Date of Birth"
    override def dbColumnName = "dob"
      
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
  
  val F = """(\w+)""".r
  val FL = """(\w+)\s+(\w+)""".r
  val FML = """(\w+)\s+([^ ]+)\s+(\w+)""".r
  
  def name(s:String) = {
    s match {
      case F(f) => { first(f); }
      case FL(f, l) => { first(f); last(l); }
      case FML(f, m, l) => { first(f); last(l); }
      case _ => 
    }
  }

  // define an additional field for a personal essay
  object bio extends MappedTextareaExtended(this, 2048) {
    override def textareaRows  = 10
    override def textareaCols = 50
    override def displayName = "Bio"
  }
  
  // query the circle_participant table to find out what circles you belong to
  def circles = CircleParticipant.findAll(By(CircleParticipant.person, this.id))
  
  // new&improved version of 'circles' above
  // return a List[Circle] not just the fkeys
  def circleList = circles.map(fk => fk.circle.obj.open_!).filter(c => !c.isExpired && !c.isDeleted)
  
  def expiredCircles = circles.map(fk => fk.circle.obj.open_!).filter(c => c.isExpired && !c.isDeleted)
  
  // For active circles (I think expired circles too)
  def giftlist(viewer:User, circle:Circle) = {     		
    val sql = "select g.* from gift g join recipient r on r.gift_id = g.id where r.person_id = "+this.id+" order by g.date_created desc"   
    val gifts = Gift.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
    gifts.filter(g => viewer.canSee(this, g, circle)).map(g => {
      g.canedit = viewer.canEdit(g)
      g.candelete = viewer.canDelete(g)
      g.canbuy = viewer.canBuy(g)
      g.canreturn = viewer.canReturn(g)
      g
    })
  }
  
  /**
   * "My wish list" is outside the context of any circle and 'this' user is the viewer
   * so there are no arguments to this method.  The gifts returned by this method can
   * have null or non-null circle id's.
   * <P>
   * Is there any difference between "my wish list" and my view of my xmas list?
   * Possibly.  The xmas list won't show items that you want with someone else if
   * that person isn't a member of the xmas circle.  But that item will appear
   * in "my wish list".  Birthday - another good example - won't show stuff that I 
   * want with Tamie.  But "my wish list" should show that stuff.
   */
  def mywishlist = {    		
    val sql = "select g.* from gift g join recipient r on r.gift_id = g.id where r.person_id = "+this.id+" order by g.date_created desc"   
    val gifts = Gift.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
    gifts.filter(g => canSee(g)).map(g => {
      g.canedit = this.canEdit(g)
      g.candelete = this.canDelete(g)
      g.canbuy = this.canBuy(g)
      g.canreturn = this.canReturn(g)
      g
    })
  }
  
  /**
   * The gift must be for me.  It must have been added by me, or if it's for 
   * me and someone else, it must have been added by one of us.  And the gift
   * must not have been received yet (received = circle is expired and sender not null)
   */
  def canSee(gift:Gift):Boolean = { gift.isFor(this) && gift.wasAddedByARecipient && !gift.hasBeenReceived }
  
  /**
   * 'this' person is the viewer
   */
  def canSee(recipient:User, gift:Gift, circle:Circle) = (this, recipient, gift.sender.obj, gift, circle) match {
    // You can't see the recipient's gift in the context of this circle, because in this circle
    // the 'recipient' is only a 'giver'
    case(_, r, _, _, c) if(!r.isReceiver(c)) => false 
    
    // You CANNOT see the gift
    // - if it is for more than one person 
    // - and all the recipients are not receivers in the circle
    // Think: Birthdays, Mothers Day, Fathers Day, etc.  Don't show stuff
    // on my birthday list that is for me and Tamie.
    case(_, _, _, g, c) if(!c.containsAll(g.recipientList)) => false;
    
    // You CAN see the gift in this context of this circle because:
    // - the circle is still active
    // - the item hasn't been bought
    // - and you (the viewer) are the one who added this gift
    case(v, _, Empty, g, c) if(!c.isExpired && v.addedThis(g)) => {
      if(gift.description=="gift17") println("case(v, _, Empty, g, c) if(!c.isExpired && v.addedThis(g))")
      true
    }
    
    // You CAN see this gift IF
    // - the circle is still active
    // - the item hasn't been bought
    // - you are a recipient of the gift AND the gift was added by another recipient
    case(v, _, Empty, g, c) if(!c.isExpired && g.isFor(v)) => {
      if(gift.description=="gift17") println("case(v, _, Empty, g, c) if(!c.isExpired && v.isRecipient(g))")
      g.wasAddedByARecipient
    }
    
    
    // You CAN see this gift IF
    // - the circle is still active
    // - the item hasn't been bought
    // - you are not the one receiving this gift
    case(v, _, Empty, g, c) if(!c.isExpired && g.isForSomeoneElse(v)) => {
      if(gift.description=="gift17") println("case(v, _, Empty, g, c) if(!c.isExpired && !v.isRecipient(g))")
      true
    }
    
    // This item HAS been bought.  You will be able to see it if...
    // - the circle is still active
    // - you added this item to your own list
    // - and you have not yet received this item
    case(v, r, s:Full[User], g, c) if(!c.isExpired && v.addedThis(g) && !g.hasBeenReceived) => {
      if(gift.description=="gift17") println("case(v, r, s:Full[User], g, c) if(!c.isExpired && v.addedThis(g) && !g.hasBeenReceived)")
      true
    }
    
    // This item HAS been bought.  You will be able to see it if...
    // - the circle is still active
    // - and you have not yet received this item
    case(v, r, s:Full[User], g, c) if(!c.isExpired && g.isFor(v) && g.wasAddedByARecipient && !g.hasBeenReceived) => {
      if(gift.description=="gift17") println("case(v, r, s:Full[User], g, c) if(!c.isExpired && v.isRecipient(g) && !g.hasBeenReceived)")
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
      if(gift.description=="gift17") println("case(_, _, s:Full[User], g, c) if(c.isExpired && g.circle.obj.map(_.id.is).openOr(-1)==c.id.is)")
      true
    }
    
    case(_, _, _, g, c) if(c.isExpired && !g.wasBoughtInThisCircle(c)) => false
    
    // the gift has been received in another circle, so you cannot see this gift in THIS circle
    case(_, _, s:Full[User], g, c) if(g.hasBeenReceivedInAnotherCircle(c)) => false
    
    case _ => {println("should catch this case"); true}

  }
  
  def isReceiver(c:Circle) = CircleParticipant.find(By(CircleParticipant.circle, c.id), By(CircleParticipant.person, this.id)) match {
    case Full(participant) if(participant.isReceiver) => true
    case _ => false
  }
  
  def addedThis(g:Gift) = {
    g.addedBy.is==this.id.is
  }
  
  /**
   * Have to pass in the circle also.  The gift may not have a circle because it
   * was added to "my wish list".  Or the gift may have been added in the context of
   * one circle but bought in another
   */
  def buy(g:Gift, c:Circle) = {
    g.sender(this).circle(c).save()
  }
  
  def findByName(f:String, l:String) = {
    User.findAll(Cmp(User.first, OprEnum.Like, Full("%"+f.toLowerCase+"%"), Empty, Full("LOWER")),
        Cmp(User.last, OprEnum.Like, Full("%"+l.toLowerCase+"%"), Empty, Full("LOWER")))
  }
  
  override def toForm(button: Box[String], f: User => Any): NodeSeq = {
    println("User.toForm")
    super.toForm(button, f)
  }
  
  def canEdit(g:Gift):Boolean = {
    (iadded(g) || (iamrecipient(g) && g.wasAddedByARecipient)) && !g.hasBeenReceived
  }
  
  def canDelete(g:Gift):Boolean = {
    canEdit(g)
  }
  
  def canBuy(g:Gift):Boolean = {
    !g.isBought && !iamrecipient(g)
  }
  
  def canReturn(g:Gift):Boolean = {
    ibought(g) && !g.hasBeenReceived
  }
  
  private def iadded(g:Gift):Boolean = {
    addedThis(g)
  }
  
  private def iamrecipient(g:Gift):Boolean = {
    g.isFor(this)
  }
  
  private def ibought(g:Gift):Boolean = g.sender.obj match {
    case Full(sender) => sender.id.equals(this.id)
    case _ => false
  }
  
  def asJsShallow:JValue = {
    JObject(List(JField("id", JInt(this.id.is)), 
                 JField("first", JString(this.first)), 
                 JField("last", JString(this.last)), 
                 JField("fullname", JString(this.first + " " + this.last)), 
                 JField("username", JString(this.username)), 
                 JField("profilepic", JString(this.profilepic)),
                 JField("email", JString(this.email)),
                 JField("bio", JString(this.bio)),
                 JField("age", JInt(this.age.is)),
                 JField("dateOfBirth", if(this.dateOfBirth.is == null) { JsonAST.JNull } else { JInt(this.dateOfBirth.is.getTime()) } )
                 ))
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = {
    val jsonActiveCircles = circleList.map(_.asJs)
    val jsActive = JsArray(jsonActiveCircles)
    val jsonExpiredCircles = expiredCircles.map(_.asJs)
    val jsExpired = JsArray(jsonExpiredCircles)
    val dobString = dateOfBirth.is match {
      case null => ""
      case d:Date => new SimpleDateFormat("M/d/yyyy").format(d)
    }
    List(("dateOfBirthStr", dobString), ("fullname", JString(first+" "+last)), ("circles", jsActive), ("expiredcircles", jsExpired))        
  }

}

/**
 * The singleton that has methods for accessing the database
 */
object User extends User with LongKeyedMetaMapper[User] {
  
  override def dbTableName = "person" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(id, first, last, email,
  username, password, dateOfBirth, profilepic, bio)
  
  // mapper won't let you query by password
  val queriableFields = List(User.first, User.last, User.username, User.email)
}
