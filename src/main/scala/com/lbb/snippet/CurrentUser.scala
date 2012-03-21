package com.lbb.snippet
import scala.xml.NodeSeq

import com.lbb.User

import net.liftweb.common.Box
import net.liftweb.common.Empty
import net.liftweb.util.Helpers.bind
import net.liftweb.util.Helpers.strToSuperArrowAssoc

class CurrentUser {

  def name(xhtml: NodeSeq): NodeSeq = {
    val box = SessionUser.is
    bind("f", xhtml, box match {
      case Empty => "name" -> "Not Logged In"
      case b:Box[User] => "name" -> (b.open_!.first + " " + b.open_!.last)
      case _ => "name" -> "Not Logged In"
    })
  }
}