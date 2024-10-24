import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelayService {

  constructor(private http:HttpService) { }


  getTrainList(){
    return this.http.rGetText("https://www.irctc.co.in/eticketing/trainList")
  }
  getStationList(){
    let stationData = localStorage.getItem("stdt");
     if(localStorage.getItem("stdt")){
       return of(stationData)
     }
     return this.http.rGetText("https://www.irctc.co.in/eticketing/protected/mapps1/stationData")
     .pipe( 
      map(res=>{
        localStorage.setItem("stdt",res);
        return res;
      })
     )
  }
  getTrainSchedule(trainNo:any){
    return this.http.rGet("https://www.irctc.co.in/eticketing/protected/mapps1/trnscheduleenquiry/"+trainNo)
  }
  getVaccantBirthInfo(data:any){
    return this.http.rPost("https://www.irctc.co.in/online-charts/api/vacantBerth",data)
  }
  getTrainBetweenStations(data:any){
    return this.http.rPost("https://www.irctc.co.in/eticketing/protected/mapps1/altAvlEnq/TC",data)
  }
}
