package com.lbb

import java.text.SimpleDateFormat
import java.util.Date

import com.lbb.entity.AppRequest
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

import net.liftweb.common.Box
import net.liftweb.common.Box.box2Option
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.BadResponse
import net.liftweb.http.JsonResponse
import net.liftweb.http.NoContentResponse
import net.liftweb.http.NoContentResponse
import net.liftweb.http.S
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.js.JE.Str
import net.liftweb.http.js.JsExp
import net.liftweb.http.js.JsExp.strToJsExp
import net.liftweb.http.rest.RestHelper
import net.liftweb.json.JsonAST
import net.liftweb.json.JsonAST.JArray
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JObject
import net.liftweb.json.JsonAST.JString
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonParser
import net.liftweb.mapper.By
import net.liftweb.mapper.ByList
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.Ignore
import net.liftweb.mapper.MappedField.mapToType
import net.liftweb.mapper.MappedForeignKey.getObj
import net.liftweb.mapper.OprEnum
import net.liftweb.util.BasicTypesHelpers.AsLong
import net.liftweb.util.BasicTypesHelpers.asLong

object RestService extends RestHelper with LbbLogger {
  
  serve {
    case JsonPost("rest" :: "apprequest" :: _, (json, req)) => saveAppRequests
    case JsonPost("rest" :: "facebookusers" :: facebookId :: email :: name :: _, (json, req)) => handleFacebookUser(facebookId, email, name)
    case JsonPost("rest" :: "mergeusers" :: AsLong(userId) :: facebookId :: email :: _, _) => mergeUsers(userId, facebookId, email)
    case Delete("rest" :: "friend" :: AsLong(userId) :: AsLong(friendId) :: _, _) => deleteFriend(userId, friendId)
  }

  // ref:  http://www.assembla.com/spaces/liftweb/wiki/REST_Web_Services
  serve {
    
    // gifts...
    case Get("rest" :: "gifts" :: AsLong(giftId) :: _, _) => debug("RestService.serve:  999999999"); findGift(giftId)
    case Get("rest" :: "gifts" :: _, _) => debug("RestService.serve:  AAAAAAAAA"); findGifts
  }
  
  serve {
    
    case JsonPost("rest" :: "circles" :: AsLong(circleId) :: _, (json, req)) => debug("updateCircle: "+circleId); updateCircle(circleId)
    case JsonPost("rest" :: "circleparticipants" :: AsLong(circleId) :: _, (json, req)) => insertParticipant(circleId)
    case Delete("rest" :: "circleparticipants" :: AsLong(circleId) :: _, req) => deleteParticipant(circleId)
    case Delete("rest" :: "gifts" :: AsLong(giftId) :: deleter :: _, _) => deleteGift(giftId, deleter)
  }
  
  serve {
    
    case Get("rest" :: "reminders" :: AsLong(circleId) :: _, _) => getReminders(circleId)
    case Delete("rest" :: "reminders" :: AsLong(circleId) :: _, _) => deleteReminders(circleId)
    case JsonPost("rest" :: "reminders" :: AsLong(circleId) :: _, (json,req)) => insertReminders(circleId)
  }
  
  serve {
    
    // circles...
    case Get("rest" :: "circles" :: AsLong(circleId) :: _, _) => debug("RestService.serve:  88888888"); findCircle(circleId)
    case Get("rest" :: "circleparticipants" :: AsLong(circleId) :: _, _) => debug("RestService.serve:  77777777777"); findCircleParticipants(circleId)
    case Get("rest" :: "fb" :: facebookId :: email :: first :: last :: Nil, _) => findOrCreateUser(facebookId, email, first, last)
  }
  
  serve {
    // Get someone's wish list outside the context of any circle
    // Can't use the url pattern:  gifts/userId because we already have gifts/giftId - would be ambiguous
    // So we have wishlist/userId - kinda lame
    case Get("rest" :: "wishlist" :: AsLong(userId) :: _, _) => wishlist(userId)
    case Get("rest" :: "users" :: AsLong(userId) :: _, _) => debug("RestService.serve:  22222222222222"); findUser(userId)
    case Get("rest" :: "users" :: _, _) => debug("RestService.serve:  333333333333333333333333"); findUsers
  }
  
  serve {
    case Post("rest" :: "logout" :: _, _) => logout
    case JsonPost("rest" :: "email" :: _, (json, req)) => email 
    case JsonPost("rest" :: "gifts" :: AsLong(giftId) :: updaterName :: _, (json, req)) => debug("RestService.serve:  BBBBBBBB"); updateGift(updaterName, giftId)
  }
  
