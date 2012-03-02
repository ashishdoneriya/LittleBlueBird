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

@RunWith(classOf[JUnitRunner])
class RecipientTest extends FunSuite with AssertionsForJUnit {
  
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

  test("create Recipient with Mapper") {
    
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
    
    val lastXmas = CircleTest.lastXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val nextXmas = CircleTest.nextXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val anniv2012 = CircleTest.anniv2012.add(List(brent, tamie), List(kiera, truman, jett), brent)
    val bday2012 = CircleTest.bday2012.add(List(brent), List(tamie, kiera, truman, jett), brent)
    
    // I add to my list
    val gift1 = Gift.create.description("gift1").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // I add to someone else's list
    val gift2 = Gift.create.description("gift2").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // I add a joint gift to me and tamie
    val gift3 = Gift.create.description("gift3").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // I add a joint gift to for kiera, truman and jett
    val gift4 = Gift.create.description("gift4").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // more to my list
    val gift5 = Gift.create.description("gift5").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // more to my list
    val gift6 = Gift.create.description("gift6").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // more to my list
    val gift7 = Gift.create.description("gift7").url("www.bn.com").circle(nextXmas).addedBy(brent)
    
    // anniv gifts
    val gift8 = Gift.create.description("gift8").url("www.bn.com").circle(anniv2012).addedBy(brent)
    
    // anniv gifts
    val gift9 = Gift.create.description("gift9").url("www.bn.com").circle(anniv2012).addedBy(brent)
    
    // kiera adds something for me and tamie
    val gift10 = Gift.create.description("gift10").url("www.bn.com").circle(anniv2012).addedBy(kiera)
    
    // gifts bought last Xmas
    val gift11 = Gift.create.description("gift11").url("www.bn.com").circle(lastXmas).addedBy(brent).sender(tamie)
    tamie.buy(gift11)
    
    // gifts bought last Xmas
    val gift12 = Gift.create.description("gift12").url("www.bn.com").circle(lastXmas).addedBy(brent).sender(brent)
    
    // gifts bought last Xmas
    val gift13 = Gift.create.description("gift13").url("www.bn.com").circle(lastXmas).addedBy(brent).sender(brent)
    
    // gifts bought last Xmas
    val gift14 = Gift.create.description("gift14").url("www.bn.com").circle(lastXmas).addedBy(brent).sender(kiera)
    
    // gifts bought last Xmas
    val gift15 = Gift.create.description("gift15").url("www.bn.com").circle(lastXmas).addedBy(brent).sender(truman)
    
    // gifts bought THIS Xmas - so they should appear on the recipients list when the viewer is the recipient
    // but the gift should not appear when the viewer is not the recipient
    val gift16 = Gift.create.description("gift16").url("www.bn.com").circle(nextXmas).addedBy(brent).sender(tamie)
    
    // gifts bought THIS Xmas - so they should appear on the recipients list when the viewer is the recipient
    // but the gift should not appear when the viewer is not the recipient
    val gift17 = Gift.create.description("gift17").url("www.bn.com").circle(nextXmas).addedBy(brent).sender(kiera)
    

    
    // save the gifts
    val gifts = List(gift1, gift2, gift3, gift4, gift5, gift6, gift7, gift8, gift9, gift10, 
        gift11, gift12, gift13, gift14, gift15, gift16, gift17)
    
    gifts foreach {g => assert(g.save===true)}
    
    // says who the gifts are for...
    val savethese = Map(
        brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10, gift11, gift14, gift16, gift17), 
        tamie -> Set(gift3, gift2, gift8, gift9, gift10, gift12, gift15, gift17), 
        kiera -> Set(gift4, gift13), 
        truman -> Set(gift4, gift13), 
        jett -> Set(gift4, gift13))
    
    //reverses the map
    val recipientMap = savethese.values.toSet.flatten.map(v => (v, savethese.keys.filter(savethese(_).contains(v)))).toMap // savethese groupBy {_._2} map {case (key,value) => (key, value.unzip._1)} //Map(gift1 -> List(brent), gift2 -> List(tamie), gift3 -> List(brent, tamie), gift4 -> List(kiera, truman, jett), gift5 -> List(brent), gift6 -> List(brent), gift7 -> List(brent))
    

    savethese foreach {
      kv => { 
        kv._2 foreach { g => assert(g.addRecipient(kv._1)===true) } //Recipient.create.person(kv._1).gift(g).save===true) } 
      } 
    }

