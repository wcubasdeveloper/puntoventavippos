import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { VentanaAsientosPageRoutingModule } from './ventana-asientos-routing.module';
import { VentanaAsientosPage } from './ventana-asientos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentanaAsientosPageRoutingModule
  ],
  declarations: [VentanaAsientosPage]
})
export class VentanaAsientosPageModule {}
