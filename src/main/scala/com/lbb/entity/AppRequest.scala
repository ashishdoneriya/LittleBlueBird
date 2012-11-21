package com.lbb.entity
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.LongKeyedMapper
import com.lbb.util.LbbLogger
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.ManyToMany
import net.liftweb.mapper.MappedString

/**
 * delimiter $$

CREATE TABLE `app_request` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `facebook_id` varchar(140) NOT NULL,
  `fbreqid` varchar(140) NOT NULL,
  `inviter_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `app_request_inviter_id` (`inviter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1$$


 */
class AppRequest extends LongKeyedMapper[AppRequest] with LbbLogger with ManyToMany {
  def getSingleton = AppRequest
  
  def primaryKeyField = id
  object id extends MappedLongIndex(this)

  object inviter extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "inviter_id"
    override def dbNotNull_? : Boolean = true
  }

  object fbreqid extends MappedString(this, 140) {
    override def dbNotNull_? : Boolean = true
  }

  object facebookId extends MappedString(this, 140) {
    override def dbColumnName = "facebook_id"
    override def dbNotNull_? : Boolean = true
  }
  
}


object AppRequest extends AppRequest with LongKeyedMetaMapper[AppRequest] {
  
  override def dbTableName = "app_request" // define the DB table name
    
}