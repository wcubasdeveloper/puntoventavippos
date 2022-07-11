import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UsuarioService } from './../../Servicio/usuario.service';
import { IloginModel } from 'src/app/Modelos/ilogin-model';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';



// import { Printer, PrintOptions } from '@awesome-cordova-plugins/printer/ngx';
// import { ThermalPrinterPlugin } from 'thermal-printer-cordova-plugin/src';

// declare let ThermalPrinter: ThermalPrinterPlugin;

@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.component.html',
  styleUrls: ['./ingresar.component.scss'],
})
export class IngresarComponent implements OnInit {

  listablutus : [];
  Devices
  formGroup : FormGroup;
  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    // public bluetoothSerial : BluetoothSerial,
    // private printer: Printer
  ) { }

  ngOnInit() {
    this.initForm();
  }

  // bluetooth
  // async listarDispositivosBlut(){

  //   ThermalPrinter.printFormattedText({
  //     type: 'bluetooth',
  //     id: 'DC:0D:30:7D:B7:F5', // You can also use the identifier directly i. e. 00:11:22:33:44:55 (address) or name
  //     // text: "[C]<u><font size='big'>HOLA ROLANDITOOOO RICARDITO,SOY EL MAS CAPO DESPUES DE 5 HORAS SALIO LA VAINA DE LA IMPRESIÓN\nahora si me voy ha descansar tranquilo mañana sale el guardar y su impresión \nPAPOO</font></u>\n\n"// new lines with "\n"
  //     text :     "[C]<b><u><font size='big'>VIPPOS</font></u></b>\n" +
  //     "[L]\n" +
  //     "[C]<u><font size='big'>B120-00036456</font></u>" +
  //     "[L]\n" +
  //     "[L]F.EMISIÓN [R]: 16/12/21\n" +
  //     "[L]DOC. PASAJERO [R]: 45068785\n" +
  //     "[L]PASAJERO [R]: CUBAS ALEGRIA, WILLIAM ALMILCAR\n" +
  //     "[L]CAJERO [R]: ROLANDO\n" +
  //     "[C]---------------------------------\n" +
  //     "[L]<font size='tall'>DETALLE DEL SERVICIO</font>" +
  //     "[C]---------------------------------\n" +
  //     "[L]SERVICIO DE TRANSPORTE\n" +
  //     "[L]ORIGEN [R]: PLAZA NORTE\n" +
  //     "[L]DESTINO [R]: CHANCAY\n" +
  //     "[L]SERVICIO [R]: VIP\n" +
  //     "[L]FECHA DE VIAJE [R]: <font size='big'>17/12/21</font> \n" +
  //     "[L]HORA DE SALIDA [R]: <font size='big'>20:00</font> \n" +
  //     "[L]ASIENTO [R]: <font size='big'>12</font> \n" +
  //     "[L]DIR. EMBARQUE [R]: AV. GERARDO UNGER 6911, 6917, 6933 LIMA-LIMA-INDEPENDENCIA\n" +
  //     "[C]---------------------------------\n" +
  //     "[L]<font size='big'>TOTAL</font>  [R]: <font size='big'>S/ 50.00</font> \n" +
  //     "[L]SON : CINCUENTA CON 00/100 SOLES\n" +
  //     "[L]HASH : wedawasSWEadsawdasawdawsadw/dwadawdawdawd\n" +

  //     "[L]RIMAC SEGUROS 2101 - 889078 01/01/21 - 01/01/23\n" +
  //     "[L]BOLETA EMITIDA : CONTADO\n" +
  //     "[L]F.Impresión : 16/12/2021 22:44:47\n" +
  //     "[C]<qrcode size='20'>http://www.developpeur-web.dantsu.com/</qrcode>\n\n" +
  //     "[C]GRACIAS POR SU COMPRA\n\n" +
  //     "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n\n"
  
  //   }, function() {
  //       console.log('Successfully printed!');
  //   }, function(error) {
  //       console.error('Printing error', error);
  //   });


  // }

  // conectarConDevice(address){
  //   var self = this;
  //   this.bluetoothSerial.connect(address).subscribe(success=>{
  //     console.log("ENTRO AL--> conectarConDevice");

      
  //     self.bluetoothSerial.write('hello world').then(success);
  //     //self.equipoConectado();
  //   },error=>{
  //     console.log("ERROR-> conectarConDevice")
  //   });
  // }

  // connectToBluetoothPrinter(macAddress)
  // {
  // //This will connect to bluetooth printer via the mac address provided
  //   return this.bluetoothSerial.connect(macAddress)
  // }

  // equipoConectado(){
  //   console.log(">>>>>>>>>>>>>>>>>>>>QUIPO CONECTADO")
  //   this.bluetoothSerial.subscribe('\n').subscribe(success => {
  //     console.log("<<<---EQUIPOCONECTADO--->>>>")
  //     this.handler(success);
  //   },error=>{
  //     console.log("ERROR-> equipoConectado")
  //   });
  // }

  // handler(value){
  //   console.log("HANDLER->", value);
  //   this.imprimirTexto();
  // }

  // async imprimirTexto(){
  //   console.log("ENTRO AL IMPRIMIR TEXOT");
  //   // Array of int or bytes
  //   this.bluetoothSerial.write([186, 220, 222]).then(response=>{
  //     console.log("rpta impresion", JSON.stringify(response))
  //   },error=>{
  //     console.log("ERROR AL IMPRIMIR")
  //   })
  // }

  // activarBlu(){
  //   console.log("entro al habilitar");

  //   this.bluetoothSerial.isEnabled().then(response=>{
  //     console.log("está habilitado");
  //     this.listarDispositivosBlut();
  //   },errors=>{
  //     console.log("esta deshabilitado", JSON.stringify(errors));
  //   });
  // }

  // desconectarDelDispositivo(){
  //   this.bluetoothSerial.disconnect();
  // }

  // end bluethoo
  get datosFormulario() { return this.formGroup.controls; }

  initForm(){  
    this.formGroup = new FormGroup({
      usuario : new FormControl('', [Validators.required]),
      clave : new FormControl('', [Validators.required])
    });
  }

  async onSubmit(){
    //this.router.navigate(["tabprincipal"]);
    this.activarLoading();
    var usuario  = this.datosFormulario.usuario.value;
    var clave =  this.datosFormulario.clave.value;

    this.usuarioService.login(usuario,clave).subscribe(result => {
      setTimeout(() => this.desactivarLoading(), 500);
      
      var rptaJSON = JSON.parse(result);
      console.log("LOGIN", JSON.stringify(rptaJSON));
      
      var dataUsuario :IloginModel = rptaJSON["dt0"][0];
      if(Number(dataUsuario.CodResultado) == 1){
        this.router.navigateByUrl('tabprincipal', {replaceUrl : true});
      }else{
        this.enviarmensajeToast(dataUsuario.DesResultado);
      }
    })
  }

  async enviarmensajeToast(textomensaje : string){
    const toastmensajepersonalizado = await this.toastController.create({
      message: '',
      duration: 4000,
      position : 'top'
    });
    toastmensajepersonalizado.message = textomensaje;
    toastmensajepersonalizado.present();
  }

  activarLoading() {
    this.loadingController.create({
        message: 'Espere...',
    }).then((response) => {
        response.present();
    });
  }

  desactivarLoading() {
    this.loadingController.dismiss().then((response) => {
        console.log('Loader closed!', response);
    }).catch((err) => {
        console.log('Error occured : ', err);
    });
  }

}
