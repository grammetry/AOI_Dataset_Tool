import React, { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';

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

const EditPanel = forwardRef((props, ref) => {

    const {currentEditIndex,serverList} = props;

    const [openMenu, setOpenMenu] = React.useState(false);
    const serverNameRef = useRef(null);
    const serverIpRef = useRef(null);
 
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

   

   

   

    return (
        <>
            <ThemeProvider theme={theme}>
                
                <Modal open={openMenu}>
                    <ModalDialog style={{ width: '50%', height: '50%', backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>{(currentEditIndex >= 0) ? `Edit Item ${currentEditIndex + 1}` : `Add New Item`}</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Server Name (filter panel)
                                        </div>
                                        <div>
                                            <CustomInput defaultValue={(currentEditIndex >= 0) ? serverList[currentEditIndex].name : ``} onChange={() => { }} width="100%" height="48" placeholder="" ref={serverNameRef}></CustomInput>
                                        </div>

                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title'>
                                            Server IP
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <CustomInput defaultValue={(currentEditIndex >= 0) ? serverList[currentEditIndex].ip : ``} width="100%" height="48" onChange={() => { }} disabled={false} ref={serverIpRef}></CustomInput>

                                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                <CustomButton name="view" text="Test" width={100} height={32} onClick={() => { }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setOpenMenu(false)} /></div>
                                    <div><CustomButton name="view" text="Save" width={100} height={32} onClick={()=>{}} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>
            </ThemeProvider >

        </>
    );
});

export default EditPanel;