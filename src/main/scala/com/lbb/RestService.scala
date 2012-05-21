package com.lbb
import java.text.SimpleDateFormat
import java.util.Date
import com.lbb.entity.Circle
import com.lbb.entity.User
import com.lbb.util.MapperHelper
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JsExp
import net.liftweb.http.js.JsObj
import net.liftweb.http.rest.RestHelper
import net.liftweb.http.BadResponse
import net.liftweb.http.JsonResponse
import net.liftweb.http.Req
import net.liftweb.http.S
import net.liftweb.json.JsonAST._
import net.liftweb.util.BasicTypesHelpers._
import com.lbb.entity.Gift

object RestService extends RestHelper {

  // ref:  http://www.assembla.com/spaces/liftweb/wiki/REST_Web_Services
  serve {
    case Get("api" :: "users" :: AsLong(userId) :: _, _) => println("RestService.serve:  22222222222222"); findUser(userId)
    case Get("api" :: "users" :: _, _) => println("RestService.serve:  333333333333333333333333"); findUsers
    case JsonPost("api" :: "gifts" :: AsLong(giftId) :: _, (json, req)) => println("RestService.serve:  BBBBBBBB"); updateGift(giftId)
    case JsonPost("api" :: "gifts" :: Nil, (json, req)) => println("RestService.serve:  CCCCCCC"); debug(json); insertGift
    case JsonPost("api" :: "users" :: AsLong(userId) :: _, (json, req)) => println("RestService.serve:  4.5 4.5 4.5 4.5 "); debug(json); updateUser(userId)
    case JsonPost("api" :: "users" :: Nil, (json, req)) => println("RestService.serve:  4444444444444444"); debug(json); insertUser
    //case Post("api" :: "users" :: Nil, _) => println("RestService.serve:  555555555555555"); insertUser
    case Post("api" :: "users" :: _, _) => println("RestService.serve:  Post(api :: users  :: _, _)  S.uri="+S.uri); JsonResponse("Post(api :: users  :: _, _)  S.uri="+S.uri)
    case Post(_, _) => println("RestService.serve:  case Post(_, _)"); JsonResponse("Post(_, _)  S.uri="+S.uri)
    
    // circles...
    case Get("api" :: "circles" :: AsLong(circleId) :: _, _) => println("RestService.serve:  88888888"); findCircle(circleId)
    case Get("api" :: "circleparticipants" :: AsLong(circleId) :: _, _) => println("RestService.serve:  77777777777"); findCircleParticipants(circleId)
    
    // gifts...
    case Get("api" :: "gifts" :: AsLong(giftId) :: _, _) => println("RestService.serve:  999999999"); findGift(giftId)
    case Get("api" :: "gifts" :: _, _) => println("RestService.serve:  AAAAAAAAA"); findGifts
    
    //case _ => println("RestService.serve:  666666666"); debug
  }
  
  def debug = {
    S.request match {
      case Full(req) => 
        println("RestService.debug: req.request.method = "+req.request.method) 
      case Empty => println("RestService.debug: NO REQUEST OBJECT - THAT SHOULDN'T HAPPEN")
      case _ => println("RestService.debug: case _ - THAT SHOULDN'T HAPPEN")
    }
    JsonResponse("")
  }
  
  def debug(json:JValue) = {
    println("RestService.debug:  json = "+json.toString())
    JsonResponse("???  S.uri=" + S.uri)
  }
  
