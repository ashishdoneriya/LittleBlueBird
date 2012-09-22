package com.lbb.entity

import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import scala.math.BigInt.int2bigInt
import scala.math.BigInt.long2bigInt
import scala.xml.Elem
import scala.xml.NodeSeq
import scala.xml.Text
import org.joda.time.DateMidnight
import org.joda.time.Years
import javax.swing.ImageIcon
import net.liftweb.common.Box.box2Iterable
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JsExp.intToJsExp
import net.liftweb.http.js.JsExp.jValueToJsExp
import net.liftweb.http.js.JsExp.strToJsExp
import net.liftweb.http.js.JsExp
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JInt
import net.liftweb.json.JsonAST.JObject
import net.liftweb.json.JsonAST.JString
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonAST
import net.liftweb.mapper.MappedField.mapToType
import net.liftweb.mapper.By
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.IHaveValidatedThisSQL
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.OprEnum
import net.liftweb.util.FieldError
import net.liftweb.mapper.MappedInt
import com.lbb.gui.MappedDateExtended
import com.lbb.gui.MappedTextareaExtended
import com.lbb.gui.MappedEmailExtended
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.json.JsonAST.JBool
import com.lbb.util.LbbLogger
import net.liftweb.mapper.MappedString
import net.liftweb.json.JsonAST.JArray
import net.liftweb.mapper.In
import net.liftweb.mapper.ByList
import net.liftweb.mapper.MappedBoolean
import net.liftweb.http.JsonResponse
import net.liftweb.http.S
import com.lbb.util.RequestHelper
import net.liftweb.mapper.ManyToMany


