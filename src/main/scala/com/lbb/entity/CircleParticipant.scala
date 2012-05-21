package com.lbb.entity
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.IdPK
import scala.xml.Text
import net.liftweb.mapper.MappedBoolean
import com.lbb.gui.MappedStringExtended
import com.lbb.gui.MappedDateExtended
import java.util.Date

/**
 * All columns match the eatj.com db
 */

/**
 * 
CREATE TABLE IF NOT EXISTS `circle_participants` (
  `ID` bigint(20) NOT NULL auto_increment,
  `CIRCLE_ID` bigint(20) NOT NULL default '0',
  `PERSON_ID` bigint(20) NOT NULL default '0',
  `DATE_INVITED` date NOT NULL default '0000-00-00',
  `INVITED_BY_ID` bigint(20) NOT NULL default '0',
  `DATE_DECIDED` date default NULL,
  `DECISION` varchar(16) default NULL,
  `PARTICIPATION_LEVEL` varchar(32) default NULL,
  PRIMARY KEY  (`ID`),
  UNIQUE KEY `CIRCLE_ID_2` (`CIRCLE_ID`,`PERSON_ID`),
  KEY `CIRCLE_ID` (`CIRCLE_ID`),
  KEY `PERSON_ID` (`PERSON_ID`),
  KEY `INVITED_BY_ID` (`INVITED_BY_ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1876 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `circle_participants`
--
ALTER TABLE `circle_participants`
  ADD CONSTRAINT `circle_participants_ibfk_4` FOREIGN KEY (`CIRCLE_ID`) REFERENCES `circles` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `circle_participants_ibfk_5` FOREIGN KEY (`PERSON_ID`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `circle_participants_ibfk_6` FOREIGN KEY (`INVITED_BY_ID`) REFERENCES `person` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

 */


class CircleParticipant extends LongKeyedMapper[CircleParticipant] with IdPK {
  def getSingleton = CircleParticipant
    
  // TODO make sure circle/person is unique
  object circle extends MappedLongForeignKey(this, Circle) {
    override def dbColumnName = "circle_id"
  }
  // TODO make sure you can't add the same person more than once
  object person extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "person_id"
  }
  object inviter extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "invited_by_id"
  }
  
  object participationLevel extends MappedStringExtended(this, 140) {
    override def dbColumnName = "participation_level"
    override def dbIndexed_? = true
  }
  
  object decision extends MappedStringExtended(this, 140) {
    override def dbColumnName = "decision"
    override def dbIndexed_? = true
  }
  
  // This was replaced by participationLevel
//  object receiver extends MappedBoolean(this)
  
  def isReceiver = "Receiver".equalsIgnoreCase(participationLevel.is)
  
  
  object date_invited extends MappedDateExtended(this) {
    override def dbColumnName = "date_invited"
    override def is = new Date()
  }
  
  object date_decided extends MappedDateExtended(this) {
    override def dbColumnName = "date_decided"
  }
  
  // TODO add date invited
  // TODO add accepted/rejected boolean (can be null)
  
  def circleName =
    Text((circle.obj.map(_.name.is) openOr "Unknown"))
  
  def name(u:MappedLongForeignKey[CircleParticipant, User]) : Text = (first(u), last(u), email(u)) match {
    case(f, l, e) if f.length > 0 && l.length > 0 => Text(f + " " + l)
    case(f, _, _) if f.length > 0 => Text(f)
    case(_, _, e) => Text(e)
  }
  
  def first(u:MappedLongForeignKey[CircleParticipant, User]) = {
    u.obj.map(_.first.is) openOr ""
  }
  
  def last(u:MappedLongForeignKey[CircleParticipant, User]) = {
    u.obj.map(_.last.is) openOr ""
  }
  
  def email(u:MappedLongForeignKey[CircleParticipant, User]) = {
    u.obj.map(_.email.is) openOr ""
  }

}

object CircleParticipant extends CircleParticipant with LongKeyedMetaMapper[CircleParticipant] {
  override def dbTableName = "circle_participants" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(person, circle)
}