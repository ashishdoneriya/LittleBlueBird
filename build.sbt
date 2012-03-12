name := "LittleBlueBird"

version := "1.0"

scalaVersion := "2.9.1"

seq(webSettings :_*)

libraryDependencies ++= Seq(
  "org.mortbay.jetty" % "jetty" % "6.1.22" % "container",
  "net.liftweb" %% "lift-widgets" % "2.4" % "compile->default"
)