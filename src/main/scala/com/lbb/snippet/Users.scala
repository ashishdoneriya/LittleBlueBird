package com.lbb.snippet
import scala.xml.NodeSeq.seqToNodeSeq
import scala.xml.Group
import scala.xml.NodeSeq
import scala.xml.Text

import com.lbb.Emailer
import com.lbb.User

import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.SHtml.link
import net.liftweb.http.SHtml.submit
import net.liftweb.http.S.error
import net.liftweb.http.S.notice
import net.liftweb.http.S.redirectTo
import net.liftweb.http.RequestVar
import net.liftweb.mapper.Ascending
import net.liftweb.mapper.OrderBy
import net.liftweb.util.AnyVar.whatVarIs
import net.liftweb.util.Helpers.bind
import net.liftweb.util.Helpers.strToSuperArrowAssoc

/**
 * Adapted from :
 * https://github.com/lift/examples/blob/master/combo/example/src/main/scala/net/liftweb/example/snippet/Misc.scala
 */
class Users {
  private object selectedUser extends RequestVar[Box[User]](Empty)
  
  /**
  * Add a user
  */
  def add(xhtml: Group): NodeSeq =
    selectedUser.is.openOr(new User).toForm(Empty, saveUser _) ++ <tr>
      <td><a href="/user/index.html">Cancel</a></td>
      <td><input type="submit" value="Create"/></td>
                                                                </tr>
  
  /**
  * Get the XHTML containing a list of users
  */
  def users: NodeSeq = {
    // the header
    <tr>{User.htmlHeaders}<th>Edit</th><th>Delete</th></tr> ::
    // get and display each of the users
    User.findAll(OrderBy(User.id, Ascending)).flatMap(u => <tr>{u.htmlLine}
        <td>{link("/user/edit", () => selectedUser(Full(u)), Text("Edit"))}</td>
        <td>{link("/user/delete", () => selectedUser(Full(u)), Text("Delete"))}</td>
                                                           </tr>)
  }
  
  /**
  * Edit a user
  */
  def edit(xhtml: Group): NodeSeq =
    selectedUser.map(_.
                   // get the form data for the user and when the form
                   // is submitted, call the passed function.
                   // That means, when the user submits the form,
                   // the fields that were typed into will be populated into
                   // "user" and "saveUser" will be called. The
                   // form fields are bound to the model's fields by this
                   // call.
                   toForm(Empty, saveUser _) ++ <tr>
      <td><a href="/user/index">Cancel</a></td>
      <td><input type="submit" value="Save"/></td>
                                                </tr>

                   // bail out if the ID is not supplied or the user's not found
    ) openOr {error("User not found"); redirectTo("/user/index")}
  
  
  // called when the form is submitted
  private def saveUser(user: User) = user.validate match {
    // no validation errors, save the user, and go
    // back to the "list" page
    // TODO don't send the user back to the index page if they just created an account for someone else - send them to his wish list page
    case Nil => {
      if(user.save && SessionUser.is==Empty) {
        SessionUser(Full(user)) 
        Emailer.welcome(user)
      }
      redirectTo("/user/index")
    }

      // oops... validation errors
      // display the errors and make sure our selected user is still the same
    case x => error(x); selectedUser(Full(user))
  }
  
  /**
  * Confirm deleting a user
  */
  def confirmDelete(xhtml: Group): NodeSeq = {
    (for (user <- selectedUser.is) // find the user
     yield {
        def deleteUser() {
          notice("User "+(user.first+" "+user.last)+" deleted")
          user.delete_!
          redirectTo("/user/index")
        }

        // bind the incoming XHTML to a "delete" button.
        // when the delete button is pressed, call the "deleteUser"
        // function (which is a closure and bound the "user" object
        // in the current content)
        bind("xmp", xhtml, "username" -> (user.first.is+" "+user.last.is),
             "delete" -> submit("Delete", deleteUser _))

        // if there was no ID or the user couldn't be found,
        // display an error and redirect
      }) openOr {error("User not found"); redirectTo("/user/index")}
  }
}

