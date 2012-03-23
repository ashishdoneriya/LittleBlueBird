package com.lbb.snippet
import java.text.SimpleDateFormat
import java.util.Date

import scala.xml.Group
import scala.xml.Node
import scala.xml.NodeSeq
import scala.xml.Text

import com.lbb.entity.Circle
import com.lbb.entity.CircleParticipant
import com.lbb.entity.User
import com.lbb.entity.Circle
import com.lbb.entity.CircleParticipant
import com.lbb.entity.User

import net.liftweb.common._
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.SHtml._
import net.liftweb.http.S._
import net.liftweb.http._
import net.liftweb.http.SessionVar
import net.liftweb.mapper.Ascending
import net.liftweb.mapper.OrderBy
import net.liftweb.util.Helpers._


// TODO don't need this - we have 'selectedCircle'
object SessionCircle extends SessionVar[Box[Circle]](Empty)

object selectedCircle extends SessionVar[Box[Circle]](Empty)
  
object selectedRecipient extends SessionVar[Box[User]](Empty)
  
object multiplePeople extends RequestVar[List[User]](Nil)

object deletingPeople extends SessionVar[Box[Boolean]](Empty)


class Circles {
  

  /**
   * This is where the user is creating a new event.  In this action, the user is automatically added
   * to the circle (unlike the add method above, where the user isn't)
   */
  // TODO when adding current user, don't assume the user is a receiver
  def add(xhtml: Group): NodeSeq = {
          println("addevent: begin")
    var thetype = ""
    var thename = ""
    var thedate = ""
    def addCircle() = {
      
      val circle = Circle.create.circleType(thetype).name(thename).date(new SimpleDateFormat("MM/dd/yyyy").parse(thedate))
      circle.save
      
      SessionUser.is match {
        // TODO don't assume the user is a receiver
        // TODO what if error saving circle participant?
        case f:Full[User] => {
          val s = CircleParticipant.create.circle(circle).person(f.open_!).inviter(f.open_!).receiver(true).save
        }
        case _ => {
          redirectTo("index")
        }
      }

    }
    
    bind("entry", xhtml, "thetype" -> SHtml.text(thetype, thetype = _), "name" -> SHtml.text(thename, thename = _), "thedate" -> SHtml.text(thedate, thedate = _), "submit" -> SHtml.submit("Create", addCircle))
  }
  
  def addbyname(xhtml:Group):NodeSeq = {
    var thename = ""
    def addperson() = {
      val FL = """(\w+)\s+(\w+)""".r
      val FML = """(\w+)\s+([^ ]+)\s+(\w+)""".r
      val people = thename match {
        case FL(f, l) => User.findByName(f, l)
        case FML(f, m, l) => User.findByName(f, l)
        case _ => Nil
      }
      
      people match {
        // more than one person found - present them all with checkboxes?
        case l:List[User] if(l.size > 1) => {
          multiplePeople(l)
          val ref = S.referer openOr "/"
          println("S.referer = "+ref)
          ref
        }
        // just one person found - add this person
        case l:List[User] if(l.size == 1) => {
          selectedCircle.is.open_!.add(List(l.head), SessionUser.is.open_!)
          redirectTo("/circle/details/"+selectedCircle.is.open_!.id.is)
        }
        // no one found - create a new account?
        case _ => {
          S.notice("No one found by this name")
          S.referer openOr "/"
        }
      }
    }
    
    bind("f", xhtml, "name" -> SHtml.text(thename, thename = _), "Add" -> SHtml.submit("Add", addperson))
  }
  
  /**
   * Display, if they exist, the multiple people having the given name
   */
  def displayMultiplePeople: NodeSeq = {
    multiplePeople.is match {
      case l:List[User] if l.size > 0 => {
        <table>
          {
            for(u <- l) yield {
              <tr><td>{SHtml.button("Add", () => addparticipant(u), "class" -> "btn btn-primary")}</td><td>{u.first + " " + u.last}</td></tr>
            }
          }
        </table>
      }
      case _ => Text("")
    }
  }
  
  private def addparticipant(person:User) = {
    selectedCircle.is.open_!.add(List(person), SessionUser.is.open_!).save
  }
  
  private def circleAsNavbar(b:Full[Circle]):NodeSeq = {
            val c = b.open_!
            <div class="brand">{c.name}</div>
            <ul class="nav pull-right">
              <li>{link("/circle/edit", () => selectedCircle(b), Text("Edit"))}</li>
              <li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Delete<b class="caret"></b></a>
                <ul class="dropdown-menu">
                  <li>{link("/circle/delete", () => selectedCircle(b), Text("Delete Circle"))}</li>
                  <li>{link("/circle/index", () => {selectedCircle(b);deletingPeople(Full(true))}, Text("Delete People"))}</li>
                </ul>
              </li>
              <li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Add People<b class="caret"></b></a>
                <ul class="dropdown-menu">
                  <li>{link("/circle/addpeoplebyname", () => selectedCircle(b), Text("By Name"))}</li>
                  <li>{link("/circle/addpeoplefromcircle", () => selectedCircle(b), Text("From Another Event"))}</li>
                </ul>
              </li>
            </ul>
  }
  
