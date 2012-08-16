package com.lbb.util

abstract class AffLinkCreator {
  def createLink(url:String):String
}

object AmazonLinkCreator extends AffLinkCreator {
  def createLink(url:String) = {
    val sym = if(url.contains("?")) "&" else "?"
    url + sym + "tag=wwwlittleb040-20"
  }
}

object NoopLinkCreator extends AffLinkCreator {
  def createLink(url:String) = url
}