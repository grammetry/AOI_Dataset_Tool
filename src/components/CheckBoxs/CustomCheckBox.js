import { useEffect, useRef, useState } from "react";
//import "./styles.css";
import classNames from "classnames";

const CustomCheckBox = ({
  indeterminate = false,
  label,
  color,
  disabled,
  name,
  value,
  onChange,
  checked,
  ...props
}) => {
  const cRef = useRef();

  useEffect(() => {
    cRef.current.indeterminate = indeterminate;
  }, [cRef, indeterminate]);

  return (
    <div className="checkbox-content">
      <label
        className={classNames(
          { ...props },
          "checkbox",
          `checkbox-${color}`,
          disabled && "checkbox-disabled",
          indeterminate && `checkbox-${color}-indeterminate`
        )}
      >
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          ref={cRef}
        />
        <span>{label}</span>
      </label>
    </div>
  );
};

export default CustomCheckBox;