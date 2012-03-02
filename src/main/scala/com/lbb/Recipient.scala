package com.lbb
import net.liftweb.mapper.IdPK
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongForeignKey
import scala.xml.Text

class Recipient extends LongKeyedMapper[Recipient] with IdPK {
  def getSingleton = Recipient
  
  object person extends MappedLongForeignKey(this, User)
  object gift extends MappedLongForeignKey(this, Gift)
  
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
}