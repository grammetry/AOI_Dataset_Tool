
import { useEffect, useState, useRef,createRef,useMemo } from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';
import Input from '@mui/joy/Input';
import { isIP, isIPv4 } from 'is-ip';
import { v4 as uuidv4 } from 'uuid';

import { inferHealthAPI,inferHeartBeatAPI } from '../APIPath';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';
import ServerSignal from '../components/Lights/ServerSignal';

import DeploymentPanel from '../components/Panels/DeploymentPanel';


import RedIcon from '../image/Red_icon.png';
import GreenIcon from '../image/Green_icon.png';
import LightGreenIcon from '../image/Light_Green.png';
import LightRedIcon from '../image/Light_Red.png';
import LightGrayIcon from '../image/Light_Gray.png';

import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, set } from 'lodash-es';
import CustomInput from '../components/Inputs/CustomInput';

import CustomLight from '../components/Lights/CustomLight';

const ServerPage = (props) => {

    const theme = extendTheme({
        components: {
            JoyModalDialog: {
                defaultProps: { layout: 'center' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.layout === 'center' && {
                            // width: '400px',
                            // height: '300px',
                            // backgroundColor: 'white',
                            // borderRadius: '12px',
                            // border: '1px solid #E0E1E6',
                            // boxShadow: '0px 0px 4px #CACBD733',
                            // padding: '40px',
                            // fontFamily: 'Roboto',
                            padding: '40px'
                        }),
                    }),
                },
            },
        },
    });

    const { setPageKey, projectData, setCurrentProject } = props;
    const [noTask, setNoTask] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(-1);

    const currentTableColumnWidth = ['8%', '8%', '20%', '14%', '12%', '38%'];
    const [table1HeaderNoShadow, setTable1HeaderNoShadow] = useState(true);

    const [serverList, setServerList] = useState([]);

    const serverNameRef = useRef(null);
    const serverIpRef = useRef(null);
    const serverPortRef = useRef(null);
    const editPanelRef = useRef(null);
    const DeploymentPanelRef = useRef(null);

    const isFloat = (n) => {
        const er = /^[-+]?[0-9]+\.[0-9]+$/;
        return er.test(n);
    }

    const isInteger = (n) => {
        var er = /^-?[0-9]+$/;
        return er.test(n);
    }

    const refsById = useMemo(() => {
        const refs = {}

        console.log('create refs-----------------------')
        serverList.forEach((item) => {
            console.log(item.id)
            refs[item.id] = createRef(null)
        })
        return refs
    }, [serverList])

    const updateServerStatus_xx = (list) => {

        console.log('update Server Status')

        let myServerList = cloneDeep(serverList);

        console.log(myServerList.length)
        console.log(list.length)

        myServerList.map(async (item, i) => {

            let myOnline = false;
            try {

                let myUrl=inferHealthAPI;
                if (process.env.REACT_APP_API_URL!==''){
                    // dev mode
                    myUrl=`http://${item.ip}:${item.port}${inferHealthAPI}`;
                }else{
                    // production mode
                    myUrl=`http://${window.location.host}${inferHealthAPI}`;
                }

                const response = await fetch(`${myUrl}`, {
                    method: 'GET',
                    headers: {
                        'X-IP-Host': `${item.ip}:${item.port}`,
                    },
                    timeout: 500
                })

                if (response.status === 200) {
                    myOnline = true;
                }
               

            } catch (error) {
              
                myOnline = false;
            }finally{
                console.log('finally')
                console.log(`${item.ip}:${item.port}`, myOnline)
                console.log(refsById[item.id])
                console.log(refsById)
                //myServerList[i].online = myOnline;  
                if (refsById[item.id]){
                    if (refsById[item.id].current){
                        refsById[item.id].current.src=myOnline?GreenIcon:RedIcon;

                    }
                }
                //refsById[`${item.ip}:${item.port}`].current.src=myOnline?GreenIcon:RedIcon;
            }


            // console.log(item.ip,item.port, myOnline)
            // myServerList[i].online = myOnline;

        });

        //return myServerList;
        //setServerList(myServerList);

    };

    const updateServerStatus = () => {

        console.log('update Server Status')

        setServerList(prev => {

            let myServerList = cloneDeep(prev);

            console.log('my server list')
            console.log(myServerList)

            myServerList.map(async (item, i) => {

                let myOnline = false;
                try {

                    let myUrl=inferHealthAPI;
                    if (process.env.REACT_APP_API_URL!==''){
                        // dev mode
                        myUrl=`http://${item.ip}:${item.port}${inferHealthAPI}`;
                    }else{
                        // production mode
                        myUrl=`http://${window.location.host}${inferHealthAPI}`;
                    }

                    console.log('myUrl')
                    console.log(myUrl)


                    const response = await fetch(`${myUrl}`, {
                        method: 'GET',
                        headers: {
                            'X-IP-Host': `${item.ip}:${item.port}`,
                        },
                        //signal: AbortSignal.timeout(3000)
                    })

                    console.log('response')
                    console.log(response)


                    if (response.status === 200) {
                        myOnline = true;
                    }

                    // console.log(item.ip,item.port, myOnline)
                    // myServerList[i].online = myOnline;
                   

                } catch (error) {
                    if (error.name === "TimeoutError") {
                        console.log('5000 ms timeout');
                    }


                    // console.log(error);
                    // console.log(item.ip,item.port, myOnline)
                    // myServerList[i].online = myOnline;
                }finally{
                    console.log('finally')
                    console.log(`${item.ip}:${item.port}`, myOnline)
                    console.log(refsById[item.id])
                    console.log(refsById)
                    //myServerList[i].online = myOnline;  
                    if (refsById[item.id]){
                        if (refsById[item.id].current){
                            refsById[item.id].current.src=myOnline?GreenIcon:RedIcon;

                        }
                    }
                    //refsById[`${item.ip}:${item.port}`].current.src=myOnline?GreenIcon:RedIcon;
                }

                

            });

            return myServerList;

        });

    }


    const handleDeleteItem = (index) => {

        setShowConfirm(false);
        const newServerList = serverList.filter((item, i) => i !== index);
        setServerList(newServerList);
        setCurrentEditIndex(-1);

    };

    const handleEditItem = (index) => {

        setCurrentEditIndex(index);
        setShowEdit(true);

    };

    const handleTransferGrafana = (index) => {

        const myUrl = `http://${serverList[index].ip}:3000`;
        window.open(myUrl, '_blank');


    };

    const handleTransferInference = (index) => {

        console.log('handleTransferInference', index);
        localStorage.setItem('currentServer', serverList[index].ip + ":" + serverList[index].port);
        setPageKey('InferPage');

    };

    const handleAddItem = () => {

        setCurrentEditIndex(-1);
        setShowEdit(true);

    };

    const handleTest = async () => {
        console.log('handleTest');

        console.log(inferHeartBeatAPI);

        //const response = await fetch('/inmffr/inferBackend/api/v1/allSuportPanel',


        const response = await fetch('abc',
            {
                method: 'GET',
                headers: {
                    'X-IP-Host': `172.16.92.129:81`,
                }
            }
        );

        console.log(response);

        const myJson = await response.json();

        console.log(myJson);

    }

    const handleDeploy = () => {

        if (serverList.length === 0) {
            utilityRef.current.showMessage('Please add server first.');
            return;
        }

        DeploymentPanelRef.current.setToggle();
    }

    const handleSaveItem = () => {

        //setCurrentEditIndex(-1);

        let myPass = true;

        if (serverNameRef.current.getInputValue() === '') {
            serverNameRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please input server name.');
            myPass = false;
        }

        if (serverIpRef.current.getInputValue() === '') {
            serverIpRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please input server IP.');
            myPass = false;;
        }

        if (!isIP(serverIpRef.current.getInputValue())) {
            serverIpRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please input valid IP address.');
            myPass = false;
        }

        if (serverPortRef.current.getInputValue() === '') {
            serverPortRef.current.setWarnning(true);
            utilityRef.current.showMessage('Please input server Port.');
            myPass = false;;
        }

        if (!isInteger(serverPortRef.current.getInputValue())) {
            serverPortRef.current.setWarnning(true);
            utilityRef.current.showMessage('Server port is not a integer!');
            myPass = false;;
        }

        if (parseInt(serverPortRef.current.getInputValue()) < 0 || parseInt(serverPortRef.current.getInputValue()) > 65535) {
            serverPortRef.current.setWarnning(true);
            utilityRef.current.showMessage('Server port range is 0 to 65535!');
            myPass = false;;
        }

        if (!myPass) return;


        if (currentEditIndex >= 0) {
            const newServerList = serverList.map((item, i) => {
                if (i === currentEditIndex) {
                    return { name: serverNameRef.current.getInputValue(), ip: serverIpRef.current.getInputValue(), port: serverPortRef.current.getInputValue(), online: null };
                } else {
                    return item;
                }
            });

            console.log(newServerList);
            setServerList(newServerList);
        } else {
            const newServerList = serverList.concat({ name: serverNameRef.current.getInputValue(), ip: serverIpRef.current.getInputValue(), port: serverPortRef.current.getInputValue(), online: null });
            setServerList(newServerList);

        }

        setCurrentEditIndex(-1);
        setShowEdit(false);

    };

    const utilityRef = useRef(null);

    useEffect(() => {

        if (serverList.length > 0) {
            setNoTask(false);
            //updateServerStatus();
        }
        //updateServerStatus();


    }, [serverList]);


    useEffect(() => {
        let myList = JSON.parse(localStorage.getItem('serverList'));
        if (myList) {

            myList.map((item, i) => {
                item.online = null;
                item.id=uuidv4();
            });
            setServerList(myList);
            
        }


        updateServerStatus(myList);
        

        const interval = setInterval(async () => {
            updateServerStatus(serverList);
        }, 5000);



        return () => clearInterval(interval);

    }, []);

    useEffect(() => {
        localStorage.setItem('serverList', JSON.stringify(serverList));
    }, [serverList]);




    return (
        <>

            <ThemeProvider theme={theme}>

                <Modal open={showEdit}>
                    <ModalDialog style={{ width: 600, height: 500, backgroundColor: '#ffffff' }} layout='center'>
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
                                            Server Name
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

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title'>
                                            Server Port
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <CustomInput defaultValue={(currentEditIndex >= 0) ? serverList[currentEditIndex].port : `81`} width="100%" height="48" onChange={() => { }} disabled={false} ref={serverPortRef}></CustomInput>
                                        </div>
                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShowEdit(false)} /></div>
                                    {/* <div><CustomButton name="view" text="Test" width={100} height={32} onClick={() => { }} /></div> */}
                                    <div><CustomButton name="view" text="Save" width={100} height={32} onClick={handleSaveItem} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Delete Confirm</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Are you sure to delete the item {currentEditIndex + 1}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={() => handleDeleteItem(currentEditIndex)} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <DeploymentPanel ref={DeploymentPanelRef} serverList={serverList} />

                <div className="container">
                    <div className="title-container">
                        <div className="title-style">All Devices</div>
                        <div className="d-flex flex-row gap-2">
                            {/* <CustomButton name='view' text='Test' width={100} onClick={handleTest} /> */}
                            <CustomButton name='view' text='Deploy' width={100} onClick={handleDeploy} />
                            <CustomButton name='view' text='Add' width={100} onClick={() => handleEditItem(-1)} />
                        </div>
                    </div>
                    <div className="train-page-content">
                        {
                            noTask ?
                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                    <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No server list.</div>
                                    <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please add server from right upper icon.</div>

                                </div>
                                :
                                <>
                                    <div className='my-table mt-3' style={{ width: '100%', height: 662 }}>
                                        <div className={(table1HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>

                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[0] }}>Status</div>
                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[1] }}>Order</div>
                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[2] }}>Name</div>
                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[3] }}>IP</div>
                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[4] }}>Port</div>
                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[5] }}></div>

                                        </div>
                                        <div className='my-tbody' onScroll={(e) => {
                                            if (e.target.scrollTop === 0) {
                                                //console.log('滾動在頂部');
                                                setTable1HeaderNoShadow(true);
                                            } else {
                                                //console.log('滾動不在頂部');
                                                setTable1HeaderNoShadow(false);
                                            }

                                        }}>

                                            {
                                                serverList.map((item, i) => (

                                                    <div key={`serverList_${i}`} >

                                                        <div className={(i === (serverList.length - 1)) ? `my-tbody-row-${(i % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(i % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid} onClick={() => console.log('click')}>

                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[0], paddingLeft: 25 }} >
                                                               
                                                               <div ref={refsById[item.id]} >
                                                                <img src={LightGrayIcon} width={20} height={20} />
                                                                </div>
                                                               
                                                            </div>
                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[1] }} >{i + 1}</div>
                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[2] }}>{item.name}</div>
                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[3], fontWeight: 300 }}>{item.ip}</div>
                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[4], fontWeight: 300 }}>{item.port}</div>
                                                            <div className='my-tbody-td d-flex flex-row gap-2 mr-2' style={{ width: currentTableColumnWidth[5] }}>
                                                                <CustomButton name='general' text='Edit' width={100} onClick={() => handleEditItem(i)} />
                                                                <CustomButton name='general' text='Delete' width={100} onClick={() => { setCurrentEditIndex(i); setShowConfirm(true) }} />
                                                                <CustomButton name='general' text='Task' width={100} onClick={() => handleTransferInference(i)} />
                                                                <CustomButton name='general' text='Grafana' width={100} onClick={() => handleTransferGrafana(i)} />
                                                            </div>

                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </>
                        }


                    </div>
                </div>

            </ThemeProvider >
            <Utility ref={utilityRef} />

        </>
    );
}

export default ServerPage;