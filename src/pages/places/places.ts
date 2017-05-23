import { Component } from '@angular/core';
import { MenuController, NavController, Events } from 'ionic-angular';

import { HbuddyProvider } from '../../providers/hbuddy-provider';
import { SharedProvider } from '../../providers/shared-provider';

import { DashboardPage } from '../dashboard/dashboard';

@Component({
  selector: 'page-places',
  templateUrl: 'places.html',
})
export class PlacesPage {

  private places: any;
  private selectedPlace: any;
  private showPlaces: boolean = true;
  private showAddUpdatePlace: boolean = false;

  constructor(public hbuddyProvider: HbuddyProvider, public menuCtrl: MenuController, public navCtrl: NavController, public sharedProvider: SharedProvider, private events: Events) {
      // menu.enable(true);
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, "menu-left");
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true, "menu-right");
  }

  ionViewDidLoad() {
      console.log('ionViewDidLoad Places');
      this.events.subscribe('Push Notification:received', (message: any) => {
          console.log('notification Message Payload: >> ', message);
      });
      this.menuCtrl.swipeEnable(true, "menu-left");
      if(!this.places || this.places.length == 0){
          this.sharedProvider.presentLoading("Fetching your places...");
          this.fetchUserPlaces(false, (err, places) =>{
              this.places = places;
              this.sharedProvider.dismissLoading();
          });
      }
  }

  doRefresh(refresher){
    console.log("IN doRefresh for Places: >> ");
    this.fetchUserPlaces(true, (err, places) =>{
        this.places = places;
        refresher.complete();
    });
  }

  fetchUserPlaces(refresh, cb){
      console.log("IN fetchUserPlaces for: ", this.sharedProvider.getCurrentUser());
      let placesInSession = this.sharedProvider.getSessionData("places");
      if(placesInSession && placesInSession.length > 0 && !refresh){
          cb(null, placesInSession);
      }else{
        this.hbuddyProvider.fetchUserPlaces(this.sharedProvider.getCurrentUser()).then( places => {
          console.log("Fetched User Places:  ", places);
          this.sharedProvider.setSessionData("places", places);
          cb(null, places);
        },
        error => {
            if(error.status == 401){
              this.events.publish("auth:required", error);
            }else{
              cb(error, null);
            }
        });
      }
  }

  showAddNewPlace(){
    this.selectedPlace = {};
    this.showAddUpdatePlace = true;
    this.showPlaces = false;
  }

  showEditPlace(place){
      console.log("IN editPlace: >> ", place);
      this.selectedPlace = place;
      this.sharedProvider.setSessionData("selectedPlace", place);
      this.showAddUpdatePlace = true;
      this.showPlaces = false;
      // this.navCtrl.setRoot(DashboardPage, {"selectedPlace": place});
  }

  addOrUpdatePlace(){
      console.log("IN addOrUpdatePlace: >> ", this.selectedPlace );
  }

  viewPlace(place){
      console.log("IN viewPlace: >> ", place);
      this.sharedProvider.setSessionData("selectedPlace", place);
      this.navCtrl.setRoot(DashboardPage, {"selectedPlace": place});
  }

  dismiss(){
      this.showAddUpdatePlace = false;
      this.showPlaces = true;
  }

}
