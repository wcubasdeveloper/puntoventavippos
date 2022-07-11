import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';

import { AppVersion } from '@ionic-native/app-version/ngx'
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'


interface AppUpdate{
  current : string;
  enabled : boolean;
  msg? : {
    title : string;
    msg : string;
    btn : string;
  };
  majorMsg? : {
    title : string;
    msg : string;
    btn : string;
  };
  minorMsg? : {
    title : string;
    msg: string;
    btn: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  updateExample = "/SUBSIDIO/Adjuntos/version.json";
  maintenanceExample  = "/SUBSIDIO/Adjuntos/maintenance.json";
  constructor(
    private http : HttpClient,
    private alertCtrl : AlertController,
    private appVersion : AppVersion,
    private iab : InAppBrowser,
    private plt : Platform
  ) { }

  async checkForUpdate(){
 
    this.http.get(this.updateExample).subscribe(async (info : AppUpdate)=>{
      //console.log('result: ', info);
   
      if(!info.enabled){
        this.presentAlert(info.msg.title, info.msg.msg, info.msg.btn);

      }else{
        const versionNumber = await this.appVersion.getVersionNumber();
        const splittedVErsion = versionNumber.split('.');
        const serverVersion = info.current.split('.');

        console.log("<<<<VERSION NUMBER>>>>")
        console.log(versionNumber);
        console.log("<<<<SERVER VERSION>>>>")
        console.log(serverVersion);

        if(serverVersion[0] > splittedVErsion[0]){
          this.presentAlert(info.majorMsg.title, info.majorMsg.msg, info.majorMsg.btn);

        }else if (serverVersion[1] > splittedVErsion[1]){
          this.presentAlert(info.minorMsg.title, info.minorMsg.msg, info.minorMsg.btn);
        }

      }
    })
  }

  openAppstoreEntry(){
    
    if(this.plt.is('android')){
      console.log("OPENN PAGINA PARA DESCARGAR PEEE")

      // NativeMarket.openStoreListing({
      //   appId: 'com.devdatic.igcompanion'
      // });
    }
  }

  async presentAlert(header, message, buttonText = '', allowClose = false){

    const buttons: any = [];

    if(buttonText != ''){
      buttons.push({
        text: buttonText, 
        handler: ()=>{
          this.openAppstoreEntry();
        }
      })
    }

    if(allowClose){
      buttons.push({
        text: 'close', 
        role : 'cancel'
      })
    }
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: buttons,
      backdropDismiss : allowClose
    })

    await alert.present();
  }


}
