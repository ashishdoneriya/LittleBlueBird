package bootstrap.liftweb
import net.liftweb.db.StandardDBVendor
import net.liftweb.http.LiftRules
import net.liftweb.mapper.Schemifier
import net.liftweb.mapper.DB
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.util.Props
import net.liftweb.common._
import com.lbb.User
import com.lbb.User
import com.lbb.User
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
import com.lbb.CircleParticipant
import com.lbb.Circle
import com.lbb.Gift
import com.lbb.Recipient
import net.liftweb.util.NamedPF
import net.liftweb.http.RewriteRequest
import net.liftweb.http.ParsePath
import net.liftweb.http.RewriteResponse
import com.lbb.EventLoc
import com.lbb.PopulateDb

class Boot {
  def boot {
    if (!DB.jndiJdbcConnAvailable_?) {
      val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver", //"org.h2.Driver", //"com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3306/littlebluebird", //"jdbc:h2:~/test", //"jdbc:mysql://localhost:3306/littlebluebird",
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

      LiftRules.unloadHooks.append(vendor.closeAllConnections_! _)

      DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
    }
    
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

    // where to search snippet
    LiftRules.addToPackages("com.lbb")
    
    LiftRules.rewrite.prepend(NamedPF("CircleRewrite") {
      // TODO Are we using this one?
      case RewriteRequest(ParsePath("circle" :: "view" :: circle :: Nil, _, _,_), _, _) => 
        RewriteResponse("circle" :: "index" :: Nil, Map("circle" -> circle))
      case RewriteRequest(ParsePath("circle" :: "details" :: circle :: Nil, _, _,_), _, _) => 
        RewriteResponse("circle" :: "index" :: Nil, Map("circle" -> circle))
      case RewriteRequest(ParsePath("giftlist" :: circle :: recipient :: Nil, _, _,_), _, _) => 
        RewriteResponse("circle" :: "gifts" :: Nil, Map("circle" -> circle, "recipient" -> recipient))
    })
    
    // https://github.com/lift/framework/blob/master/web/webkit/src/main/scala/net/liftweb/sitemap/Loc.scala
    val SuperRequired = If(() => com.lbb.snippet.isSuper.get, 
                                       () => RedirectResponse("/index"))
                                       
    val LoggedIn = If(() => com.lbb.snippet.SessionUser.is != Empty, () => RedirectResponse("/index"))
    val NotLoggedIn = If(() => com.lbb.snippet.SessionUser.is == Empty, () => RedirectResponse("/index"))
                                       
    val userMenu = Menu(Loc("User", "user"::"index"::Nil, "Admin: Users", SuperRequired))
    val addUserMenu = Menu(Loc("Register", "user"::"add"::Nil, "Register"))
    val editUserMenu = Menu(Loc("EditUser", "user"::"edit"::Nil, "Edit User", Hidden))
    val deleteUserMenu = Menu(Loc("DeleteUser", "user"::"delete"::Nil, "Delete User", Hidden))

    // dynamic menu items from db ...try: http://groups.google.com/group/liftweb/msg/f5d03fc3bf446f1c
    // and...  http://scala-programming-language.1934581.n4.nabble.com/Menu-generated-from-database-td1979930.html
    val entries = Menu(Loc("HomeLoc", Link(List("index"), true, "/index"), "HomeAB")) ::
                  Menu(Loc("LoginLoc", Link(List("login"), true, "/login"), "Login", NotLoggedIn)) ::
                  Menu(Loc("LogoutLoc", Link(List("logout"), true, "/logout"), "Logout", LoggedIn)) ::
                  Menu(Loc("AddEventLoc", "circle"::"addevent"::Nil, "Add Event", LoggedIn)) ::
                  Menu(new EventLoc) ::
                  addUserMenu :: editUserMenu :: deleteUserMenu :: 
                  Menu(Loc("CircleView", "circle"::"index"::Nil, "View Circles", Hidden)) ::
                  Menu(Loc("CircleAdmin", "circle"::"admin"::Nil, "Admin: Circles", SuperRequired)) ::
                  Menu(Loc("CircleAdd", "circle"::"add"::Nil, "Add Circle", LoggedIn, Hidden)) ::
                  Menu(Loc("CircleEdit", "circle"::"edit"::Nil, "Edit Circle", LoggedIn, Hidden)) ::
                  Menu(Loc("CircleDelete", "circle"::"delete"::Nil, "Delete Circle", LoggedIn, Hidden)) ::
                  Menu(Loc("CircleDetails", ("circle"::"details" :: Nil) -> true, "CircleDetails", LoggedIn, Hidden)) ::
                  Menu(Loc("Y", ("giftlist" :: Nil) -> true, "Y", LoggedIn, Hidden)) ::
                  Menu(Loc("X", ("circle"::"gifts" :: Nil) -> true, "X", LoggedIn, Hidden)) ::
                  userMenu :: 
                  Menu(Loc("Logmein", "b"::Nil, "Log Me In", Hidden)) :: Nil
    
    LiftRules.setSiteMap(SiteMap(entries:_*))
    
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