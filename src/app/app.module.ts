import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { IngresarComponent } from '../app/Login/ingresar/ingresar.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {IonicInputMaskModule} from "@thiagoprz/ionic-input-mask";
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Printer, PrintOptions } from '@awesome-cordova-plugins/printer/ngx';
import { Tab1Page } from './tab1/tab1.page';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx'
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'



@NgModule({
  declarations: [
    AppComponent,
    IngresarComponent

  ],
  entryComponents: [],
  imports: [
    CommonModule,
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    IonicInputMaskModule,
    HttpClientModule
  ],
  providers: [
    { 
      provide: RouteReuseStrategy, 
      useClass: IonicRouteStrategy 
    },
    BluetoothSerial,
    Printer,
    BluetoothLE,
    AppVersion,
    InAppBrowser
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
