import { useEffect, useRef, useState } from "react";
import Box from '@mui/joy/Box';
import Checkbox from '@mui/joy/Checkbox';
import classNames from "classnames";
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, take, slice, uniqBy } from 'lodash-es';

const JoyCheckBox = (props) => {

    const [checked, setChecked] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);


    const getChecked = () => {
        //return true;
    };

    const getIndeterminate = () => {
        //return false;
    }

    const setData = (myBoolean) => {
        //setChecked(true);
        let myDataList = cloneDeep(props.data);
        myDataList.map((item) => {
            item.checked = myBoolean;
        });
        return myDataList;
    }

    const handleChange = (evt) => {
        console.log('handleChange')
        evt.stopPropagation();
        console.log(props.data)
        if (indeterminate) {
            setIndeterminate(false);
            props.onChange(setData(true));
            return;
        }

        if (checked) {
            props.onChange(setData(false));
            return;
        }
        if (!checked) {
            props.onChange(setData(true));
            return;
        }
    }


    useEffect(() => {

        const checkedNumber = filter(props.data, { checked: true }).length;
        const uncheckedNumber = filter(props.data, { checked: false }).length;
        const totalNumber = props.data.length;
        if (checkedNumber === totalNumber) {
            setIndeterminate(false);
            setChecked(true);
            return;
        }
        if (uncheckedNumber === totalNumber) {
            setIndeterminate(false);
            setChecked(false);
            return;
        }
        if (checkedNumber > 0 && uncheckedNumber > 0) {
            setIndeterminate(true);
            return;
        }

    }, [props.data]);

    return (
        <div className='my-item-container' style={{ width: (props.width) ? props.width : 100 }}>
            {
                (props.onlyBox) ?
                    <div className="my-check-all" onClick={handleChange}>
                        <div style={{ padding: '2px 2px' }}>{props.label}</div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: (props.left) ? props.left : -20, top: (props.top) ? props.top : 3 }}>
                                <Checkbox
                                    label=""
                                    checked={checked}
                                    indeterminate={indeterminate}
                                    //onChange={handleChange}
                                    onClick={handleChange}
                                />
                            </div>
                        </div>

                    </div>
                    :
                    <div className={(checked) ? "my-tag-pass" : "my-tag-close"} onClick={handleChange}>
                        <div style={{ padding: '2px 2px' }}>{props.label}</div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: (props.left) ? props.left : -20, top: (props.top) ? props.top : 3 }}>
                                <Checkbox
                                    label=""
                                    checked={checked}
                                    indeterminate={indeterminate}
                                    //onChange={handleChange}
                                    onClick={handleChange}
                                />
                            </div>
                        </div>

                    </div>
            }


        </div>
    );
};

export default JoyCheckBox;