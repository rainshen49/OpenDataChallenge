library(ggplot2)
timed <- list()
for(i in 100:140){
  current <- read.csv(paste(toString(i),".csv",sep=""))
  timed[[length(timed)+1]] <- current
  p <- ggplot(data=current,aes(x=lat,y=long,fill=time))+geom_tile()+lims(fill=c(30,720))
  print(p)
  Sys.sleep(1)
}
