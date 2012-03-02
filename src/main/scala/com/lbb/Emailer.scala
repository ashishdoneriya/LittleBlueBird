package com.lbb
import net.liftweb.util.Mailer
import net.liftweb.util.Mailer._
import net.liftweb.common.Full
import net.liftweb.util.Props
import javax.mail.Authenticator
import javax.mail.PasswordAuthentication

object Emailer {
  
  val fromemail = "info@littlebluebird.com"
    
  val fromname = "LittleBlueBird.com"
    
  private def send(e:Email) {
    Mailer.sendMail(From(e.fromemail), Subject(e.subject),
      (PlainMailBodyType(e.message) :: To(e.to) :: ReplyTo(e.fromemail) :: Nil) : _*)
  }
  
  // TODO add the little blue bird to all emails
  def welcome(to:User) = {
    val msg = to.first.is+", Welcome to LittleBlueBird.com  username: "+to.username.is
    val e = Email(to.email.is, fromemail, fromname, "Welcome to LittleBlueBird.com", msg, Nil, Nil)
    send(e)
  }
  
  // TODO add email link to the inviter
  def invitedby(to:User, inv:User) = {
    val msg = to.first.is+", Welcome to LittleBlueBird.com  username: "+to.username.is+"  password: "+to.password.is+" You were invited by "+inv.first.is+" "+inv.last.is
    val e = Email(to.email.is, fromemail, fromname, inv.first.is+" "+inv.last.is+" added you to LittleBlueBird.com", msg, Nil, Nil)
    send(e)
  }
  
  // TODO need link to accept/decline?
  def addedtocircle(to:User, add:User, c:Circle) = {
    val msg = to.first.is+", "+add.first.is+" "+add.last.is+" just invited you to the "+c.name.is+" event"
    val e = Email(to.email.is, fromemail, fromname, add.first.is+" "+add.last.is+" just added you to the "+c.name.is+" event on LittleBlueBird.com", msg, Nil, Nil)
    send(e)
  }
  
  def erroradding(to:User, problem:User, c:Circle) = {
    val msg = to.first.is+", "+problem.first.is+" "+problem.last.is+" could not be added to the "+c.name.is+" event"
    val e = Email(to.email.is, fromemail, fromname, "Problem adding "+problem.first.is+" "+problem.last.is+" to the "+c.name.is+" event on LittleBlueBird.com", msg, Nil, Nil)
    send(e)
  }
  
  // TODO add link to circle
  def giftdeleted(to:User, u:User, g:Gift) = {
    val msg = to.first.is+", "+u.first.is+" "+u.last.is+" just deleted an item that you bought: "+g.description.is
    val e = Email(to.email.is, fromemail, fromname, "A gift you bought has just been DELETED on LittleBlueBird.com", msg, Nil, Nil)
    send(e)
  }
  
  // TODO add link to circle
  // TODO say how many days away
  // TODO say when next reminder is
  def eventisnear(to:User, c:Circle) = {
    val msg = to.first.is+", "+c.name.is+" is approaching"
    val e = Email(to.email.is, fromemail, fromname, to.first.is+", "+c.name.is+" is approaching", msg, Nil, Nil)
    send(e)
  }
  
  def configMailer() {
    var isAuth = Props.get("mail.smtp.auth", "false").toBoolean

	Mailer.customProperties = Props.get("mail.smtp.host", "localhost") match {
	  case "smtp.gmail.com" =>
	    isAuth = true
	    Map(
	      "mail.smtp.host" -> "smtp.gmail.com",
	      "mail.smtp.port" -> "587",
	      "mail.smtp.auth" -> "true",
	      "mail.smtp.starttls.enable" -> "true")
	  case host => Map(
	    "mail.smtp.host" -> host,
	    "mail.smtp.port" -> Props.get("mail.smtp.port", "25"),
	    "mail.smtp.auth" -> isAuth.toString
	  )
	}
	
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
}