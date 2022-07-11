import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfiguracionImpresoraPageRoutingModule } from './configuracion-impresora-routing.module';

import { ConfiguracionImpresoraPage } from './configuracion-impresora.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfiguracionImpresoraPageRoutingModule
  ],
  declarations: [ConfiguracionImpresoraPage]
})
export class ConfiguracionImpresoraPageModule {}
