package com.lbb.util
import scala.xml.NodeSeq
import com.lbb.entity.Circle
import com.lbb.entity.User
import javax.mail.Authenticator
import javax.mail.PasswordAuthentication
import net.liftweb.common.Full
import net.liftweb.util.Mailer
import net.liftweb.util.Mailer._
import net.liftweb.util.Props
import net.liftweb.http.S
import net.liftweb.mapper.By
import scala.xml.Text
import com.lbb.entity.Gift
import scala.xml.Elem

case class Email(to:String, fromemail:String, fromname:String, subject:String, message:NodeSeq, cc:List[String], bcc:List[String])


/**
 * When you call Mailer.sendMail, that method calls buildProps.  buildProps reads the .props file.
 * So any props you set before calling sendMail will just get overwritten.
 */
object Emailer extends LbbLogger {
  
  
  def send(e:Email) = {
    debug("Mailer.sendMail about to be called");
    Mailer.sendMail(From(e.fromemail), Subject(e.subject), To(e.to), XHTMLMailBodyType(e.message))
    debug("Mailer.sendMail just called");
  }
  
  def config {
    var isAuth = Props.get("mail.smtp.auth", "false").toBoolean
	
	if (isAuth) {
	  (Props.get("mail.user"), Props.get("mail.password")) match {
	    case (Full(username), Full(password)) =>
	      Mailer.authenticator = Full(new Authenticator() {
	        override def getPasswordAuthentication = new
	            PasswordAuthentication(username, password)
	      })
	    case _ => new Exception("Username/password not supplied for Mailer.")
	  }
	}
  }
  
  
  def createRecoverPasswordMessage = (S.param("type"), S.param("message")) match {
      case (Full("passwordrecovery"), _) => {
        User.findAll(By(User.email, S.param("to").getOrElse("none"))) match {
          case Nil => throw new RuntimeException("Email address not found: "+S.param("to").getOrElse("none"))
          case items if(items.size == 1) => { 
            createEmail(<div>
                          {items.head.first.is}, 
                          <p>&nbsp;</p>
                          <p>Your password is:  {items.head.password.is}</p> 
                        </div>)
          }
          case items if(items.size > 1) => { 
            createEmail(<div>
                         This email address is shared by several users.  Names and passwords are below... 
                         {for(i <- items) yield { <p>{i.first.is}: {i.password.is}</p>}}
                       </div>)
          }
        }
      } // case (Full("true"), _)
      case (_, Full(msg)) => {
        Text(msg)
      }
      case _ => Text("")
  }
  
  def createDescriptionChangedEmail(salut:String, changer:String, old:String, nu:String) = 
     createEmail(<div>
              {salut},
              <P>{changer} just changed the description of an item you are buying.</P>
              <P>The description was: {old}</P>
              <P>The description is now: {nu}</P>
            </div>)
  
  
  private def createEmail(body:Elem) = {
    <html>
      <head></head>
      <body>
        <table width="100%">
          <tr>
            <td width="80%" valign="top">
              {body}
            </td>
            <td width="20%" valign="top"><a href="http://www.littlebluebird.com" target="lbb"><img src="http://www.littlebluebird.com/gf/img/logo-whitebackground.gif"/><p>LittleBlueBird.com</p></a></td>
          </tr>
        </table>
      </body>
    </html>
  }
  
  def notifyGiftDescriptionChanged(email:String, salut:String, changer:String, old:String, nu:String) = {
    val msg = createDescriptionChangedEmail(salut, changer, old, nu)
    val e = Email(email, "info@littlebluebird.com", "LittleBlueBird.com", changer+" just changed a gift's description", msg, Nil, Nil)
    Emailer.send(e)
  }
  
  def createAddedToCircleEmail(who:String, circle:String, adder:String) = 
     createEmail(<div>{who},
              <P>{adder} just included you in the event {circle} at <a href="http://www.littlebluebird.com" target="lbb">LittleBlueBird.com</a></P>
            </div>)
  
  def notifyAddedToCircle(who:String, email:String, circle:String, adder:String) = {
    val msg = createAddedToCircleEmail(who,circle,adder)
    val e = Email(email, "info@littlebluebird.com", "LittleBlueBird.com", adder+" added you to the "+circle+" event at LittleBlueBird.com", msg, Nil, Nil)
    Emailer.send(e)
  }
  
