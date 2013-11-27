package com.lbb
import java.text.SimpleDateFormat
import java.util.Date

import org.junit.runner.RunWith
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.junit.JUnitRunner
import org.scalatest.FunSuite

import com.lbb.entity.User
import com.lbb.util.LbbLogger
import com.lbb.util.MapperHelper

import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.common.Full
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.db.StandardDBVendor
import net.liftweb.http.js.JsExp
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.DB
import net.liftweb.mapper.OprEnum
import net.liftweb.mapper.Schemifier
import net.liftweb.util.FieldError
import net.liftweb.util.Props

/**
 * From the project root: sbt
 * From the sbt prompt: test
 * 'test' will compile test classes and run them
 */
@RunWith(classOf[JUnitRunner])
class UserTest extends FunSuite with AssertionsForJUnit with LbbLogger {

  def initDb = {
    // this stuff goes in Boot.scala
    val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3307/bdunklau", //"jdbc:h2:~/test", //"jdbc:mysql://localhost:3306/littlebluebird",
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

    DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
    
    Schemifier.schemify(true, Schemifier.infoF _, User) 
  }
  
  
  /**
   * 2013-11-26 Noticed a weird bug (don't know the cause yet) where users passwords were being set to empty string
   * So we overrode the apply() method and inside apply() we check for null/empty strings
   * And if the passed-in password is null/empty, then we don't set the password - we leave it alone.
   */
  test("do not let password be empty") {
    val user = User.create.first("Brent").last("Dunklau")
    user.password("goodpassword")
    assert(user.password==="goodpassword")
    
    // now try to set to empty string
    user.password("")
    assert(user.password==="goodpassword")
    
    // now try to set to empty string
    user.password("    ")
    assert(user.password==="goodpassword")
    
    // now try to set to null
    user.password(null)
    assert(user.password==="goodpassword")
    
    // now try to set to null
    user.password("changed")
    assert(user.password==="changed")
  }
  
  /**
   * Something deletes this record at the end of the end of the test, but I'm not sure what
   * I ran this in debug mode and put a breakpoint right after the save call.  The db showed this record - so it did get saved
   * But at the end of the test, the record was gone
   */
  test("create password when not supplied") {
    initDb
    val user = User.create.first("Brent").last("Dunklau").username("user123")
    assert(user.save===true)
    assert(user.password.is==="6AD14B")
  }
  
  
  test("create username when not supplied") {
    initDb
    val user = User.create.first("BrentX").last("Dunklau")
    assert(user.save===true)
    assert(user.username.is==="BrentX")
  }
  
    
  test("parse first last") {
    val user = User.create
    user.name("Brent     Dunklau")
    assert(user.first==="Brent")
    assert(user.last==="Dunklau")
    
    user.name("BrentAA  W....   Dunklauxx")
    assert(user.first==="BrentAA")
    assert(user.last==="Dunklauxx")
    
    user.name("BrentBB")
    assert(user.first==="BrentBB")
    assert(user.last==="Dunklauxx") // value left over from prev test
  }
  
