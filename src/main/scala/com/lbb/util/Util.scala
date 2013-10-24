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
import java.security.MessageDigest
import java.math.BigInteger
import net.liftweb.json.JsonParser
import net.liftweb.json.JsonAST.JObject
import scala.collection.immutable.List

object Util extends LbbLogger {
  
  
  // 2013-07-31
//  def ahead23hrs(d:Date) = {
//    val orig = new DateTime(d.getTime())
//    orig.dayOfMonth()
//    val newd = new DateTime(orig.getYear(), orig.getMonthOfYear(), orig.getDayOfMonth(), 11, 59, 0, 0)
//    new Date(newd.getMillis())
//  }
  
  
  // 2013-08-11:  This is the new logic behind Circle.isExpired.  Rather than take a user-supplied date and move it ahead to 11:59pm
  // All we really need to do is change the definition of "is expired".  We'll determine whether or not a circle is expired by comparing
  // 'now' with the expiration date + 1 day.  That way, we don't have to do all that business of moving the date ahead 23 hrs, 59 mins
  // There's 86,400 seconds in a day.  So take the passed-in date and add 86,400,000 millis to it.
  // Compare 'now' with this value to figure out of the circle is expired
  // UPDATE: Looks like the mobiscroll date picker sets the time part to noon when you don't explicitly set it.  So the effect of the
  // logic below is this: If you check on an event the day AFTER but it is before noon, LittleBlueBird will tell you the event is
  // still active.  Only after noon will LBB tell you the event has passed.  MINIMAL IMPACT - Who is really going to be checking on
  // an event before noon the following day?  I doubt that anyone even checks the event after it's passed.
  def dateIsPassed(date:Long, now:DateTime) = new DateTime(date + 86400000) isBefore(now)
  
  
  /**
   * 2013-09-10  This method takes json data of friends returned by FB and converts it to a
   * csv list of facebook id's suitable for querying the person table
   */
  def facebookFriendsToCSV(json:String) = {
      
    val iterableMap = makeListOfMaps(json)
    val temp = for(val2 <- iterableMap) yield {
        val2.get("id")
    }
    
    //val list = facebookIds.getOrElse(List())
    val xxx = temp.map(mmm => {
      val www = mmm.getOrElse("")
      "'"+www+"'"
    })
    val vvv = xxx.filter(ddd => !ddd.equals("''"))
    vvv.mkString(", ")
  }
  
  
  def makeListOfMaps(json:String) = {
      
    val jvalOption = JsonParser.parseOpt(json)
    
    val facebookIds = for(jobj <- jvalOption; if(jobj.isInstanceOf[JObject])) yield {
      val jobject = jobj.asInstanceOf[JObject]
      val temp = for(value <- jobject.values; if(value._1.equals("data")); if(value._2.isInstanceOf[List[Map[String, Any]]])) yield {
        value._2.asInstanceOf[List[Map[String, String]]]
      }
      val flat = temp.flatten
      flat
    }
    
    val fff = facebookIds.getOrElse(List())
    debug("fff = "+fff)
    fff
  }
  
  
  def hashPass(s:String) = {
    val h = MessageDigest.getInstance("MD5").digest(s.getBytes);
    val bi = new BigInteger(1, h);
    val hashed = String.format("%0" + (h.length << 1) + "X", bi);
    if(hashed.length()>6) hashed.substring(0,6)
    else hashed
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