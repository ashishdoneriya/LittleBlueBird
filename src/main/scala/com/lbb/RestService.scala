package com.lbb
import java.text.SimpleDateFormat
import java.util.Date
import com.lbb.entity.Circle
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Gift
import com.lbb.entity.Recipient
import com.lbb.entity.Reminder
import com.lbb.entity.User
import com.lbb.util.Email
import com.lbb.util.Emailer
import com.lbb.util.LbbLogger
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
import net.liftweb.mapper.By
import net.liftweb.util.BasicTypesHelpers._
import org.joda.time.DateTime
import com.lbb.entity.AuditLog

object RestService extends RestHelper with LbbLogger {

  // ref:  http://www.assembla.com/spaces/liftweb/wiki/REST_Web_Services
  serve {
    
    // gifts...
    case Get("gifts" :: AsLong(giftId) :: _, _) => debug("RestService.serve:  999999999"); findGift(giftId)
    case Get("gifts" :: _, _) => debug("RestService.serve:  AAAAAAAAA"); findGifts
    
    case JsonPost("circles" :: AsLong(circleId) :: _, (json, req)) => debug("updateCircle: "+circleId); updateCircle(circleId)
    case JsonPost("circleparticipants" :: AsLong(circleId) :: _, (json, req)) => insertParticipant(circleId)
    case Delete("circleparticipants" :: AsLong(circleId) :: _, req) => deleteParticipant(circleId)
    case Delete("gifts" :: AsLong(giftId) :: deleter :: _, _) => deleteGift(giftId, deleter)
    
    case Get("reminders" :: AsLong(circleId) :: _, _) => getReminders(circleId)
    case Delete("reminders" :: AsLong(circleId) :: _, _) => deleteReminders(circleId)
    case JsonPost("reminders" :: AsLong(circleId) :: _, (json,req)) => insertReminders(circleId)
  }
  
  serve {
    // Get someone's wish list outside the context of any circle
    // Can't use the url pattern:  gifts/userId because we already have gifts/giftId - would be ambiguous
    // So we have wishlist/userId - kinda lame
    case Get("wishlist" :: AsLong(userId) :: _, _) => wishlist(userId)
    case Get("users" :: AsLong(userId) :: _, _) => debug("RestService.serve:  22222222222222"); findUser(userId)
    case Get("users" :: _, _) => debug("RestService.serve:  333333333333333333333333"); findUsers
    case Post("logout" :: _, _) => logout
    case JsonPost("email" :: _, (json, req)) => email 
    case JsonPost("gifts" :: AsLong(giftId) :: updaterName :: _, (json, req)) => debug("RestService.serve:  BBBBBBBB"); updateGift(updaterName, giftId)
    case JsonPost("gifts" :: _ :: Nil, (json, req)) => debug("RestService.serve:  CCCCCCC"); debug(json); insertGift
    case JsonPost("users" :: AsLong(userId) :: _, (json, req)) => debug("RestService.serve:  4.5 4.5 4.5 4.5 "); debug(json); updateUser(userId)
    case JsonPost("users" :: Nil, (json, req)) => debug("RestService.serve:  4444444444444444"); debug(json); insertUser
    case Get("usersearch" :: _, _) => debug("RestService.serve:  Get: usersearch"); SearchHelper.usersearch
    case JsonPost("circles" :: Nil, (json, req)) => insertCircle
    
    case Post("users" :: _, _) => debug("RestService.serve:  Post(api :: users  :: _, _)  S.uri="+S.uri); JsonResponse("Post(api :: users  :: _, _)  S.uri="+S.uri)
    
    case Post(_, _) => debug("RestService.serve:  case Post(_, _)"); JsonResponse("Post(_, _)  S.uri="+S.uri)
    
    // circles...
    case Get("circles" :: AsLong(circleId) :: _, _) => debug("RestService.serve:  88888888"); findCircle(circleId)
    case Get("circleparticipants" :: AsLong(circleId) :: _, _) => debug("RestService.serve:  77777777777"); findCircleParticipants(circleId)
    case _ => debug("RestService.serve:  666666666"); debugRequest
  }
  
  // not just the current user's id - but anybody's id
  def wishlist(userId:Long) = {
    val jsongifts = User.findByKey(userId).map(_.mywishlist.map(_.asJs)) openOr Nil
    JsonResponse(JsArray(jsongifts))
  }
  
