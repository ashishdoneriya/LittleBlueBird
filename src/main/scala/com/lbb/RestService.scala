package com.lbb
import java.text.SimpleDateFormat
import java.util.Date
import com.lbb.entity.AuditLog
import com.lbb.entity.Circle
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Friend
import com.lbb.entity.Gift
import com.lbb.entity.Recipient
import com.lbb.entity.Reminder
import com.lbb.entity.User
import com.lbb.util.Email
import com.lbb.util.Emailer
import com.lbb.util.LbbLogger
import com.lbb.util.SearchHelper
import com.lbb.util.Util
import net.liftweb.common.Box.box2Option
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JsExp.strToJsExp
import net.liftweb.http.rest.RestHelper
import net.liftweb.http.BadResponse
import net.liftweb.http.JsonResponse
import net.liftweb.http.NoContentResponse
import net.liftweb.http.S
import net.liftweb.json.JsonAST.JArray
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JObject
import net.liftweb.json.JsonAST.JValue
import net.liftweb.mapper.MappedField.mapToType
import net.liftweb.mapper.MappedForeignKey.getObj
import net.liftweb.mapper.By
import net.liftweb.mapper.ByList
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.IHaveValidatedThisSQL
import net.liftweb.mapper.Ignore
import net.liftweb.mapper.OprEnum
import net.liftweb.util.BasicTypesHelpers.AsLong
import net.liftweb.util.BasicTypesHelpers.asLong
import com.lbb.entity.AppRequest
import org.joda.time.DateTime

object RestService extends RestHelper with LbbLogger {
  
  serve {
    case JsonPost("apprequest" :: _, (json, req)) => saveAppRequests
    case JsonPost("apprequestaccepted" :: facebookId :: name :: _, (json, req)) => saveAcceptedAppRequest(facebookId, name)
  }

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
  
