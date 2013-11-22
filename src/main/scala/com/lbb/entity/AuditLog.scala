package com.lbb.entity
import com.lbb.util.LbbLogger
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedDateTime
import net.liftweb.http.S
import net.liftweb.common.Box
import net.liftweb.http.Req
import java.util.Date
import net.liftweb.mapper.By
import com.lbb.util.Email

/**
 * id - auto incr
 * user_id   bigint 20
 * username  varchar 255
 * firstname varchar 255
 * lastname varchar 255
 * email varchar 255
 * remote_ip varchar 255 
 * request_url varchar 1024
 * query_string varchar 1024
 * session_id varchar 255
 * timestamp timestamp  not null
 * action  varchar 1024 not null  i.e.  Login, Logout
 * 
 * 

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` bigint(20) NOT NULL auto_increment,
  `user_id` bigint(20) default NULL,
  `username` varchar(255) default NULL,
  `firstname` varchar(255) default NULL,
  `lastname` varchar(255) default NULL,
  `email` varchar(255) default NULL,
  `remote_ip` varchar(255) default NULL,
  `request_url` varchar(1024) default NULL,
  `query_string` varchar(1024) default NULL,
  `session_id` varchar(255) default NULL,
  `timestamp` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `action` varchar(1024) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `audit_log_user_id_fk` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=101328 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

 * 
 */
class AuditLog extends LongKeyedMapper[AuditLog] with LbbLogger { 

  def getSingleton = AuditLog
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  object person extends MappedLongForeignKey(this, User) { 
    override def dbColumnName = "user_id"
  }
  
  object username extends MappedString(this, 255)
  
  object firstname extends MappedString(this, 255)
  
  object lastname extends MappedString(this, 255)
  
  object email extends MappedString(this, 255)
  
  object remote_ip extends MappedString(this, 255)
  
  object request_url extends MappedString(this, 1024)
  
  object query_string extends MappedString(this, 1024)
  
  object session_id extends MappedString(this, 255)
  
  object timestamp extends MappedDateTime(this) {
    override def is = new Date()
  } // don't have to supply values (?) because this defaults to current_timestamp
  
  object action extends MappedString(this, 1024) // NOT NULL on eatj.com but this definition will not create the column that way TODO should probably figure out how to define NOT NULL here
}

object AuditLog extends AuditLog with LongKeyedMetaMapper[AuditLog] {
  override def dbTableName = "audit_log" // define the DB table name
    
  def recordLogin(user:User, box:Box[Req]) = {
    recordAction(user, box, "Login")
  }
    
  def recordLogout(user:User, box:Box[Req]) = {
    recordAction(user, box, "Logout")
  }
  
  def friendInsertBegin(friend:Friend) = {
    val action = "FRIEND INSERT BEGIN: make "+friend.user.is+" and "+friend.friend.is+" friends"
    AuditLog.create.action(action).save
  }
  
  def friendInsertSuccess(friend:Friend) = {
    val action = "FRIEND INSERT SUCCESS: "+friend.user.is+" and "+friend.friend.is+" are now friends"
    AuditLog.create.action(action).save
  }
  
  def friendSaveError(friend:Friend, e:Throwable) = {
    val action = "FRIEND SAVE ERROR: trying to make "+friend.user.is+" and "+friend.friend.is+" friends: Error Type: "+e.getClass.getName+"  Error Message: "+e.getMessage
    AuditLog.create.action(action).save
  }
  
  def friendsAlready(friend:Friend) = {
    val action = "FRIEND ALREADY: "+friend.user.is+" and "+friend.friend.is
    AuditLog.create.action(action).save
  }
  
  def friendDeleted(friend:Friend) = {
    val action = "FRIEND DELETED: "+friend.user.is+" and "+friend.friend.is
    AuditLog.create.action(action).save
  }
  
  def error(e:String) = {
    AuditLog.create.action(e).save
  }
  
  def emailBegin(e:Email) = {
    val action = "EMAIL BEGIN: FROM:"+e.fromemail+" TO:"+e.to+" SUBJECT:"+e.subject
    AuditLog.create.action(action).save
  }
  
  def emailEnd(e:Email) = {
    val action = "EMAIL END: FROM:"+e.fromemail+" TO:"+e.to+" SUBJECT:"+e.subject
    AuditLog.create.action(action).save
  }
  
  def circleInserted(c:Circle) = {
    // don't have username, firstname, lastname, email, remote ip (don't think), request url, query string, or session id
    val action = "CIRCLE INSERTED:  ID="+c.id+" NAME="+c.name
    AuditLog.create.person(c.creator.is).action(action).save
  }
  
  // We don't know who is updating the circle because that info isn't passed from client to server (2013-10-24)
  // We should probably be passing the user id on all REST calls
  // FOR BOTH UPDATE's AND DELETE's
  def circleUpdated(c:Circle) = {
    // don't have username, firstname, lastname, email, remote ip (don't think), request url, query string, or session id
    val action = "CIRCLE UPDATED:  ID="+c.id+" NAME="+c.name+" (may not have been the name that changed)"
    AuditLog.create.firstname("unknown").action(action).save
  }
  
  def circleDeleted(c:Circle) = {
    // don't have username, firstname, lastname, email, remote ip (don't think), request url, query string, or session id
    val action = "CIRCLE DELETED:  ID="+c.id+" NAME="+c.name+" (may not have been the name that changed)"
    AuditLog.create.firstname("unknown").action(action).save
  }
  
  
  def giftInserted(g:Gift) = {
    // don't have username, firstname, lastname, email, remote ip (don't think), request url, query string, or session id
    val action = "GIFT INSERTED:  ID="+g.id+" DESCRIPTION="+g.description
    AuditLog.create.person(g.addedBy.is).action(action).save
  }
  
  
  def giftUpdated(g:Gift) = {
    // don't have username, firstname, lastname, email, remote ip (don't think), request url, query string, or session id
    val action = "GIFT UPDATED:  ID="+g.id+" DESCRIPTION="+g.description+" (may not have been the description that changed)"
    AuditLog.create.person(g.addedBy.is).action(action).save
  }
  

  def giftDeleted(g:Gift) = {
    // don't have username, firstname, lastname, email, remote ip (don't think), request url, query string, or session id
    val action = "GIFT DELETED: ID="+g.id+" DESCRIPTION="+g.description
    AuditLog.create.person(g.addedBy.is).action(action).save
  }
  
  private def recordAction(user:User, box:Box[Req], action:String) = {
    val remoteIp = box.map(_.remoteAddr).openOr("")
    val reqUrl = box.map(_.uri).openOr("")
    val queryString = box.map(_.request.queryString.openOr("")).openOr("")
    val sessionId = box.map(_.sessionId.openOr("")).openOr("")
            
    AuditLog.create.person(user).username(user.username).firstname(user.first)
    .lastname(user.last).email(user.email).remote_ip(remoteIp).request_url(reqUrl)
    .query_string(queryString).session_id(sessionId).action(action).save
  }
  
  def merge(keep:User, delete:User) = {
    // for now, just delete the audit_log records for the delete user
    val r = AuditLog.findAll(By(AuditLog.person, delete.id.is))
    r.foreach(_.delete_!)
  }
}