package com.lbb.snippet
import scala.xml.NodeSeq
import com.lbb.Circle
import net.liftweb.http.S
import net.liftweb.common.Full
import net.liftweb.mapper.OrderBy
import net.liftweb.mapper.By
import net.liftweb.mapper.Ascending
import com.lbb.Gift
import com.lbb.User
import net.liftweb.http.SHtml._
import net.liftweb.http.SessionVar
import net.liftweb.common.Empty
import net.liftweb.common.Box
import scala.xml.Text

class Gifts {
  private object selectedGift extends SessionVar[Box[Gift]](Empty)
  
  
  // just to display the current circle - originally as a "header" above someone's gift list
  def header: NodeSeq = {
    
    val recAndEvent = recipientAndEvent
    val recipient = recAndEvent._1
    val circle = recAndEvent._2
    
    <tr><td>{recipient.first.is}'s list for {circle.name}</td></tr>

  }
  
  
  def recipientAndEvent : (User, Circle) = {
    // TODO not exhaustive - hence the warnings
    (S.param("circle"), S.param("recipient")) match {
      case (c:Full[String], r:Full[String]) => {
        val circleBox = Circle.findByKey(Integer.parseInt(c.open_!))
        val recipientBox = User.findByKey(Integer.parseInt(r.open_!))
        val viewer = SessionUser.is.open_!
        
        (circleBox, recipientBox) match {
          case (cir:Full[Circle], rec:Full[User]) => {
            val circle = cir.open_!
            
            SessionCircle(Full(circle))
            
            val recipient = recipientBox.open_!
            SessionRecipient(Full(recipient))

            println("Gifts.recipientAndEvent:  111111111111111111")
            
            (recipient, circle)
            
          }
        }
        
      }
    }
    
  }
  
  
  /**
  * Get the XHTML containing a list of circles
  */
  def show: NodeSeq = {
    // TODO safe to assume user in session?
    val viewer = SessionUser.is.open_!
        
    val recAndEvent = recipientAndEvent
    val recipient = recAndEvent._1
    val circle = recAndEvent._2
    val giftlist = recipient.giftlist(viewer, circle)
    
    // the header
    <tr><th>Description</th><th>Edit</th><th>Delete</th></tr> ::               
    giftlist.flatMap(g => <tr><td>{g.description.is}</td>
    <td>{link("/gift/edit", () => selectedGift(Full(g)), Text("Edit"))}</td>
    <td>{link("/gift/delete", () => selectedGift(Full(g)), Text("Delete"))}</td>
                                                           </tr>)
                
  }
}