
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './page.scss';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme, ThemeProvider } from '@mui/joy/styles';

import YAML from 'yaml';
import { faBan, faCheck, faTriangleExclamation, faSquareXmark, faSquareCheck, faSquareMinus, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { AttributeType, PageKeyType, ProjectDataType } from './type';
import { SchedulerHeadContainer, SchedulerHeadWrapper, SchedulerBodyContainer, SchedulerBodyWrapper } from "./pageStyle";
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoTrainStatusWS, taoEvaluateAPI, taoInferenceAPI, taoTrainInfoIdAPI, taoDownloadAPI, taoDownloadYamlAPI } from '../APIPath';

import { selectCurrentMessage } from '../redux/store/slice/currentMessage';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';
import TrainWebSocket from '../components/WebSockets/TrainWebSocket';

import WebSocketUtility from '../components/WebSocketUtility.js';
import Stack from '@mui/joy/Stack';
import LinearProgress from '@mui/joy/LinearProgress';
import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, set } from 'lodash-es';
import { Train } from '@mui/icons-material';
import { current } from '@reduxjs/toolkit';

export const theme = extendTheme({
    palette: {
        primary: {
            main: '#ed1b23',
        },
        secondary: {
            main: '#888',
        },
        soft: {
            main: '#888',
        },
    },
    typography: {
        fontFamily: 'Google Noto Sans TC',
    },
});

