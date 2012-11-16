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
import com.lbb.entity.Friend
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.OprEnum
import net.liftweb.mapper.ByList
import net.liftweb.mapper.QueryParam
import net.liftweb.mapper.Ignore
import net.liftweb.mapper.IHaveValidatedThisSQL
import com.lbb.util.Util

object RestService extends RestHelper with LbbLogger {
  
  serve {
    case JsonPost("apprequest" :: fbreqid :: AsLong(parentId) :: _, (json, req)) => saveAppRequest(fbreqid, parentId)
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
   * When you invite people via facebook, we immediately grab the peoples facebook id's and facebook request id's
   * Look at app-FriendCtrl.  It used to contain $scope.fbinvite(), which has since been moved to app.js and 
   * declared at the $rootScope level.  We call this method once, with once facebook request id and possibly
   * many facebook id's
   * 
   * See: AppRequest.save() method (app.js)
   * 
   * facebookIds comes through as a comma-sep String
   * 
   * At this point, you don't know the person's email address.  All you can do is query for facebook id.
   * If that query turns up no one, you'll have to write a record to the person table that you may later
   * delete.  Only when the invited person accepts the invitation do you know what the person's email
   * address is.
   */
  def saveAppRequest(fbreqid:String, parentId:Long) = {
    val ids = S.param("facebookIds") openOr ""
    val facebookIds = ids.split(",")
    
    // facebook id's are unique, so figure out which ones are already in the db
    val already = User.findAll(ByList(User.facebookId, facebookIds))
    val existingIds = already.map(_.facebookId.is)
    
    // these are the only id's we're concerned with here
    val insertIds = facebookIds.filter(fid => !existingIds.contains(fid)).toList
    
    debug("saveAppRequest():  facebookIds="+ids+"  ("+ids.getClass.getName+")");
    debug("saveAppRequest():  existingIds="+existingIds);
    debug("saveAppRequest():  insertIds="+insertIds);
    
    for(fbid <- insertIds) {
      User.create(parentId, fbid, fbreqid).save
    }
    
    // Ignore 'existingIds', only
    
    // how do you know if this person is in the db already - all you have is a facebook id ?
    // We could wait till the person responds to the app request...
    // When they accept the app request, they will provide their email address - we can query the db with that
    
    // Query for facebook id, found: update facebook request id with fbreqid
    // not found:  Insert a row, use facebook id for all required fields
    
    // facebook id is unique, so we will only get either Nil or a one-element list
//    User.findAll(By(User.facebookId, facebookId)) match {
//      case Nil => {
//        // db doesn't contain this facebook id.  This is actually dangerous because pretty much everyone has a facebook account
//        // Not finding a facebook id gives rise to the possibility that we will accidentally create a second account for 
//        // someone if they already have an LBB account.  For now, we will insert a record to person.  Then when the person
//        // accepts the app request, we will ask them if they already have an LBB account.  If they do, we will delete the record
//        // we are writing here and we will take the facebook id here and update their record with it (and also the fb request id)
//        val u = User.create // <- see override in User
//        u.first("").last("").username(facebookId).password(facebookId).profilepic("http://graph.facebook.com/"+facebookId+"/picture?type=large").facebookId(facebookId).fbreqid(fbreqid)
//        u.save
//      }
//      case u :: us => { u.fbreqid(fbreqid); u.save; }
//      case _ => ;
//    }
    
    NoContentResponse()
  }
  
  
  /**
   * app.js defines $rootScope.acceptAppRequest().  That function looks for 'request_ids' in the url.  If found, that function 
   * calls the angular service AppRequestAccepted.save() which maps to /gf/apprequestaccepted and ultimately this method.
   * <P>
   * This method finds the record in 'person' that was written by saveAppRequest() when the app request was issued.
   * saveAppRequest() writes a pretty incomplete record to 'person' because all we know at that time is a facebook id and
   * a facebook request id.
   * <P>
   * When the app request is accepted, we know much more: we know the person's email address and name.
   * <P>
   * Things can get tricky at this point.  The person accepting the app request may already be in LBB.  So we have to look
   * for an existing record with the email returned by fb.  
   * <P>
   * If the email address is found only once, then we'll "merge" the existing record with the one created by saveAppRequest():
   * We'll delete the record created in saveAppRequest() and we'll update the existing record's facebook id value.
   * <P>
   * If the email address isn't found, we will assume this person doesn't have an LBB account.  THIS COULD BE A FAULTY ASSUMPTION!
   * We will keep the record created in saveAppRequest() and update it with the person's name and email.
   * <P>
   * If the email is found more than once, we have to send the user to a "Who are you?" page where we display everyone that
   * has the email and let them say who they are.
   * <P>
   * Finally, the faulty assumption alluded to above:  Just because we don't find the email in the 'person' table doesn't mean
   * the person is not yet an LBB user.  They could be one of those people that didn't supply an email in the beginning.
   * They could have a different email on file with LBB.  In either case, the result is a "duplicate account".  This is really
   * bad for that person because their wish list is under the original account.  They may wonder what the heck happened to their
   * wish list - why is it empty?  There isn't much we can do about this.  Name matching is tricky and probably more trouble 
   * than it's worth.  We need some kind of prompt "Do you already have an LBB account?"
   */
  def saveAcceptedAppRequest(facebookId:String, name:String) = { 
    val email = S.param("email") openOr ""
    
    // This should always return at least one row.  And the row should have facebookId.  It MAY also have the email, but
    // it doesn't have to
    val existing = User.findAllByInsecureSql("select * from person where facebook_id = '"+facebookId+"' or email = '"+email+"'", IHaveValidatedThisSQL("me", "11/11/1111"))
    
    
    existing match {
      case l:List[User] if(l.size == 1 && l.head.email.is == email && l.head.facebookId.is == facebookId) => {
        // IDEAL CASE: The record already existed with all the info we need.  This could have happened by 
        // by a user creating their own account without an app request from someone else
        Util.toJsonResponse(l)
      }
      case l:List[User] if(l.size == 1 && l.head.facebookId.is == facebookId) => {
        // NOT IDEAL CASE: We didn't find a record with the email address we were looking for.
        // THIS IS POTENTIALLY BAD if the person really does have an LBB account, just under another email or blank email
        // Take this record and update with the name and email sent by fb
        l.head.name(name).email(email).save
        Util.toJsonResponse(l)
      }
      case l:List[User] if(l.size == 2) => {
        // IDEAL CASE: One record has facebook id.  The other has email.  Delete the record with the facebook id
        // because that is just a "stub" record created by saveAppRequest.  Take the facebook id and update the
        // record having the email.
        val stubrecord = l.filter(u => u.facebookId.is == facebookId).head
        stubrecord.delete_!
        val tosave = l.filter(u => u.email.is == email).head.facebookId(facebookId)
        tosave.save
        Util.toJsonResponse(List(tosave))
      }
      case l:List[User] if(l.size > 2) => {
        // NOT IDEAL CASE: Shared email in this case.  We know that only one record can have facebook id.
        // The fact that there are 3 or more records means the other records all have the same email
        // When the array of users gets back to the client, we will send the user to a "who are you?" page
        val stubrecord = l.filter(u => u.facebookId.is == facebookId).head
        stubrecord.delete_!
        val peoplewiththesameemail = l.filter(u => u.email.is == email)
        Util.toJsonResponse(peoplewiththesameemail)
      }
      case _ => {
        // ERROR CONDITION - The query above should always return at least one row, one having facebook id
        BadResponse()
      }
    }
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
          case ("fbreqid", s:String) => user.fbreqid(s)
          case ("dateOfBirth", s:String) => user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s)) // not sure about this one yet
          case _ => debug("RestService.insertUser:  unhandled: "+kv._1+" = "+kv._2)
        }
      }
    }
    user.save
    
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
                case ("fbreqid", a:Any) => user.fbreqid(a.toString())
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
      case ("fbreqid", Full(value)) => ByList(User.fbreqid, value.split(","))
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
        val jsons = users.map(_.asJs)
        val jsArr = JsArray(jsons)
        val r = JsonResponse(jsArr)
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