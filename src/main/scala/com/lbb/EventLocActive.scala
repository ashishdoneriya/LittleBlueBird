package com.lbb
import net.liftweb.sitemap.Loc.LinkText
import net.liftweb.sitemap.Loc.Link
import scala.xml.Text
import com.lbb.snippet.SessionUser
import net.liftweb.common.Full
import net.liftweb.sitemap.MenuItem

class EventLocActive extends EventLoc {


  // must be unique
  val link = new Link[Any](List("circle", "myevents"))
  
  val text = LinkText[Any](p => Text("My Events"))
  
   // must be unique
  def name = "My Events"; // must be unique
  
  // TODO very similar to EventLocExpired except for the 2nd clause in the filter()
  override def supplimentalKidMenuItems:List[MenuItem] = {
    
    val isExpired = false
    blah(isExpired)
    
  }
  
}