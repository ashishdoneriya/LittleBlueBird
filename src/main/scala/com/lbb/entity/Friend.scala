package com.lbb.entity
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.IdPK
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongForeignKey
import com.lbb.util.LbbLogger
import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException

class Friend extends LongKeyedMapper[Friend] with IdPK with LbbLogger {
  def getSingleton = Friend

  // TODO make sure userid/friendid is unique
  object userId extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "user_id"
  }
  
  object friendId extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "friend_id"
  }
  
  override def save = {
    try {
      val saved = super.save
      saved
    }
    catch { 
      case e:MySQLIntegrityConstraintViolationException => debug(e.getClass().getName+": "+e.getMessage); false 
      case e => error(e.getClass().getName+": "+e.getMessage); false 
    }
  }
}

object Friend extends Friend with LongKeyedMetaMapper[Friend] {
  override def dbTableName = "friends" // define the DB table name
    
  /**
   * We're going to write to the friends table ...in CircleParticipants.save
   * 
   * You end up creating 2 friend relationships for every person (except the person
   * to himself).  The first relationshiop is:  B is A's friend
   * The other is A is B's friend
   */
  def createFriends(cp:CircleParticipant) = {
    val friends = for(other <- cp.otherParticipants) yield {
      val oneway = Friend.create.userId(cp.person.is).friendId(other.person.is)
      val theotherway = Friend.create.userId(other.person.is).friendId(cp.person.is)
      oneway :: theotherway :: Nil
    }
    friends.flatten
  }
  
  def associate(id1:Long, id2:Long) = {
    Friend.create.userId(id1).friendId(id2).save
    Friend.create.userId(id2).friendId(id1).save
  }
}