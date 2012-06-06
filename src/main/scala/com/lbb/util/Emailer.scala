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

//case class Email(to:String, fromemail:String, fromname:String, subject:String, message:String, cc:List[String], bcc:List[String])
case class Email(to:String, fromemail:String, fromname:String, subject:String, message:NodeSeq, cc:List[String], bcc:List[String])


/**
 * When you call Mailer.sendMail, that method calls buildProps.  buildProps reads the .props file.
 * So any props you set before calling sendMail will just get overwritten.
 */
object Emailer {
  
  
  def send(e:Email) = {
    Mailer.sendMail(From(e.fromemail), Subject(e.subject), To(e.to), XHTMLMailBodyType(e.message))
//      (PlainMailBodyType(e.message) :: To(e.to) :: ReplyTo(e.fromemail) :: Nil) : _*)
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
  
  
  def createMessage = (S.param("passwordrecovery"), S.param("message")) match {
      case (Full("true"), _) => {
        User.findAll(By(User.email, S.param("to").getOrElse("none"))) match {
          case Nil => throw new RuntimeException("Email address not found: "+S.param("to").getOrElse("none"))
          case items if(items.size == 1) => { 
            <html><head> </head><body><table width="100%"><tr><td width="80%" valign="top">{items.head.first.is}, <p>&nbsp;</p><p>Your password is:  {items.head.password.is}</p> </td><td width="20%" valign="top"><img src="http://www.littlebluebird.com/giftfairy/img/logo.gif"/></td></tr></table>    </body></html>
          }
          case items if(items.size > 1) => { 
            <html><head> </head><body><table width="100%"><tr><td width="80%" valign="top">This email address is shared by several users.  Names and passwords are below... {for(i <- items) yield { <p>{i.first.is}: {i.password.is}</p>}} </td><td width="20%" valign="top"><img src="http://www.littlebluebird.com/giftfairy/img/logo.gif"/></td></tr></table>    </body></html>
          }
        }
      } // case (Full("true"), _)
      case (_, Full(msg)) => {
        Text(msg)
      }
      case _ => Text("")
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