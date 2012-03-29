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
import com.lbb.entity.CircleParticipant
import com.lbb.entity.Gift
import com.lbb.entity.Recipient
import com.lbb.entity.User

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
    val brenda1 = UserTest.createBrenda1
    val brenda2 = UserTest.createBrenda2
    val bill = UserTest.createBill
    
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
    val gift11 = Gift.create.description("gift11").url("www.bn.com").circle(lastXmas).addedBy(brent)
    tamie.buy(gift11)
    
    // gifts bought last Xmas
    val gift12 = Gift.create.description("gift12").url("www.bn.com").circle(lastXmas).addedBy(brent)
    brent.buy(gift12)
    
    // gifts bought last Xmas
    val gift13 = Gift.create.description("gift13").url("www.bn.com").circle(lastXmas).addedBy(brent)
    brent.buy(gift13)
    
    // gifts bought last Xmas
    val gift14 = Gift.create.description("gift14").url("www.bn.com").circle(lastXmas).addedBy(brent)
    kiera.buy(gift14)
    
    // gifts bought last Xmas
    val gift15 = Gift.create.description("gift15").url("www.bn.com").circle(lastXmas).addedBy(brent)
    truman.buy(gift15)
    
    // gifts bought THIS Xmas - so they should appear on the recipients list when the viewer is the recipient
    // but the gift should not appear when the viewer is not the recipient
    val gift16 = Gift.create.description("gift16").url("www.bn.com").circle(nextXmas).addedBy(brent)
    tamie.buy(gift16)
    
    // gifts bought THIS Xmas - so they should appear on the recipients list when the viewer is the recipient
    // but the gift should not appear when the viewer is not the recipient
    val gift17 = Gift.create.description("gift17").url("www.bn.com").circle(nextXmas).addedBy(brent)
    kiera.buy(gift17)
    

    
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
    
    val canEdit = true; val cannotEdit = false;
    val canDelete = true; val cannotDelete = false;
    val canBuy = true; val cannotBuy = false;
    val canReturn = true; val cannotReturn = false;

    

    // these are just the available gifts - Need to create 2 other collections of "stuff I'm buying" and "stuff others are giving"
    val whateachsees: Map[(User, Circle), Map[User, Seq[(Gift,Boolean,Boolean,Boolean,Boolean)]]] = Map(
        // i can see everything because i added everything - no one added to my list
        (brent, nextXmas) -> 
            Map(brent -> Seq((gift5, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift7, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift6, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift1, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift16, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                tamie -> Seq((gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift2, canEdit, canDelete, canBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                kiera -> Seq((gift4, canEdit, canDelete, canBuy, cannotReturn)), 
                truman -> Seq((gift4, canEdit, canDelete, canBuy, cannotReturn)), 
                jett -> Seq((gift4, canEdit, canDelete, canBuy, cannotReturn))),
                
        // tamie can't see gift2 because i added it
        // she CAN see gift3 even though i added it because it's for the both of us
        (tamie, nextXmas) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                tamie -> Seq((gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                kiera -> Seq((gift4, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                truman -> Seq((gift4, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                jett -> Seq((gift4, cannotEdit, cannotDelete, canBuy, cannotReturn))),
                
        // kiera, truman and jett don't see gift4 on any list because it was added by me
        (kiera, nextXmas) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, canEdit, canDelete, canBuy, cannotReturn)), 
                tamie -> Seq((gift2, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, canEdit, canDelete, canBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
                
        (truman, nextXmas) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                tamie -> Seq((gift2, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
                
        (jett, nextXmas) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                tamie -> Seq((gift2, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
                
         // view of xmas 2011 lists...
        (brent, lastXmas) -> 
            Map(brent -> Seq((gift11, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift14, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                tamie -> Seq((gift12, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift15, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                kiera -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                truman -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                jett -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn))),
                
        (tamie, lastXmas) -> 
            Map(brent -> Seq((gift11, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift14, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                tamie -> Seq((gift12, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift15, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),  
                kiera -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                truman -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                jett -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn))),
                
        (kiera, lastXmas) -> 
            Map(brent -> Seq((gift11, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift14, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),
                tamie -> Seq((gift12, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift15, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),  
                kiera -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                truman -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                jett -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn))),
                
        (truman, lastXmas) -> 
            Map(brent -> Seq((gift11, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift14, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),
                tamie -> Seq((gift12, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift15, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),  
                kiera -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                truman -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                jett -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn))),
                
        (jett, lastXmas) -> 
            Map(brent -> Seq((gift11, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift14, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),
                tamie -> Seq((gift12, cannotEdit, cannotDelete, cannotBuy, cannotReturn), 
                             (gift15, cannotEdit, cannotDelete, cannotBuy, cannotReturn)),  
                kiera -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                truman -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn)), 
                jett -> Seq((gift13, cannotEdit, cannotDelete, cannotBuy, cannotReturn))),
                
         // view of anniv 2012 lists...
        (brent, anniv2012) -> 
            Map(brent -> Seq((gift5, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift7, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift6, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift1, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift16, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                tamie -> Seq((gift2, canEdit, canDelete, canBuy, cannotReturn),
                             (gift3, canEdit, canDelete, cannotBuy, cannotReturn),
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn),
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn),
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
                
        (tamie, anniv2012) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                tamie -> Seq((gift3, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift8, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift9, canEdit, canDelete, cannotBuy, cannotReturn), 
                             (gift17, canEdit, canDelete, cannotBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
                
        (kiera, anniv2012) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, canEdit, canDelete, canBuy, cannotReturn)), 
                tamie -> Seq((gift2, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, canEdit, canDelete, canBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
        (truman, anniv2012) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)),
                tamie -> Seq((gift2, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq()),
                
        (jett, anniv2012) -> 
            Map(brent -> Seq((gift5, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift7, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift6, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift1, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)),
                tamie -> Seq((gift2, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift3, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift8, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift9, cannotEdit, cannotDelete, canBuy, cannotReturn), 
                             (gift10, cannotEdit, cannotDelete, canBuy, cannotReturn)), 
                kiera -> Seq(), 
                truman -> Seq(), 
                jett -> Seq())
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
  def checkGifts(tuple:(User, Circle), whateachsees:Map[(User, Circle), Map[User, Seq[(Gift,Boolean,Boolean,Boolean,Boolean)]]]) = {
    val perspective:Map[User, Seq[(Gift,Boolean,Boolean,Boolean,Boolean)]] = whateachsees.get(tuple).get
    
    perspective.foreach( kv => {
      val giftInfos:Seq[(Gift,Boolean,Boolean,Boolean,Boolean)] = perspective.get(kv._1).get
      
      val expDescriptions = giftInfos.toList.map(_._1.description.is).sortWith(_ < _)
      val recipient = kv._1
      val viewer = tuple._1
      val circle = tuple._2
      
      val giftlist = recipient.giftlist(viewer, circle)
      val actDescriptions = giftlist.map(_.description.is).sortWith(_ < _)
      
      println("checking "+viewer.first+"'s view of "+recipient.first+"'s "+circle.name+" list...")
      
      expDescriptions foreach {g => println("expected gifts: "+g)}
      
      actDescriptions foreach {g => println("actual gifts: "+g)}
      
      assert(expDescriptions===actDescriptions)
      
      giftlist.foreach( g => assertCorrectBooleans(g, giftInfos, viewer))
    })

  }
  
  private def assertCorrectBooleans(actualGift:Gift, giftInfos:Seq[(Gift,Boolean,Boolean,Boolean,Boolean)], viewer:User) = {
    val seq = giftInfos.filter(_._1.description.is.equals(actualGift.description.is))
    // if this fails, our test setup is wrong - we depend upon the gifts having unique descriptions
    assert(seq.size===1)
    val expectedGiftInfo = seq.head
    val expectedCanEdit = expectedGiftInfo._2
    val expectedCanDelete = expectedGiftInfo._3
    val expectedCanBuy = expectedGiftInfo._4
    val expectedCanReturn = expectedGiftInfo._5
    println("Can "+viewer.first.is+" edit "+actualGift.description.is+"...")
    assert(expectedCanEdit===viewer.canEdit(actualGift))
    
    println("Can "+viewer.first.is+" delete "+actualGift.description.is+"...")
    assert(expectedCanDelete===viewer.canDelete(actualGift))
    
    println("Can "+viewer.first.is+" buy "+actualGift.description.is+"...")
    assert(expectedCanBuy===viewer.canBuy(actualGift))
    
    println("Can "+viewer.first.is+" return "+actualGift.description.is+"...")
    assert(expectedCanReturn===viewer.canReturn(actualGift))
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