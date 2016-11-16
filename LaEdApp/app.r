#and begin
library(shiny)
library(shinydashboard)
library(fmsb)
library(DT)
library(dplyr)

#dataframes for numLine
addSchoolPop <- as.data.frame(cbind(labels = as.character(nces2007$School.Name), parameter = (nces2007$Enrolled.Students)))

#dataframes for calc percent Lunch and Minority
nces_sel <- as.data.frame(nces2007)
nces_sel <- as.data.frame(nces2007$Percent.Minority <- round(((nces2007$Enrolled.Students - nces2007$White.Students)/nces2007$Enrolled.Students) *100, digits = 1))
nces_sel <- as.data.frame(nces2007$Percent.Free.and.Reduced.Lunch <- round(((nces2007$Enrolled.Students - nces2007$Total.Free.and.Reduced.Lunch)/nces2007$Enrolled.Students) *100, digits = 1))

#dataframes for numLine 2 3
addSchoolMin <- as.data.frame(cbind(labels = as.character(nces2007$School.Name), parameter = (nces2007$Percent.Minority)))
addSchoolLunch <- as.data.frame(cbind(labels = as.character(nces2007$School.Name), parameter = (nces2007$Percent.Free.and.Reduced.Lunch)))

ui <- dashboardPage(#change Theme stuff
  dashboardHeader(title = "LA ED DATA"),
  dashboardSidebar(width = 300,
    sliderInput("schoolSize", "Please filter the schools based upon student population:",
                min=2, max = 2500, value = c(2, 2500), step = 20),
    
  sliderInput("percentMinority", "Please filter the schools based upon minority population:",
              min=0, max = 100, value = c(0, 100), step = 10),

sliderInput("percentLunch", "Please filter the schools based upon free or reduced lunch status of schools population:",
            min=0, max = 100, value = c(0, 100), step = 10),
selectizeInput("addSchool", "add a school mate limit 2", label=p("select 2 Comparison Schools"), choices=(addSchoolPop$labels),  selected = NULL, multiple = TRUE, options = list(maxItems=2))
),
  dashboardBody(
    # Boxes need to be put in a row (or column)
    
    fluidRow(
      box(title = "Selected Schools Population",
        status = "primary",
        solidHeader = TRUE,
        collapsible = TRUE,
        width = 4,
        plotOutput("numline1", height = 100)
        
      ), #end box1
      box(title = "Selected Schools %Minority",
          status = "primary",
          solidHeader = TRUE,
          collapsible = TRUE,
          width = 4,
          plotOutput("numline3", height = 100)
          
      ), #end box2
      box(title = "Selected Schools %Free/Reduced Lunch",
          status = "primary",
          solidHeader = TRUE,
          collapsible = TRUE,
          width = 4,
          plotOutput("numline2", height = 100)
          
      ) #end box3
    ), #end row 1
    fluidRow(
      box(
        status = "primary",
        width = 12,
        DT::dataTableOutput("view")
          )), #end Row
    fluidRow(
      box(
        width = 2,
        verbatimTextOutput("addSchool")
        
      ), #end box2-1
      box(
        width = 2,
        textOutput("outText")
      )#end box 2-2
    )
    
  )#end dashboardBody
  
)#end dashboard
#
##
###
####
#####
######
server <- function(input, output,session) {
  
  library(shiny)
  library(shinydashboard)
  library(fmsb)
  library(DT)
  library(dplyr)
  
  #dataFrames
  nces_07 <- data.frame(nces2007)
  nces_07_pop <- nces_07[with(nces_07,order(-Enrolled.Students)),]
  nces_07 <- nces_07_pop$Percent.Minority <- round(((nces_07_pop$Enrolled.Students - nces_07_pop$White.Students)/nces_07_pop$Enrolled.Students) *100, digits = 1)
  nces_07 <- nces_07_pop$Percent.Free.and.Reduced.Lunch <- round(((nces_07_pop$Enrolled.Students - nces_07_pop$Total.Free.and.Reduced.Lunch)/nces_07_pop$Enrolled.Students) *100, digits = 1)

  #input vars
  #pop <- input$schoolSize
  #per_min <- input$percentMinority
  #per_lunch <- input$percentLunch
  
  
  #formulas
  is.na(nces_07_pop$Percent.Free.and.Reduced.Lunch) <- sapply(nces_07_pop$Percent.Free.and.Reduced.Lunch, is.infinite)
  curr_student_pop<- mean(nces2007$Enrolled.Students)
  curr_student_min<- mean(nces_07_pop$Percent.Minority, na.rm = TRUE)
  curr_student_lunch<- mean(nces_07_pop$Percent.Free.and.Reduced.Lunch, na.rm = TRUE)
  #reactive------------------------------------------------
  
  
  
  
  
  user_ag <- reactive({
              subset(nces_07_pop, select = c(School.Name, Enrolled.Students, Percent.Minority,Percent.Free.and.Reduced.Lunch),
              Enrolled.Students >= input$schoolSize[1] & Enrolled.Students <= input$schoolSize[2] &
              Percent.Minority >= input$percentMinority[1] & Percent.Minority <= input$percentMinority[2] &
              Percent.Free.and.Reduced.Lunch >= input$percentLunch[1] & Percent.Free.and.Reduced.Lunch <= input$percentLunch[2]
  )})

  #create line graphs
  #troubleshooting replace with functions and ()
  line1<- reactive({
    colors_in=c( rgb(1,0,0,.6), rgb(0,1,0,.6), rgb(0,0,1,.6) )
    par(xaxs='r',yaxs='i',mar=c(2,1,1,1))
    plot(NA, xlim=c(input$schoolSize[1], input$schoolSize[2]),ylim=c(1,100),axes=FALSE, ann=FALSE)
    axis(1)
    py <- c(0,0,0)
    
    px <- c(as.character(addSchoolPop1()[2,]),as.character(addSchoolPop1()[1,]),curr_student_pop)
    points(px,py, pch=19, xpd=NA, col=colors_in, cex= 3)
    
    legend( x="bottomright", 
            legend=c(sort(input$addSchool, decreasing = TRUE),"Louisiana Avg Pop"),
            title = "", bg="transparent",
            col=colors_in,
            box.lty=0,
            pch=c(19,19,19))
  }) #lmao I know
  
  line2<- reactive({
    colors_in=c( rgb(1,0,0,.6), rgb(0,1,0,.6), rgb(0,0,1,.6) )
    par(xaxs='r',yaxs='i',mar=c(2,1,1,1))
    plot(NA, xlim=c(input$percentLunch[1], input$percentLunch[2]),ylim=c(1,100),axes=FALSE, ann=FALSE)
    axis(1)
    py <- c(0,0,0)
    
    px <- c(as.character(addSchoolLunch1()[2,]),as.character(addSchoolLunch1()[1,]),curr_student_lunch)
    points(px,py, pch=19, xpd=NA, col=colors_in, cex= 3)
    
    legend( x="bottomright", 
            legend=c(sort(input$addSchool, decreasing = TRUE),"Louisiana Avg %Free/Reduced Lunch"),
            title = "", bg="transparent",
            col=colors_in,
            box.lty=0,
            pch=c(19,19,19))
  }) #it makes me sad, but works for now
  
  line3<- reactive({
    colors_in=c( rgb(1,0,0,.6), rgb(0,1,0,.6), rgb(0,0,1,.6) )
    par(xaxs='r',yaxs='i',mar=c(2,1,1,1))
    plot(NA, xlim=c(input$percentMinority[1], input$percentMinority[2]),ylim=c(1,100),axes=FALSE, ann=FALSE)
    axis(1)
    py <- c(0,0,0)
    
    px <- c(as.character(addSchoolMin1()[2,]),as.character(addSchoolMin1()[1,]),curr_student_min)
    points(px,py, pch=19, xpd=NA, col=colors_in, cex= 3)
    
    legend( x="bottomright", 
            legend=c(sort(input$addSchool, decreasing = TRUE),"Louisiana Avg %Minority"),
            title = "", bg="transparent",
            col=colors_in,
            box.lty=0,
            pch=c(19,19,19))
  })
  # same function todo simple shit
  addSchoolPop1<-reactive({ 
    if (is.null(input$addSchool))
      return ("Select a skool m8")
    else((addSchoolPop %>% filter(labels %in% input$addSchool) %>% select(parameter)))
  })
  
  addSchoolMin1<-reactive({ 
    if (is.null(input$addSchool))
      return ("Select a skool m8")
    else((addSchoolMin %>% filter(labels %in% input$addSchool) %>% select(parameter)))
  })
  
  addSchoolLunch1<-reactive({ 
    if (is.null(input$addSchool))
      return ("Select a skool m8")
    else((addSchoolLunch %>% filter(labels %in% input$addSchool) %>% select(parameter)))
  })
  #outputs----------------------------------------------------
  output$numline1 <- renderPlot(line1())
  output$numline2 <- renderPlot(line2())
  output$numline3 <- renderPlot(line3())
  
  output$outText <- renderText(paste("You have selected the min value: ", input$schoolSize[1], "and the max value: ", input$schoolSize[2], 
                                     "also percent of minority between", input$percentMinority[1], input$percentMinority[2],
                                     "as well as % free/red lunch between", input$percentLunch[1], input$percentLunch[2], "What the hell R:",input$addSchool[1], input$addSchool[1], curr_student_min, curr_student_lunch))
  
  output$view <- DT::renderDataTable({user_ag()}, 
                                     options = list(pageLength = 5),
                                     server = FALSE) 
  output$ag = renderPrint({
    sel = input$view_rows_seleted
    if(length(input$view_rows_selected)) {
      cat()
      cat(input$view_rows_selected[1], input$view_rows_selected[2], input$view_rows_selected[3], input$view_rows_selected[4], input$view_rows_selected[5])
    }
  })
  
  output$addSchool<-renderText({
    as.character(addSchoolPop1())
  })
  #output$table2 <- #(subset(first_filter, select =c(Site.Code, Percent.Minority, Enrolled.Students), Percent.Minority <= input$percentMinority),hover = TRUE )
}#end server
######
#####
####
###
##
#
# Run the application if fails /life
shinyApp(ui = ui, server = server)
