package com.lbb
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.mapper.IdPK
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedBoolean
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedTextarea
import net.liftweb.mapper.By

class Gift extends LongKeyedMapper[Gift] with IdPK {
  def getSingleton = Gift
  
  object circle extends MappedLongForeignKey(this, Circle)
  object sender extends MappedLongForeignKey(this, User)
  object addedBy extends MappedLongForeignKey(this, User)

  // define an additional field for a personal essay
  object description extends MappedTextarea(this, 2048) {
    override def textareaRows  = 10
    override def textareaCols = 50
    override def displayName = "Description"
  } 
  
  // TODO validate url
  object url extends MappedString(this, 1028) {
    override def displayName = "URL"
  }
  
  // TODO validate url
  object affiliateUrl extends MappedString(this, 1028) {
    override def displayName = "Affiliate URL"
  }
  
  def recipients = Recipient.findAll(By(Recipient.gift, this.id))
  
  def wasAddedByARecipient = {
    this.recipients.map(_.person.obj.map(_.id.is) openOr -1).contains(this.addedBy.is)
  }
  
  /**
   * A gift has been received if the sender is not null and g.circle is expired
   */
  def hasBeenReceived = (this.sender.obj, this.circle.obj) match {
    case(s:Full[User], c:Full[Circle]) if(c.open_!.isExpired) => true
    case _ => false
  }
  
  def hasBeenReceivedInAnotherCircle(c:Circle) = {
    if(!hasBeenReceived) {
      false
    }
    
    this.circle.obj match {
      case f:Full[Circle] => {
        val differentCircle = f.open_!.id.is!=c.id.is
        differentCircle
      }
      case _ => false
    }
  }
  
  def isForSomeoneElse(u:User) = !isFor(u)
  
  def isFor(u:User) = {
    this.recipients.map(_.person.obj.map(_.id.is) openOr -1).contains(u.id.is)
  }
  
  def wasBoughtInThisCircle(circle:Circle) = (this.sender.obj, this.circle.obj) match {
    case(Empty, _) => false
    case(s:Full[User], c:Full[Circle]) if(circle.id.is==c.open_!.id.is) => true
    case _ => false
  }
  
  def addRecipient(u:User) = {
    Recipient.create.person(u).gift(this).save
  }
}

object Gift extends Gift with LongKeyedMetaMapper[Gift] {
  override def dbTableName = "gift" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(description, url)
}