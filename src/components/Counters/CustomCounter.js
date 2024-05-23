import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import log from "../../utils/console";
import ReactDOM from "react-dom";
import { useCountUp } from "use-count-up";

const CustomCounter = forwardRef((props, ref) => {

    const { currentStep, totalStep } = props;

    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [duration, setDuration] = useState(2);
    const [decimalPlaces, setDdecimalPlaces] = useState(0);
    const [easing, setEasing] = useState("easeOutCubic");
    const [thousandsSeparator, setThousandsSeparator] = useState("");
    const [decimalSeparator, setDecimalSeparator] = useState("");
    const setValue = (func) => (event) => func(parseFloat(event.target.value));
    const setText = (func) => (event) => func(event.target.value);

    const { value, reset } = useCountUp({
        isCounting: true,
        start,
        end,
        duration,
        easing,
        decimalPlaces,
        thousandsSeparator,
        decimalSeparator
    });

    useImperativeHandle(ref, () => ({

        resetCounter: () => {
            reset();
        }
    }));

    useEffect(() => {

        if (currentStep>0){
            const currentValue = Math.round((currentStep / totalStep) * 100);
            const lastValue = (currentStep === 0) ? 0 : Math.round(((currentStep - 1) / totalStep) * 100);
            setStart(lastValue);
            setEnd(currentValue);
            reset();
        }else{
            setStart(0);
            setEnd(0);
            reset();
        }
        

    }, [currentStep, totalStep]);

    useEffect(() => {

       //log('value===>',value)
       props.updatePercent(Math.round(parseInt(value)));

    }, [value]);

    return (

        <div>{value}%</div>

    );
});

export default CustomCounter;

