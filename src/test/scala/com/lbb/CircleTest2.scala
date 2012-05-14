package com.lbb
import net.liftweb.db.StandardDBVendor
import net.liftweb.mapper.Schemifier
import net.liftweb.mapper.DB
import com.lbb.entity.Circle
import com.lbb.entity.Gift
import net.liftweb.util.Props
import net.liftweb.db.DefaultConnectionIdentifier
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Recipient
import net.liftweb.common.Box
import com.lbb.entity.User
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner

/**
 * Originally created to test the containsAll() method in Circle.
 * RecipientTest was getting too big, so created this class.
 * But really, this test class needs the same kind of setup as
 * RecipientTest
 */
@RunWith(classOf[JUnitRunner])
class CircleTest2 extends FunSuite with AssertionsForJUnit {
  
  // TODO create a real db pool
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
    Schemifier.schemify(true, Schemifier.infoF _, Gift)
    Schemifier.schemify(true, Schemifier.infoF _, Recipient)
        
        
  }
  
  /**
   * Test containsAll() method on circle.  We want to know if a 
   * circle contains all the recipients of a gift, and if those
   * recipients are all "receivers" in the circle
   * <P>
   * This method is useful for circles where not everyone receives.
   * We don't want to show gifts for me and Tamie in my birthday 
   * circle.  My birthday circle should only show gifts that are 
   * for me alone.  And even though Tamie is a participant (giver)
   * in my bday circle, she is not a receiver and that's what we
   * need to check for.
   */
  test("containsAll") {
    
    initDb
        
    Recipient.findAll.foreach(_.delete_!)
    assert(Recipient.findAll.size===0)
        
    Gift.findAll.foreach(_.delete_!)
    assert(Gift.findAll.size===0)
        
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
    val brenda1 = UserTest.createBrenda1
    val brenda2 = UserTest.createBrenda2
    val bill = UserTest.createBill
    
    val xmas = CircleTest.nextXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val anniv = CircleTest.anniv2012.add(List(brent, tamie), List(kiera, truman, jett), brent)
    val bday = CircleTest.bday2012.add(List(brent), List(tamie, kiera, truman, jett, brenda1), brent)
    
    // for me and Tamie - should appear in the xmas circle but not my bday circle
    val gift1 = Gift.create.description("gift1").url("www.bn.com").circle(xmas).addedBy(brent)
    
    // for me and Mom - should not appear in the bday circle because Mom is not a receiver
    // in that circle, only a giver.  Should not appear in the xmas circle either because she is not a 
    // member in that circle.  Ditto for the anniv circle
    val gift2 = Gift.create.description("gift2").url("www.bn.com").circle(xmas).addedBy(brent)
    
    
    // need to save the gifts before we can test...
    val gifts = List(gift1, gift2)
    
    gifts foreach {g => assert(g.save===true)}
    
    
    // says who the gifts are for...
    val savethese = Map(
        brent -> Set(gift1, gift2), 
        tamie -> Set(gift1), 
        kiera -> Set(), 
        truman -> Set(), 
        jett -> Set(),
        brenda1 -> Set(gift2))
        
    savethese foreach {
      kv => { 
        kv._2 foreach { g => assert(g.addRecipient(kv._1)===true) } 
      } 
    }
    val cansee = true; val cannotsee = false;
    val exp = Map((gift1, xmas) -> cansee, 
                  (gift1, anniv) -> cansee, 
                  (gift1, bday) -> cannotsee,
                  (gift2, xmas) -> cannotsee, 
                  (gift2, anniv) -> cannotsee, 
                  (gift2, bday) -> cannotsee)
                  
    exp foreach {
      kv => {
        val gift = kv._1._1
        val circle = kv._1._2
        val actual = circle.containsAll(gift.recipientList)
        println("Circle: "+circle.name+"  Gift: "+gift.description+": circle.containsAll()? "+actual+" (expected: "+kv._2+")")
        assert(actual===kv._2)
      }
    }
  }


}