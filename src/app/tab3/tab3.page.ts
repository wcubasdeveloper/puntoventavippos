import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from './../Servicio/usuario.service';
import { ModalController } from '@ionic/angular';
import { ConfiguracionImpresoraPage } from './../tab3/configuracion-impresora/configuracion-impresora.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';

import { DatosGeneralesService} from './../Servicio/datos-generales.service';
import { IImpresoraModel } from '../Modelos/iimpresora-model';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  nombreUsuarioYPersonaLogin : string;
  nombreEmpresaLogin : string;
  modalConfiguracion = null;
  estadoCheckedBluet : boolean = false;
  estadoBluethooDispositivo : boolean = false;
  estadoImpresoraConexion : any = {
    color: '',
    texto : ''
  }

  TEXTOOOO : string;
  botonterminarviaje = null;
  public toggle = false;
  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    public modalController: ModalController,
    public bluetoothle: BluetoothLE,
    public bluetoothSerial : BluetoothSerial,
    public datosGeneralesService : DatosGeneralesService,
    public alertController: AlertController,
    public loadCtrl: LoadingController

  ) {}

  cerrarSesion(){
    localStorage.removeItem('datosUsuarioLogin');
    this.router.navigateByUrl('login', {replaceUrl : true});

  }

  async ngOnInit() {
    this.botonterminarviaje = document.getElementById("botonEstadoBlut");

  }


  ionViewWillEnter() { 
    this.botonterminarviaje = document.getElementById("botonEstadoBlut");
    var datosusuariologin  = this.usuarioService.obtenerDatosSesionUsuario();
    this.nombreUsuarioYPersonaLogin = '[' + datosusuariologin.NomUsuario + '] ' +   datosusuariologin.NomEmpleado;
    this.nombreEmpresaLogin = datosusuariologin.NomEmpresa;
    this.verificarConexionConImpresora();

  }

  async abrirConfiguracion(){
    console.log("abrirConfiguracion->>")
    var self_ = this;
    const modal = await this.modalController.create({
      component: ConfiguracionImpresoraPage,
      cssClass: 'my-custom-class',
      componentProps: 
      { 
        
      },
    });
    
    this.modalConfiguracion = modal;
    await modal.present();
    const datamodal = await modal.onWillDismiss();
    
    //var estadoImpresora = this.datosGeneralesService.getLocalStorageImpresoraConectada();
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    var codigoImpresora = datosUsuario.IdImpresora;

    //console.log("ESTADO IMPRESORA", JSON.stringify(estadoImpresora));
    //
    if(codigoImpresora){
      let macImpresora = codigoImpresora.split('_').join(':');

      if(!macImpresora){
        self_.botonterminarviaje.innerHTML = 'Impresora desconectada <ion-icon name="bluetooth-outline"></ion-icon>';
        self_.botonterminarviaje.setAttribute('color', 'danger');
        
      }else{
        if(datamodal.data["realizoconexion"] == true){
          var nombreDipositivoConectado = datamodal.data["nombredispositivo"];
          self_.botonterminarviaje.innerHTML = 'Conectado [' + macImpresora + '] <ion-icon name="bluetooth-outline"></ion-icon>';
          self_.botonterminarviaje.setAttribute('color', 'success');
        }
      }

    }


    
  }

  verificarConexionConImpresora(){
    this.verificaBluethooActivo();
  }

  verificaBluethooActivo(){

    var self_ = this;
    this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado

      this.estadoCheckedBluet  = true;
      this.estadoBluethooDispositivo = true;

      var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
      var codigoImpresora = datosUsuario.IdImpresora;

      if(codigoImpresora){
        let macImpresora = codigoImpresora.split('_').join(':');
        var impresoraConectada = macImpresora;

        if(impresoraConectada){ //si ya tuvo una impresora conectada entonces verifico
  
          //self_.botonterminarviaje.innerHTML = "dwdadada";
          this.bluetoothSerial.isConnected().then(success=>{
            self_.desactivarLoading();
            self_.estadoImpresoraConexion.color = "success";
            self_.estadoImpresoraConexion.texto = "Conectado";
  
            self_.botonterminarviaje.innerHTML = 'Conectado ['+ impresoraConectada +']<ion-icon name="bluetooth-outline"></ion-icon>';
            self_.botonterminarviaje.setAttribute('color', 'success');
            
            console.log("IS CONEECTED", JSON.stringify(success) );
          },error=>{
            self_.activarLoading("Intentando conectar con la impresora.");
            console.log("NOT IS CONEECTED");
            
            this.bluetoothSerial.connect(impresoraConectada).subscribe(success=>{
              self_.desactivarLoading();
              // self_.estadoImpresoraConexion.color = "success";
              // self_.estadoImpresoraConexion.texto = "Conectado";
              console.log("<<<<EXITO>>>>");
           
              //var boton = document.getElementById("botonEstadoBlut");
              //boton.innerHTML = 'Gdawdawdawdaw';
  
              self_.botonterminarviaje.innerHTML = 'Conectado ['+ impresoraConectada +']<ion-icon name="bluetooth-outline"></ion-icon>';
              self_.botonterminarviaje.setAttribute('color', 'success');
              
  
            },error=>{
              self_.desactivarLoading();
              localStorage.removeItem('ImpresoraConectada');
              self_.estadoImpresoraConexion.color = "danger";
              self_.estadoImpresoraConexion.texto = "Desconectado";
  
              self_.botonterminarviaje.innerHTML = 'Impresora desconectada<ion-icon name="bluetooth-outline"></ion-icon>';
              self_.botonterminarviaje.setAttribute('color', 'danger');
              self_.mostrarAlerta("No se pudo conectar a la impresora, intenta conectar desde el botón de configuración.");
            });
  
          });
  
  
        }else{
  
          
          self_.botonterminarviaje.innerHTML = 'Impresora desconectada <ion-icon name="bluetooth-outline"></ion-icon>';
          self_.botonterminarviaje.setAttribute('color', 'danger');
  
        }

      }


      //verifico si está conectado con la impresora que tenia conectada
    },errors=>{
      this.estadoCheckedBluet  = false;
      this.estadoBluethooDispositivo = false;
      // this.mostrarAlertaActivacionBlu();
    });
    
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


  cambioToggleBluet($event): void {

    this.bluetoothSerial.isEnabled().then(response=>{ //verificando si el blut está activo
      $event.target.checked = true;
    },errors=>{
      
      //activando el blut
      this.bluetoothSerial.enable().then(response=>{
        console.log("ACTIVASTE", JSON.stringify(response))
        $event.target.checked = true;
        this.estadoCheckedBluet = $event.target.checked;

      },error=>{
        $event.target.checked = false;
        this.estadoCheckedBluet = $event.target.checked;
      });


    });


    
    // this.estadoCheckedBluet =  $event.target.checked;

    // this.bluetoothSerial.enable().then(response=>{
    //   console.log("ACTIVASTE", JSON.stringify(response))
    //   $event.target.checked = true;
    //   this.estadoCheckedBluet = $event.target.checked;
    // },error=>{
    //   $event.target.checked = false;
    //   this.estadoCheckedBluet = $event.target.checked;
    // });


    //$event.target.checked = false;

    //this.estadoCheckedBluet = false;

    // console.log('$event.value->', $event.target.checked);
    // if ($event.value == this.toggle) {
    //   return;
    // }
  }

  verificarEstadoConexionImpresora(){
    this.bluetoothSerial.isConnected().then(() => {
      // this.bluetoothSerial.write(data).then((success) => {
      //   console.log('written: ' + data + ' success ' + success);
      //   alert(data + " Written to device!");
      // },
      // (error) => {
      //   alert('error writing: ' + error);
      // });
    }, (error) => {
      console.log('Operation not completed as device not connected');
  
    });
  }


}
