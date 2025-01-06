import { bind, exec, Variable } from "astal";
import { symbolicStrength } from "./utils";
import AstalBattery from "gi://AstalBattery?version=0.1";

const battery = AstalBattery.get_default();

function getBatteryIcon(percentage: number): string {
  const maxCapacity = exec(
    "cat /sys/class/power_supply/BAT0/charge_control_end_threshold",
  );
  const icon = symbolicStrength(
    percentage,
    ["", "", "", "", ""],
    Number(maxCapacity),
  );
  return icon;
}

export enum BatteryState {
  UNKNOWN = "unknown",
  CHARGING = "charging",
  DISCHARGING = "discharging",
  EMPTY = "empty",
  FULLY_CHARGED = "fully charged",
  PENDING_CHARGE = "pending charge",
  PENDING_DISCHARGE = "pending discharge",
}

export const batteryIcon = Variable.derive(
  [bind(battery, "percentage"), bind(battery, "state")],
  (percentage: number, stateIndex: AstalBattery.State) => {
    const state = Object.values(BatteryState)[stateIndex] as BatteryState;
    if (state === BatteryState.CHARGING) {
      return "";
    } else if (state === BatteryState.PENDING_CHARGE) {
      return "";
    } else if (state == BatteryState.DISCHARGING) {
      return getBatteryIcon(percentage * 100);
    }
  },
);
