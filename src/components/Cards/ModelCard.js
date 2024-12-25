import React, { useState, useEffect, useRef } from 'react';

import { inferTaskStartAPI, inferTaskStopAPI } from '../../APIPath';


import axios from 'axios';
import log from "../../utils/console";

import CustomButton from '../Buttons/CustomButton';
import ExtendButton from '../Buttons/ExtendButton';
import StatusButton from '../Buttons/StatusButton';
import ToggleButton from '../Buttons/ToggleButton';
import SwitchButton from '../Buttons/SwitchButton';

import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';

import InfoTag from '../Tags/InfoTag';
import MetricTag from '../Tags/MetricTag';

import moment from 'moment';

import Typography from '@mui/joy/Typography';

import { useSelector, useDispatch } from "react-redux";
import Utility from '../../utils/Utility';


const ModelCard = (props) => {

    const { data, index, currentServer, showMessage, getModelList } = props;
    // const [name, setName] = useState("");
    const [status, setStatus] = useState(props.nameStatus);
    const [disabled, setDisabled] = useState(false);


    const init = [];
    const [state, setState] = useState(init);
    const dummyState = useRef(init);
    const toggleRef = useRef(null);

    const infoTagW1 = 120;
    const metricWidth = 150;
    const metricHeight = 60;

    const handleClickEdit = (e) => {


    };

    const handleClickView = (e) => {


    };

    const getToggleDisabled = () => {


    }

    const handleCardClick = (event) => {



    }


    useEffect(() => {

    }, []);





    return (
        <div className="card border-0">
            <div className="card-body my-card-l p-3" >
                <div className="row p-1 gy-0">
                    <div className="col-12 roboto-h4 mb-2 d-flex flex-row justify-content-start gap-2">
                        <div className='my-number-circle'>
                            {index + 1}
                        </div>
                        <div className='d-flex flex-column'>
                            <div style={{fontSize:20}}>{data.inference_model_name}</div>
                            <Typography
                                aria-hidden="true"
                                sx={{ display: 'block', fontSize: 'sm', color: 'neutral.500' }}
                            >
                                <code inset='gutter'>model_uuid:{data.inference_model_uuid}</code>
                            </Typography>
                        </div>
                    </div>
                </div>
                <div className="col-12 mb-2">
                    <div className="card border-0">
                        <div className="card-body  my-card-m">
                            <div className="row p-1">
                                <div className="col-12 d-flex flex-column gap-1">
                                    <div style={{ color: '#697A8D' }}>Support Panel</div>
                                    <div className='my-tag-container' >
                                        {
                                            data.inference_model_panel_info.map((panel, index) => {
                                                return (
                                                    <div className='my-tag-item' key={`card_item_${index}`}>
                                                        <div key={'support_panel' + index} style={{ 'whiteSpace': 'nowrap',padding:'5px 10px' }} className='my-tag-1'>
                                                            {panel}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>

                                    {/* <div className='d-flex flex-row gap-2' >
                                        {
                                            data.inference_model_panel_info.map((panel, index) => {
                                                return (
                                                    <div key={'support_panel' + index} style={{ 'whiteSpace': 'nowrap' }} className='my-tag-1'>
                                                        {panel}
                                                    </div>
                                                )
                                            })
                                        }
                                    </div> */}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


                <div className="col-12 mb-2">
                    <div className="card border-0">
                        <div className="card-body  my-card-m p-2">
                            <div className="row p-1">
                                <div className="col-12 d-flex flex-column gap-2">
                                    <div style={{ color: '#697A8D' }}>Model Metrics</div>
                                    <div className='d-flex flex-row gap-2'>
                                        <MetricTag width={metricWidth} height={metricHeight}  label="acc_estimate" value={Math.round(data.acc_estimate * 100000000) / 100000000} color='#28A745' />
                                        <MetricTag width={metricWidth} height={metricHeight}  label="fpr_estimate" value={Math.round(data.fpr_estimate * 100000000) / 100000000} color='#28A745' />
                                    </div>
                                    <div className='d-flex flex-row gap-2'>
                                        <MetricTag width={metricWidth} height={metricHeight}  label="train_loss" value={Math.round(data.train_loss * 100000000) / 100000000} color='#007BFF' />
                                        <MetricTag width={metricWidth} height={metricHeight}  label="train_acc" value={Math.round(data.train_acc * 100000000) / 100000000} color='#007BFF' />
                                        <MetricTag width={metricWidth} height={metricHeight}  label="train_fpr" value={Math.round(data.train_fpr * 100000000) / 100000000} color='#007BFF' />
                                    </div>
                                    <div className='d-flex flex-row gap-2'>
                                        <MetricTag width={metricWidth} height={metricHeight}  label="val_loss" value={Math.round(data.val_loss * 100000000) / 100000000} color='#FFC107' />
                                        <MetricTag width={metricWidth} height={metricHeight}  label="val_acc" value={Math.round(data.val_acc * 100000000) / 100000000} color='#FFC107' />
                                        <MetricTag width={metricWidth} height={metricHeight}  label="val_fpr" value={Math.round(data.val_fpr * 100000000) / 100000000} color='#FFC107' />
                                    </div>
                                    
                                   
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


                <div className="col-12 mt-1 d-flex justify-content-between">
                    <div className='d-flex flex-row gap-2'>
                        <CustomButton onClick={() => props.onDeleteModel(data.inference_model_uuid)} status={data.status} name="view" text="Delete" width={100} />
                         
                    </div>


                    <div style={{ height: 32, paddingTop: 10, color: '#697A8D' }} className='d-flex align-items-bottom'>
                        Create Time : {moment.unix(Math.round(data.create_time)).format('YYYY-MM-DD HH:mm:ss')}
                    </div>

                </div>
            </div>
        </div >

    );
};



export default ModelCard;