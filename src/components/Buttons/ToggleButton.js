import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import log from "../../utils/console";
import styled from 'styled-components';

const CheckBoxWrapper = styled.div`
position: relative;
`;

const CheckBoxLabel = styled.label`
position: absolute;
top: 0;
left: 0;
width: 36px;
height: 20px;
border-radius: 15px;
background: #0000001F;
cursor: pointer;
&::after {
content: "";
display: block;
border-radius: 50%;
width: 14px;
height: 14px;
margin: 3px;
background: #ffffff;

transition: 0.2s;
}
`;

const CheckBox = styled.input`
opacity: 0;
z-index: 1;
border-radius: 15px;
width: 42px;
height: 26px;
&:checked + ${CheckBoxLabel} {
background: #34C756;
&::after {
    content: "";
    display: block;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    margin-left: 20px;
    transition: 0.2s;
}
}
`;

// function ToggleButton({ onChange, status }) {
const ToggleButton = forwardRef((props, ref) => {

    const [isChecked, setIsChecked] = useState(props.status === "run" ? true : false);
    const [disabled, setDisabled] = useState(false);

    const handleCheckboxChange = (event) => {

        log('checked?')
        log(event.target.checked)
        //setDisabled(true);
        setIsChecked(event.target.checked);
        props.onChange(event.target.checked);


    };

    useImperativeHandle(ref, () => ({

        getDisabled: () => {
            return disabled;
        },

        getValue: () => {
            return isChecked;
        },

        setValue: (myValue) => {
            setIsChecked(myValue);
        },

    }));


    useEffect(() => {

        if (props.status === 'run') setDisabled(false);
        if (props.status === 'stop') setDisabled(false);
        if (props.status.toLowerCase().indexOf('error') >= 0) {
            setDisabled(false);
            setIsChecked(false);
        }

    }, [props.status]);

    return (

        <div>
            <CheckBoxWrapper>
                <CheckBox id="checkbox" type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                <CheckBoxLabel htmlFor="checkbox" />
            </CheckBoxWrapper>
        </div>
    );
});

export default ToggleButton;
