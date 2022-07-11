import { Component, ViewChild, ElementRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { VentanaAsientosPage } from '../tab1/paginas/ventana-asientos/ventana-asientos.page';
import { DatosGeneralesService } from './../Servicio/datos-generales.service';
import { ProgramacionService } from './../Servicio/programacion.service';
import { UsuarioService } from './../Servicio/usuario.service';
import { Router } from '@angular/router';

import { IPuntoModel } from 'src/app/Modelos/ipunto-model';
import { IProgramacionModel } from '../Modelos/iprogramacion-model';
import { IOrigenDestinoStorage } from '../Modelos/iorigen-destino-storage';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';
// import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})


export class Tab1Page {

  constructor(
    public modalController: ModalController,
    public datosGeneralesService: DatosGeneralesService,
    public programacionService: ProgramacionService,
    public usuarioService: UsuarioService,
    public bluetoothSerial : BluetoothSerial,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadCtrl: LoadingController,
    public bluetoothle: BluetoothLE,
    private router: Router
    ) {}

    // myGroup : FormGroup;
    minDate: string = new Date().toISOString();
    fechaActual: any = new Date().toISOString();
    estadoBluethooEnCelular : boolean = false;

    datosPuntos : IOrigenDestinoStorage = {
      CodOrigen : 0,
      CodDestino : 0
    };

    datoPuntos :IPuntoModel[];
    datoProgramacion : IProgramacionModel[];
    currentModal = null;
    // @ViewChild('input') inputFecha :ElementRef; 
    codPuntoInicioSeleccionado = null;
    codPuntoDestinoSeleccionado = null;
    textoPuntoInicioSeleccionado = null;
    textoPuntoDestinoSeleccionado = null;

    fechaSeleccionada = null;
    //
    mensajeListaProgramacion = null;
    isLoading = false;
    // formGroupOrigenDestino : FormGroup;


    @ViewChild('puntoInicio') inputPuntoOrigen!: ElementRef;
    @ViewChild('puntoDestino') inputPuntoDestino!: ElementRef;

  async abrirAsientosDisponibles(objViaje){
    //
    console.log("----> ",
    this.textoPuntoInicioSeleccionado  + " - " + this.textoPuntoDestinoSeleccionado);
    //
    console.log("CODIGO-->", this.codPuntoInicioSeleccionado, this.codPuntoDestinoSeleccionado)
    const modal = await this.modalController.create({
      component: VentanaAsientosPage,
      cssClass: 'my-custom-class',
      componentProps: 
      { 
        ruta : this.textoPuntoInicioSeleccionado  + " - " + this.textoPuntoDestinoSeleccionado,
        horasalida : objViaje.HoraInicioBus,
        cantidadasientos : objViaje.Capacidad,
        codOrigen : this.codPuntoInicioSeleccionado,
        codDestino : this.codPuntoDestinoSeleccionado,
        codProgramacion : objViaje.CodProgramacion,
        tarifaPasaje : objViaje.TarifaPasaje,
        codCuidadOrigen : objViaje.CodCiudadOrigen,
        codCuidadDestino : objViaje.CodCiudadDestino        
      },
    });
    
    this.currentModal = modal;
    await modal.present();
    const datamodal = await modal.onWillDismiss();
    
    if(datamodal.data["mostrarrecorrido"]){
      
    }
  }

  // inicializarFormulario(){
    
  //     this.formGroupOrigenDestino = new FormGroup({
  //       origen : new FormControl('0', [Validators.required]),
  //       destino : new FormControl('0', [Validators.required])
  //     });
    
  // }

  
  cambioPuntoInicio(codPuntoInicio, elemento){
    // console.log("DESTINO -> ",this.inputPuntoDestino["value"]);
    
    this.datosPuntos.CodOrigen = codPuntoInicio;
    this.datosPuntos.CodDestino = this.inputPuntoDestino["value"];
    this.datosGeneralesService.setLocalStorageOrigenDestino(this.datosPuntos);

    this.codPuntoInicioSeleccionado = codPuntoInicio;
    this.obtenerTextoPunto(Number(this.codPuntoInicioSeleccionado), "ORIGEN");
    this.listarProgramacion();
  }

  cambioPuntoDestino(codPuntoDestino){
    this.datosPuntos.CodOrigen = this.inputPuntoOrigen["value"];
    this.datosPuntos.CodDestino = codPuntoDestino;
    // console.log("codPuntoOrigen->", this.inputPuntoOrigen["value"]);

    //console.log("codPuntoDestino->", codPuntoDestino);
    

    this.datosGeneralesService.setLocalStorageOrigenDestino(this.datosPuntos);
    this.codPuntoDestinoSeleccionado = codPuntoDestino;    
    this.obtenerTextoPunto(Number(this.codPuntoDestinoSeleccionado), "DESTINO");
    this.listarProgramacion();
  }

  cambioFecha(){
    this.fechaSeleccionada = this.fechaActual;
    // textoPuntoInicioSeleccionado = null;
    // textoPuntoDestinoSeleccionado = null;
    this.listarProgramacion();
  }


  //HORAS_DIF_LOCAL_MILISEC = 18000000; //DIFERENCIA 5 HORAS EN MILISEGUNDOS
  origenSeleccionado : string = "0";
  destinoSeleccionado :  string = "0";
  //
  ngOnInit() { 
    console.log("ENTRO AL IIIIIINIT-->");
    ////////////////
    var diferenciaLocalTiempo = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var fechaHoraFormatoISOLocal = (new Date(Date.now() - diferenciaLocalTiempo)).toISOString().slice(0, -1);
    this.fechaActual = fechaHoraFormatoISOLocal;
    this.minDate = fechaHoraFormatoISOLocal;
    //console.log(localISOTime)  // => '2015-01-26T06:40:36.181'
    this.fechaSeleccionada = fechaHoraFormatoISOLocal;
    this.listarPuntos();
  }
  

  // async ionViewWillEnter() {

  //   //console.log("verificaSiEstaFueraDeFecha->", this.verificaSiEstaFueraDeFecha());
  //   ////////////////
  //   var datosStorageOrigenDestino = this.datosGeneralesService.getLocalStorageOrigenDestino();
  //   console.log(datosStorageOrigenDestino);
  //   if(datosStorageOrigenDestino){
  //     //this.datosPuntos = datosStorageOrigenDestino;
  //   }

  //   var diferenciaLocalTiempo = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  //   var fechaHoraFormatoISOLocal = (new Date(Date.now() - diferenciaLocalTiempo)).toISOString().slice(0, -1);
  //   this.fechaActual = fechaHoraFormatoISOLocal;
  //   this.minDate = fechaHoraFormatoISOLocal;

  //   //console.log(localISOTime)  // => '2015-01-26T06:40:36.181'
  //   this.fechaSeleccionada = fechaHoraFormatoISOLocal;
  //   this.listarPuntos();
  //   this.listarProgramacion();
    
  //   //this.verificaBluethooActivo(); //verifica y activa el bluethoo
  //   // this.initFormRegistro();
  // }

  // verificaSiEstaFueraDeFecha(){
  //   let estaFueraDeFecha : Boolean = false;

  //   var datoUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
  //   console.log("datoUsuario-<", datoUsuario)
  //   if(datoUsuario != null){
  //     var fechaLogeo = datoUsuario.FechaIngreso;
  //     console.log("fechaLogeo->", fechaLogeo);
  //     if(fechaLogeo){
  //       var dia = fechaLogeo.split('/')[0];
  //       var mes = fechaLogeo.split('/')[1];
  //       var anio = fechaLogeo.split('/')[2];
  //       var fechahora =  new Date(mes + '-' + dia + '-' + anio);
  //       var timestamp = fechahora.getTime();
  //       var timestampLocalIngreso = timestamp - this.HORAS_DIF_LOCAL_MILISEC;
  //       //
  //       /// fecha hoy
  //       var hoyfecha = new Date();
  //       var fechaHoy = new Date((hoyfecha.getMonth() + 1)  + '-' + hoyfecha.getDate() + '-' + hoyfecha.getFullYear());
  //       var timestampFechaHoy = fechaHoy.getTime() -  this.HORAS_DIF_LOCAL_MILISEC;

  //       if(timestampLocalIngreso != timestampFechaHoy){
  //         estaFueraDeFecha = true;
  //       }

  //     }
  //   }

  //   return estaFueraDeFecha;
  // }


  ngOnDestroy(){
    console.log("<<<<<<---------------DESTROY TAB 1------------>>>>>>>")
    //this.cerrarSesion();
  }


  cerrarSesion(){
    localStorage.removeItem('datosUsuarioLogin');
    this.router.navigateByUrl('login', {replaceUrl : true});
  }

  // initFormRegistro(){
  //    this.myGroup = new FormGroup({
  //      puntoOrigen: new FormControl('', [Validators.required]),
  //      puntoDestino: new FormControl('', [Validators.required])
  //    });
    
  //  }

  listarPuntos(){
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    this.datosGeneralesService.listarPuntos(datosUsuario.CodEmpresa).subscribe(result => {
      
      var rptaJSON = JSON.parse(result);
      this.datoPuntos = rptaJSON["dt0"];
      
      var datosStorageOrigenDestino = this.datosGeneralesService.getLocalStorageOrigenDestino();
      console.log("DATOS ORIGEN DESTINO->",datosStorageOrigenDestino);
      //
      if(datosStorageOrigenDestino){
        let origenEnStorage = datosStorageOrigenDestino.CodOrigen;
        let destinoEnStorage = datosStorageOrigenDestino.CodDestino;
        //
        this.origenSeleccionado = origenEnStorage;
        this.destinoSeleccionado = destinoEnStorage;
        //
        this.codPuntoInicioSeleccionado = this.origenSeleccionado;
        this.codPuntoDestinoSeleccionado =  this.destinoSeleccionado;
        //
        this.obtenerTextoPunto(this.codPuntoInicioSeleccionado,"ORIGEN");
        this.obtenerTextoPunto(this.codPuntoDestinoSeleccionado,"DESTINO");
      }
      this.listarProgramacion();

    });
  }
  
  listarProgramacion(){

    this.mensajeListaProgramacion = "Cargando...";
    this.mensajeListaProgramacion = null;
    this.fechaSeleccionada = this.fechaSeleccionada.split("T")[0]; //fecha con el formato que elegí
    
    //
    this.programacionService.listarProgramacion(this.fechaSeleccionada, Number(this.codPuntoInicioSeleccionado), Number(this.codPuntoDestinoSeleccionado) ).subscribe(result => {
   
    var rptaJSON = JSON.parse(result);
    this.datoProgramacion = rptaJSON["dt0"];
  
    if(this.datoProgramacion.length == 0){
      this.mensajeListaProgramacion = "no se ha encontrado la programación para la fecha "  + this.fechaSeleccionada +
      (this.textoPuntoInicioSeleccionado &&  this.textoPuntoDestinoSeleccionado  ? " [" +this.textoPuntoInicioSeleccionado + " - " + this.textoPuntoDestinoSeleccionado +"]" : '' );
    }else{
      this.mensajeListaProgramacion = null;
    }
      
    })
  }

  ionViewDidLoad() {
    console.log("DID LOADDDDDDDDDD");

  }


  activarLoading() {
    this.loadCtrl.create({
        message: 'Espere...',
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

  obtenerTextoPunto(codPunto : number, tipoPunto: string) {
    this.datoPuntos.forEach(punto => {
      if(Number(codPunto) == Number(punto.CodPunto)){
        
        switch (tipoPunto) {
          case "ORIGEN":
            this.textoPuntoInicioSeleccionado = punto.NomPunto;
            break;
          case "DESTINO":
            this.textoPuntoDestinoSeleccionado = punto.NomPunto;
            break;
          default:
            break;
        }

      }
    });
  }

  verificaBluethooActivo(){
    console.log("verificaBluethooActivo");
    
    this.bluetoothSerial.isEnabled().then(response=>{
      console.log("está habilitado");
      
    },errors=>{
      this.mostrarAlertaActivacionBlu();
      // console.log("esta deshabilitado", JSON.stringify(errors));
      // this.bluetoothSerial.enable();
    });
    
  }

  async mostrarAlertaActivacionBlu(){
    const alertaNotificacion = await this.alertController.create({
      header : 'Notificación',
      message : 'El Bluetooth no está activo, es necesario activarlo para usar la impresora inalambrica.',
      buttons: [
         {
          text: 'OK',
          handler: () => {
            this.bluetoothSerial.enable().then(response=>{
              console.log("ACTIVASTE", JSON.stringify(response))

            },error=>{
              // console.log("NO ACTIVASTE", JSON.stringify(error))
              this.mostrarAlertaNoActivoBlu();
            });
          }
        }
      ]
    });
    await alertaNotificacion.present();
    //this.router.navigate(["tabprincipal"]);
  }


  async mostrarAlertaNoActivoBlu(){
    const alertaNotificacion = await this.alertController.create({
      header : 'Notificación',
      message : 'Rechazaste la activación, recuerda que no podras conectarte a una impresora para la impresión de los boletos, sin embargo puedes configurar luego la impresora desde el panel de configuración.',
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

}