/**
 * READY TO DEPLOY
 * 
 *  Outstanding changes to make:
 *  PARENT_ID - can be null
 *  DATE_CREATED - mysql provides default
 *  DATE_UPDATED - can be null
 *  SUBSCRIPTION_LEVEL_ID - can be null
 *  SUBSCRIBERS_ALLOWED - mysql provides default of 0
 *  MEMBERSHIP_STATUS_ID - default is 2
 *  EXPIRATION_DATE - can be null
 *  GENDER - changed db at eatj.com to allow null
 *  CITY - can be null
 *  STATE - can be null
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
  `GENDER` varchar(8) default NULL,
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
class User extends LongKeyedMapper[User] with LbbLogger with ManyToMany {
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
  
  object first extends MappedString(this, 140) {
    override def displayName = "First Name"
    override def dbColumnName = "firstname"
  }
  
  object last extends MappedString(this, 140) {
    override def displayName = "Last Name"
    override def dbColumnName = "lastname"
  }  
  
  object profilepic extends MappedString(this, 1028) {
    override def displayName = "Profile Pic"
    override def dbColumnName = "profile_pic"
  } 
  
  object email extends MappedEmailExtended(this, 140) {
    override def displayName = "Email"
  }  
  
  object username extends MappedString(this, 140) {
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
  object password extends MappedString(this, 140) {
    override def displayName = "Password"
  }
  
  object facebookId extends MappedString(this, 140) {
    override def dbColumnName = "facebook_id"
  }
  
  object fbreqid extends MappedString(this, 140) {
    override def dbColumnName = "fb_request_id"
  }
  
  object notifyonaddtoevent extends MappedString(this, 8) {
    override def defaultValue = "true"
    override def dbNotNull_? : Boolean = true
  }
  
  object notifyondeletegift extends MappedString(this, 8) {
    override def defaultValue = "true"
    override def dbNotNull_? : Boolean = true
  }
  
  object notifyoneditgift extends MappedString(this, 8) {
    override def defaultValue = "true"
    override def dbNotNull_? : Boolean = true
  }
  
  object notifyonreturngift extends MappedString(this, 8) {
    override def defaultValue = "true"
    override def dbNotNull_? : Boolean = true
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
      case Pat(m, d, y) => err = Nil; debug("parse: case Pat(m, d, y): errors..."); err.foreach(debug(_)); Full(dateFormat.parse(s))
      case "" => err = Nil; debug("parse: case \"\": errors..."); err.foreach(debug(_)); this.set(null); Empty
      case _ => err = FieldError(this, Text("Use MM/dd/yyyy format")) :: Nil; debug("parse: case _ :  errors..."); err.foreach(debug(_)); this.set(null); Empty
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
      case F(f) => { first(f) }
      case FL(f, l) => { first(f); last(l) }
      case FML(f, m, l) => { first(f); last(l) }
      case _ => first(s);
    }
    this
  }

  // define an additional field for a personal essay
  object bio extends MappedTextareaExtended(this, 2048) {
    override def textareaRows  = 10
    override def textareaCols = 50
    override def displayName = "Bio"
  }
  
  def reminders = Reminder.findAll(By(Reminder.viewer, this.id))
  
  // query the circle_participant table to find out what circles you belong to
  def circles = CircleParticipant.findAll(By(CircleParticipant.person, this.id))
  
  def activeCircles = for(cpid <- circles; c <- cpid.circle.obj; if(!c.isExpired && !c.isDeleted)) yield c

  def circleList = {
    val expiredCircles = for(cpid <- circles; c <- cpid.circle.obj; if(c.isExpired && !c.isDeleted)) yield c
    val ec = expiredCircles.sortWith(_.date.getTime > _.date.getTime)
    val thelist = activeCircles.sortWith(_.date.getTime < _.date.getTime) :: ec :: Nil
    thelist.flatten
  }

  // For active circles (I think expired circles too)
  // Note: You can't put circleid anywhere in the where clause because a gift may have been bought - but not received
  // in one circle, but it since it hasn't been received, it still needs to show up when looking at any other circle.
  // This canedit/candelete/canbuy/canreturn logic is also being used in Gift.edbr 
  def giftlist(viewer:User, circlebox:Box[Circle]) = {     		
    
    // this sql works but how do I handle the first/last from person table
    val sql = "select g.*, p.firstname as addedbyFirst, p.lastname as addedbyLast from person p, gift g join recipient r on r.gift_id = g.id where r.person_id = "+this.id+" and g.entered_by = p.id order by g.date_created desc"
    
    val gifts = Gift.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
    gifts.filter(g => viewer.canSee(this, g, circlebox)).map(g => {
      g.canedit = viewer.canEdit(g)
      g.candelete = viewer.canDelete(g)
      g.canbuy = viewer.canBuy(g)
      g.canreturn = viewer.canReturn(g)
      g.canseestatus = viewer.canSeeStatus(g)
      g.issurprise = !this.knowsAbout(g)
      debug("for gift: "+g.description+": g.canseestatus="+g.canseestatus+", g.canbuy="+g.canbuy);
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
      g.canseestatus = this.canSeeStatus(g)
      g.issurprise = !this.knowsAbout(g)
      g
    })
  }
  
  /**
   * Returns a boolean indicating whether or not gifts have already been purchased for
   * this person in this circle.  Why do we have this method?  It tells us whether or
   * not a person can be deleted from an event.  We don't want to allow users to be
   * deleted from events if gifts have already been purchased for this person.
   */
  def giftsHaveBeenPurchasedForMe(circle:Circle) = {
    val sql = "SELECT r.gift_id, g.description, g.sender_id, g.circle_id " +
    		  "FROM recipient r " +
    		  "join gift g on g.id = r.gift_id " +
    		  "join person p on p.id = g.sender_id " +
    		  "where person_id = " + id.is + " and g.circle_id = " + circle.id.is 
    val gifts = Gift.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
    if(gifts.size > 0) true else false
  }
  
  /**
   * Tells you whether this gift is/was a surprise or not
   * You know about a gift if:
   * - you added it (added by 'this')
   * - the gift was added by a recipient and 'this' is also a recipient
   * - gift is not for me ('this' is not a recipient)
   */
  def knowsAbout(g:Gift) = {
    val a = this.addedThis(g)
    val b = g.isFor(this) && g.wasAddedByARecipient
    val c = !g.isFor(this)
    a || b || c
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
  def canSee(recipient:User, gift:Gift, circlebox:Box[Circle]) = (this, recipient, gift.sender.obj, gift, circlebox) match {
    
    // If circlebox is Empty, then it means 'this' user is looking at someone's wish list outside the ctx of an event
    // In that case, there are a few cases where I cannot see the item:
    // I cannot see an item if it is for me also and the adder is not a recipient
    case (me, _, _, g, Empty) if(g.isFor(me) && !g.wasAddedByARecipient) => false
    
    // I cannot see an item that has been received
    case (_, _, _, g, Empty) if(g.hasBeenReceived) => false
    
    // Otherwise, we should fall through to case _ and show item
    
    // UNANSWERED QUESTION:  If a gift was bought outside the ctx of an event, how do I go back and see who gave me what?  
    // Currently, there's no way to review received gifts
    // that were bought outside the ctx of an event!
    
    
    // You can't see the recipient's gift in the context of this circle, because in this circle
    // the 'recipient' is only a 'giver'
    case(_, r, _, _, Full(c)) if(!r.isReceiver(c)) => false 
    
    // You CANNOT see the gift
    // - if it is for more than one person 
    // - and all the recipients are not receivers in the circle
    // Think: Birthdays, Mothers Day, Fathers Day, etc.  Don't show stuff
    // on my birthday list that is for me and Tamie.
    case(_, _, _, g, Full(c)) if(!c.containsAll(g.recipientList)) => false
    
    // 6/6/2012:  In an active circle, you CAN see the gift
    // if you know about it AND the gift hasn't been received yet.  
    // Doesn't matter here if the gift has been bought or not
    case(me, _, _, g, Full(c)) if(!c.isExpired) => me.knowsAbout(g) && !g.hasBeenReceived
    
    // 6/6/2012:  In expired circles, you CAN see the gift if it was
    // received in this circle
    case(_, _, _, g, Full(c)) if(c.isExpired) => g.hasBeenReceivedInCircle(c)
    
    
    case _ => {debug("should catch this case"); true}

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
//  def buy(g:Gift, c:Circle) = {
//    g.sender(this).circle(c).save()
//  }
  
  /**
   * The opposite of buy() - when the user changes his mind and decides
   * not to give the gift after all.
   * Set the circle back to null in this case
   */
//  def returngift(g:Gift) = {
//    g.sender(Empty).circle(Empty).save()
//  }
  
  def findByName(f:String, l:String) = {
    User.findAll(Cmp(User.first, OprEnum.Like, Full("%"+f.toLowerCase+"%"), Empty, Full("LOWER")),
        Cmp(User.last, OprEnum.Like, Full("%"+l.toLowerCase+"%"), Empty, Full("LOWER")))
  }
  
  object friends extends MappedManyToMany(Friend, Friend.friend, Friend.user, User)
  
  def friendList = Friend.findAll(By(Friend.friend, this.id)).map(_.user.obj.open_!)
  
  override def toForm(button: Box[String], f: User => Any): NodeSeq = {
    debug("User.toForm")
    super.toForm(button, f)
  }
  
  def canEdit(g:Gift) = {
    (iadded(g) || (iamrecipient(g) && g.wasAddedByARecipient)) && !g.hasBeenReceived
  }
  
  def canDelete(g:Gift) = {
    canEdit(g)
  }
  
  def canBuy(g:Gift) = {
    !g.isBought && !iamrecipient(g)
  }
  
  def canReturn(g:Gift) = {
    ibought(g) && !g.hasBeenReceived
  }
  
  /**
   * Can 'this' user see a gift's "bought" status ?
   * Depends...
   * If I am a recipient, I can see the status if the gift has been received
   * If I am not a recipient, I can see the status anytime
   */
  def canSeeStatus(g:Gift) = {
    iamrecipient(g) match {
      case true => g.hasBeenReceived
      case false => true
    }
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
  
  /**
   * First, there was asJs.  Then I realized I needed a "shallow" version of User
   * so I created asJsShallow.  Then I needed to pass in Circle to find out if
   * any gifts have been bought for this user - I needed a view of a User as 
   * a receiver.  I need to know if any gifts have been bought for this user in
   * the given circle.  And I need to send this info to the client so I can
   * allow/prohibit the user from removing a participant from a circle.
   * Rule:  Only allow a participant to be removed from an event if no gifts
   * have been bought for that person in the given event.
   */
  def asReceiverJs(box:Box[Circle]) = {
    // this is the same as asJsShallow with one extra boolean field
    // TODO duplicated code here and in supplementalJs
    val profilepicUrl = if(profilepic.is==null || profilepic.is.trim().toString().equals("")) new URL("http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg") else new URL(profilepic.is)
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    
    val boolornull = box match {
      case Full(circle) => JBool(giftsHaveBeenPurchasedForMe(circle))
      case _ => JsonAST.JNull
    }
    
    JObject(List(JField("id", JInt(this.id.is)), 
                 JField("first", JString(this.first)), 
                 JField("last", JString(this.last)), 
                 JField("fullname", JString(this.first + " " + this.last)), 
                 JField("username", JString(this.username)), 
                 JField("profilepicUrl", JString(profilepicUrl.toString())),
                 JField("profilepicheight", JInt(profilepicheight)),
                 JField("profilepicwidth", JInt(profilepicwidth)),
                 JField("email", JString(this.email)),
                 JField("bio", JString(this.bio)),
                 JField("age", JInt(this.age.is)),
                 JField("dateOfBirth", if(this.dateOfBirth.is == null) { JsonAST.JNull } else { JInt(this.dateOfBirth.is.getTime()) } ),
                 JField("facebookId", JString(this.facebookId)),
                 JField("fbreqid", JString(this.fbreqid)),
                 JField("notifyonaddtoevent", JString(this.notifyonaddtoevent)),
                 JField("notifyondeletegift", JString(this.notifyondeletegift)),
                 JField("notifyoneditgift", JString(this.notifyoneditgift)),
                 JField("notifyonreturngift", JString(this.notifyonreturngift)),
                 JField("giftsHaveBeenPurchasedForMe", boolornull)
                 ))
  }
  
  def asJsShallow:JValue = {
    asReceiverJs(Empty)
  }
  
  /**
   * Like login, except that the user is returning inside a List.
   * This variant of login gets called when the user is logged in via User.query in apps.js, because User.query
   * defines the result as an array.
   */
  def loginarray = {
    val users = this :: Nil
    // record the login in the audit log
    AuditLog.recordLogin(this, S.request)
    val r = JsonResponse(JsArray(users.map(_.asJs)), Nil, List(RequestHelper.cookie("userId", this)), 200)
    debug("LOGGING IN ======================= JsonResponse=" + r.toString())
    r
  }
  
  /**
   * Use this when the ajax call is User.save - where the return type is NOT an array.
   * If the ajax call is expecting an array to be returned, call loginarray
   */
  def login = {
    // record the login in the audit log
    AuditLog.recordLogin(this, S.request)
    val r = JsonResponse(this.asJs, Nil, List(RequestHelper.cookie("userId", this)), 200)
    debug("LOGGING IN ======================= JsonResponse.toString().length()=" + r.toString().length())
    r
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = {
    val jsonCircles = circleList.map(_.asJs)
    val jsCircles = JsArray(jsonCircles)
    val jsonFriends = friendList.map(_.asJsShallow).toList//friendList.map(_.asJsShallow)
    val jsFriends = JArray(jsonFriends)
    val profilepicUrl = if(profilepic.is==null || profilepic.is.trim().toString().equals("")) new URL("http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg") else new URL(profilepic.is)
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    val dobString = dateOfBirth.is match {
      case null => ""
      case d:Date => new SimpleDateFormat("M/d/yyyy").format(d)
    }
    List(("dateOfBirthStr", dobString), 
         ("fullname", JString(first+" "+last)), 
         ("circles", jsCircles), 
         ("friends", jsFriends),
         ("profilepicUrl", JString(profilepicUrl.toString())), 
         ("profilepicheight", profilepicheight), 
         ("profilepicwidth", profilepicwidth))        
  }
  
  def addfriends(list:List[Map[String, Any]]) = {
          
    // This is all your friends from FB
    // won't remove anyone you have unfriended
    val allfriendids = for(map <- list; facebookId <- map.get("id")) yield {
      facebookId.toString
    }
    
    // you have to figure out which of them are already in the person table...
    val existingLbbUsers = User.findByFacebookId(allfriendids)
    val eee = existingLbbUsers.map(_.facebookId.is)
    
    // these are the fb id's of people that are not yet in the person table
    val notyetLbbUsers = allfriendids.filter(f => !eee.contains(f))
    
    // so save these to the person table...
    val newusers = for(map <- list; 
                       name <- map.get("name"); 
                       facebookId <- map.get("id"); 
                       profilepicUrl <- map.get("profilepicUrl");
                       if(notyetLbbUsers.contains(facebookId))) yield {
      
      val newperson = User.create
      newperson.name(name.toString()).profilepic(profilepicUrl.toString()).facebookId(facebookId.toString()).username(facebookId.toString()).email(null)
      newperson.save
      debug("saved to person table: "+name+"  FB: "+facebookId)
      newperson
    }
    
    // now figure out which are already associated with you in the friends table...
    val intheFriendsTable = this.friendList.map(_.id.is)
    val inthePersonTable = (existingLbbUsers :: newusers :: Nil).flatten
    val savetofriendstable = inthePersonTable.filter(f => !intheFriendsTable.contains(f.id.is))
    for(newfriend <- savetofriendstable) {
      Friend.associate(newfriend.id.is, this.id.is)
    }
                    
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
  val queriableFields = List(User.first, User.last, User.username, User.email, User.facebookId, User.fbreqid)
  
  def findByFacebookId(l:List[String]) = {
    User.findAll(ByList(User.facebookId, l)) 
  }
}
