import { Component } from "@angular/core";
import { NavController, AlertController, ToastController, DateTime } from "ionic-angular";
import { NgForm } from "@angular/forms";
import { AngularFirestore } from "@angular/fire/firestore";
// import { AudioProvider } from '../../providers/audio/audio';
import { MediaObject, Media } from "@ionic-native/media";
import { File } from "@ionic-native/file";
// import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";
// import {finalize} from 'rxjs/operators';
// import * as firebase from 'firebase';
import * as firebase from 'firebase/app';
import 'firebase/storage';


@Component({
  selector: "page-atividades-cad",
  templateUrl: "atividades-cad.html"
})
export class AtividadesCadPage {
  public recording: boolean = false;
  public recorded: boolean = false;
  // public filePath : string         ;
  // public fileName : string         ;
  // public audio    : MediaObject    ;
  // public audioList: any[] = []     ;
  // public duracao  : number         ;
  // public path: string;
  // public docRef: string;
  // public referencia = firebase.storage().ref();

  public audio: MediaObject;
  public firebase;
  public filePath: string;
  public playingAudio: boolean; // indica se o áudio está sendo reproduzido
  public audioURL: string;
  public audioURI;
  public fileName;

  public fileDir;
  public dirAudios;

  public uploadPercent: Observable<number>;
  public downloadURL;

  constructor(
    public navCtrl: NavController,
    public db: AngularFirestore,
    // public storage: AngularFireStorage,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private media: Media,
    private file: File
  ) {
    // this.file.createDir(this.file.externalDataDirectory, "Audios", false)
    //   .then((dir) => {
    //     this.dirAudios = dir.fullPath;
    //   })
  }

  public cad_atividade(form: NgForm): void {
    let titulo: string = form.value.titulo;
    let dataPostada: Date = form.value.dataPostada;
    let dataEntrega: Date = form.value.dataEntrega;
    let descricao: string = form.value.descricao;
    let ativa: boolean = form.value.ativa;

    let atividade: any = {
      nome: titulo,
      dataPostada: dataPostada,
      dataEntrega: dataEntrega,
      descricao: descricao,
      ativo: ativa
    };

    // this.referencia.child(this.filePath + this.fileName); // referencia para o caminho do arquivo
    // this.referencia.put(this.audio); // enviar o arquivo

    this.db.collection("atividades").add(atividade)
      .then(ref => {
        this.db.collection("atividades").doc(ref.id).update({ id: ref.id, audio: this.filePath });

        // this.audioService.uploadAudio();

        this.navCtrl.pop();
      })
      .catch(error => {
        alert(error);
      });
  }

  public gravar(): void {

    let data = Date.now.toString();
    this.fileName = "audio_english.mp3";

    this.filePath = this.file.dataDirectory + this.fileName;

    console.log('arquivo (gravar): ' + this.filePath);

    this.fileDir = this.file.externalDataDirectory.replace(/file:\/\//g, "") + "audios/";
    this.filePath =  this.fileDir + this.fileName;
    // this.filePath = this.fileDir + this.fileName;

    console.log('arquivo (editador gravar): ' + this.filePath);

    this.audio = this.media.create(this.filePath);
    this.recording = true;
    this.audio.startRecord();
  }

  public pararGravar() {
    this.recording = false;
    this.recorded = true;
    this.audio.stopRecord(); // para de gravar o áudio

    console.log('gravado');

    this.file.readAsDataURL("file://" + this.fileDir, this.fileName)
    .then((value) => {
      // console.log(value); // arquivo como data url (gerado com sucesso).
      var storage = firebase.storage();
      var storageRef = storage.ref().child("audios/" + this.fileName);

      storageRef.putString(value, 'data_url').then((snapshot)=>{
        snapshot.ref.getDownloadURL().then((url) => {
          console.log(url);
          this.audioURL = url;
        });
      })
      .catch((error) => {
        console.log('erro upload', error);
      });
    })
    .catch((error) => {
      console.log('erro read as data url', error);
    });
  }

  public reproduzir(): void {
    this.playingAudio = true;
    this.audio.play(); // inicia a reprodução do áudio
    // this.audio.setVolume(1.0);
  }
}
