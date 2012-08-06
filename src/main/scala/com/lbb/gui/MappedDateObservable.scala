package com.lbb.gui
import net.liftweb.mapper.MappedDate
import net.liftweb.http.S
import com.lbb.util.DateChangeListener
import net.liftweb.common.Box
import net.liftweb.mapper.Mapper
import scala.xml.NodeSeq
import net.liftweb.common.Full

class MappedDateObservable[T <: Mapper[T]](towner: T,ls:DateChangeListener) extends MappedDate[T](towner) {

  val evtlistener = ls
  
  override def toLong = {
    super.toLong * 1000L
  }
  
}