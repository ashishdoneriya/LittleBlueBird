package com.lbb.gui
import net.liftweb.mapper.MappedDateTime
import net.liftweb.mapper.Mapper

class MappedDateTimeExtended[T <: Mapper[T]](towner: T) extends MappedDateTime[T](towner) {

  override def toLong = {
    super.toLong * 1000L
  }
  
}