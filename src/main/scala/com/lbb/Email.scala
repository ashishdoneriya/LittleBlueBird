package com.lbb

case class Email(to:String, fromemail:String, fromname:String, subject:String, message:String, cc:List[String], bcc:List[String])