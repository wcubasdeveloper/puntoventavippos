import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
  },
  {
    path: 'ventana-asientos',
    loadChildren: () => import('./paginas/ventana-asientos/ventana-asientos.module').then( m => m.VentanaAsientosPageModule)
  },
  {
    path: 'ventana-venta',
    loadChildren: () => import('./paginas/ventana-venta/ventana-venta.module').then( m => m.VentanaVentaPageModule)
  },
  {
    path: 'ventana-venta',
    loadChildren: () => import('./paginas/ventana-venta/ventana-venta.module').then( m => m.VentanaVentaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
