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

  trainWiseData:any[]=[]


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

    let data ={
      "concessionBooking": false,
      "srcStn": srcStation,
      "destStn": destStation,
      "jrnyClass": "",
      "jrnyDate": "20241024",
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
            "stations": res.stationList
          } as any;
          this.trainWiseData.push(
              d
          
          )

          let data = { 
            "trainNo": train.trainNumber, 
            "boardingStation":srcStation, 
            "remoteStation": destStation, 
            "trainSourceStation": res.stationList[0].stationCode, 
            "jDate": "2024-10-24", 
            "cls": "3A", 
            "chartType": 1 
          }
      
          this.relayService.getVaccantBirthInfo(data)
          .subscribe((res:any)=>{
            console.log(res);
            //this.vaccantBerthData = res.vbd;
            d["vtd"]=  res.vbd;

            console.log(this.trainWiseData)
          })

          

        })
      

      })
    })
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
      "jDate": "2024-10-23", 
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
