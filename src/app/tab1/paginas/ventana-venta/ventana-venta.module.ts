import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { VentanaVentaPageRoutingModule } from './ventana-venta-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VentanaVentaPage } from './ventana-venta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentanaVentaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [VentanaVentaPage]
})
export class VentanaVentaPageModule {}
