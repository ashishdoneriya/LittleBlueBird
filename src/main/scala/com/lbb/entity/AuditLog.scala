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
  
  object action extends MappedString(this, 1024)
}

object AuditLog extends AuditLog with LongKeyedMetaMapper[AuditLog] {
  override def dbTableName = "audit_log" // define the DB table name
    
  def recordLogin(user:User, box:Box[Req]) = {
    recordAction(user, box, "Login")
  }
    
  def recordLogout(user:User, box:Box[Req]) = {
    recordAction(user, box, "Logout")
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
}