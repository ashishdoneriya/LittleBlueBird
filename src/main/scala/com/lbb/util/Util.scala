package com.lbb.util

object Util {
  
  def toStringPretty(list:List[String]) = list match {
    case Nil => ""
    case x :: xs if(xs.isEmpty) => x
    case x :: xs if(xs.size == 1) => x + " and " + xs.head
    case x :: xs => {
      val abc = list.init
      abc.head + abc.tail.foldLeft("")((a,b)=> a + ", " +b) + " and " + list.last
    }
  }
  
}