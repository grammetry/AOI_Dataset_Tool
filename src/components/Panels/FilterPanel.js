import React, { useEffect, forwardRef, useImperativeHandle } from 'react';

import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, take, slice, uniqBy } from 'lodash-es';

import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Checkbox from '@mui/joy/Checkbox';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';

import CustomButton from '../Buttons/CustomButton';
import SwitchButton from '../Buttons/SwitchButton';
import JoyCheckBox from '../CheckBoxs/JoyCheckBox';

import CustomInput from '../Inputs/CustomInput';


const FilterPanel = forwardRef((props, ref) => {

    const [compNameList, setCompNameList] = React.useState([]);
    const [lightSourceList, setLightSourceList] = React.useState([]);
    const [labelList, setLabelList] = React.useState([{ name: 'PASS', checked: true }, { name: 'NG', checked: true }]);

    const [openMenu, setOpenMenu] = React.useState(false);
    const [checkAllCompNameItem, setCheckAllCompNameItem] = React.useState(true);
    const [checkAllLightSourceItem, setCheckAllLightSourceItem] = React.useState(true);
    const [checkAllLabelItem, setCheckAllLabelItem] = React.useState(true);


    useImperativeHandle(ref, () => ({

        setToggle: () => {
            setOpenMenu(!openMenu);
        },

    }));

    const theme = extendTheme({
        components: {
            JoyDivider: {
                defaultProps: { orientation: 'vertical' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.orientation === 'vertical' && {
                            color: 'black',
                            width: '1px',
                            opacity: 1,
                        }),
                    }),
                },
            },
            JoyModalDialog: {
                defaultProps: { layout: 'center' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.layout === 'center' && {

                            width: '400px',
                            height: '300px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #E0E1E6',
                            boxShadow: '0px 0px 4px #CACBD733',
                            padding: '40px',
                            fontFamily: 'Roboto',
                        }),
                    }),
                },
            },
        },
    });


    const toggleLabelItem = (name, checked) => {

        console.log(name, checked)

        let myDataList = cloneDeep(labelList);
        myDataList.map((item) => {
            if (item.name === name) {
                item.checked = !checked;
            }
        });
        setLabelList(myDataList);

    }

    const toggleLightSourceItem = (name, checked) => {

        console.log(name, checked)

        let myDataList = cloneDeep(lightSourceList);
        myDataList.map((item) => {
            if (item.name === name) {
                item.checked = !checked;
            }
        });
        setLightSourceList(myDataList);

    }

    const toggleCompNameItem = (name, checked) => {

        console.log(name, checked)

        let myDataList = cloneDeep(compNameList);
        myDataList.map((item) => {
            if (item.name === name) {
                item.checked = !checked;
            }
        });
        setCompNameList(myDataList);

    }

    useEffect(() => {

        setLightSourceList(props.lightSourceList);

    }, [props.lightSourceList]);

    useEffect(() => {

        setCompNameList(props.compNameList);

    }, [props.compNameList]);

    useEffect(() => {

        let myCompNameList = cloneDeep(compNameList);
        myCompNameList.map((item) => {
            item.checked = checkAllCompNameItem;
        });
        setCompNameList(myCompNameList);

    }, [checkAllCompNameItem]);

    useEffect(() => {

        let myLightSourceList = cloneDeep(lightSourceList);
        myLightSourceList.map((item) => {
            item.checked = checkAllLightSourceItem;
        });
        setLightSourceList(myLightSourceList);

    }, [checkAllLightSourceItem]);

    useEffect(() => {

        let myLabelList = cloneDeep(labelList);
        myLabelList.map((item) => {
            item.checked = checkAllLabelItem;
        });

        console.log('myLabelList')
        console.log(myLabelList)


        setLabelList(myLabelList);

    }, [checkAllLabelItem]);

    useEffect(() => {

        props.onChange(compNameList, lightSourceList, labelList);

    }, [compNameList, lightSourceList, labelList]);

    return (
        <>
            <ThemeProvider theme={theme}>
                <Modal open={openMenu}>
                    <ModalDialog style={{ width: '600px', height: '800px', backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2'>
                                    <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Lable</h4>
                                       
                                        <JoyCheckBox
                                            label="All"
                                            checked={true}
                                            indeterminate={false}
                                            data={labelList}
                                            onChange={setLabelList}
                                        />
                                    </div>
                                </div>

                                <hr style={{ margin: '8px 0px 16px 0px' }} />
                                <div className='my-item-wrapper' style={{ height: 50 }}>
                                    {
                                        labelList.map((item, index) => {
                                            return (

                                                <div className='my-item-container' key={'label_toggle_' + index}>
                                                    <JoyCheckBox
                                                        label={item.name}
                                                        checked={item.checked}
                                                        indeterminate={false}
                                                        data={[item]}
                                                        width={240}
                                                        onChange={() => toggleLabelItem(item.name, item.checked)}
                                                    />
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                <div className='row mt-3'>
                                    <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Light Source</h4>
                                        <JoyCheckBox
                                            label="All"
                                            checked={true}
                                            indeterminate={false}
                                            data={lightSourceList}
                                            onChange={setLightSourceList}
                                        />
                                    </div>
                                </div>
                                <hr style={{ margin: '8px 0px 16px 0px' }} />
                                <div className='row mt-3'>
                                    <div className='col-12'>

                                        <div className='my-item-wrapper' style={{ height: 90 }}>
                                            {
                                                lightSourceList.map((item, index) => {
                                                    return (

                                                        <div className='my-item-container' key={'light_source_toggle_' + index}>
                                                            <JoyCheckBox
                                                                label={item.name}
                                                                checked={item.checked}
                                                                indeterminate={false}
                                                                data={[item]}
                                                                width={240}
                                                                onChange={() => toggleLightSourceItem(item.name, item.checked)}
                                                            />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                    </div>
                                </div>

                                <div className='row mt-2'>
                                    <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Part No.</h4>

                                        <JoyCheckBox
                                            label="All"
                                            checked={true}
                                            indeterminate={false}
                                            data={compNameList}
                                            onChange={setCompNameList}
                                        />



                                    </div>
                                </div>
                                <hr style={{ margin: '8px 0px 16px 0px' }} />
                                <div className='row mt-3'>
                                    <div className='col-12'>

                                        <div className='my-item-wrapper'>
                                            {
                                                compNameList.map((item, index) => {
                                                    return (
                                                        
                                                        <div className='my-item-container' key={'comp_name_toggle_' + index}>
                                                            <JoyCheckBox
                                                                label={item.name}
                                                                checked={item.checked}
                                                                indeterminate={false}
                                                                data={[item]}
                                                                width={240}
                                                                onChange={() => toggleCompNameItem(item.name, item.checked)}
                                                            />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>

                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setOpenMenu(false)} /></div>

                                </div>
                            </div>
                        </div>


                    </ModalDialog>
                </Modal>
            </ThemeProvider >

        </>
    );
});

export default FilterPanel;