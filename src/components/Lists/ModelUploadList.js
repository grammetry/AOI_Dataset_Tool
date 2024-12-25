// third party imports
import React, { useState, useRef, forwardRef, useEffect, useImperativeHandle } from "react";
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListDivider from '@mui/joy/ListDivider';
import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import axios, { isCancel, AxiosError } from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import AutorenewIcon from '@mui/icons-material/Autorenew';


// local imports
import { inferInferenceAPI, inferUploadAPI } from '../../APIPath';
import log from "../../utils/console";
import Utility, { UtilityRef } from '../../utils/Utility';
import { set } from "lodash";

const ModelUploadList = forwardRef((props, ref) => {

    const { server, uuid, updateStatus } = props;
    const [value, setValue] = useState('');
    const utilityRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressText, setUploadProgressText] = useState('');

    const uploadData = async (myName, myData) => {

        try {

            //step 1 : create workspace

            let myUrl1 = '';
            if (process.env.REACT_APP_API_URL !== '') {
                // dev mode
                myUrl1 = `http://${server.ip}:${server.port}${inferInferenceAPI}`;
            } else {
                // production mode
                myUrl1 = `http://${window.location.host}${inferInferenceAPI}`;
            }

            const res1 = await fetch(myUrl1, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-IP-Host': `${server.ip}:${server.port}`,
                },
                body: JSON.stringify({
                    inference_model_name: myName.replace('.zip', ''),
                })
            });

            const res1Json = await res1.json();

            console.log('res1', res1Json);

            if (res1Json.detail) {
                props.showErrorMessage(res1Json.detail);
            }

            if (res1Json.inference_model_uuid) {

            
                // step 2 : upload file
                const formData = new FormData();
                formData.append('inference_model', myData);
                formData.append('inference_model_uuid', res1Json.inference_model_uuid);

                console.log('fomrData', formData);

                let myUrl2 = '';
                if (process.env.REACT_APP_API_URL !== '') {
                    // dev mode
                    myUrl2 = `http://${server.ip}:${server.port}${inferUploadAPI}`;
                } else {
                    // production mode
                    myUrl2 = `http://${window.location.host}${inferUploadAPI}`;
                }


                const res = await axios.post(myUrl2, formData, {
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total } = progressEvent;

                        //console.log('loaded', loaded ? loaded : 'null');
                        //console.log('total', total ? total : 'null');

                        if (total) {
                            const precentage = Math.floor((loaded * 100) / total);
                            //setUploadProgress(precentage);
                            //setUploadProgressText(`${precentage}% `);
                            props.updateStatus(props.uuid, precentage, `${precentage}%`);
                        }

                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-IP-Host': `${server.ip}:${server.port}`,
                    }
                });

                if (res.status !== 200) {
                    props.updateStatus(props.uuid, 0, `Failed`);
                    props.showErrorMessage(res.statusText);
                    return;
                } else {
                    props.updateStatus(props.uuid, 100, `Success`);
                    props.showMessage(`${server.name} : Upload success!`);
                }

            }

        } catch (error) {

            console.log(error.message);
            setUploadProgressText('Failed');
            props.showMessage(`${server.name} : ${error.message}`);
        }


    }

    useImperativeHandle(ref, () => ({

        setInputValue: (myValue) => {
            setValue(myValue);

        },
        getInputValue: () => {
            return value;
        },
        setUpload: (myName, myData) => {
            log('set upload data')
            uploadData(myName, myData);
        },
        setProgress: (myProgress, myProgressText) => {
            setUploadProgress(myProgress);
            setUploadProgressText(myProgressText);
        }
    }));


    return (
        <>
            
            <ListItem>
                <div className='d-flex flex-column' style={{ width: 160,paddingLeft:10 }}>
                    {server.name}
                    <Typography
                        aria-hidden="true"
                        sx={{ display: 'block', fontSize: 'sm', color: 'neutral.500' }}
                    >
                        <code inset='gutter'>  {server.ip}:{server.port}</code>
                    </Typography>


                </div>
                <Stack spacing={12} sx={{ flex: 1 }}>
                    <LinearProgress determinate value={uploadProgress} size="lg" />
                </Stack>
                <div className='d-flex justify-content-center' style={{ width: 50 }}>
                    {

                        (uploadProgressText === 'Success') ? <CheckCircleIcon sx={{fontSize: 25,color:'green'}} /> :
                            (uploadProgressText === 'Failed') ? <ErrorIcon sx={{fontSize: 25,color:'red'}}/> :
                                (uploadProgressText === '100%')?
                                    <div className='my-rotation-container'>
                                        <div className="my-rotation">
                                            <AutorenewIcon sx={{fontSize: 30,color:'orange'}} />                
                                        </div>
                                    </div>
                                    :uploadProgressText
                                
                    }
                </div>

            </ListItem>

            <ListDivider inset='gutter' />
        </>
    )
});

export default ModelUploadList;