package com.lbb.snippet
import scala.xml.NodeSeq.seqToNodeSeq
import scala.xml.NodeSeq
import scala.xml.Group
import scala.xml.Text
import com.lbb.Emailer
import com.lbb.entity.User
import com.lbb.snippet.SessionUser
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.SHtml.link
import net.liftweb.http.SHtml.submit
import net.liftweb.http.S.error
import net.liftweb.http.S.notice
import net.liftweb.http.S.redirectTo
import net.liftweb.http.SessionVar
import net.liftweb.http.RequestVar
import net.liftweb.mapper.Ascending
import net.liftweb.mapper.OrderBy
import net.liftweb.util.AnyVar.whatVarIs
import net.liftweb.util.Helpers.bind
import net.liftweb.util.Helpers.strToSuperArrowAssoc
import net.liftweb.http.SHtml



object SessionRecipient extends SessionVar[Box[User]](Empty)


/**
 * Adapted from :
 * https://github.com/lift/examples/blob/master/combo/example/src/main/scala/net/liftweb/example/snippet/Misc.scala
 */
// TODO Add Preferences to current user drop-down
// TODO Preferences may contain: who can add to my list, should I allow surprises, from who, who can search for me (when adding people to circles), automatically post to FB, automatically post to Twitter
// TODO Lost password link to current user drop-down
// TODO Login page looks like crap
// TODO implement "add people from another circle"
// TODO Information in the Register page that tells the user they can create account for other people
// TODO tooltip over the email field saying it doesn't have to be unique
class Users {
  private object selectedUser extends SessionVar[Box[User]](Empty)
  
  /**
  * Add a user
  */
  def add(xhtml: Group): NodeSeq =
    new User().toForm(Empty, saveUser _) ++ cancelSubmitButtons
  
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
  def edit(xhtml: Group): NodeSeq = {
    
    selectedUser.map(_.
                   // get the form data for the user and when the form
                   // is submitted, call the passed function.
                   // That means, when the user submits the form,
                   // the fields that were typed into will be populated into
                   // "user" and "saveUser" will be called. The
                   // form fields are bound to the model's fields by this
                   // call.
                   toForm(Empty, saveUser _) ++ cancelSubmitButtons

                   // bail out if the ID is not supplied or the user's not found
    ) openOr {error("User not found"); redirectTo("/user/index"); }
  }
  
  
  val cancelSubmitButtons = <div class="row">
      <div class="span1"><a href="/user/index">Cancel</a></div>
      <div class="span1"><input type="submit" value="Create"/></div></div>
  
  
  private def myAccount(u:User, xhtml:Group):NodeSeq = {
    selectedUser(Full(u))
    edit(xhtml)
  }
  
  
  /**
   * If the user is not logged in, display "Login" link
   * If the user is logged in, display the person's name and next to the name,
   * show a little downward caret that will lead to a dropdown menu of:
   * My Account, Privacy Settings, divider, Logout
   */
  def menu(xhtml:Group):NodeSeq = {
    SessionUser.is match {
      case Full(u) => menuLoggedIn(u, xhtml)
      case _ => menuNotLoggedIn
    }
  }
  
  
  def selectedUser(xhtml:Group):NodeSeq = {
    selectedUser.is match {
      case Full(u) => {
      <div class="row">
        <div class="span2">
          <div class="row">
            <div class="span2">{u.profilepicOrDefault}</div>
          </div>
        </div>
        <div class="span5">
            <div class="row">
              <div class="span2">Name</div>
              <div class="span3">{u.first + " " + u.last}</div>
            </div>
            <div class="row">
              <div class="span2">Email</div>
              <div class="span3">{u.email}</div>
            </div>
            <div class="row">
              <div class="span2">Username</div>
              <div class="span3">{u.username}</div>
            </div>
            <div class="row">
              <div class="span2">Date of Birth</div>
              <div class="span3">{u.dateOfBirth}</div>
            </div>
            <div class="row">
              <div class="span2">Profile Pic</div>
              <div class="span3">{u.profilepic}</div>
            </div>
            <div class="row">
              <div class="span2">Bio</div>
              <div class="span3">{u.bio}</div>
            </div>
        </div>
      </div>
      }
      case _ => Text("")
    }
    
  }
  
  
  private def menuLoggedIn(u:User, xhtml:Group):NodeSeq = {
    <ul class="nav nav-pills">
      <li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">{u.first + " " + u.last}<b class="caret"></b></a>
        <ul class="dropdown-menu">
          <li>{link("/user/edit", () => myAccount(u, xhtml), Text("My Account"))}</li>
          <li class="divider"></li>
          <li>{link("/logout", () => Logout(), Text("Logout"))}</li>
        </ul>
      </li>
    </ul> 
  }
  
  
  private def menuNotLoggedIn():NodeSeq = {
    <ul class="nav pull-right">
      <li>{link("/login", () => Empty, Text("Login"))}</li>
    </ul>
  }
  
  
  /**
   * This method will see if the user belongs to any circles or not.
   * If not, we will display a friendly alert to the user explaining
   * that they need to now start creating events.
   */
  def alertNoEvents(xhtml:Group):NodeSeq = SessionUser.is match {
    case Full(user) if(user.circles.size==0) => 
        <div class="alert alert-info"><h4 class="alert-heading">Start Creating Events</h4>
          You don't belong to any events.  Create an event by filling out the form to the left.  Then add 
          your friends and family to the event.  That's how you can see everyone's wish list.
          <P>Create as many events as you like.</P>
        </div>
    case _ => Nil
  }
  
  
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
      selectedUser(Full(user))
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

