import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import { environment } from  './../../environments/environment';
import { IloginModel } from '../Modelos/ilogin-model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  constructor(private http: HttpClient) { }

  consultarAsientosVendidos(codProgramacion : number){

    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ListaAsientoProgramacion/'+ codProgramacion,
       ''
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));

  }

  consultarVenta(codVenta : number){

    return this.http.post<string>( 
      'https://elrapido.com.pe/VIP/Venta/ConsultaVenta/?Parametros='+ codVenta + '&Indice=12',
       ''
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }

  anularVenta(codVenta : number, motivo : string, codUsuario : string, clave : string){

    
    //
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/AnulaVenta/'+ codVenta+'/' + codUsuario + '/' + motivo + '/' + clave,
       ''
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }

  

  consultarListaVentas(codUsuario : number, fechaConsulta : string){

    //fechaConsulta = '2022-03-19';
    // codUsuario = 1;
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/ListaVentaUsuario/'+ fechaConsulta +'/' + codUsuario,
       ''
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }


  bloquearAsiento(
    codProgramacion : number, 
    nroAsiento : number,
    codUsarioAccion : number, 
    tarifaPasaje : string ){
    
      console.log('https://elrapido.com.pe/ServiciosWeb/Api/VipPos/BloqueaAsiento/'+codProgramacion+ '/'+
      nroAsiento + '/'+ codUsarioAccion +'/'+ tarifaPasaje)
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/BloqueaAsiento/'+codProgramacion+ '/'+
        nroAsiento + '/'+ codUsarioAccion +'/'+ tarifaPasaje,
       ''
      ).pipe(tap(
        (res: string) =>{
          console.log("res bloqueo->", res);
        }
      ));
  }


  


  guardarVenta(
    codEmpresa: number, codProgramacion: number, nroAsiento : number,
    codClientePasajero : number, codDocumentoIdentidad : number, nroDocumentoIdentidad : string,
    nombreCliente : string, paternoCliente : string, maternoCliente : string,
    fechaNacimiento : string, correoCliente : string, edad :number,
    telefono : string,  nacionalidad : string, rucCliente : string,
    razonSocial : string, direccionCliente : string, codDocumento : number,
    fechaVenta : string, total : number, codPunto: number, observacion : string,
    codUsuarioAccion : number, codVentaRelacion : number, ventaDetalle : string,
    codRubro : number, codPuntoOrigen : number, codPuntoDestino : number,
    codClienteConsignado : number, sexoPersona : number,  formaPago : number,
    codCuidadOrigen : number, codCuidadDestino : number
    ){
		



    return this.http.post<string>( 
      //console.log('https://elrapido.com.pe/ServiciosWeb/Api/VipPos/GuardaVenta/3|37|4|6|2|45048785|ROLANDO|PARTI|SUCASA|1988-04-09||33|986356682|PERUANA||||2|2021-12-30|50|1|Observación|1|||9|1|4|0|0');
      
      //'http://26.247.40.78/ServiciosWeb/Api/VipPos/GuardaVenta/?Parametros=' +
      //'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/GuardaVenta/?Parametros='+
      'https://elrapido.com.pe/SIGAR/Venta/GuardaVenta/?Parametros='+
      codEmpresa + '|'+
      codProgramacion + '|'+
      nroAsiento +'|'+
      codClientePasajero + '|'+
      codDocumentoIdentidad + '|'+
      nroDocumentoIdentidad + '|'+
      nombreCliente + '|'+
      paternoCliente + '|'+
      maternoCliente + '|'+
      fechaNacimiento + '|'+
      correoCliente + '|'+
      edad + '|'+
      telefono + '|'+
      nacionalidad + '|'+
      rucCliente + '|'+
      razonSocial + '|'+
      direccionCliente + '|'+
      codDocumento + '|'+
      fechaVenta + '|'+
      total + '|'+
      //codPunto +'|'+
      0 +'|'+
      observacion + '|'+
      codUsuarioAccion +'|'+
      codVentaRelacion + '|'+
      ventaDetalle + '|'+
      codRubro + '|'+
      0 + '|'+
      0 + '|'+
      '0|' +
      '0|'+
      '0|' +
      sexoPersona + '|'+ //codsexo
      formaPago + '|' + 
      codCuidadOrigen + '|' + 
      codCuidadDestino  + 
      '&Indice=20',
      // codPuntoOrigen + '|'+
      // codPuntoDestino + '|0|0&Indice=20',
       ''
      ).pipe(tap(
        (res: string) =>{
          
        }
      ));
  }

}
