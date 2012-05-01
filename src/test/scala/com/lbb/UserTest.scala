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
import com.lbb.entity.User
import net.liftweb.http.js.JsExp
import com.lbb.util.MapperHelper

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
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

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
    user.first("BRENT").last("Dunklau").username("bdunklau").password("123456789").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    
    val saved : Boolean = user.save
    assert(saved===true)
    assert(User.findAll.size===1)
    
    val user2 : User = User.create
    user2.first("brent").last("Dunklau").username("bdunklau").password("123456789").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
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
  
  test("findBy") {
    initDb
    
    val all = User.findAll
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    // this stuff goes in the snippet I guess...
    val user : User = User.create
    user.first("Brent").last("Dunklau").username("bdunklau").password("123456789").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    user.save
    
//  case-insensitive query
    val findF = "BRenT"
    val findL = "DUNklau"
    val users = User.findAll(Cmp(User.first, OprEnum.Like, Full("%"+findF.toLowerCase+"%"), Empty, Full("LOWER")),
        Cmp(User.last, OprEnum.Like, Full("%"+findL.toLowerCase+"%"), Empty, Full("LOWER")))
    
    // only one person with this name because the second didn't get saved 
    assert(users.size===1)
    println("UserTest: we found exactly 1 User")
    assert(users.head.first==="Brent")
    assert(users.head.age===41)
    
    // correct password?  
    println("password="+users.head.password.match_?("123456789"))   

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
    user.first("Brent").last("Dunklau").username("bdunklau").password("123456789").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
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
    assert(u.last("newlastname").save()===true)    
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
    println(f)
  }

}

object UserTest extends UserTest {
  
  val brent = ("Brent", "Dunklau", "bdunklau", "11111", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
  
  def createBrent = {
    val user = createUser(brent._1, brent._2, brent._3, brent._4, brent._5, brent._6, brent._7)
    user.save
    user
  }
  
  def createTamie = {
    val user = createUser("Tamie", "Dunklau", "tamie", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("10/10/1976"))
    user.save
    user
  }
  
  def createKiera = {
    val user = createUser("Kiera", "Daniell", "kiera", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/16/2001"))
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
  
  def createBrenda1 = {
    val user = createUser("Brenda", "Dunklau", "brenda1", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"))
    user.save
    user
  }
  
  def createBrenda2 = {
    val user = createUser("Brenda", "Dunklau", "brenda2", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"))
    user.save
    user
  }
  
  def createBill = {
    val user = createUser("Bill", "Dunklau", "bill", "123456789", "bdunklau@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/19/2011"))
    user.save
    user
  }
  
  def createUser(f:String, l:String, u:String, p:String, e:String, b:String, d:Date) = {
    val user = User.create.first(f).last(l).username(u).password(p).email(e).bio(b).dateOfBirth(d)
    user.save
    user
  }
}