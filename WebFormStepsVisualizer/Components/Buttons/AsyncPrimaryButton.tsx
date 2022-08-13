import { PrimaryButton } from "@fluentui/react/lib/Button";
import { IIconProps } from "@fluentui/react/lib/Icon";
import * as React from "react";

export const AsyncPrimaryButton = (props: {
  onClick: () => Promise<void>;
  text: string;
  loadingText: string;
  style?: React.CSSProperties | undefined;
  iconProps?: IIconProps | undefined
}) => {
  const [buttonState, setButtonState] = React.useState("loaded");

  const onClick = async () => {
    setButtonState("loading");
    await props.onClick();
    setButtonState("loaded");
  };

  return (
    <PrimaryButton
      style={props.style}
      text={buttonState === "loaded" ? props.text : props.loadingText}
      disabled={buttonState === "loading"}
      onClick={onClick}
      iconProps={props.iconProps}
    />
  );
};
