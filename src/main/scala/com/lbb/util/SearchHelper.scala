package com.lbb.util
import net.liftweb.http.S
import net.liftweb.http.BadResponse
import com.lbb.entity.User
import net.liftweb.mapper.IHaveValidatedThisSQL
import net.liftweb.http.JsonResponse
import net.liftweb.http.js.JE.JsArray
import net.liftweb.http.LiftResponse
import net.liftweb.common.Full

object SearchHelper extends LbbLogger {

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
  
  
  /**
   * These are people that have facebook id's in the LBB database BUT there are no
   * records in the friends table associating the current user with any of these people
   * You (the current user) know who these people are, but you aren't following them on LBB
   * <P>
   * If you ARE LBB friends with a FB friend, who cares - we already know you are friends.
   * What we care about is identifying those people that you are friends with on FB
   * that you didn't know were also on LBB
   */
  def notFollowingTheseFBFriends(userId:String, json:String) = {
    
    // this could be a HUGE string
    val facebookIds = Util.facebookFriendsToCSV(json)
    
    /**
     * Here's how you read the sql below.  First, start with the subselect in the where clause
     * What we're doing is getting the facebook id's of everyone I am associated with in
     * the friends table.  These are my facebook friends that I am "following" on LBB
     * NOW look at the subselect of the select statement:  I supply a csv list of all my
     * fb friends' fbids.  I'm trying to figure out how many of these fbid's are in the person
     * table.  So this subselect will return everyone in LBB that I am friends with on fb,
     * regardless of whether I am following them in LBB or not.
     * PUTTING IT ALL TOGETHER: So in the top part - the select statement - I get all my friends'
     * fbids from the person table, then in the where clause, I use NOT IN to filter out
     * everyone I am following.  The result: I get just those people that I am NOT currently
     * following but who ARE LBB users - I just didn't know it.
     */
    
    val mess = 
	  "select d.facebook_id from (" +
	      // this part just tells me which of my friends on in LBB
	      "select p.facebook_id from person p where p.facebook_id in ("+facebookIds+")) d "+
	  "where d.facebook_id not in (" +
	      // this returns the facebook id's everyone I am following in LBB (meaning I am associated with them in the friends table)
	      "select p.facebook_id from friends f, person p "+ 
	      "where f.user_id = "+userId+" and f.friend_id = p.id " +
	      "and p.facebook_id in ("+facebookIds+") )"
	      
	val sql = "select * from person where facebook_id in ("+mess+")"
	      
    User.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
  }
  
  
  def peopleToInvite(userId:String, json:String) = {
    
    // this could be a HUGE string
    val facebookIdsCSV = Util.facebookFriendsToCSV(json)
    val maps = Util.makeListOfMaps(json)

    // doesn't return fully populated User objects, but we don't expect that because
    // this method is returning facebook friends that aren't in the LBB database yet
    val sql = "select facebook_id from person where facebook_id in ("+facebookIdsCSV+")"
    
    // These are the fb id's that DO exist in the person table
    val existing = User.findAllByInsecureSql(sql, IHaveValidatedThisSQL("me", "11/11/1111"))
    val xxx = existing.map(_.facebookId.is)
    debug("Existing FB ID's: "+xxx);
    val nonusers = maps.filter(uuu => !xxx.contains(uuu.getOrElse("id", "huh? default")))
    debug("nonusers: "+nonusers);
    nonusers
  }
}