  def logout = {
    for(idstr <- S.cookieValue("userId"); 
        user <- User.findByKey(idstr.toLong)){
      AuditLog.recordLogout(user, S.request)
    }
    S.deleteCookie("userId")
    NoContentResponse()
  }
  
  def deleteReminders(circleId:Long) = {
    val bc = Circle.findByKey(circleId).map(cc => By(Reminder.circle, cc) :: Nil)
    
    val bu = S.param("userId").map(uu => {By(Reminder.viewer, uu.toLong) :: bc.openOr(Nil)})
    
    val bd = S.param("remind_date").filter(ss => !ss.equals("undefined")).map(dd => {By(Reminder.remind_date, new Date(dd.toLong)) :: bu.openOr(Nil) })
    
    val boxr = for(list <- bd; if(list.size > 0)) yield {Reminder.findAll(list:_*)}
    val reminders = boxr.openOr(Nil)
    reminders.foreach(_.delete_!)
    
    NoContentResponse()
  }
  
  def getReminders(circleId:Long) = {
    val box = Circle.findByKey(circleId).map(c => {
      val js = c.reminders.map(r => r.asJs)
      JsonResponse(JsArray(js))
    })
    box.openOr(NoContentResponse())
  }
  
  def email = {
    S.param("type") match {
      case Full(s) if(s.equals("passwordrecovery")) => sendPasswordRecoveryEmail
      case Full(s) if(s.equals("welcome")) => sendWelcomeEmail
      case _ => { debug("email:  BadResponse()"); BadResponse() }
    }
  }
  
  private def sendWelcomeEmail = {
        val jval = for(req <- S.request; jvalue <- req.json; if(jvalue.isInstanceOf[JObject])) yield {
          val vvv = jvalue.asInstanceOf[JObject]
          val uservalues = vvv.values.get("user") match {
            case Some(m:Map[String, Any]) => m
            case _ => Map[String, Any]()
          }
          uservalues
        }
    
        for(uservalues <- jval) {
          val user = User.create
          uservalues foreach {kv => kv match {
              case ("first", s:String) => user.first(s)
              case ("last", s:String) => user.last(s)
              case ("email", s:String) => user.email(s)
              case ("username", s:String) => user.username(s)
              case ("password", s:String) => user.password(s)
              case _ => debug("kv.1="+kv._1+"  kv.2="+kv._2)
            } // kv match 
          } // uservalues foreach {
      
          Emailer.notifyWelcome(user)
      
        }
        NoContentResponse()
  }
  
