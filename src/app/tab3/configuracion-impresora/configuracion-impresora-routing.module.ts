import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfiguracionImpresoraPage } from './configuracion-impresora.page';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracionImpresoraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracionImpresoraPageRoutingModule {}
