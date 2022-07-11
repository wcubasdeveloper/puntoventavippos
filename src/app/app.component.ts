import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from './Servicio/usuario.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { UpdateService } from './Servicio/update.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform, 
    private router: Router,
    private usuarioService: UsuarioService,
    public alertController: AlertController,
    private updateService: UpdateService ) {
    this.initializeApp();  
  }

  HORAS_DIF_LOCAL_MILISEC = 18000000; //DIFERENCIA 5 HORAS EN MILISEGUNDOS



  initializeApp(){
    this.platform.ready().then(()=>{

      //this.updateService.checkForUpdate();

      this.platform.pause.subscribe(() => {        
        console.log('****PAUSED****');
        //Same logic
        //this.platform.resume.unsubscribe();
     
      });  

      this.platform.resume.subscribe(() => {      
        console.log('****RESUMED****');
        if(this.verificaSiEstaFueraDeFecha()){
          this.mostrarAlertaLogueo();
        }
      });


      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('hello');
        }, false);
      });
      
      var datosUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
      if(datosUsuario != null){
        // this.router.navigate(["tabprincipal"]);
        this.router.navigateByUrl('tabprincipal', {replaceUrl : true});
      }else{
        this.router.navigateByUrl('login', {replaceUrl : true});
      }
    })
  }


  async mostrarAlertaLogueo(){
    const alertaNotificacion = await this.alertController.create({
      header : 'Notificación',
      message : 'Tu sesión a caducado, inicie nuevamente.',
      buttons: [
         {
          text: 'OK',
          handler: () => {
            localStorage.removeItem('datosUsuarioLogin');
            this.router.navigateByUrl('login', {replaceUrl : true});
            
          }
        }
      ],
      backdropDismiss: false
    });
    await alertaNotificacion.present();
  }

  verificaSiEstaFueraDeFecha(){
    let estaFueraDeFecha : Boolean = false;

    var datoUsuario =  this.usuarioService.obtenerDatosSesionUsuario();
    //console.log("datoUsuario-<", datoUsuario)
    if(datoUsuario != null){
      var fechaLogeo = datoUsuario.FechaIngreso;
      //console.log("fechaLogeo->", fechaLogeo);
      if(fechaLogeo){
        var dia = fechaLogeo.split('/')[0];
        var mes = fechaLogeo.split('/')[1];
        var anio = fechaLogeo.split('/')[2];
        var fechahora =  new Date(mes + '-' + dia + '-' + anio);
        var timestamp = fechahora.getTime();
        var timestampLocalIngreso = timestamp - this.HORAS_DIF_LOCAL_MILISEC;
        //
        /// fecha hoy
        var hoyfecha = new Date();
        var fechaHoy = new Date((hoyfecha.getMonth() + 1)  + '-' + hoyfecha.getDate() + '-' + hoyfecha.getFullYear());
        var timestampFechaHoy = fechaHoy.getTime() -  this.HORAS_DIF_LOCAL_MILISEC;

        if(timestampLocalIngreso != timestampFechaHoy){
          estaFueraDeFecha = true;
        }

      }
    }

    return estaFueraDeFecha;
  }


}
