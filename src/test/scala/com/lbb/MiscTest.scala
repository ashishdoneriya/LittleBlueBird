package com.lbb
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class MiscTest extends FunSuite with AssertionsForJUnit {

  val FL = """(\w+)\s+(\w+)""".r
  val FML = """(\w+)\s+([^ ]+)\s+(\w+)""".r
    
  test("parse first last") {
    "Brent     Dunklau" match {
      case FL(f, l) => println("FL: f = "+f+", l = "+l)
      case FML(f, m, l) => println("FML: f = "+f+", l = "+l)
      case _ => println("no match")
    }
    
    "Brent  W.....   Dunklau" match {
      case FL(f, l) => println("FL: f = "+f+", l = "+l)
      case FML(f, m, l) => println("FML: f = "+f+", l = "+l)
      case _ => println("no match")
    }
  }
  
}