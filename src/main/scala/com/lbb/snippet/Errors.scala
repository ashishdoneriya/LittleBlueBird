package com.lbb.snippet
import scala.xml.NodeSeq
import net.liftweb.http.LiftRules
import net.liftweb.http.S
import net.liftweb.common.Box

class Errors {

  def render(xml : NodeSeq) : NodeSeq = {
    S.errors match {
      case Nil => <div></div>
      case l:List[(NodeSeq, Box[String])] => 
        <div class="modal" id="errorModal">
          <div class="modal-header">
            <a class="close" data-dismiss="modal"> <i class="icon-remove"></i> </a>
            <h3>A Few Things to Fix...</h3>
          </div>
          <div class="modal-body">
          {
            for(err <- S.errors) yield 
              <div class="alert alert-error">{err._1}</div>
          }
          </div>
          <div class="modal-footer">
            <a href="#" class="btn" data-dismiss="modal">Close</a>
          </div>
        </div>
      } // S.errors match
    
  }
}