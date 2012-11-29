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
         )        
  }
  
}


object AppRequest extends AppRequest with LongKeyedMetaMapper[AppRequest] {
  
  override def dbTableName = "app_request" // define the DB table name
  
//  def toJsonResponse(l:List[AppRequest]) = {
//    val jsons = l.map(_.asJs)
//    val jsArr = JsArray(jsons)
//    val r = JsonResponse(jsArr)
//    debug("toJsonResponse:  JsonResponse: "+r);
//    r
//  }
    
}