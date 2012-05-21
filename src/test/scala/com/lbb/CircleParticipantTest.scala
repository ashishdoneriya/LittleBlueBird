package com.lbb
import java.text.SimpleDateFormat
import org.junit.runner.RunWith
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import com.lbb.entity.Circle
import com.lbb.entity.CircleParticipant
import com.lbb.entity.User
import net.liftweb.common.Box
import net.liftweb.db.DB1.db1ToDb
import net.liftweb.db.DefaultConnectionIdentifier
import net.liftweb.db.StandardDBVendor
import net.liftweb.mapper.DB
import net.liftweb.mapper.Schemifier
import net.liftweb.util.Props
import org.scalatest.junit.JUnitRunner
import scala.xml.Text
import net.liftweb.common.Full
import net.liftweb.common.Empty

@RunWith(classOf[JUnitRunner])
class CircleParticipantTest extends FunSuite with AssertionsForJUnit {

  def initDb = {
    // this stuff goes in Boot.scala
    val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3306/littlebluebird",
			     Box(Props.get("db.user") openOr "test"), Box(Props.get("db.pass") openOr "test"))

    DB.defineConnectionManager(DefaultConnectionIdentifier, vendor)
    
    Schemifier.schemify(true, Schemifier.infoF _, User)
    Schemifier.schemify(true, Schemifier.infoF _, Circle)
    Schemifier.schemify(true, Schemifier.infoF _, CircleParticipant)
  }

  test("create CircleParticipant with Mapper") {
    initDb
        
    CircleParticipant.findAll.foreach(_.delete_!)
    assert(CircleParticipant.findAll.size===0)
        
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
        
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    
    // this stuff goes in the snippet I guess...
    val brent : User = User.create.first("BRENT").last("Dunklau").username("bdunklau").password("11111").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
    val tamie : User = User.create.first("Tamie").last("Dunklau").username("tamie").password("11111").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("10/10/1976"))
    val kiera : User = User.create.first("Kiera").last("Daniell").username("kiera").password("11111").email("bdunklau@gmail.com").bio("I am great").dateOfBirth(new SimpleDateFormat("MM/dd/yyyy").parse("9/16/2001"))
    
    assert(brent.save===true)
    assert(tamie.save===true)
    assert(kiera.save===true)
    assert(User.findAll.size===3)
    
    
    // this stuff goes in the snippet I guess...
    val myBday = Circle.create.name("my birthday").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/2012"))
    val anniv = Circle.create.name("Anniversary").date(new SimpleDateFormat("MM/dd/yyyy").parse("6/28/2012"))
    val xmas = Circle.create.name("Christmas").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2012"))
    
    assert(myBday.save===true)
    assert(anniv.save===true)
    assert(xmas.save===true)
    
    val me_myBday = CircleParticipant.create.circle(myBday).person(brent).inviter(brent).participationLevel("Receiver")
    val tamie_myBday = CircleParticipant.create.circle(myBday).person(tamie).inviter(brent).participationLevel("Receiver")
    val kiera_myBday = CircleParticipant.create.circle(myBday).person(kiera).inviter(brent).participationLevel("Receiver")
    
    assert(me_myBday.save===true)
    assert(tamie_myBday.save===true)
    assert(kiera_myBday.save===true)
    
    val me_Anniv = CircleParticipant.create.circle(anniv).person(brent).inviter(brent).participationLevel("Receiver")
    val tamie_Anniv = CircleParticipant.create.circle(anniv).person(tamie).inviter(brent).participationLevel("Receiver")
    
    assert(me_Anniv.save===true)
    assert(tamie_Anniv.save===true)
    
    val me_xmas = CircleParticipant.create.circle(xmas).person(brent).inviter(brent).participationLevel("Receiver")
    val tamie_xmas = CircleParticipant.create.circle(xmas).person(tamie).inviter(brent).participationLevel("Receiver")
    val kiera_xmas = CircleParticipant.create.circle(xmas).person(kiera).inviter(brent).participationLevel("Receiver")
    
    assert(me_xmas.save===true)
    assert(tamie_xmas.save===true)
    assert(kiera_xmas.save===true)
    
    // brent.circles is a List.  It's all the instances of brent as a participant
    // This is how you find out all the circles brent is a member of
    brent.circles.foreach(c => println(brent.first+" belongs to " +c.circleName))
    
    // xmas.participants is a List.  It's all participants in a given circle
    xmas.participants.foreach(p => println(xmas.name+" has these members: " +p.name(p.person)))
    
  }
  
  test("populate xmas2012") {
    initDb
        
    CircleParticipant.findAll.foreach(_.delete_!)
    assert(CircleParticipant.findAll.size===0)
    
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
    
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    val brent = UserTest.createBrent
    val tamie = UserTest.createTamie
    val kiera = UserTest.createKiera
    val truman = UserTest.createTruman
    val jett = UserTest.createJett
    val status = Map(brent -> "Receiver", tamie -> "Receiver", kiera -> "Receiver", truman -> "Receiver", jett -> "Receiver")
    val expectedPeople = List(brent, tamie, kiera, truman, jett)
    val expectedCircle = CircleTest.nextXmas.add(expectedPeople, brent)
    
    // Now check the stuff...
    // Does the circle have 5 participants
    // Does each user belong to the circle
    assert(expectedPeople.size===expectedCircle.participants.size)
    assert(expectedCircle.name==="Christmas 2012")
    
    // make sure each person belongs to the right circle
    expectedPeople.foreach(u => u.circles.foreach(c => {
                                                              assert(c.circleName.toString===expectedCircle.name.toString())
                                                            }
                                                       ))
                     
    // make sure circle has the right participants
    expectedCircle.participants.foreach(p => matchPerson(p, status))
                                                       
  }
  
  test("populate anniv2012") {
    initDb
        
    CircleParticipant.findAll.foreach(_.delete_!)
    assert(CircleParticipant.findAll.size===0)
    
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
    
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    val brent = UserTest.createBrent
    val tamie = UserTest.createTamie
    val kiera = UserTest.createKiera
    val truman = UserTest.createTruman
    val jett = UserTest.createJett
    val status = Map(brent -> "Receiver", tamie -> "Receiver", kiera -> "Giver", truman -> "Giver", jett -> "Giver")
    val expectedReceivers = List(brent, tamie)
    val expectedGivers = List(kiera, truman, jett)
    val expectedCircle = CircleTest.anniv2012.add(expectedReceivers, expectedGivers, brent)
    
    // Now check the stuff...
    // Does the circle have 5 participants
    // Does each user belong to the circle
    assert((expectedReceivers.size + expectedGivers.size)===expectedCircle.participants.size)
    assert(expectedCircle.name==="Anniversary 2012")
    
    // make sure each person belongs to the right circle
    expectedReceivers.foreach(u => u.circles.foreach(c => {
                                                              assert(c.circleName.toString===expectedCircle.name.toString())
                                                            }
                                                       ))
    
    // make sure each person belongs to the right circle
    expectedGivers.foreach(u => u.circles.foreach(c => {
                                                              assert(c.circleName.toString===expectedCircle.name.toString())
                                                            }
                                                       ))
                     
    // make sure circle has the right participants
    // TODO how to verify correct giver/receiver status?
    expectedCircle.participants.foreach(p => matchPerson(p, status))
                                                       
  }
  
  test("populate bday2012") {
    initDb
        
    CircleParticipant.findAll.foreach(_.delete_!)
    assert(CircleParticipant.findAll.size===0)
    
    Circle.findAll.foreach(_.delete_!)
    assert(Circle.findAll.size===0)
    
    User.findAll.foreach(_.delete_!)
    assert(User.findAll.size===0)
    
    val brent = UserTest.createBrent
    val tamie = UserTest.createTamie
    val kiera = UserTest.createKiera
    val truman = UserTest.createTruman
    val jett = UserTest.createJett
    val status = Map(brent -> "Receiver", tamie -> "Giver", kiera -> "Giver", truman -> "Giver", jett -> "Giver")
    val expectedReceivers = List(brent)
    val expectedGivers = List(tamie, kiera, truman, jett)
    val expectedCircle = CircleTest.bday2012.add(expectedReceivers, expectedGivers, brent)
    
    // Now check the stuff...
    // Does the circle have 5 participants
    // Does each user belong to the circle
    assert((expectedReceivers.size + expectedGivers.size)===expectedCircle.participants.size)
    assert(expectedCircle.name==="BDay 2012")
    
    // make sure each person belongs to the right circle
    expectedReceivers.foreach(u => u.circles.foreach(c => {
                                                              assert(c.circleName.toString===expectedCircle.name.toString())
                                                            }
                                                       ))
    
    // make sure each person belongs to the right circle
    expectedGivers.foreach(u => u.circles.foreach(c => {
                                                              assert(c.circleName.toString===expectedCircle.name.toString())
                                                            }
                                                       ))
                     
    // make sure circle has the right participants
    // TODO how to verify correct giver/receiver status?
    expectedCircle.participants.foreach(p => matchPerson(p, status))
                                                       
  }
  
  def matchPerson(p:CircleParticipant, exp:Map[User, String]) = (p.person.obj openOr Empty, p.participationLevel.is) match {
      case (u:User, r) => assert(exp.get(u).getOrElse(false)===r)
      case _ => fail("fail: "+p.person.obj)
    }
}