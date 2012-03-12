package com.lbb
import java.text.SimpleDateFormat
import java.util.Date

object PopulateDb {

  def doit = {
    
    Recipient.findAll.foreach(_.delete_!)
    Gift.findAll.foreach(_.delete_!)
    CircleParticipant.findAll.foreach(_.delete_!)
    Circle.findAll.foreach(_.delete_!)
    User.findAll.foreach(_.delete_!)
    
    val brent = createBrent
    val tamie = createTamie
    val kiera = createKiera
    val truman = createTruman
    val jett = createJett
    
    
    val lastXmas = _lastXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val nextXmas = _nextXmas.add(List(brent, tamie, kiera, truman, jett), brent)
    val anniv2012 = _anniv2012.add(List(brent, tamie), List(kiera, truman, jett), brent)
    val bday2012 = _bday2012.add(List(brent), List(tamie, kiera, truman, jett), brent)
    
    
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
    
    gifts foreach {_.save}
    
    
    
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
        kv._2 foreach { _.addRecipient(kv._1) } 
      } 
    }
  }
  
  
  val brent = ("Brent", "Dunklau", "bdunklau", "123456789", "bdunklau@yahoo.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("12/15/1970"))
  
  
  def createBrent = {
    val user = createUser(brent._1, brent._2, brent._3, brent._4, brent._5, brent._6, brent._7)
    user.save
    user
  }
  
  def createTamie = {
    val user = createUser("Tamie", "Dunklau", "tamie", "123456789", "xxxxxx@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("10/10/1976"))
    user.save
    user
  }
  
  def createKiera = {
    val user = createUser("Kiera", "Daniell", "kiera", "123456789", "xxxxxx@gmail.com", "i am great", new SimpleDateFormat("MM/dd/yyyy").parse("9/16/2001"))
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
  
  def _lastXmas = {
    val circle = Circle.create.circleType("Christmas").name("Christmas 2011").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2011"))
    circle.save
    circle
  }
  
  def _nextXmas = {
    val circle = Circle.create.circleType("Christmas").name("Christmas 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2012"))
    circle.save
    circle
  }
  
  def _anniv2012 = {
    val circle = Circle.create.circleType("Anniversary").name("Anniversary 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("06/28/2012"))
    circle.save
    circle
  }
  
  def _bday2012 = {
    val circle = Circle.create.circleType("Birthday").name("BDay 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/2012"))
    circle.save
    circle
  }
  
}