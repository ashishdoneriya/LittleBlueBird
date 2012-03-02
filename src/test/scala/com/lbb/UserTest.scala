package com.lbb
import java.text.SimpleDateFormat
import org.junit.runner.RunWith
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.junit.JUnitRunner
import org.scalatest.FunSuite
import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.db.StandardDBVendor
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.DB
import net.liftweb.mapper.OprEnum
import net.liftweb.mapper.Schemifier
import net.liftweb.util.FieldError
import net.liftweb.util.Props
import java.util.Date

/**
 * From the project root: sbt
 * From the sbt prompt: test
 * 'test' will compile test classes and run them
 */
@RunWith(classOf[JUnitRunner])
class UserTest extends FunSuite with AssertionsForJUnit {

  def initDb = {
    // this stuff goes in Boot.scala
    val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3306/littlebluebird",
			     Box("bdunklau"), Box("Pi314159"))

    DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
    
    Schemifier.schemify(true, Schemifier.infoF _, User)
  }
  
  test("create User with Mapper") {
    initDb
    
    val all = User.findAll
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    // this stuff goes in the snippet I guess...
    val user : User = User.create
    user.first("BRENT").last("Dunklau").username("bdunklau").password("123456789").email("bdunklau@yahoo.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    
    val saved : Boolean = user.save
    assert(saved===true)
    assert(User.findAll.size===1)
    
    val user2 : User = User.create
    user2.first("brent").last("Dunklau").username("bdunklau").password("123456789").email("bdunklau@yahoo.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    user2.validate match {
      case Nil => {
        println("user2 is valid, saving...")//S.notice(“Person is valid”)
        user2.save
      }
      case errors:List[FieldError] => errors.foreach(println(_))//S.error(errors)  // S.error will handle this properly
    }
    
//  case-insensitive query
    val findF = "BRenT"
    val findL = "DUNklau"
    val users = User.findAll(Cmp(User.first, OprEnum.Like, Full("%"+findF.toLowerCase+"%"), Empty, Full("LOWER")),
        Cmp(User.last, OprEnum.Like, Full("%"+findL.toLowerCase+"%"), Empty, Full("LOWER")))
    
    // only one person with this name because the second didn't get saved    
    assert(users.size===1)
    assert(users.head.first==="BRENT")
    assert(users.head.age===41)
    
    // correct password?  
    println("password="+users.head.password.match_?("123456789"))   

  }
  
  test("create and update brent") {
    initDb
    
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    val u = UserTest.createBrent
    
    assert(User.findAll.size===1)
    assert(u.first===UserTest.brent._1)
    
    // now update last name
    assert(u.last("newlastname").save()===true)    
    assert(User.findAll.size===1)
    assert(u.last==="newlastname")
  }

}

object UserTest extends UserTest {
  
  val brent = ("Brent", "Dunklau", "bdunklau", "123456789", "bdunklau@yahoo.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
  
  def createBrent = {
    val user = createUser(brent._1, brent._2, brent._3, brent._4, brent._5, brent._6, brent._7)
    user.save
    user
  }
  
  def createTamie = {
    val user = createUser("Tamie", "Dunklau", "tamie", "123456789", "tamiemarie@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("10/10/1976"))
    user.save
    user
  }
  
  def createKiera = {
    val user = createUser("Kiera", "Daniell", "kiera", "123456789", "superkikid@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/16/2001"))
    user.save
    user
  }
  
  def createTruman = {
    val user = createUser("Truman", "Dunklau", "truman", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("5/11/2010"))
    user.save
    user
  }
  
  def createJett = {
    val user = createUser("Jett", "Dunklau", "jett", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"))
    user.save
    user
  }
  
  def createUser(f:String, l:String, u:String, p:String, e:String, b:String, d:Date) = {
    val user = User.create.first(f).last(l).username(u).password(p).email(e).bio(b).dateOfBirth(d)
    user.save
    user
  }
}