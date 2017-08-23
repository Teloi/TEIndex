// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false
};

export class Environment {
  static readonly serverUrl = 'http://localhost:4299/';
  static readonly serverApiUrl = Environment.serverUrl + 'api/';
  static readonly clientUrl = 'http://localhost:4200/';
  static readonly clientSrcUrl = Environment.clientUrl + 'src/';
}
