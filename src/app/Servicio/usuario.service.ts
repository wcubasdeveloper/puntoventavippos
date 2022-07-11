import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import { environment } from  './../../environments/environment';
import { IloginModel } from '../Modelos/ilogin-model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

   
  constructor(private http: HttpClient) { 

  }
  
  login(usuario:string, clave :string): Observable<string>{
    return this.http.post<string>( 
      'https://elrapido.com.pe/ServiciosWeb/Api/VipPos/InicioSesion/'+usuario+'/'+clave,
        { 
        
        }
      ).pipe(tap(
        (res: string) =>{
          var rptaJSON = JSON.parse(res);
          var dataUsuario = rptaJSON["dt0"][0];
          //

          var datosUsuario : IloginModel = {
            CodAlmacen : Number(dataUsuario["CodAlmacen"]),
            CodCobranzaPlanilla : Number(dataUsuario["CodCobranzaPlanilla"]),
            CodEmpresa : Number(dataUsuario["CodEmpresa"]),
            CodPersona : Number(dataUsuario["CodPersona"]),
            CodResultado :Number(dataUsuario["CodResultado"]),
            CodUsuario : Number(dataUsuario["CodUsuario"]),
            CodUsuarioTipo : Number(dataUsuario["CodUsuarioTipo"]),
            CodigoEmpresa : dataUsuario["CodigoEmpresa"],
            DesResultado : dataUsuario["DesResultado"],
            IGV : Number(dataUsuario["dataUsuIGVario"]),
            MensajePendiente : dataUsuario["MensajePendiente"],
            NomEmpleado : dataUsuario["NomEmpleado"],
            NomEmpresa : dataUsuario["NomEmpresa"],
            NomUsuario : dataUsuario["NomUsuario"],
            TipoCambio : dataUsuario["TipoCambio"],
            UltimoAcceso : dataUsuario["UltimoAcceso"],
            UltimoWeb : dataUsuario["UltimoWeb"],
            FechaIngreso : dataUsuario["Fecha"],
            IdImpresora :  dataUsuario["IdImpresora"]
          }

          if(datosUsuario.CodResultado == 1){
            this.guardarDatosSesionUsuario(datosUsuario);
          }
        }
      ));
  }

  obtenerDatosSesionUsuario(): IloginModel{

    let datosUsuario = localStorage.getItem("datosUsuarioLogin");
    if(datosUsuario === null){
      return null;
    }else{
      let datos = JSON.parse(datosUsuario);
      return datos;
    }
  }

  guardarDatosSesionUsuario(usuarioData : IloginModel): void {
    localStorage.setItem("datosUsuarioLogin", JSON.stringify(usuarioData));

  }

}
