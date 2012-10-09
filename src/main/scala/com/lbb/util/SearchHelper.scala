package com.lbb.util
import net.liftweb.http.S
import net.liftweb.http.BadResponse
import com.lbb.entity.User
import net.liftweb.mapper.IHaveValidatedThisSQL
import net.liftweb.http.JsonResponse
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.LiftResponse
import net.liftweb.common.Full

object SearchHelper {

  def usersearch:LiftResponse = {
    val users = RequestHelper.searchTerms(S.param("search")) match {
      case (x :: xs) if(xs==Nil) => usersearch(x) 
      case (x :: xs) => usersearch(x, xs.head)  
      case _ => Nil;
    } // S.param("search") match
    
    JsonResponse(JsArray(users.map(_.asJs)))
  }
  
  def usersearch(s1:String, s2:String) = {
    val sql = "select p.* from person p where " +
    		"(p.firstname like ('%"+s1+"%') and p.lastname like ('%"+s2+"%')) " +
    	    "or (p.firstname like ('%"+s2+"%') and p.lastname like ('%"+s1+"%'))"
    User.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
  }
  
  def usersearch(s1:String) = {
    val sql = "select p.* from person p where " +
    		"p.firstname like ('%"+s1+"%') or " +
    	    "p.lastname like ('%"+s1+"%') or " +
    	    "p.username like ('%"+s1+"%') or " +
    	    "p.email like ('%"+s1+"%')"
    User.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
  }
}