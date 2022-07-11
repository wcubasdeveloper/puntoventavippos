import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VentanaVentaPage } from '../ventana-venta/ventana-venta.page';
import { NavParams } from '@ionic/angular';
import { VentaService }  from './../../../Servicio/venta.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { UsuarioService } from './../../../Servicio/usuario.service';

@Component({
  selector: 'app-ventana-asientos',
  templateUrl: './ventana-asientos.page.html',
  styleUrls: ['./ventana-asientos.page.scss'],
})
export class VentanaAsientosPage implements OnInit {

  constructor(
    public modalController: ModalController,
    private navParams : NavParams,
    private ventaService : VentaService,
    public toastController: ToastController,
    public usuarioService: UsuarioService,
  ) { }
  currentModal = null;
  pisoseleccionado = 1;
  rutaSeleccionada = "";
  horaSalida = "";
  cantidadAsientos = 0;
  codPuntoInicioSeleccionado = 0;
  codPuntoDestinoSeleccionado = 0;
  codProgramacionSeleccionado = 0;
  codCuidadOrigenPasajero = 0;
  codCuidadDestinoPasajero = 0;

  //
  listaAsientosUtilizados : any;
  tarifaSegunProgramacion = "";

  ngOnInit() {
    // console.log("entré");
    this.pisoseleccionado = 1;
    this.rutaSeleccionada = this.navParams.get("ruta");
    this.horaSalida = this.navParams.get("horasalida");
    this.cantidadAsientos = Number(this.navParams.get("cantidadasientos"));

    this.codPuntoInicioSeleccionado = Number(this.navParams.get("codOrigen"));
    this.codPuntoDestinoSeleccionado = Number(this.navParams.get("codDestino"));
    this.codProgramacionSeleccionado = Number(this.navParams.get("codProgramacion")); 
    this.tarifaSegunProgramacion = this.navParams.get("tarifaPasaje"); 

    this.codCuidadOrigenPasajero = Number(this.navParams.get("codCuidadOrigen")); 
    this.codCuidadDestinoPasajero = Number(this.navParams.get("codCuidadDestino")); 
    this.consultaAsientosVendidos();
  }
  //
  // ionViewWillEnter() {
  //   console.log("ESTOY ADENTRITO");
  //   this.consultaAsientosVendidos();
  // }

  consultaAsientosVendidos(){

    this.ventaService.consultarAsientosVendidos(this.codProgramacionSeleccionado).subscribe(result => {  
      var rptaJSON = JSON.parse(result);
      var datoAsientosUtilizados  = rptaJSON["dt0"];
      //console.log("datoAsientosUtilizados->", datoAsientosUtilizados);
      this.listaAsientosUtilizados = datoAsientosUtilizados;
    });
  }

  esAsientoUtilizado(nroAsiento : number){
    var rpta = {
      'background-color': 'white',
      'border-radius': '10px'
    };

    if(this.listaAsientosUtilizados){
      this.listaAsientosUtilizados.forEach(element => {
        var tipo = element["Tipo"];
        var colorAsiento = element["Color"];
        if(Number(tipo) != 0){
          if(nroAsiento == Number(element.NroAsiento)){
            rpta['background-color'] = element.Color;
          }
        }

      });
    }
    

    return rpta;
    //return {'background-color': 'red'};
  }


  cerrarModal(){
    this.modalController.dismiss({
      'mostrarrecorrido': false
    });
  }
  //
  async abrirVentanaVenta(numeroAsiento){

    const toastmensajepersonalizado = await this.toastController.create({
      message: '',
      duration: 2000,
      position : 'top'
    });

    var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    //verifica si el asiento no fue utilizado
    var asientoUtilizado = false;
    var tipoAsiento = 0;
    var self = this;
    
    var precioDelAsiento = 0;
    var textoPrecioEditable = false;

    this.listaAsientosUtilizados.forEach(element => {
      
      var tipo = Number(element["Tipo"]);
      var precioAsiento = element["TarifaPasaje"];
      var editable = (element["Editable"] == "True" ? true : false); 
      if(Number(element.NroAsiento) == numeroAsiento){
        precioDelAsiento = precioAsiento;
        textoPrecioEditable = editable;
      }

      if(tipo > 0 && numeroAsiento == Number(element.NroAsiento)){
        asientoUtilizado = true;
        tipoAsiento = Number(element.Tipo);
      }
      
    });

    if(!asientoUtilizado){
      const modal_ = await this.modalController.create({
        component: VentanaVentaPage,
        cssClass: 'my-custom-class',
        componentProps: { 
          piso : this.pisoseleccionado,
          numeroAsiento : numeroAsiento,
          rutaSeleccionada : this.rutaSeleccionada ,
          horaSalida : this.horaSalida,
          codOrigen : this.codPuntoInicioSeleccionado,
          codDestino : this.codPuntoDestinoSeleccionado,
          codProgramacion : this.codProgramacionSeleccionado,
          tarifaPasaje : precioDelAsiento,
          codCuidadOrigen :  this.codCuidadOrigenPasajero,
          codCuidadDestino :  this.codCuidadDestinoPasajero,
          precioEditable : textoPrecioEditable

        },
      });
      this.currentModal = modal_;

      this.ventaService.bloquearAsiento(
        this.codProgramacionSeleccionado,
        numeroAsiento,
        datosUsuario.CodUsuario,
        '0'
        ).subscribe(result => {  
        var rptaJSON = JSON.parse(result);
        var dataRespuestaBloqueo = rptaJSON["dt0"][0];
        var codResultado = Number(dataRespuestaBloqueo["CodResultado"]);
        var desResultado = dataRespuestaBloqueo["DesResultado"];

        console.log(rptaJSON)
        if(codResultado == 1){ //si está bien
          modal_.present();
        }else{
          toastmensajepersonalizado.message = desResultado;
          toastmensajepersonalizado.present();
        }
      });
      //
      const datamodal = await modal_.onWillDismiss();
      var realizoVenta = datamodal.data["realizoventa"];
      // console.log("<<<<realizoVenta>>>", realizoVenta);
      if(datamodal.data["realizoventa"]){
        this.consultaAsientosVendidos();
      }
    }else{
      toastmensajepersonalizado.message = tipoAsiento == 1 ? 'Asiento vendido !' : 'Asiento reservado!';
      toastmensajepersonalizado.present();
    }
  }

  seleccionarPiso(){
    if(this.pisoseleccionado == 1){
      this.pisoseleccionado = 2
    }else{
      this.pisoseleccionado = 1
    }
  }



}
