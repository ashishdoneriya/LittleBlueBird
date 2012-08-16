package com.lbb.util
import com.lbb.entity.Gift

trait UrlListener {

  def createAffLink(gift:Gift) = {
    val affurl = Util.createAffLink(gift.url)
    gift.affiliateUrl(affurl)
  }
  
}