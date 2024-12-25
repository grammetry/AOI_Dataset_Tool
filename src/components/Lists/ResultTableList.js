import React, { useState, useRef, useEffect } from 'react';
import ResultCard from '../Cards/ResultCard';
import ToggleButton from '../../components/Buttons/ToggleButton';
import { datasetImgAPI } from '../../APIPath';
import Image_default from '../../image/Image_Default.svg';
import Hotkeys from 'react-hot-keys';


//import Modal from 'react-bootstrap/Modal';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';

const ResultTableList = (props) => {

    const tableColumnWidth = [80, 150, 180, 150, 150, 150, 150, 100];

    const hoverImageRef = useRef(null);

    const [hoverItem1, setHoverItem1] = useState('');
    const [hoverItem2, setHoverItem2] = useState('');

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const replaceImage = (error) => {

        error.target.src = Image_default;

    }

    const handleLabelToggle = (imageUuid) => {
        props.onChange(imageUuid);
    }

    const handleKeyDown = (keyName, e) => {

        if (e.code === 'Space') {
            if ((hoverItem1 !== '') && (hoverItem2 !== '')) {
                if (show === false) setShow(true);
            }
        }

    }

    const handleKeyUp = (keyName, e) => {

        if (e.code === 'Space') {
            setShow(false);
            //sethoverItem('');
        }
    }

    const theme = extendTheme({
        components: {
            JoyModalDialog: {
                defaultProps: { layout: 'top' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.layout === 'top' && {
                            top: '0px',
                            left: '0px',
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'transparent',
                            border: '0px',
                            padding: '0px',
                            borderRadius: '0px',
                        }),
                    }),
                },
            },
        },
    });

    // useEffect(() => {

    //     console.log('show', show);
    //     console.log('hoverItem', hoverItem);

    //    if (show){
    //         if (hoverImageRef.current)
    //         hoverImageRef.current.src = datasetImgAPI(hoverItem);
    //    }

    // }, [show]);

    return (
        <ThemeProvider theme={theme}>
            <Hotkeys
                keyName="Space"
                onKeyDown={handleKeyDown.bind(this)}
                onKeyUp={handleKeyUp.bind(this)}
                disabled={false}
                allowRepeat={true}
            ></Hotkeys>


            <Modal open={show}>
                <ModalDialog style={{ width: '100vw', height: '100vh', backgroundColor:'#ffffffcc' }} layout='top'>
                    <div className='d-flex flex-row align-items-center align-items-center gap-4' style={{ width: '100vw', height: '100vh' }}>
                        <div style={{backgroundColor:'transparent',width: '50vw', height: '100vh'}} className='d-flex justify-content-center align-items-center'>
                            <img src={datasetImgAPI(hoverItem1)} style={{maxWidth:'46vw',maxHeight:'92vh' }} />
                        </div>
                        <div style={{backgroundColor:'transparent',width: '50vw', height: '100vh'}} className='d-flex justify-content-center align-items-center'>
                            <img src={datasetImgAPI(hoverItem2)} style={{maxWidth:'46vw',maxHeight:'92vh' }} />
                        </div>
                    </div>
                    
                </ModalDialog>
            </Modal>

            <div className='my-table'>
                <div className={(true) ? 'my-thead' : 'my-thead-shadow'} style={{ backgroundColor: "#FAFAFD" }}>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[0] }}>Order</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[1] }}>Part No.</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[2] }}>Light Source</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[3] }}>Image</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[4] }}>Golden</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[5] }}>Score</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[6] }}>Label</div>
                </div>
                <div className='my-tbody' style={{ height: 650 }}>
                    {
                        props.data.map((item, index) => (
                            <div className={`my-tbody-row-${(index % 2 === 1) ? "1" : "2"}`} key={item.imageUuid}>

                                <div className='my-tbody-td' style={{ width: tableColumnWidth[0] }} >{item.sortIndex + 1}</div>
                                <div className='my-tbody-td' style={{ width: tableColumnWidth[1] }} >
                                    {item.compName}
                                </div>
                                <div className='my-tbody-td' style={{ width: tableColumnWidth[2] }} >
                                    {item.lightSource}
                                </div>

                                <div className='my-tbody-td' style={{ width: tableColumnWidth[3] }} >
                                    <div className={(item.label === "PASS") ? 'my-thumb-image-container-pass' : 'my-thumb-image-container-ng'} onMouseEnter={() => { setHoverItem1(item.imageUuid); setHoverItem2(item.goldenUuid) }} >
                                        <img src={datasetImgAPI(item.imageUuid)} onError={replaceImage} style={{ maxHeight: 44, maxWidth: 44 }} />
                                    </div>
                                </div>
                                <div className='my-tbody-td' style={{ width: tableColumnWidth[4] }} onMouseEnter={() => { setHoverItem1(item.imageUuid); setHoverItem2(item.goldenUuid) }} >
                                    <div className='my-thumb-image-container'>
                                        <img src={datasetImgAPI(item.goldenUuid)} onError={replaceImage} style={{ maxHeight: 44, maxWidth: 44 }} />
                                    </div>
                                </div>
                                <div className='my-tbody-td' style={{ width: tableColumnWidth[5] }} >
                                    {item.score}
                                </div>
                                <div className='my-tbody-td' style={{ width: tableColumnWidth[6] }} >
                                    {item.label}
                                </div>
                                <div className='my-tbody-td' style={{ width: tableColumnWidth[7] }} >
                                    <ToggleButton id={'toggle_' + item.imageUuid} status={(item.label === "PASS") ? "run" : "stop"} 
                                    onChange={() => handleLabelToggle(item.imageUuid)}
                                    top={-6} left={0}
                                ></ToggleButton>
                                </div>

                            </div>
                        ))
                    }
                </div>
            </div>
        </ThemeProvider>
    );
};

export default ResultTableList;

