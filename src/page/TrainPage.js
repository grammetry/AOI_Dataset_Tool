
import { useEffect, useState, useRef } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import { extendTheme } from '@mui/joy/styles';
import { AttributeType, PageKeyType, ProjectDataType } from './type';
import { SchedulerHeadContainer, SchedulerHeadWrapper, SchedulerBodyContainer, SchedulerBodyWrapper } from "./pageStyle";
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoTrainStatusWS } from '../APIPath';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';
import WebSocketUtility from '../components/WebSocketUtility.js';
import Stack from '@mui/joy/Stack';
import LinearProgress from '@mui/joy/LinearProgress';
import moment from 'moment';
import { filter, toArray, findIndex } from 'lodash-es';
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

    const { setPageKey, projectData } = props;
    const [noTask, setNoTask] = useState(true);

    const [currentStep, setCurrentStep] = useState(0);
    const [currentProjectName, setCurrentProjectName] = useState('');
    const [currentPercent, setCurrentPercent] = useState(0);
    const [totalStep, setTotalStep] = useState(200);
    const [currentUuid, setCurrentUuid] = useState(null);

    const [table1HeaderNoShadow, setTable1HeaderNoShadow] = useState(true);
    const [table2HeaderNoShadow, setTable2HeaderNoShadow] = useState(true);

    const currentTableColumnWidth = [100, 470, 180, 220, 150];
    const historyTableColumnWidth = [100, 400, 400, 150, 150];

    const [remainingTime, setRemainingTime] = useState('');
    const [startTime, setStartTime] = useState('');

    const [taskList, setTaskList] = useState([]);
    const [historyList, setHistoryList] = useState([]);

    const chartRef = useRef(null);
    const utilityRef = useRef(null);

    const getTrainingList = async () => {

        //utilityRef.current.ShowMessage('test');

        const response = await fetch(taoStartTrainAPI, {
            method: 'GET'
        });

        const myData = await response.json();
        setTaskList(myData);

        if (myData.length === 0) 
            setNoTask(true);
        else
            setNoTask(false);

        myData.map((item, index) => {

            if (item.train_status.status === 'START') {

                setCurrentUuid(item.tao_model_uuid);
                getTrainStatus(item.tao_model_uuid);

            }
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

            const response = await fetch(taoStartTrainAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();
            console.log(data);
            //setTaskList(data);
            getTrainingList();


        }

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


            console.log(message);

            //Training finished successfully.

            if (message.indexOf('Training finished successfully.') >= 0) {
                setCurrentUuid(null);
                getTrainingList();
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



            // if (myData.detail){
            //     console.log(myData.detail);
            // }


        });

        websocket.start();

    }

    useEffect(() => {

        setCurrentPercent(0);
        setCurrentStep(0);
        getTrainingList();
        getHistoryList();

        log('---- project data ----')
        console.log(props.projectData);



    }, []);

    // useEffect(() => {

    //     if (currentUuid !== null) {
    //         getTrainStatus(currentUuid);
    //         setCurrentProjectName(getProjectName(currentUuid));
    //     }

    // }, [currentUuid]);


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
                                                                    <div><CustomButton name="view" width={116} height={32} /></div>
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
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[4] }}><ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={handleDeleteTask} /></div>
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

                                                            <div className={(index === (taskList.length - 1)) ? `my-tbody-row-${(index % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(index % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid} onClick={() => console.log('click')}>

                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[0] }} >{index + 1}</div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                                                    {item.tao_model_name}

                                                                </div>
                                                                <div className='my-tbody-td d-flex flex-row gap-2' style={{ width: historyTableColumnWidth[2] }}>
                                                                    {
                                                                        (item.tao_model_status.train.status) ? <StatusButton name="train-active" /> :
                                                                            (item.tao_model_uuid === currentUuid) ? <StatusButton name="training" /> :
                                                                                <StatusButton name="train-inactive" /> 
                                                                    }
                                                
                                                                    {
                                                                        (item.tao_model_status.evaluate.status) ?
                                                                            <StatusButton name="evaluate-active" />
                                                                            :
                                                                            <StatusButton name="evaluate-inactive" />

                                                                    }

                                                                    {
                                                                        (item.tao_model_status.inference.status) ?
                                                                            <StatusButton name="inference-active" />
                                                                            :
                                                                            <StatusButton name="inference-inactive" />

                                                                    }

                                                                </div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                <div className='my-tbody-td d-flex justify-content-end' style={{ width: historyTableColumnWidth[4], padding: '20px' }}><ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={handleDeleteHistory} /></div>
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