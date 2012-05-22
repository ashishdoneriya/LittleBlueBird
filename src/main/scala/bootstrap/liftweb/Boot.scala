package bootstrap.liftweb
import net.liftweb.db.StandardDBVendor
import net.liftweb.http.LiftRules
import net.liftweb.mapper.Schemifier
import net.liftweb.mapper.DB
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.util.Props
import net.liftweb.common._
import net.liftweb.sitemap.SiteMap
import net.liftweb.sitemap.Menu
import net.liftweb.sitemap.Loc
import net.liftweb.sitemap.Loc._
import net.liftweb.util.Mailer._
import net.liftweb.util.Mailer
import javax.mail.Authenticator
import javax.mail.PasswordAuthentication
import net.liftweb.http.S
import net.liftweb.http.RedirectResponse
import com.lbb.entity.User
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Circle
import com.lbb.entity.Gift
import com.lbb.entity.Recipient
import net.liftweb.util.NamedPF
import net.liftweb.http.RewriteRequest
import net.liftweb.http.ParsePath
import net.liftweb.http.RewriteResponse
import com.lbb.PopulateDb
import net.liftweb.http.DocType
import net.liftweb.http.Req
import net.liftweb.mapper.MapperRules
import scala.xml.NodeSeq
import com.lbb.RestService

class Boot {
  def boot {
    // TODO need real db pool
    if (!DB.jndiJdbcConnAvailable_?) {
      val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver", //"org.h2.Driver", //"com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3306/littlebluebird", //"jdbc:h2:~/test", //"jdbc:mysql://localhost:3306/littlebluebird",
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

      LiftRules.unloadHooks.append(vendor.closeAllConnections_! _)

      DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
    }
    
    // to make the container serve a collection of files...
    LiftRules.passNotFoundToChain = true
    
    // to make the container serve a collection of files...
    LiftRules.liftRequest.append{
        case Req("app" :: _, _, _) => false
     } 
    
  
    // set DocType to HTML5
    LiftRules.docType.default.set((r: Req) => r match {
      case _ if S.skipDocType => Empty
      case _ if S.getDocType._1 => S.getDocType._2
      case _ => Full(DocType.html5)
    })
    
    MapperRules.formatFormElement = (name:NodeSeq, form:NodeSeq) =>
      <xml:group><div>{form}</div></xml:group> 
    
//    PopulateDb.doit
//    println("Boot.boot: db populated with sample data")
    
    configMailer
    
    // this works
    //sendEMail("bdunklau@yahoo.com", "bdunklau@yahoo.com", "info@littlebluebird.com", "email from Lift", "this email came from LBB:Boot")

    // Use Lift's Mapper ORM to populate the database
    // you don't need to use Mapper to use Lift... use
    // any ORM you want
    Schemifier.schemify(true, Schemifier.infoF _, User)
    Schemifier.schemify(true, Schemifier.infoF _, Circle)
    Schemifier.schemify(true, Schemifier.infoF _, CircleParticipant)
    Schemifier.schemify(true, Schemifier.infoF _, Gift)
    Schemifier.schemify(true, Schemifier.infoF _, Recipient)
    
    LiftRules.dispatch.append(RestService)
                              
    Props.mode match {
      case Props.RunModes.Test => println("we are in Test mode")
      case Props.RunModes.Development => println("we are in Development mode")
      case Props.RunModes.Pilot => println("we are in Pilot mode")
      case Props.RunModes.Production => println("we are in Production mode")
      case Props.RunModes.Staging => println("we are in Staging mode")
      case _ => println("unknown run mode: "+Props.mode)                                        
    }
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
    println("just sent an email #####################################################")
  }
}