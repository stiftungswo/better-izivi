export type Mode = 'prod' | 'dev';

export default class AppMode {
  private readonly mode: Mode;

  constructor() {
    const url = window.location.href;
    this.mode = url.includes('localhost') || url.includes('test') || url.includes('develop') ? 'dev' : 'prod';
  }

  get isProd() {
    return this.mode === 'prod';
  }
}
