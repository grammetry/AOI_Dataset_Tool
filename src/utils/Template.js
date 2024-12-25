// third party imports
import React, { useState, useRef, forwardRef, useEffect, useImperativeHandle } from "react";

// local imports
import log from "../../utils/console";
import Utility, { UtilityRef } from '../../utils/Utility';

const Template = forwardRef((props, ref) => {

    const [value, setValue] = useState('');

    useImperativeHandle(ref, () => ({

        setInputValue: (myValue) => {
            setValue(myValue);

        },
        getInputValue: () => {
            return value;
        }
    }));

    useEffect(() => {

        log("Template useEffect")

    }, []);

    return (
        <>
            <Utility ref={utilityRef} />
        </>
    )
});

export default Template;