export default class IdProvider {
  static cnt = 0;
  static getId(): number {
    this.cnt++;
    return this.cnt;
  }
}
