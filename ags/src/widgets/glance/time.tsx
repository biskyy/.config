import { astalify, type ConstructProps, Gtk } from "astal/gtk3";
import GlancePage, { GlancePageID } from "./glance-page";
import { GObject, Variable } from "astal";
import { currentDate, currentTime } from "src/lib/time";

// subclass, register, define constructor props
class Calendar extends astalify(Gtk.Calendar) {
  static {
    GObject.registerClass(this);
  }

  constructor(
    props: ConstructProps<
      Calendar,
      Gtk.Calendar.ConstructorProps,
      {
        onDaySelected: [];
        onDaySelectedDoubleClick: [];
        onMonthChanged: [];
        onNextMonth: [];
        onNextYear: [];
        onPrevMonth: [];
        onPrevYear: [];
      } // signals of Gtk.Calendar have to be manually typed
    >,
  ) {
    super(props as any);
  }
}

export default function GlanceTime() {
  return (
    <GlancePage name={GlancePageID.TIME}>
      <label className="clock" label={currentTime()} />
      <label className="date" label={currentDate()} />
      <Calendar />
    </GlancePage>
  );
}
