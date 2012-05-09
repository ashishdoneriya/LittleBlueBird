package com.lbb
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import com.lbb.util.RequestHelper
import com.lbb.entity.User
import scala.annotation.target.field
import net.liftweb.common.Full
import net.liftweb.common.Empty
import com.lbb.util.MapperHelper
import org.joda.time.DateTime
import java.util.Date
import java.util.GregorianCalendar
import java.text.SimpleDateFormat
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedDate
import net.liftweb.mapper.Mapper
import net.liftweb.mapper.MappedField
import com.lbb.gui.MappedDateExtended
import net.liftweb.mapper.MappedPassword
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.OprEnum
import net.liftweb.mapper.By
import net.liftweb.util.BaseField
import net.liftweb.mapper.QueryParam
import net.liftweb.json.JsonAST.JField
import net.liftweb.json.JsonAST.JString
import net.liftweb.json.JsonAST
import net.liftweb.http.js.JE.Str
import net.liftweb.http.js.JsExp
import com.lbb.entity.Gift
import net.liftweb.common.Box
import com.lbb.entity.Circle

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
}