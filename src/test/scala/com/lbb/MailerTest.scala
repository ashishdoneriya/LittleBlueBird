package com.lbb
import org.junit.runner.RunWith
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.junit.JUnitRunner
import org.scalatest.FunSuite

import javax.mail.Authenticator
import javax.mail.PasswordAuthentication
import net.liftweb.common.Full
import net.liftweb.util.Mailer.From
import net.liftweb.util.Mailer.PlainMailBodyType
import net.liftweb.util.Mailer.ReplyTo
import net.liftweb.util.Mailer.Subject
import net.liftweb.util.Mailer.To
import net.liftweb.util.Mailer
import net.liftweb.util.Props

@RunWith(classOf[JUnitRunner])
class MailerTest extends FunSuite with AssertionsForJUnit {

  test("send email") {
    configMailer()
    sendEMail("bdunklau@yahoo.com", "bdunklau@yahoo.com", "bdunklau@yahoo.com", "email from Lift", "this email came from LittleBlueBird:MailerTest")
    // gotta give the mailer time to send the email
    println("sleeping")
    Thread.sleep(10000)
    println("done")
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
  
  def sendEMail(from: String, to: String, replyTo: String, subject: String, message: String) {
    Mailer.sendMail(From(from), Subject(subject),
      (PlainMailBodyType(message) :: To(to) :: ReplyTo(replyTo) :: Nil) : _*)
  }
}