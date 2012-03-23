package com.lbb.gui
import net.liftweb.mapper.MappedEmail
import net.liftweb.mapper.Mapper
import net.liftweb.http.S
import net.liftweb.common.Box
import scala.xml.Elem
import net.liftweb.common.Full

class MappedEmailExtended[T <: Mapper[T]](towner: T, theMaxLen: Int) extends MappedEmail[T](towner, theMaxLen) {

  override def _toForm: Box[Elem] =
  S.fmapFunc({s: List[String] => this.setFromAny(s)}){name =>
    Full(appendFieldId(<input type={formInputType} maxlength={maxLen.toString}
                       name={name}
                       value={is match {case null => "" case s => s.toString}}
                       placeholder={displayName}/>))}
  
}