package com.lbb
import net.liftweb.sitemap.Loc.LinkText
import net.liftweb.sitemap.Loc
import net.liftweb.sitemap.Loc.Link
import scala.xml.Text
import net.liftweb.sitemap.MenuItem
import com.lbb.snippet.SessionUser
import net.liftweb.common.Full


class EventLoc extends Loc[User] {
  def defaultValue = Some(User.create.first("?"))
  def params = Nil

  val link = new Link[User](List("circle", "myevents"))
  val text = LinkText[User](p => Text("Events"))
  def name = "Events";
  
  override def supplimentalKidMenuItems:List[MenuItem] = {
    
    println("EventLoc.supplimentalKidMenuItems  SessionUser.get = "+SessionUser.get)
    println("EventLoc.supplimentalKidMenuItems")
    println("EventLoc.supplimentalKidMenuItems")
    println("EventLoc.supplimentalKidMenuItems")
    println("EventLoc.supplimentalKidMenuItems")
    println("EventLoc.supplimentalKidMenuItems")

    
    
    SessionUser.get match {
      case f:Full[User] => {
        println("EventLocsupplimentalKidMenuItems: case f:Full[User]")
        // get circles for this user
        // TODO can this cause NPE?
        val items = f.open_!.circles.map(cp => makeMenuItem(cp.circle.obj.open_!))
        List(items, super.supplimentalKidMenuItems).flatten
      }
      case _ => {
        println("EventLocsupplimentalKidMenuItems: case _")
        super.supplimentalKidMenuItems
      }
    
    }
    
  }
  
  def makeMenuItem(c:Circle):MenuItem = {
    val kids = c.participants.map(cp => MenuItem(cp.name(cp.person), Text("gifts"), Seq.empty, false, true, Nil))
    MenuItem(Text(c.name.is), Text("details"), kids, false, true, Nil)
  }
}




//package com.lbb
//import net.liftweb.sitemap.Loc.LinkText
//import net.liftweb.sitemap.Loc
//import net.liftweb.sitemap.Loc.Link
//import scala.xml.Text
//import net.liftweb.sitemap.MenuItem
//import net.liftweb.common.Full
//import net.liftweb.common.Empty
//import com.lbb.snippet.SessionUser
//import net.liftweb.common.Box
//
//
//class EventLoc extends Loc[User] {
//  def defaultValue = SessionUser.get
//  def params = Nil
//
//  val link = new Link[User](List("circle", "view", "0"))
//  val text = LinkText[User](p => Text("Events"))
//  def name = "EventsLoc";
//  
//  override def supplimentalKidMenuItems:List[MenuItem] = {
//    println("EventLocsupplimentalKidMenuItems")
//    super.supplimentalKidMenuItems
//  }
//  
//  override def supplimentalKidMenuItems:List[MenuItem] = SessionUser.get match {
//    case f:Full[User] => {
//      println("EventLocsupplimentalKidMenuItems: case f:Full[User]")
//      // get circles for this user
//      // TODO can this cause NPE?
//      val items = f.open_!.circles.map(cp => makeMenuItem(cp.circle.obj.open_!))
//      List(items, super.supplimentalKidMenuItems).flatten
//    }
//    case _ => {
//      println("EventLocsupplimentalKidMenuItems: case _")
//      super.supplimentalKidMenuItems
//    }
//  }
  
//  def makeMenuItem(c:Circle):MenuItem = {
//    println("EventLoc.makeMenuItem:"+c.name.is)
//    MenuItem(Text(c.name.is), Text("blah"), Seq.empty, false, false, Nil)
//  }
//}

