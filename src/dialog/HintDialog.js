
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';


import CustomButton from '../components/Buttons/CustomButton';
import CustomInput from '../components/Inputs/CustomInput';

const HintDialog = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [show, setShow] = useState(false);


    useImperativeHandle(ref, () => ({

        SetOpen: () => {
            setShow(true);
        },


    }));

    const theme = extendTheme({
        components: {
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

        colorSchemes: {
            light: {
                palette: {
                    danger: {


                        outlinedBorder: '#ed1b23', // outlined Border
                        outlinedColor: '#ed1b23', // text color
                        outlinedActiveBg: '#ed1b2333', // background color

                        plainColor: '#00ff00',
                        plainActiveBg: '#00ff00',
                    },
                },
            },

        }
    });






    return (
        <>

            <ThemeProvider theme={theme}>

                <Modal open={show}>
                    <ModalDialog style={{ width: 800, height: 600, borderRadius: 12 }} layout='center'>
                        <div className='d-flex align-items-start flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='row'>
                                <div className='col-md-12 mt-3'>
                                    <h4 style={{ margin: 0 }}>Shortcut key hint</h4>
                                </div>
                            </div>
                         
                                    <ol className="col-12 list-group list-group-numbered mt-3 my-list">
                                        <li className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">Show full size image on new tab</div>
                                                Press alt (or option) key and click the image.
                                            </div>
                                            
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">Quick view image on same page</div>
                                                Mouse over the image and click key space.
                                            </div>
                                            
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">Select all or unselect all block data items</div>
                                                Mouse over the block and double click.
                                            </div>
                                            
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">Select continuity items</div>
                                                Mouse click the first item, and then press key shift and mouse click the last one.
                                            </div>
                                            
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">Move selected items between blocks</div>
                                                Mouse drag one of item move to other block or simply use key direction move selected items one times.
                                            </div>
                                           
                                        </li>
                                    </ol>


                    
                        </div>

                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShow(false)} /></div>
                                </div>
                            </div>
                        </div>





                    </ModalDialog>
                </Modal>

            </ThemeProvider >
        </>
    );
});

export default HintDialog;

