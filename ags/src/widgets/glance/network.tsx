import AstalNetwork from "gi://AstalNetwork?version=0.1";
import GlancePage, { GlanceHeader, GlancePageID } from "./glance-page";
import { bind, Variable } from "astal";
import { symbolicStrength } from "src/lib/utils";
import WWAN from "src/services/wwan";

const getWifiIcon = (strength: number) => {
  return symbolicStrength(strength, ["󰤟", "󰤢", "󰤢", "󰤨"]);
};

export default function GlanceNetwork() {
  //const network = AstalNetwork.get_default();
  //const wwan = WWAN.get_default();
  //
  ////bind(network, "connectivity").subscribe((value) =>
  ////  console.log(Object.keys(AstalNetwork.Connectivity)[value]),
  ////);
  //bind(wwan, "internet").subscribe((value) =>
  //  console.log(network.connectivity),
  //);
  //const headerLabel = Variable.derive(
  //  [
  //    bind(network, "connectivity"),
  //    bind(network.wifi, "internet"),
  //    bind(network.wifi, "ssid"),
  //    bind(network.wifi, "enabled"),
  //    bind(wwan, "internet"),
  //  ],
  //  (connectivity, wifiInternet, wifiSSID, wifiEnabled, wwanInternet) => {
  //    if (
  //      connectivity === AstalNetwork.Connectivity.NONE &&
  //      wifiInternet !== AstalNetwork.Internet.CONNECTING &&
  //      wwanInternet !== AstalNetwork.Internet.CONNECTED
  //    ) {
  //      return "disconnected from the internet";
  //    } else if (
  //      connectivity === AstalNetwork.Connectivity.LIMITED ||
  //      wifiInternet === AstalNetwork.Internet.CONNECTING ||
  //      wwanInternet === AstalNetwork.Internet.CONNECTING
  //    ) {
  //      return "attempting to connect to the internet";
  //    } else if (
  //      connectivity === AstalNetwork.Connectivity.FULL ||
  //      wifiInternet === AstalNetwork.Internet.CONNECTED ||
  //      wwanInternet === AstalNetwork.Internet.CONNECTED
  //    ) {
  //      if (
  //        wifiInternet === AstalNetwork.Internet.CONNECTED &&
  //        wifiSSID !== null &&
  //        wifiEnabled
  //      ) {
  //        console.log(bind(network.wifi, "ssid").get());
  //        return "connected to the internet via wifi";
  //      } else if (wwanInternet === AstalNetwork.Internet.CONNECTED) {
  //        return "connected to the internet via wwan";
  //      }
  //    }
  //    return "unknown";
  //  },
  //);
  return (
    <GlancePage
      name={GlancePageID.NETWORK}
      //onDestroy={() => {
      //  headerLabel.drop();
      //}}
    >
      <GlanceHeader icon="" label="internet" />
      {/*
        <GlanceHeader
          icon={bind(network.wifi, "strength").as(getWifiIcon)}
          label={}
        />
         */}
    </GlancePage>
  );
}
