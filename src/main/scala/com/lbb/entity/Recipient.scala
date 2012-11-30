package com.lbb.entity
import net.liftweb.mapper.IdPK
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongForeignKey
import scala.xml.Text
import net.liftweb.mapper.By

/**
 * READY TO DEPLOY
 */

/**
 * 
CREATE TABLE IF NOT EXISTS `recipient` (
  `id` bigint(20) NOT NULL auto_increment,
  `person_id` bigint(20) NOT NULL,
  `gift_id` bigint(20) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `recipient_person_id_fk` (`person_id`),
  KEY `recipient_gift_id_fk` (`gift_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10937 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `recipient`
--
ALTER TABLE `recipient`
  ADD CONSTRAINT `recipient_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `recipient_ibfk_2` FOREIGN KEY (`gift_id`) REFERENCES `gift` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

 */


/**
 * NO OUTSTANDING CHANGES TO ME MADE TO THIS CLASS - THIS CLASS AGREES WITH THE
 * DB TABLE AT EATJ.COM
 */


class Recipient extends LongKeyedMapper[Recipient] with IdPK {
  def getSingleton = Recipient
  
  object person extends MappedLongForeignKey(this, User) { 
    override def dbColumnName = "person_id"
  }
  
  object gift extends MappedLongForeignKey(this, Gift) {
    override def dbColumnName = "gift_id"
  }
  
  def giftDescr =
    Text((gift.obj.map(_.description.is) openOr "Unknown"))
  
  def name : Text = (first, last, email) match {
    case(f, l, e) if f.length > 0 && l.length > 0 => Text(f + " " + l)
    case(f, _, _) if f.length > 0 => Text(f)
    case(_, _, e) => Text(e)
  }
  
  def first = {
    person.obj.map(_.first.is) openOr ""
  }
  
  def last = {
    person.obj.map(_.last.is) openOr ""
  }
  
  def email = {
    person.obj.map(_.email.is) openOr ""
  }
}

object Recipient extends Recipient with LongKeyedMetaMapper[Recipient] {
  override def dbTableName = "recipient"
  
  def merge(keep:User, delete:User) = {
    findAll(By(Recipient.person, delete.id.is)).foreach(r => {r.person(keep.id.is);r.save})
  }
}