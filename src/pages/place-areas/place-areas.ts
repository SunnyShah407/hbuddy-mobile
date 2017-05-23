import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { SharedProvider } from '../../providers/shared-provider';
import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { MqttProvider } from '../../providers/mqtt-provider'

import { DevicesPage } from '../devices/devices';

@Component({
  selector: 'page-place-areas',
  templateUrl: 'place-areas.html',
})
export class PlaceAreasPage {

  private selectedPlace: any;
  private selectedPlaceArea: any;
  private connectionOptions: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public sharedProvider: SharedProvider, public hbuddyProvider: HbuddyProvider,
              public mqttProvider: MqttProvider, private events: Events) {
              this.selectedPlace = navParams.get('selectedPlace');
              if(!this.selectedPlace){
                this.selectedPlace = this.sharedProvider.getSessionData("selectedPlace");
              }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceAreasPage: >> ', this.selectedPlace);
    if(!this.sharedProvider.isDemoAccount()){
      let placeTopic: string = "iot-2/type/" +this.sharedProvider.CONFIG.GATEWAY_TYPE +"/id/"+this.selectedPlace.gatewayId+"/evt/gateway/fmt/json";
      this.connectionOptions.subscribeToTopic = placeTopic;
      this.mqttProvider.connectMQTT(this.connectionOptions);
    }
    this.sharedProvider.presentLoading("Fetching place areas...");
    this.getPlaceAreas(false, (err, placeAreas) =>{
      this.selectedPlace.areas = placeAreas;
      this.sharedProvider.dismissLoading();
    });
  }

  doRefresh(refresher){
    console.log("IN doRefresh for PlaceAreas: >> ");
    this.getPlaceAreas(true, (err, placeAreas) =>{
      this.selectedPlace.areas = placeAreas;
      refresher.complete();
    });
  }

  getPlaceAreas(refresh, cb){
      if(!this.selectedPlace.areas || refresh){
        this.hbuddyProvider.fetchPlaceAreas(this.selectedPlace).then( placeAreas => {
          console.log("Fetched PlaceAreas:  ", placeAreas);
          this.selectedPlace.areas = placeAreas;
          cb(null, this.selectedPlace.areas);
        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
            }else{
              cb(error, null);
            }
        });
      }else{
          cb(null, this.selectedPlace.areas);
      }
  }

  showAddNewPlaceArea(){
    console.log("IN showAddNewPlaceArea: >>> ");
  }

  editPlaceArea(placeArea){
    console.log("IN editPlaceArea: >> ", placeArea);
    this.selectedPlaceArea = placeArea;
  }

  viewPlaceArea(placeArea){
    console.log("IN viewPlaceArea: >> ", placeArea);
    this.selectedPlaceArea = placeArea;
    this.navCtrl.push(DevicesPage, {"selectedPlace": this.selectedPlace, "selectedPlaceArea": this.selectedPlaceArea});
  }


}