  private def sendPasswordRecoveryEmail = {
    try {
      val message = Emailer.createRecoverPasswordMessage
    
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
  
  def debugRequest = {
    S.request match {
      case Full(req) => 
        debug("RestService.debug: req.request.method = "+req.request.method) 
      case Empty => debug("RestService.debug: NO REQUEST OBJECT - THAT SHOULDN'T HAPPEN")
      case _ => debug("RestService.debug: case _ - THAT SHOULDN'T HAPPEN")
    }
    JsonResponse("")
  }
  
  def debugRequest(json:JValue) = {
    debug("RestService.debug:  json = "+json.toString())
    JsonResponse("???  S.uri=" + S.uri)
  }
  
  def insertParticipant(circleId:Long) = {
    val cp = CircleParticipant.create.circle(circleId);
    val jval = for(req <- S.request; jvalue <- req.json; if(jvalue.isInstanceOf[JObject])) yield {
      jvalue.asInstanceOf[JObject]
    }
    
    for(jobj <- jval) yield {
      jobj.values foreach {kv => kv match {
          case ("userId", u:BigInt) => cp.person(u.toLong)
          case ("participationLevel", s:String) => cp.participationLevel(s)
          case ("inviterId", i:BigInt) => cp.inviter(i.toLong)
          case _ => { /*do nothing*/ }
        }
      }
    }
    
    val saved = cp.save
    
    for(who <- S.param("who"); 
        email <- S.param("email"); 
        circle <- S.param("circle"); 
        adder <- S.param("adder"); if(saved)) Emailer.notifyAddedToCircle(who, email, circle, adder)
    
    JsonResponse("")
  }
  
  def deleteParticipant(circleId:Long) = {
    for(s <- S.param("userId")) yield {
      val userId = s.toLong;
      val cps = CircleParticipant.findAll(By(CircleParticipant.circle, circleId), By(CircleParticipant.person, userId))
      cps.foreach(_.delete_!)
    }
    JsonResponse("")
  }
  
  def insertUser = {
    val user = User.create
    val jval = for(req <- S.request; jvalue <- req.json; if(jvalue.isInstanceOf[JObject])) yield {
      jvalue.asInstanceOf[JObject]
    }
    
    for(jobj <- jval) yield {
      jobj.values foreach {
        kv => kv match {
          case ("fullname", s:String) => user.name(s)
          case ("first", s:String) => user.first(s)
          case ("last", s:String) => user.last(s)
          case ("email", s:String) => user.email(s)
          case ("username", s:String) => user.username(s)
          case ("password", s:String) => user.password(s)
          case ("bio", s:String) => user.bio(s)
          case ("profilepic", s:String) => user.profilepic(s)
          case ("dateOfBirth", s:String) => user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s)) // not sure about this one yet
          case _ => debug("RestService.insertUser:  unhandled: "+kv._1+" = "+kv._2)
        }
      }
    }
    user.save()
    val cookies = S.param("login").filter(p => p.equals("true")).map(s => RequestHelper.cookie("userId", user))
    
    debug("creatorName = "+S.param("creatorName"))
    for(creator <- S.param("creatorName")) yield {
      Emailer.notifyAccountCreatedForYou(user, creator)
    }
    
    JsonResponse(user.asJs, Nil, cookies.toList, 200)
    
//    S.request match {
//      case Full(req) => {
//        req.json match {
//          case Full(jvalue:JObject) => {
//            debug("RestService.insertUser: jvalue = "+jvalue)
//            val user = User.create
//            jvalue.values foreach {kv => kv match {
//                case ("fullname", s:String) => user.name(s)
//                case ("first", s:String) => user.first(s)
//                case ("last", s:String) => user.last(s)
//                case ("email", s:String) => user.email(s)
//                case ("username", s:String) => user.username(s)
//                case ("password", s:String) => user.password(s)
//                case ("bio", s:String) => user.bio(s)
//                case ("profilepic", s:String) => user.profilepic(s)
//                case ("dateOfBirth", s:String) => user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s)) // not sure about this one yet
//                case _ => debug("RestService.insertUser:  unhandled: "+kv._1+" = "+kv._2)
//              }
//            }
//            user.save()
//            val cookies = S.param("login").filter(p => p.equals("true")).map(s => RequestHelper.cookie("userId", user))
//            JsonResponse(user.asJs, Nil, cookies.toList, 200)
//          }
//          case _ => debug("RestService.insertUser: case _ :  req.json = "+Empty); BadResponse()
//        }
//      }
//      case _ => BadResponse()
//    }
  }
  
