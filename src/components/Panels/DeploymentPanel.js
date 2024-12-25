import React, { useEffect, forwardRef, useImperativeHandle, useState, useRef, useMemo } from 'react';

import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, take, slice, uniqBy, set, countBy } from 'lodash-es';



import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListDivider from '@mui/joy/ListDivider';

import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepIndicator from '@mui/joy/StepIndicator';

import { v4 as uuidv4 } from 'uuid';



import Stack from '@mui/joy/Stack';



import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';

import CustomButton from '../Buttons/CustomButton';
import SwitchButton from '../Buttons/SwitchButton';
import JoyCheckBox from '../CheckBoxs/JoyCheckBox';

import ModelUploadList from '../Lists/ModelUploadList';

import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import Checkbox, { checkboxClasses } from '@mui/joy/Checkbox';
import { includes } from 'lodash-es';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

import CustomInput from '../Inputs/CustomInput';


import Utility from '../../utils/Utility';


import RedIcon from '../../image/Red_icon.png';
import GreenIcon from '../../image/Green_icon.png';

import LightGreenIcon from '../../image/Light_Green.png';
import LightRedIcon from '../../image/Light_Red.png';
import LightGrayIcon from '../../image/Light_Gray.png';

const DeploymentPanel = forwardRef((props, ref) => {


    const [openMenu, setOpenMenu] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(1);
    const [currentFileName, setCurrentFileName] = React.useState('');
    const [currentFile, setCurrentFile] = React.useState(null);
    const [uploadProgress, setUploadProgress] = useState('');
    const [serverList, setServerList] = React.useState([]);
   


    const step1Ref = React.useRef(null);
    const step2Ref = React.useRef(null);
    const step3Ref = React.useRef(null);

    const selectFileRef = useRef(null);
    const inputFileNameRef = useRef(null);
    const utilityRef = useRef(null);

    const handleReset = () => {
        console.log('handle reset');
        setCurrentFileName('');
        setCurrentFile(null);
        setUploadProgress('');
        setCurrentStep(1);
        setServerList(serverList.map((server) => {
            server.checked = false;
            return server;
        }));

    }

    useImperativeHandle(ref, () => ({

        setToggle: () => {
            setOpenMenu(!openMenu);
            handleReset();
        },

    }));

    const goStep = (step) => {

        setCurrentStep(step);
    }

    const handleItemChecked = (index) => {
        console.log('handle item checked')
        let myServerList = cloneDeep(serverList);
        myServerList[index].checked = !myServerList[index].checked;
        setServerList(myServerList);


        console.log('serverList', filter(myServerList, { checked: true }).length);
    };



    const [checked, setChecked] = React.useState([true, false]);


    const refsById = useMemo(() => {
        const refs = {}
        serverList.forEach((item) => {
            console.log('----------------')
            console.log(item.uuid);
            if (!refs[item.uuid]) {
                refs[item.uuid] = React.createRef(null)
            }
            //refs[item.id] = React.createRef(null)
        })
        return refs
    }, [serverList])

    const handleFileChange = (e) => {

        console.log('file change')
        console.log(e.target.files[0].name)

        if (e.target.files) {

            const fileName = e.target.files[0].name;

            const fileExtension = fileName.toString().split('.').pop().toLowerCase();

            const supportType = ['zip'];

            if (includes(supportType, fileExtension)) {

                setCurrentFileName(fileName);
                setCurrentFile(e.target.files[0]);

            }
            else {
                e.target.files = null;
                utilityRef.current?.showMessage(`File type not support! Support Type : [${supportType.join(', ')}]`);
            }
        }

    }

    const handleUpload = () => {


        if (currentFile) {

            filter(serverList, { checked: true }).map(async (server, index) => {

                console.log('server', server.ip, server.port, server.uuid);

                console.log(currentFile);

                refsById[server.uuid].current.setUpload(currentFileName, currentFile);

            });

        } else {
            utilityRef.current?.showMessage('Please select file!');
        }



    }

    const handleUpdateStatus = (myUuid, myProgress, myProgressText) => {
        console.log('update status');
        console.log(myUuid, myProgress, myProgressText);

        refsById[myUuid].current?.setProgress(myProgress, myProgressText);

    }


    const children = (
        <div key='gutter1' style={{ height: 280, overflowY: 'scroll', overflowX: 'hidden', border: '1px solid #636B7433', borderRadius: 10 }}>

            <List
                sx={{
                    '--ListItem-gap': '0.75rem',
                    [`& .${checkboxClasses.root}`]: {
                        mr: 'auto',
                        flexGrow: 1,
                        alignItems: 'center',
                        flexDirection: 'row-reverse',

                        minWidth: 240,
                    },
                    borderRadius: 'md',
                }}
            >
                {
                    (serverList) &&
                    filter(serverList, { online: true }).map((server, index) => {
                        return (
                            <div key={'server_list_' + index}>

                                <ListItem onClick={() => handleItemChecked(index)}>
                                    <ListItemDecorator>
                                        {
                                            (server.online === true) ? <img src={LightGreenIcon} width={20} height={20} /> :
                                                (server.online === false) ? <img src={LightRedIcon} width={20} height={20} />
                                                    : <img src={LightGrayIcon} width={20} height={20} />

                                        }

                                    </ListItemDecorator>
                                    <Checkbox key={'checkbox_' + index} checked={server.checked} onChange={() => handleItemChecked(index)} overlay={true}
                                        label={
                                            <React.Fragment>
                                                {server.name}
                                                <Typography
                                                    aria-hidden="true"
                                                    sx={{ display: 'block', fontSize: 'sm', color: 'neutral.500' }}
                                                >
                                                    <code inset='gutter'>  {server.ip}:{server.port}</code>
                                                </Typography>


                                            </React.Fragment>
                                        } />
                                </ListItem>
                                <ListDivider inset='gutter' />
                            </div>
                        );
                    })
                }
            </List>
        </div>
    );

    const childrenChecked = (
        <div key='gutter2' style={{ height: 280, overflowY: 'scroll', border: '1px solid #636B7433', borderRadius: 10 }}>
            <List
                sx={{
                    '--ListItem-gap': '0.75rem',
                    [`& .${checkboxClasses.root}`]: {
                        mr: 'auto',
                        flexGrow: 1,
                        alignItems: 'center',
                        flexDirection: 'row-reverse',

                        minWidth: 240,
                    },
                    borderRadius: 'md',
                }}
            >

                {
                    filter(serverList, { checked: true }).map((server, index) => {
                        return (
                            <div key={'server_checked_list_' + index}>
                                <ModelUploadList server={server} uuid={server.uuid} ref={refsById[server.uuid]}
                                    updateStatus={handleUpdateStatus}
                                    showMessage={utilityRef.current?.showMessage}
                                    showErrorMessage={utilityRef.current?.showErrorMessage}
                                />
                            </div>
                        );
                    })
                }
            </List>
        </div>
    );

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

    // useEffect(() => {
    //     let myList = JSON.parse(localStorage.getItem('serverList'));
    //     if (!myList) {
    //         return;
    //     }
    //     myList.map((server) => {
    //         server.checked = false;
    //         server.id=uuidv4();
    //     });
    //     if (myList) {
    //         setServerList(myList);
    //     }
    // }, [localStorage.getItem('serverList')]);


    useEffect(() => {

        console.log('serverList', props.serverList);

        const oldServerList = serverList;
        const newServerList = props.serverList;

        if (newServerList.length > 0) {
            let flag=false;
            newServerList.map((server) => {
                server.checked = false;
                const myIndex=findIndex(oldServerList, { ip: server.ip });
                if (myIndex >= 0) {
                    flag=true;
                    server.checked = oldServerList[myIndex].checked;
                    server.uuid=oldServerList[myIndex].uuid;
                } else {
                    server.checked=false; 
                    server.uuid=uuidv4();
                }
            });
            if (!flag)  setServerList(newServerList);

        }

        console.log('----------------------')
        console.log(newServerList)


       

    }, [props.serverList]);


    // const refsById = useMemo(() => {
    //     const refs = {}
    //     serverList.forEach((item) => {
    //         refs[item.id] = React.createRef(null)
    //     })
    //     return refs
    // }, [serverList])

    // useEffect(() => {

    //     console.log('serverList', props.serverList);

       
    //     const newServerList = props.serverList;

    //     if (newServerList.length > 0) {
    //         newServerList.map((server) => {
    //             server.checked = false;
    //             server.id=uuidv4();
    //         });

    //     }

    //     console.log('----------------------')
    //     console.log(newServerList)


    //     setServerList(newServerList);

    // }, [props.serverList]);







    return (
        <>
            <Utility ref={utilityRef} />
            <ThemeProvider theme={theme}>
                <Modal open={openMenu}>
                    <ModalDialog style={{ width: 800, height: 600, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2'>
                                    <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Deploy model to server</h4>
                                        <input type="file" name="files" ref={selectFileRef} style={{ visibility: 'hidden', height: 0 }} accept=".zip" onChange={handleFileChange} />
                                    </div>
                                </div>

                                <div className='row mt-4'>
                                    <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                        <Stepper sx={{ width: '100%' }}>
                                            <Step
                                                orientation="vertical"
                                                indicator={
                                                    <StepIndicator variant={(currentStep === 1) ? "solid" : "outlined"} color="neutral" ref={step1Ref}>
                                                        1
                                                    </StepIndicator>
                                                }
                                                onClick={() => goStep(1)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Select upload file.
                                            </Step>
                                            <Step
                                                orientation="vertical"
                                                indicator={<StepIndicator variant={(currentStep === 2) ? "solid" : "outlined"} ref={step2Ref}>2</StepIndicator>}
                                                onClick={() => goStep(2)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Select upload servers.
                                            </Step>
                                            <Step
                                                orientation="vertical"
                                                indicator={<StepIndicator variant={(currentStep === 3) ? "solid" : "outlined"} ref={step3Ref}>3</StepIndicator>}
                                                onClick={() => goStep(3)}
                                                style={{ cursor: 'pointer' }}
                                            >Try upload.</Step>
                                        </Stepper>
                                    </div>
                                </div>


                                <div className='row mt-4'>
                                    <div className='col-12 d-flex justify-content-between' >
                                        <Tabs aria-label="Basic tabs" defaultValue={currentStep} value={currentStep} style={{ width: '100%' }}>

                                            <TabPanel value={1} sx={{ padding: 0 }}>

                                                <div className='my-input-title'>
                                                    Select upload file

                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <CustomInput defaultValue={currentFileName} width="100%" height={48} onChange={() => { }} disabled={true} ref={inputFileNameRef}></CustomInput>

                                                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                        <CustomButton name="view" text="Select" width={100} height={32} onClick={() => selectFileRef.current?.click()} />

                                                    </div>

                                                </div>

                                            </TabPanel>
                                            <TabPanel value={2} sx={{ padding: 0 }}>
                                                <div className='d-flex justify-content-between' style={{ paddingRight: 15 }}>
                                                    <div className='my-input-title'>
                                                        Select upload server
                                                    </div>

                                                    <JoyCheckBox
                                                        label="All"
                                                        checked={true}
                                                        indeterminate={false}
                                                        data={serverList}
                                                        onChange={setServerList}
                                                        onlyBox={true}
                                                        width={30}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <div>

                                                        {children}
                                                    </div>

                                                </div>
                                            </TabPanel>
                                            <TabPanel value={3} sx={{ padding: 0 }}>
                                                <div className='d-flex justify-content-between align-items-center p-0' style={{ paddingRight: 15 }}>
                                                    <div className='my-input-title d-flex align-items-center'>
                                                        Try upload
                                                    </div>

                                                    <CustomButton name="view" text="Upload" width={100} height={32} onClick={handleUpload} />
                                                </div>
                                                <div style={{ position: 'relative', marginTop: 10 }}>

                                                    {
                                                        (!currentFile) &&
                                                        <div className='d-flex flex-row gap-3 mt-3 align-items-center justify-content-center' style={{ height: 80, cursor: 'pointer' }} onClick={() => setCurrentStep(1)}>
                                                            <ErrorIcon style={{ color: 'red' }} sx={{ fontSize: 30 }} /><div style={{ color: 'red', fontSize: 20 }}>Please select file from Step 1</div>
                                                        </div>

                                                    }
                                                    {
                                                        (filter(serverList, { checked: true }).length <= 0) &&
                                                        <div className='d-flex flex-row gap-3 mt-2 align-items-center justify-content-center' style={{ height: 80, cursor: 'pointer' }} onClick={() => setCurrentStep(2)}>
                                                            <ErrorIcon style={{ color: 'red' }} sx={{ fontSize: 30 }} /><div style={{ color: 'red', fontSize: 20 }}>Please select server from Step 2</div>
                                                        </div>
                                                    }
                                                    {
                                                        ((currentFile) && (filter(serverList, { checked: true }).length > 0)) &&
                                                        <div style={{ position: 'relative' }}>
                                                            <div className='mt-2'>
                                                                {childrenChecked}
                                                            </div>

                                                        </div>

                                                    }


                                                </div>
                                            </TabPanel>
                                        </Tabs>
                                    </div>
                                </div>










                            </div>
                        </div>


                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    {
                                        (currentStep > 1) ?
                                            <div><CustomButton name="view" text="Prev" width={100} height={32} onClick={() => setCurrentStep(currentStep - 1)} /></div>
                                            :
                                            <></>
                                    }

                                    {
                                        (currentStep < 3) ?
                                            <div><CustomButton name="view" text="Next" width={100} height={32} onClick={() => setCurrentStep(currentStep + 1)} /></div>
                                            :
                                            <></>
                                    }


                                    <div style={{ marginRight: 12 }}><CustomButton name="view" text="Close" width={100} height={32} onClick={() => setOpenMenu(false)} /></div>
                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>
            </ThemeProvider >

        </>
    );
});

export default DeploymentPanel;