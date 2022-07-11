import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IngresarComponent } from '../app/Login/ingresar/ingresar.component';

const routes: Routes = [
  { path: '', component: IngresarComponent},
  { path: 'login', component: IngresarComponent},
  {
    path: 'tabprincipal',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
