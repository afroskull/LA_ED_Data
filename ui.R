#
# This is the user-interface definition of a Shiny web application. You can
# run the application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

library(shiny)
library(shinydashboard)
library(fmsb)
#for the geoschool selection screen
df_geo_13_14 <- data.frame(geometry.annual.report.december.2014.may.2015.clean)
geo_school <- df_geo_13_14$School.Name
geo_list <- as.list(geo_school)
#end selection screen

dashboardPage(
  dashboardHeader(title = "Working on it"),
  dashboardSidebar(),
  dashboardBody(
    # Boxes need to be put in a row (or column)
    
    fluidRow(
      box(  
        selectInput("School","Please select the schools you want to compare",
                        choices = c("Elementary", "Middle & High"))),
      
      box(
        title = "Controls",
        sliderInput("schoolSize", "Please filter the schools based upon student population:",
                    min=2, max = 800, value = c(100, 200), step = 20)
      )
    ),
    fluidRow(
      box(
        selectInput("geo_13_14", "Select the school, sos my wording:", choices = geo_school )
      ),
      box(
        plotOutput("test1")
        # Custom the radarChart !
        
        )
    )
      
    )
  
)
