package com.lbb.util
import net.liftweb.mapper.QueryParam
import com.lbb.entity.User
import net.liftweb.mapper.Cmp
import net.liftweb.common.Full
import net.liftweb.mapper.OprEnum
import net.liftweb.common.Empty
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedField

object MapperHelper {

  def convert(m:Map[String, List[String]], queriableFields:List[MappedString[User]]) = {
    
    val qq = RequestHelper.definedParms(m).filter(kv => queriableFields.map(_.name).contains(kv._1))
    
    val qparms = qq.map(kv => {
      val name = kv._1
      val value = kv._2.toLowerCase
      val field = queriableFields.find(q => q.name==name).get
      Cmp(field, OprEnum.Like, Full(value), Empty, Full("LOWER"))
    })
    
    qparms.toList
    
  }
  
}