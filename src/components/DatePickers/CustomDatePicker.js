import React, { useState, forwardRef, useEffect, useImperativeHandle } from "react";
import log from "../../utils/console";
import moment from 'moment';
import OutsideClickHandler from 'react-outside-click-handler';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const CustomDatePicker = forwardRef((props, ref) => {

    const [inputValue, setInputValue] = useState(moment().format("YYYY-MM-DD"));
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({

        setInputValue: (myValue) => {
            setInputValue(myValue);

        },
        getInputValue: () => {
            return inputValue;
        },

    }));

    useEffect(() => {

        if (props.defaultValue) {
            if (props.defaultValue.length === 10) {
                setInputValue(props.defaultValue);
            }
        }

    }, [props.defaultValue]);

    return (
        <div style={{ position: 'relative' }}>
            <div
                className="my-text-input"
                style={{
                    width: (props.width) ? props.width : 100,
                    height: (props.height) ? props.height : 36,
                    borderRadius: (props.borderRadius) ? props.borderRadius : 5,
                    cursor: "pointer",
                }}
                onClick={() => setOpen(!open)}
            >
                {inputValue}
            </div>
            {
                open ?
                    <OutsideClickHandler
                        onOutsideClick={() => setOpen(false)}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 40,
                            left: 0,
                            zIndex: 1000,

                        }}>
                            <DatePicker
                                dateFormat="YYYY-MM-dd"
                                className='form-control form-control-solid'
                                selected={new Date(inputValue)}
                                onChange={(date) => { setInputValue(date ? date.toISOString().slice(0, 10) : ''); setOpen(false) }}
                                inline
                            />
                        </div>
                    </OutsideClickHandler>
                    :
                    <></>
            }
        </div>
    )
});

export default CustomDatePicker;