import { BindingType } from './BindingType';

export class BindingProperties {

  constructor(public type: BindingType = BindingType.invalid,
              public isSettingInitialValue: boolean = true,
              public transformFunction: string = null,
              public isFiringOnce: boolean = false) {
  }

  public getBrsText() {
    // tslint:disable-next-line:max-line-length
    return `[${this.isSettingInitialValue ? 'true' : 'false'}, ${this.transformFunction ? `${this.transformFunction}` : 'invalid'}, ${this.isFiringOnce ? 'true' : 'false'}]`;
  }
}
