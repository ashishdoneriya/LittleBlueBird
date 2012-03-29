package com.lbb.snippet
import scala.xml.NodeSeq
import com.lbb.entity.Circle
import net.liftweb.http.S
import net.liftweb.common.Full
import net.liftweb.mapper.OrderBy
import net.liftweb.mapper.By
import net.liftweb.mapper.Ascending
import com.lbb.entity.Gift
import com.lbb.entity.User
import net.liftweb.http.SHtml._
import net.liftweb.http.SessionVar
import net.liftweb.common.Empty
import net.liftweb.common.Box
import scala.xml.Text
import com.lbb.entity.Gift
import com.lbb.entity.Circle
import com.lbb.entity.User
//import com.lbb.snippet.selectedCircle
import net.liftweb.util.Helpers._
import net.liftweb.http.SHtml
import com.lbb.entity.CircleParticipant
import scala.xml.Group
import net.liftweb.http.S._

// TODO conditional edit, delete and buy buttons
// TODO "stuff I'm buying" section
// TODO "stuff others are buying" section
// TODO add note if circle is expired
// TODO display wish lists as div's not tables
// TODO Add popover/alert over givers explaining that they give but don't receive
// TODO New feature: When adding to someone else's list, add a "surprise" checkbox to override the default show/hide and edit/delete rules
class Gifts {
  private object selectedGift extends SessionVar[Box[Gift]](Empty)
  
  
  def add(xhtml: Group): NodeSeq = {
          println("addevent: begin")
    var description = ""
    var url = ""
    def addGift() = {
      
      println("addGift: begin")
          
      (selectedCircle.is, SessionUser.is, SessionRecipient.is) match {
        case (Full(circle), Full(adder), Full(recipient)) => {
          println("addGift: case (Full(circle), Full(adder), Full(recipient))")
          val gift = Gift.create.description(description).url(url).circle(circle).addedBy(adder)
          gift.save
          gift.addRecipient(recipient)
        }
        // not sure what would case this to happen...
        case _ => {
          println("addGift: case _")
          redirectTo(S.referer openOr "/")
        }
      }    

    }
    
    bind("entry", xhtml, 
        "description" -> SHtml.textarea(description, description = _), 
        "url" -> SHtml.text(url, url = _), 
        "saveButton" -> SHtml.submit("Add Gift", () => addGift, "class" -> "btn btn-primary"),
        "cancelButton" -> SHtml.submit("Cancel", () => redirectTo(S.referer openOr "/"), "class" -> "btn", "data-dismiss" -> "modal"))
  }
  
  
  // just to display the current circle - originally as a "header" above someone's gift list
  def header: NodeSeq = {
    
    val recAndEvent = recipientAndEvent
    val recipient = recAndEvent._1
    val circle = recAndEvent._2
    
    <div class="navbar">
    <div class="navbar-inner">
    <div class="container">
      <div class="brand">{recipient.first.is}'s list for {circle.name}</div><div class="pull-right"><a href="#addGiftModal" data-toggle="modal" class="btn btn-success">Add Gift</a></div>
    </div>
    </div>
    </div>

  }
  
  
  def recipientAndEvent : (User, Circle) = {
    // TODO not exhaustive - hence the warnings
    (S.param("circle"), S.param("recipient"), SessionUser.is) match {
      case (Full(c), Full(r), Full(viewer)) => {
        val circleBox = Circle.findByKey(Integer.parseInt(c))
        val recipientBox = User.findByKey(Integer.parseInt(r))
        
        (circleBox, recipientBox) match {
          case (Full(circle), Full(recipient)) => {
            
            SessionCircle(Full(circle))
            
            SessionRecipient(Full(recipient))

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
                 
    giftlist.flatMap(g => <tr><td>{g.description.is}</td>
    <td>{link("/gift/edit", () => selectedGift(Full(g)), Text("Edit"))}</td>
    <td>{link("/gift/delete", () => selectedGift(Full(g)), Text("Delete"))}</td>
                                                           </tr>)
                
  }
  
  private def displayGift(g:Gift, r:User, c:Circle) = {
    
  }
}