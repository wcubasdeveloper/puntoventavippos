import { Component, OnInit } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ModalController } from '@ionic/angular';
import { DatosGeneralesService} from './../../Servicio/datos-generales.service';
import { IImpresoraModel } from '../../Modelos/iimpresora-model';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { UsuarioService } from '../../Servicio/usuario.service';
import { IloginModel } from '../../Modelos/ilogin-model';

@Component({
  selector: 'app-configuracion-impresora',
  templateUrl: './configuracion-impresora.page.html',
  styleUrls: ['./configuracion-impresora.page.scss'],
})
export class ConfiguracionImpresoraPage implements OnInit {

  
  listablutus : [];
  listablutusFiltrados : any = [];
  impresoraConectada : IImpresoraModel;
  estadoImpresora : IImpresoraModel;
  constructor(
    public bluetoothSerial : BluetoothSerial,
    public modalController: ModalController,
    public datosGeneralesService: DatosGeneralesService,
    public alertController: AlertController,
    public loadCtrl: LoadingController,
    private usuarioService: UsuarioService
    ) { }

  ngOnInit() {

    this.estadoImpresora = this.datosGeneralesService.getLocalStorageImpresoraConectada();

    this.listarBluethoos();
  }

  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetoothSerial.disconnect();
    // this.showToast("Device Disconnected");
  }


  async listarBluethoos(){
    var self = this;
    await this.bluetoothSerial.list().then(response=>{
      self.listablutus = response;
      
      var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
      var codigoImpresora = datosUsuario.IdImpresora;
      if(codigoImpresora){
        let macImpresora = codigoImpresora.split('_').join(':');
        response.forEach(element => {
          console.log("addres-->", element.address, 'nombre->', element.name);
          
          self.listablutusFiltrados.push(
            {
              codigoimpresora : element.address,
              nombre : element.name,
              status : (element.address == macImpresora ? 'conectado' : 'desconectado')
            }
          );
          
        });
      }
      else{
        response.forEach(element => {
          self.listablutusFiltrados.push(
            {
              codigoimpresora : element.address,
              nombre : element.name,
              status : 'desconectado'
            }
          );
        })

      }
      
      console.log("LISTA listablutusFiltrados->", JSON.stringify(self.listablutusFiltrados));


      //console.log("LISTA->", JSON.stringify(self.listablutus ));
    },error=>{
      console.log("ERROR listarDispositivosBlut")
    });
  }

  salirDeConfiguracion(accion : string, nombreDispositivo : string){
    this.modalController.dismiss({
      'mostrarrecorrido': false,
      'realizoconexion' : (accion == 'cierre' ? false : true),
      'nombredispositivo' : nombreDispositivo
    });
  }

  conectarConDevice(id, nombre, estado){
    console.log("ENTRE AL <<<<conectarConDevice>>>>>");
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    var self = this;
    console.log("<<<<<< ESTADO >>>>>", estado);
    this.bluetoothSerial.disconnect();
    if(estado == 'conectado'){

      self.actualizarEstadoDispositivo(id, 'desconectado');
      // this.bluetoothSerial.disconnect();
      localStorage.removeItem('ImpresoraConectada');
      console.log("ENTRÓ AL DESCONECTAR");
    
    }else{
      this.activarLoading("Conectando con dispositivo..." + nombre);
      self.impresoraConectada = {
        codigoimpresora : id,
        nombre :nombre,
        status : ''
      }

      this.bluetoothSerial.connect(id).subscribe(success=>{
        setTimeout(() => this.desactivarLoading(), 500);
        let nuevoCodigo = id.split(':').join('_');
        this.datosGeneralesService.actualizarIdImpresora(Number(datosUsuario.CodUsuario) , nuevoCodigo).subscribe(result => {
          self.actualizarEstadoDispositivo(id, 'conectado');
          // console.log("rpta actualizacion", result);
          self.mostrarAlertaDeConexionExitosa("Se conectó correctamente con el dispositivo " + nombre, nombre);
          //aca tiene que actualizar la sesion
          let loginData : IloginModel;
          loginData = datosUsuario;
          loginData.IdImpresora = id;

          //actualiza la sesion PE
          this.usuarioService.guardarDatosSesionUsuario(loginData);
        });


         self.impresoraConectada.status = 'conectado';
        // self.datosGeneralesService.setLocalStorageImpresoraConectada(self.impresoraConectada);
        // console.log("LIEGO DE CONECTAR", JSON.stringify(self.datosGeneralesService.getLocalStorageImpresoraConectada()))
          
        // console.log("LISTA EN HTML", JSON.stringify(self.listablutusFiltrados));
        

        // self.salirDeConfiguracion();
      },error=>{

        self.desactivarLoading();
        console.log("<<<<NO CONECTOO>>>>")
        self.impresoraConectada.status = 'desconectado';
        self.mostrarAlerta("No se pudo conectar al dispositivo, verifique que el equipo se encuentre encendido.");
       // self.salirDeConfiguracion();
      });
    }

 
  }

  actualizarEstadoDispositivo(idDispositivo : string, estado : string){

    this.listablutusFiltrados.forEach(element => {
      if(element.codigoimpresora == idDispositivo){
        element.status = estado;
      }
    });
  }


  async mostrarAlerta(textoMensaje){
    const alertaNotificacion = await this.alertController.create({
      header : 'Notificación',
      message : textoMensaje,
      buttons: [
         {
          text: 'OK',
          handler: () => {
         
          }
        }
      ]
    });
    await alertaNotificacion.present();
  }


  async mostrarAlertaDeConexionExitosa(texto : string, nombreDispositivo : string){
    var self = this;
    const alertaNotificacion = await this.alertController.create({
      header : 'Notificación',
      message :texto ,
      buttons: [
         {
          text: 'OK',
          handler: () => {
            self.salirDeConfiguracion('conexion', nombreDispositivo);
          }
        }
      ]
    });
    await alertaNotificacion.present();
  }


  activarLoading(mensajeLoad) {
    this.loadCtrl.create({
        message: mensajeLoad,
    }).then((response) => {
        response.present();
    });
  }

  desactivarLoading() {
    this.loadCtrl.dismiss().then((response) => {
        console.log('Loader closed!', response);
    }).catch((err) => {
        console.log('Error occured : ', err);
    });
  }



}