  def createGiftReturnedEmail(to:User, g:Gift) = {
    val sender = for(s <- g.sender.obj) yield {s.first.is + " " + s.last.is}
    val senderName = sender.getOrElse("Someone")
    
    createEmail(<div>{to.first.is} {to.last.is},
              <P>The following item has been returned to {g.recipientNames}'s wish list:</P>
              <P>Item: {g.description}</P>
              <P>{senderName} was going to give this item to {g.recipientNames} but has now decided not to.  So this item is available again for someone else to give.</P>
            </div>)
  }
  
  def notifyGiftReturned(g:Gift) = {
    // determine who to send email to
    // TODO create a unit test for this
    val emailList = g.getEmailListForReturns
    
    for(p <- emailList; if(p.notifyonreturngift.is.equals("true")); if(!p.email.isEmpty())) yield {
      val msg = createGiftReturnedEmail(p, g)
      val e = Email(p.email, "info@littlebluebird.com", "LittleBlueBird.com", "A gift is available again on LittleBlueBird.com", msg, Nil, Nil)
      Emailer.send(e)
    }
  }
  
  
  // 2013-06-13  method name change from:  createAccountCreatedForYouEmail  to: createAccountCreatedEmail
  // because this method is also for when you create your own account.
  def createAccountCreatedEmail(line1:String, first:String, last:String, username:String, password:String) = {    
    val body = <div>{first} {last},
              <P>{line1}</P>
              <P>Your username is: {username}</P>
              <P>Your password is: {password}</P></div>
              
    createEmail(body)
  }
  
  def notifyWelcome(user:User) = {
    notifyAccountCreated(user, "undefined")
  }
  
  /**
   * Different from other welcome emails: we don't tell the user what his user/pass is
   * because we don't know
   */
  def notifyWelcomeFacebookUser(user:User) = {
    val body = <div>{user.first.is} {user.last.is},
              <P>Welcome to LittleBlueBird!</P>
              <P>LittleBlueBird is <i>the place</i> to put your wish list for Christmas, your birthday, and any other occasion.</P>
              <P>Share LittleBlueBird with your friends and family and see how it makes gift giving a snap!</P>
              <P>You are signed in to LittleBlueBird using your Facebook login.  So you don't have to remember another username or password.  The next time you want to login to LittleBlueBird, just use your Facebook login.</P>
              </div>
    val msg = createEmail(body)
    val subj = "Welcome to LittleBlueBird!"
    val e = Email(user.email.is, "info@littlebluebird.com", "LittleBlueBird.com", subj, msg, Nil, Nil)
    Emailer.send(e)
  }
  
  // 2013-06-12  Update the functionality of this method: Make it smart enough to send one of 3 emails:
  // An email saying you created an account for yourself; an email saying someone created an account for you;
  // and an email saying you have logged in using your fb credentials (no user/pass included in this email)
  // See docs/bugs closed/Bug 1 - Incorrect welcome email to Facebook users.docx
  def notifyAccountCreated(user:User, creator:String) = {
    
    // 2013-06-12  there will either be a creator or a facebook id, but not both
    (user.facebookId, creator) match {
      case (fbid, _) if(!fbid.isEmpty()) => notifyWelcomeFacebookUser(user)
      case (_, cr) => {
        val line1 = cr match {
          case s if(!s.equals("undefined")) => creator+" created an account for you on LittleBlueBird.com"
          case _ => "Welcome to LittleBlueBird!"
        }
        val subj = line1
        val msg = createAccountCreatedEmail(line1, user.first.is, user.last.is, user.username.is, user.password.is)
        debug("createAccountCreatedEmail...  "+msg)
        val e = Email(user.email.is, "info@littlebluebird.com", "LittleBlueBird.com", subj, msg, Nil, Nil)
        Emailer.send(e)
      }
    }
    
  }
  
  def creatEventComingUpEmail(person:User, circle:Circle) = createEmail(<div>
              {person.first.is} {person.last.is},
              <P>Just a reminder, {circle.name.is} is {circle.daysaway} days away</P>
              </div>)
  
