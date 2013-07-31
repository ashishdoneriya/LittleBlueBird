package com.lbb.util
import com.lbb.entity.Circle

trait DateChangeListener {

  def dateSet(c:Circle)
  def dateUnset
  
  def dateDeletedSet(c:Circle)
  
}