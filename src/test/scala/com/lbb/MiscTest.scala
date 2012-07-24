package com.lbb
import java.util.Date
import scala.annotation.target.field
import org.junit.runner.RunWith
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.junit.JUnitRunner
import org.scalatest.FunSuite
import com.lbb.entity.User
import com.lbb.gui.MappedDateExtended
import com.lbb.util.MapperHelper
import com.lbb.util.RequestHelper
import net.liftweb.common.Box
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.MappedField
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.Mapper
import net.liftweb.mapper.QueryParam
import net.liftweb.util.BaseField
import net.liftweb.common.Full
import net.liftweb.common.Empty
import javax.swing.ImageIcon
import java.net.URL
import com.lbb.entity.Gift
import com.lbb.util.Util

@RunWith(classOf[JUnitRunner])
class MiscTest extends FunSuite with AssertionsForJUnit {
  
  test("circle type enums") {
    val en = TypeOfCircle.withName("Christmas")
    assert(en===TypeOfCircle.christmas)
    
    TypeOfCircle.values.find(p => p.toString().equals("Christmas")) match {
      case None => println("MiscTest: did not find Christmas enum")
      case Some(e) => println("MiscTest: found this enum: "+e)
    }
    
    TypeOfCircle.values.find(p => p.toString().equals("xxxxx")) match {
      case None => println("MiscTest: did not find xxxxx enum")
      case Some(eee) => println("MiscTest: found this enum: "+eee)
    }
  }
  
  /**
   * The map of Strings to List[String] represents all request parameters.
   * We're looking for those request parameters that have only one value
   * and whose value is not 'default'
   */
  test("find non-'default' request parameters") {
    val m = Map("first" -> List("undefined"), "last" -> List("Dunklau"), "multi" -> List("val1", "val2"))
    
    val defined = RequestHelper.definedParms(m)
    
    assert(defined.size===1)
    assert(defined.head._1==="last")
  }
  
  /**
   * This tests the creation of QueryParams
   */
  test("MapperHelper.convert") {
    val inputparms = Map("first" -> List("Scott"), "last" -> List("Tiger"), "dateOfBirth" -> List("12/31/1995"), 
        "username" -> List("stiger"), "foo" -> List("foo"), "email" -> List("undefined"), "password" -> List("somepass"))
    // password not expected because mapper won't let you query by password
    val expparms = Map("first" -> "Scott", "last" -> "Tiger", "username" -> "stiger")   
    val queryParams = MapperHelper.convert(inputparms, User.queriableFields)
    
    assert(expparms.size===queryParams.size)
    
    queryParams.foreach(qp => {
      println("MiscTest: inputparms.keySet.contains("+qp.field.name+")...")
      assert(inputparms.keySet.contains(qp.field.name)===true)
      
      val actvalue = qp.value.openOr("no actual value for field: "+qp.field.name)
      val expvalue = expparms.get(qp.field.name).getOrElse("no expected value for field: "+qp.field.name)
      val sameanddefined = expvalue.equalsIgnoreCase(actvalue) && expvalue != "undefined"      
      
      println("MiscTest: field: "+qp.field.name+":  actual vs exp values: "+actvalue + " vs " + expvalue)
        
      assert(sameanddefined===true)
    })
    
  }
  
  test("date") {
    println("1324792800 = "+new Date(1324792800L))
  }
  
  test("2 search terms") {
    val s = Full("bre   dun")
    val terms = RequestHelper.searchTerms(s)
    assert(terms.size===2)
    assert(terms.head==="bre")
    assert(terms.tail===List("dun"))
  }
  
  test("1 search term") {
    val s = Full("bre")
    val terms = RequestHelper.searchTerms(s)
    assert(terms.size===1)
    assert(terms.head==="bre")
    
    val l = List("a")
    val h = l.head;
    val t = l.tail;
  }
  
  test("1 search term + whitespace") {
    val s = Full("bre  ")
    val terms = RequestHelper.searchTerms(s)
    assert(terms.size===1)
    assert(terms.head==="bre")
    
    val l = List("a")
    val h = l.head;
    val t = l.tail;
  }
  
  test("space + term + space") {
    val s = Full("   bre  ")
    val terms = RequestHelper.searchTerms(s)
    assert(terms.size===1)
    assert(terms.head==="bre")
    
    val l = List("a")
    val h = l.head;
    val t = l.tail;
  }
  
  test("space + term + space + term + space") {
    val s = Full("  bre   dun  ")
    val terms = RequestHelper.searchTerms(s)
    assert(terms.size===2)
    assert(terms.head==="bre")
    assert(terms.tail===List("dun"))
  }
  
  test("for") {
    val m1 = Map("id"->1, "name"->"Brent")
    val m2 = Map("id"->2, "name"->"Brent")
    val m3 = Map("id"->3, "name"->"Brent")
    val m4 = Map("name"->"Brent")
    val l = List(m1, m2, m3, m4)
    
    val ids = for(m <- l;
                  kv <- m if(kv._1 == "id")) yield kv._2
    val exp = List(1,2,3)
    assert(ids == exp)
  }
  
  test("image size") {
    val icon = new ImageIcon(new URL("http://profile.ak.fbcdn.net/hprofile-ak-snc4/49942_569956369_5862059_n.jpg"))
    val h = icon.getIconHeight()
    val w = icon.getIconWidth()
    println("h = "+h+"   w = "+w)
  }
  
  test("list to set") {
    val list = List(1, 2, 2, 3, 4)
    val set = list.toSet
    println(set)
  }
  
  test("pretty string from List") {
    assert("one, two, three and four"===Util.toStringPretty(List("one", "two", "three", "four")))
    assert("one, two and three"===Util.toStringPretty(List("one", "two", "three")))
    assert("one and two"===Util.toStringPretty(List("one", "two")))
    assert("one"===Util.toStringPretty(List("one")))
    assert(""===Util.toStringPretty(List("")))
    assert(""===Util.toStringPretty(List()))
    assert(""===Util.toStringPretty(Nil))
  }
  
  test("?") {
    val list1 = List(1,2,3,4,5)
    val list2 = List(2,3,4,5,6)
    val list3 = List(3,4,5,6,7)
    val list4 = List(4,5,6,7,8)
    val list = List(list1, list2, list3, list4)
    
    val ints = for(ll <- list; ii <- ll) yield {
      ii
    }
    

    val sect = list.foldLeft[List[Int]](ints)((a,b)=>a.intersect(b))
    println("sect:  "+sect)
    
    
  }
  
}
