package com.lbb.gui
import scala.xml.Elem

import net.liftweb.common.Box
import net.liftweb.common.Full
import net.liftweb.http.S.AFuncHolder.listStrToAF
import net.liftweb.http.S
import net.liftweb.mapper.Mapper
import net.liftweb.mapper.MappedTextarea

class MappedTextareaExtended[T <: Mapper[T]](towner: T, theMaxLen: Int) extends MappedTextarea[T](towner, theMaxLen) {

  override def _toForm: Box[Elem] = {
    S.fmapFunc({s: List[String] => this.setFromAny(s)}){funcName =>
    Full(appendFieldId(<textarea name={funcName}
                                 placeholder={displayName}
                                 rows={textareaRows.toString}
                                 cols={textareaCols.toString}>{
                                 is match {
                                   case null => ""
                                   case s => s}}</textarea>))}
  }

}