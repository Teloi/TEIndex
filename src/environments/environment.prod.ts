export const environment = {
  production: true
};

export class Environment {
  static readonly serverUrl = 'http://server.teloi.cn/';
  static readonly serverApiUrl = Environment.serverUrl + 'api/';
  static readonly clientUrl = 'http://www.teloi.cn/';
  static readonly clientSrcUrl = Environment.clientUrl;
}