  /**
  * Get the XHTML containing a list of circles
  */
  def show: NodeSeq = {
    (S.param("circle"), selectedCircle.is, S.uri) match {
      case (f:Full[String], _, _) => {
        // TODO non-numerics will cause blow up
        Circle.findByKey(f.open_!.toLong) match {
          case b:Full[Circle] => {
            selectedCircle(b)
            circleAsNavbar(b)
          } // case b:Full[Circle]
          case _ => redirectTo(S.referer openOr "/")
        } // Circle.findByKey(f.open_!.toLong) match
                                                           
      } // case (f:Full[String], _, _)

      case (_, b:Full[Circle], _) => {
        circleAsNavbar(b)
      } // case (_, b:Full[Circle], _)
      
      case (_, _, "/circle/admin") => {
        // the header
        val header = <tr>{Circle.htmlHeaders}<th>Edit</th><th>Delete</th></tr>
        // get and display each of the circles
        val content = Circle.findAll(OrderBy(Circle.id, Ascending)).flatMap(u => <tr>{u.htmlLine}
        <td>{link("/circle/edit", () => selectedCircle(Full(u)), Text("Edit"))}</td>
        <td>{link("/circle/delete", () => selectedCircle(Full(u)), Text("Delete"))}</td>
                                                           </tr>)
        
        (<table> :: header :: content :: </table>).flatten
      }
      case _ => redirectTo("/index")
    }

  }
  
  private def currentCircle = (S.param("circle"), selectedCircle.is) match {
      case (f:Full[String], _) => {
        Circle.findByKey(Integer.parseInt(f.open_!))
      }
      case (_, ss:Full[Circle]) => {
        ss
      } // case (_, ss:Full[Circle])
      case _ => Empty
    
  }
  
  def showReceivers: NodeSeq = {
    currentCircle match {
      case cc:Full[Circle] => cc.open_!.participants.filter(cp1 => cp1.receiver.is).flatMap(cp => receiverEntry(cp))
      case Empty => Text("")
    }
  }
  
  private def receiverEntry(cp:CircleParticipant):NodeSeq = { 
    deletingPeople.is match {
      case f:Full[Boolean] if f.open_! => {  
        <tr>
        {
          <td>{SHtml.button("Delete", () => cp.delete_!, "class" -> "btn btn-danger")}</td>
          <td>{link("/giftlist/"+cp.circle.is+"/"+cp.person.is, () => Empty, cp.name(cp.person))}</td>
        }
        </tr>
      }
      case _ => {  
        <tr>
        {
          <td>{link("/giftlist/"+cp.circle.is+"/"+cp.person.is, () => Empty, cp.name(cp.person))}</td>
        }
        </tr>
      }
    } // deletingPeople.is match
  }
  
  private def giverEntry(cp:CircleParticipant) = {   
    deletingPeople.is match {
      case f:Full[Boolean] if f.open_! => {  
        <tr>
        {
          <td>{SHtml.button("Delete", () => cp.delete_!, "class" -> "btn btn-danger")}</td>
          <td>{cp.name(cp.person)}</td>
        }
        </tr>
      }
      case _ => {  
        <tr>
        {
          <td>{cp.name(cp.person)}</td>
        }
        </tr>
      }
    } // deletingPeople.is match
  }
  
  /**
   * Don't show the givers as links - no point
   */
  def showGivers: NodeSeq = {
    currentCircle match {
      case cc:Full[Circle] => cc.open_!.participants.filter(cp1 => !cp1.receiver.is).flatMap(cp => giverEntry(cp))
      case Empty => Text("")
    }
  }
  
  /**
   * responsible for displaying buttons on the circle index page like the "Finished" button
   * (finished removing people)
   */
  def buttons:NodeSeq = {  
    deletingPeople.is match {
      case f:Full[Boolean] if f.open_! => {  
        <tr>
        {
          <td>{SHtml.button("Finished", () => deletingPeople(Empty), "class" -> "btn btn-primary")}</td>
        }
        </tr>
      }
      case _ => <tr><td></td></tr>
    } // deletingPeople.is match
  }
  
  /**
  * Edit a user
  */
  def edit(xhtml: Group): NodeSeq =
    selectedCircle.map(_.
                   // get the form data for the circle and when the form
                   // is submitted, call the passed function.
                   // That means, when the user submits the form,
                   // the fields that were typed into will be populated into
                   // "circle" and "saveCircle" will be called. The
                   // form fields are bound to the model's fields by this
                   // call.
                   toForm(Empty, saveCircle _) ++ <tr>
      <td><a href="/circle/index">Cancel</a></td>
      <td><input type="submit" value="Save"/></td>
                                                </tr>

                   // bail out if the ID is not supplied or the circle not found
    ) openOr {error("circle not found"); redirectTo("/circle/index")}
  
  
  // called when the form is submitted
  private def saveCircle(circle: Circle) = circle.validate match {
    // no validation errors, save the circle, and go
    // back to the "list" page
    case Nil => {
      if(circle.save && SessionCircle.is==Empty) {
        SessionCircle(Full(circle))
      }
      redirectTo("/circle/index")
    }

      // oops... validation errors
      // display the errors and make sure our selected circle is still the same
    case x => error(x); selectedCircle(Full(circle))
  }
  
  /**
  * Confirm deleting a circle
  */
  // TODO fix delete - don't actually delete - just flag as deleted
  def confirmDelete(xhtml: NodeSeq): NodeSeq = {
    (for (circle <- selectedCircle.is) // find the user
     yield {
        def flagAsDeleted() {
          notice("Circle "+circle.name+" deleted")
          circle.deleted(true)
          circle.save()
          redirectTo("/circle/index")
        }

        // bind the incoming XHTML to a "delete" button.
        // when the delete button is pressed, call the "deleteCircle"
        // function (which is a closure and bound the "circle" object
        // in the current content)
        bind("xmp", xhtml, "circle" -> circle.name, "delete" -> submit("Delete", flagAsDeleted _))

        // if there was no ID or the user couldn't be found,
        // display an error and redirect
      }) openOr {error("Circle not found"); redirectTo("/circle/index")}
  }}