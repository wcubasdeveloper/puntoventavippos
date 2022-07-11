import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import { environment } from  './../../environments/environment';
import { IloginModel } from '../Modelos/ilogin-model';

@Injectable({
  providedIn: 'root'
})
export class ProgramacionService {

  constructor(private http: HttpClient) { }

  listarProgramacion(fecha:string, codPuntoInicio : number, codPuntoFin: number){
    
    return this.http.post<string>( 

      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ListaProgramacion/'+ fecha +'/'+ codPuntoInicio +'/' + codPuntoFin,
      //'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ListaProgramacion/2021-12-27/1/4',
        { 
        
        }
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }

}