  test("create User with Mapper") {
    initDb
    
    val all = User.findAll
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    // this stuff goes in the snippet I guess...
    val user : User = User.create
    user.first("BRENT").last("Dunklau").username("bdunklau").password("1").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    
    val saved : Boolean = user.save
    assert(saved===true)
    assert(User.findAll.size===1)
    
    val user2 : User = User.create
    user2.first("brent").last("Dunklau").username("bdunklau").password("1").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    user2.validate match {
      case Nil => {
        debug("user2 is valid, saving...")//S.notice(“Person is valid”)
        user2.save
      }
      case errors:List[FieldError] => errors.foreach(debug(_))//S.error(errors)  // S.error will handle this properly
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
    assert(users.head.password==="1")
  }
  
  test("findBy") {
    initDb
    
    val all = User.findAll
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    // this stuff goes in the snippet I guess...
    val user : User = User.create
    user.first("Brent").last("Dunklau").username("bdunklau").password("1").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    user.save
    
//  case-insensitive query
    val findF = "BRenT"
    val findL = "DUNklau"
    val users = User.findAll(Cmp(User.first, OprEnum.Like, Full("%"+findF.toLowerCase+"%"), Empty, Full("LOWER")),
        Cmp(User.last, OprEnum.Like, Full("%"+findL.toLowerCase+"%"), Empty, Full("LOWER")))
    
    // only one person with this name because the second didn't get saved 
    assert(users.size===1)
    debug("UserTest: we found exactly 1 User")
    assert(users.head.first==="Brent")
    assert(users.head.age===41)
    assert(users.head.password==="1")  

  }
  
  // can't include the password in the query but you can see what the password is
  // after the object is returned
  test("login") {
    initDb
    
    val all = User.findAll
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    // this stuff goes in the snippet I guess...
    val user : User = User.create
    user.first("Brent").last("Dunklau").username("bdunklau").password("1").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    user.save
     
//  case-insensitive query
    val findF = "BRenT"
    val findL = "DUNklau"
      
    val parms = Map("username" -> List("bdunklau"))
    val queryParams = MapperHelper.convert(parms, User.queriableFields)
    val users = User.findAll(queryParams: _*)
      
    // only one person with this name because the second didn't get saved    
    assert(users.size===1)
    assert(users.head.first==="Brent")
    assert(users.head.age===41)

  }
  
  test("create and update brent") {
    initDb
    
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    val u = UserTest.createBrent
    
    assert(User.findAll.size===1)
    assert(u.first===UserTest.brent._1)
    
    // now update last name
    assert(u.last("newlastname").save===true)    
    assert(User.findAll.size===1)
    assert(u.last==="newlastname")
  }
  
  test("create JSON string") {
    initDb
    
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    val brent = UserTest.createBrent
    val tamie = UserTest.createTamie
    val kiera = UserTest.createKiera
    val truman = UserTest.createTruman
    val jett = UserTest.createJett
    val brenda1 = UserTest.createBrenda1
    val brenda2 = UserTest.createBrenda2
    val bill = UserTest.createBill
    
    val jsons = User.findAll.map(_.asJs)
    val f = jsons.foldRight("")((a:JsExp, b:String) => a.toString() + "," + b)
    debug(f)
  }
  
  
  // 2/23/13
  test("do we need to determine username") {
    initDb
    // Need to determine username IF:
    // We are inserting
    // AND there is no username already
    
    // Note here we are not supplying a username
    val user = User.create.first("Brent").last("Dunklaux").email("bdunklau@gmail.com")
    assert(user.needToDetermineUsername===true) // we need to determine username because one wasn't supplied and this user hasn't been saved yet
    user.save
    assert(user.needToDetermineUsername===false)// don't need to determine username because this is an existing user.  We assume the username got set during user.save, even though we don't actually check to see if the username exists here.
    
    val u2 = User.create.first("Brent").last("XXXX").username("fffffff")
    assert(u2.needToDetermineUsername===false) // don't need to determine username because one was supplied by the user
  }
  
  
  // 2/26/13
  test("determine username based on first name - test #1") {
    val list = List("Brent", "Brent1", "Brent2", "Brent4")
    val user = User.create.name("Brent Dunklau")
    val exp = user.determineUsernameBasedOnFirstName(list)
    assert(exp==="Brent5")
  }
  
  
  // 2/26/13
  test("determine username based on first name - test #2") {
    val list = Nil
    val user = User.create.name("Brent Dunklau")
    val exp = user.determineUsernameBasedOnFirstName(list)
    assert(exp==="Brent0")
  }

}

object UserTest extends UserTest {
  
  // note:  if you look at everyone that has a common email, only one of them should have a facebook id
  // all the others should have null facebook id
  
  val brent = ("Brent", "Dunklaux", "bdunklaux", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"), Full("http://graph.facebook.com/bdunklaux/picture?type=large"), "bdunklaux")
  
  def createBrent = {
    val user = createUser("Brent", "Dunklau", "bdunklau", "1", "bdunklau@yahoo.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"), Empty, Empty)
    user.save
    user
  }
  
  def createBrentX = {
    val user = createUser("Brent", "Dunklaux", "bdunklaux", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"), Full("http://graph.facebook.com/bdunklaux/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createTamie = {
    val user = createUser("Tamie", "Dunklau", "tamie", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("10/10/1976"), Full("http://graph.facebook.com/tamie.dunklau/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createKiera = {
    val user = createUser("Kiera", "Daniell", "kiera", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/16/2001"), Full("http://sphotos.xx.fbcdn.net/hphotos-snc6/183574_1872491738760_1435144902_2104548_985622_n.jpg"), Empty)
    user.save
    user
  }
  
  def createTruman = {
    val user = createUser("Truman", "Dunklau", "truman", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("5/11/2010"), Full("http://photos-e.ak.fbcdn.net/hphotos-ak-snc6/196448_1912810746710_747329_a.jpg"), Empty)
    user.save
    user
  }
  
  def createJett = {
    val user = createUser("Jett", "Dunklau", "jett", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://sphotos.xx.fbcdn.net/hphotos-ash4/398071_2886695213213_1435144902_3059101_376931146_n.jpg"), Empty)
    user.save
    user
  }
  
  def createBrenda1 = {
    val user = createUser("Brenda", "Dunklau", "brenda1", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://graph.facebook.com/1140124546/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createBrenda2 = {
    val user = createUser("Brenda", "Dunklau", "brenda2", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://graph.facebook.com/brenda/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createBill = {
    val user = createUser("Bill", "Dunklau", "bill", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://graph.facebook.com/1336420404/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createBrandon = {
    val user = createUser("Brandon", "Dunklau", "brandon", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://graph.facebook.com/brandon.dunklau1/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createBryan = {
    val user = createUser("Bryan", "Dunklau", "bryan", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://graph.facebook.com/bdunklau/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createAllison = {
    val user = createUser("Allison", "Dunklau", "allison", "1", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"), Full("http://graph.facebook.com/allison.dunklau/picture?type=large"), Empty)
    user.save
    user
  }
  
  def createUser(f:String, l:String, u:String, p:String, e:String, b:String, d:Date, pic:Box[String], facebookId:Box[String]) = {
    val user = User.create.first(f).last(l).username(u).password(p).email(e).bio(b).dateOfBirth(d).profilepic(pic).facebookId(facebookId)
    user.save
    user
  }
}