import { Binding } from "astal";

declare global {
  export var PanelManager: typeof import("src/panel-manager").default;
}

//declare module "astal/gtk3/widget" {
//export interface WindowProps {}
//}

declare module "gi://Gtk?version=3.0" {
  export namespace Gtk {
    interface Window {
      className?: string | Binding<string | undefined> | undefined;
    }
  }
}

//export {};
