package com.lbb.util
import com.lbb.entity.User

import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.http.provider.HTTPCookie
import net.liftweb.http.S

/**
 * Originally created to identify those request parameters that do NOT have 
 * a value of 'undefined'  (it's an angularjs thing)
 */
object RequestHelper {

  /**
   * Returns all the request parameters (just the names) that
   * have something other than 'undefined' as its value
   */
  def definedParms(m:Map[String, List[String]]): Map[String, String] = {
    
    // could have combined all this into one long hairy expression
    // but this is easier to follow
    // First, filter out all parameters that have more than one value
    val res1 = m.filter(kv => m.get(kv._1) match {
      case Some(list) if(list.size == 1) => true
      case _ => false
    })
    
    // Of the parameters that only have one value, filter out those
    // that have value of 'undefined'
    val res2 = res1.filter(kv => m.get(kv._1) match {
      case Some(x :: xs) => x != "undefined"
      case None => false
      case _ => false
    })
    
    // Of the remaining, convert the values from List[String]
    // to just String by taking the head of the List (which only
    // has one element anyway)
    res2.map(kv => (kv._1 -> res2.get(kv._1).get.head))
  }
  
    val F = """\s*(\w+)\s*""".r
    val FL = """\s*(\w+)\s+(\w+)\s*""".r
    
  def searchTerms(s:Box[String]):List[String] = {
    s match {
      case Full(F(f)) => { List(f); }
      case Full(FL(f, l)) => { List(f, l); }
      case _ => Nil
    }
  }
    
  def cookie(name:String, value:User) = {
    new HTTPCookie(name, Full(value.id.is.toString()), Empty, Empty, Full(24*60*60), Empty, Empty, Empty)
  }
  
//  def createEmail = {
//    Email(S.param("to").getOrElse("info@littlebluebird.com"), 
//          S.param("from").getOrElse("info@littlebluebird.com"), 
//          S.param("fromname").getOrElse("LittleBlueBird.com"), 
//          S.param("subject").getOrElse(""), 
//          S.param("message").getOrElse(""),
//          Nil, Nil)
    
    //Email.send()
    
    
    
//    val fff = S.request.map(s => {s.json
//      //Email(s.json.   .get("to"), s.json.get("from"), s.json.get("subject"), s.json.get("message"))
//    })
    
//    
//    S.request match {
//      case Full(req) => {
//        req.json match {
//          case Full(jvalue:JObject) => {
//            val email = Map()
//            jvalue.values foreach {kv => kv match {
//                case ("to", s:String) => email.to(s)
//                case ("from", s:String) => email.from(s)
//                case ("subject", s:String) => email.subject(s)
//                case ("message", s:String) => email.message(s)
//              }
//            }
//            user.save()
//            JsonResponse(user.asJs)
//          }
//          case _ => println("RestService.insertUser: case _ :  req.json = "+Empty); BadResponse()
//        }
//      }
//      case _ => BadResponse()
//    }
//  
//  }
}