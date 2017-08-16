// import {Injectable} from '@angular/core';
// import {Environment} from 'environments/environment';
//
// @Injectable()
// export class TEHttpClient {
//
//   private headers = new Headers({'Content-Type': 'application/json'});
//   private fileHeaders = new Headers();
//   private startUTC: number;
//   private expires: number;
//   private static getTimeUTC(): number {
//     let now = new Date();
//     return Date.UTC(now.getUTCFullYear(),
//       now.getUTCMonth() + 1, now.getUTCDay(),
//       now.getUTCHours(), now.getUTCMinutes(),
//       now.getUTCSeconds(), now.getUTCMilliseconds());
//   }
//
//   constructor() {
//     this.init();
//   }
//
//   private init() {
//     this.headers.append('Abp.Localization.CultureName', 'zh-CN');
//     // 取消了 TenantId
//     // this.headers.append('Abp.TenantId', '1');
//     // this.fileHeaders.append('Abp.TenantId', '1');
//     this.startUTC = HttpClient.getTimeUTC();
//     this.expires = Environment.shortTokenTime; // 30 minutes
//     let currentUser: LocalUserInfo = JSON.parse(localStorage.getItem('currentUser'));
//     if (currentUser) {
//       this.setToken(currentUser.token);
//       this.setTime(currentUser.startUTC, currentUser.expires);
//     }
//   }
//
// }
// TODO:Httpclient
