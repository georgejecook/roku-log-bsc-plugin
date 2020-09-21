import { BindingProperties } from './BindingProperties';
import { BindingType } from './BindingType';

export default class Binding {

  constructor() {
    this.properties = new BindingProperties();
  }

  public isValid: boolean = false;
  public isFunctionBinding: boolean = false;
  public isTopBinding: boolean = false;
  public observerId: string;
  public observerField: string;
  public nodeId: string;
  public nodeField: string;
  public properties: BindingProperties;
  public errorMessage: string;
  public rawValueText: string;

  public validate() {
    this.isValid = this.validateImpl();
  }

  private validateImpl(): boolean {
    if (!this.nodeId) {
      this.errorMessage = 'node Id is not defined';
      return false;
    }

    if (!this.nodeField) {
      this.errorMessage = 'node field is not defined';
      return false;
    }

    if (!this.observerId && this.properties.type !== BindingType.code) {
      this.errorMessage = 'observer.id is not defined';
      return false;
    }

    if (!this.observerField && this.properties.type !== BindingType.code) {
      this.errorMessage = 'observer.field is not defined';
      return false;
    }

    if (this.isFunctionBinding && this.properties.type !== BindingType.oneWayTarget) {
      this.errorMessage = 'observer callbacks on functions are only supported for oneWayTarget (i.e. node to vm) bindings';
      return false;
    }
    return true;
  }

  public getInitText(): string {
    let text = '';
    switch (this.properties.type) {
      case BindingType.oneWaySource:
        text += `MOM_bindObservableField(m.${this.observerId}, "${this.observerField}", m.${this.nodeId}, "${this.nodeField}", ${this.properties.getBrsText()})`;
        break;
      case BindingType.oneWayTarget:
        text += `MOM_bindNodeField(m.${this.nodeId}, "${this.nodeField}", m.${this.observerId}, "${this.observerField}", ${this.properties.getBrsText()})`;
        break;
      case BindingType.twoWay:
        text += `MOM_bindFieldTwoWay(m.${this.observerId}, "${this.observerField}", m.${this.nodeId}, "${this.nodeField}", ${this.properties.getBrsText()})`;
        break;
      case BindingType.static:
        //not part of init
        break;
    }
    return text;
  }

  public getStaticText(): string {
    let text = '';
    if (this.properties.type === BindingType.code) {
      text += `m.${this.nodeId}.${this.nodeField} = ${this.rawValueText}`;
    } else if (this.properties.type === BindingType.static) {
      const valueText = this.observerField.split('.').length > 1 ?
        `MU_getContentField(m.${this.observerId},"${this.observerField}")` : `m.${this.observerId}.${this.observerField}`;
      if (this.properties.transformFunction) {
        text += `m.${this.nodeId}.${this.nodeField} = ${this.properties.transformFunction}(${valueText})`;
      } else {
        text += `m.${this.nodeId}.${this.nodeField} = ${valueText}`;
      }
    }
    return text;
  }
}
