import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DatosGeneralesService } from './../../../Servicio/datos-generales.service';
import { ThermalPrinterPlugin } from 'thermal-printer-cordova-plugin/src';
import { NavParams } from '@ionic/angular';
import { VentaService } from '../../../Servicio/venta.service';
import { UsuarioService } from '../../../Servicio/usuario.service';
import { IDatosImpresion } from '../../../Modelos/idatos-impresion';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';


declare let ThermalPrinter: ThermalPrinterPlugin;
@Component({
  selector: 'app-ventana-venta',
  templateUrl: './ventana-venta.page.html',
  styleUrls: ['./ventana-venta.page.scss'],
})
export class VentanaVentaPage implements OnInit {

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private router: Router,
    private datosGeneralesService: DatosGeneralesService,
    public loadCtrl: LoadingController,
    public toastController  : ToastController,
    private navParams : NavParams,
    private ventaService : VentaService,
    private usuarioService: UsuarioService,
    public bluetoothSerial : BluetoothSerial
    ) { }
  formGroup : FormGroup;
  activarDatosFactura : Boolean;
  textodigitadoennumdoctemp : any = null;
  codTipoDocSeleccionado : number;
  fechaNacDefault: string = new Date('1990-01-01').toISOString();
  asientoSeleccionado : any;
  rutaSeleccionada : string;
  precioEditable : boolean = false;
  horaSalida : string;
  tipoReciboSeleccionada : string = 'Boleta';
  codClientePasajeroBusqueda = 0;
  fechaActual: string = new Date().toISOString();
  botonguardar : any;
  datosImpresionBoleta : IDatosImpresion;

  IMPRESORA_ISCONECTADA : boolean = false;
  arrTipoDocumentos = [
    {
      value : '2',
      texto : 'DNI'
    },
    {
      value : '3',
      texto : 'C.EXT'
    },
    {
      value : '7',
      texto : 'PASAP'
    }
  ];

  preciodmrdaa : any;
  codCuidadOrigen : number = 0;
  codCuidadDestino : number = 0;
  ngOnInit() {
    console.log("ENTRE A LA VENTANA DE VENTA");
    //this.verificaBluethooActivo();
    this.codTipoDocSeleccionado = 2; //DURO
    
    this.activarDatosFactura = false;
    this.asientoSeleccionado =  {
      piso :  Number(this.navParams.get("piso")),
      numeroAsiento : Number(this.navParams.get("numeroAsiento")),
      codOrigen :  Number(this.navParams.get("codOrigen")),
      codDestino :  Number(this.navParams.get("codDestino")),
      codProgramacion : Number(this.navParams.get("codProgramacion")),
      tarifaSegunProgramacion :  this.navParams.get("tarifaPasaje"),
    }//

    this.rutaSeleccionada = this.navParams.get("rutaSeleccionada");
    this.horaSalida = this.navParams.get("horaSalida");
    this.botonguardar =  document.getElementById('btnRegistrarVenta');
    
    this.codCuidadOrigen =  Number(this.navParams.get("codCuidadOrigen"));
    this.codCuidadDestino =  Number(this.navParams.get("codCuidadDestino"));
    this.precioEditable = this.navParams.get("precioEditable");
    
    this.initForm();
  }

  autocompletarCeros(){
    this.buscarPersona();
    // console.log("<<<<<<autocompletarCeros>>>>>>>>>>>>");

  }

  async cerrarModal(){
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();

    const toastmensajepersonalizado = await this.toastController.create({
      message: '',
      duration: 2000,
      position : 'top'
    });
    //
    this.ventaService.bloquearAsiento(
      this.asientoSeleccionado.codProgramacion,
      this.asientoSeleccionado.numeroAsiento,
      datosUsuario.CodUsuario,
      '0'
      ).subscribe(result => {  
      var rptaJSON = JSON.parse(result);
      var dataRespuestaBloqueo = rptaJSON["dt0"][0];
      console.log("dataRespuestaBloqueo->", dataRespuestaBloqueo);
      var codResultado = Number(dataRespuestaBloqueo["CodResultado"]);
      var desResultado = dataRespuestaBloqueo["DesResultado"];
      //
      this.modalController.dismiss({
        'realizoventa': false
      });
    });
  }

  async verificaBluethooActivo(){

    var self_ = this;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Notificación',
      message : 'No tiene una impresora configurada',
      buttons: [
        {
          text: 'OK',
          handler: (data) => {
            

          }
        }
      ],
      backdropDismiss: false
    });

    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado

      
      var codigoImpresora = datosUsuario.IdImpresora;
      let macImpresora = codigoImpresora.split('_').join(':');

      if(macImpresora){ //si ya tuvo una impresora conectada entonces verifico

        //self_.botonterminarviaje.innerHTML = "dwdadada";
        this.bluetoothSerial.isConnected().then(success=>{
          console.log(">>>>>>ESTA CONECTADO <<<<<<<<<<<<<");
          self_.IMPRESORA_ISCONECTADA = true;

          setTimeout(() => this.imprimeSOLOOOO(), 1000);


        },error=>{

          self_.activarLoading("Intentando conectar con la impresora.");
          console.log("NOT IS CONEECTED");
          
          this.bluetoothSerial.connect(macImpresora).subscribe(success=>{

            self_.IMPRESORA_ISCONECTADA = true;
            setTimeout(() =>   self_.desactivarLoading(), 500);
            // self_.estadoImpresoraConexion.color = "success";
            // self_.estadoImpresoraConexion.texto = "Conectado";
            console.log("<<<<EXITO CONECTADO>>>>");
            setTimeout(() => this.imprimeSOLOOOO(), 1000);


            //var boton = document.getElementById("botonEstadoBlut");
            //boton.innerHTML = 'Gdawdawdawdaw';





          },error=>{
            setTimeout(() =>   self_.desactivarLoading(), 500);

            alert.message = "La impresora no se encuentra conectada, la venta se realizará pero no imprimirá el voucher.";
            alert.present();

            // self_.desactivarLoading();
            // localStorage.removeItem('ImpresoraConectada');
            // self_.estadoImpresoraConexion.color = "danger";
            // self_.estadoImpresoraConexion.texto = "Desconectado";

            // self_.botonterminarviaje.innerHTML = 'Impresora desconectada<ion-icon name="bluetooth-outline"></ion-icon>';
            // self_.botonterminarviaje.setAttribute('color', 'danger');
            // self_.mostrarAlerta("No se pudo conectar a la impresora, intenta conectar desde el botón de configuración.");
          });

        });
      }else{

        alert.message = "No tiene una impresora configurada, la venta se realizará pero no imprimirá el voucher.";
        alert.present();
                // self_.botonterminarviaje.innerHTML = 'Impresora desconectada <ion-icon name="bluetooth-outline"></ion-icon>';
        // self_.botonterminarviaje.setAttribute('color', 'danger');

      }
      //verifico si está conectado con la impresora que tenia conectada
    },errors=>{
      // this.estadoCheckedBluet  = false;
      // this.estadoBluethooDispositivo = false;
      // this.mostrarAlertaActivacionBlu();
      alert.message = "No tiene una impresora configurada, la venta se realizará pero no imprimirá el voucher.";
      alert.present();

    });
    
  }

  async printDEMOOO(){
    var self_ = this;
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    var codigoImpresora = datosUsuario.IdImpresora;
      let macImpresora = codigoImpresora.split('_').join(':');


      if(codigoImpresora){

   
          ThermalPrinter.printFormattedText({
            type: 'bluetooth',
            id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
            // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
            text :     
            "[C]<b>MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO</b>\n"
            // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
          }, function() {
              console.log('Successfully printed!');
              
              self_.bluetoothSerial.disconnect();

          }, function(error) {

              ThermalPrinter.disconnectPrinter({
                type: 'bluetooth',
                id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
                // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
                
                // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
              }, function() {
                  console.log('SE DESCONECTO LA MRDA!');
                  
              }, function(error) {
                console.log('NOOOO SE DESCONECTO LA MRDA!');
                  
              }); 


              console.log("<<<<<<<<<<ERRRRO AL IMPRIMIR>>>>")
              console.error('Printing error', JSON.stringify(error));
          });   
    


      }
  }

  async imprimeSOLOOOO(){
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    var codigoImpresora = datosUsuario.IdImpresora;
      let macImpresora = codigoImpresora.split('_').join(':');


    ThermalPrinter.printFormattedText({
      type: 'bluetooth',
      id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
      // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
      text :     
      "[C]<b>MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO</b>\n"
      // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
    }, function() {
        console.log('Successfully printed!');
        
    }, function(error) {
        console.log("<<<<<<<<<<ERRRRO AL IMPRIMIR>>>>")
        console.error('Printing error', JSON.stringify(error));

    });  
  }

  async imprimirDemo(){
    let self = this;
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Notificación',
      message : 'No tiene una impresora configurada',
      buttons: [
        {
          text: 'OK',
          handler: (data) => {
            

          }
        }
      ],
      backdropDismiss: false
    });

    if(datosUsuario){

      var codigoImpresora = datosUsuario.IdImpresora;
      let macImpresora = codigoImpresora.split('_').join(':');


      if(codigoImpresora){ //si tiene codigo de impresora

 
        this.bluetoothSerial.isConnected().then(success=>{
          ThermalPrinter.printFormattedText({
            type: 'bluetooth',
            id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
            // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
            text :     
            "[C]<b>MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO</b>\n"
            // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
          }, function() {
              console.log('Successfully printed!');
              
          }, function(error) {
              console.log("<<<<<<<<<<ERRRRO AL IMPRIMIR>>>>")
              console.error('Printing error', JSON.stringify(error));
              //self.mostrarNotificacion("Ocurrió un error al momento de imprimir, verifique que la impresora esté prendida y/o configurada correctamente.");
              alert.message = "Ocurrió un error al momento de imprimir, verifique que la impresora esté prendida y/o configurada correctamente.";
              alert.present();
              

              // alert.message = "Ocurrió un error al momento de imprimir, verifique que la impresora esté prendida y/o configurada correctamente.";
              // await alert.present();
          });    
      
        },errors=>{ //SI NO ESTÁ CONECTADO CONM LA IMPRESORA


          this.bluetoothSerial.connect(macImpresora).subscribe(success=>{

            ThermalPrinter.printFormattedText({
              type: 'bluetooth',
              id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
              // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
              text :     
              "[C]<b>MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO</b>\n"
              // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
            }, function() {
                console.log('Successfully printed!');
                
            }, function(error) {
                console.log("<<<<<<<<<<ERRRRO AL IMPRIMIR>>>>")
                console.error('Printing error', JSON.stringify(error));
                //self.mostrarNotificacion("Ocurrió un error al momento de imprimir, verifique que la impresora esté prendida y/o configurada correctamente.");
                alert.message = "Ocurrió un error al momento de imprimir, verifique que la impresora esté prendida y/o configurada correctamente.";
                alert.present();
                
  
                // alert.message = "Ocurrió un error al momento de imprimir, verifique que la impresora esté prendida y/o configurada correctamente.";
                // await alert.present();
            });  

          },error=>{
            console.log("OTRO ERRX2", JSON.stringify(error));
            alert.message = "NO PUDO CONECTAR CON LA IMPRESORA.";
            alert.present();
          });

          console.log("OCURRIO OTRO ERROR .")
          console.log("-->",JSON.stringify(errors))
          alert.message = "OCURRIO OTRO ERROR .";
          alert.present();
        }); 

    

        
      }else{ //aqui es por que no tiene configurado una impresora
        alert.message = "No tiene una impresora configurada";
        await alert.present();
      }

    }
  }

  async mostrarAlertaErrorAlImprimir(){
    const alertaERROR = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Notificación',
      message : 'Error al imprimir, verificar si la impresora está prendida o si está correctamente configurada.',
      buttons: [
        {
          text: 'OK',
          handler: (data) => {
            

          }
        }
      ],
      backdropDismiss: false
    });

    await alertaERROR.present;
  }

  calcularEdad(fechaNacimiento){
    console.log("edad", fechaNacimiento);
    
    var fechaNac = new Date(fechaNacimiento);
    var fechaHoy =  new Date();
    var anioNacimiento = fechaNac.getFullYear();
    var anioActual = fechaHoy.getFullYear();
    var edadActual = anioActual - anioNacimiento;
    console.log("edadActual->", edadActual);

    this.formGroup.patchValue({
      edad : edadActual
    });
  }

  initForm(){  

    //this.obtenerInformacionBoleto(120);

    var textoOrigen = this.rutaSeleccionada.split('-')[0].trim();
    var textoDestino = this.rutaSeleccionada.split('-')[1].trim();
    //
    this.formGroup = new FormGroup({
      precioBoleto : new FormControl(this.asientoSeleccionado.tarifaSegunProgramacion ? this.asientoSeleccionado.tarifaSegunProgramacion :   '0.00', [Validators.required]),
      tipoServicio : new FormControl('1', [Validators.required]),
      formaPago : new FormControl('1', [Validators.required]),
      numeroRUC  : new FormControl('', [Validators.required]),
      razonSocialRUC  : new FormControl('', [Validators.required]),
      direccionEmpresa  : new FormControl('', [Validators.required]),
      origen  : new FormControl(textoOrigen, [Validators.required]),
      destino  : new FormControl(textoDestino, [Validators.required]),
      tipoDocumento  : new FormControl('2', [Validators.required]),
      nroDocumento : new FormControl('', [Validators.required]),

      nombres : new FormControl('', [Validators.required]),
      apellidoPaterno : new FormControl('', [Validators.required]),
      apellidoMaterno : new FormControl('', [Validators.required]),
      fechaNacimiento :  new FormControl('', [Validators.required]),
      edad :  new FormControl('', [Validators.required]),
      telefono :  new FormControl('', [Validators.required]),
      correo :  new FormControl('', []),
      sexoPersona :  new FormControl('1', [Validators.required]),
      observacion :  new FormControl('', [])
    });
  }


  async guardarBoleto(){
    const alertFinishTour = await this.alertController.create({
      header : 'Notificación',
      message : 'Se realizó la venta con éxito !',
      buttons: [
         {
          text: 'OK',
          handler: () => {
            // this.imprimirBoleto();
          }
        }
      ]
    });
    await alertFinishTour.present();
    //this.router.navigate(["tabprincipal"]);
  }


  obtenerInformacionBoleto(codVenta : number){
    console.log("INFOOO");

    this.ventaService.consultarVenta(codVenta).subscribe(result => {
      console.log("result->", result);
    })
  }

  async onSubmit(){



    var self = this;
    var imprimirBoleta = false;
    //
    // var rucCliente = this.datosFormulario.numeroRUC.value;
    // if(this.tipoReciboSeleccionada == 'Factura'){

    // }
    
    const alertaErrorImpresora = await this.alertController.create({
      header : 'Notificación',
      message : '',
      buttons: [
        {
          text: 'OK',
          handler: () => {
          }
        },
      ],
      backdropDismiss: false
    });


    const alertaVerificaImp = await this.alertController.create({
      header : 'Notificación',
      message : '',
      buttons: [
        {
          text: 'SI',
          handler: () => {
            //console.log("<<<< GUARDA VENTA PEEE>>>>>");
            self.botonguardar.innerHTML = "Registrando pasaje...";
            self.botonguardar.setAttribute("disabled","disabled");
            //this.activarLoading('Registrando venta...');

            if(imprimirBoleta){
              this.guardaVentaVipPOS(imprimirBoleta);
            }
            
          }
        },
        {
          text: 'NO',
          handler: () => {
            console.log("---- PRESIONASTE NO -----");
          }
        },
      ],
      backdropDismiss: false
    });

    var self_ = this;
    this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado

//      var impresoraConectada = this.datosGeneralesService.getLocalStorageImpresoraConectada();
      var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
      var codigoImpresora = datosUsuario.IdImpresora;


      if(codigoImpresora){ //si ya tuvo una impresora conectada entonces verifico
        let macImpresora = codigoImpresora.split('_').join(':');

        //self_.botonterminarviaje.innerHTML = "dwdadada";

        ThermalPrinter.disconnectPrinter({
          type: 'bluetooth',
          id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
          // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
          
          // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
        }, function() {
            console.log('SE DESCONECTO LA MRDA!');
            
        }, function(error) {
          console.log('NOOOO SE DESCONECTO LA MRDA!');
            
        }); 

        this.bluetoothSerial.isConnected().then(success=>{ //si está conectado
          console.log("<<<<<<<YA ESTÄ CONECTADA>>>>>>>>>>>>");
          imprimirBoleta = true
          alertaVerificaImp.message = "Esta seguro de continuar con la venta ?";
          alertaVerificaImp.present();
 
        },error=>{ //impresora no conectada

          self_.activarLoading("Intentando conectar con la impresora.");

          this.bluetoothSerial.connect(macImpresora).subscribe(success=>{

            setTimeout(() =>   self_.desactivarLoading(), 500);
            imprimirBoleta = true;
            alertaVerificaImp.message = "Esta seguro de continuar con la venta ?";
            alertaVerificaImp.present();
          },error=>{
            alertaErrorImpresora.message = "Ocurrió un error en la configuración de la impresora, revise la configuración.";
            alertaErrorImpresora.present();

            setTimeout(() =>   self_.desactivarLoading(), 500);
          });
        });

      }else{ //no hay impresora en localstorage
        imprimirBoleta = false;
        alertaErrorImpresora.message = "La impresora no se encuentra configurada, revise la configuración.";
        alertaErrorImpresora.present();
        //alertaVerificaImp.message = "La impresora no se encuentra conectada, no se mostrará el voucher de la venta, para configurar la impresora entrar a la opción de configuración.";
      }

    },errors=>{ //blut desconectado
      imprimirBoleta = false;
      alertaErrorImpresora.message = "El Bluetooth desactivado, revise la configuración del dispositivo.";
      alertaErrorImpresora.present();
    });    
  }

 

  async guardaVentaVipPOS(imprimirBoleta : boolean){

    var self = this;
    var ventaExitosa = false;
    const confirmacionGuarda = await this.alertController.create({
      header : 'Notificación',
      message : '',
      buttons: [
         {
          text: 'OK',
          handler: () => {
            // self.router.navigate(["tabprincipal"]);
            if(ventaExitosa){
              self.modalController.dismiss({
                'realizoventa': true
              });
            }
          }
        }
      ]
    });

    var fechaNacimiento =  this.datosFormulario.fechaNacimiento.value.split("T")[0];

    var diferenciaLocalTiempo = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var fechaHoraFormatoISOLocal = (new Date(Date.now() - diferenciaLocalTiempo)).toISOString().slice(0, -1);
    // console.log("fechaHoraFormatoISOLocal->", fechaHoraFormatoISOLocal);
    var fechaActualFormatoAntiguo = fechaHoraFormatoISOLocal.split("T")[0];
    this.fechaActual =  fechaActualFormatoAntiguo;
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    var codDocumentoIdentidad = this.datosFormulario.tipoDocumento.value;    

    this.ventaService.guardarVenta(
      Number(datosUsuario.CodEmpresa), 
      Number(this.asientoSeleccionado.codProgramacion),
      Number(this.asientoSeleccionado.numeroAsiento),
      Number(this.codClientePasajeroBusqueda),
      Number(codDocumentoIdentidad),
      this.datosFormulario.nroDocumento.value,
      this.datosFormulario.nombres.value,
      this.datosFormulario.apellidoPaterno.value,
      this.datosFormulario.apellidoMaterno.value,
      fechaNacimiento,
      this.datosFormulario.correo.value,
      this.datosFormulario.edad.value,
      this.datosFormulario.telefono.value,
      '',
      this.datosFormulario.numeroRUC.value,
      this.datosFormulario.razonSocialRUC.value,
      this.datosFormulario.direccionEmpresa.value,
      (this.tipoReciboSeleccionada == 'Boleta' ? 2 : 1),
      this.fechaActual,
      this.datosFormulario.precioBoleto.value,
      this.asientoSeleccionado.codOrigen,
      this.datosFormulario.observacion.value,
      datosUsuario.CodUsuario,
      0,
      '',
      9,
      this.asientoSeleccionado.codOrigen,
      this.asientoSeleccionado.codDestino,
      0,
      this.datosFormulario.sexoPersona.value,
      this.datosFormulario.formaPago.value,
      this.codCuidadOrigen,
      this.codCuidadDestino   
    ).subscribe(result => {
      console.log("rptaJSON GUARDA->",JSON.stringify(result));
      //
      self.botonguardar.innerHTML = "REGISTRAR PASAJE";
      self.botonguardar.removeAttribute("disabled");
     // setTimeout(() => this.desactivarLoading(), 500);
      var codResultado = Number(result["CodResultado"]);
      var codVenta = 0;
      var desResultado = result["DesResultado"];
      //
      if(codResultado == 1){ //si la venta fue exitosa 
        ventaExitosa = true;
        if(!imprimirBoleta){ //si no imprimirá
          confirmacionGuarda.message = desResultado;
          confirmacionGuarda.present();
        }else{ 
          codVenta = result["CodAuxiliar"]; 
          this.ventaService.consultarVenta(codVenta).subscribe(result => {
            console.log("consultarVenta->", result);
            var _datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
            var codigoImpresora = datosUsuario.IdImpresora;
            let macImpresora = codigoImpresora.split('_').join(':');

            // var impresoraConectada = this.datosGeneralesService.getLocalStorageImpresoraConectada();

            //console.log("IMP CONECTADA->", JSON.stringify(impresoraConectada));
            self.datosImpresionBoleta = {
              AbrevTipoServicio: result["AbrevTipoServicio"],
              AceptadoSUNAT: result["AceptadoSUNAT"],
              ClaveEncomienda: result["ClaveEncomienda"] ,
              Cliente: result["Cliente"] ,
              ClienteConsignado: result["ClienteConsignado"] ,
              CodRubro: result["CodRubro"] ,
              CodVenta: result["CodVenta"] ,
              CodigoHash: result["CodigoHash"],
              CodigoQR: result["CodigoQR"] ,
              Destino: result["Destino"] ,
              Detalle: result["Detalle"] ,
              DireccionEmpresa: result["DireccionEmpresa"] ,
              DireccionPuntoOrigen: result["DireccionPuntoOrigen"] ,
              DocumentoReferenciaExceso: result["DocumentoReferenciaExceso"] ,
              FechaVenta: result["FechaVenta"] ,
              FechaViaje: result["FechaViaje"],
              Gravada: result["Gravada"] ,
              HoraSalida: result["HoraSalida"] ,
              HoraSalidaCliente: result["HoraSalidaCliente"] ,
              Igv: result["Igv"] ,
              NomCondicionPago: result["NomCondicionPago"] ,
              NomDocumento: result["NomDocumento"],
              NomEmpresa: result["NomEmpresa"] ,
              NomUsuario: result["NomUsuario"] ,
              NroAsiento: result["NroAsiento"] ,
              NroClienteConsignado: result["NroClienteConsignado"] ,
              NroDocumento: result["NroDocumento"] ,
              NroDocumentoIdentidad: result["NroDocumentoIdentidad"] ,
              DireccionCliente : result["DireccionCliente"] ,
              Origen: result["Origen"],
              PolizaSeguro: result["PolizaSeguro"] ,
              PuntoConsignado: result["PuntoConsignado"] ,
              RUCEmpresa: result["RUCEmpresa"] ,
              RutaImagenQR: result["RutaImagenQR"] ,
              Simbolo: result["Simbolo"],
              TelefonoEmpresa: result["TelefonoEmpresa"] ,
              Total: result["Total"],
              TotalLetras: result["TotalLetras"],
              Pasajero :  result["Pasajero"],
              NroDocumentoPasajero :  result["NroDocumentoPasajero"],
              CodDocumento :  result["CodDocumento"],
              DireccionPunto: result["DireccionPunto"],
              Telefono: result["Telefono"],
              Telefono2: result["Telefono2"]
            }


            setTimeout(() => self.imprimirBoleto(self.datosImpresionBoleta, macImpresora), 1000);


            //
          })

        }

      }else{ //la venta no fue exitosa

        ventaExitosa = false;
        confirmacionGuarda.message = desResultado;
        confirmacionGuarda.present();
      }

    });
  }


  async verificaImpresoraConectada(){

    const alertaVerificaImp = await this.alertController.create({
      header : 'Notificación',
      message : '',
      buttons: [
         {
          text: 'OK',
          handler: () => {
   
          }
        }
      ]
    });


    var self_ = this;
    this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado

      var impresoraConectada = this.datosGeneralesService.getLocalStorageImpresoraConectada();

      if(impresoraConectada){ //si ya tuvo una impresora conectada entonces verifico

        //self_.botonterminarviaje.innerHTML = "dwdadada";
        this.bluetoothSerial.isConnected().then(success=>{
          


          
        },error=>{ //impresora no conectada
          alertaVerificaImp.message = "La impresora no se encuentra conectada, no se mostrará el voucher de la venta, para configurar la impresora entrar a la opción de configuración.";
        });


      }else{ //no hay impresora en localstorage

        alertaVerificaImp.message = "La impresora no se encuentra conectada, no se mostrará el voucher de la venta, para configurar la impresora entrar a la opción de configuración.";
      }
      
    },errors=>{ //blut desconectado

      alertaVerificaImp.message = "La impresora no se encuentra conectada, no se mostrará el voucher de la venta, para configurar la impresora entrar a la opción de configuración.";
      
    });
    
  }

  hacerFocus(nextElement) {
    console.log("DIO ENTERRRR");
    nextElement.setFocus(); //For Ionic 4
   //nextElement.focus(); //older version
  }

  get datosFormulario() { return this.formGroup.controls; }

  yourSearchFunction(){
    console.log("SEACH!!");
  }

  buscarDatosEmpresa(){
    this.activarLoading('Espere...');
    var numeroRUCConsulta = this.datosFormulario.numeroRUC.value;


    this.datosGeneralesService.consultaDatosEmpresa(numeroRUCConsulta).subscribe(result => {
      
      setTimeout(() => this.desactivarLoading(), 500);
      var rptaJSON = JSON.parse(result);
    
      var dataClienteEmpresa = rptaJSON["dt0"][0];
      console.log("dataClienteEmpresa->", dataClienteEmpresa);
      var razonSocialResultado  = dataClienteEmpresa["RazonSocial"];
      var direccionResultado = dataClienteEmpresa["DireccionCliente"];

      console.log("direccionResultado", direccionResultado);
      if(razonSocialResultado.length > 5){
          this.formGroup.patchValue({
            razonSocialRUC :  razonSocialResultado
          });
      }

      if(direccionResultado.length > 5){
        
        this.formGroup.patchValue({
          direccionEmpresa :  direccionResultado
        });
      }

      // var nombresCliente = dataCliente["NombresCliente"];

      // console.log("dataCliente->", dataCliente);

      // this.codClientePasajeroBusqueda = dataCliente["CodCliente"];
      //
      // if(nombresCliente){
       

      //   this.formGroup.patchValue({
      //     numeroRUC : numeroRUCConsulta,
      //     nombres : nombresCliente,
      //     apellidoPaterno :  dataCliente["PaternoCliente"],
      //     apellidoMaterno :  dataCliente["MaternoCliente"]
      //   });


      //   this.datosFormulario.nombres.enable();
      //   this.datosFormulario.apellidoPaterno.enable();
      //   this.datosFormulario.apellidoMaterno.enable();
      // }
    },error=>{
      setTimeout(() => this.desactivarLoading(), 500);
      this.mostrarNotificacion("Ocurrió un error en la busqueda de datos");
      this.datosFormulario.razonSocialRUC.enable();
      this.datosFormulario.direccionEmpresa.enable();
    })


  }


  buscarPersona() {
   
    this.activarLoading('Espere...');
    var numeroDocumentoConsulta = this.datosFormulario.nroDocumento.value;

    this.datosGeneralesService.consultaDatosPersona(numeroDocumentoConsulta).subscribe(result => {
      
      setTimeout(() => this.desactivarLoading(), 500);

      
      this.datosFormulario.nombres.enable();
      this.datosFormulario.apellidoPaterno.enable();
      this.datosFormulario.apellidoMaterno.enable();
      
      var rptaJSON = JSON.parse(result);
      var dataCliente = rptaJSON["dt0"][0];
      var nombresCliente = dataCliente["NombresCliente"];

      console.log("dataCliente->", dataCliente);

      this.codClientePasajeroBusqueda = dataCliente["CodCliente"];
      //
      if(nombresCliente){
        // this.formGroup.setValue({
        //   nrodocumento : numeroDocumentoConsulta,
        //   nombres : nombresCliente,
        //   apellidoPaterno :  dataCliente["PaternoCliente"],
        //   apellidoMaterno :  dataCliente["MaternoCliente"]
        // });

        this.formGroup.patchValue({
          nroDocumento : numeroDocumentoConsulta,
          nombres : nombresCliente,
          apellidoPaterno :  dataCliente["PaternoCliente"],
          apellidoMaterno :  dataCliente["MaternoCliente"],
          telefono :  dataCliente["Telefono"],
          correo :  dataCliente["CorreoCliente"],
          fechaNacimiento :  dataCliente["FechaNacimiento"],
          edad :  dataCliente["Edad"]
        });



        // this.datosFormulario.fechaNacimiento.enable();
        // this.datosFormulario.telefono.enable();
        // this.datosFormulario.correo.enable();
        // this.datosFormulario.observacion.enable();

      }
    },error=>{
      setTimeout(() => this.desactivarLoading(), 500);
      this.mostrarNotificacion("Ocurrió un error en la busqueda de datos");
      this.datosFormulario.nombres.enable();
      this.datosFormulario.apellidoPaterno.enable();
      this.datosFormulario.apellidoMaterno.enable();

      // this.datosFormulario.fechaNacimiento.enable();
      // this.datosFormulario.telefono.enable();
      // this.datosFormulario.correo.enable();
      // this.datosFormulario.observacion.enable();

    })
  }

  async mostrarNotificacion(texto : string){
    const toast = await this.toastController.create({
      message: texto,
      duration: 8000,
      position : 'middle'
    });
    toast.present();
  }

  cambioTipoDNI(codTipoDocumento){
    console.log("<<<<<<<cambioTipoDNI>>>>>>>>>");
    this.codTipoDocSeleccionado = Number(codTipoDocumento);
  }

  verificasiborro(event){

    var lentextoanterior = (!this.textodigitadoennumdoctemp ? null : this.textodigitadoennumdoctemp.length);
    var lenTextoActual = event.target.value.length;
    var lendiffanterior = (!lenTextoActual ? 0 : lenTextoActual) - lentextoanterior;
    
    //console.log("lentextoanterior->", lentextoanterior, 'lenTextoActual->',lenTextoActual);

    if(lentextoanterior && lenTextoActual){
      if(lentextoanterior > lenTextoActual){ //borró
        this.formGroup.patchValue({
          nombres : '',
          apellidoPaterno : '',
          apellidoMaterno : ''
        });

        
      }
    }
    // console.log(this.textodigitadoennumdoctemp, event.target.value);
    this.textodigitadoennumdoctemp = event.target.value;
    // var lendiffposterior = 

  }


  verificasiborroRUC(event){

    var lentextoanterior = (!this.textodigitadoennumdoctemp ? null : this.textodigitadoennumdoctemp.length);
    var lenTextoActual = event.target.value.length;
    var lendiffanterior = (!lenTextoActual ? 0 : lenTextoActual) - lentextoanterior;
    
    //console.log("lentextoanterior->", lentextoanterior, 'lenTextoActual->',lenTextoActual);

    if(lentextoanterior && lenTextoActual){
      if(lentextoanterior > lenTextoActual){ //borró
        this.formGroup.patchValue({
          razonSocialRUC : '',
          direccionEmpresa : ''
        });

        
      }
    }
    // console.log(this.textodigitadoennumdoctemp, event.target.value);
    this.textodigitadoennumdoctemp = event.target.value;
    // var lendiffposterior = 

  }


  cambioTipoRecibo(el){
    //  console.log("el", el.detail.value)
    var tipoRecibo = el.detail.value;
    this.tipoReciboSeleccionada = tipoRecibo;
    //
    if(tipoRecibo == "Factura"){
      this.activarDatosFactura = true;
    }else{
      this.activarDatosFactura = false;
    }
    
  }

  activarLoading(textoMEnsaje : string) {
    this.loadCtrl.create({
        message: textoMEnsaje ,
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

  guardaVenta(){

    console.log('guarda-->',this.asientoSeleccionado);

    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    console.log()
    // this.ventaService.guardarVenta(Number(datosUsuario.CodEmpresa),).subscribe(result => {
    //   var rptaJSON = JSON.parse(result);
    // })
  }

  
  verifiCerosEnNumDocumentos(numdocumento, tipodocumento){
    console.log("verifiCerosEnNumDocumentos->",numdocumento, tipodocumento)
    var rptaDocumento = numdocumento;
    if(Number(tipodocumento) == 2){
      rptaDocumento = this.pad(Number(numdocumento),8);

    }else{
      rptaDocumento = this.pad(Number(numdocumento),9);
    }

    return rptaDocumento;
  }

  pad(num, size) {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }

  cancelarRegistro(){
    
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    this.ventaService.bloquearAsiento(
      this.asientoSeleccionado.codProgramacion,
      this.asientoSeleccionado.numeroAsiento,
      datosUsuario.CodUsuario,
      '0'
      ).subscribe(result => {  
      var rptaJSON = JSON.parse(result);
      var dataRespuestaBloqueo = rptaJSON["dt0"][0];
      // console.log("dataRespuestaBloqueo->", dataRespuestaBloqueo);
      var codResultado = Number(dataRespuestaBloqueo["CodResultado"]);
      var desResultado = dataRespuestaBloqueo["DesResultado"];
      //
      this.modalController.dismiss({
        'realizoventa': false
      });
    });
  }


  ngOnDestroy(){
    console.log("<<<<<<---------------DESTROY------------>>>>>>>")
    // var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();

    // this.ventaService.bloquearAsiento(
    //   this.asientoSeleccionado.codProgramacion,
    //   this.asientoSeleccionado.numeroAsiento,
    //   datosUsuario.CodUsuario,
    //   '0'
    //   ).subscribe(result => {  
    //   var rptaJSON = JSON.parse(result);
    //   var dataRespuestaBloqueo = rptaJSON["dt0"][0];
    
    // });
  }


  async imprimirBoleto(datosImpresion : IDatosImpresion, codigoImpresora : string){

    var self = this;
    const alertaReimprimir = await this.alertController.create({
      header : 'Reimprimir',
      message : 'Reimprimir boleto',
      buttons: [
        {
          text: 'SI',
          handler: () => {

            self.modalController.dismiss({
              'realizoventa': true
            });
            self.reimprimirBoleto(datosImpresion,codigoImpresora);
          }
        },
         {
          text: 'NO',
          handler: () => {
            self.bluetoothSerial.disconnect();
            self.modalController.dismiss({
              'realizoventa': true
            });
            console.log("---- PRESIONASTE NO -----");
          }
        },
      ],
      backdropDismiss: false
    });

    console.log("ENTRO AL IMPRIMIR BOLETO->", codigoImpresora);
    var diferenciaLocalTiempo = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var fechaHoraFormatoISOLocal = (new Date(Date.now() - diferenciaLocalTiempo)).toISOString().slice(0, -1);

    // console.log("fechaHoraFormatoISOLocal->", fechaHoraFormatoISOLocal);
    var fechaActualFormatoAntiguo = fechaHoraFormatoISOLocal.split("T")[0];
    var mesActual =  fechaActualFormatoAntiguo.split('-')[1];
    var anioActual = fechaActualFormatoAntiguo.split('-')[0];
    var diaActual = fechaActualFormatoAntiguo.split('-')[2];
    var horaActual = fechaHoraFormatoISOLocal.split("T")[1];
    var fechaFormatoCliente = diaActual + "/" + mesActual + "/" + anioActual + " " + horaActual;
    // console.log("fechaFormatoCliente->", fechaFormatoCliente);
    var nombreServicio = datosImpresion.Detalle ?  datosImpresion.Detalle.split('|')[1] : '';
    var codTipoDocumento = datosImpresion.CodDocumento;

  // RAPIDO VIP S.A.
  // 20602482520
  // MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO
  // CEL: 960058180

    ThermalPrinter.printFormattedText({
      type: 'bluetooth',
      id: codigoImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
      // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
      text :     
      "[C]<b>RAPIDO VIP S.A.</b>\n" +
      "[C]<b>20602482520</b>\n" +
      "[C]<b>"+ datosImpresion.DireccionEmpresa +"</b>\n" +
      "[C]<b>"+ datosImpresion.Telefono + (datosImpresion.Telefono2 ? " " + datosImpresion.Telefono2 :  "") +"</b>\n" +
      "[C]<b>"+ datosImpresion.NomDocumento +"</b>\n" +
      "[C]<b>"+ datosImpresion.NroDocumento +"</b>\n" +
      "[L]<b>F.EMISIÓN:</b>[R] "+datosImpresion.FechaVenta +" \n" +
      (Number(codTipoDocumento) == 1 ?  
        "[L]<b>RUC:</b>[R] " + datosImpresion.NroDocumentoIdentidad + "\n" +
        "[L]<b>RAZÓN SOCIAL:</b> " + datosImpresion.Cliente + "\n" +
        "[L]<b>DIRECCIÓN:</b> " + datosImpresion.DireccionCliente + "\n"
        : 
      ""
      ) +
      //RUC
      "[L]<b>DOC. PASAJERO:</b>[R] "+ datosImpresion.NroDocumentoPasajero +"\n" +
      "[L]<b>PASAJERO:</b> "+ datosImpresion.Pasajero +"\n" +
      "[L]<b>CAJERO:</b>[R] "+ datosImpresion.NomUsuario +"\n" +
      "[C]--------------------------------\n" +
      "[C]<font size='normal'>DETALLE DEL SERVICIO</font>\n" +
      "[L]<b>ORIGEN:</b>[R] " + datosImpresion.Origen + "\n" +
      "[L]<b>DESTINO:</b>[R] "+ datosImpresion.Destino +"\n" +
      "[L]<b>SERVICIO:</b>[R] "+ datosImpresion.AbrevTipoServicio +"\n" +
      "[L]<font size='big'><b>F.VIAJE:</b></font>[R]<font size='big'>"+ datosImpresion.FechaViaje +"</font>\n" +
      "[L]<font size='big'><b>H.SALIDA:</b></font>[R] <font size='big'>"+ datosImpresion.HoraSalida +"</font>\n" +
      "[L]<font size='big'><b>ASIENTO :</b></font>[R] <font size='big'>"+ datosImpresion.NroAsiento +"</font>\n" +
      "[L]<b>DIR. EMBARQUE:</b>[R] "+ datosImpresion.DireccionPuntoOrigen +"\n" +
      "[C]--------------------------------\n" +
      "[L]<b><font size='normal'>TOTAL</font></b>  [R]: <font size='normal'>"+ datosImpresion.Simbolo +" "+ datosImpresion.Total+"</font> \n" +
      "[L]" + datosImpresion.TotalLetras +"\n" +
      "[L]"+ datosImpresion.PolizaSeguro + "\n" +
      "[L]<b>BOLETA EMITIDA:</b> "+ datosImpresion.NomCondicionPago +"\n" +
      "[L]<b>F.Impresión:</b> \n"+ fechaFormatoCliente +"\n" +
      "[C]<qrcode size='20'>"+ datosImpresion.CodigoQR +"</qrcode>\n\n-" 
    }, function() {
        //console.log('Successfully printed!');
        alertaReimprimir.present();
        //
    }, function(error) {

      self.bluetoothSerial.disconnect();
      ThermalPrinter.disconnectPrinter({
        type: 'bluetooth',
        id: codigoImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
        // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
        
        // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
      }, function() {
          console.log('SE DESCONECTO LA MRDA!');
          
      }, function(error) {
        console.log('NOOOO SE DESCONECTO LA MRDA!');
          
      }); 
        console.error('Printing error', error);
    });
  }

  async reimprimirBoleto(datosImpresion : IDatosImpresion, codigoImpresora : string){


    var self = this;
    console.log("ENTRO AL REIMPRIMIR BOLETO->", codigoImpresora);
    var diferenciaLocalTiempo = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var fechaHoraFormatoISOLocal = (new Date(Date.now() - diferenciaLocalTiempo)).toISOString().slice(0, -1);

    // console.log("fechaHoraFormatoISOLocal->", fechaHoraFormatoISOLocal);
    var fechaActualFormatoAntiguo = fechaHoraFormatoISOLocal.split("T")[0];
    var mesActual =  fechaActualFormatoAntiguo.split('-')[1];
    var anioActual = fechaActualFormatoAntiguo.split('-')[0];
    var diaActual = fechaActualFormatoAntiguo.split('-')[2];
    var horaActual = fechaHoraFormatoISOLocal.split("T")[1];
    var fechaFormatoCliente = diaActual + "/" + mesActual + "/" + anioActual + " " + horaActual;
    // console.log("fechaFormatoCliente->", fechaFormatoCliente);
    var nombreServicio = datosImpresion.Detalle ?  datosImpresion.Detalle.split('|')[1] : '';


//     RAPIDO VIP S.A.
// 20602482520
// MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO
// CEL: 960058180

    ThermalPrinter.printFormattedText({
      type: 'bluetooth',
      id: codigoImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
      // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
      text :     
      "[L]<b>20602482520</b>\n" +
      "[L]<b>RAPIDO VIP S.A.</b>\n" +
      "[L]<b>MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO</b>\n" +
      "[L]<u><font size='normal'>"+ datosImpresion.NomDocumento +"</font></u>" +
      "[L]<u><font size='normal'>"+ datosImpresion.NroDocumento +"</font></u>" +
      "[L]\n" +
      "[L]PASAJERO :" + datosImpresion.NroDocumentoIdentidad  +  " " + datosImpresion.Cliente + "\n" +
      "[L]RUTA :" + datosImpresion.Origen  +  " " + datosImpresion.Destino + "\n" +
      "[L]F VIAJE :" + datosImpresion.FechaViaje  + " " + datosImpresion.HoraSalidaCliente + "\n" +
      "[L]ASIENTO:<font size='big'>" + datosImpresion.NroAsiento + ' [R]<font size="big">'+ datosImpresion.Simbolo + ' ' + datosImpresion.Total +'</font>\n' +
      "[L]---------------------------------\n" 
    }, function() {
        console.log('Successfully printed reimprimir!');

        self.bluetoothSerial.disconnect();
        //
    }, function(error) {

      self.bluetoothSerial.disconnect();
      ThermalPrinter.disconnectPrinter({
        type: 'bluetooth',
        id: codigoImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
        // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
        
        // "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
      }, function() {
          console.log('SE DESCONECTO LA MRDA!');
          
      }, function(error) {
        console.log('NOOOO SE DESCONECTO LA MRDA!');
          
      }); 
        console.error('Printing error', error);
    });
  }


}
