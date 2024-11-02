import { Component } from '@angular/core';
import { RelayService } from '../../services/relay.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {

  trains: any[] = [];
  selectedTrainSchedule: any;
  selectedTrainNo:any;
  filteredStations:any[]=[];
  departureFilteredStations:any[]=[];
  arrivalFilteredStations:any[]=[];
  vaccantBerthData:any[]=[];


  departureStation:any;
  arrivalStation: any;
  stationMasterList:any[]=[];
  selectedDate:any;

  trainWiseData:any[]=[];

  berthData:any[]=[];


  constructor(private relayService: RelayService) { }

  ngOnInit() {
    // this.relayService.getTrainList()
    //   .subscribe(res => {
    //     this.trains = res.replaceAll('"', '').split(",").map(x => {
    //       let d = x.split("-")
    //       return {
    //         code: d[0].trim(),
    //         name: d[1].trim()
    //       }
    //     });
    //     console.log(this.trains)
    //   })

    this.relayService.getStationList()
    .subscribe((res:any)=>{
      this.stationMasterList = JSON.parse(res);
    })  
  }

  onDepartureSelected(departureStation:any){

     this.departureStation = departureStation
  }
  onArrivalSelected(arrivalStation:any){

     this.arrivalStation = arrivalStation
  }

  onSearch(){

    let srcStation = this.departureStation.split("-")[1].trim();
    let destStation = this.arrivalStation.split("-")[1].trim();

    this.berthData =[];
    this.trainWiseData =[];

    let data ={
      "concessionBooking": false,
      "srcStn": srcStation,
      "destStn": destStation,
      "jrnyClass": "",
      "jrnyDate": "20241028",
      "quotaCode": "GN",
      "currentBooking": "false",
      "flexiFlag": false,
      "handicapFlag": false,
      "ticketType": "E",
      "loyaltyRedemptionBooking": false,
      "ftBooking": false
  }

  console.log(data,this.selectedDate)

    this.relayService.getTrainBetweenStations(data)
    .subscribe((res:any)=>{

      res.trainBtwnStnsList.forEach((train:any)=>{

        this.relayService.getTrainSchedule(train.trainNumber)
        .subscribe((res:any)=>{

          let d=   {
            "trainNo":train.trainNumber,
            "trainInfo":train,
            "stations": this.getStationsBetweenRoutesWithName( res.stationList,srcStation,destStation),
            "from":srcStation,
            "to":destStation
          } as any;
          this.trainWiseData.push(
              d
          
          )

          let data = { 
            "trainNo": train.trainNumber, 
            "boardingStation":srcStation, 
            "remoteStation": srcStation, 
            "trainSourceStation": res.stationList[0].stationCode, 
            "jDate": "2024-10-28", 
            "cls": "3A", 
            "chartType": 1 
          }
      
          this.relayService.getVaccantBirthInfo(data)
          .subscribe((res:any)=>{
            console.log(res);
            //this.vaccantBerthData = res.vbd;
            d["vtd"]=  res.vbd;

            console.log(this.trainWiseData)
            this.findBerths(d)
          })

          

        })
      

      })
    })
  }


  findBerths(data:any){


     let berthsFromSource = data.vtd.filter((x:any)=>x.from == data.from);
    //  console.log(berthsFromSource,"From stations")

     let fromStation:any,toStation:any,berthDataBetweenStation:any[]=[];
     fromStation = data.from;
     toStation = data.to;

     let isFound = false;

     data.stations.forEach((berthData:any)=>{

        if(berthData.stationCode == fromStation || isFound){
          berthDataBetweenStation.push(berthData);
          isFound =true;
        }

        if(berthData.stationCode == toStation){
          isFound =false;
        }

     })

     let directBerth = data.vtd.filter((x:any)=>x.from == fromStation && x.to == toStation);

     let toStationIndex = 2
     let fromStationIndex = 0
     
     
     if(!directBerth?.length){
    
        while(true){
          if(berthDataBetweenStation.length-toStationIndex <0){
            fromStationIndex ++;
            toStationIndex = 1;
            break;
          }
          if(fromStationIndex >=berthDataBetweenStation.length ){
            break;
          }

          toStation = berthDataBetweenStation[berthDataBetweenStation.length-toStationIndex].stationCode;
          fromStation = berthDataBetweenStation[fromStationIndex].stationCode;

          let berth = data.vtd.filter((x:any)=>x.from == fromStation && x.to == toStation);
          if(!berth.length){

            if(berthDataBetweenStation.length-toStationIndex == fromStationIndex){
              fromStationIndex++;
              toStationIndex =1;
            }
            else{
              
              toStationIndex ++;
            }

            
            continue;
          }
          directBerth.push(... berth);
          fromStationIndex = berthDataBetweenStation.length-toStationIndex ;
          toStationIndex = 1;
          

           

          
        }

        let StationWiseBerthData:any[]=[];
        directBerth.forEach((e:any)=>{

          StationWiseBerthData.push(... this.getStationsBetweenRoutes(berthDataBetweenStation,e))

        })

        this.berthData.push({
          trainNo:data.trainNo,
          data: StationWiseBerthData
        });
        

     }

     console.log(this.berthData,"berthdata")



  }

  getStationsBetweenRoutes(stationList:any[],berth:any){

    let stations:any[]=[];

    let isFound = false;

    stationList.forEach((berthData:any)=>{

        if(berthData.stationCode == berth.from || isFound){
          stations.push({...berthData, ... berth});
          isFound =true;
        }

        if(berthData.stationCode == berth.to){
          isFound =false;
        }

     })

     return stations;

  }

  getStationsBetweenRoutesWithName(stationList:any[],from:string,to:string){

    let stations:any[]=[];

    let isFound = false;

    stationList.forEach((berthData:any)=>{

        if(berthData.stationCode == from || isFound){
          stations.push(berthData);
          isFound =true;
        }

        if(berthData.stationCode ==to){
          isFound =false;
        }

     })

     return stations;

  }

  isStationExists(trainNo:string,stationCode:string,toStationCode:string){

    if(!toStationCode) return false;
    let train = this.berthData.find(x=>x.trainNo == trainNo);
    let fromStation = train?.data.filter((x:any)=>x.stationCode == stationCode);
    let toStation = train?.data.filter((x:any)=>x.stationCode == toStationCode);

    let flag = false;

    fromStation?.forEach((e:any)=>{

      flag = toStation?.some((x:any)=>x.from == e.from && x.to == e.to) ?? false;
    })

    return flag;
  }

  

  getTop(count: number) {
    return this.trains.filter(x=> {
      let h = x.name.indexOf("a") 
     // console.log(h)
      
      return h 
    })
  }

  getTrainSchedule(trainNo: any) {
    this.selectedTrainNo = trainNo;
    this.relayService.getTrainSchedule(trainNo)
      .subscribe(res => {

        this.selectedTrainSchedule = res;
        console.log(this.selectedTrainSchedule)
        this.VaccantBirthInfo(this.selectedTrainSchedule.stationList[0].stationCode)
      })
  }

  VaccantBirthInfo(boardingStation: string) {

    let data = { 
      "trainNo": this.selectedTrainNo, 
      "boardingStation": boardingStation, 
      "remoteStation": boardingStation, 
      "trainSourceStation": this.selectedTrainSchedule.stationFrom, 
      "jDate": "2024-10-28", 
      "cls": "3A", 
      "chartType": 1 
    }

    this.relayService.getVaccantBirthInfo(data)
    .subscribe((res:any)=>{
      console.log(res);
      this.vaccantBerthData = res.vbd;
    })

  }

  getVaccantBerthFromData(stationCode:string){

    return this.vaccantBerthData.filter(x=>x.from == stationCode);
  }


  filterList(value:any,vicinity:any){

    let filteredData = JSON.parse(JSON.stringify(this.stationMasterList.filter(x=>x.en.toLowerCase().indexOf(value.value) == 0 || x.sc.toLowerCase().indexOf(value.value) != -1)))
    vicinity == "arrival"? this.arrivalFilteredStations =filteredData : this.departureFilteredStations = filteredData

  }

}
