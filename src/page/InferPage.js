
import { useEffect, useState, useRef } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import StorageIcon from '@mui/icons-material/Storage';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { inferTaskAPI, inferInfoAPI, inferInferenceAPI, inferAllSupportPanelAPI, inferTaskStartAPI, inferLogAPI, inferHealthAPI } from '../APIPath';
import { taoMachineAPI } from '../APIPath';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import CustomInput from '../components/Inputs/CustomInput';
import ExtendButton from '../components/Buttons/ExtendButton';
import CustomMenuButton from '../components/Buttons/CustomMenuButton';
import PanelSelector from '../components/Dropdowns/PanelSelector';
import CustomWebSocket from '../components/WebSockets/CustomWebSocket';
import InfoTag from '../components/Tags/InfoTag';
import CompList from '../components/Lists/CompList';
import CustomTooltip from '../components/Tooltips/CustomTooltip';

import CustomDatePicker from '../components/DatePickers/CustomDatePicker';


import TaskCard from '../components/Cards/TaskCard';
import ModelCard from '../components/Cards/ModelCard';

import ServerSelector from '../components/Dropdowns/ServerSelector';

import WebSocketUtility from '../components/WebSocketUtility.js';

import CustomLight from '../components/Lights/CustomLight.js';

import Stack from '@mui/joy/Stack';
import LinearProgress from '@mui/joy/LinearProgress';
import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, set, get } from 'lodash-es';

import LightGreenIcon from '../image/Light_Green.png';
import LightRedIcon from '../image/Light_Red.png';
import LightGrayIcon from '../image/Light_Gray.png';
import { on } from 'events';



