import { Binding } from "astal";
import { BoxProps, EventBoxProps } from "astal/gtk3/widget";

interface BarModuleProps {
  className: string | Binding<string | undefined> | undefined;
  eventbox?: EventBoxProps;
  box?: BoxProps;
  child?: JSX.Element;
  children?: Array<JSX.Element>;
}

export default function BarModule({
  className,
  eventbox,
  box,
  child,
  children,
}: BarModuleProps): JSX.Element {
  return (
    <eventbox className={className} {...eventbox}>
      <box className="module" {...box}>
        {child ?? children}
      </box>
    </eventbox>
  );
}
