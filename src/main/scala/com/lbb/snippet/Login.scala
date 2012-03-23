package com.lbb.snippet
import scala.xml.NodeSeq
import com.lbb.User
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.SessionVar
import net.liftweb.http.S
import net.liftweb.http.SHtml
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.OprEnum
import net.liftweb.util.Helpers.bind
import net.liftweb.util.Helpers.strToSuperArrowAssoc
import net.liftweb.http.RequestVar


object SessionUser extends SessionVar[Box[User]](Empty)

object isSuper extends SessionVar[Boolean](false)

object Logout {
  def apply() = {
    println("Logout.apply")
    SessionUser(Empty)
    isSuper(false)
    S.redirectTo("index")
  }
}

class Login {  
  object username extends RequestVar("")
      
  def login(xhtml: NodeSeq): NodeSeq = {
    var password=""
      
    def doLogin() {
      
      val users = User.findAll(Cmp(User.username, OprEnum.Like, Full(username.is), Empty, Full("LOWER")))
        
      users match {
        case Nil => S.error("username", "Username not found")
        case found:List[User] if(found.size > 1) => S.error("username", "More than one user found with this Username.  How did this happen?")  // S.error will handle this properly
        case found:List[User] if(!found.head.password.match_?(password)) => S.error("password", "Password incorrect")
        case u :: us => {
          SessionUser(Full(u))
          println(SessionUser.is.openOr("login"))
          isSuper(u.username=="bdunklau")
          S.redirectTo("index")
        }
      }
    }
    
    bind("f", xhtml, 
         "username" -> SHtml.text(username.is, username(_)),
         "password" -> SHtml.password(password, password = _),
         "login" -> SHtml.submit("login", doLogin))
  }
}

