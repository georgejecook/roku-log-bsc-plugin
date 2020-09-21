export enum BindingType {
  invalid,
  oneWaySource, //one way from observable to view target - also denoted with {{}}
  oneWayTarget, //one way from view target to observable - also denoted with {()}
  twoWay, //both direction - also denoted with {[]},
  static, //efficient one off binding - also denoted with {{:}}
  code, //efficient one off binding, with actual code {{=}}
}
