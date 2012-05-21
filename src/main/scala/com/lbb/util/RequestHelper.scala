package com.lbb.util

/**
 * Originally created to identify those request parameters that do NOT have 
 * a value of 'undefined'  (it's an angularjs thing)
 */
object RequestHelper {

  /**
   * Returns all the request parameters (just the names) that
   * have something other than 'undefined' as its value
   */
  def definedParms(m:Map[String, List[String]]): Map[String, String] = {
    
    // could have combined all this into one long hairy expression
    // but this is easier to follow
    // First, filter out all parameters that have more than one value
    val res1 = m.filter(kv => m.get(kv._1) match {
      case Some(list) if(list.size == 1) => true
      case _ => false
    })
    
    // Of the parameters that only have one value, filter out those
    // that have value of 'undefined'
    val res2 = res1.filter(kv => m.get(kv._1) match {
      case Some(x :: xs) => x != "undefined"
      case None => false
      case _ => false
    })
    
    // Of the remaining, convert the values from List[String]
    // to just String by taking the head of the List (which only
    // has one element anyway)
    res2.map(kv => (kv._1 -> res2.get(kv._1).get.head))
  }
}