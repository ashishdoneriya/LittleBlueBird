package com.lbb.gui
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.Mapper
import net.liftweb.http.S
import net.liftweb.common.Box
import scala.xml.Elem
import net.liftweb.common.Full
import scala.xml.NodeSeq
import com.lbb.util.DateChangeListener

class MappedDateExtended[T <: Mapper[T]](towner: T) extends MappedDate[T](towner) {

//  override def _toForm: Box[NodeSeq] =
//    S.fmapFunc({s: List[String] => this.setFromAny(s)}){funcName =>
//    Full(appendFieldId(<input type={formInputType}
//                     name={funcName}
//                     value={is match {case null => "" case s => format(s)}}
//                     placeholder={displayName}/>))
//  }
  
  override def toLong = {
    super.toLong * 1000L
  }
  
}