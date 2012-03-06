package com.lbb.snippet
import com.lbb.Emailer
import net.liftweb.http.SessionVar
import scala.xml.NodeSeq
import net.liftweb.common.Full
import net.liftweb.http.S._
import scala.xml.Group
import com.lbb.User
import net.liftweb.mapper.OrderBy
import net.liftweb.common.Empty
import net.liftweb.common.Box
import com.lbb.Circle
import net.liftweb.mapper.Ascending
import net.liftweb.http.SHtml._
import scala.xml.Text
import net.liftweb.util.Helpers._
import net.liftweb.common._
import net.liftweb.http._
import java.util.Date
import java.text.SimpleDateFormat
import com.lbb.CircleParticipant
import net.liftweb.mapper.By


object SessionCircle extends SessionVar[Box[Circle]](Empty)


class Circles {
  private object selectedCircle extends SessionVar[Box[Circle]](Empty)
  

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
          println("addevent.addCircle: case f:Full[User]: CircleParticipant.save="+s)
        }
        case _ => {
          println("addevent.addCircle: case _ : redirectTo(\"index\")")
          redirectTo("index")
        }
      }

    }
    
    bind("entry", xhtml, "thetype" -> SHtml.text(thetype, thetype = _), "name" -> SHtml.text(thename, thename = _), "thedate" -> SHtml.text(thedate, thedate = _), "submit" -> SHtml.submit("Create", addCircle))
  }
  
  /**
  * Get the XHTML containing a list of circles
  */
  def show: NodeSeq = {
    val res = S.param("circle") match {
      case f:Full[String] => {
        // the header
        <tr>{Circle.htmlHeaders}<th>Edit</th><th>Delete</th></tr> ::
        // get and display each of the circles
        Circle.findAll(By(Circle.id, f.open_!.toLong), OrderBy(Circle.id, Ascending)).flatMap(u => <tr>{u.htmlLine}
        <td>{link("/circle/edit", () => selectedCircle(Full(u)), Text("Edit"))}</td>
        <td>{link("/circle/delete", () => selectedCircle(Full(u)), Text("Delete"))}</td>
                                                           </tr>)
      }
      case _ => {
        // the header
        <tr>{Circle.htmlHeaders}<th>Edit</th><th>Delete</th></tr> ::
        // get and display each of the circles
        Circle.findAll(OrderBy(Circle.id, Ascending)).flatMap(u => <tr>{u.htmlLine}
        <td>{link("/circle/edit", () => selectedCircle(Full(u)), Text("Edit"))}</td>
        <td>{link("/circle/delete", () => selectedCircle(Full(u)), Text("Delete"))}</td>
                                                           </tr>)
      }
    }

    res
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
  def confirmDelete(xhtml: NodeSeq): NodeSeq = {
    (for (circle <- selectedCircle.is) // find the user
     yield {
        def deleteCircle() {
          notice("Circle "+circle.name+" deleted")
          circle.delete_!
          redirectTo("/circle/index")
        }

        // bind the incoming XHTML to a "delete" button.
        // when the delete button is pressed, call the "deleteCircle"
        // function (which is a closure and bound the "circle" object
        // in the current content)
        bind("xmp", xhtml, "circle" -> circle.name, "delete" -> submit("Delete", deleteCircle _))

        // if there was no ID or the user couldn't be found,
        // display an error and redirect
      }) openOr {error("Circle not found"); redirectTo("/circle/index")}
  }}