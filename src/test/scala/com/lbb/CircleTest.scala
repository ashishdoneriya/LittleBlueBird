package com.lbb
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import net.liftweb.db.StandardDBVendor
import net.liftweb.mapper.Schemifier
import net.liftweb.mapper.DB
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.util.Props
import net.liftweb.common.Box
import java.text.SimpleDateFormat
import com.lbb.entity.Circle
import com.lbb.entity.User

@RunWith(classOf[JUnitRunner])
class CircleTest extends FunSuite with AssertionsForJUnit {

  def initDb = {
    // this stuff goes in Boot.scala
    val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3307/bdunklau", //"jdbc:h2:~/test", //"jdbc:mysql://localhost:3306/littlebluebird",
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

    DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
    
    Schemifier.schemify(true, Schemifier.infoF _, Circle)
  }

  test("create Circle with Mapper") {
    initDb
    
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
    
    // this stuff goes in the snippet I guess...
    val circle = Circle.create
    circle.name("test circle").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/2013"))
    
    val saved : Boolean = circle.save
    assert(saved===true)
    assert(Circle.findAll.size===1)
    assert(Circle.findAll.head.isExpired===false)
  }
  
  test("create xmas2012") {
    initDb
    
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
    
    CircleTest.nextXmas
    
    assert(Circle.findAll.size===1)
    assert(CircleTest.nextXmas.name==="Christmas 2012")
  }
  
  test("Intersection of Circles") {
    
    initDb 
        
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
        
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
    
    val lastXmas = CircleTest.lastXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val nextXmas = CircleTest.nextXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val anniv = CircleTest.anniv.add(List(brent, tamie), List(kiera, truman, jett, brenda1), brent)
    val bday = CircleTest.bday.add(List(brent), List(tamie, kiera, truman, jett, bill), brent)
    
    assert(brent.activeCircles.size===3) 
    val recipientList = for(user <- User.findAll().filter(u => u.first.is.equals("Brent") || u.first.is.equals("Tamie"))) yield {
      println(user)
      user
    }
    
    // should be:  kiera, truman, jett, brenda1   NOT bill
    val emailList = getEmailList(recipientList)
    
  }
  
  def getEmailList(recipientList:List[User]) = {
    val xxxx = for(recip <- recipientList; circle <- recip.activeCircles.filter(ccc => recip.isReceiver(ccc))) yield {
      println("CIRCLE: "+circle.name)
      circle
    }
    
    val cs = for(ccc <- xxxx; recip <- recipientList; if(recip.isReceiver(ccc))) yield {
      println("CS: "+ccc.name)
      ccc
    }
  }
  
  test("test circle types") {
    import com.lbb.TypeOfCircle
    TypeOfCircle.values foreach {t => {println("Circle type:  "+t)}}
  }
  
  test("type of circle enums")
  {
    assert(TypeOfCircle.christmas.toString()==="Christmas")
    assert(TypeOfCircle.anniversary.toString()==="Anniversary")
  }
  
  test("receiver limit") {
	assert(Circle.create.circleType(TypeOfCircle.birthday.toString()).receiverLimit===1)
	assert(Circle.create.circleType(TypeOfCircle.christmas.toString()).receiverLimit === -1)
	assert(Circle.create.circleType(TypeOfCircle.valentinesday.toString()).receiverLimit === -1)
	assert(Circle.create.circleType(TypeOfCircle.mothersday.toString()).receiverLimit===1)
	assert(Circle.create.circleType(TypeOfCircle.fathersday.toString()).receiverLimit===1)
	assert(Circle.create.circleType(TypeOfCircle.graduation.toString()).receiverLimit===1)
	assert(Circle.create.circleType(TypeOfCircle.babyshower.toString()).receiverLimit===1)
	assert(Circle.create.circleType(TypeOfCircle.anniversary.toString()).receiverLimit===2)
	assert(Circle.create.circleType(TypeOfCircle.other.toString()).receiverLimit===1)
  }
}

object CircleTest extends CircleTest {
  
  def lastXmas = {
    val circle = Circle.create.circleType(TypeOfCircle.christmas.toString()).name("Christmas 2011").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2011"))
    circle.save
    circle
  }
  
  def nextXmas = {
    val circle = Circle.create.circleType(TypeOfCircle.christmas.toString()).name("Christmas 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2012"))
    circle.save
    circle
  }
  
  def anniv = {
    val circle = Circle.create.circleType(TypeOfCircle.anniversary.toString()).name("Anniversary 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("06/28/2013"))
    circle.save
    circle
  }
  
  def bday = {
    val circle = Circle.create.circleType(TypeOfCircle.birthday.toString()).name("BDay 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/2012"))
    circle.save
    circle
  }

}