  def insertCircle = {
    S.request match {
      case Full(req) => {
        req.json match {
          case Full(jvalue:JObject) => {
            debug("RestService.insertCircle: jvalue = "+jvalue)
            val circle = Circle.create
            jvalue.values foreach {kv => (kv._1, kv._2) match {
              case ("name", s:String) => circle.name(s)
              case ("expirationdate", s:String) => {
                if(s!=null && !s.toString().trim().equals("") && !s.toString().trim().equals("0")) {
                  debug("RestService.insertCircle:  s = '"+s+"'");  circle.date(new SimpleDateFormat("MM/dd/yyyy").parse(s.toString())) // not sure about this one yet
                }
              } // case ("expirationdate", s:String)
              case ("expirationdate", b:BigInt) => circle.date(new Date(b.toLong))
              case ("circleType", s:String) => circle.circleType(s)
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
              
              case _ => debug("unhandled:  circle."+kv._1)
              
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
  
  def updateCircle(id:Long) = (Circle.findByKey(id), S.request) match {
    case (Full(circle), Full(req)) => {
      req.json match {
        case Full(jvalue:JObject) => {
          jvalue.values foreach {kv => (kv._1, kv._2) match {
              case ("circleId", id:BigInt) => { }
              case ("datedeleted", b:BigInt) => circle.date_deleted(new Date(b.toLong)) // side effect: reminders get deleted by virtue of this call.  See DateChangeListener.dateDeletedSet
              case ("name", s:String) => circle.name(s)
              case ("expirationdate", b:BigInt) => circle.date(new Date(b.toLong))
              case ("circleType", s:String) => circle.circleType(s)
              case ("participants", _) => {/*TODO not sure how to handle participants on an update yet - maybe ignore*/}
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
                    debug("updateUser:  s = '"+s+"'");  user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s.toString())) // not sure about this on yet
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
    debug("RestService.findUser:  id="+id)
    User.findByKey(id) match {
      case Full(user) => debug("RestService.findUser:  user.asJs => "+user.asJs);JsonResponse(user.asJs, Nil, List(RequestHelper.cookie("userId", user)), 200)
      case _ => JsonResponse("")
    }
  }
  
  def findUsers = {
    debug("findUsers ------------- S.uri = "+S.uri)
    
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
            debug("findUsers: JsonResponse(jsArr)=" + r.toString())
            // record the login in the audit log
            AuditLog.recordLogin(users.head, S.request)
            r
          }
          case _ => {
            debug("findUsers: BadResponse (pass:"+p+")"); 
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
        debug("RestService.findUsers: JsonResponse(jsArr)=" + r.toString())
        r
      }
    }
    
  }
  
  def findCircle(id:Long) = {
    debug("RestService.findCircle:  id="+id)
    Circle.findByKey(id) match {
      case Full(circle) => val r = JsonResponse(circle.asJs); debug(r.toString()); r
      case _ => JsonResponse("")
    }
  }
  
  def findCircleParticipants(circleId:Long) = Circle.findByKey(circleId) match {
    case Full(circle) => {
      
      val receivers = circle.receivers.map(_.asReceiverJs(Full(circle)))
      val rarr = JArray(receivers)
      
      val givers = circle.givers.map(_.asJsShallow)
      val garr = JArray(givers)
      
      val giverField = JField("givers", garr)
      val receiverField = JField("receivers", rarr)
      
      val participants = JObject(List(giverField, receiverField))  
      val jarr = JField("participants", participants)
      
      val r = JsonResponse(participants)
      debug("RestService.findCircleParticipants: JsonResponse(jsArr)=" + r.toString())
      r
    }
    case _ => JsonResponse("")
  }
  
  // TODO implement this
  def findGift(id:Long) = {
    BadResponse()
  }
  
  def findGifts = (User.findByKey(asLong(S.param("viewerId") openOr "") openOr -1), 
                   User.findByKey(asLong(S.param("recipientId") openOr "") openOr -1)) match {
      case (Full(viewer), Full(recipient)) => {
        val circlebox = Circle.findByKey(asLong(S.param("circleId") openOr "") openOr -1)
        val giftlist = recipient.giftlist(viewer, circlebox);
        val jsons = giftlist.map(_.asJs)
        val jsArr = JsArray(jsons)
        val r = JsonResponse(jsArr)
        debug("RestService.findGifts: case (Full(viewer), Full(recipient)) => " + r.toString())
        r
      }
      case (Full(viewer), Empty) => {
        val mywishlist = viewer.mywishlist
        val jsons = mywishlist.map(_.asJs)
        val jsArr = JsArray(jsons)
        val r = JsonResponse(jsArr)
        debug("RestService.findGifts: case (Full(viewer), Empty) => " + r.toString())
        r
      }
      case _ => {
        debug("RestService.findGifts: S.param(viewerId)=" + S.param("viewerId"))
        debug("RestService.findGifts: S.param(circleId)=" + S.param("circleId"))
        debug("RestService.findGifts: S.param(recipientId)=" + S.param("recipientId"))
        BadResponse()
      }
  }
  
  def updateGift(updater:String, id:Long) = (Gift.findByKey(id), S.request) match {
    case (Full(gift), Full(req)) => {
      // TODO hack?  Empty sender then repopulate if it's in the json object
      //gift.sender(Empty).sender_name(Empty) // this was how we were handling returns - by essentially assuming the gift was being returned and then re-populating the sender down
      // below if that info happens to be in the request - kinda dumb
      req.json match {
        case Full(jvalue:JObject) => {
          jvalue.values foreach {kv => (kv._1, kv._2) match { 
              case ("giftId", id:BigInt) => { }
              case ("description", s:String) => {gift.setDescription(s, updater)} //gift.description(s)
              case ("url", s:String) => gift.url(s)
              case ("recipients", l:List[Map[String, Any]]) => {
                l.filter(e => e.get("checked").getOrElse(false).equals(true) )
                   .foreach(e => {
                     val boxId = asLong(e.get("id"))
                     debug("RestService.updateGift: recipient id = " + boxId.getOrElse(-1L))
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
              
              // case: returning the gift
              case ("senderId", a:BigInt) if(a.toLong == -1 && gift.isBought) => {
                Emailer.notifyGiftReturned(gift)
                gift.sender(Empty)
                gift.circle(Empty)
                gift.receivedate(null)
              }
              
              case ("senderId", a:BigInt) => { 
                User.findByKey(a.toLong).foreach(s => gift.sender(s))
              } 
              
              case ("senderName", s:String) => gift.sender_name(s)
              
              case ("receivedate", b:BigInt) => gift.receivedate(new Date(b.toLong))
              
              case _ => debug("updateGift:  Not handled: Gift."+kv._1+" = "+kv._2)
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
  
  
  def deleteGift(id:Long, deleter:String) = {
    val giftBox = Gift.findByKey(id)
    for(gift <- giftBox) yield {
      for(sender <- gift.sender; if(!sender.email.isEmpty())) yield {
        val salut = sender.first.is + " " + sender.last.is
        Emailer.notifyGiftDeleted(sender.email.is, salut, deleter, gift.description.is)
      }
      Recipient.findAll(By(Recipient.gift, gift)).foreach(_.delete_!)
      gift.delete_!
    }
    NoContentResponse()
  }
  
  
  def insertReminders(circleId:Long) = {
    debug("S.param(\"people\") = "+S.param("people"));
    val jval = for(req <- S.request; jvalue <- req.json; if(jvalue.isInstanceOf[JObject])) yield {
      jvalue.asInstanceOf[JObject]
    }
    
    val box = for(jobj <- jval) yield {
      debug("jobj = "+jobj)
      for(map <- jobj.values) debug("map = "+map)
      val pids = for(map <- jobj.values; if(map._1.equals("people"))) yield {
        val people = map._2
        people match {
          case l:List[Map[String, Any]] => {
            val ll = l.map(_.get("id").getOrElse(-1L).toString().toLong).filter(xx => xx != -1)
            debug("ll = "+ll);
            ll
          } // case l:List[Map[String, Any]]
          case _ => debug("people: "+people.getClass.getName); List(-1L)
        } // people match
      } // for(map <- jobj.values; if(map._1.equals("people")))
      
      val ids = pids.flatten.filter(id => id != -1)
      
      val remdate = jobj.values.get("remind_date") match { 
        case Some(r:BigInt) => r.toLong 
        case _ => -1L 
      }
      
      /**
       * Neat trick for testing:  Comment out the .filter line.  That allows you to create reminders in the past 
       * which will fire immediately.
       */
      ids
        //.filter(id => new DateTime(remdate).isAfterNow())
        .map(id => Reminder.create.circle(circleId).viewer(id).remind_date(new Date(remdate)).save )
    }
    
    val box2 = Circle.findByKey(circleId).map(c => c.reminders.map(r => r.asJs))
    box2.map(l => JsonResponse(JsArray(l))) openOr BadResponse()
    
  }
  
  
  def insertGift = {
    S.request match {
      case Full(req) => {
        req.json match {
          case Full(jvalue:JObject) => {
            debug("RestService.insertGift: jvalue = "+jvalue)
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
                  //debug("insertGift:  so far so good  kv._2="+kv._2)
                  l.filter(e => e.get("checked").getOrElse(false).equals(true) )
                     .foreach(e => {
                       val boxId = asLong(e.get("id"))
                       debug("RestService.insertGift: recipient id = " + boxId.getOrElse(-1L))
                       gift.addRecipient(boxId.getOrElse(-1L)) 
                     })
                }
                
	            case ("viewerId", a:BigInt) => {
	              gift.currentViewer = User.findByKey(a.toLong)
	            } // case ("viewerId", a:BigInt)
	            
	            case ("recipientId", a:BigInt) => {
	              gift.currentRecipient = User.findByKey(a.toLong)
	            } // case ("recipientId", a:BigInt)
              
                case _ => debug("insertGift:  Not handled: Gift."+kv._1+" = "+kv._2)
              } // (kv._1, kv._2) match
            } // jvalue.values foreach
            gift.save
            gift.edbr
            JsonResponse(gift.asJs)
          } // case Full(jvalue:JObject)
          case _ => debug("RestService.insertGift: case _ :  req.json = "+Empty); BadResponse()
        } // req.json match
      } // case Full(req)
      case _ => BadResponse()
    } // S.request match
  }
  
  
}