  /**
   * Write to app_request table for every app request here
   * Write to person table for every person that isn't represented there (with a facebook id)
   * Write to friends table for all associations that don't already exist
   * app-FacebookModule.js contains $rootScope.fbinvite() which calls this method via
   * AppRequest.save({requests:apprequests})
   * Return 'friends' to display on the user's Friends page
   */
  def saveAppRequests = {
    
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
                    case ("parentId", b:BigInt) => { ar.inviter(b.toInt); debug("saveAppRequests:  parentId="+b+" (BigInt)") }
                    case ("facebookId", s:String) => ar.facebookId(s) 
                    case ("name", s:String) => ar.name(s);
                    case ("fbreqid", s:String) => ar.fbreqid(s);
                    case _ => { error("saveAppRequests:  unhandled kv pair: "+kv._1+" ("+kv._1.getClass.getName+") and "+kv._2+" ("+kv._2.getClass.getName+")"); }
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
      } // jvalue match {
      appreqlist      
    } // for(req <- S.request; jvalue <- req.json) yield {
    
    // write to app_request
    val apprequests = vvvv.openOr(Nil)
    apprequests.foreach(_.save)
    
    // write to person
    val facebookIds = apprequests.map(_.facebookId.is)
    val xxx = facebookIds.map(facebookId => {
      val gg = apprequests.filter(ar => ar.facebookId.equals(facebookId))
      val names = gg.map(_.name.is)
      names match {
        case name :: ns => Full(User.create(name, facebookId))
        case _ => Empty
      }
    })
    val insertTheseUsers = for(xx <- xxx; user <- xx) yield user
    insertTheseUsers.foreach(_.save)
    
    // unique constraint violations definitely possible above, so 'insertTheseUser' may contain User objects with null id's, that's why we're querying here
    val newusers = User.findAll(ByList(User.facebookId, facebookIds))
    
    // write to friends
    // Don't worry if any relationships exist already; Friend.save is overridden and will handle unique constraint violations
    val inviterId = apprequests.head.inviter.is 
    val listoflists = for(newuser <- newusers) yield {
      Friend.createFriends(newuser.id.is, inviterId)
    }
    val potentialnewfriends = listoflists.flatten
    potentialnewfriends.foreach(_.save)
    
    // return friends of the current user
    val friendbox = for(user <- User.findByKey(inviterId)) yield user.friendList
    val friends = friendbox openOr Nil
    Util.toJsonResponse(friends)
    
  }
  
  
  /**
   * When an app request is issued, a person record is written.
   * In this method, the app request is accepted.  We locate the person record we wrote in saveAppRequests
   * We also update the app_request table for the row with this facebook id and whatever fbreqid's come
   * to this method.  We update app_request.accept_date
   * 
   * Return a list of users.  List may contain only one user or multiple.  Multiple users will be
   * returned if the email address is shared.  The user will be sent to a who-are-you page where they
   * can see everyone that is registered under this email address.  They then get to click who they 
   * are, which completes the merge.
   */
  def saveAcceptedAppRequest(facebookId:String, name:String) = { 
    val fbreqids = S.param("fbreqids") openOr ""
    val facebookRequestIds = fbreqids.split(",")
    val email = S.param("email") openOr ""
    
    val apprequests = AppRequest.findAll(By(AppRequest.facebookId, facebookId), ByList(AppRequest.fbreqid, facebookRequestIds))
    apprequests.foreach(ar => {
      ar.acceptdate(new Date())
      ar.save
    })
    
    val inviterIds = apprequests.map(_.inviter.is) // person may be responding to more than one app request from more than one person
    
    // Now we have an email address - didn't have that at the time the app request was issued.
    // Do we have 2 person records that will have to be merged?  This is where we will find out.
    
    val peoplewithemail = User.findAll(By(User.email, email))
    val personRecordsWithEmailAndFacebookId = peoplewithemail.filter(p => p.facebookId.is==facebookId) // can only be 1 or 0
    val personRecordExistsWithEmailAndFacebookId = personRecordsWithEmailAndFacebookId.size==1
    val personwithfacebookid = User.findAll(By(User.facebookId, facebookId)).head // should always return 1 row
    // because we wrote this record in saveAppRequests or else the user logged in without an invitation
    
    
    val returnList = (peoplewithemail.size, personRecordExistsWithEmailAndFacebookId) match {
      
      case (_, true) => {
        debug("saveAcceptedAppRequest:  case (_, true) => LIKE THIS CASE: There is already a person record with facebook id and email - no merge necessary");
        // LIKE THIS CASE: There is already a person record with facebook id and email - no merge necessary
        personRecordsWithEmailAndFacebookId
        
      } // case (i1:Int, true)
      
      case (howmanyemails:Int, false) if(howmanyemails==0) => {
        debug("saveAcceptedAppRequest:  case (howmanyemails:Int, false) if(howmanyemails==0) =>  no one has the email we were looking for - so 'personwithfacebookid' is the person record we're going with");
        // no one has the email we were looking for - so 'personwithfacebookid' is the person record we're going with
        personwithfacebookid.email(email).save
        
        // TODO Improvement: Maybe query by name to see if this person already exists in LBB.  That's really problematic though:
        // Facebook returns first and last name as one string and lots of people have 3 names, initials and other funny characters (M William 'Bill' Dunklau)
   
        List(personwithfacebookid)
        
      } // case (i1:Int, _) if(i1==0)
      
      
      case (howmanyemails:Int, false) if(howmanyemails==1) => {
        debug("saveAcceptedAppRequest:  case (howmanyemails:Int, false) if(howmanyemails==1) => MERGE:  We have a person record with the right email.  And we have another with the right facebook id");
        // MERGE:  We have a person record with the right email.  And we have another with the right facebook id
        // We have to merge one in with the other and delete one.  We keep the record with the email and delete 
        // the record with the facebook id
        val mergeduser = User.merge(peoplewithemail.head, personwithfacebookid)
        List(mergeduser)
      } // case (howmanyemails:Int, false) if(howmanyemails==1)
      
      
      case _ => {
        debug("saveAcceptedAppRequest:  case _ =>  WHO ARE YOU case");
        // WHO ARE YOU case.  We know the 2nd arg is false because we took care of true up front.  And we know peoplewithemail.size > 1 because we already
        // took care of the 0 and 1 cases
        peoplewithemail
      }
      
    } // (peoplewithemail, personwithfacebookid) match
    
    
    Util.toJsonResponse(returnList)
    
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
        notifyonaddtoevent <- S.param("notifyonaddtoevent");
        adder <- S.param("adder"); if(notifyonaddtoevent.equals("true") && saved)) Emailer.notifyAddedToCircle(who, email, circle, adder)
    
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
          case ("facebookId", s:String) => user.facebookId(s)
          case ("creatorId", b:BigInt) => user.parent(b.toInt)
          case ("dateOfBirth", s:String) => user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s)) // not sure about this one yet
          case _ => debug("RestService.insertUser:  unhandled: "+kv._1+" = "+kv._2)
        }
      }
    }
    
    user.save
    
    for(parent <- user.parent) {user.addfriend(parent)}
    
    debug("creatorName = "+S.param("creatorName"))
    for(creator <- S.param("creatorName")) yield {
      Emailer.notifyAccountCreatedForYou(user, creator)
    }
    
    S.param("login") match {
      case Full("true") => user.login
      case _ => JsonResponse(user.asJs)
    }
    
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
                case ("login", b:Boolean) => {  }
                case ("fullname", s:String) => user.name(s)
                case ("first", s:String) => user.first(s)
                case ("last", s:String) => user.last(s)
                case ("email", s:String) => user.email(s)
                case ("username", s:String) => user.username(s)
                case ("password", s:String) => user.password(s)
                case ("bio", s:String) => user.bio(s)
                case ("profilepic", s:String) => user.profilepic(s)
                case ("facebookId", a:Any) => user.facebookId(a.toString())
                case ("friends", list:List[Map[String, Any]]) => user.addfriends(list)
                case ("notifyonaddtoevent", b:Boolean) => user.notifyonaddtoevent(b.toString())
                case ("notifyondeletegift", b:Boolean) => user.notifyondeletegift(b.toString())
                case ("notifyoneditgift", b:Boolean) => user.notifyoneditgift(b.toString())
                case ("notifyonreturngift", b:Boolean) => user.notifyonreturngift(b.toString())             
                case ("dateOfBirth", s:String) => {
                  if(s!=null && !s.toString().trim().equals("") && !s.toString().trim().equals("0")) {
                    debug("updateUser:  s = '"+s+"'");  user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s.toString())) // not sure about this on yet
                  }
                }
                case _ => warn("UNHANDLED key/value pair:  "+kv._1+" = "+kv._2)
              } // (kv._1, kv._2) match {
            } // jvalue.values foreach {
            
            val login = S.param("login").getOrElse("false").equals("true")
            
            user.save
            
            S.param("login") match {
              case Full("true") => user.login
              case _ => JsonResponse(user.asJs)
            }
            
        } // case Full(jvalue:JObject)
        
        case _ => BadResponse()
        
      } // req.json match
      
    } // case (Full(user), Full(req))
    
    case _ => BadResponse()
  }
  
  def findUser(id:Long) = {
    debug("RestService.findUser:  id="+id)
    (User.findByKey(id), S.param("login")) match {
      case (Full(user), Full("true")) => debug("RestService.findUser: calling user.login"); user.login
      case (Full(user), _) => JsonResponse(user.asJs)
      case _ => debug("RestService.findUser: BadResponse()"); BadResponse()
    }
  }
  
  /**
   * Don't allow returning all users
   */
  def findUsers = {
    debug("findUsers ------------- S.uri = "+S.uri)
    
    val lll = S.request.map(_.paramNames) getOrElse Nil
    val onlydefinedparms = lll.filter(name => {val value = S.param(name) getOrElse "undefined"; value != "undefined" })
    
    val userpass = onlydefinedparms.contains("username") && onlydefinedparms.contains("password")
    
    val qparms = onlydefinedparms.map(name => (name, S.param(name)) match {
      case ("first", Full(value)) => Cmp(User.first, OprEnum.Like, Full(value), Empty, Full("LOWER"))
      case ("last", Full(value)) => Cmp(User.last, OprEnum.Like, Full(value), Empty, Full("LOWER"))
      case ("username", Full(value)) => Cmp(User.username, OprEnum.Like, Full(value), Empty, Full("LOWER"))
      case ("password", Full(value)) => By(User.password, value)
      case ("email", Full(value)) => Cmp(User.email, OprEnum.Like, Full(value), Empty, Full("LOWER"))
      case ("facebookId", Full(value)) => Cmp(User.facebookId, OprEnum.Like, Full(value), Empty, Full("LOWER"))
      case _ => Ignore[User]()
    })
    
    val qp = qparms.filter(q => !q.equals(Ignore[User]()))
    
    (qp, userpass) match {
      case (Nil, _) => NoContentResponse() // if there's no query parameters, we're not going to return all users
      case (_, true) => {
        // here, we're logging in using LBB credentials...
        val users = User.findAll(qp: _*)
        users match {
          case l:List[User] if(l.size == 1) => JsonResponse(l.head.asJs)
          case _ => debug("findUsers:  users.size="+users.size); BadResponse() // too many or not enough people found
        }
      }
      case _ => { // typical findUsers function
        val users = User.findAll(qp: _*)
        val r = Util.toJsonResponse(users)
        debug("RestService.findUsers: JsonResponse(jsArr)=" + r.toString())
        debug("RestService.findUsers: users.size=" + users.size)
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
  
  /**
   * It's possible that there won't be a 'viewer' (current user)
   * You may click a link in FB like  www.littlebluebird.com/gf/app/giftlist/552/17, which is the wishlist
   * for user 552 and event 17, but no 'viewer' information.  Should the person who clicks the link be
   * able to view the list anonymously?  I guess we could force them to login to facebook if they're not
   * already - or make them create an LBB account.  Anonymous viewing is dangerous because I may be
   * allowed to view my wishlist and see it in a diffferent context than I would if I were logged in.
   * 
   * Also, how would the user do anything with the list like buy items or add items unless we first 
   * had a userId?
   */
  def findGifts = { 
    val viewerParm = asLong(S.param("viewerId") openOr "undefined") openOr -1L
    val viewerCookie = asLong(S.cookieValue("userId") openOr "undefined") openOr -1L
    val userKey = if(viewerParm == -1L) viewerCookie else viewerParm
    
    (User.findByKey(userKey), User.findByKey(asLong(S.param("recipientId") openOr "") openOr -1)) match {
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
        debug("RestService.findGifts: S.cookieValue(\"userId\")=" + S.cookieValue("userId"))
        debug("RestService.findGifts: S.param(viewerId)=" + S.param("viewerId"))
        debug("RestService.findGifts: S.param(circleId)=" + S.param("circleId"))
        debug("RestService.findGifts: S.param(recipientId)=" + S.param("recipientId"))
        BadResponse()
      }
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
      for(sender <- gift.sender; if(sender.notifyondeletegift.is.equals("true") && !sender.email.isEmpty())) yield {
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