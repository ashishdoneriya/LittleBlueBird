package com.lbb.entity
import java.util.Date
import scala.collection.immutable.List
import scala.collection.mutable.ListBuffer
import com.lbb.util.Emailer
import com.lbb.util.LbbLogger
import com.lbb.util.UrlListener
import com.lbb.util.Util
import net.liftweb.common.Box.box2Option
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.js.JsExp.jValueToJsExp
import net.liftweb.http.js.JsExp
import net.liftweb.json.JsonAST.JArray
import net.liftweb.json.JsonAST.JBool
import net.liftweb.json.JsonAST.JString
import net.liftweb.mapper.MappedField.mapToType
import net.liftweb.mapper.By
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedInt
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedDateTime
import com.lbb.gui.MappedTextareaExtended
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedLongIndex
import com.lbb.gui.MappedDateObservable
import com.lbb.util.DateChangeListener

/**
 * READY TO DEPLOY
 */

/**
 * 
CREATE TABLE IF NOT EXISTS `gift` (
  `ID` bigint(20) NOT NULL auto_increment,
  `ENTERED_BY` bigint(20) NOT NULL default '0',
  `CIRCLE_ID` bigint(20) default NULL,
  `DESCRIPTION` varchar(1024) default NULL,
  `DELETED` varchar(16) default NULL,
  `URL` varchar(1024) default NULL,
  `URL_AFF` varchar(1024) default NULL,
  `SENDER_ID` bigint(20) default NULL,
  `SENDER_NAME` varchar(64) default NULL,
  `STATUS` varchar(64) default NULL,
  `LIMIT_TO_CIRCLE_ID` bigint(20) NOT NULL default '-1',
  `REALLY_WANTS` int(11) default '0',
  `DATE_CREATED` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `DATE_REVIEWED` timestamp NULL default NULL,
  `RESULTS_OF_REVIEW` varchar(1024) default NULL,
  `DATE_MODIFIED` timestamp NULL default NULL,
  `URL_STATE` varchar(64) default NULL,
  `AFFILIATE_ID` bigint(20) default NULL,
  PRIMARY KEY  (`ID`),
  KEY `ENTERED_BY` (`ENTERED_BY`),
  KEY `CIRCLE_ID` (`CIRCLE_ID`),
  KEY `STATUS` (`STATUS`),
  KEY `gift_sender_id_fk` (`SENDER_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7287 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gift`
--
ALTER TABLE `gift`
  ADD CONSTRAINT `gift_ibfk_1` FOREIGN KEY (`ENTERED_BY`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gift_ibfk_2` FOREIGN KEY (`SENDER_ID`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

 */

/**
 * Outstanding columns to change/update in Mapper code:
  `LIMIT_TO_CIRCLE_ID` - default -1
  `DATE_CREATED` - default CURRENT_TIMESTAMP,
  `DATE_REVIEWED` - can be null
  `RESULTS_OF_REVIEW` - can be null
  `DATE_MODIFIED` - can be null
  `URL_STATE` - can be null
 */

class Gift extends LongKeyedMapper[Gift] with LbbLogger with DateChangeListener {
  def getSingleton = Gift
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  // UPDATE 6/7/2012:  Don't set the circleid until the item has been bought
  object circle extends MappedLongForeignKey(this, Circle) {
    override def dbColumnName = "CIRCLE_ID"
  }
  
