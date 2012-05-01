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
import com.lbb.entity.Circle
import com.lbb.entity.User
import com.lbb.entity.CircleParticipant

/**
 * To create your own Loc, you have to define defaultValue, params, link, text and name
 */
// TODO Test with completely empty database
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
      case Full(user) => {
        // get circles for this user
        // TODO can this cause NPE? - YES! If the user doesn't belong to any circles
        val items = getCircleMenuItems(user, isExpired)
        List(items, super.supplimentalKidMenuItems).flatten
      }
      case _ => {
        super.supplimentalKidMenuItems
      }
    
    }
    
  }
  
  
  private def getCircleMenuItems(user:User, expired:Boolean):List[MenuItem] = {
    user.circles match {
      case Nil => super.supplimentalKidMenuItems
      // TODO open_! could be a problem
      case cps:List[CircleParticipant] => cps.filter(cp => getTheRightCircles(cp, expired)).map(cp => makeMenuItem(cp.circle.obj.open_!))
      case _ => super.supplimentalKidMenuItems
    }
  }
  
  private def getTheRightCircles(cp:CircleParticipant, expired:Boolean):Boolean = {
    cp.circle.obj match {
      case Full(circle) => !circle.deleted.is && circle.isExpired == expired
      case _ => false
    }
  }
}
