import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VentanaAsientosPage } from './ventana-asientos.page';

const routes: Routes = [
  {
    path: '',
    component: VentanaAsientosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VentanaAsientosPageRoutingModule {}
