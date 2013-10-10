package com.lbb.entity
import com.lbb.util.LbbLogger
import net.liftweb.mapper.LongKeyedMapper
import net.liftweb.mapper.LongKeyedMetaMapper
import net.liftweb.mapper.MappedLongIndex
import net.liftweb.mapper.MappedLongForeignKey
import net.liftweb.mapper.MappedString
import net.liftweb.mapper.MappedDateTime
import net.liftweb.http.S
import net.liftweb.common.Box
import net.liftweb.http.Req
import java.util.Date
import net.liftweb.mapper.By

/**
 */
class AppVersion extends LongKeyedMapper[AppVersion] with LbbLogger { 

  def getSingleton = AppVersion
  
  def primaryKeyField = id
  
  object id extends MappedLongIndex(this)
  
  object version extends MappedString(this, 32)
  
  // this is where you store messages about upcoming downtime.  Clients poll every minute or so looking for anything here to display to the user
  object downmessage extends MappedString(this, 1024)
}

object AppVersion extends AppVersion with LongKeyedMetaMapper[AppVersion] {
  override def dbTableName = "app_version" // define the DB table name
    
}