  def insertUser = {
    S.request match {
      case Full(req) => {
        req.json match {
          case Full(jvalue:JObject) => {
            println("RestService.insertUser: jvalue = "+jvalue)
            val user = User.create
            jvalue.values foreach {kv => (kv._1, kv._2) match {
                case ("fullname", s:String) => user.name(s)
                case ("first", s:String) => user.first(s)
                case ("last", s:String) => user.last(s)
                case ("email", s:String) => user.email(s)
                case ("username", s:String) => user.username(s)
                case ("password", s:String) => user.password(s)
                case ("bio", s:String) => user.bio(s)
                case ("profilepic", s:String) => user.profilepic(s)
                case ("dateOfBirth", s:String) => user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s)) // not sure about this on yet
              }
            }
            user.save()
            JsonResponse(user.asJs)
          }
          case _ => println("RestService.insertUser: case _ :  req.json = "+Empty); BadResponse()
        }
      }
      case _ => BadResponse()
    }
  }
  
  def updateUser(id:Long) = (User.findByKey(id), S.request) match {
    case (Full(user), Full(req)) => {
      req.json match {
        case Full(jvalue:JObject) => {
            jvalue.values foreach {kv => (kv._1, kv._2) match {
                case ("userId", id:BigInt) => { }
                case ("fullname", s:String) => user.name(s)
                case ("first", s:String) => user.first(s)
                case ("last", s:String) => user.last(s)
                case ("email", s:String) => user.email(s)
                case ("username", s:String) => user.username(s)
                case ("password", s:String) => user.password(s)
                case ("bio", s:String) => user.bio(s)
                case ("profilepic", s:String) => user.profilepic(s)
                case ("dateOfBirth", s:String) => {
                  if(s!=null && !s.toString().trim().equals("") && !s.toString().trim().equals("0")) {
                    println("updateUser:  s = '"+s+"'");  user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s.toString())) // not sure about this on yet
                  }
                }
              } // (kv._1, kv._2) match {
            } // jvalue.values foreach {
            
            user.save()
            JsonResponse(user.asJs)
            
        } // case Full(jvalue:JObject)
        
        case _ => BadResponse()
        
      } // req.json match
      
    } // case (Full(user), Full(req))
    
    case _ => BadResponse()
  }
  
  def findUser(id:Long) = {
    println("RestService.findCircle:  id="+id)
    User.findByKey(id) match {
      case Full(user) => JsonResponse(user.asJs)
      case _ => JsonResponse("")
    }
  }
  
  def findUsers = {
    println("RestService.findUsers ------------- S.uri = "+S.uri)
    
    S.param("password") match {
      // here we're authenticating
      case Full(p) if(p != "undefined") => {
        val queryParams = MapperHelper.convert(S.request.open_!._params, User.queriableFields)
        val users = User.findAll(queryParams: _*)
        users match {
          case l:List[User] if((l.size == 1) && (l.head.password.equals(p))) => {
            // TODO got weird char-by-char json response on the client when I tried to deal with just one
            // object, so create a List of one object and do the same thing you do in the regular query block
            val jsons = users.map(_.asJs)
            val jsArr = JsArray(jsons)
            val r = JsonResponse(jsArr)
            println("RestService.findUsers: JsonResponse(jsArr)=" + r.toString())
            r
          }
          case _ => {
            println("RestService.findUsers: BadResponse (pass:"+p+")"); 
            BadResponse()
          }
        }
      }
      // regular query
      case _ => {
        val queryParams = MapperHelper.convert(S.request.open_!._params, User.queriableFields)
        val users = User.findAll(queryParams: _*)
        val jsons = users.map(_.asJs)
        val jsArr = JsArray(jsons)
        val r = JsonResponse(jsArr)
        println("RestService.findUsers: JsonResponse(jsArr)=" + r.toString())
        r
      }
    }
    
  }
  
  def findCircle(id:Long) = {
    println("RestService.findCircle:  id="+id)
    Circle.findByKey(id) match {
      case Full(circle) => JsonResponse(circle.asJs)
      case _ => JsonResponse("")
    }
  }
  
  def findCircleParticipants(circleId:Long) = Circle.findByKey(circleId) match {
    case Full(circle) => {
      
      val receivers = circle.participantList.filter(_.isReceiver(circle)).map(_.asJsShallow)
      val rarr = JArray(receivers)
      
      val givers = circle.participantList.filter(!_.isReceiver(circle)).map(_.asJsShallow)
      val garr = JArray(givers)
      
      val giverField = JField("givers", garr)
      val receiverField = JField("receivers", rarr)
      
      val participants = JObject(List(giverField, receiverField))  
      val jarr = JField("participants", participants)
      
      val r = JsonResponse(participants)
      println("RestService.findCircleParticipants: JsonResponse(jsArr)=" + r.toString())
      r
    }
    case _ => JsonResponse("")
  }
  
  // TODO implement this
  def findGift(id:Long) = {
    BadResponse()
  }
  
  def findGifts = (User.findByKey(asLong(S.param("viewerId") openOr "") openOr -1), 
                   Circle.findByKey(asLong(S.param("circleId") openOr "") openOr -1), 
                   User.findByKey(asLong(S.param("recipientId") openOr "") openOr -1)) match {
      case (Full(viewer), Full(circle), Full(recipient)) => {
        val giftlist = recipient.giftlist(viewer, circle);
        val jsons = giftlist.map(_.asJs)
        val jsArr = JsArray(jsons)
        val r = JsonResponse(jsArr)
        println("RestService.findGifts: JsonResponse(jsArr)=" + r.toString())
        r
      }
      case (Full(viewer), Empty, Empty) => {
        val mywishlist = viewer.mywishlist
        val jsons = mywishlist.map(_.asJs)
        val jsArr = JsArray(jsons)
        val r = JsonResponse(jsArr)
        println("RestService.findGifts: JsonResponse(jsArr)=" + r.toString())
        r
      }
      case _ => {
        println("RestService.findGifts: S.param(viewerId)=" + S.param("viewerId"))
        println("RestService.findGifts: S.param(circleId)=" + S.param("circleId"))
        println("RestService.findGifts: S.param(recipientId)=" + S.param("recipientId"))
        BadResponse()
      }
  }
  
  def updateGift(id:Long) = (Gift.findByKey(id), S.request) match {
    case (Full(gift), Full(req)) => {
      req.json match {
        case Full(jvalue:JObject) => {
          jvalue.values foreach {kv => (kv._1, kv._2) match {
              case ("giftId", id:BigInt) => { }
              case ("description", s:String) => gift.description(s)
              case ("url", s:String) => gift.url(s)
              case ("receivers", a:Any) => println("updateGift: receivers = "+a.toString)
            } // kv => (kv._1, kv._2) match
          } // jvalue.values foreach
          
          gift.save()
          JsonResponse(gift.asJs)
          
        } // case Full(jvalue:JObject)
        case _ => BadResponse()
      } // req.json
    } // case (Full(user), Full(req))
    case _ => BadResponse()
  }
  
  
  def insertGift = {
    S.request match {
      case Full(req) => {
        req.json match {
          case Full(jvalue:JObject) => {
            println("RestService.insertGift: jvalue = "+jvalue)
            val gift = Gift.create
            jvalue.values foreach {kv => (kv._1, kv._2) match {
                case ("addedby", a:BigInt) => gift.addedBy(a.longValue())
                case ("circle", a:BigInt) if(a!=null && a.longValue() != 0 && a.longValue() != -1L) => gift.circle(a.longValue())
                case ("description", s:String) => gift.description(s)
                case ("url", s:String) => gift.url(s)
                case ("receivers", l:List[Map[String, Any]]) => {
                  //println("insertGift:  so far so good  kv._2="+kv._2)
                  l.filter(e => e.get("checked").getOrElse(false).equals(true) )
                     .foreach(e => {
                       val boxId = asLong(e.get("id"))
                       println("RestService.insertGift: recipient id = " + boxId.getOrElse(-1L))
                       gift.addRecipient(boxId.getOrElse(-1L)) 
                     })
                }
                case _ => println("insertGift:  Not handled: kv._1="+kv._1+"  kv._2="+kv._2)
              } // (kv._1, kv._2) match
            } // jvalue.values foreach
            gift.save()
            JsonResponse(gift.asJs)
          } // case Full(jvalue:JObject)
          case _ => println("RestService.insertGift: case _ :  req.json = "+Empty); BadResponse()
        } // req.json match
      } // case Full(req)
      case _ => BadResponse()
    } // S.request match
  }
  
  
}