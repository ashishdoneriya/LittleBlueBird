package com.lbb.entity
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.mapper.By
import net.liftweb.mapper.IHaveValidatedThisSQL
import net.liftweb.mapper.IdPK
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedBoolean
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedTextarea
import com.lbb.gui.MappedTextareaExtended
import com.lbb.gui.MappedStringExtended
import net.liftweb.http.js.JsExp
import net.liftweb.json.JsonAST.JString
import net.liftweb.http.js.JE.JsArray
import net.liftweb.common.Box
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.json.JsonAST.JBool
import net.liftweb.mapper.MappedLongIndex
import scala.collection.mutable.ListBuffer
import net.liftweb.mapper.MappedDateTime
import java.util.Date
import net.liftweb.mapper.MappedInt
import net.liftweb.mapper.MappedNullableField
import scala.collection.immutable.List
import com.lbb.util.Emailer
import com.lbb.util.Email
import com.lbb.util.Util

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

class Gift extends LongKeyedMapper[Gift] {
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
  
  object sender_name extends MappedStringExtended(this, 1028) {
  }
  
  object status extends MappedStringExtended(this, 1028) {
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
  
  object deleted extends MappedStringExtended(this, 1028) {
  }

  // define an additional field for a personal essay
  object description extends MappedTextareaExtended(this, 2048) {
    override def textareaRows  = 10
    override def textareaCols = 50
    override def displayName = "Description"
  }   
  
  def setDescription(nu:String, updater:String) = {
    val old = description.is
    println("Gift.setDescription:  updater="+updater+"  sender: "+sender.obj.getOrElse("n/a"))
    for(sss <- sender.obj; if(!sss.email.isEmpty()); if(!old.equals(nu))) yield {
      Emailer.notifyGiftDescriptionChanged(sss.email.is, sss.first.is, updater, old, nu)
    }
    description(nu)
  }
  
  // TODO validate url
  object url extends MappedStringExtended(this, 1028) {
    override def displayName = "URL"
  }
  
  // TODO validate url
  object affiliateUrl extends MappedStringExtended(this, 1028) {
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
    ret foreach {u => println("Gift.getEmailListForReturns:  For: "+description.is+":  notify "+u.first.is)}
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
    case(Full(s), Full(c)) if(c.isExpired) => true
    case _ => false
  }
  
  def hasBeenReceivedInCircle(cir:Circle) = (this.sender.obj, this.circle.obj) match {
    case(Full(s), Full(c)) => c.id.is==cir.id.is
    case _ => false
  }
  
  def hasBeenReceivedInAnotherCircle(c:Circle) = {
    if(!hasBeenReceived) {
      false
    }
    
    this.circle.obj match {
      case Full(f) => {
        val differentCircle = f.id.is!=c.id.is
        differentCircle
      }
      case _ => false
    }
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
    val jsonRecipients = recipientList.map(_.asJs)
    val jsRecipients = JsArray(jsonRecipients)
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
  def edbr = (currentViewer, currentRecipient, currentCircle) match {
    case (Full(viewer), Full(recipient), Full(circle)) => {
      canedit = viewer.canSee(recipient, this, circle) && viewer.canEdit(this)
      candelete = viewer.canSee(recipient, this, circle) && viewer.canDelete(this)
      canbuy = viewer.canSee(recipient, this, circle) && viewer.canBuy(this)
      canreturn = viewer.canSee(recipient, this, circle) && viewer.canReturn(this) 
      canseestatus = viewer.canSee(recipient, this, circle) && viewer.canSeeStatus(this) 
      issurprise = !recipient.knowsAbout(this)
      println("gift.edbr:  case (Full(viewer), Full(recipient), Full(circle)))")
    } // case (Full(viewer), Full(recipient), Full(circle))
    
    case _ => {
      canedit = true
      candelete = true
      canbuy = false
      canreturn = false
      canseestatus = false
      issurprise = false
      println("gift.edbr:  case _")
    }
  }
}

object Gift extends Gift with LongKeyedMetaMapper[Gift] {
  override def dbTableName = "gift" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(description, url)
}