  def notifyEventComingUp(personId:Long, circle:Circle) = {
    // Look up person and circle obj's here at the time the email goes out.
    // It's possible the either one could have changed from the time the 
    // reminder was scheduled
    for(person <- User.findByKey(personId); 
        if(!person.email.isEmpty())) {
      val msg = creatEventComingUpEmail(person, circle)
      val e = Email(person.email.is, "info@littlebluebird.com", "LittleBlueBird.com", circle.name+" Reminder from LittleBlueBird.com", msg, Nil, Nil)
      Emailer.send(e)
    }
  }
  
  def createDeletedGiftEmail(salut:String, deleter:String, desc:String) = createEmail(<div>{salut},
              <P>{deleter} just deleted a gift that you bought.</P>
              <P>The gift was: {desc}</P></div>)
  
  def notifyGiftDeleted(email:String, salut:String, deleter:String, desc:String) = {
    val msg = createDeletedGiftEmail(salut, deleter, desc)
    val e = Email(email, "info@littlebluebird.com", "LittleBlueBird.com", deleter+" just deleted a gift you bought", msg, Nil, Nil)
    Emailer.send(e)
  }
  
  
//  val fromemail = "info@littlebluebird.com"
//    
//  val fromname = "LittleBlueBird.com"
//    
//  private def send(e:Email) {
//    Mailer.sendMail(From(e.fromemail), Subject(e.subject),
//      (PlainMailBodyType(e.message) :: To(e.to) :: ReplyTo(e.fromemail) :: Nil) : _*)
//  }
//  
//  // TODO add the little blue bird to all emails
//  def welcome(to:User) = {
//    val msg = to.first.is+", Welcome to LittleBlueBird.com  username: "+to.username.is
//    val e = Email(to.email.is, fromemail, fromname, "Welcome to LittleBlueBird.com", msg, Nil, Nil)
//    send(e)
//  }
//  
//  // TODO add email link to the inviter
//  def invitedby(to:User, inv:User) = {
//    val msg = to.first.is+", Welcome to LittleBlueBird.com  username: "+to.username.is+"  password: "+to.password.is+" You were invited by "+inv.first.is+" "+inv.last.is
//    val e = Email(to.email.is, fromemail, fromname, inv.first.is+" "+inv.last.is+" added you to LittleBlueBird.com", msg, Nil, Nil)
//    send(e)
//  }
//  
  // TODO need link to accept/decline?
  def addedtocircle(to:User, add:User, c:Circle) = {
//    val msg = to.first.is+", "+add.first.is+" "+add.last.is+" just invited you to the "+c.name.is+" event"
//    val e = Email(to.email.is, fromemail, fromname, add.first.is+" "+add.last.is+" just added you to the "+c.name.is+" event on LittleBlueBird.com", msg, Nil, Nil)
//    send(e)
  }
  
  def erroradding(to:User, problem:User, c:Circle) = {
//    val msg = to.first.is+", "+problem.first.is+" "+problem.last.is+" could not be added to the "+c.name.is+" event"
//    val e = Email(to.email.is, fromemail, fromname, "Problem adding "+problem.first.is+" "+problem.last.is+" to the "+c.name.is+" event on LittleBlueBird.com", msg, Nil, Nil)
//    send(e)
  }
//  
//  // TODO add link to circle
//  def giftdeleted(to:User, u:User, g:Gift) = {
//    val msg = to.first.is+", "+u.first.is+" "+u.last.is+" just deleted an item that you bought: "+g.description.is
//    val e = Email(to.email.is, fromemail, fromname, "A gift you bought has just been DELETED on LittleBlueBird.com", msg, Nil, Nil)
//    send(e)
//  }
//  
//  // TODO add link to circle
//  // TODO say how many days away
//  // TODO say when next reminder is
//  def eventisnear(to:User, c:Circle) = {
//    val msg = to.first.is+", "+c.name.is+" is approaching"
//    val e = Email(to.email.is, fromemail, fromname, to.first.is+", "+c.name.is+" is approaching", msg, Nil, Nil)
//    send(e)
//  }
  
}