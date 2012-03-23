package com.lbb.entity
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.IdPK
import scala.xml.Text
import net.liftweb.mapper.MappedBoolean

class CircleParticipant extends LongKeyedMapper[CircleParticipant] with IdPK {
  def getSingleton = CircleParticipant
    
  // TODO make sure circle/person is unique
  object circle extends MappedLongForeignKey(this, Circle)
  // TODO make sure you can't add the same person more than once
  object person extends MappedLongForeignKey(this, User)
  object inviter extends MappedLongForeignKey(this, User)
  object receiver extends MappedBoolean(this)
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
  override def dbTableName = "circle_participant" // define the DB table name
  
  // define the order fields will appear in forms and output
  override def fieldOrder = List(person, circle)
}