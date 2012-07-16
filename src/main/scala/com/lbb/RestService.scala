package com.lbb
import java.text.SimpleDateFormat
import java.util.Date

import com.lbb.entity.Circle
import com.lbb.entity.Gift
import com.lbb.entity.User
import com.lbb.util.Email
import com.lbb.util.Emailer
import com.lbb.util.MapperHelper
import com.lbb.util.RequestHelper
import com.lbb.util.SearchHelper

import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JsExp
import net.liftweb.http.js.JsObj
import net.liftweb.http.provider.HTTPCookie
import net.liftweb.http.rest.RestHelper
import net.liftweb.http.BadResponse
import net.liftweb.http.JsonResponse
import net.liftweb.http.NoContentResponse
import net.liftweb.http.Req
import net.liftweb.http.S
import net.liftweb.json.JsonAST._
import net.liftweb.util.BasicTypesHelpers._

object RestService extends RestHelper {

  // ref:  http://www.assembla.com/spaces/liftweb/wiki/REST_Web_Services
  serve {
    // gifts...
    case Get("gifts" :: AsLong(giftId) :: _, _) => println("RestService.serve:  999999999"); findGift(giftId)
    case Get("gifts" :: _, _) => println("RestService.serve:  AAAAAAAAA"); findGifts
    
    case JsonPost("circles" :: AsLong(circleId) :: _, (json, req)) => println("updateCircle: "+circleId); updateCircle(circleId)
  }
  
  serve {
    case Get("users" :: AsLong(userId) :: _, _) => println("RestService.serve:  22222222222222"); findUser(userId)
    case Get("users" :: _, _) => println("RestService.serve:  333333333333333333333333"); findUsers
    case Post("logout" :: _, _) => S.deleteCookie("userId");NoContentResponse()
    case JsonPost("email" :: _, (json, req)) => sendemail 
    case JsonPost("gifts" :: AsLong(giftId) :: _, (json, req)) => println("RestService.serve:  BBBBBBBB"); updateGift(giftId)
    case JsonPost("gifts" :: Nil, (json, req)) => println("RestService.serve:  CCCCCCC"); debug(json); insertGift
    case JsonPost("users" :: AsLong(userId) :: _, (json, req)) => println("RestService.serve:  4.5 4.5 4.5 4.5 "); debug(json); updateUser(userId)
    case JsonPost("users" :: Nil, (json, req)) => println("RestService.serve:  4444444444444444"); debug(json); insertUser
    case Get("usersearch" :: _, _) => println("RestService.serve:  JsonPost: usersearch"); SearchHelper.usersearch
    case JsonPost("circles" :: Nil, (json, req)) => insertCircle
    
    case Post("users" :: _, _) => println("RestService.serve:  Post(api :: users  :: _, _)  S.uri="+S.uri); JsonResponse("Post(api :: users  :: _, _)  S.uri="+S.uri)
    
    case Post(_, _) => println("RestService.serve:  case Post(_, _)"); JsonResponse("Post(_, _)  S.uri="+S.uri)
    
    // circles...
    case Get("circles" :: AsLong(circleId) :: _, _) => println("RestService.serve:  88888888"); findCircle(circleId)
    case Get("circleparticipants" :: AsLong(circleId) :: _, _) => println("RestService.serve:  77777777777"); findCircleParticipants(circleId)
    
    case Delete("gifts" :: AsLong(giftId) :: _, _) => deleteGift(giftId)
    case _ => println("RestService.serve:  666666666"); debug
  }
  
