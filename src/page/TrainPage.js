
import { useEffect, useState, useRef } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { AttributeType, PageKeyType, ProjectDataType } from './type';
import { SchedulerHeadContainer, SchedulerHeadWrapper, SchedulerBodyContainer, SchedulerBodyWrapper } from "./pageStyle";
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoTrainStatusWS, taoEvaluateAPI, taoInferenceAPI, taoExportAPI, taoDownloadAPI } from '../APIPath';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';


import ResultCard from '../components/Cards/ResultCard';
import WebSocketUtility from '../components/WebSocketUtility.js';
import Stack from '@mui/joy/Stack';
import LinearProgress from '@mui/joy/LinearProgress';
import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy } from 'lodash-es';
import { get, set } from 'lodash';

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
    const [totalStep, setTotalStep] = useState(200);
    const [currentUuid, setCurrentUuid] = useState(null);

    const [table1HeaderNoShadow, setTable1HeaderNoShadow] = useState(true);
    const [table2HeaderNoShadow, setTable2HeaderNoShadow] = useState(true);

    const [showInferenceResultModal,setShowInferenceResultModal] = useState(false);

    const currentTableColumnWidth = [100, 470, 180, 220, 150];
    const historyTableColumnWidth = [100, 400, 400, 150, 150];

    const [remainingTime, setRemainingTime] = useState('');
    const [startTime, setStartTime] = useState('');

    const [taskList, setTaskList] = useState([]);
    const [fetchList, setFetchList] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [resultId, setResultId] = useState('');

    const [historyList, setHistoryList] = useState([]);

    const chartRef = useRef(null);
    const utilityRef = useRef(null);

    const getTrainingList = () => {

        //utilityRef.current.ShowMessage('test');

        log('---- get training list ----')

        fetch(taoStartTrainAPI, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {

            if (data.length === 0)
                setNoTask(true);
            else
                setNoTask(false);


            console.log(data)            

            setFetchList(data);

        });


    }

    const handleUpdateStep = (myStep) => {

        setCurrentStep(myStep);

    }

    const handleDeleteTask = async (myTaskId, myProjectName) => {

        if (myTaskId !== '') {

            const myData = {};
            myData.tao_model_uuid = myTaskId;
            myData.force = "false";

            utilityRef.current.SetLoading(true);

            const response = await fetch(taoStartTrainAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();

            utilityRef.current.SetLoading(false);
            
            //console.log(data);
            //setTaskList(data);
            getTrainingList();


        }

    }

    const handleViewTask = async (myTaskId, myProjectName) => {

        viewTaskByModelId(myTaskId);

    }

    const handleDeleteHistory = async (myTaoModelId) => {

        if (myTaoModelId !== '') {

            log(`delete history ${myTaoModelId}`)

            const myData = {};
            myData.tao_model_uuid = myTaoModelId;

            const response = await fetch(taoWorkspaceAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();
            console.log(data);
            //setTaskList(data);
            getHistoryList();


        }

    }

    const isFloat = (n) => {
        return parseFloat(n.match(/^-?\d*(\.\d+)?$/)) > 0;
    }

    const getHistoryList = async () => {

        const response = await fetch(taoWorkspaceAPI, {
            method: 'GET'
        });

        const data = await response.json();
        log('---- get history list ----')
        console.log(data);
        setHistoryList(data);

    };

    const getProjectName = async (myModelId) => {

        let myProjectName = 'N/A';

        const response = await fetch(taoWorkspaceAPI, {
            method: 'GET'
        });

        let myData = await response.json();

        log('---- myData ----')
        console.log(myData)

        const myIndex1 = findIndex(myData, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {
            const myProjectId = myData[myIndex1].project_uuid;
            const myIndex2 = findIndex(props.projectData, function (myItem) { return myItem.project_uuid == myProjectId })
            myProjectName = (myIndex2 >= 0) ? props.projectData[myIndex2].project_name : 'N/A';
        }

        return myProjectName;
    }

    const getProjectNameByProjectId = (myProjectId) => {

        log('---- getProjectNameByProjectId ----' + myProjectId)

        let myProjectName = 'N/A';

        const myIndex1 = findIndex(projectData, function (myItem) { return myItem.project_uuid == myProjectId })

        log('---- myIndex1 ----' + myIndex1)

        if (myIndex1 >= 0) {
            myProjectName = props.projectData[myIndex1].project_name;
        }

        return myProjectName;
    }

    const getModelNameByModelId = (myModelId) => {

        let myModelName = 'N/A';
        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })

        if (myIndex1 >= 0) {
            myModelName = historyList[myIndex1].tao_model_name;
        }

        return myModelName;
    }

    const getTrainStatus = async (uuid) => {

        const wsurl = `${taoTrainStatusWS}?tao_model_uuid=${uuid}`;
        //setShowLoadingModal(true);
        //console.log(wsurl);
        const websocket = new WebSocketUtility(wsurl);
        websocket.setMessageCallback(async (message) => {


            if (message.indexOf('Training finished successfully.') >= 0) {
                websocket.stop();

            } else {
                const fromStr = message.indexOf('}, "details"') + 13;
                const toStr = message.length - 1;
                if (fromStr >= 0) {
                    const myData = message.substring(fromStr, toStr).replaceAll('\\u2588', '');
                    //console.log(myData);
                    const myArr = myData.split('\\r');

                    myArr.map((item, index) => {
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


                            setCurrentPercent((parseInt(myEpoch) + 1) / parseInt(totalStep) * 100);
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


        });

        websocket.start();

    }

    const doEvaluate = async (myModelId) => {

        log(`doEvaluate ${myModelId}`);

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1>=0) {
            
            const myTrainStatus = historyList[myIndex1].tao_model_status.train.status;

            if (myTrainStatus) {
                
                try {
                    log('try evaluate model')

                    utilityRef.current.SetLoading(true);

                    const response = await fetch(taoEvaluateAPI, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({"tao_model_uuid": myModelId}),
                    });

                    const data = await response.json();

                    utilityRef.current.SetLoading(false);
                    console.log(data);
                    getHistoryList();
                    
                } catch (err) {
                    const msg = err?.response?.detail?.[0]?.msg || '';
                    const loc = err?.response?.detail?.[0]?.loc || [];
                    console.log(`API error: ${msg} [${loc.join(', ')}]`);
                    utilityRef.current.SetLoading(false);
                    
                }

            }
          
        };

    };

    const getProjectIdByDatasetId = (myId)=>{

        console.log(projectData)

        let myProjectId='';
        const myIndex1 = findIndex(projectData, function (myItem) { return myItem.dataset_uuid == myId })
        if (myIndex1>=0) {
            myProjectId=projectData[myIndex1].project_uuid;
        }
        return myProjectId;
    }

    const doInference = async (myModelId) => {

        log(`doInference ${myModelId}`)

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1>=0) {
            
            const myEvaluateStatus = historyList[myIndex1].tao_model_status.evaluate.status;
            const myInferenceStatus = historyList[myIndex1].tao_model_status.inference.status;
            const myDatasetId = historyList[myIndex1].dataset_uuid;

            log('myDatasetId:'+myDatasetId)

            const myProjectId = getProjectIdByDatasetId(myDatasetId);
            log('myProjectId:'+myProjectId)

            log('item data')
            console.log(historyList[myIndex1])

            if (myInferenceStatus){

                try {

                    utilityRef.current.SetLoading(true);

                    log(`get inference result [tao_model_uuid] : ${myModelId}`)
                    const response = await fetch(`${taoInferenceAPI}/result?tao_model_uuid=${myModelId}`, {
                        method: 'GET',
                    });

                    const data = await response.text();
                    const dataArr=data.split('\n');
                    let resultArr=[];
                    dataArr.map((item,index)=>{
                        //console.log(item);

                        if (index>0){
                            const lineArr=item.split(',');
                            //console.log(lineArr);
                            if (lineArr.length<3) return;
                            const compName=lineArr[0].substring(0,lineArr[0].indexOf('/'));
                            //log(`compName=${compName}`);
                            const lightSource=lineArr[0].substring(lineArr[0].lastIndexOf('/')+1,lineArr[0].length);
                            //log(`lightSource=${lightSource}`);
                            const label=lineArr[2];
                            //log(`label=${label}`);
                            const uuidList=lineArr[3].split('_');
                            //console.log(uuidList);
                            const goldenUuid=uuidList[1];
                            //log(`goldenUuid=${goldenUuid}`);
                            const imageUuid=uuidList[2];
                            //log(`imageUuid=${imageUuid}`);
                            const score=lineArr[4];
                            //log(`score=${score}`);

                            let myData={};
                            myData.compName=compName;
                            myData.lightSource=lightSource;
                            myData.label=label; 
                            myData.goldenUuid=goldenUuid;
                            myData.imageUuid=imageUuid;
                            myData.score=parseFloat(score);
                            resultArr.push(myData);
                        }
                    });


                    let resultArrSort = orderBy(resultArr, ['score'],['desc']);

                    utilityRef.current.SetLoading(false);


                    setResultList(resultArrSort);
                    setResultId(myModelId);
                    setShowInferenceResultModal(true);

                    
                   
                    
                } catch (err) {
                    console.log(err)
                    const msg = err?.response?.detail?.[0]?.msg || '';
                    const loc = err?.response?.detail?.[0]?.loc || [];
                    console.log(`API error: ${msg} [${loc.join(', ')}]`);
                    utilityRef.current.SetLoading(false);

                }

            }else{
                if (myEvaluateStatus) {
                
                    try {
                        log('try evaluate model')
                        utilityRef.current.SetLoading(true);
                        const response = await fetch(taoInferenceAPI, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({"tao_model_uuid": myModelId}),
                        });
    
                        const data = await response.json();
                        console.log(data);
                        utilityRef.current.SetLoading(false);
                        getHistoryList();
                        
                    } catch (err) {
                        const msg = err?.response?.detail?.[0]?.msg || '';
                        const loc = err?.response?.detail?.[0]?.loc || [];
                        console.log(`API error: ${msg} [${loc.join(', ')}]`);
                        utilityRef.current.SetLoading(false);

                        
                    }
    
                }
            }

          
          
        };

    };

    const handleLabelToggle = (uuid) => {
        log('handleLabelToggle===>',uuid)
        let resultArr = cloneDeep(resultList);
        const myIndex = findIndex(resultArr, function (myItem) { return myItem.imageUuid == uuid });
        if (myIndex>=0){
            resultArr[myIndex].label=(resultArr[myIndex].label==='PASS')?'NG':'PASS';
            setResultList(resultArr);
        }
    };

    const handleDownload = async () => {
        log('handleDownload '+resultId)
        //setShowInferenceResultModal(false);

        try {
            log('try evaluate model')
            const response1 = await fetch(taoExportAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"tao_model_uuid": resultId}),
            });

            const data1 = await response1.json();
            console.log(data1);

            window.location.href = `${taoDownloadAPI}?tao_model_uuid=${resultId}`;

           
            
            
        } catch (err) {

            console.log(err)
            // const msg = err?.response?.detail?.[0]?.msg || '';
            // const loc = err?.response?.detail?.[0]?.loc || [];
            // console.log(`API error: ${msg} [${loc.join(', ')}]`);
            
        }
    
    }

    const viewTaskByModelId = async (myModelId) => {
            
            log(`viewTaskByModelId ${myModelId}`)
    
            const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId });

            if (myIndex1<0) {

                utilityRef.current.ShowMessage('Dataset uuid not found.');
                return;
            }
    
            const myDatasetId = historyList[myIndex1].dataset_uuid;
            const myProjectId = getProjectIdByDatasetId(myDatasetId);
            log('myProjectId:'+myProjectId)

            if (myProjectId==='') {

                utilityRef.current.ShowMessage('Project uuid not found.');
                return;
            }

            const myIndex2 = findIndex(projectData, function (myItem) { return myItem.project_uuid == myProjectId });

            if (myIndex2<0) {

                utilityRef.current.ShowMessage('Project not found.');
                return;
            }

            if (myIndex2>=0) {
                const project=projectData[myIndex2];
                const project_uuid=projectData[myIndex2].project_uuid;
                
                setCurrentProject(project);
                if (project.export_uuid) {
                    setPageKey('SetAttributePage')
                }else{
                    utilityRef.current.ShowMessage('Export uuid not found.');
                }
            }
            
            
    }

    const handleViewClick = () => {
 
        viewTaskByModelId(currentUuid);

    }

    useEffect(() => {

        setCurrentPercent(0);
        setCurrentStep(0);
        getTrainingList();
        getHistoryList();

        log('---- project data ----')
        console.log(props.projectData);

        // every 5 seconds get training list
        const interval = setInterval(() => {
            getTrainingList();
            getHistoryList();
        }, 10000);



    }, []);


    useEffect(() => {

        const myTaskList = map(taskList, 'tao_model_uuid');
        const myFetchList = map(fetchList, 'tao_model_uuid');

        if (!isEqual(myTaskList, myFetchList)) {
            setTaskList(fetchList);
            fetchList.map((item, index) => {

                if (item.train_status.status === 'START') {

                    if (item.tao_model_uuid !== currentUuid) {
                        setCurrentUuid(item.tao_model_uuid);
                        getTrainStatus(item.tao_model_uuid);
                        getHistoryList();
                        setCurrentStep(0);
                        setCurrentPercent(0);
                        if (chartRef.current) {
                            chartRef.current.resetLineData();
                        }
                    }

                }
            });

        }

    }, [taskList,fetchList]);



    return (
        <>

            <ThemeProvider theme={theme}>
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
                                                <button className="my-nav-link active" id="current-tab" data-bs-toggle="tab" data-bs-target="#current" type="button" role="tab" aria-controls="info" aria-selected="true">Current</button>

                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="my-nav-link" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab" aria-controls="log" aria-selected="false">History</button>
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
                                                <div className='my-tab-container d-flex flex-row justify-content-between'>

                                                    <div className='my-training-panel d-flex flex-column' style={{ backgroundColor: 'white' }}>
                                                        <div className='my-training-panel-section-1'>
                                                            <div className='d-flex flex-column' style={{ padding: 24 }}>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 500, fontSize: 22 }}>

                                                                    <div style={{ width: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>

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
                                                                    <div>Started at {startTime}</div>
                                                                    <div>{remainingTime} left</div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-between' style={{ paddingTop: 15, paddingBottom: 0 }}>
                                                                    <div><CustomButton name="stop" width={116} height={32} /></div>
                                                                    <div><CustomButton name="view" width={116} height={32} onClick={handleViewClick}/></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='my-training-panel-section-2'>


                                                            <CustomChart datasetId={'aaa'} lastIter={20} totalStep={parseInt(totalStep)} updateStep={handleUpdateStep} ref={chartRef} />

                                                        </div>
                                                        <div className='my-training-panel-section-3'>


                                                            <div className='d-flex flex-column' style={{ padding: '24px 20px' }}>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 500, fontSize: 22, paddingBottom: 5 }}>
                                                                    <div>Information</div>
                                                                </div>

                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Model type</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Platform</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Dataset count</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Training method</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>

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
                                                                                    (item.train_status.status === 'WAIT') ? <StatusButton name="waiting" /> :
                                                                                        (item.train_status.status === 'failed') ? <StatusButton name="failed" /> :
                                                                                            (item.train_status.status === 'stop') ? <StatusButton name="manual stop" /> :
                                                                                                (item.train_status.status === 'error') ? <StatusButton name="error" /> :
                                                                                                    (item.train_status.status === 'done') ? <StatusButton name="done" /> : <StatusButton name="waiting" />
                                                                            }

                                                                        </div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[4] }}>
                                                                            <ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={handleDeleteTask} onViewTask={handleViewTask}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        </div>




                                                    </div>
                                                </div>

                                        }
                                    </div>
                                    <div className="tab-pane fade" id="history" role="tabpanel" aria-labelledby="history-tab" style={{ backgroundColor: 'red' }}>
                                        <div className='my-tab-container'>

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

                                                            <div className={(index === (taskList.length - 1)) ? `my-tbody-row-${(index % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(index % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid}>

                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[0] }} >{index + 1}</div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                                                    {item.tao_model_name}

                                                                </div>
                                                                <div className='my-tbody-td d-flex flex-row gap-2' style={{ width: historyTableColumnWidth[2] }}>
                                                                    {
                                                                        (item.tao_model_status.train.status) ? <StatusButton name="train-active" style={{cursor:'default !important'}}/> :
                                                                            (item.tao_model_uuid === currentUuid) ? <StatusButton name="training" style={{cursor:'default !important'}}/> :
                                                                                <StatusButton name="train-inactive" style={{cursor:'default !important'}}/>
                                                                    }

                                                                    {
                                                                        (item.tao_model_status.evaluate.status) ?
                                                                            <StatusButton name="evaluate-active" style={{cursor:'none'}}/>
                                                                            :
                                                                            <StatusButton name="evaluate-inactive" onClick={()=>doEvaluate(item.tao_model_uuid)} style={{cursor:'pointer'}}/>

                                                                    }

                                                                    {
                                                                        (item.tao_model_status.inference.status) ?
                                                                            <StatusButton name="inference-active" onClick={()=>doInference(item.tao_model_uuid)} style={{cursor:'pointer'}}/>
                                                                            :
                                                                            <StatusButton name="inference-inactive" onClick={()=>doInference(item.tao_model_uuid)} style={{cursor:'pointer'}}/>

                                                                    }

                                                                </div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                <div className='my-tbody-td d-flex justify-content-end' style={{ width: historyTableColumnWidth[4], padding: '20px' }}><ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={handleDeleteHistory} onViewTask={handleViewTask}/></div>
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


            

            <Modal
                open={showInferenceResultModal}
            >
                <ModalDialog
                    sx={{ minWidth: 1200, maxWidth: 1200, minHeight: 800 }}
                >
                    <div className='container-fluid'>
                        <div className='row'>
                            <div className='col-12 p-0 my-dialog-title d-flex flex-row justify-content-between'>
                                <div>
                                    Inference Result
                                </div>
                                <CustomButton name="download" onClick={handleDownload}/>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12 p-0 my-dialog-content'>
                                <div>
                                    {
                                         resultList.map((item, i) => (
                                            <div key={`resultList_${item.imageUuid}`} >
                                                <ResultCard data={item} onChange={()=>handleLabelToggle(item.imageUuid)}></ResultCard>
                                            </div>
                                        ))
                                    }
                                </div>

                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-12 d-flex justify-content-end' style={{ padding: 0 }}>
                                <div style={{ paddingTop: 20 }} className='d-flex gap-3'>
                                    <CustomButton name="cancel" onClick={() => {
                                        setShowInferenceResultModal(false);
                                    }} />
                                    <CustomButton name="save" />

                                </div>
                            </div>
                        </div>
                        
                       
                    </div>
                </ModalDialog>
            </Modal>
        </>
    );
}

export default TrainPage;