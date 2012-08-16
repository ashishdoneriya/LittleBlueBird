package com.lbb.util
import java.util.Date
import com.lbb.entity.Circle

trait DateChangeListener {

  def dateSet(c:Circle)
  def dateUnset
  
  def dateDeletedSet(c:Circle)
  
}