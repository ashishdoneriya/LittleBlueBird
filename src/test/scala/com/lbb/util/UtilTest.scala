package com.lbb.util
import org.scalatest.junit.AssertionsForJUnit
import org.scalatest.FunSuite
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import javax.swing.ImageIcon
import java.net.URL

@RunWith(classOf[JUnitRunner])
class UtilTest extends FunSuite with AssertionsForJUnit with LbbLogger {

  // testing the 'no profile pic' image
  test("adjusted dimensions 1") {
    val profilepicUrl = new URL("http://sphotos.xx.fbcdn.net/hphotos-snc6/155781_125349424193474_1654655_n.jpg")
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    assert(126===profilepicheight)
    assert(200===profilepicwidth)
    val adjustedheight = Util.calculateAdjustedHeight(150, profilepicUrl) 
    val adjustedwidth = Util.calculateAdjustedWidth(150, profilepicUrl)
    assert(150===adjustedheight)
    assert(238===adjustedwidth)
    val margintop = Util.calculateMarginTop(150, profilepicUrl)
    val marginleft = Util.calculateMarginLeft(150, profilepicUrl)
    assert("0px"===margintop)
    assert("-44px"===marginleft)
  }

  // testing a 640x480 image
  test("adjusted dimensions 2") {
    val profilepicUrl = new URL("https://sphotos-b.xx.fbcdn.net/hphotos-ash3/643996_10200122580774007_1126388505_n.jpg")
    val img = new ImageIcon(profilepicUrl)	
    val profilepicheight = img.getIconHeight()
    val profilepicwidth = img.getIconWidth()
    assert(640===profilepicheight)
    assert(480===profilepicwidth)
    val adjustedheight = Util.calculateAdjustedHeight(150, profilepicUrl)
    val adjustedwidth = Util.calculateAdjustedWidth(150, profilepicUrl)
    assert(200===adjustedheight)
    assert(150===adjustedwidth)
    val margintop = Util.calculateMarginTop(150, profilepicUrl)
    val marginleft = Util.calculateMarginLeft(150, profilepicUrl)
    assert("-25px"===margintop)
    assert("0px"===marginleft)
  }
  
}