package com.lbb.util
import com.lbb.entity.User
import net.liftweb.http.JsonResponse
import net.liftweb.http.js.JE.JsArray

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
  
  def fullurl(url:String) = url match {
    case s:String if(s.startsWith("http://")) => s
    case s:String if(s.startsWith("https://")) => s
    case s:String if(s.equals("")) => s
    case _ => "http://" + url
  }
  
  def createAffLink(url:String) = {
    val full = fullurl(url)
    val lc = whichCreator(full)
    lc.createLink(full)
  }
  
  private def whichCreator(url:String) = url match {
    // for international amazon sites, you won't get credit for the sale
    case s:String if(s.contains("amazon")) => AmazonLinkCreator
    case _ => NoopLinkCreator
  }
  
  def toJsonResponse(l:List[User]) = {
    val jsons = l.map(_.asJs)
    val jsArr = JsArray(jsons)
    JsonResponse(jsArr)
  }
  
}