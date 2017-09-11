import {Component, OnInit} from '@angular/core';
import SimpleWebRTC from 'simplewebrtc';

@Component({
  selector: 'app-babout',
  templateUrl: './babout.component.html',
  styleUrls: ['./babout.component.scss']
})
export class BaboutComponent implements OnInit {

  webrtc;

  constructor() {
    this.webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: 'localVideo',
      // the id/element dom element that will hold remote videos
      remoteVideosEl: 'remotesVideos',
      // immediately ask for camera access
      autoRequestMedia: true,
      URL: 'https://47.95.13.230:8888'
    });
  }

  ngOnInit() {
    this.webrtc.on('readyToCall', function () {
      this.webrtc.joinRoom('1');
    });
  }

}