  serve {
    case JsonPost("rest" :: "gifts" :: _ :: Nil, (json, req)) => debug("RestService.serve:  insertGift"); debug(json); insertGift
    case JsonPost("rest" :: "users" :: AsLong(userId) :: _, (json, req)) => debug("RestService.serve:  4.5 4.5 4.5 4.5 "); debug(json); updateUser(userId)
    case JsonPost("rest" :: "users" :: Nil, (json, req)) => debug("RestService.serve:  4444444444444444"); debug(json); insertUser
    case JsonPost("rest" :: "password" :: AsLong(userId) :: currentpass :: newpass :: _, (json, req)) => resetPass(userId, currentpass, newpass) // 2013-08-01 mobile only at this time
    case Get("rest" :: "password" :: AsLong(userId) :: currentpass :: Nil, _) => checkPass(userId, currentpass) // 2013-08-01 mobile only at this time
  }
  
  serve {
    case Get("rest" :: "barcode" :: code :: _, _) => debug("rest/barcode/"+code); lookupBarcode(code)
    case Get("rest" :: "usersearch" :: _, _) => debug("RestService.serve:  Get: usersearch"); SearchHelper.usersearch
    case JsonPost("rest" :: "circles" :: Nil, (json, req)) => insertCircle
    
    case Post("rest" :: "users" :: _, _) => debug("RestService.serve:  Post(api :: users  :: _, _)  S.uri="+S.uri); JsonResponse("Post(api :: users  :: _, _)  S.uri="+S.uri)
    
    case Post(_, _) => debug("RestService.serve:  case Post(_, _)"); JsonResponse("Post(_, _)  S.uri="+S.uri)
    
    //case _ => debug("RestService.serve:  666666666"); debugRequest 
  }
  
  
  def lookupBarcode(code:String) = {
    val barcodeType = "UPC"
    val searchIndex = "All"
    val url = "http://sowacs.appspot.com/AWS/%5Bbdunklau@yahoo.com%5Decs.amazonaws.com/onca/xml?IdType="+barcodeType+"&ItemId="+code+"&SearchIndex="+searchIndex+"&Service=AWSECommerceService&AWSAccessKeyId=056DP6E1ENJTZNSNP602&Operation=ItemLookup&AssociateTag=wwwlittleb040-20"
    val res = io.Source.fromURL(url).mkString
    val f1 = JField("xml", JString(res))
    val jobj:JsExp = JObject(List(f1))
    JsonResponse(jobj)
  }
  
  
  def deleteFriend(userId:Long, friendId:Long) = {
    val f1 = Friend.findAll(By(Friend.friend, friendId), By(Friend.user, userId))
    val f2 = Friend.findAll(By(Friend.friend, userId), By(Friend.user, friendId))
    (f1 :: f2 :: Nil).flatten.foreach(_.delete_!)
    NoContentResponse()
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
    val apprequests = AppRequest.createFromHttp
    apprequests.foreach(_.save)
    
    // write to person
    val insertTheseUsers = User.createFromAppRequests(apprequests)
    insertTheseUsers.foreach(_.save)
    
    // unique constraint violations definitely possible above, so 'insertTheseUsers' may contain User objects with null id's, that's why we're querying here
    val facebookIds = apprequests.map(_.facebookId.is)
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
    
    /////////////////////////////////////////////////////////////////////////////////////
    // 2nd half of the method :(   
    // Figure out if the user is inviting this new facebook user to an event or if the person 
    // is just being invited as a friend
    val boxofcirclestuff = for(req <- S.request; jvalue <- req.json) yield {
      jvalue match {
        case jobj:JObject => {
          jobj.values.get("circlestuff") match {
            case Some(m:Map[String, Any]) => {
              
              m.filter(kv => kv._1.equals("circleId") || kv._1.equals("participationlevel"))
              
            } // case Some(list:List[Map[String, Any]])
            
            case _ => Map[String, Any]()
            
          } // jobj.values.get("circlestuff") match 
          
        } // case jobj:JObject
            
        case _ => Map[String, Any]()
        
      } // jvalue match 
      
    } // val cccc = for(req <- S.request; jvalue <- req.json) yield
    
    debug("CHECK: newusers="+newusers)
    debug("CHECK: boxofcirclestuff="+boxofcirclestuff)
    boxofcirclestuff.openOr(Map("sorry" -> "sorry"))
    debug("CHECK: boxofcirclestuff.openOr(Map(\"sorry\" -> \"sorry\"))="+boxofcirclestuff.openOr(Map("sorry" -> "sorry")))
    
    val cps = for(user <- newusers; circlestuff <- boxofcirclestuff; circleId <- circlestuff.get("circleId");   participationlevel <- circlestuff.get("participationlevel")) yield {
      CircleParticipant.create.circle(circleId.toString().toLong).participationLevel(participationlevel.toString()).date_invited(new Date()).inviter(inviterId).person(user)
    }
    
    cps.foreach(_.save())
    
    // trying to create JField("participants", participants)...
    val www = for(circlestuff <- boxofcirclestuff; circleId <- circlestuff.get("circleId"); participationlevel <- circlestuff.get("participationlevel")) yield {
      val jobj = (circleId, participationlevel) match {
        case (cid:BigInt, level:String) => {
          val c = Circle.findByKey(cid.toLong)
          debug("for cid.toLong="+cid.toLong+", Circle="+c);
          c match {
            case Full(circle) => {
              val receivers = circle.receivers.map(_.asReceiverJs(Full(circle)))
              val rarr = JArray(receivers)
      
              val givers = circle.givers.map(_.asJsShallow)
              val garr = JArray(givers)
      
              val giverField = JField("givers", garr)
              val receiverField = JField("receivers", rarr)
      
              val participants = JObject(List(giverField, receiverField))  
              JField("participants", participants) 
            }
            case _ => { JsonAST.JNull }
          }
        }
        case _ => { JsonAST.JNull }
      }
      jobj
    }
    
    
    // combining JField("participants", participants) with JField("friends", farr)...
    val ppp = www match {
      case Full(participantsField:JsonAST.JField) => {
        List(participantsField)
      }
      case _ => {
        Nil
      }
    }    
    
    val friendsjs = friends.map(_.asJsShallow)
    val farr = JArray(friendsjs)
    val friendsField = JField("friends", farr)
    val fff = (ppp :: List(friendsField) :: Nil).flatten
    val stuff = JObject(fff)
    val r = JsonResponse(stuff)
    debug("saveAppRequests: JsonResponse(stuff)=" + r.toString())
    r
    
  }
  
  
  /**
   * This method has to figure out if it's responding to an app request or not.
   * If it's responding to an app request, there's the possibility that we will have to merge user records
   * If we're not responding to an app request, we know we won't have to merge user records
   * Merging user records comes into play when:
   *   one person invites another person 
   *   and that other person happens to already be an LBB user
   *   and that other person hasn't logged in via FB yet
   *  
   */
  def handleFacebookUser(facebookId:String, email:String, name:String) = { 
    println("handleFacebookUser() ---------------------------")
    
    // see if we're handling an app request or not
    S.param("fbreqids") match {
      case Full(fbreqids) => {
        // We are processing an app request.  Accept it.
        val facebookRequestIds = fbreqids.split(",")
        val apprequests = AppRequest.findAll(By(AppRequest.facebookId, facebookId), ByList(AppRequest.fbreqid, facebookRequestIds))
        apprequests.foreach(ar => {
          ar.acceptdate(new Date())
          ar.save
        })
      } // case Full(fbreqids)
      
      case _ => // This is not in response to an app request - dont' do anything       

    } // S.param("fbreqids") match

    
    val emailrecords = User.findAll(By(User.email, email)) // 0, 1 or many
    val facebookrecords = User.findAll(By(User.facebookId, facebookId)) // can only be 0 or 1
    val hasboth = User.findAll(By(User.email, email), By(User.facebookId, facebookId)) // can only be 0 or 1
    
    val returnusers = (emailrecords, facebookrecords, hasboth) match {
      case (_, _, u::us) => {
        // LOVE THIS CASE because we don't have to do anything to the person table.  The record we're looking for already has the right email and facebook id
        hasboth
      }
      case(Nil, Nil, _) => {
        // no record of any kind for this person yet, so create one
        val newuser = User.create(name, facebookId).email(email)
        newuser.save
        Emailer.notifyWelcomeFacebookUser(newuser)
        List(newuser)
      }
      case(e::es, f::fs, _) if(es.size==0 && fs.size==0) => {
        // THIS IS THE MERGE CASE.  We have one record with email, and another with facebook id.  But notice they are not the same record because
        // if they were, the first case would have been executed.  So we have to merge f in with e and then delete f.
        val mergeduser = User.merge(e, f)
        List(mergeduser)
      }
      case(e::es, _, _) if(es.size==0) => {
        // We only have one person record with email.  Also, we know facebookrecords is empty because if it had one element, then either the first case 
        // or the third case would have been executed
        // So FB has passed us a facebook id.  Update the existing record's facebook id and profile pic.
        e.facebookId(facebookId).profilepic("http://graph.facebook.com/"+facebookId+"/picture?type=large")
        e.save
        List(e)
      }
      case(e::es, _, _) => {
        // case WHO ARE YOU?  We have several records with this email, none having facebook id
        // We return the whole list 'emailrecords' and let the client direct the user to the "who are you" page
        emailrecords
      }
      case(_, f::fs, _) => {
        // We already had a record with facebook id but no email.  THIS COULD POTENTIALLY CAUSE A SECOND PERSON RECORD TO BE CREATED IF THE PERSON ALREADY EXISTS IN LBB UNDER ANOTHER EMAIL.
        f.email(email).save
        // We know we should send a welcome email in this case because prior to this call, the person record didn't have an email address.
        // Records with facebook id's but no email address are created by friends when app requests are sent.  If we make it to this case,
        // it means the person that was invited is now responding - hence welcome email
        Emailer.notifyWelcomeFacebookUser(f)
        List(f)
      }
      
      
    } // (emailrecords, facebookrecords, hasboth)

    debug("handleFacebookUser(): end ---------------------------");
    Util.toJsonResponse(returnusers)
    
  }

  
  /**
   * Poor naming: We MAY merge users or we may not.  Depends on who 'keep'
   * and 'delete' are.
   */
  def mergeUsers(userId:Long, facebookId:String, email:String) = {
    val box = (User.findByKey(userId), User.findAll(By(User.facebookId, facebookId))) match {
      case (Full(keep), Nil) => {
        keep.facebookId(facebookId).profilepic("http://graph.facebook.com/"+facebookId+"/picture?type=large").save
        Full(keep)
      }
      case (Full(keep), delete :: deletes) if(keep.id.is!=delete.id.is) => {
        val mergeduser = User.merge(keep, delete);
        Full(mergeduser)
      } // case (Full(keep), delete :: deletes)
      case (Empty, u2 :: us) => {
        u2.email(email).save
        Full(u2)
      }
      case _ => Empty
      
    } // (User.findByKey(userId), User.findAll(By(User.facebookId, facebookId))) match
    
    box match {
      case Full(user) => JsonResponse(user.asJs)
      case _ => NoContentResponse()
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
    println("email: begin")
    S.param("type") match {
      case Full(s) if(s.equals("passwordrecovery")) => sendPasswordRecoveryEmail
      case Full(s) if(s.equals("welcome")) => sendWelcomeEmail
      case _ => { warn("email:  BadResponse()"); BadResponse() }
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
      println("sendPasswordRecoveryEmail: begin");
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
      case e:RuntimeException => { println("sendPasswordRecoveryEmail: RuntimeException: "+e); BadResponse() }
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
  
  // 2013-06-12  Need to update this so that it can recognize whether the user being inserted 
  // is via fb login or lbb login.  If logging in via lbb, then we send them an email with their
  // user/pass.  If they are logging in via fb, then we call Emailer.notifyWelcomeFacebookUser which
  // contains a different message (w/out the user/pass)
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
    
    Emailer.notifyAccountCreated(user, S.param("creatorName").openOr("undefined"))
    
    S.param("login") match {
      case Full("true") => user.login
      case _ => JsonResponse(user.asJs)
    }
    
  }
  
  def insertCircle = {
    debug("RestService.insertCircle:  S.request = "+S.request)
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
          
          case _ => { debug("RestService.insertCircle: BAD got default case 2"); BadResponse(); }
          
        } // req.json match
        
      } // case Full(req)
          
      case _ => { debug("RestService.insertCircle: BAD got default case 1"); BadResponse(); }
      
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
              case ("creatorId", b:BigInt) => { /* ignore creator on updates - creator doesn't change */ }
              case ("participants", _) => {
                /* This is not where we save participants.  Participants are only inserted and deleted - not updated
                 * If we were to mess with participants here, we would have to figure out who is in the db now
                 * and then compare to what got passed in, inserting only those participants that didn't already 
                 * exist in the db ...OR we could delete all participants and re-add those that got passed in here
                 * But that would trigger duplicate emails to people that were already in the circle - definitely not what we want to do.
                 */
              }
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
  
  // 2013-08-01 mobile only at this time
  def resetPass(id:Long, currentpass:String, newpass:String) = (User.findByKey(id)) match {
    case (Full(user)) if(user.password.equals(currentpass)) => {
      user.password(newpass);
      user.save match {
        case true => NoContentResponse()
        case _ => BadResponse()
      }
    }
    case _ => BadResponse();
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
                case ("lbbfriends", list:List[Map[String, Any]]) => user.addlbbfriends(list)
                case ("notifyonaddtoevent", b:Boolean) => user.notifyonaddtoevent(b.toString())
                case ("notifyondeletegift", b:Boolean) => user.notifyondeletegift(b.toString())
                case ("notifyoneditgift", b:Boolean) => user.notifyoneditgift(b.toString())
                case ("notifyonreturngift", b:Boolean) => user.notifyonreturngift(b.toString())    
                // could be strings too? 2013-08-16  See notifications-nofooter.html
                case ("notifyonaddtoevent", b:String) => user.notifyonaddtoevent(b)
                case ("notifyondeletegift", b:String) => user.notifyondeletegift(b)
                case ("notifyoneditgift", b:String) => user.notifyoneditgift(b)
                case ("notifyonreturngift", b:String) => user.notifyonreturngift(b)  
                
                case ("dateOfBirth", s:String) => {
                  if(s!=null && !s.toString().trim().equals("") && !s.toString().trim().equals("0")) {
                    debug("updateUser:  s = '"+s+"'");  user.dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse(s.toString())) // not sure about this on yet
                  }
                }
                case _ => warn("UNHANDLED key/value pair:  "+kv._1+" = "+kv._2+" ("+kv._2+" is a "+kv._2.getClass.getName+")")
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
  
  // 2013-08-01  modeled after findUser(id) - making sure the currentpass matches the actual pass.
  // We don't want to enable the submit button the password reset form if the user hasn't even entered the current password yet
  def checkPass(id:Long, currentpass:String) = {
    (User.findByKey(id)) match {
      case (Full(user)) if(user.password.equals(currentpass)) => debug("RestService.checkPass: good"); NoContentResponse();
      case _ => debug("RestService.checkPass: BadResponse()"); BadResponse()
    }
  }
  
  // 2013-08-02  When loggin in via fb, we have to figure out if there is already a record in the db
  // First we query by facebook id.  If we find a record, we don't have to do anything else but return it
  // If we don't find any person record with the facebook id, we have to query by email next.
  // In this case, we could get 0..n records.  The n case is the only one that's tricky because it means
  // we can't tell who the person is and we have to ask that person to tell us.
  def findOrCreateUser(facebookId:String, email:String, first:String, last:String) = {
        
    val facebookrecords = User.findAll(By(User.facebookId, facebookId)) // can only be 0 or 1
    facebookrecords.size match {
      case 1 => Util.toJsonResponse(facebookrecords)
      case 0 => {
        // no one yet has this facebook id, so we have to check the db for 'email'...
        val usersWithEmail = User.findAll(By(User.email, email))
        usersWithEmail.size match {
          case 1 => {/* one person with this email found - good - set the facebook id of this person */
            usersWithEmail.head.facebookId(facebookId);
            if(usersWithEmail.head.save) Util.toJsonResponse(usersWithEmail)
            else BadResponse()
          }
          case 0 => {/* no one found with the email either, so this is a new account.  Create it and return it */
             val name = first + " " + last
             val newuser = User.create(name, facebookId).email(email)            
             if(newuser.save) Util.toJsonResponse(List(newuser))
             else BadResponse()
          }
          case _ => {/* multiple people share this email, have to present them all to the user and ask him who he is */
            Util.toJsonResponse(usersWithEmail)
          }
        }
      }
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
      //val jarr = JField("participants", participants)
      
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
   * You may click a link in FB like  www.littlebluebird.com/gf/giftlist/552/17, which is the wishlist
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
    val recipientId = asLong(S.param("recipientId")) match {
      case b:Box[Long] => b openOr -1L
      case _ => -1L
    }
    
    (User.findByKey(userKey), User.findByKey(recipientId)) match {
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
      for(sender <- gift.sender; if(sender.notifyondeletegift.is.equals("true") && sender.email.is!=null && !sender.email.is.trim.equals(""))) yield {
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