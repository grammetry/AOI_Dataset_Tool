
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';


import CustomButton from '../components/Buttons/CustomButton';
import CustomInput from '../components/Inputs/CustomInput';
import ServerSelector from '../components/Dropdowns/ServerSelector';
import { taoMachineAPI, dsImageInsertAPI } from '../APIPath';
import { set } from 'lodash';
import Utility from '../utils/Utility';

const AddPicDialog = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [serverOption, setServerOption] = useState([]);
    const [attributeOption, setAttributeOption] = useState([{ value: 'train-PASS', label: 'Train-PASS' }, { value: 'train-NG', label: 'Train-NG' }, { value: 'val-PASS', label: 'Val-PASS' }, { value: 'val-NG', label: 'Val-NG' }]);

    const [compName, setCompName] = useState('');
    const [lightName, setLightName] = useState('');
    const [imageSrc, setImageSrc] = useState(null);
    const [currentIp, setCurrentIp] = useState('');
    const [currentAttribute, setCurrentAttribute] = useState('train-PASS');
    const [serverSelectorWarnning, setServerSelectorWarnning] = useState(false);

    const picIdRef = useRef();
    const serverSelectorRef = useRef(null);
    const attributeSelectorRef = useRef(null);
    const myImageRef = useRef();
    const utilityRef = useRef();


    useImperativeHandle(ref, () => ({

        SetOpen: () => {
            setShow(true);
            setShowInfo(false);
            setCurrentIp('');
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

    const getMachineList = async () => {

        const response = await fetch(taoMachineAPI);
        const myList = await response.json();

        let myOptionList = [];
        let theOption = null;
        myList.map((server) => {
            let myOption = {};
            myOption.value = server.ip;
            myOption.label = `${server.name} - ${server.ip}:${server.port}`;
            myOptionList.push(myOption);
        });

        console.log('--- my  list ---')
        console.log(myList);

        if (myList.length === 0) {
            setServerOption([]);
            return;
        }

        if (myList.length > 0) {
            setServerOption(myOptionList);
        }

    }

    const handleServerChange = (myItem) => {
        //console.log('Server changed');
        setCurrentIp(myItem.value);
        setServerSelectorWarnning(false);
    }

    const handleAttributeChange = (myItem) => {
        //console.log('Server changed');
        setCurrentAttribute(myItem.value);
    }

    const handleFetchPic = async () => {

        let myPass = true;

        if (picIdRef.current.getInputValue() === '') {
            picIdRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please fill the image id.');
            myPass = false;
        }

        if (currentIp === '') {
            //serverSelectorRef.current.setWarnning(true);
            setServerSelectorWarnning(true);
            utilityRef.current.showMessage('Please select the server location.');
            myPass = false;
        }

        if (!myPass) {
            setShowInfo(false);
            return
        };

        try {

            const postData = {};
            const myMachineIp = currentIp;
            const myImageId = picIdRef.current.getInputValue();

            utilityRef.current.setLoading(true);

            const res = await fetch(`${dsImageInsertAPI}?machine_ip=${myMachineIp}&image_id=${myImageId}`, {
                method: 'GET',

            })

            const resJson = await res.json();

            utilityRef.current.setLoading(false);

            if (resJson.detail) {
                // utilityRef.current.setLoading(false);
                utilityRef.current.showErrorMessage(resJson.detail);
                setShowInfo(false);
                return;
            }

            setCompName(resJson.partno);
            setLightName(resJson.lightsource);
            setImageSrc('data:image/jpg;base64,' + resJson.cropimage);

            setShowInfo(true);

        } catch (error) {
            utilityRef.current.setLoading(false);
            console.log('Error:', error);
        }


    }

    const handleInsertPic = async () => {

        let myPass = true;

        console.log('compName')
        console.log(compName)

        if (!compName) {

            utilityRef.current.showMessage('Component name is emptry, please try other image.');
            myPass = false;

        }

        if (picIdRef.current.getInputValue() === '') {
            picIdRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please fill the image id.');
            myPass = false;
        }

        if (currentIp === '') {
            //serverSelectorRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please select the server location.');
            myPass = false;
        }

        if (!myPass) {
            setShowInfo(false);
            return
        };

        const postData = {};
        const myMachineIp = currentIp;
        const myImageId = picIdRef.current.getInputValue();
        postData.machine_ip = myMachineIp;
        postData.image_id = myImageId;
        postData.project_uuid= props.currentProject.project_uuid;
        postData.dataset_uuid = props.currentProject.dataset_uuid;
        postData.dataset_category = currentAttribute.split('-')[0];
        postData.data_property = "input";
        postData.data_label = currentAttribute.split('-')[1];


        console.log('--- post data ---');
        console.log(postData);

        //return;

        try {
            utilityRef.current.setLoading(true);

            const res = await fetch(dsImageInsertAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
    
            const resJson = await res.json();

            utilityRef.current.setLoading(false);
    
            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            console.log('--- insert response ---');
            console.log(resJson);   

            props.onAddPic(resJson.image_uuid);

            setShow(false);
            
        } catch (error) {
            utilityRef.current.setLoading(false);
            console.log('Error:', error);
            
        }
        
      
    }

    useEffect(() => {

        getMachineList();

    }, []);

 


    return (
        <>

            <ThemeProvider theme={theme}>

                <Modal open={show}>
                    <ModalDialog style={{ width: 800, height: 600, borderRadius: 12 }} layout='center'>
                        <div className='d-flex align-items-start flex-column bd-highlight mb-0' style={{ height: 600 }}>

                            <div className='container-fluid'>
                                <div className='row'>
                                    <div className='col-md-12 mt-3' style={{ padding: 0 }}>
                                        <h4 style={{ margin: 0, padding: 0 }}>Add new picture to dataset</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-6 mt-3 p-2'>
                                        <div className='my-input-title py-1'>
                                            Server Location
                                        </div>
                                        <div>
                                            <ServerSelector options={serverOption} onChange={handleServerChange} className="my-server-select" warnning={serverSelectorWarnning} ref={serverSelectorRef} />

                                        </div>

                                    </div>
                                    <div className='col-4 mt-3 p-2'>
                                        <div className='my-input-title py-1'>
                                            Picture ID
                                        </div>
                                        <div>
                                            <CustomInput defaultValue='' onChange={() => { }} width="100%" height={38} placeholder="" ref={picIdRef} ></CustomInput>
                                        </div>

                                    </div>
                                    <div className='col-2 mt-3 p-2 d-flex justify-content-end align-items-end'>
                                        <CustomButton name="view" text="Fetch" width={100} height={32} onClick={handleFetchPic} />
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-12 mt-3 p-2' >

                                        {
                                            (!showInfo) ?
                                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: 200 }}>
                                                    <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No picture info.</div>
                                                    <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please fill the picture id and click button 'fetch'.</div>

                                                </div>
                                                :
                                                <>
                                                    <div className='my-input-title py-1'>
                                                        Picture Information
                                                    </div>
                                                    <div className='my-pic-container d-flex flex-row gap-2 p-2' style={{ border: '1px solid lightgray', borderRadius: 5, width: '100%' }}>
                                                        <div className='my-pic' style={{ width: '30%', backgroundColor: '#cccccc' }}>
                                                            <img src={imageSrc} alt="pic" style={{ width: '100%', maxHeight: 240, objectFit: 'contain' }} ref={myImageRef} />
                                                        </div>
                                                        <div className='my-pic-info' style={{ width: '70%' }}>
                                                            <div className='my-pic-info-text'>
                                                                <div className='my-input-title py-1'>
                                                                    Component
                                                                </div>
                                                                <div className='mb-1'>
                                                                    <CustomInput defaultValue={compName} onChange={() => { }} width="100%" height={38} placeholder="" disabled={true}></CustomInput>
                                                                </div>
                                                                <div className='my-input-title py-1'>
                                                                    Light
                                                                </div>
                                                                <div className='mb-1'>
                                                                    <CustomInput defaultValue={lightName} onChange={() => { }} width="100%" height={38} placeholder="" disabled={true}></CustomInput>
                                                                </div>
                                                                <div className='my-input-title py-1'>
                                                                    Attribute
                                                                </div>
                                                                <div>
                                                                    <ServerSelector options={attributeOption} defaultValue={{ value: 1, label: 'Train-PASS' }} onChange={handleAttributeChange} ref={attributeSelectorRef} />
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                        }



                                    </div>
                                </div>


                            </div>


                        </div>

                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShow(false)} /></div>
                                    <div><CustomButton name="view" text="Insert" width={100} height={32} onClick={handleInsertPic} /></div>
                                </div>
                            </div>
                        </div>





                    </ModalDialog>
                </Modal>

            </ThemeProvider >
            <Utility ref={utilityRef} />
        </>
    );
});

export default AddPicDialog;