const InferPage = (props) => {

    const { setPageKey, projectData, setCurrentProject } = props;

    const [serverOption, setServerOption] = useState([]);
    const [serverList, setServerList] = useState([]);
    const [currentServer, setCurrentServer] = useState('');
    const [currentTab, setCurrentTab] = useState('Task');
    const [taskList, setTaskList] = useState([]);
    const [modelList, setModelList] = useState([]);
    const [panelOption, setPanelOption] = useState([]);
    const [modelOption, setModelOption] = useState([]);
    const [logTypeOption, setLogTypeOption] = useState([{ value: 0, label: 'Clear Dog' }, { value: 1, label: 'Tri Client' }, { value: 2, label: 'Error' }, { value: 3, label: 'Watch Dog' }, { value: 4, label: 'Xml Result' }]);
    const [modelData, setModelData] = useState([]);
    const [inferPanel, setInferPanel] = useState([]);
    const [selectedPanel, setSelectedPanel] = useState('');
    const [selectedModel, setSelectedModel] = useState('');


    const [queryList, setQueryList] = useState([]);
    const currentTableColumnWidth = ['5%', '15%', '10%', '10%', '60%'];
    const xmlTableColumnWidth = ['5%', '15%', '14%', '6%', '50%', '10%'];
    const [table1HeaderNoShadow, setTable1HeaderNoShadow] = useState(true);


    const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));

    const [showEdit, setShowEdit] = useState(false);
    const [showXmlDetail, setShowXmlDetail] = useState(false);
    const [currentEditTaskIndex, setCurrentEditTaskIndex] = useState(-1);
    const [currentEditTaskUuid, setCurrentEditTaskUuid] = useState('');
    const [currentEditModelUuid, setCurrentEditModelUuid] = useState('');
    const [currentEditModelName, setCurrentEditModelName] = useState('');
    const [currentBoardSn, setCurrentBoardSn] = useState('');
    const [currentXmlDetail, setCurrentXmlDetail] = useState({});
    const [logType, setLogType] = useState(0);

    const [showTaskDeleteConfirm, setShowTaskDeleteConfirm] = useState(false);
    const [showModelDeleteConfirm, setShowModelDeleteConfirm] = useState(false);

    const [fromOpen, setFromOpen] = useState(false);
    const [toOpen, setToOpen] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(false);

    const utilityRef = useRef(null);
    const serverSelectorRef = useRef(null);
    const panelSelectorRef = useRef(null);
    const modelSelectorRef = useRef(null);

    const statusHotDatabaseRef = useRef(null);
    const statusColdDatabaseRef = useRef(null);
    const statusClearDogRef = useRef(null);
    const statusWatchDogRef = useRef(null);
    const logTypeSelectorRef = useRef(null);

    const fromDateRef = useRef(null);
    const toDateRef = useRef(null);

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

    const handleServerChange = async (item) => {
        console.log('item', item);
        setTaskList([]);
        setModelList([]);
        setQueryList([]);
        const myServer = filter(serverList, { id: item.value });
        const myServerText = `${myServer[0].ip}:${myServer[0].port}`;

        console.log('myServerText', myServerText);
        console.log('myServer', myServer[0])


        setCurrentServer(myServerText);

        getOnlineStatus(myServerText);
        //setOnlineStatus(online);


        getTaskList(myServerText);
        getModelList(myServerText);
        resetAllStatusLight();



    }

    const handleTabClick = () => {
        if (currentTab === 'Task') {
            setCurrentTab('Model');
        } else {
            setCurrentTab('Task');
        }
    }

    const handleMenuClick = (myItem) => {

        setCurrentTab(myItem);

    }

    const getOnlineStatus_xx = async (myServerText) => {
        setOnlineStatus(true);
    }

    const getOnlineStatus = async (myServerText) => {

        utilityRef.current.setLoading(true);

        if (myServerText === '') {
            return false;
        }

        let myOnline = false;
        try {

            let myUrl = "";
            let myOption = {};
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${myServerText}${inferHealthAPI}`;
                myOption = {
                    method: 'GET',
                    signal: AbortSignal.timeout(3000)
                }
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferHealthAPI}`;
                myOption = {
                    method: 'GET',
                    headers: {
                        'X-IP-Host': myServerText,
                    },
                }
            }

            console.log('my option', myOption);
            const response = await fetch(`${myUrl}`, myOption)

            if (response.status === 200) {
                myOnline = true;
            }

        } catch (error) {

        } finally {

            //return myOnline;
            setOnlineStatus(myOnline);
            if (myOnline) {

                // console.log('currentServer', currentServer);    
                getTaskList(myServerText);
                getModelList(myServerText);
            }
        }

        utilityRef.current.setLoading(false);


    }

    const handleCheckTasks = () => {
        console.log('--- handle Check Tasks ---')

        let myPass=true;
        taskList.forEach(element => {
            console.log(element.status)
            if ((element.status === 'preparing')||(element.status==='stopping')) {
                myPass=false;
            }
        });
        return myPass;
    }

    const getTaskList = async (myServerText) => {

        console.log('--- get task list ---')

        if (myServerText === '') return;

        try {

            let myUrl = '';
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${myServerText}${inferTaskAPI}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferTaskAPI}`;
            }

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${myServerText}`,
                },
            });


            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            let myData = cloneDeep(resJson);

            console.log('---- fetch task list ----')
            console.log(myData);

            myData.forEach(element => {
                element.updateStatus = {};
            });
            setTaskList(myData);

        } catch (error) {
            console.log(error)
            // if (error.message)
            //     utilityRef.current.showMessage(error.message);

        }

    }

    const getModelList = async (myServerText) => {

        if (myServerText === '') return;

        try {

            let myUrl = inferInfoAPI;
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${myServerText}${inferInfoAPI}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferInfoAPI}`;
            }

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${myServerText}`,
                },
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            setModelList(resJson);

        } catch (error) {
            console.log(error)
            // if (error.message)
            //     utilityRef.current.showMessage(error.message);
        }


    }

    const getPanelList = async (myServerText) => {

        if (myServerText === '') return;


        try {

            let myUrl = inferAllSupportPanelAPI;
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${myServerText}${inferAllSupportPanelAPI}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferAllSupportPanelAPI}`;
            }

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${myServerText}`,
                }
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            let myOptionList = [];
            resJson.map((item) => {
                let myOption = {};
                myOption.value = item;
                myOption.label = item;
                myOptionList.push(myOption);
            });


            console.log('myOptionList', myOptionList);
            setPanelOption(myOptionList);

        } catch (error) {
            console.log(error)
            // if (error.message)
            //     utilityRef.current.showMessage(error.message);
        }

    }

    const getTaskModelList = async (mySelectedPanel) => {

        if (mySelectedPanel === '') {
            return;
        }

        try {

            if (currentServer === '') {
                utilityRef.current.showMessage('Please select server first.');
                return;
            }

            let myUrl = '';

            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${currentServer}${inferInfoAPI}?inference_model_panel=${mySelectedPanel}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferInfoAPI}?inference_model_panel=${mySelectedPanel}`;
            }

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${currentServer}`,
                }
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            let myOptionList = [];
            resJson.map((item) => {
                let myOption = {};
                myOption.value = item.inference_model_uuid;
                myOption.label = item.inference_model_name;
                myOptionList.push(myOption);
            });

            setModelData(resJson);
            setModelOption(myOptionList);
        } catch (error) {
            console.log(error)
            // if (error.message)
            //     utilityRef.current.showMessage(error.message);

        }


    }

    const getDelayTime_1 = (myCreateTime, myDetailData) => {




        const myIndex1 = myDetailData.indexOf('generated at');
        if (myIndex1 >= 0) {

            const myTime1 = Math.round(myCreateTime * 100) / 100;
            const myTime2 = (moment(myDetailData.substring(myIndex1 + 14, myIndex1 + 46)).valueOf() / 1000);

            const myDelayTime = Math.round((myTime1 - myTime2) * 100) / 100;

            return myDelayTime + 's';
        } else {
            return 'N/A';

        }

    }

    const getDelayTime_2 = (myCreateTime, myDetailData) => {


        let AoiTime = '';
        const myIndex2 = myDetailData.indexOf('/20');
        if (myIndex2 >= 0) {
            AoiTime = moment(myDetailData.substring(myIndex2 + 1, myIndex2 + 15), 'YYYYMMDDHHmmss').valueOf() / 1000;
        }
        if (AoiTime === '') return 'N/A';

        // console.log(`AoiTime: ${myDetailData.substring(myIndex2 + 1, myIndex2 + 15)}`);

        let NasTime = '';
        const myIndex1 = myDetailData.indexOf('generated at');
        if (myIndex1 >= 0) {
            //NasTime = moment(myDetailData.substring(myIndex1 + 14, myIndex1 + 33)).unix() + 28800;
            NasTime = (moment(myDetailData.substring(myIndex1 + 14, myIndex1 + 46)).valueOf() / 1000);
        }
        if (NasTime === '') return 'N/A';

        const myDelayTime = Math.round((NasTime - AoiTime) * 100) / 100;


        return myDelayTime + 's';


    }

    const getShortName = (myPath) => {

        if (myPath) {
            const myIndex = myPath.lastIndexOf('/');
            return myPath.substring(myIndex + 1);
        } else {
            return '';
        }




    }

    const getXmlDate = (myXmlDate) => {

        const myDate = moment(myXmlDate, 'YYYYMMDD').format('YYYY-MM-DD');

        return myDate;

    }

    const getMachineList = async (myCurrentServer) => {

        const response = await fetch(taoMachineAPI);
        const myList = await response.json();

        if (myList) {

            myList.map((item, i) => {
                item.online = null;
            });


        }

        let myOptionList = [];
        let theOption = null;
        myList.map((server) => {
            server.checked = false;
            server.id = uuidv4();
            let myOption = {};
            myOption.value = server.id;
            myOption.label = `${server.name} - ${server.ip}:${server.port}`;
            myOptionList.push(myOption);
            if (myCurrentServer === `${server.ip}:${server.port}`) {
                theOption = myOption;
            }
        });

        console.log('--- my  list ---')
        console.log(myList);

        if (myList.length === 0) {
            setCurrentServer('');
            setServerList([]);
            setServerOption([]);
            return;
        }

        if (myList.length > 0) {
            setServerList(myList);
            setServerOption(myOptionList);

            console.log('theOption', theOption);

            if (theOption) {
                serverSelectorRef.current.setValue(theOption);

                const myIndex = findIndex(myList, { id: theOption.value });

                console.log('myIndex', myIndex);

                if (myIndex >= 0) {
                    const theServer = myList[myIndex];
                    setCurrentServer(theServer.ip + ':' + theServer.port);
                    getOnlineStatus(theServer.ip + ':' + theServer.port);

                }


                console.log('option exist')
            } else {
                console.log('option not found')
            }
        }

    }

    const handleAddTask = () => {
        console.log('handle add task')
        if (currentServer === '') {
            utilityRef.current.showMessage('Please select server first.');
            return;

        }
        setShowEdit(true);
    }

    const handleSaveTask = async () => {
        

        let myInferPanel = {};
        inferPanel.map((item) => {
            myInferPanel[item.panel] = item.checked;
        });

        let myData = {};
        myData.inference_model_uuid = selectedModel;
        myData.inference_panel = selectedPanel;
        myData.inference_support_panel = myInferPanel;

        let myUrl = '';

        if (process.env.REACT_APP_API_URL !== '') {
            // dev mode
            myUrl = `http://${currentServer}${inferTaskAPI}`;
        } else {
            // production mode
            myUrl = `http://${window.location.host}${inferTaskAPI}`;
        }

        const res = await fetch(myUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-IP-Host': `${currentServer}`,
            },
            body: JSON.stringify(myData)
        });

        const resJson = await res.json();

        //console.log(resJson);

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        //utilityRef.current.showMessage(`Add task success`);

        let myUrl2 = '';

        if (process.env.REACT_APP_API_URL !== '') {
            // dev mode
            myUrl2 = `http://${currentServer}${inferTaskStartAPI}`;
        } else {
            // production mode
            myUrl2 = `http://${window.location.host}${inferTaskStartAPI}`;
        }


        const res2 = await fetch(myUrl2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-IP-Host': `${currentServer}`,
            },
            body: JSON.stringify({ task_uuid: resJson.task_uuid })
        });

        const res2Json = await res2.json();

        if (res2Json.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        utilityRef.current.showMessage(`Add task success`);

        setShowEdit(false);
        getTaskList(currentServer);

    }

    const handlePanelChange = (item) => {
        console.log('item', item);
        const selectedPanel = item.value;
        setSelectedPanel(selectedPanel);
        getTaskModelList(selectedPanel);
        modelSelectorRef.current.setValue(null);
        setSelectedModel('');
        setInferPanel([]);
    }

    const resetAllStatusLight = () => {
        if (statusHotDatabaseRef) {
            if (statusHotDatabaseRef.current) {
                statusHotDatabaseRef.current.src = LightGrayIcon;
            }
        }
        if (statusColdDatabaseRef) {
            if (statusColdDatabaseRef.current) {
                statusColdDatabaseRef.current.src = LightGrayIcon;
            }
        }
        if (statusClearDogRef) {
            if (statusClearDogRef.current) {
                statusClearDogRef.current.src = LightGrayIcon;
            }
        }
        if (statusWatchDogRef) {
            if (statusWatchDogRef.current) {
                statusWatchDogRef.current.src = LightGrayIcon;
            }
        }
        // statusHotDatabaseRef.current.src = LightGrayIcon;
        // statusColdDatabaseRef.current.src = LightGrayIcon;
        // statusClearDogRef.current.src = LightGrayIcon;
        // statusWatchDogRef.current.src = LightGrayIcon;
    }

    const handleModelChange = (item) => {

        const myModel = filter(modelData, { inference_model_uuid: item.value });

        const myInferPanel = myModel[0].inference_model_panel_info;

        let myOptionList = [];
        myInferPanel.map((item) => {
            let myOption = {};
            myOption.panel = item;
            myOption.checked = true;
            myOptionList.push(myOption);
        });

        setInferPanel(myOptionList);
        setSelectedModel(item.value);

    }

    const handleTaskDeleteConfirm = (myId) => {
        console.log('handleTaskDeleteConfirm', myId);
        setCurrentEditTaskUuid(myId);
        const myIndex = findIndex(taskList, { task_uuid: myId });
        setCurrentEditTaskIndex(myIndex);
        setShowTaskDeleteConfirm(true);
    }

    const handleModelDeleteConfirm = (myId) => {
        console.log('handleModelDeleteConfirm', myId);
        console.log(modelList)
        setCurrentEditModelUuid(myId);
        const myIndex = findIndex(modelList, { inference_model_uuid: myId });
        if (myIndex >= 0) {
            setCurrentEditModelName(modelList[myIndex].inference_model_name)
        }
        //console.log(modelList[myIndex].inference_model_name)
        // setCurrentEditTaskIndex(myIndex);
        setShowModelDeleteConfirm(true);
    }

    const handleTaskReset = async (myId) => {
        console.log('handleTaskReset', myId);
        try {

            let myUrl = '';

            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${currentServer}${inferTaskAPI}/reset`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferTaskAPI}/reset`;
            }

            const res = await fetch(myUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${currentServer}`,
                },
                body: JSON.stringify({ task_uuid: myId })
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            
            utilityRef.current.showMessage(`Reset model success`);
        } catch (error) {
            //console.log(error)
            if (error.message)
                utilityRef.current.showMessage(error.message);

        }
    }

    const handleModelDeleteItem = async () => {

        try {

            let myUrl = '';

            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${currentServer}${inferInferenceAPI}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}${inferInferenceAPI}`;
            }

            const res = await fetch(myUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${currentServer}`,
                },
                body: JSON.stringify({ inference_model_uuid: currentEditModelUuid })
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            getModelList(currentServer);

            setShowModelDeleteConfirm(false);

            utilityRef.current.showMessage(`Delete model success`);
        } catch (error) {
            //console.log(error)
            if (error.message)
                utilityRef.current.showMessage(error.message);

        }

    }

    const handlePanelChecked = (item) => {
        console.log('handlePanelChecked', item);
        let myInferPanel = [...inferPanel];
        const myIndex = findIndex(myInferPanel, { panel: item.panel });
        myInferPanel[myIndex].checked = !myInferPanel[myIndex].checked;
        setInferPanel(myInferPanel);
        console.log(myInferPanel)
    }

    const handleSocketMessage = (myMessage) => {

        const myData = JSON.parse(myMessage.data);

        //console.log('---- web socket message ----')
        //console.log(myData);

        if (myData.hot_database) {
            if (statusHotDatabaseRef) {
                if (statusHotDatabaseRef.current) {
                    statusHotDatabaseRef.current.src = (myData.hot_database === 'active') ?
                        LightGreenIcon : (myData.hot_database === 'inactive') ? LightRedIcon : LightGrayIcon;
                }
            }
        };

        if (myData.cold_database) {
            if (statusColdDatabaseRef) {
                if (statusColdDatabaseRef.current) {
                    statusColdDatabaseRef.current.src = (myData.hot_database === 'active') ?
                        LightGreenIcon : (myData.hot_database === 'inactive') ? LightRedIcon : LightGrayIcon;
                }
            }
        };

        if (myData.cleardog) {
            if (statusClearDogRef) {
                if (statusClearDogRef.current) {
                    statusClearDogRef.current.src = (myData.hot_database === 'active') ?
                        LightGreenIcon : (myData.hot_database === 'inactive') ? LightRedIcon : LightGrayIcon;
                }
            }
        };

        if (myData.watchdog) {
            if (statusWatchDogRef) {
                if (statusWatchDogRef.current) {
                    statusWatchDogRef.current.src = (myData.hot_database === 'active') ?
                        LightGreenIcon : (myData.hot_database === 'inactive') ? LightRedIcon : LightGrayIcon;
                }
            }
        };


       
        let myTaskList = cloneDeep(taskList);

        //console.log('myTaskList',myTaskList);

        myTaskList.forEach(element => {

            const myTaskUuid = element.task_uuid;

            //console.log('myData[myTaskUuid]', myData[myTaskUuid]);

            if (myData[myTaskUuid]) {
                element.updateStatus = myData[myTaskUuid];
                element.status = myData[myTaskUuid].status;
                element.server_container= myData[myTaskUuid].server_container;
                element.client_container= myData[myTaskUuid].client_container;
            }
        });

        setTaskList(myTaskList);
    };

    const handleTaskDeleteItem = async () => {
        console.log('handleTaskDeleteItem')

        const myTask = filter(taskList, { task_uuid: currentEditTaskUuid });

        // if (myTask.length > 0) {
        //     const myStatus = myTask[0].status;
        //     console.log('myStatus', myStatus);
        //     if ((myStatus !== 'stop') && (myStatus !== 'error')) {
        //         utilityRef.current.showMessage('Please stop the task first.');
        //         setShowTaskDeleteConfirm(false);
        //         return;
        //     }
        // }

        let myUrl = '';

        if (process.env.REACT_APP_API_URL !== '') {
            // dev mode
            myUrl = `http://${currentServer}${inferTaskAPI}`;
        } else {
            // production mode
            myUrl = `http://${window.location.host}${inferTaskAPI}`;
        }

        const res = await fetch(myUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-IP-Host': `${currentServer}`,
            },
            body: JSON.stringify({ task_uuid: currentEditTaskUuid })
        });

        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        utilityRef.current.showMessage(`Delete task success`);
        getTaskList(currentServer);
        setShowTaskDeleteConfirm(false);
    }

    const handleQuery = async () => {



        console.log('fromDate', fromDate);
        console.log('toDate', toDate);

        const startTime = moment(fromDateRef.current.getInputValue() + ' 00:00:00').unix();
        const endTime = moment(toDateRef.current.getInputValue() + ' 23:59:59').unix();

        console.log('startTime', startTime);
        console.log('endTime', endTime);


        let myUrl = '';

        if (process.env.REACT_APP_API_URL !== '') {
            // dev mode
            myUrl = `http://${currentServer}${inferLogAPI}`;
        } else {
            // production mode
            myUrl = `http://${window.location.host}${inferLogAPI}`;
        }

        switch (logTypeSelectorRef.current.getValue().value) {
            case 0:
                myUrl += `/cleardog`;
                break;
            case 1:
                myUrl += `/triclient`;
                break;
            case 2:
                myUrl += `/error`;
                break;
            case 3:
                myUrl += `/watchdog`;
                break;
            case 4:
                myUrl += `/xmlResult`;
                break;
            default:
                break;
        }

        myUrl += `?start_time=${startTime}&end_time=${endTime}&local_time=False`;

        utilityRef.current.setLoading(true);

        const res = await fetch(myUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-IP-Host': `${currentServer}`,
            },
        });


        const resJson = await res.json();

        utilityRef.current.setLoading(false);

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        console.log('--- query list ---')
        console.log(resJson)


        setQueryList(resJson);


    }

    const handleXmlDetail = (myBoardSn) => {
        console.log('myBoardSn', myBoardSn);
        setCurrentBoardSn(myBoardSn);


        const myIndex = findIndex(queryList, { board_sn: myBoardSn });

        if (myIndex >= 0) {
            setCurrentXmlDetail(queryList[myIndex]);
            setShowXmlDetail(true);
        } else {
            utilityRef.current.showMessage('No data found');
        }


    }

    const handleLogTypeChange = (item) => {

        setQueryList([]);
        setLogType(item.value);
    }

    useEffect(() => {

        console.log('currentServer', currentServer);

        if (currentServer !== '')
            getPanelList(currentServer);


    }, [currentServer]);

    useEffect(() => {

        console.log('showEdit', showEdit);
        if (showEdit) {
            setSelectedModel('');
            setSelectedPanel('');
            setInferPanel([]);

        }




    }, [showEdit]);

    useEffect(() => {

        const myCurrentServer = localStorage.getItem('currentServer');
        console.log('myCurrentServer', myCurrentServer);


        //const myList = JSON.parse(localStorage.getItem('serverList'));

        getMachineList(myCurrentServer);


    }, []);

    // useEffect(() => {
    //     const interval = setInterval(async () => {

    //         setCurrentServer((prev) => {

    //             getTaskList(prev);
    //             return prev;
    //         });

    //     }, 5000);

    //     return () => clearInterval(interval);
    // }, []);


    return (
        <>

            <ThemeProvider theme={theme}>

                <Modal open={showEdit}>
                    <ModalDialog style={{ width: 600, height: 500, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>{(currentEditTaskIndex >= 0) ? `Edit Item ${currentEditTaskIndex + 1}` : `Add New Task`}</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Select Panel
                                        </div>
                                        <div>
                                            <PanelSelector options={panelOption} onChange={handlePanelChange} className="my-panel-select" ref={panelSelectorRef} />
                                        </div>

                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title'>
                                            Server Model
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <PanelSelector options={modelOption} onChange={handleModelChange} className="my-panel-select" ref={modelSelectorRef} />

                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title'>
                                            Set infer panel
                                        </div>
                                        <div style={{ position: 'relative',height:100,overflowY:'scroll' }}>
                                            {
                                                inferPanel.map((item, index) => {
                                                    return (
                                                        <div key={index} className='d-flex flex-row gap-2 mt-1'>
                                                            <input type="checkbox" defaultChecked={item.checked} onChange={() => handlePanelChecked(item)} />
                                                            <div>{item.panel}</div>
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
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShowEdit(false)} /></div>
                                    <div><CustomButton name="view" text="Save" width={100} height={32} onClick={handleSaveTask} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showTaskDeleteConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Delete task confirm</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Are you sure to delete the task {currentEditTaskIndex + 1}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowTaskDeleteConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={handleTaskDeleteItem} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>


                <Modal open={showModelDeleteConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Delete model confirm</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Are you sure to delete the model {currentEditModelName}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowModelDeleteConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={handleModelDeleteItem} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showXmlDetail}>
                    <ModalDialog style={{ width: 600, height: 800, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Board SN.</div>
                                        <div className='my-detail-item'>{currentXmlDetail.board_sn}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Create Time</div>
                                        <div className='my-detail-item'>{moment.unix(currentXmlDetail.create_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>XML Path</div>
                                        <div className='my-detail-item'>{getShortName(currentXmlDetail.inference_xml_path)}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>XML Date</div>
                                        <div className='my-detail-item'>{getXmlDate(currentXmlDetail.date_time)}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Machine Vendor</div>
                                        <div className='my-detail-item'>{currentXmlDetail.machine_vendor}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Max Board Lane</div>
                                        <div className='my-detail-item'>{currentXmlDetail.max_board_imulti}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Panel</div>
                                        <div className='my-detail-item'>{currentXmlDetail.panel}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Process Name</div>
                                        <div className='my-detail-item'>{currentXmlDetail.process_name}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Station ID</div>
                                        <div className='my-detail-item'>{currentXmlDetail.station_id}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Status</div>
                                        <div className='my-detail-item'>{currentXmlDetail.status}</div>
                                    </div>
                                </div>






                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <div className='my-detail-title'>Components</div>
                                        <div className='my-detail-item' >{(currentXmlDetail.components) ? currentXmlDetail.components.length : ''}</div>
                                    </div>
                                </div>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex flex-column p-0' style={{ paddingRight: 21 }}>

                                        <CompList data={currentXmlDetail.components} />

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShowXmlDetail(false)} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>


                <div className="container">

                    <div className="row mt-1" style={{ height: 40 }}>
                        <div className="col-4 d-flex justify-content-start">
                            {
                                (onlineStatus) ?
                                    <>
                                        <div className="title-style">All {currentTab}s</div>
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                        <div className="col-4 d-flex justify-content-center">
                            <ServerSelector options={serverOption} onChange={handleServerChange} className="my-server-select" ref={serverSelectorRef} />
                        </div>
                        <div className="col-4 d-flex justify-content-end">
                            <div className='d-flex flex-row gap-2'>
                                {
                                    (onlineStatus) ?
                                        <>
                                            <CustomButton name="view" text="Add" onClick={handleAddTask} width={100}></CustomButton>
                                            <CustomMenuButton onChange={handleMenuClick}></CustomMenuButton>
                                        </>
                                        :
                                        <></>
                                }

                            </div>
                        </div>
                    </div>

                    {
                        (onlineStatus) ?
                            <>
                                {
                                    ((currentServer === '') || (onlineStatus === false)) ?
                                        <></>
                                        :
                                        <CustomWebSocket currentServer={currentServer} onSocketMessage={handleSocketMessage} />
                                }

                                {(currentTab === 'Task') ?
                                    <div className="row mt-4">
                                        <div className="col-3">

                                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#DC3545', position: 'relative' }}>
                                                <StorageIcon sx={{ color: '#DC3545' }} />

                                                Hot Database
                                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusHotDatabaseRef} />
                                                {/* <CustomLight color='#4FCA63' blink={false} style={{ position: 'absolute', top: 7, left: 5 }}></CustomLight> */}
                                            </div>

                                        </div>
                                        <div className="col-3">

                                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#007BFF', position: 'relative' }}>
                                                <StorageIcon sx={{ color: '#007BFF' }} />
                                                Cold Database
                                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusColdDatabaseRef} />
                                            </div>

                                        </div>
                                        <div className="col-3">

                                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#FFC107', position: 'relative' }}>
                                                <DataThresholdingIcon sx={{ color: '#FFC107' }} />
                                                Clear Dog
                                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusClearDogRef} />
                                            </div>

                                        </div>
                                        <div className="col-3">

                                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#28A745', position: 'relative' }}>
                                                <DataThresholdingIcon sx={{ color: '#28A745' }} />
                                                Watch Dog
                                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusWatchDogRef} />
                                            </div>

                                        </div>
                                    </div>
                                    : <></>
                                }


                                {
                                    currentTab === 'Task' ?
                                        <div className="infer-page-content" style={{ overflowY: 'scroll' }}>


                                            {
                                                (taskList.length === 0) ?
                                                    <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                                        <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No task.</div>
                                                        <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please add task from upper right cornor button.</div>
                                                    </div>
                                                    :
                                                    taskList.map((task, index) => {
                                                        return (
                                                            <div key={task.task_uuid}>
                                                                <TaskCard data={task} index={index}
                                                                    key={`task_${index}`}
                                                                    currentServer={currentServer}
                                                                    showMessage={utilityRef.current.showMessage}
                                                                    getTaskList={getTaskList}
                                                                    onDeleteTask={handleTaskDeleteConfirm}
                                                                    onResetTask={handleTaskReset}
                                                                    onCheckTasks={handleCheckTasks}
                                                                    taskList={taskList}
                                                                />
                                                            </div>
                                                        )
                                                    })

                                            }
                                        </div>
                                        : currentTab === 'Model' ?
                                            <div className="infer-page-content" style={{ overflowY: 'scroll' }}>

                                                {
                                                    (modelList.length === 0) ?
                                                        <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                                            <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No model.</div>
                                                            <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please upload model from server page.</div>
                                                        </div>
                                                        :
                                                        modelList.map((model, index) => {
                                                            return (
                                                                <div key={model.inference_model_uuid}>
                                                                    <ModelCard data={model} index={index}
                                                                        currentServer={currentServer}
                                                                        showMessage={utilityRef.current.showMessage}
                                                                        getModelList={getModelList}
                                                                        onDeleteModel={handleModelDeleteConfirm}
                                                                        
                                                                    />
                                                                </div>
                                                            )
                                                        })

                                                }
                                            </div>
                                            :
                                            <div>
                                                <div className='row'>
                                                    <div className='col-md-3 p-3'>
                                                        <div className='my-input-title py-1'>
                                                            Log type
                                                        </div>
                                                        <div>
                                                            <ServerSelector defaultValue={logTypeOption[0]} options={logTypeOption} onChange={handleLogTypeChange} ref={logTypeSelectorRef} />
                                                        </div>
                                                    </div>
                                                    <div className='col-md-3 p-3'>
                                                        <div className='my-input-title py-1'>
                                                            Start time
                                                        </div>
                                                        <div >
                                                            <CustomDatePicker width="100%" height={38} ref={fromDateRef}></CustomDatePicker>

                                                        </div>
                                                    </div>
                                                    <div className='col-md-3 p-3'>
                                                        <div className='my-input-title py-1'>
                                                            End time
                                                        </div>
                                                        <div>
                                                            <CustomDatePicker width="100%" height={38} ref={toDateRef}></CustomDatePicker>
                                                        </div>
                                                    </div>


                                                    <div className='col-md-3 p-3'>
                                                        <div className='my-input-title py-1'>

                                                        </div>
                                                        <div className='d-flex justify-content-end'>
                                                            <CustomButton name="view" text="Query" width={100} height={32} onClick={handleQuery}></CustomButton>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="train-page-content" style={{ paddingTop: 0, marginTop: 0 }}>
                                                    {
                                                        (queryList.length === 0) ?
                                                            <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                                                <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No query list.</div>
                                                                <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please query from right upper query icon.</div>

                                                            </div>
                                                            :
                                                            (logType !== 4) ?

                                                                <>
                                                                    <div className='my-table mt-3' style={{ width: '100%', height: 662 }}>
                                                                        <div className={(table1HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>

                                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[0] }}>Order</div>
                                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[1] }}>Create Time</div>
                                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[2] }}>Level</div>
                                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[3] }}>Type</div>
                                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[4] }}>Message</div>

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
                                                                                queryList.map((item, i) => (

                                                                                    <div key={`serverList_${i}`} >

                                                                                        <div className={(i === (serverList.length - 1)) ? `my-tbody-row-${(i % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(i % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid} onClick={() => console.log('click')}>

                                                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[0] }} >{i + 1}</div>
                                                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[1] }} >
                                                                                                <div className=' d-flex flex-column justify-content-start align-items-center p-0'>
                                                                                                    <div>{moment.unix(item.create_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                                                                    {
                                                                                                        (logType === 3) ?
                                                                                                            <>

                                                                                                                <InfoTag label="AOI" size="sm" value={getDelayTime_2(item.create_time, item.details.details_msg)} color="#E61F23" />
                                                                                                                <InfoTag label="NAS" size="sm" value={getDelayTime_1(item.create_time, item.details.details_msg)} color="#E61F23" />
                                                                                                            </>
                                                                                                            :
                                                                                                            <></>
                                                                                                    }
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[2] }}>{item.log_level}</div>
                                                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[3] }}>{item.details.details_type}</div>

                                                                                            <div className='my-tbody-td' style={{ width: currentTableColumnWidth[4], textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflowX: 'scroll' }}>

                                                                                                {item.details.details_msg}

                                                                                            </div>


                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </>
                                                                :
                                                                <>
                                                                    <div className='my-table mt-3' style={{ width: '100%', height: 662 }}>
                                                                        <div className={(table1HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>

                                                                            <div className='my-thead-th' style={{ width: xmlTableColumnWidth[0] }}>Order</div>
                                                                            <div className='my-thead-th' style={{ width: xmlTableColumnWidth[1] }}>Create Time</div>
                                                                            <div className='my-thead-th' style={{ width: xmlTableColumnWidth[2] }}>Panel</div>
                                                                            <div className='my-thead-th' style={{ width: xmlTableColumnWidth[3] }}>Status</div>
                                                                            <div className='my-thead-th' style={{ width: xmlTableColumnWidth[4] }}>Inference XML Path</div>
                                                                            <div className='my-thead-th' style={{ width: xmlTableColumnWidth[5] }}></div>

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
                                                                                queryList.map((item, i) => (

                                                                                    <div key={`serverList_${i}`} >

                                                                                        <div className={(i === (serverList.length - 1)) ? `my-tbody-row-${(i % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(i % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid} onClick={() => console.log('click')}>

                                                                                            <div className='my-tbody-td' style={{ width: xmlTableColumnWidth[0] }} >{i + 1}</div>
                                                                                            <div className='my-tbody-td' style={{ width: xmlTableColumnWidth[1] }} >{moment.unix(item.create_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                                                            <div className='my-tbody-td' style={{ width: xmlTableColumnWidth[2] }}>{item.panel}</div>
                                                                                            <div className='my-tbody-td' style={{ width: xmlTableColumnWidth[3] }}>{item.status}</div>
                                                                                            <div className='my-tbody-td' style={{ width: xmlTableColumnWidth[4], }}>{item.inference_xml_path}</div>
                                                                                            <div className='my-tbody-td' style={{ width: xmlTableColumnWidth[5], }}>
                                                                                                <CustomButton name="general" text="Detail" width={100} height={32} onClick={() => handleXmlDetail(item.board_sn)}></CustomButton>
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
                                }
                            </>
                            :
                            <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 600 }}>
                                <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>Remote server is not available now.</div>
                                <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please check the server ip and port setting or remote service is down.</div>

                            </div>
                    }

                </div>
            </ThemeProvider >
            <Utility ref={utilityRef} />

        </>
    );
}

export default InferPage;