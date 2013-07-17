name := "LittleBlueBird"

version := "1.0"

scalaVersion := "2.9.1"

seq(webSettings :_*)

env in Compile := Some(file(".") / "jetty-env.xml" asFile)

// sbt> reload
// will pull down any new dependencies that you may have just added here

libraryDependencies ++= Seq(
  "org.eclipse.jetty" % "jetty-webapp" % "7.4.1.v20110513" % "container",
  "org.eclipse.jetty" % "jetty-plus" % "7.4.1.v20110513" % "container",
  "org.tuckey" % "urlrewritefilter" % "4.0.3" % "compile->default",
  "net.liftweb" %% "lift-widgets" % "2.4" % "compile->default",
  "net.liftweb" %% "lift-facebook" % "2.4" % "compile->default"
)

port in container.Configuration := 80