import React, { useState, useEffect, useRef } from 'react';

import { inferTaskStartAPI, inferTaskStopAPI, inferTaskAPI } from '../../APIPath';


import axios from 'axios';
import log from "../../utils/console";

import CustomButton from '../Buttons/CustomButton';
import ExtendButton from '../Buttons/ExtendButton';
import StatusButton from '../Buttons/StatusButton';
import ToggleButton from '../Buttons/ToggleButton';
import SwitchButton from '../Buttons/SwitchButton';
import CustomTooltip from '../Tooltips/CustomTooltip';
import ClientServerChart from '../Charts/ClientServerChart';

import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import moment from 'moment';
import Typography from '@mui/joy/Typography';

import { useSelector, useDispatch } from "react-redux";
import Utility from '../../utils/Utility';
import { set } from 'lodash';

import { faChevronUp, faChevronDown,faLayerGroup,faCube, faBarcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const TaskCard = (props) => {

    const { data, index, currentServer, showMessage, getTaskList, onCheckTasks } = props;
    // const [name, setName] = useState("");
    const [status, setStatus] = useState(props.nameStatus);
    const [disabled, setDisabled] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({});
    const [showChart, setShowChart] = useState(false);

    const STREAM_SERVER = process.env.REACT_APP_STREAM_SERVER;

    const init = [];
    const [state, setState] = useState(init);
    const dummyState = useRef(init);
    const toggleRef = useRef(null);

    const handleTaskReset = async () => {

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
                body: JSON.stringify({ task_uuid: data.task_uuid })
            });

            const resJson = await res.json();

            if (resJson.detail) {
                showMessage('Something wrong');
                return;
            }


            showMessage(`Reset model success`);
        } catch (error) {
            //console.log(error)
            if (error.message)
                showMessage(error.message);

        }
    }

    const handleTaskAction = async (myValue) => {

        try {

            let myUrl = '';
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl = `http://${currentServer}`;
            } else {
                // production mode
                myUrl = `http://${window.location.host}`;
            }

            if (myValue) {
                myUrl = myUrl + inferTaskStartAPI;
            } else {
                myUrl = myUrl + inferTaskStopAPI;
            }

            const res = await fetch(myUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${currentServer}`,
                },
                body: JSON.stringify({ task_uuid: data.task_uuid })
            });


            const resJson = await res.json();

            if (resJson.detail) {
                showMessage(`Task [${data.task_uuid}] ${(myValue) ? 'start' : 'stop'} failed`);
                return;
            }

            showMessage(`Task [${data.task_uuid}] ${(myValue) ? 'start' : 'stop'} successfully`);
        } catch (error) {
            //console.log(error)
            if (error.message)
                showMessage(error.message);

        }
    }

    const tryError = async () => {  
        
        props.taskList.forEach(element => {
            console.log(element.task_uuid)

            const myId=element.task_uuid;
            const myValue=true;
            try {

                let myUrl = '';
                if (process.env.REACT_APP_API_URL !== '') {
                    // dev mode
                    myUrl = `http://${currentServer}`;
                } else {
                    // production mode
                    myUrl = `http://${window.location.host}`;
                }
    
                if (myValue) {
                    myUrl = myUrl + inferTaskStartAPI;
                } else {
                    myUrl = myUrl + inferTaskStopAPI;
                }
    
                fetch(myUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-IP-Host': `${currentServer}`,
                    },
                    body: JSON.stringify({ task_uuid: myId })
                }) .then((response) => {
                    // 這裡會得到一個 ReadableStream 的物件
                    console.log(response);
                    // 可以透過 blob(), json(), text() 轉成可用的資訊
                    return response.json();
                  }).then((jsonData) => {
                    console.log(jsonData);
                  }).catch((err) => {
                    console.log('錯誤:', err);
                  });
    
    
                //const resJson = res.json();
    
                // if (resJson.detail) {
                //     showMessage(`Task [${data.task_uuid}] ${(myValue) ? 'start' : 'stop'} failed`);
                //     return;
                // }
    
                // showMessage(`Task [${data.task_uuid}] ${(myValue) ? 'start' : 'stop'} successfully`);
            } catch (error) {
                //console.log(error)
                if (error.message)
                    showMessage(error.message);
    
            }
        });
    }


    const handleToggleChange = async (myValue) => {

        console.log('toggle change', myValue);
        console.log('data status')
        console.log(data.status);

        if (data.status === 'error') {
            showMessage(`Task [${data.task_uuid}] is error, try reset it`);
            await handleTaskReset();
            await handleTaskAction(myValue);
            getTaskList(currentServer);
            return;
        }

        if (myValue) {
            if (data.status === 'running') {
                showMessage(`Task [${data.task_uuid}] is already running`);
                toggleRef.current.setValue(true);
                return;
            }

            if (data.status === 'stopping') {
                showMessage(`Task [${data.task_uuid}] is stopping, please wait`);
                toggleRef.current.setValue(false);
                return;
            }
        }
        if (!myValue) {
            if (data.status === 'stop') {
                showMessage(`Task [${data.task_uuid}] is already stop`);
                toggleRef.current.setValue(false);
                return;
            }
            if (data.status === 'preparing') {
                showMessage(`Task [${data.task_uuid}] is preparing, please wait`);
                toggleRef.current.setValue(true);
                return;
            }

        }

        const preCheck = onCheckTasks();

        if (!preCheck) {
            showMessage('Some task is preparing or stopping, please try again later');
            toggleRef.current.setValue(!myValue);
            return;
        }
        console.log('preCheck', preCheck);
        await handleTaskAction(myValue);
        getTaskList(currentServer);

    }


    useEffect(() => {

        setUpdateStatus(data.updateStatus);

    }, [data.updateStatus]);





    return (
        <div className="card border-0">
            <div className="card-body my-card-l p-3">
                <div className="row p-1 gy-0">
                    <div className="col-12 roboto-h4 mb-2 d-flex flex-row justify-content-between gap-2">
                        <div className='d-flex flex-row justify-content-start gap-2'>
                            <div className='my-number-circle'>
                                {index + 1}
                            </div>
                            <div className='d-flex flex-column'>
                                <div style={{ fontSize: 20 }}>{data.name}</div>
                                <Typography
                                    aria-hidden="true"
                                    sx={{ display: 'block', fontSize: 'sm', color: 'neutral.500' }}
                                >
                                    <code inset='gutter'> task_uuid:{data.task_uuid}</code>
                                </Typography>


                            </div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', width: 38, height: 38, borderRadius: 5, padding: 3, cursor: 'pointer' }}
                            onClick={() => setShowChart(!showChart)}
                            className='d-flex align-items-center justify-content-center mr-2'>
                            {
                                (showChart) ?
                                    <FontAwesomeIcon icon={faChevronUp} color="gray" size="2x" />
                                    :
                                    <FontAwesomeIcon icon={faChevronDown} color="gray" size="2x" />
                            }

                        </div>


                    </div>
                    <div className="col-12 mb-2">
                        <div className="card border-0">
                            <div className="card-body my-card-m p-2">
                                <div className="row p-1">
                                    <div className="col-12 d-flex flex-column gap-2">
                                        <div style={{ color: '#697A8D' }}>Task Info</div>
                                        <div className="d-flex flex-column gap-1">

                                            <div className='my-tag-container' >
                                                {
                                                    Object.keys(data.infer_panel).map((panel, index) => {
                                                        return (
                                                            <div className='my-tag-item' key={`support_panel_container_${index}`}>
                                                                <div key={'support_panel' + index} className={(data.infer_panel[panel]) ? 'my-tag-pass' : 'my-tag-close'} style={{ 'whiteSpace': 'nowrap', padding: '5px 10px' }}>
                                                                    {panel}
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                           

                                            <div className='d-flex flex-row gap-4 mt-2'>
                                                
                                                <div className='d-flex flex-row gap-2 align-items-center'>
                                                    <div className="my-info-icon-container">
                                                        <FontAwesomeIcon icon={faLayerGroup} className="my-info-icon"/>
                                                    </div>
                                                    <div className='d-flex flex-column gap-0'>
                                                        <CustomTooltip title="Model Platform">
                                                        <div className='my-info-line1' >{data.inference_model_platform}</div>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>

                                                <div className='d-flex flex-row gap-2 align-items-center'>
                                                    <div className="my-info-icon-container">
                                                        <FontAwesomeIcon icon={faCube} className="my-info-icon"/>
                                                    </div>
                                                    <div className='d-flex flex-column gap-0'>
                                                        <CustomTooltip title="Model Type">
                                                        <div className='my-info-line1' >{data.inference_model_type}</div>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>

                                                <div className='d-flex flex-row gap-2 align-items-center'>
                                                    <div className="my-info-icon-container">
                                                        <FontAwesomeIcon icon={faBarcode} className="my-info-icon"/>
                                                    </div>
                                                    <div className='d-flex flex-column gap-0'>
                                                        <CustomTooltip title="Model UUID">
                                                        <div className='my-info-line1' >{data.inference_model}</div>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    {
                        showChart &&
                        <div className="col-12 mb-2">
                            <div className="card border-0">
                                <div className="card-body  my-card-m p-2">
                                    <div className="row p-1">
                                        <div className="col-12 d-flex flex-column gap-2" style={{ paddingBottom: 20 }}>
                                            <div style={{ color: '#697A8D' }}>Container Chart</div>
                                            <ClientServerChart data={data} updateStatus={updateStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <div className="col-12 mb-3 mt-1">
                        <div className="card border-0">
                            <div className="card-body my-card-s p-1 align-items-center">
                                <div className="d-flex flex-row justify-content-between align-items-center gap-1">
                                    <div className="d-flex flex-row gap-2 align-items-center" style={{ paddingTop: '7px', paddingLeft: '8px' }} >
                                        <div className="my-card-status roboto-b2" style={{ paddingTop: '2px', color: '#697A8D' }}>
                                            Status
                                        </div>
                                        <div>
                                            <StatusButton name="task-status" title={data.status} className="mb-2" />

                                        </div>
                                    </div>
                                    <div style={{ paddingTop: '0px', paddingRight: '5px' }}>
                                        <SwitchButton onChange={handleToggleChange}
                                            status={data.switch ? 'run' : 'stop'} ref={toggleRef}
                                            left={-40}
                                            top={-5}
                                            id={'toggle_' + data.task_uuid}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-1 d-flex justify-content-between">
                        <div className='d-flex flex-row gap-2'>

                            <CustomButton onClick={() => props.onDeleteTask(data.task_uuid)} status={data.status} name="view" text="Delete" width={100} />

                            {/*                                                          
                            <CustomButton onClick={() => props.onResetTask(data.task_uuid)} status={data.status} name="view" text="Reset" width={100} />
                             */}

                            {/* <CustomButton onClick={() => tryError()} status={data.status} name="view" text="Try Error" width={100} /> */}
                        </div>


                        <div style={{ height: 32, paddingTop: 10, color: '#697A8D' }} className='d-flex align-items-bottom'>
                            Create Time : {moment.unix(Math.round(data.create_time / 1000000)).format('YYYY-MM-DD HH:mm:ss')}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};



export default TaskCard;