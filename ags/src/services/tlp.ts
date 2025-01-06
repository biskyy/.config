import { execAsync, GObject, interval, property, register } from "astal";

export enum TLPMode {
  AC = "AC",
  BATTERY = "battery",
}

@register({ GTypeName: "TLP" })
export default class TLP extends GObject.Object {
  static instance: TLP;

  static get_default() {
    if (!TLP.instance) {
      TLP.instance = new TLP();
    }
    return TLP.instance;
  }

  @property(Number)
  declare updateFrequency: number;

  @property(String)
  declare mode: TLPMode;

  @property(Boolean)
  declare manual: boolean;

  constructor() {
    // @ts-ignore
    super({ updateFrequency: 1000, mode: TLPMode.BATTERY } as any);

    interval(this.updateFrequency, () =>
      execAsync("sudo tlp-stat -m").then((result) => {
        this.manual = result.includes("manual") ? true : false;
        if (this.mode !== result) {
          this.mode = <TLPMode>result.replace(" (manual)", "").trim();
        }
      }),
    );
  }
}
