package com.lbb
import net.liftweb.sitemap.Loc.LinkText
import net.liftweb.sitemap.Loc.Link
import scala.xml.Text
import com.lbb.snippet.SessionUser
import net.liftweb.common.Full
import net.liftweb.sitemap.MenuItem

class EventLocExpired extends EventLoc {


  // must be unique
  override val link = new Link[Any](List("circle", "pastevents"))
  
  val text = LinkText[Any](p => Text("Past Events"))
  
   // must be unique
  def name = "Past Events"; // must be unique
  
  // TODO very similar to EventLocActive except for the 2nd clause in the filter()
  override def supplimentalKidMenuItems:List[MenuItem] = {
    
    val isExpired = true
    blah(isExpired)
    
  }
  
}