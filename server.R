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
library(reshape)

shinyServer(function(input, output, session) {
  output$theMagic <- renderPlot({
    
    #select input vars
    sch <- input$School
    pop <- input$schoolSize
    geo_select <-input$geo_13_14
    
    
    #data frames
    df  <- data.frame(student_pop_2015_siteCode_siteName_eduDis_totalStud)
    df_do  <- df[with(df,order(-Total.Students)),]
    
    df_geo_13_14 <- data.frame(geometry.annual.report.december.2014.may.2015.clean)
    geo_school <- df_geo_13_14$School.Name
    
    #pvt_geo <- data.frame(geometry.annual.report.december.2013.may.2014.clean.pivoted)
    #pvt_geo <- pvt_geo[-c(1, 3),]
    #pvt_geo <- pvt_geo[,-1]
    #names(pvt_geo) <- as.character(unlist(pvt_geo[1,]))
    #pvt_geo <- pvt_geo[-c(1),]
    
    df_geo_13_14 <- df_geo_13_14[,-1]
    df_geo_13_14 <- df_geo_13_14[,-6]
    df_geo_13_14 <- df_geo_13_14[-c(87, 258),]
    rownames(df_geo_13_14) <- df_geo_13_14$School.Name
    df_geo_13_14_cleaned <- subset(df_geo_13_14, select = -c(School.Name))
    df_geo_13_14_cleaned <- rbind(rep(100,476), rep(0,476), df_geo_13_14_cleaned)
    library(fmsb)
    sub1 <- 5
    subOf <- df_geo_13_14_cleaned[c("1", "2", "Louisiana Statewide", "Fairview High School"),]
    colors_border=c( rgb(0.2,0.5,0.5,0.9), rgb(0.8,0.2,0.5,0.9) , rgb(0.7,0.5,0.1,0.9) )
    colors_in=c( rgb(0.2,0.5,0.5,0.4), rgb(0.8,0.2,0.5,0.4) , rgb(0.7,0.5,0.1,0.4) )
    output$test1 <- radarchart( subOf  , axistype=1 , 
                #custom polygon
                pcol=colors_border , pfcol=colors_in , plwd=4 , plty=1,
                #custom the grid
                cglcol="grey", cglty=1, axislabcol="grey", caxislabels=seq(0,20,5), cglwd=0.8,
                #custom labels
                vlcex=0.8 
    )
    legend(x=0.7, y=1, legend = rownames(subOf[-c(1,2),]), bty = "n", pch=20 , col=colors_in , text.col = "grey", cex=1.2, pt.cex=3)
    
    
    
    
    #outputs
    output$outText <- renderText(paste("You have selected the min value: ", pop[1], "and the max value: ", pop[2], "You have selected: ", sch))
    output$table   <- renderTable(subset(df_do, select = -c(SiteCd,ED.), Total.Students >= pop[1] & Total.Students <= pop[2]),hover = TRUE)
    output$tmp <- renderPlot(radarchart())
    
  })
})