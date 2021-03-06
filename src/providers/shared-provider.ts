import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { LoadingController, AlertController, Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

@Injectable()
export class SharedProvider {

  private forDemo: boolean = false;
  private sessionData: any;
  private currentUser: any;
  private loader: any;

  public CONFIG = {
                    API_BASE_URL: "https://hbuddy-dev.mybluemix.net/api",
                    GATEWAY_TYPE: "HukamGateway",
                    MQTT_OPTIONS: {
                                    api_key: "a-rqeofj-maegv4oxmm",
                                    auth_token: "1@UiJCNqja-weuMXyK",
                                    orgId: "rqeofj",
                                    clientId: "a:rqeofj:",
                                    hostname: "rqeofj.messaging.internetofthings.ibmcloud.com",
                                    port: 8883,
                                    protocol: "https",
                                    connectOnCreate: false,
                                    path: '/mqtt',
                                    keepAliveInterval: 3600,
                                    useSSL: true
                                  },
                    "GATEWAY_ENDPOINT": "http://hbuddy-gateway.local",
                    "CAMERA_PUBLIC_URL": "https://versional-dingo-6778.dataplicity.io/"
                  };

  constructor(private storage: Storage, private http: Http, private push: Push, private loadingCtrl: LoadingController, private alertCtrl: AlertController, public events: Events) {
    this.sessionData = {};
  }

  initPushNotification(){
      const options: PushOptions = {
         android: {
             senderID: '874807563899'
         },
         ios: {
           senderID: '874807563899',
           gcmSandbox: true,
           alert: true,
           badge: true,
           sound: true
         },
         windows: {}
      };
      const pushObject: PushObject = this.push.init(options);
      pushObject.on('notification').subscribe((notification: any) => {
          console.log('Received a notification: >> ', JSON.stringify(notification));
            //if user using app and push notification comes
            if (notification.additionalData.foreground) {
              // if application open, show popup
              let confirmAlert = this.alertCtrl.create({
                title: notification.title,
                message: notification.message,
                buttons: [{
                  text: 'Ignore',
                  role: 'cancel'
                }, {
                  text: 'View',
                  handler: () => {
                    //TODO: Your logic here
                    // this.nav.push(DetailsPage, {message: data.message});
                  }
                }]
              });
              confirmAlert.present();

            } else {
              //if user NOT using app and push notification comes
              //TODO: Your logic on click of push notification directly
              // this.nav.push(DetailsPage, {message: notification.message});
              this.events.publish("notification:received", notification);
              console.log("Push notification clicked");
            }
      });
      pushObject.on('registration').subscribe((registration: any) => {
          console.log('Device registered: >>> ', JSON.stringify(registration));
          this.setSessionData("registrationId", registration.registrationId);
      });
      pushObject.on('error').subscribe(error => {
          console.error('Error with Push plugin', error);
      });

  }

  public initStorage(cb){
    this.storage.ready().then(() => {
        this.setupLocalStorage(cb);
    });
    this.sessionData = {};
    this.forDemo = false;
  }

  public setupLocalStorage(cb){
      this.http.get('assets/data/app-data.json')
            .map((res) => res.json())
            .subscribe(data => {
                this.storage.set("demo", data.demo);
                cb(null, "SUCCESS");
            }, (rej) => {
              console.error("Could not load local data", rej)
              cb(rej, null);
            });
  }

  public setCurrentUser(user){
    console.log("IN setCurrentUser: >> ", user);
    if(user && user.type && user.type == 'demo'){
        this.forDemo = true;
    }else{
        this.forDemo = false;
    }
    this.currentUser = user;
    if(!user || user == null){
      this.storage.remove("currentUser");
    }else{
        this.setStorageData("currentUser", user);
    }
  }

  public getCurrentUser(){
    return this.currentUser;
  }

  public isDemoAccount(){
    return this.forDemo;
  }

  public setSessionData(key, data){
    this.sessionData[key] = data;
  }

  public getSessionData(key){
    return this.sessionData[key];
  }

  public setStorageData(key, data){
    this.storage.set(key, data);
  }

  public getStorageData(key, cb){
     this.storage.get(key).then((data)=>{
        cb(data);
     });
  }

  public refresh(cb){
    this.storage.clear().then(() => {
      console.log('Local Storage Cleared ');
      this.http.get('assets/data/demoData.json')
        .map((res) => res.json())
        .subscribe(data => {
            this.storage.set("demo", data.demo);
        }, (rej) => {
          console.error("Could not load local data", rej)
        });
    });

    this.refreshSession();
  }

  public refreshSession(){
    this.sessionData = {};
    this.forDemo = false;
  }

  public getDemoData(key): Promise<any>{
      return this.storage.get('demo').then((data) => {
          return new Promise((resolve, reject) => {
              let jsonObj: any = data[key];
              console.log("Data for ", key, ": >>", jsonObj);
              return resolve(jsonObj);
          });
       });
  }

  public presentLoading(msg){
      this.loader = this.loadingCtrl.create({
          content: msg
      });
      this.loader.present();
  }

  public dismissLoading(){
      this.loader.dismiss();
  }

}
