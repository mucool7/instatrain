import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private HttpClient :HttpClient) { }
  private relayUrl = "http://localhost:5026/api/relay/get"

  rGet(url:string){

    let data={
      url,
      method:"get",
      headers:{"greq":""+Math.floor((Math.random() * 10000000) + 100000)+""}
    }
    return this.post(this.relayUrl,data)

  }

  rGetText(url:string){

    let data={
      url,
      method:"get",
      headers:{"greq":""+Math.floor((Math.random() * 10000000) + 100000)+""}
    }
    return this.postText(this.relayUrl,data)

  }

  rPost(url:string,rdata:any){

    let data={
      url,
      data:rdata,
      method:"post",
      headers:{"greq":""+Math.floor((Math.random() * 10000000) + 100000)+""}
    }
    return this.post(this.relayUrl,data)

  }

  post(url:string,data:any){

    return this.HttpClient.post(url,data);
  }
  private postText(url:string,data:any){

    return this.HttpClient.post(url,data,{responseType: 'text'});
  }
}
