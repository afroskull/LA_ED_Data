ui <- 
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
df_geo_13_14 <- data.frame(geometry.annual.report.december.2014.may.2015.clean)
geo_school <- df_geo_13_14$School.Name

geo_list <- as.list(geo_school)


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
        radarchart(data)
        
        # Custom the radarChart !
        
      )
    )
    
  )
  
)
server <- function(input, output,session) {
  #
  # This is the server logic of a Shiny web application. You can run the 
  # application by clicking 'Run App' above.
  #
  # Find out more about building applications with Shiny here:
  # 
  #    http://shiny.rstudio.com/
  #
  
  library(shiny)
  library(shinydashboard)
  library(fmsb)
  
    output$theMagic <- renderPlot({
      #select input vars
      sch <- input$School
      pop <- input$schoolSize
      
      #data frames
      df  <- data.frame(student_pop_2015_siteCode_siteName_eduDis_totalStud)
      df_do  <- df[with(df,order(-Total.Students)),]
      
      df_geo_13_14 <- data.frame(geometry.annual.report.december.2014.may.2015.clean)
      geo_school <- df_geo_13_14$School.Name
      
      geo_list <- as.list(geo_school)
      
      #updateSelectInput(session,"geo_13_14",choices = geo_school)
      #outputs
      output$outText <- renderText(paste("You have selected the min value: ", pop[1], "and the max value: ", pop[2], "You have selected: ", sch))
      output$table   <- renderTable(subset(df_do, select = -c(SiteCd,ED.), Total.Students >= pop[1] & Total.Students <= pop[2]),hover = TRUE)
      
      
    })
  
}