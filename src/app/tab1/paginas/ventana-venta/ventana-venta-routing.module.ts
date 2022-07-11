import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VentanaVentaPage } from './ventana-venta.page';

const routes: Routes = [
  {
    path: '',
    component: VentanaVentaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VentanaVentaPageRoutingModule {}