    val whateachsees: Map[(User, Circle), Map[User, Set[Gift]]] = Map(
        // i can see everything because i added everything - no one added to my list
        (brent, nextXmas) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift16, gift17), 
                tamie -> Set(gift3, gift2, gift8, gift9, gift17), 
                kiera -> Set(gift4), 
                truman -> Set(gift4), 
                jett -> Set(gift4)),
        // tamie can't see gift2 because i added it
        // she CAN see gift3 even though i added it because it's for the both of us
        (tamie, nextXmas) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift17), 
                tamie -> Set(gift3, gift8, gift9, gift17), 
                kiera -> Set(gift4), 
                truman -> Set(gift4), 
                jett -> Set(gift4)),
        // kiera, truman and jett don't see gift4 on any list because it was added by me
        (kiera, nextXmas) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift10), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
        (truman, nextXmas) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift10), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
        (jett, nextXmas) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift10), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
         // view of xmas 2011 lists...
        (brent, lastXmas) -> 
            Map(brent -> Set(gift11, gift14), 
                tamie -> Set(gift12, gift15), 
                kiera -> Set(gift13), 
                truman -> Set(gift13), 
                jett -> Set(gift13)),
        (tamie, lastXmas) -> 
            Map(brent -> Set(gift11, gift14), 
                tamie -> Set(gift12, gift15),  
                kiera -> Set(gift13), 
                truman -> Set(gift13), 
                jett -> Set(gift13)),
        (kiera, lastXmas) -> 
            Map(brent -> Set(gift11, gift14),
                tamie -> Set(gift12, gift15),  
                kiera -> Set(gift13), 
                truman -> Set(gift13), 
                jett -> Set(gift13)),
        (truman, lastXmas) -> 
            Map(brent -> Set(gift11, gift14), 
                tamie -> Set(gift12, gift15), 
                kiera -> Set(gift13), 
                truman -> Set(gift13), 
                jett -> Set(gift13)),
        (jett, lastXmas) -> 
            Map(brent -> Set(gift11, gift14), 
                tamie -> Set(gift12, gift15),  
                kiera -> Set(gift13), 
                truman -> Set(gift13), 
                jett -> Set(gift13)),
         // view of anniv 2012 lists...
        (brent, anniv2012) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift16, gift17), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift17), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
        (tamie, anniv2012) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift17), 
                tamie -> Set(gift3, gift8, gift9, gift17), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
        (kiera, anniv2012) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift10), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
        (truman, anniv2012) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift10), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set()),
        (jett, anniv2012) -> 
            Map(brent -> Set(gift5, gift7, gift6, gift1, gift3, gift8, gift9, gift10), 
                tamie -> Set(gift2, gift3, gift8, gift9, gift10), 
                kiera -> Set(), 
                truman -> Set(), 
                jett -> Set())
                )
    
    // now check everyone's gifts and make sure they look right...
    List((brent, nextXmas), 
        (tamie, nextXmas), 
        (kiera, nextXmas), 
        (truman, nextXmas), 
        (jett, nextXmas),
        (brent, lastXmas), 
        (tamie, lastXmas), 
        (kiera, lastXmas), 
        (truman, lastXmas), 
        (jett, lastXmas),
        (brent, anniv2012), 
        (tamie, anniv2012), 
        (kiera, anniv2012), 
        (truman, anniv2012), 
        (jett, anniv2012)) foreach { tuple => checkGifts(tuple, whateachsees) }

    // now check each gift and make sure the recipients are right
    gifts foreach { g => checkRecipients(g, recipientMap) }
  }
  
  /**
   * Create a list of sorted strings (gift descriptions) so that we can just do === on 2 lists
   */
  def checkGifts(tuple:(User, Circle), whateachsees:Map[(User, Circle), Map[User, Set[Gift]]]) = {
    val perspective:Map[User, Set[Gift]] = whateachsees.get(tuple).get
    
    perspective.foreach( kv => {
      val expDesc = perspective.get(kv._1).get.toList.map(_.description.is).sortWith(_ < _)
      
      val viewer = tuple._1
      val circle = tuple._2
      
      val actDesc = kv._1.giftlist(viewer, circle).map(_.description.is).sortWith(_ < _)
      
      println("checking "+viewer.first+"'s view of "+kv._1.first+"'s "+circle.name+" list...")
      
      expDesc foreach {g => println("expected gifts: "+g)}
      
      actDesc foreach {g => println("actual gifts: "+g)}
      
      assert(expDesc===actDesc)
    })

  }
  
  def checkRecipients(g:Gift, recipientMap:Map[Gift, Iterable[User]]) = {
    val expName = recipientMap.get(g).get.toList.map(_.first.is).sortWith(_ < _)
    
    val actName = g.recipients.map(_.person.obj.map(_.first.is).open_!).sortWith(_ < _)

    println("checking recipients of gift: "+g.description)
    
    expName foreach {r => println("expected recipient: "+r)}

    actName foreach {r => println("actual recipient: "+r)}
    
    assert(expName===actName)
  }
}