const TrainPage = (props) => {

    const { setPageKey, projectData, setCurrentProject } = props;
    const [noTask, setNoTask] = useState(true);

    const [currentStep, setCurrentStep] = useState(0);
    const [currentProjectName, setCurrentProjectName] = useState('');
    const [currentPercent, setCurrentPercent] = useState(0);

    const [showDetail, setShowDetail] = useState(false);
    const [socketOpen, setSocketOpen] = useState(false);
    const [showDeleteHistoryConfirm, setShowDeleteHistoryConfirm] = useState(false);
    const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
    const [currentDeleteItem, setCurrentDeleteItem] = useState('');

    const [infoModelType, setInfoModelType] = useState('');
    const [infoMargin, setInfoMargin] = useState('');
    const [infoBatchSize, setInfoBatchSize] = useState('');
    const [infoFpratioSampling, setInfoFpratioSampling] = useState('');
    const [infoNumberOfEpochs, setInfoNumberOfEpochs] = useState('');
    const [infoLearningRate, setInfoLearningRate] = useState('');
    const [infoCheckPointInterval, setInfoCheckPointInterval] = useState('');

    const [infoList, setInfoList] = useState([]);

    // const [infoMargin,setInfoMargin]=useState('');


    const [totalStep, setTotalStep] = useState(200);
    const [currentUuid, setCurrentUuid] = useState(null);

    const [table1HeaderNoShadow, setTable1HeaderNoShadow] = useState(true);
    const [table2HeaderNoShadow, setTable2HeaderNoShadow] = useState(true);

    const currentTableColumnWidth = [100, 470, 180, 220, 150];
    //const historyTableColumnWidth = [100, 400, 400, 150, 150];

    const historyTableColumnWidth = ['10%', '30%', '35%', '25%', '5%'];

    const [remainingTime, setRemainingTime] = useState('');
    const [startTime, setStartTime] = useState('');

    const [taskList, setTaskList] = useState([]);
    const [fetchList, setFetchList] = useState([]);
    const [historyList, setHistoryList] = useState([]);

    const [wsUrl, setWsUrl] = useState('');

    const [currentTaskInfo, setCurrentTaskInfo] = useState('');


    const chartRef = useRef(null);
    const utilityRef = useRef(null);
    const currentTabRef = useRef(null);
    const historyTabRef = useRef(null);

    const currentTaoEvaluateId = useSelector(selectCurrentMessage).currentTaoEvaluateId;
    const currentTaoInferenceId = useSelector(selectCurrentMessage).currentTaoInferenceId;
    const currentTaoExportId = useSelector(selectCurrentMessage).currentTaoExportId;

    const getTrainingList = async () => {


        //log('---- getTrainingList ----')


        try {

            const response = await fetch(taoStartTrainAPI, {
                method: 'GET'
            })
            const data = await response.json();

            console.log('task list')
            console.log(data)

            if (data.length === 0) {
                setNoTask(true);
            } else {
                setNoTask(false);
            }
            setFetchList(data);

        } catch (error) {

            utilityRef.current.showMessage('Get training list : ' + error.message);

        }
    }

    const getHistoryList = async () => {


        try {

            const response = await fetch(taoWorkspaceAPI, {
                method: 'GET'
            });
            const data = await response.json();

            console.log('history list')
            console.log(data)

            data.forEach((item, index) => {
               
                if (item.tao_model_status.completed===false){
                    console.log('-----------------------------------------------------');
                    console.log(item.tao_model_uuid);
                    console.log('train='+item.tao_model_status.train.status[0])
                    console.log('evaluate='+item.tao_model_status.evaluate.status[0])
                    console.log('inference='+item.tao_model_status.inference.status[0])
                    console.log('export='+item.tao_model_status.export.status[0])
                }
            });

            const sortedData = orderBy(data, ['create_time'], ['desc']);

            setHistoryList(sortedData);
            //console.log(data)

        } catch (error) {

            utilityRef.current.showMessage('Get history list : ' + error.message);

        }
    };

    const handleUpdateStep = (myStep) => {

        setCurrentStep(myStep);

    }

    const handleDeleteTask = async (myItem) => {

        console.log('handle delete task')
        console.log(myItem);

        setCurrentDeleteItem(myItem);
        setShowDeleteTaskConfirm(true);

    }


    const handleDeleteTaskConfirm = async () => {

        setShowDeleteTaskConfirm(false);

        if (currentDeleteItem) {

            const myData = {};
            myData.tao_model_uuid = currentDeleteItem.tao_model_uuid;
            myData.force = true;

            utilityRef.current.setLoading(true);

            const response = await fetch(taoStartTrainAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();

            utilityRef.current.setLoading(false);

            getTrainingList();


        }

    }

    const handleViewTask = async (myTaskId, myProjectName) => {

        viewTaskByModelId(myTaskId);

    }

    const handleDetailTask = async (myTaskId, myProjectName) => {

        //viewTaskByModelId(myTaskId);

        console.log('handle detail task')
        console.log(myTaskId, myProjectName);

        const theTask = filter(historyList, function (myItem) { return myItem.tao_model_uuid == myTaskId });

        if (theTask.length > 0) {

            const myTask = theTask[0];
            const myTrainStatus = myTask.tao_model_status;
            log('myTrainStatus', myTrainStatus);
            setCurrentTaskInfo(myTrainStatus);


            log(myTrainStatus.upload_dataset.success)
            setShowDetail(true);
        } else {
            setCurrentTaskInfo('');
            utilityRef.current.showMessage('No more infomation found.');
        }



    }

    const handleDeleteHistoryConfirm = async () => {

        //log(`delete history ${myTaoModelId}`)
        setShowDeleteHistoryConfirm(false);

        if (currentDeleteItem.tao_model_uuid) {

            log(`delete history ${currentDeleteItem.tao_model_uuid}`)

            const myData = {};
            myData.tao_model_uuid = currentDeleteItem.tao_model_uuid;

            utilityRef.current.setLoading(true);


            const response = await fetch(taoWorkspaceAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();

            utilityRef.current.setLoading(false);
            console.log(data);
            //setTaskList(data);
            getHistoryList();


        }



    }

    const handleDeleteHistory = async (myItem) => {

        setCurrentDeleteItem(myItem);
        setShowDeleteHistoryConfirm(true);

    }


    const isFloat = (n) => {
        return parseFloat(n.match(/^-?\d*(\.\d+)?$/)) > 0;
    }



    const getModelNameByModelId = (myModelId) => {

        //console.log('myModelId='+myModelId);

        let myModelName = 'N/A';
        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })

        if (myIndex1 >= 0) {
            myModelName = historyList[myIndex1].tao_model_name;
        }

        return myModelName;
    }



    const getTrainStatus = async (uuid) => {

        console.log(`-------------- getTrainStatus ${uuid} --------------------`);

        const wsurl = `${taoTrainStatusWS}?tao_model_uuid=${uuid}`;
        console.log('wsurl')
        console.log(wsurl)
        setWsUrl(wsurl);




    }

    const handleLastMessage = (lastMessage) => {

        //if (!message) return;

        //console.log(message)

        const message = lastMessage.data;

        // if (message.indexOf('run the training container') >= 0) {
        //     setSocketOpen(false);
        //     //websocket.stop();

        //     setTimeout(() => {

        //         console.log(`restart websocket ${uuid}`)
        //         getTrainStatus(uuid);
        //     }, "1000");
        // }


        if (message.indexOf('Training finished successfully.') >= 0) {
            // websocket.stop();

        } else {
            const fromStr = message.indexOf('}, "details"') + 13;
            const toStr = message.length - 1;
            if (fromStr >= 0) {
                const myData = message.substring(fromStr, toStr).replaceAll('\\u2588', '');
                //console.log(myData);
                const myArr = myData.split('\\r');

                myArr.map((item) => {

                    // console.log(`index=${index}`);
                    //console.log(item);

                    if (item.indexOf('Epoch') >= 0) {
                        const myEpoch = item.substring(item.indexOf('Epoch') + 5, item.indexOf(':')).replaceAll(' ', '');
                        const myInfo = item.substring(item.indexOf('train_loss='), item.length);
                        let myTranLoss = '';
                        if (myInfo.indexOf('train_loss=') >= 0) {
                            myTranLoss = myInfo.substring(myInfo.indexOf('train_loss=') + 11, myInfo.length);
                        }
                        if (myTranLoss.indexOf(',') >= 0) {
                            myTranLoss = myTranLoss.substring(0, myTranLoss.indexOf(','));
                        }
                        if (myTranLoss.indexOf(']') >= 0) {
                            myTranLoss = myTranLoss.substring(0, myTranLoss.indexOf(']'));
                        }
                        let myValLoss = '';
                        if (myInfo.indexOf('val_loss=') >= 0) {
                            myValLoss = myInfo.substring(myInfo.indexOf('val_loss=') + 9, myInfo.length);
                        }
                        if (myValLoss.indexOf(']') >= 0) {
                            myValLoss = myValLoss.substring(0, myValLoss.indexOf(']'));
                        }



                        setCurrentStep(parseInt(myEpoch) + 1);

                        if (chartRef.current) {

                            if (isFloat(myTranLoss)) {
                                chartRef.current.updateChart1Line1Data(parseInt(myEpoch) + 1, parseFloat(myTranLoss));
                            }

                            if (isFloat(myValLoss)) {
                                chartRef.current.updateChart1Line2Data(parseInt(myEpoch) + 1, parseFloat(myValLoss));
                            }



                        }

                    }
                })
            }
        }




    }


    const doTrain = async (myModelId) => {

        console.log(`doTrain ${myModelId}`);

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {

            const myTrainStatus = historyList[myIndex1].tao_model_status.train.success;

            if (!myTrainStatus) {

                try {
                    log('try train model')

                    utilityRef.current.setLoading(true);

                    const response = await fetch(taoStartTrainAPI, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "tao_model_uuid": myModelId }),
                    });

                    const data = await response.json();

                    utilityRef.current.setLoading(false);

                    if (data.detail) {
                        utilityRef.current?.showErrorMessage(data.detail);
                        return;
                    }

                    if (data.message) {
                        utilityRef.current.showMessage(data.message);
                    }

                    getHistoryList();

                } catch (err) {

                    console.log(err);
                    utilityRef.current.setLoading(false);

                }

            }

        };

    };


    const doEvaluate = async (myModelId) => {

        log(`doEvaluate ${myModelId}`);

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {

            const myTrainStatus = historyList[myIndex1].tao_model_status.train.status;

            if (myTrainStatus) {

                try {
                    log('try evaluate model')

                    utilityRef.current.setLoading(true);

                    const response = await fetch(taoEvaluateAPI, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "tao_model_uuid": myModelId }),
                    });

                    const data = await response.json();

                    utilityRef.current.setLoading(false);

                    if (data.detail) {
                        utilityRef.current?.showErrorMessage(data.detail);
                        return;
                    }

                    if (data.message) {
                        utilityRef.current.showMessage(data.message);
                    }

                    getHistoryList();

                } catch (err) {

                    console.log(err);
                    utilityRef.current.setLoading(false);

                }

            }

        };

    };

    const getProjectIdByDatasetId = (myId) => {

        console.log(projectData)

        let myProjectId = '';
        const myIndex1 = findIndex(projectData, function (myItem) { return myItem.dataset_uuid == myId })
        if (myIndex1 >= 0) {
            myProjectId = projectData[myIndex1].project_uuid;
        }
        return myProjectId;
    }

    const doInference = async (myModelId, myModelName) => {

        log(`doInference ${myModelId}`)

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {


            const myEvaluateStatus = historyList[myIndex1].tao_model_status.evaluate.status;
            const myInferenceStatus = historyList[myIndex1].tao_model_status.inference.success;
            const myDatasetId = historyList[myIndex1].dataset_uuid;
            const myExportId = historyList[myIndex1].export_uuid;

            const myProjectId = getProjectIdByDatasetId(myDatasetId);

            if (myInferenceStatus) {

                utilityRef.current.setCurrentTaoModelId(myModelId);
                utilityRef.current.setCurrentTaoModelName(myModelName);
                utilityRef.current.setCurrentExportId(myExportId);
                setPageKey('InferenceResultPage');

            } else {
                if (myEvaluateStatus) {

                    try {
                        log('try evaluate model')
                        utilityRef.current.setLoading(true);
                        const response = await fetch(taoInferenceAPI, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ "tao_model_uuid": myModelId }),
                        });

                        const data = await response.json();
                        utilityRef.current.setLoading(false);

                        if (data.detail) {
                            utilityRef.current?.showErrorMessage(data.detail);
                            return;
                        }

                        if (data.message) {
                            utilityRef.current.showMessage(data.message);
                        }

                        getHistoryList();

                    } catch (err) {
                        const msg = err?.response?.detail?.[0]?.msg || '';
                        const loc = err?.response?.detail?.[0]?.loc || [];
                        console.log(`API error: ${msg} [${loc.join(', ')}]`);
                        utilityRef.current.setLoading(false);


                    }

                }
            }



        };

    };

    const doExport = async (myModelId) => {

        log(`doExport ${myModelId}`)

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {
            const myExportStatus = historyList[myIndex1].tao_model_status.export.success;

            console.log('myExportStatus',myExportStatus)
            if (myExportStatus){
                window.location.href = `${taoDownloadAPI}?tao_model_uuid=${myModelId}`;
            }
            

        }

        // const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        // if (myIndex1 >= 0) {


        //     const myEvaluateStatus = historyList[myIndex1].tao_model_status.evaluate.status;
        //     const myInferenceStatus = historyList[myIndex1].tao_model_status.inference.success;
        //     const myDatasetId = historyList[myIndex1].dataset_uuid;
        //     const myExportId = historyList[myIndex1].export_uuid;

        //     const myProjectId = getProjectIdByDatasetId(myDatasetId);

        //     if (myInferenceStatus) {

        //         utilityRef.current.setCurrentTaoModelId(myModelId);
        //         utilityRef.current.setCurrentExportId(myExportId);
        //         setPageKey('InferenceResultPage');

        //     } else {
        //         if (myEvaluateStatus) {

        //             try {
        //                 log('try evaluate model')
        //                 utilityRef.current.setLoading(true);
        //                 const response = await fetch(taoInferenceAPI, {
        //                     method: 'POST',
        //                     headers: {
        //                         'Content-Type': 'application/json',
        //                     },
        //                     body: JSON.stringify({ "tao_model_uuid": myModelId }),
        //                 });

        //                 const data = await response.json();
        //                 utilityRef.current.setLoading(false);

        //                 if (data.detail) {
        //                     utilityRef.current?.showErrorMessage(data.detail);
        //                     return;
        //                 }

        //                 if (data.message) {
        //                     utilityRef.current.showMessage(data.message);
        //                 }

        //                 getHistoryList();

        //             } catch (err) {
        //                 const msg = err?.response?.detail?.[0]?.msg || '';
        //                 const loc = err?.response?.detail?.[0]?.loc || [];
        //                 console.log(`API error: ${msg} [${loc.join(', ')}]`);
        //                 utilityRef.current.setLoading(false);


        //             }

        //         }
        //     }



        // };

    };


    const viewTaskByModelId = async (myModelId) => {

        log(`viewTaskByModelId ${myModelId}`)

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId });

        if (myIndex1 < 0) {

            utilityRef.current.showMessage('Dataset uuid not found.');
            return;
        }

        const myDatasetId = historyList[myIndex1].dataset_uuid;
        const myProjectId = getProjectIdByDatasetId(myDatasetId);
        log('myProjectId:' + myProjectId)

        if (myProjectId === '') {

            utilityRef.current.showMessage('Project uuid not found.');
            return;
        }

        const myIndex2 = findIndex(projectData, function (myItem) { return myItem.project_uuid == myProjectId });

        if (myIndex2 < 0) {

            utilityRef.current.showMessage('Project not found.');
            return;
        }

        if (myIndex2 >= 0) {
            const project = projectData[myIndex2];
            const project_uuid = projectData[myIndex2].project_uuid;

            setCurrentProject(project);
            if (project.export_uuid) {
                setPageKey('SetAttributePage')
            } else {
                utilityRef.current.showMessage('Export uuid not found.');
            }
        }


    }

    const handleViewClick = () => {

        viewTaskByModelId(currentUuid);

    }

    const handleTaskStopClick = async () => {

        //viewTaskByModelId(currentUuid);
        console.log('handleTaskStopClick')
        console.log(currentUuid)
        //taoStartTrainAPI

        utilityRef.current.setLoading(true);

        const res = await fetch(taoStartTrainAPI, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "tao_model_uuid": currentUuid, "force": true })
        })
        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current?.showErrorMessage(resJson.detail);
            return;
        }

        if (resJson.message) {
            utilityRef.current.showMessage(resJson.message);
        }

        utilityRef.current.setLoading(false);

        getTrainingList();



    }

    const getTrainInfo_xx = async (myModelId) => {

    }

    const getTrainInfo = async (myModelId) => {
        

        const res = await fetch(`${taoTrainInfoIdAPI}?tao_model_uuid=${myModelId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },

        })
        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current?.showErrorMessage(resJson.detail);
            return;
        }

        console.log(`(1)------------------------------------- get train info by ${myModelId} ---`)
        console.log(resJson)

        const showInfo=['model_type','cls_weight','margin','batch_size','fpratio_sampling','num_epochs','lr','','checkpoint_interval'];

        const myInfoList=[];

        showInfo.forEach((item,index)=>{
            if (resJson[item]){
                myInfoList.push({name:resJson[item][1],value:resJson[item][0]});
            }
        });

        console.log(myInfoList);
        setInfoList(myInfoList);


        // if (resJson.model_type) setInfoModelType(resJson.model_type[0]);
        // if (resJson.margin) setInfoMargin(resJson.margin[0]);
        // if (resJson.batch_size) setInfoBatchSize(resJson.batch_size[0]);
        // if (resJson.fpratio_sampling) setInfoFpratioSampling(resJson.fpratio_sampling[0]);
        // if (resJson.num_epochs) setInfoNumberOfEpochs(resJson.num_epochs[0]);
        // if (resJson.lr) setInfoLearningRate(resJson.lr[0]);
        // if (resJson.checkpoint_interval) setInfoCheckPointInterval(resJson.checkpoint_interval[0]);





        // console.log(resJson)

       
    }

    const getSettingFile = async (myModelId) => {
        log(`getSettingFile ${myModelId}`)

        try {

            const myUrl = `${taoDownloadYamlAPI}?tao_model_uuid=${myModelId}`;

            const res = await fetch(myUrl, { method: 'GET' });

            const resYaml = await res.text();

            const yamlObj = YAML.parse(resYaml);

            const myEpochs = yamlObj.train.num_epochs;

            if (totalStep !== myEpochs) {
                setTotalStep(myEpochs);
            }


        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {

        setCurrentPercent(0);
        setCurrentStep(0);


        setTimeout(() => {
            getTrainingList();
        }, 1000);

        getHistoryList();

        log('---- project data ----')
        console.log(props.projectData);

        // every 5 seconds get training list
        const interval = setInterval(async () => {
            await getTrainingList();
            await getHistoryList();
        }, 10000);

        const currentTab = utilityRef.current.getCurrentTab();
        log('currentTab', currentTab);
        if (currentTab === 'current') {
            currentTabRef.current.click();
        } else {
            historyTabRef.current.click();
        }

        return () => clearInterval(interval);
    }, []);



    useEffect(() => {

        console.log(`--- currentUuid [${currentUuid}] ---`)

        if (currentUuid === '') {

            if (currentPercent === 100) {

                utilityRef.current.setCurrentTab('history');
                historyTabRef.current.click();
            }
        }

    }, [currentUuid]);

    useEffect(() => {

        console.log(`--- currentEvaluateId [${currentTaoEvaluateId}] ---`)
        console.log(`--- currentInferenceId [${currentTaoInferenceId}] ---`)
        console.log(`--- currentExportId [${currentTaoExportId}] ---`)



    }, [currentTaoEvaluateId, currentTaoInferenceId, currentTaoExportId]);




    useEffect(() => {


        setTaskList(fetchList);

        if (fetchList.length === 0) {
            setCurrentUuid('');
            setWsUrl('');
        }

        fetchList.map((item, index) => {

            if (index === 0) {
                const newUuid = item.tao_model_uuid;
                if (newUuid !== currentUuid) {
                    setCurrentUuid(newUuid);
                    getTrainStatus(newUuid);
                    getSettingFile(newUuid);
                    getHistoryList();
                    setCurrentStep(0);
                    setCurrentPercent(0);
                    getTrainInfo(newUuid);
                    if (chartRef.current) {
                        chartRef.current.resetLineData();
                    }
                }
            }

        });




    }, [fetchList]);



    return (
        <>
            {
                (wsUrl !== '') ?
                    <TrainWebSocket url={wsUrl} onSocketMessage={handleLastMessage} />
                    : <></>
            }
            <ThemeProvider theme={theme}>


                <Modal open={showDetail}>
                    <ModalDialog style={{ width: 500, height: 700, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Task Detail Info</h4>
                                    </div>
                                </div>

                                <div className='row mt-1'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between align-items-center'>
                                        <div className='my-detail-item-lv0'>
                                            Pretrained Model Info
                                        </div>
                                        <div className='my-detail-item'>
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between' style={{ borderBottom: '1px solid #16272e3d' }}>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between align-items-center'>
                                        <div className='my-detail-item-lv1'>
                                            1. Name
                                        </div>
                                        <div className='my-detail-item-lv2'>
                                            {(currentTaskInfo.pretrained?.name)?currentTaskInfo.pretrained.name:'N/A'}
                                        </div>

                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between align-items-center'>
                                        <div className='my-detail-item-lv1'>
                                            2. Version
                                        </div>
                                        <div className='my-detail-item-lv2'>
                                            {(currentTaskInfo.pretrained?.name)?currentTaskInfo.pretrained.version:'N/A'}
                                        </div>

                                    </div>
                                </div>

                                <div className='row mt-1'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between align-items-center'>
                                        <div className='my-detail-item-lv0'>
                                            Completed
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.completed) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" style={{width:24,height:24}} />
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="#16272E3D" style={{width:24,height:24}} />
                                            }
                                        </div>

                                    </div>
                                </div>



                                <div className='row'>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between' style={{ borderBottom: '1px solid #16272e3d' }}>

                                    </div>
                                </div>

                                <div className='row' style={{height:45}}>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            1. Upload dataset
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.upload_dataset?.success) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" style={{width:24,height:24}} />
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="#16272E3D" style={{width:24,height:24}} />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.upload_dataset?.status?.train?.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-0 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    Train {currentTaskInfo.upload_dataset.status.train[1]}
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <></>
                                }

                                {
                                    (currentTaskInfo.upload_dataset?.status?.val?.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    Val {currentTaskInfo.upload_dataset.status.val[1]}
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <></>
                                }


                                <div className='row' style={{height:32}}>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            2. Train
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.train?.success) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" style={{width:24,height:24}} />
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="#16272E3D" style={{width:24,height:24}} />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.train?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-0 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.train.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }



                                <div className='row' style={{height:32}}>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            3. Evaluate
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.evaluate?.success) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" style={{width:24,height:24}} />
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="#16272E3D" style={{width:24,height:24}} />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.evaluate?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-0 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.evaluate.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }


                                <div className='row' style={{height:32}}>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            4. Inference
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.inference?.success) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" style={{width:24,height:24}} />
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="#16272E3D" style={{width:24,height:24}} />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.inference?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-0 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.inference.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }


                                <div className='row' style={{height:32}}>
                                    <div className='col-md-12 mt-0 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            5. Export
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.export?.success) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" style={{width:24,height:24}} />
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="#16272E3D" style={{width:24,height:24}} />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.export?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-0 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.export.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }




                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="view" text="Close" width={100} height={32} onClick={() => setShowDetail(false)} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showDeleteHistoryConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff', borderRadius: '12px' }} layout='center'>
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
                                            Are you sure to delete the item {(currentDeleteItem) ? currentDeleteItem.tao_model_name : ''}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowDeleteHistoryConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={() => handleDeleteHistoryConfirm()} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showDeleteTaskConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff', borderRadius: '12px' }} layout='center'>
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
                                            Are you sure to delete the item {(currentDeleteItem) ? getModelNameByModelId(currentDeleteItem.tao_model_uuid) : ''}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowDeleteTaskConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={() => handleDeleteTaskConfirm()} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>



                <div className="container">
                    <div className="title-container">
                        <div className="title-style">Train Page</div>

                    </div>
                    <div className="train-page-content">
                        <SchedulerHeadContainer $noOverFlow={true}>
                            <SchedulerHeadWrapper>
                                <div style={{ position: 'relative', height: 40 }}>
                                    <div style={{ position: 'absolute', top: 2 }}>

                                        <ul className="nav nav-tabs flex-nowrap" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className="my-nav-link active"
                                                    id="current-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#current"
                                                    type="button" role="tab"
                                                    aria-controls="info"
                                                    aria-selected="true"
                                                    ref={currentTabRef}
                                                    onClick={() => utilityRef.current.setCurrentTab('current')}>Current</button>

                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="my-nav-link"
                                                    id="history-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#history"
                                                    type="button" role="tab"
                                                    aria-controls="log"
                                                    aria-selected="false"
                                                    ref={historyTabRef}
                                                    onClick={() => utilityRef.current.setCurrentTab('history')}
                                                >History</button>
                                            </li>
                                        </ul>

                                    </div>
                                </div>

                            </SchedulerHeadWrapper>
                        </SchedulerHeadContainer>


                        <SchedulerBodyContainer $noOverFlow={true} >
                            <SchedulerBodyWrapper>

                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade show active" id="current" role="tabpanel" aria-labelledby="current-tab">
                                        {
                                            noTask ?
                                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                                    <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No training job.</div>
                                                    <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please start training from project.</div>

                                                </div>
                                                :
                                                <div className='my-tab-container d-flex flex-row justify-content-between gap-3'>

                                                    <div className='my-training-panel d-flex flex-column' style={{ backgroundColor: 'white' }}>
                                                        <div className='my-training-panel-section-1'>
                                                            <div className='d-flex flex-column' style={{ padding: 24 }}>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 500, fontSize: 22 }}>

                                                                    <div style={{ width: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

                                                                        {getModelNameByModelId(currentUuid)}

                                                                    </div>

                                                                    <CustomCounter currentStep={currentStep} totalStep={totalStep} updatePercent={(myPercent) => setCurrentPercent(myPercent)}></CustomCounter>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-between' style={{ paddingTop: 15, paddingBottom: 15 }}>
                                                                    <Stack spacing={12} sx={{ flex: 1 }}>
                                                                        <LinearProgress determinate value={currentPercent} size="lg" />

                                                                    </Stack>
                                                                </div>

                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 400, fontSize: 13, color: '#000000D9' }}>
                                                                    {/* <div>Started at {startTime}</div>
                                                                    <div>{remainingTime} left</div> */}
                                                                </div>

                                                                <div className='d-flex flex-row justify-content-between' style={{ paddingTop: 15, paddingBottom: 0 }}>
                                                                    <div><CustomButton name="stop" width={116} height={32} onClick={handleTaskStopClick} /></div>
                                                                    <div><CustomButton name="view" text="View" width={116} height={32} onClick={handleViewClick} /></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='my-training-panel-section-2'>


                                                            <CustomChart datasetId={'aaa'} lastIter={20} totalStep={parseInt(totalStep)} updateStep={handleUpdateStep} ref={chartRef} />

                                                        </div>
                                                        <div className='my-training-panel-section-3'>


                                                            <div className='d-flex flex-column' style={{ padding: '15px 20px 10px 20px' }}>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 500, fontSize: 22, paddingBottom: 5 }}>
                                                                    <div>Information</div>
                                                                </div>

                                                                {
                                                                    infoList.map((item, index) => (
                                                                        <div key={`infoList_${index}`} className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                            <div className='my-info-text d-flex align-items-center'>{item.name}</div>
                                                                            <div className='my-info-value d-flex align-items-center'>{item.value}</div>
                                                                        </div>
                                                                    ))
                                                                }

                                                           

                                                            </div>


                                                        </div>

                                                    </div>



                                                    <div className='my-table' style={{ width: 880, height: 662 }}>
                                                        <div className={(table1HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>

                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[0] }}>Order</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[1] }}>Model name</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[2] }}>Status</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[3] }}>Create time</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[4] }}></div>
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

                                                            {taskList.map((item, i) => (


                                                                <div key={`taskList_${i}`} >

                                                                    <div className={(i === (taskList.length - 1)) ? `my-tbody-row-${(i % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(i % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid} onClick={() => console.log('click')}>

                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[0] }} >{i + 1}</div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                                                            {getModelNameByModelId(item.tao_model_uuid)}

                                                                        </div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[2] }}>
                                                                            {
                                                                                (item.train_status.status === 'START') ? <StatusButton name="training" /> :
                                                                                    (item.train_status.status === 'WAIT') ? <StatusButton name="train-wait" /> :
                                                                                        (item.train_status.status === 'SUCCESS') ? <StatusButton name="train-active" /> :
                                                                                            (item.train_status.status === 'FAILURE') ? <StatusButton name="train-failed" title={item.train_status.details} /> : <StatusButton name="waiting" />
                                                                            }

                                                                        </div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                        <div className='my-tbody-td d-flex justify-content-end p-3' style={{ width: currentTableColumnWidth[4] }}>
                                                                            <ExtendButton type={2} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={() => handleDeleteTask(item)} onViewTask={handleViewTask} onDetailTask={handleDetailTask} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        </div>




                                                    </div>
                                                </div>

                                        }
                                    </div>
                                    <div className="tab-pane fade" id="history" role="tabpanel" aria-labelledby="history-tab" style={{ backgroundColor: 'red', width: '100%' }}>
                                        <div className='my-tab-container' style={{ width: '80vw', maxWidth: 1200, backgroundColor: 'red' }}>

                                            <div className='my-table'>
                                                <div className={(table2HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[0] }}>Order</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[1] }}>Model name</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[2] }}>Status</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[3] }}>Create Time</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[4] }}></div>
                                                </div>
                                                <div className='my-tbody' >

                                                    {historyList.map((item, index) => (


                                                        <div key={`history_${index}`} >

                                                            <div className={(index === (historyList.length - 1)) ? `my-tbody-row-${(index % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(index % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid}>

                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[0] }} >{index + 1}</div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                                                    {item.tao_model_name}

                                                                </div>
                                                                <div className='my-tbody-td d-flex flex-row gap-2' style={{ width: historyTableColumnWidth[2] }}>
                                                                    {
                                                                        (item.tao_model_status.train.success) ? <StatusButton name="train-active" style={{ cursor: 'default !important' }} /> :
                                                                            (item.tao_model_uuid === currentUuid) ? <StatusButton name="training" style={{ cursor: 'default !important' }} /> :
                                                                                <div>
                                                                                    <StatusButton name="train-inactive" style={{ cursor: 'default !important' }} onClick={() => doTrain(item.tao_model_uuid)} />
                                                                                </div>
                                                                    }

                                                                    {

                                                                        (item.tao_model_status.evaluate.success) ?
                                                                            <StatusButton name="evaluate-active" onClick={() => doEvaluate(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />
                                                                            :
                                                                            (item.tao_model_uuid === currentTaoEvaluateId) ?
                                                                                <StatusButton name="evaluate-running" />
                                                                                :
                                                                                <StatusButton name="evaluate-inactive" onClick={() => doEvaluate(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />

                                                                    }

                                                                    {

                                                                        (item.tao_model_status.inference.success) ?
                                                                            <StatusButton name="inference-active" onClick={() => doInference(item.tao_model_uuid, item.tao_model_name)} style={{ cursor: 'pointer' }} />
                                                                            :
                                                                            (item.tao_model_uuid === currentTaoInferenceId) ?
                                                                                <StatusButton name="inference-running" />
                                                                                :
                                                                                <StatusButton name="inference-inactive" onClick={() => doInference(item.tao_model_uuid, item.tao_model_name)} style={{ cursor: 'pointer' }} />

                                                                    }

                                                                    {

                                                                        (item.tao_model_status.export.success) ?
                                                                            <StatusButton name="export-active" onClick={() => doExport(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />
                                                                            :
                                                                            (item.tao_model_uuid === currentTaoExportId) ?
                                                                                <StatusButton name="export-running" />
                                                                                :
                                                                                <StatusButton name="export-inactive" onClick={() => doExport(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />

                                                                    }

                                                                </div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                <div className='my-tbody-td d-flex justify-content-end' style={{ width: historyTableColumnWidth[4], padding: '20px' }}>
                                                                    <ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={() => handleDeleteHistory(item)} onViewTask={handleViewTask} onDetailTask={handleDetailTask} /></div>
                                                            </div>
                                                        </div>
                                                    ))}



                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </SchedulerBodyWrapper>
                        </SchedulerBodyContainer >

                    </div>
                </div>
            </ThemeProvider >
            <Utility ref={utilityRef} />

        </>
    );
}

export default TrainPage;