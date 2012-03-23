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

@RunWith(classOf[JUnitRunner])
class CircleTest extends FunSuite with AssertionsForJUnit {

  def initDb = {
    // this stuff goes in Boot.scala
    val vendor = 
	new StandardDBVendor(Props.get("db.driver") openOr "com.mysql.jdbc.Driver",
			     Props.get("db.url") openOr 
			     "jdbc:mysql://localhost:3306/littlebluebird",
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
  
  test("test circle types") {
    import com.lbb.TypeOfCircle
    TypeOfCircle.values foreach {t => {println("Circle type:  "+t)}}
  }
}

object CircleTest extends CircleTest {
  
  def lastXmas = {
    val circle = Circle.create.circleType("Christmas").name("Christmas 2011").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2011"))
    circle.save
    circle
  }
  
  def nextXmas = {
    val circle = Circle.create.circleType("Christmas").name("Christmas 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/25/2012"))
    circle.save
    circle
  }
  
  def anniv2012 = {
    val circle = Circle.create.circleType("Anniversary").name("Anniversary 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("06/28/2012"))
    circle.save
    circle
  }
  
  def bday2012 = {
    val circle = Circle.create.circleType("Birthday").name("BDay 2012").date(new SimpleDateFormat("MM/dd/yyyy").parse("12/15/2012"))
    circle.save
    circle
  }

}