package com.lbb.entity
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.IdPK
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongForeignKey
import com.lbb.util.LbbLogger
import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException
import net.liftweb.mapper.ByList
import net.liftweb.mapper.By

class Friend extends LongKeyedMapper[Friend] with IdPK with LbbLogger {
  def getSingleton = Friend

  // TODO make sure userid/friendid is unique
  object user extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "user_id"
    override def dbNotNull_? : Boolean = true
    override def dbIndexed_? : Boolean = true
  }
  
  object friend extends MappedLongForeignKey(this, User) {
    override def dbColumnName = "friend_id"
    override def dbNotNull_? : Boolean = true
    override def dbIndexed_? : Boolean = true
  }
  
  override def save = {
    try {
      debug("attempt to save: user="+user+"  friend="+friend);
      val saved = super.save
      debug("attempt to save: user="+user+"  friend="+friend+"  =>  saved="+saved);
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
    
  def join(user:User, friend:User) = {
    this.create.user(user).friend(friend).save
    this.create.user(friend).friend(user).save
  }
    
  /**
   * We're going to write to the friends table ...in CircleParticipants.save
   * 
   * You end up creating 2 friend relationships for every person (except the person
   * to himself).  The first relationshiop is:  B is A's friend
   * The other is A is B's friend
   */
  def createFriends(cp:CircleParticipant) = {
    val friends = for(other <- cp.otherParticipants) yield {
      val oneway = Friend.create.user(cp.person.is).friend(other.person.is)
      val theotherway = Friend.create.user(other.person.is).friend(cp.person.is)
      oneway :: theotherway :: Nil
    }
    friends.flatten
  }
  
  def createFriends(u1:Long, u2:Long) = {
    List(this.create.user(u1).friend(u2), this.create.user(u2).friend(u1))
  }
  
  def associate(id1:Long, id2:Long) = {
    Friend.create.user(id1).friend(id2).save
    Friend.create.user(id2).friend(id1).save
  }
  
  def merge(keep:User, delete:User) = {
    val friendIds = delete.friendList.map(_.id.is)
    val f1 = Friend.findAll(ByList(Friend.user, friendIds), By(Friend.friend, delete.id.is))
    val f2 = Friend.findAll(ByList(Friend.friend, friendIds), By(Friend.user, delete.id.is))
    (f1 :: f2 :: Nil).flatten.foreach(_.delete_!)
    for(friendId <- friendIds) {
      Friend.associate(friendId, keep.id.is)
    }
  }
}