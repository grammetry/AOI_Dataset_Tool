import React, { useEffect, forwardRef, useImperativeHandle } from 'react';

import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, take, slice, uniqBy } from 'lodash-es';

import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';

import CustomButton from '../Buttons/CustomButton';
import SwitchButton from '../Buttons/SwitchButton';

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

    const getGroupItems = (myData) => {



        const myCompNameList = uniqBy(myData, 'compName');
        const myCompNameArr = map(myCompNameList, 'compName');
        let myCompName = [];
        myCompNameArr.map((item) => {
            myCompName.push({ name: item, checked: true });
        });
        setCompNameList(myCompName);



        const myLightSourceList = uniqBy(myData, 'lightSource');
        const myLightSourceArr = map(myLightSourceList, 'lightSource');
        let myLightSource = [];
        myLightSourceArr.map((item) => {
            myLightSource.push({ name: item, checked: true });
        });
        setLightSourceList(myLightSource);



    };

    const toggleCompNameItem = (name, checked) => {

        console.log(name, checked)

        let myCompNameList = cloneDeep(compNameList);
        myCompNameList.map((item) => {
            if (item.name === name) {
                item.checked = !checked;
            }
        });
        setCompNameList(myCompNameList);

    }

    const toggleLightSourceItem = (name, checked) => {

        console.log(name, checked)

        let myLightSourceList = cloneDeep(lightSourceList);
        myLightSourceList.map((item) => {
            if (item.name === name) {
                item.checked = !checked;
            }
        });
        setLightSourceList(myLightSourceList);

    }

    const toggleLabelItem = (name, checked) => {

        console.log(name, checked)

        let myLabelList = cloneDeep(labelList);
        myLabelList.map((item) => {
            if (item.name === name) {
                item.checked = !checked;
            }
        });
        setLabelList(myLabelList);

    }

    useEffect(() => {

        getGroupItems(props.data)

    }, [props.data]);

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
                                    <div className='col-12 d-flex justify-content-between'>
                                        <h4 style={{ margin: 0 }}>Lable</h4>
                                        <div className='my-item-container-all'>
                                            <div className={(checkAllLabelItem) ? "my-tag-pass" : "my-tag-close"} style={{ marginRight: 0 }}>
                                                <span>All</span>
                                                <SwitchButton id={'label_toggle_all'} status={(checkAllLabelItem) ? "run" : "stop"}
                                                    onChange={() => setCheckAllLabelItem(!checkAllLabelItem)}
                                                    left={-32} top={3}
                                                ></SwitchButton>
                                            </div>
                                        </div>



                                    </div>
                                </div>

                                <hr style={{ margin: '8px 0px 16px 0px' }} />
                                <div className='my-item-wrapper' style={{ height: 50 }}>
                                    {
                                        labelList.map((item, index) => {
                                            return (
                                                <div className='my-item-container' key={'label_toggle_' + index}>

                                                    <div className={(item.checked) ? "my-tag-pass" : "my-tag-close"} style={{ marginRight: 10 }}>
                                                        <span>{item.name}</span>

                                                        <SwitchButton id={'label_toggle_id_' + index} status={(item.checked) ? "run" : "stop"}
                                                            onChange={() => toggleLabelItem(item.name, item.checked)}
                                                            left={-30} top={2}
                                                        ></SwitchButton>

                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                <div className='row mt-3'>
                                    <div className='col-12 d-flex justify-content-between'>
                                        <h4 style={{ margin: 0 }}>Light Source</h4>
                                        <div className='my-item-container-all'>
                                            <div className={(checkAllLightSourceItem) ? "my-tag-pass" : "my-tag-close"} style={{ marginRight: 0 }}>
                                                <span>All</span>
                                                <SwitchButton id={'light_source_toggle_all'} status={(checkAllLightSourceItem) ? "run" : "stop"}
                                                    onChange={() => setCheckAllLightSourceItem(!checkAllLightSourceItem)}
                                                    left={-32} top={3}
                                                ></SwitchButton>
                                            </div>
                                        </div>
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

                                                            <div className={(item.checked) ? "my-tag-pass" : "my-tag-close"} style={{ marginRight: 10 }}>
                                                                <span>{item.name}</span>

                                                                <SwitchButton id={'light_source_toggle_id_' + index} status={(item.checked) ? "run" : "stop"}
                                                                    onChange={() => toggleLightSourceItem(item.name, item.checked)}
                                                                    left={-30} top={2}
                                                                ></SwitchButton>

                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                    </div>
                                </div>

                                <div className='row mt-2'>
                                    <div className='col-12 d-flex justify-content-between'>
                                        <h4 style={{ margin: 0 }}>Part No.</h4>
                                        <div className='my-item-container-all'>
                                            <div className={(checkAllCompNameItem) ? "my-tag-pass" : "my-tag-close"} style={{ marginRight: 0 }}>
                                                <span>All</span>
                                                <SwitchButton id={'comp_name_toggle_all'} status={(checkAllCompNameItem) ? "run" : "stop"}
                                                    onChange={() => setCheckAllCompNameItem(!checkAllCompNameItem)}
                                                    left={-32} top={3}
                                                ></SwitchButton>
                                            </div>
                                        </div>

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

                                                            <div className={(item.checked) ? "my-tag-pass" : "my-tag-close"} style={{ marginRight: 10 }}>
                                                                <span>{item.name}</span>

                                                                <SwitchButton id={'comp_name_toggle_id_' + index} status={(item.checked) ? "run" : "stop"}
                                                                    onChange={() => toggleCompNameItem(item.name, item.checked)}
                                                                    left={-30} top={2}
                                                                ></SwitchButton>

                                                            </div>
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