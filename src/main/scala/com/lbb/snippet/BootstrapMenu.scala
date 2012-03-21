package com.lbb.snippet
import scala.xml.NodeSeq
import net.liftweb.http.LiftRules
import net.liftweb.http.S
import scala.xml.Text
import net.liftweb.sitemap.MenuItem

// http://groups.google.com/group/liftweb/browse_thread/thread/302623c7e0e0e0c4/99775e0358dfa6f7?show_docid=99775e0358dfa6f7
class BootstrapMenu {
def render(in: NodeSeq): NodeSeq = {
    val menuEntries =
      (for {sm <- LiftRules.siteMap; req <- S.request} yield
        sm.buildMenu(req.location).lines) openOr Nil

    <ul class="nav nav-list">
      {
        for (item <- menuEntries) yield {
          
          item.text match {
            case Text("My Events") => events(item)
            case Text("Past Events") => events(item)
            case _ => {
	          var styles = item.cssClass openOr ""
	
	          if (item.current) styles += " active"
	
	          <li class={styles}><a href={item.uri}>{item.text}</a></li>
              
            } // case _
            
          } //item.text match
          
        } // for (item <- menuEntries)
        
      }
    </ul>

  }

  private def events(item:MenuItem):NodeSeq = {
    val header = <li class="nav-header">{item.text}</li>
	
	 val submenus = item.kids match {
	   case Nil => Nil
	
	   case kids => for(kid <- kids) yield {
	     var styles = item.cssClass openOr ""
	     if(kid.current || kid.uri.toString() == S.uri.toString()) {
	       styles += " active"       	              
	     }
	     <li class={styles}> 
           <a href={kid.uri}>{kid.text}</a>
         </li>
	              
	   } // for(kid <- kids)
	            
	 } // item.kids match
              
     (header :: submenus.toList).flatten    
  }

} 