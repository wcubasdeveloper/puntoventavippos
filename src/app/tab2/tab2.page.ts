import { Component } from '@angular/core';
import { VentaService } from './../Servicio/venta.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { UsuarioService } from './../Servicio/usuario.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { BluetoothLE } from '@awesome-cordova-plugins/bluetooth-le/ngx';
import { DatosGeneralesService } from './../Servicio/datos-generales.service';
import { ThermalPrinterPlugin } from 'thermal-printer-cordova-plugin/src';
import { IDatosImpresion } from '../Modelos/idatos-impresion';
import { Router } from '@angular/router';

declare let ThermalPrinter: ThermalPrinterPlugin;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  listaVentas : any = [];
  listaCajaMovimiento : any = [];
  listaNeto : any = [];

  minDate: string = new Date().toISOString();
  fechaActual: any;
  fechaSeleccionada = null;
  datosImpresionBoleta : IDatosImpresion;
  tabVenta : any =  {
    activotabventa : false,
    activotabcaja: true
    // ,
    // activotabneto  : false
  }
  listaSeleccionada : string;
  nombreUsuarioActivo : string;
  //
  constructor(
    private ventaService : VentaService,
    public alertController: AlertController,
    public toastController: ToastController,
    public loadCtrl: LoadingController,

    public usuarioService: UsuarioService,
    public bluetoothle: BluetoothLE,
    public bluetoothSerial : BluetoothSerial,
    public datosGeneralesService : DatosGeneralesService,
    private router: Router

    ) {

  }


  async ionViewWillEnter() {


    var diferenciaLocalTiempo = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var fechaHoraFormatoISOLocal = (new Date(Date.now() - diferenciaLocalTiempo)).toISOString().slice(0, -1);
    this.fechaActual = fechaHoraFormatoISOLocal;
    this.minDate = fechaHoraFormatoISOLocal;
    this.fechaSeleccionada = fechaHoraFormatoISOLocal;

  }

  cambioTipoLista(el){
    //  console.log("el", el.detail.value)
    var tipoLista = el.detail.value;
    //this.listaSeleccionada = tipoRecibo;
    //
    switch (tipoLista) {
      case 'Ventas':
        this.tabVenta =  {
          activotabventa : true,
          activotabcaja: false
          // ,
          // activotabneto  : false
        }
        break;
      case 'Caja':
        this.tabVenta =  {
          activotabventa : false,
          activotabcaja: true
          // ,
          // activotabneto  : false
        }
        break;
      // case 'Neto':
      //   this.tabVenta =  {
      //     activotabventa : false,
      //     activotabcaja: false,
      //     activotabneto  : true
      //   }
      //   break;
      default:
        break;
    }
  }



  listarVentas(){
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    this.nombreUsuarioActivo =datosUsuario.NomEmpleado;
    // console.log("datosUsuario->", datosUsuario);
    // console.log("-->", datosUsuario.NomEmpleado);
    var fechaSelecionada = this.fechaSeleccionada.split('T')[0];
    //
    this.ventaService.consultarListaVentas(datosUsuario.CodUsuario, fechaSelecionada).subscribe(result => {

      var dataJSONResult = JSON.parse(result);
      this.listaVentas = dataJSONResult["dt1"];
      this.listaCajaMovimiento = dataJSONResult["dt0"];
      console.log(this.listaVentas);
      // this.listaNeto = dataJSONResult["dt2"];
    })
  }

  OPCION_SELECCIONADA : any;
  async abrirOpciones(item){
    console.log("item->", item);

    var codVenta = item.CodVenta;
    this.OPCION_SELECCIONADA = 'anula';

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Acción',
      inputs: [
        {
          label: 'Anular',
          type: 'radio',
          checked :true,
          // value : 15,
          handler: (el) => {
            this.OPCION_SELECCIONADA = 'anula';
          }
        },
        {
          label: 'ReImprimir',
          checked :false,
          // value : 15,
          handler: (el) => {
            this.OPCION_SELECCIONADA = 'imprime';
          }
        }
      
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: () => {
            console.log("OPC->", this.OPCION_SELECCIONADA);
            switch (this.OPCION_SELECCIONADA) {
              case 'anula':
                this.anularVentaAccion(codVenta);
                break;
              case 'imprime':
                this.consultarVentaYReimprimir(codVenta);
                break;
              default:
                break;
            }
          }
        }
      ]
    });
      await alert.present();
  }


  async anularVentaAccion(codVenta){
    console.log("anularVentaAccionanularVentaAccionanularVentaAccion");

    var motivoAnula = "";
    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Motivo de anulación',
      inputs: [
        {
          name: 'txtmotivo',
          type: 'text',
          placeholder: 'Ingresar el motivo'
        },
        {
          name: 'txtclaveanula',
          type: 'password',
          placeholder: 'Ingresar la clave'
        }
      ],
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'SI',
          handler: (data) => {
            // console.log("DATA--->", data);
            // console.log('Confirm Ok');
            var dataInMotivo = data.txtmotivo.trim();
            var dataClaveAnula = data.txtclaveanula.trim();


           
            if(dataInMotivo.length > 0) {

              if(dataClaveAnula.length > 0) {
                console.log("<<<<<PARAMETRO SENDD>>>>");
                console.log(codVenta, dataInMotivo, datosUsuario.CodUsuario.toString());
  
                this.ventaService.anularVenta(codVenta, dataInMotivo, datosUsuario.CodUsuario.toString(), dataClaveAnula).subscribe(result => {
                  
                  console.log("result ANULA--> ", result);
  
                  var dataJSONResult = JSON.parse(result);
                  var dataRpta = dataJSONResult["dt0"];
          
                  
                  var desResultado = dataRpta[0].DesResultado;
                  var codResultado = Number(dataRpta[0].CodResultado);
                  
                  this.mostrarnotificationsenial(desResultado);
                  this.listarVentas();
                  if(codResultado > 0){
                
                  }else{
  
                    return false;
                  }
                })
  
              }else{
                this.mostrarnotificationsenial("Es necesario ingresar la clave para anular");
                return false;
              }
             
            }else{
              this.mostrarnotificationsenial("Es necesario ingresar el motivo");
              return false;
            }
          }
        }
      ],
      backdropDismiss: false
    });
  
    await alert.present();
  }

  async mostrarnotificationsenial(textoMensaje : string){
    const toast = await this.toastController.create({
      message: '',
      duration: 1000,
      position : 'middle'
    });

    toast.message = textoMensaje;
    toast.present();
  }


  cambioFecha(){
   
 
    this.fechaSeleccionada = this.fechaActual;

    // textoPuntoInicioSeleccionado = null;
    // textoPuntoDestinoSeleccionado = null;
    this.listarVentas();
  }
  

  // async verificaBluethooActivo(codVenta){
  //   var self = this;
  //   var imprimirBoleta = false;
  //   const alertaVerificaImp = await this.alertController.create({
  //     header : 'Notificación',
  //     message : '',
  //     buttons: [
  //       {
  //         text: 'OK',
  //         handler: () => {
  //           //this.router.navigate(["tab3"]);
  //           this.router.navigateByUrl('tab3', {replaceUrl : true});
  //         }
  //       }
  //     ]
  //   });

  //   var self_ = this;
  //   this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado

  //     var impresoraConectada = this.datosGeneralesService.getLocalStorageImpresoraConectada();

  //     if(impresoraConectada){ //si ya tuvo una impresora conectada entonces verifico

  //       //self_.botonterminarviaje.innerHTML = "dwdadada";
  //       this.bluetoothSerial.isConnected().then(success=>{
  //         imprimirBoleta = true;
  //         // alertaVerificaImp.message = ".";
  //         // alertaVerificaImp.present();
  //         self_.consultarVentaEImprimir(codVenta);

  //       },error=>{ //impresora no conectada
  //         imprimirBoleta = false;
  //         alertaVerificaImp.message = "La impresora no se encuentra conectada, es necesario conectarla para imprimir.";
  //         alertaVerificaImp.present();
  //       });

  //     }else{ //no hay impresora en localstorage
  //       imprimirBoleta = false;
  //       alertaVerificaImp.message = "La impresora no se encuentra conectada, es necesario conectarla para imprimir.";
  //       alertaVerificaImp.present();
        
  //     }

  //   },errors=>{ //blut desconectado
  //     imprimirBoleta = false;
  //     alertaVerificaImp.message = "La impresora no se encuentra conectada, es necesario conectarla para imprimir.";
  //     alertaVerificaImp.present();
  //   });  
    
  // }

  async consultarVentaYReimprimir(codventa){
    var imprimirBoleta = false;
    let macImpresora = '';

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
            // self.botonguardar.innerHTML = "Registrando pasaje...";
            // self.botonguardar.setAttribute("disabled","disabled");
            //this.activarLoading('Registrando venta...');

            if(imprimirBoleta){
              
              this.consultarVentaEImprimir(codventa, macImpresora);
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

 
    this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado

      var self_ = this;
      var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
      var codigoImpresora = datosUsuario.IdImpresora;

      if(codigoImpresora){ //si ya tuvo una impresora conectada entonces verifico
        macImpresora = codigoImpresora.split('_').join(':');

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
          alertaVerificaImp.message = "Esta seguro de continuar con la reimpresión ?";
          alertaVerificaImp.present();
 
        },error=>{ //impresora no conectada

          self_.activarLoading("Intentando conectar con la impresora.");

          this.bluetoothSerial.connect(macImpresora).subscribe(success=>{

            setTimeout(() =>   self_.desactivarLoading(), 500);
            imprimirBoleta = true;
            alertaVerificaImp.message = "Esta seguro de continuar con la impresión del resumen de ventas ?";
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


  imprimirResumentVentas(codigoImpresora){
   
    var _datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    var _codigoImpresora = _datosUsuario.IdImpresora;
    var _macImpresora = _codigoImpresora.split('_').join(':');
    var self = this;
    var strImprimeResumen = "";

    this.listaCajaMovimiento.forEach(element => {
      strImprimeResumen += "[L]<b><font size='normal'>"+ element.Concepto +"</font>" + "</b>\n[L]<font size='normal'>" + element.Documento + " </font>[R] <font size='normal'>" + element.Total + "</font>\n";
    });


    var _fechaConsultada =  this.fechaSeleccionada.split('T')[0];

    var strImpresionTotal  =  
    "[C]<b>RESUMEN DE VENTAS</b>\n\n" +
    "[L]<b>USUARIO :</b>[R] "+ this.nombreUsuarioActivo +"\n" +
    "[L]<b>F.CONSULTA :</b>[R] "+ _fechaConsultada +"\n\n-";

    strImpresionTotal += strImprimeResumen;

    ThermalPrinter.printFormattedText({
      type: 'bluetooth',
      id: _macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
      // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
      text :  strImpresionTotal + "\n\n\n"
  
    }, function() {
        console.log('Successfully printed!');
        //self.router.navigate(["tabprincipal"]);
        self.bluetoothSerial.disconnect();

    
    }, function(error) {
        console.error('Printing error', JSON.stringify(error));
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
    });

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


  async imprimirBoleto(datosImpresion : IDatosImpresion, codigoImpresora : string){
    var self = this;
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


// RAPIDO VIP S.A.
// 20602482520
// MZA. C1 LOTE. 15 URB. SANTO DOMINGO (ETP VIII) LIMA-LIMA-CARABAYLLO
// CEL: 960058180

    var codTipoDocumento = datosImpresion.CodDocumento;

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
        console.log('Successfully printed!');
        //self.router.navigate(["tabprincipal"]);
        self.bluetoothSerial.disconnect();

    
    }, function(error) {
        console.error('Printing error', error);
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
    });
  }

  consultarVentaEImprimir(codventa, codImpresora){

    var self = this;
    this.ventaService.consultarVenta(codventa).subscribe(result => {
      console.log("consultarVenta->", result);
      var impresoraConectada = codImpresora;//this.datosGeneralesService.getLocalStorageImpresoraConectada();
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
      //
      self.imprimirBoleto(self.datosImpresionBoleta, impresoraConectada);
    })
  }


  async imprimirResumen(){


    var imprimirResumen : boolean = false;
    let macImpresora = '';

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
      
            if(imprimirResumen){
              this.imprimirResumentVentas(macImpresora);
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

    //
 
    this.bluetoothSerial.isEnabled().then(response=>{// blut habilitado
      let macImpresora = '';
      var self_ = this;

      var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
      var codigoImpresora = datosUsuario.IdImpresora;

      console.log("BLUT ESTÁ ACTIVADO");
      console.log(JSON.stringify(datosUsuario));
      console.log("<-----BLUT ESTÁ ACTIVADO---->");

      if(codigoImpresora){ //si ya tuvo una impresora conectada entonces verifico
        macImpresora = codigoImpresora.split('_').join(':');

        //self_.botonterminarviaje.innerHTML = "dwdadada";
        ThermalPrinter.disconnectPrinter({
          type: 'bluetooth',
          id: macImpresora, // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
          
        }, function() {
            console.log('SE DESCONECTO LA MRDA!');
            
        }, function(error) {
          console.log('NOOOO SE DESCONECTO LA MRDA!');
            
        }); 

        this.bluetoothSerial.isConnected().then(success=>{ //si está conectado
          // console.log("<<<<<<<YA ESTÄ CONECTADA>>>>>>>>>>>>");
          imprimirResumen = true
          alertaVerificaImp.message = "Esta seguro de continuar con la reimpresión ?";
          alertaVerificaImp.present();
 
        },error=>{ //impresora no conectada

          self_.activarLoading("Intentando conectar con la impresora.");

          this.bluetoothSerial.connect(macImpresora).subscribe(success=>{

            setTimeout(() =>   self_.desactivarLoading(), 500);
            imprimirResumen = true;
            alertaVerificaImp.message = "Esta seguro de continuar con la reimpresión ?";
            alertaVerificaImp.present();
          },error=>{
            alertaErrorImpresora.message = "Ocurrió un error en la configuración de la impresora, revise la configuración.";
            alertaErrorImpresora.present();
            setTimeout(() =>   self_.desactivarLoading(), 500);
          });
        });

      }else{ //no hay impresora en localstorage
        imprimirResumen = false;
        alertaErrorImpresora.message = "La impresora no se encuentra configurada, revise la configuración.";
        alertaErrorImpresora.present();
      }

    },errors=>{ //blut desconectado
      imprimirResumen = false;
      alertaErrorImpresora.message = "El Bluetooth desactivado, revise la configuración del dispositivo.";
      alertaErrorImpresora.present();
    });  



  }

  // async reImprimirVoucher(codVenta, nroAsiento){
  //   console.log("cod venta->", codVenta);

  //   // this.router.navigate(["tabs/tab3"]);
  //   // this.router.navigateByUrl("tab3");

  //   const alertaNotificacion = await this.alertController.create({
  //     header : 'Asiento nro [' + nroAsiento + ']',
  //     message : 'Estas seguro de realizar la reeimpresión del boleto ?',
  //     buttons: [
  //        {
  //         text: 'SI',
  //         handler: () => {
  //           this.verificaBluethooActivo(codVenta);
  //         }
  //       },
  //       {
  //         text: 'NO',
  //         handler: () => {
            
  //         }
  //       }
  //     ]
  //   });
  //   await alertaNotificacion.present();
  // }

}
