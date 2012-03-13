package com.lbb.snippet
import scala.xml.NodeSeq
import scala.xml.Group
import com.lbb.User
import net.liftweb.mapper.Cmp
import net.liftweb.mapper.OprEnum
import net.liftweb.common.Full
import net.liftweb.common.Empty
import net.liftweb.http.S

class B {

  def b(xhtml: Group): NodeSeq = {
    
    val users = User.findAll(Cmp(User.username, OprEnum.Like, Full("bdunklau"), Empty, Full("LOWER")))
      
    SessionUser(Full(users.head))
    isSuper(true)
    S.redirectTo("index")
  }
}