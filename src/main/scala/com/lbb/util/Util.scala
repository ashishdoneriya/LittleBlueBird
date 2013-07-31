package com.lbb.util
import com.lbb.entity.User
import net.liftweb.http.JsonResponse
import net.liftweb.http.js.JE.JsArray
import java.net.URL
import javax.swing.ImageIcon
import net.liftweb.mapper.DB
import net.liftweb.db.DefaultConnectionIdentifier
import java.util.Date
import org.joda.time.DateTime

object Util extends LbbLogger {
  
  
  // 2013-07-31
  def ahead23hrs(d:Date) = {
    val orig = new DateTime(d.getTime())
    orig.dayOfMonth()
    val newd = new DateTime(orig.getYear(), orig.getMonthOfYear(), orig.getDayOfMonth(), 23, 59, 59, 0)
    new Date(newd.getMillis())
  }
  
  
  // 2/26/13 - run an arbitrary query
  // Find all the usernames that are like:  s%
  // See User.determineUsernameBaseOnFirstName().  In this case, s is a first name
  def determineUsernamesLike(s:String) = {
    val res = DB.runQuery("select username from person where username like '"+s+"%'", Nil)
    debug("determineUsernamesLike:  res = "+res)
    // List of usernames
    if(res._2.size > 0) res._2.flatten // not sure right now why this was returning usernames like this:  List(Brent1), List(Brent2), List(Brent3) - a bunch of single-element lists, but it does, so just flatten the thing
    else Nil
  }
  
  
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
  
  def calculateAdjustedHeight(limit:Int, url:URL) = {
    val values = ratio(limit, url);
    val adj = values.get("ratio").getOrElse(1.0) * values.get("h").getOrElse(0.0) 
    adj.toInt
  }
  
  def calculateAdjustedWidth(limit:Int, url:URL) = {
    val values = ratio(limit, url);
    val adj = values.get("ratio").getOrElse(1.0) * values.get("w").getOrElse(0.0) 
    adj.toInt
  }
  
  def calculateMarginTop(limit:Int, url:URL) = {
    val h = calculateAdjustedHeight(limit, url)
    val topmargin = if(h > limit) {
      -1 * Math.round((h - limit)/2)
    }
    else {
      0
    }
    topmargin + "px"
  }
  
  def calculateMarginLeft(limit:Int, url:URL) = {
    val w = calculateAdjustedWidth(limit, url)
    val leftmargin = if(w > limit) {
      -1 * Math.round((w - limit)/2)
    }
    else {
      0
    }
    leftmargin + "px"
  }
  
  private def ratio(limit:Int, url:URL) = {
    val img = new ImageIcon(url)	
    val profilepicheight = img.getIconHeight().toDouble
    val profilepicwidth = img.getIconWidth().toDouble
    val mindim = if(profilepicheight < profilepicwidth) profilepicheight else profilepicwidth;
    val ratio = limit / mindim//if(mindim < limit) {val div = limit / mindim; div} else {val div = mindim / limit; div};
    Map("ratio" -> ratio, "w" -> profilepicwidth, "h" -> profilepicheight)
  }
  
}