  def sendemail = {
    try {
      val message = Emailer.createMessage
    
      val email = Email(S.param("to").getOrElse("info@littlebluebird.com"),
                        S.param("from").getOrElse("info@littlebluebird.com"),          
                        S.param("fromname").getOrElse("LittleBlueBird.com"),          
                        S.param("subject").getOrElse("Password Recovery"),          
                        message, Nil, Nil)
          
      Emailer.send(email)
  
      NoContentResponse()
    }
    catch {
      case e:RuntimeException => BadResponse()
    }
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
            jvalue.values foreach {kv => kv match {
                case ("fullname", s:String) => user.name(s)
                case ("first", s:String) => user.first(s)
                case ("last", s:String) => user.last(s)
                case ("email", s:String) => user.email(s)
                case ("username", s:String) => user.username(s)
                case ("password", s:String) => user.password(s)
                case ("bio", s:String) => user.bio(s)
                case ("profilepic", s:String) => user.profilepic(s)
                case ("dateOfBirth", s:String) => user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s)) // not sure about this one yet
                case _ => println("RestService.insertUser:  unhandled: "+kv._1+" = "+kv._2)
              }
            }
            user.save()
            val cookies = S.param("login").filter(p => p.equals("true")).map(s => RequestHelper.cookie("userId", user))
            JsonResponse(user.asJs, Nil, cookies.toList, 200)
          }
          case _ => println("RestService.insertUser: case _ :  req.json = "+Empty); BadResponse()
        }
      }
      case _ => BadResponse()
    }
  }
  
  def updateCircle(id:Long) = (Circle.findByKey(id), S.request) match {
    case (Full(circle), Full(req)) => {
      req.json match {
        case Full(jvalue:JObject) => {
          jvalue.values foreach {kv => (kv._1, kv._2) match {
              case ("circleId", id:BigInt) => { }
              case ("datedeleted", b:BigInt) => circle.date_deleted(new Date(b.toLong))
            } // kv => (kv._1, kv._2) match
          } // jvalue.values foreach
            
          circle.save()
          JsonResponse(circle.asJs)
            
        } // case Full(jvalue:JObject)
        
        case _ => BadResponse()
        
      } // req.json
    } // case (Full(user), Full(req))
    
    case _ => BadResponse()
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
    println("RestService.findUser:  id="+id)
    User.findByKey(id) match {
      case Full(user) => println("RestService.findUser:  user.asJs => "+user.asJs);JsonResponse(user.asJs, Nil, List(RequestHelper.cookie("userId", user)), 200)
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
            val r = JsonResponse(jsArr, Nil, List(RequestHelper.cookie("userId", users.head)), 200)
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
  
  def insertCircle = {
    S.request match {
      case Full(req) => {
        req.json match {
          case Full(jvalue:JObject) => {
            println("RestService.insertCircle: jvalue = "+jvalue)
            val circle = Circle.create
            jvalue.values foreach {kv => (kv._1, kv._2) match {
              case ("name", s:String) => circle.name(s)
              case ("expirationdate", s:String) => {
                if(s!=null && !s.toString().trim().equals("") && !s.toString().trim().equals("0")) {
                  println("RestService.insertCircle:  s = '"+s+"'");  circle.date(new SimpleDateFormat("MM/dd/yyyy").parse(s.toString())) // not sure about this one yet
                }
              } // case ("expirationdate", s:String)
              case ("expirationdate", b:BigInt) => circle.date(new Date(b.toLong))
              case ("circleType", s:String) => circle.circleType(s)
              
//              case ("participants", l:List[Map[String, Any]]) => {
//                val ids = for(m <- l;
//                              kv <- m;
//                              if(kv._1.equals("id"))) yield { println("kv._1 = "+kv._1); kv._2 }
//                ids foreach {
//                  case (id:BigInt) => {println("circle.add("+id+")"); circle.add(id.toLong)}
//                  case _ => println("not handling *****************************************************")
//                }
//              }
              
              case ("participants", m:Map[String, List[Map[String, Any]]]) => {
                // look for key 'receivers' and 'givers'
                val receiverIds = for(kv <- m; 
                                      if(kv._1.equals("receivers"));
                                      mapOfReceiverInfo <- kv._2;
                                      receiverInfo <- mapOfReceiverInfo;
                                      if(receiverInfo._1.equals("id")) ) yield receiverInfo._2
                                      
                receiverIds foreach { case id:BigInt => circle.add(id.toLong) }
                
                val giverIds = for(kv <- m; 
                                 if(kv._1.equals("givers"));
                                 mapOfGiverInfo <- kv._2;
                                 giverInfo <- mapOfGiverInfo;
                                 if(giverInfo._1.equals("id")) ) yield giverInfo._2
                                 
                giverIds foreach { case id:BigInt => circle.addgiver(id.toLong) }
              }
              
              case ("creatorId", i:BigInt) => circle.creator(i.toInt)
              
              case _ => println("unhandled:  circle."+kv._1)
              
            } // kv => (kv._1, kv._2) match
            
            } // jvalue.values foreach {kv => (kv._1, kv._2) match
            
            circle.save()
            JsonResponse(circle.asJs)
            
          } // case Full(jvalue:JObject)
          
          case _ => BadResponse()
          
        } // req.json match
        
      } // case Full(req)
          
      case _ => BadResponse()
      
    } // S.request match
    
  } // insertCircle
  
  def findCircle(id:Long) = {
    println("RestService.findCircle:  id="+id)
    Circle.findByKey(id) match {
      case Full(circle) => val r = JsonResponse(circle.asJs); println(r.toString()); r
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
      // TODO hack?  Empty sender then repopulate if it's in the json object
      gift.sender(Empty).sender_name(Empty)
      req.json match {
        case Full(jvalue:JObject) => {
          jvalue.values foreach {kv => (kv._1, kv._2) match {
              case ("giftId", id:BigInt) => { }
              case ("description", s:String) => gift.description(s)
              case ("url", s:String) => gift.url(s)
              case ("recipients", l:List[Map[String, Any]]) => {
                l.filter(e => e.get("checked").getOrElse(false).equals(true) )
                   .foreach(e => {
                     val boxId = asLong(e.get("id"))
                     println("RestService.updateGift: recipient id = " + boxId.getOrElse(-1L))
                     gift.addRecipient(boxId.getOrElse(-1L)) 
                   })
              }
                
	          case ("viewerId", a:BigInt) => {
	            gift.currentViewer = User.findByKey(a.toLong)
	          } // case ("viewerId", a:BigInt)
	            
	          case ("recipientId", a:BigInt) => {
	            gift.currentRecipient = User.findByKey(a.toLong)
	          } // case ("recipientId", a:BigInt)
              
              case ("circleId", a:BigInt) if(a!=null && a.longValue() != 0 && a.longValue() != -1L) => {
                gift.circle(a.longValue())
	            gift.currentCircle = Circle.findByKey(a.toLong)
              }
              
              case ("senderId", a:BigInt) => {
                User.findByKey(a.toLong).foreach(s => gift.sender(s))
              } 
              
              case ("senderName", s:String) => gift.sender_name(s)
              
              case _ => println("updateGift:  Not handled: Gift."+kv._1+" = "+kv._2)
            } // kv => (kv._1, kv._2) match
          } // jvalue.values foreach
          
          gift.save
          gift.edbr
          JsonResponse(gift.asJs)
          
        } // case Full(jvalue:JObject)
        case _ => BadResponse()
      } // req.json
    } // case (Full(user), Full(req))
    case _ => BadResponse()
  }
  
  
  def deleteGift(id:Long) = {
    Gift.delete(id)
    NoContentResponse()
  }
  
  
  def insertGift = {
    S.request match {
      case Full(req) => {
        req.json match {
          case Full(jvalue:JObject) => {
            println("RestService.insertGift: jvalue = "+jvalue)
            val gift = Gift.create
            jvalue.values foreach {kv => (kv._1, kv._2) match {
                case ("addedBy", a:BigInt) => gift.addedBy(a.longValue())
                case ("circleId", a:BigInt) if(a!=null && a.longValue() != 0 && a.longValue() != -1L) => {
                  gift.circle(a.longValue())
	              gift.currentCircle = Circle.findByKey(a.toLong)
                }
                case ("description", s:String) => gift.description(s)
                case ("url", s:String) => gift.url(s)
                case ("recipients", l:List[Map[String, Any]]) => {
                  //println("insertGift:  so far so good  kv._2="+kv._2)
                  l.filter(e => e.get("checked").getOrElse(false).equals(true) )
                     .foreach(e => {
                       val boxId = asLong(e.get("id"))
                       println("RestService.insertGift: recipient id = " + boxId.getOrElse(-1L))
                       gift.addRecipient(boxId.getOrElse(-1L)) 
                     })
                }
                
	            case ("viewerId", a:BigInt) => {
	              gift.currentViewer = User.findByKey(a.toLong)
	            } // case ("viewerId", a:BigInt)
	            
	            case ("recipientId", a:BigInt) => {
	              gift.currentRecipient = User.findByKey(a.toLong)
	            } // case ("recipientId", a:BigInt)
              
                case _ => println("insertGift:  Not handled: Gift."+kv._1+" = "+kv._2)
              } // (kv._1, kv._2) match
            } // jvalue.values foreach
            gift.save
            gift.edbr
            JsonResponse(gift.asJs)
          } // case Full(jvalue:JObject)
          case _ => println("RestService.insertGift: case _ :  req.json = "+Empty); BadResponse()
        } // req.json match
      } // case Full(req)
      case _ => BadResponse()
    } // S.request match
  }
  
  
}