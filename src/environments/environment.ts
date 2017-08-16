// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false
};

export class Environment {
  static readonly serverUrl = 'http://localhost:5000/';
  static readonly serverApiUrl = Environment.serverUrl + 'api/';
  static readonly clientUrl = 'http://localhost:3000/';
  static readonly clientSrcUrl = Environment.clientUrl + 'src/';
  static readonly assetsUrl = 'src/assets';

  static readonly shortTokenTime = 1800000;
  static readonly longTokenTime = 604800000;
  static readonly refreshBefore = 600000;

  static readonly adminUserName = 'admin';
  static readonly adminRoleName = 'Admin';
}
