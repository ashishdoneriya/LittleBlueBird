package com.lbb
import net.liftweb.sitemap.Loc.LinkText
import net.liftweb.sitemap.Loc
import net.liftweb.sitemap.Loc.{If, Link}
import scala.xml.Text
import net.liftweb.sitemap.MenuItem
import com.lbb.snippet.SessionUser
import net.liftweb.common.Full
import net.liftweb.common.Empty
import net.liftweb.http.RedirectResponse

/**
 * To create your own Loc, you have to define defaultValue, params, link, text and name
 */
abstract class EventLoc extends Loc[Any] {
  
  def defaultValue = Some("")
  
  val LoggedIn = If(() => com.lbb.snippet.SessionUser.is != Empty, () => RedirectResponse("/index"))
  
  def params = LoggedIn :: Nil
  
  def makeMenuItem(c:Circle):MenuItem = {
    val current = false // value doesn't matter
    val kids = c.participants.map(cp => MenuItem(cp.name(cp.person), Text("/giftlist/"+c.id.is+"/"+cp.person.obj.open_!.id.is), Seq.empty, false, true, Nil))
    MenuItem(Text(c.name.is), Text("/circle/details/"+c.id.is), kids, false, true, Nil)
  }
  
  def blah(isExpired:Boolean):List[MenuItem] = {
    
    SessionUser.get match {
      case f:Full[User] => {
        // get circles for this user
        // TODO can this cause NPE?
        val items = f.open_!.circles.filter(cp => !cp.circle.obj.open_!.deleted.is && cp.circle.obj.open_!.isExpired == isExpired).map(cp => makeMenuItem(cp.circle.obj.open_!))
        List(items, super.supplimentalKidMenuItems).flatten
      }
      case _ => {
        super.supplimentalKidMenuItems
      }
    
    }
    
  }
}