  object affiliate extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "AFFILIATE_ID"
  }
  
  object sender extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "sender_id"
  }
  
  object sender_name extends MappedString(this, 1028) {
  }
  
  object status extends MappedString(this, 1028) {
  }
  
  object reallyWants extends MappedInt(this) {
    override def dbColumnName = "really_wants"
  }
  
  object addedBy extends MappedLongForeignKey(this, User) { 
    override def dbColumnName = "entered_by"
  }
  object dateCreated extends MappedDateTime(this) {
    override def dbColumnName = "date_created"
  
    override def toLong = {
      super.toLong * 1000L
    }
  }
  
  object deleted extends MappedString(this, 1028) {
  }

  // define an additional field for a personal essay
  object description extends MappedTextareaExtended(this, 2048) {
    override def textareaRows  = 10
    override def textareaCols = 50
    override def displayName = "Description"
  }   
  
  def setDescription(nu:String, updater:String) = {
    val old = description.is
    debug("Gift.setDescription:  updater="+updater+"  sender: "+sender.obj.getOrElse("n/a"))
    for(sss <- sender.obj; if(!sss.email.isEmpty()); if(!old.equals(nu))) yield {
      Emailer.notifyGiftDescriptionChanged(sss.email.is, sss.first.is, updater, old, nu)
    }
    description(nu)
  }
  
  object receivedate extends MappedDateObservable(this, this) {
    override def dbColumnName = "receive_date"
  }
  
  // TODO validate url
  object url extends MappedString(this, 1028) with UrlListener {
    override def displayName = "URL"
  
    override def apply(s:String) = {
      val obj = super.apply(s)
      val o2 = createAffLink(obj)
      o2
    }
  }
  
  // TODO validate url
  object affiliateUrl extends MappedString(this, 1028) {
    override def displayName = "Affiliate URL"
    override def dbColumnName = "URL_AFF"
  }
  
  def recipients = Recipient.findAll(By(Recipient.gift, this.id))
  
  def recipientList = recipients.map(fk => fk.person.obj.open_!)
  
  def recipientNames = {
    val names = recipientList.map(_.first.is)
    Util.toStringPretty(names)
  }
  
  /**
   * These are the people to notify when a gift is returned/unbought.
   * TODO need unit test for this
   */
  def getEmailListForReturns = {
    val circles = for(recip <- recipientList) yield {
      recip.activeCircles.filter(ccc => recip.isReceiver(ccc))
    }

    val sect = circles.foldLeft[List[Circle]](circles.flatten)((a,b)=>a.intersect(b))
    val all = sect.map(ccc => ccc.participantList).flatten
    val users = for(user <- all; if(!recipientList.contains(user))) yield {
      user
    }
    val ret = users.toSet.filter(u => isBought && u.id.is != sender.is)
    ret foreach {u => debug("Gift.getEmailListForReturns:  For: "+description.is+":  notify "+u.first.is)}
    ret
  }
  
  def addedByName = addedBy.obj.map(_.first.is).getOrElse("n/a")
  
  def wasAddedByARecipient = {
    this.recipients.map(_.person.obj.map(_.id.is) openOr -1).contains(this.addedBy.is)
  }
  
  /**
   * A gift has been received if the sender is not null and g.circle is expired
   */
  def hasBeenReceived = (this.sender.obj, this.circle.obj) match {
    case(Full(s), Empty) if(this.receivedate.is != null && this.receivedate.is.before(new Date())) => true
    case(Full(s), Full(c)) if(c.isExpired) => true
    case _ => { 
      debug("for gift: "+description.is+" - this.sender.obj="+this.sender.obj);
      debug("for gift: "+description.is+" - this.circle.obj="+this.circle.obj);
      debug("for gift: "+description.is+" - this.receivedate.is="+this.receivedate.is);
      if(this.receivedate.is != null) debug("for gift: "+description.is+" - this.receivedate.is.before(new Date())="+ (this.receivedate.is.before(new Date())) )
      false 
    }
  }
  
  def hasBeenReceivedInCircle(cir:Circle) = (this.sender.obj, this.circle.obj) match {
    case(Full(s), Full(c)) => c.id.is==cir.id.is
    case _ => false
  }
  
  /**
   * Not necessarily received in another circle, but rather: received AND not received in THIS circle (c)
   * What's the difference?  It is possible that the gift was received outside the context of ANY circle
   * This is a new capability as of 9/5/12
   */
  def hasBeenReceivedInAnotherCircle(c:Circle) = {
    hasBeenReceived && !hasBeenReceivedInCircle(c)
//    if(!hasBeenReceived) {
//      false
//    }
//    
//    this.circle.obj match {
//      case Full(f) => {
//        val differentCircle = f.id.is!=c.id.is
//        differentCircle
//      }
//      case _ => false
//    }
  }
  
  def isForSomeoneElse(u:User) = !isFor(u)
  
  def isFor(u:User) = {
    this.recipients.map(_.person.obj.map(_.id.is) openOr -1).contains(u.id.is)
  }
  
  // TODO do we need to check the circle or just the sender - just checking the sender for now
  def isBought = this.sender.obj.getOrElse("none") != "none"
  
  def wasBoughtInThisCircle(c:Circle) = (this.sender.obj, this.circle.obj) match {
    case(Empty, _) => false
    case(Full(sender), Full(circle)) if(c.id.is==circle.id.is) => true
    case _ => false
  }
  
  def addRecipient(u:User) = {
    Recipient.create.person(u).gift(this).save
  }
  
  val recipientsToSave:ListBuffer[Long] = ListBuffer()
  
  // TODO Don't like using a var but not sure how else to set recipients before the gift is saved
  def addRecipient(l:Long) = {
    recipientsToSave.append(l)
  }
  
  override def save() = {
    if(dateCreated.is==null) dateCreated(new Date())
    val saved = super.save();
    
    if(recipientsToSave.size > 0) {
      // delete current recipients before adding the new ones (even though they may be the same)
      Recipient.findAll(By(Recipient.gift, this)).foreach(_.delete_!)
      recipientsToSave foreach { r => {val rsaved = Recipient.create.person(r).gift(this).save;} }
      recipientsToSave.drop(0)
    }
    
    saved
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = {
    val jsonRecipients = recipientList.map(_.asJsShallow)
    val jsRecipients = JArray(jsonRecipients)
    List(("recipients", jsRecipients), 
         ("canedit", JBool(canedit)), 
         ("candelete", JBool(candelete)), 
         ("canbuy", JBool(canbuy)), 
         ("canreturn", JBool(canreturn)), 
         ("canseestatus", JBool(canseestatus)), 
         ("isbought", JBool(isBought)),
         ("issurprise", JBool(issurprise)),
         ("addedByName", JString(addedByName)))        
  }
  
  var canedit = false
  var candelete = false
  var canbuy = false
  var canreturn = false
  var canseestatus = false
  var issurprise = false
  var currentViewer:Box[User] = Empty
  var currentRecipient:Box[User] = Empty
  var currentCircle:Box[Circle] = Empty
  
  /*
   *  short for edit,delete,buy,return
   *  
   *  This logic was taken from User.giftlist  Also see User.mywishlist
   */
  def edbr = (currentViewer, currentRecipient) match {
    case (Full(viewer), Full(recipient)) => {
      canedit = viewer.canSee(recipient, this, currentCircle) && viewer.canEdit(this)
      candelete = viewer.canSee(recipient, this, currentCircle) && viewer.canDelete(this)
      canbuy = viewer.canSee(recipient, this, currentCircle) && viewer.canBuy(this)
      canreturn = viewer.canSee(recipient, this, currentCircle) && viewer.canReturn(this) 
      canseestatus = viewer.canSee(recipient, this, currentCircle) && viewer.canSeeStatus(this) 
      issurprise = !recipient.knowsAbout(this)
      debug("gift.edbr:  case (Full(viewer), Full(recipient), Full(circle)))")
    } // case (Full(viewer), Full(recipient), Full(circle))
    
    case _ => {
      canedit = true
      candelete = true
      canbuy = false
      canreturn = false
      canseestatus = false
      issurprise = false
      debug("gift.edbr:  case _")
    }
  }
  
  
  /**
   * Required by DateChangeListener - are we really using this?  not yet
   */
  def dateSet(c:Circle) = {}
  
  /**
   * Required by DateChangeListener - are we really using this?  not yet
   */
  def dateUnset = {}
  
  /**
   * Required by DateChangeListener - are we really using this?  not yet
   */
  def dateDeletedSet(c:Circle) = {}
  
}

object Gift extends Gift with LongKeyedMetaMapper[Gift] {
  override def dbTableName = "gift" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(description, url)
}