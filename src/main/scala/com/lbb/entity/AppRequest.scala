package com.lbb.entity
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.LongKeyedMapper
import com.lbb.util.LbbLogger
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.ManyToMany
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedDateTime
import java.util.Date
import net.liftweb.http.JsonResponse
import net.liftweb.http.js.JE.JsArray
import net.liftweb.json.JsonAST.JString
import net.liftweb.http.js.JsExp
import javax.swing.ImageIcon
import net.liftweb.common.Box
import java.net.URL
import com.lbb.util.Util
import net.liftweb.mapper.KeyObfuscator
import net.liftweb.http.S
import net.liftweb.json.JsonAST.JObject
import net.liftweb.mapper.ByList

/**
 * delimiter $$

CREATE TABLE `app_request` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `facebook_id` varchar(140) NOT NULL,
  `fbreqid` varchar(140) NOT NULL,
  `inviter_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `app_request_inviter_id` (`inviter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1$$


 */
class AppRequest extends LongKeyedMapper[AppRequest] with LbbLogger with ManyToMany {
  def getSingleton = AppRequest
  
  def primaryKeyField = id
  object id extends MappedLongIndex(this)

  object inviter extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "inviter_id"
    override def dbNotNull_? : Boolean = true
  }

  object fbreqid extends MappedString(this, 140) {
    override def dbNotNull_? : Boolean = true
  }

  object facebookId extends MappedString(this, 140) {
    override def dbColumnName = "facebook_id"
    override def dbNotNull_? : Boolean = true
  }
  
  object name extends MappedString(this, 140) {
    override def dbNotNull_? : Boolean = true
  }
  
  object requestdate extends MappedDateTime(this) {
    override def dbNotNull_? : Boolean = true
    override def dbColumnName = "request_date"
    override def defaultValue = new Date()
  }
  
  object acceptdate extends MappedDateTime(this) {
    override def dbColumnName = "accept_date"
  }
  
  override def suplementalJs(ob: Box[KeyObfuscator]): List[(String, JsExp)] = {
    val profilepicUrl = new URL("http://graph.facebook.com/"+this.facebookId.is+"/picture?type=large")
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    val profilepicadjustedheight = Util.calculateAdjustedHeight(150, profilepicUrl)
    val profilepicadjustedwidth = Util.calculateAdjustedWidth(150, profilepicUrl)
    List(
         ("profilepicUrl", JString(profilepicUrl.toString())), 
         ("profilepicheight", profilepicheight), 
         ("profilepicwidth", profilepicwidth)
         ,("profilepicadjustedheight", Util.calculateAdjustedHeight(150, profilepicUrl))
         ,("profilepicadjustedwidth", Util.calculateAdjustedWidth(150, profilepicUrl))
         ,("profilepicmargintop", JString(Util.calculateMarginTop(150, profilepicUrl)))
         ,("profilepicmarginleft", JString(Util.calculateMarginLeft(150, profilepicUrl)))
         ,("profilepicadjustedheight100", Util.calculateAdjustedHeight(100, profilepicUrl))
         ,("profilepicadjustedwidth100", Util.calculateAdjustedWidth(100, profilepicUrl))
         ,("profilepicmargintop100", JString(Util.calculateMarginTop(100, profilepicUrl)))
         ,("profilepicmarginleft100", JString(Util.calculateMarginLeft(100, profilepicUrl)))
         ,("profilepicadjustedheight50", Util.calculateAdjustedHeight(50, profilepicUrl))
         ,("profilepicadjustedwidth50", Util.calculateAdjustedWidth(50, profilepicUrl))
         ,("profilepicmargintop50", JString(Util.calculateMarginTop(50, profilepicUrl)))
         ,("profilepicmarginleft50", JString(Util.calculateMarginLeft(50, profilepicUrl)))
         )        
  }
  
}


object AppRequest extends AppRequest with LongKeyedMetaMapper[AppRequest] {
  
  override def dbTableName = "app_request" // define the DB table name
    
  def createFromHttp = {
    
    // create the AppRequest objects
    val vvvv = for(req <- S.request; jvalue <- req.json) yield {
      debug("saveAppRequests:  ("+jvalue.getClass.getName+")  jvalue = "+jvalue);
      
      val appreqlist = jvalue match {
        case jobj:JObject => {
          jobj.values.get("requests") match {
            case Some(list:List[Map[String, Any]]) => {
              val apprequests = for(map <- list) yield {
                // would also like to the write to the person table, but all we know about this person is name and facebook id
                // better to wait till the request is accepted and we know email.  Even that isn't foolproof though if person
                // exists under a different email
                val ar = AppRequest.create 
                for(kv <- map) {
                  kv match {
                    case ("parentId", b:BigInt) => { ar.inviter(b.toInt); debug("createFromHttp:  parentId="+b+" (BigInt)") }
                    case ("facebookId", s:String) => ar.facebookId(s) 
                    case ("name", s:String) => ar.name(s);
                    case ("fbreqid", s:String) => ar.fbreqid(s);
                    case _ => { error("createFromHttp:  unhandled kv pair: "+kv._1+" ("+kv._1.getClass.getName+") and "+kv._2+" ("+kv._2.getClass.getName+")"); }
                  } // kv match
                } // for(kv <- map)
                
                ar
              
              } // val apprequests = for(map <- list)
              apprequests
            } // case Some(list:List[Map[String, Any]])
            
            case _ => Nil
          } // jobj.values.get("requests")
          
        } // case jobj:JObject
        case _ => Nil
      } // val appreqlist = jvalue match {
      appreqlist      
    } // for(req <- S.request; jvalue <- req.json) yield {
    
    
    val reqs = vvvv.openOr(Nil)
    
    
    // ^--- These app requests contain facebook id's.  It's possible that some of these people are already in the person
    // table with a facebook id and an email present.  In this case, we should go ahead and set the app_request.accept_date also.
    // Setting app_request.accept_date will have the following effect: It means the invited person won't have "pending" under
    // his name.  We don't want to give the impression that a user isn't fully a user yet when they actually are.
    val facebookIds = reqs.map(_.facebookId.is)
    
    val userswithemail = User.findAll(ByList(User.facebookId, facebookIds)).filter(u => {u.email.is!=null && !u.email.is.trim.equals("")})
    val facebookIds_ofpeole_thatarealreadyusers = userswithemail.map(_.facebookId.is)
    
    for(req <- reqs; if(facebookIds_ofpeole_thatarealreadyusers.contains(req.facebookId.is))) {
      req.acceptdate(new Date())
    }
    
    reqs

  }
    
}