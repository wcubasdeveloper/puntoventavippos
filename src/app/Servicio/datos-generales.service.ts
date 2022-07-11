import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import { environment } from  './../../environments/environment';
import { IloginModel } from '../Modelos/ilogin-model';
import { IOrigenDestinoStorage } from '../Modelos/iorigen-destino-storage';
import { IImpresoraModel } from '../Modelos/iimpresora-model';

@Injectable({
  providedIn: 'root'
})
export class DatosGeneralesService {

  constructor(private http: HttpClient) { 

  }

  setLocalStorageOrigenDestino(datos : IOrigenDestinoStorage){
    localStorage.setItem("datosOrigenDestino", JSON.stringify(datos));
  }

  setLocalStorageImpresoraConectada(datos : IImpresoraModel){
    localStorage.setItem("ImpresoraConectada", JSON.stringify(datos));
    console.log("SETIO LOCAL STORAGE");
  }

  getLocalStorageImpresoraConectada(){
    let datosImpresoraConectada = localStorage.getItem("ImpresoraConectada");
    if(datosImpresoraConectada === null){
      return null;
    }else{
      let datos = JSON.parse(datosImpresoraConectada);
      return datos;
    }
  }

  getLocalStorageOrigenDestino(){
    let datosOrigenDestino = localStorage.getItem("datosOrigenDestino");
    if(datosOrigenDestino === null){
      return null;
    }else{
      let datos = JSON.parse(datosOrigenDestino);
      return datos;
    }
  }

  listarPuntos(codEmpresa){
   
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ListaPunto/' + codEmpresa,
        { 
        
        }
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }


  actualizarIdImpresora(idUsuario: number, codigoImpresora : string){
 
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/EditaIdImpresora/' + idUsuario + '/' + codigoImpresora,
        { 
        
        }
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }


  

  consultaDatosPersona(nroDocumento){
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ConsultaCliente/2/' + nroDocumento,
        { 
        
        }
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }

  consultaDatosEmpresa(nroRUC){
    
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ConsultaRUC/' + nroRUC,
        { 
        
        }
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }


}
