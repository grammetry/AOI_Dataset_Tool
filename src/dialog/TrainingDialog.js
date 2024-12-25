
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';
import moment from 'moment';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Button from '@mui/joy/Button';
import axios, { isCancel, AxiosError } from 'axios';
import { saveAs } from "file-saver";

import { CssVarsProvider } from '@mui/joy/styles';

import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';

import CustomButton from '../components/Buttons/CustomButton';
import CustomInput from '../components/Inputs/CustomInput';
import ServerSelector from '../components/Dropdowns/ServerSelector';

import Utility, { UtilityRef } from '../utils/Utility';
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoUploadYamlAPI, genZipDatasetAPI, taoPreTrainModelAPI, taoStartTrainSettingAPI } from '../APIPath';
import { includes, uniqBy, map, uniq, set, sortBy, find, mapValues, assign, update } from 'lodash-es';


const TrainingDialog = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [method, setMethod] = useState('QuickTrain');
    const [taoModelName, setTaoModelName] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');

    const [pretrainModelData, setPretrainModelData] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [modelList, setModelList] = useState([]);
    const [categorySelected, setCategorySelected] = useState(null);
    const [modelSelected, setModelSelected] = useState(null);
    const [parameterList, setParameterList] = useState([]);

    const selectFileRef = useRef(null);
    const inputFileNameRef = useRef(null);
    const taoModelNameRef = useRef(null);
    const utilityRef = useRef(null);
    const categoryRef = useRef(null);
    const modelRef = useRef(null);

    useImperativeHandle(ref, () => ({

        SetOpen: () => {
            setShow(true);
        },


    }));

    const getPreTrainModel = async () => {
        try {

            const response = await fetch(taoPreTrainModelAPI, {
                method: 'GET'
            });
            const data = await response.json();

            console.log(`--- pre train data model ---`)
            console.log(data)

            setPretrainModelData(data);

            const myCategoryArr = uniq(map(data, 'category'));

            let myCategoryList = [];
            myCategoryArr.map((myCategory) => {
                myCategoryList.push({ value: myCategory, label: myCategory })
            });
            
            setCategoryList(myCategoryList);

            // if (myCategoryList.length > 0) {
            //     setModelList(data.filter((myData) => myData.category === myCategoryList[0].value).map((myData) => { return { value: myData.uuid, label: myData.name } }));
            // }


        } catch (error) {

            utilityRef.current.showMessage('Get pretrain model list : ' + error.message);

        }
    }

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

    const getModelList = (myCategory) => {
        const myModelList = pretrainModelData.filter((myData) => myData.category === myCategory.value).map((myData) => { return { value: `${myData.name}:${myData.version}`, label: `${myData.name} ( ${myData.version} )` } });
        const mySortModelList = sortBy(myModelList, ['value']);
        setModelList(mySortModelList);

    }

    const handleCategoryChange = (myCategory) => {
        console.log(myCategory)
        setParameterList([]);
        if (categorySelected === null) {
            setCategorySelected(myCategory);
            modelRef.current.setValue(null);
            getModelList(myCategory);
        }
        else if (myCategory.value !== categorySelected.value) {
            setCategorySelected(myCategory);
            modelRef.current.setValue(null);
            getModelList(myCategory);
        }

    }

    const handleModelChange = (myModel) => {
        console.log(myModel);
        setModelSelected(myModel);

        const myModelName=myModel.value.split(':')[0];
        const myModelVersion=myModel.value.split(':')[1];

        console.log(myModelName)
        console.log(myModelVersion)

        var myResult = pretrainModelData.filter(o => o.name === myModelName && o.version === myModelVersion);

        if (myResult.length===0){
          
            utilityRef.current.showMessage('Model not found!');
            return;
        }

       

        const myParameter=myResult[0].tunable_hyperparams;

        console.log(myParameter)

        const myParArr=[];
        for (const [key, value] of Object.entries(myParameter)) {
            console.log(`Key: ${key}, Value: ${value}`);
            const myPar={};
            myPar.key=key;
            myPar.value=value[0];
            myPar.name=value[1];
            myPar.ref=createRef();
            myParArr.push(myPar);
        }

        setParameterList(myParArr);

        console.log('--------myParArr-------')
        console.log(myParArr)

       // const myModelList = pretrainModelData.filter((myData) => myData.category === myCategory.value).map((myData) => { return { value: `${myData.name}:${myData.version}`, label: `${myData.name} ( ${myData.version} )` } });
        
    }

    const handleFileChange = (e) => {

        if (e.target.files) {

            const fileName = e.target.files[0].name;

            const fileExtension = fileName.toString().split('.').pop().toLowerCase();

            const supportType = ['zip'];

            if (includes(supportType, fileExtension)) {
                inputFileNameRef.current.setInputValue(fileName)
                setUploadProgress('');
            } else {
                e.target.files = null;
                utilityRef.current?.showMessage(`File type not support! Support Type : [${supportType.join(', ')}]`);
            }
        }

    }

    const handleTaoModelNameChange = (myName) => {
        setTaoModelName(myName);
    }

    const handleAdvanceTrain = async (myTaoModelId) => {

        //console.log(parameterList)

        let myParameterSet = {};
        parameterList.forEach(function (value, index, array) {
            myParameterSet[value.key] = value.value;
        });

        console.log('--- myParameterSet ---');
        console.log(myParameterSet);

        const res = await fetch(taoStartTrainSettingAPI, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tao_model_uuid: myTaoModelId, tunable_hyperparams: myParameterSet }),
        });

        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current?.showErrorMessage(resJson.detail);
            return false;
        }else{
            return true;
        }

    }

    const updateParameter=(myKey,myValue)=>{

        const updateParameterList = map(parameterList, (element) =>
            element.key === myKey ? { ...element, value: myValue } : element
        );

        setParameterList(updateParameterList);

    }   

    const isFloat = (n) => {
        const er = /^[-+]?[0-9]+\.[0-9]+$/;
        return er.test(n);
    }

    const isInteger = (n) => {
        var er = /^-?[0-9]+$/;
        return er.test(n);
    }

    const handleTrainingTask = async () => {
        console.log('start training...')

        let myPass = true;
        if (props.currentProject.export_uuid === '') {
            utilityRef.current?.showMessage('Export uuid is empty!');
            myPass = false;
        }

        if (taoModelName === '') {
            utilityRef.current?.showMessage('Tao model name is empty!');
            taoModelNameRef.current.setWarnning(true);
            myPass = false;
        }

        if (method === 'AdvanceTrain') {

            if (categorySelected === null) {
                utilityRef.current?.showMessage('Please select model category!');
                return;
            }

            if (modelSelected === null) {
                utilityRef.current?.showMessage('Please select pretrained model!');
                return;
            }

            const parameter_margin = find(parameterList, {key:'margin'});
            if (parameter_margin){
                if (!isFloat(parameter_margin.value) && !isInteger(parameter_margin.value)) {
                    utilityRef.current?.showMessage('Margin is not a float!');
                    parameter_margin.ref.current.setWarnning(true);
                    myPass = false;
                }else{
                    updateParameter('margin',parseFloat(parameter_margin.value));
                }
                if (parseFloat(parameter_margin.value) <= 0) {
                    utilityRef.current?.showMessage('Margin must be greater than 0!');
                    parameter_margin.ref.current.setWarnning(true);
                    myPass = false;
                }
                
            }

            const parameter_batch_size = find(parameterList, {key:'batch_size'});
            if (parameter_batch_size){
                if (!isInteger(parameter_batch_size.value)) {
                    utilityRef.current?.showMessage('Batch size is not a integer!');
                    parameter_batch_size.ref.current.setWarnning(true);
                    myPass = false;
                }else{
                    updateParameter('batch_size',parseInt(parameter_batch_size.value));
                }
                if (parseInt(parameter_batch_size.value) < 2) {
                    utilityRef.current?.showMessage('Batch size must be greater than 1!');
                    parameter_batch_size.ref.current.setWarnning(true);
                    myPass = false;
                }
                
            }

            const parameter_fpratio_sampling= find(parameterList, {key:'fpratio_sampling'});
            if (parameter_fpratio_sampling){
                if (!isFloat(parameter_fpratio_sampling.value) && !isInteger(parameter_fpratio_sampling.value)) {
                    utilityRef.current?.showMessage('Fpratio sampling is not a float!');
                    parameter_fpratio_sampling.ref.current.setWarnning(true);
                    myPass = false;
                }else{
                    updateParameter('fpratio_sampling',parseFloat(parameter_fpratio_sampling.value));
                }
                if (parseFloat(parameter_fpratio_sampling.value) <= 0) {
                    utilityRef.current?.showMessage('Fpratio sampling must be greater than 0!');
                    parameter_fpratio_sampling.ref.current.setWarnning(true);
                    myPass = false;
                }
                
            }

            const parameter_lr= find(parameterList, {key:'lr'});
            if (parameter_lr){
                if (!isFloat(parameter_lr.value) && !isInteger(parameter_lr.value)) {
                    utilityRef.current?.showMessage('Learning rate is not a float!');
                    parameter_lr.ref.current.setWarnning(true);
                    myPass = false;
                }else{
                    updateParameter('lr',parseFloat(parameter_lr.value));
                }
                if (parseFloat(parameter_lr.value) <= 0) {
                    utilityRef.current?.showMessage('Learning rate must be greater than 0!');
                    parameter_lr.ref.current.setWarnning(true);
                    myPass = false;
                }
                
            }

            //num_epochs
            const parameter_num_epochs= find(parameterList, {key:'num_epochs'});
            if (parameter_num_epochs){
                if (!isInteger(parameter_num_epochs.value)) {
                    utilityRef.current?.showMessage('Number of epochs is not a integer!');
                    parameter_num_epochs.ref.current.setWarnning(true);
                    myPass = false;
                }else{
                    updateParameter('num_epochs',parseInt(parameter_num_epochs.value));
                }
                if (parseInt(parameter_num_epochs.value) <= 0) {
                    utilityRef.current?.showMessage('Number of epochs must be greater than 0!');
                    parameter_num_epochs.ref.current.setWarnning(true);
                    myPass = false;
                }
                
            }

            //checkpoint_interval
            const parameter_checkpoint_interval= find(parameterList, {key:'checkpoint_interval'});
            if (parameter_checkpoint_interval){
                if (!isInteger(parameter_checkpoint_interval.value)) {
                    utilityRef.current?.showMessage('Check point interval is not a integer!');
                    parameter_checkpoint_interval.ref.current.setWarnning(true);
                    myPass = false;
                }
                else{
                    updateParameter('checkpoint_interval',parseInt(parameter_checkpoint_interval.value));
                }
                if (parseInt(parameter_checkpoint_interval.value) <= 0) {
                    utilityRef.current?.showMessage('Check point interval be greater than 0!');
                    parameter_checkpoint_interval.ref.current.setWarnning(true);
                    myPass = false;
                }
                if (parseInt(parameter_checkpoint_interval.value) > parseInt(parameter_num_epochs.value)) {
                    utilityRef.current?.showMessage('Check point interval must be not greater than number of epochs!');
                    parameter_checkpoint_interval.ref.current.setWarnning(true);
                    myPass = false;
                } 
            }

            //cls_weight
            const parameter_cls_weight= find(parameterList, {key:'cls_weight'});
            if (parameter_cls_weight){
                if (!isInteger(parameter_cls_weight.value)) {
                    utilityRef.current?.showMessage('Defective weight is not a integer!');
                    parameter_cls_weight.ref.current.setWarnning(true);
                    myPass = false;
                }
                else{
                    updateParameter('cls_weight',parseInt(parameter_cls_weight.value));
                }
                if ((parseInt(parameter_cls_weight.value) < 1)||(parseInt(parameter_cls_weight.value) > 50)) {
                    utilityRef.current?.showMessage('Defective weight range must between from 1 to 50!');
                    parameter_cls_weight.ref.current.setWarnning(true);
                    myPass = false;
                }  
            }
        }

        console.log(`--- pass=${myPass} ---`)
        console.log(parameterList)

        if (!myPass) {
            return;
        }

        //utilityRef.current.setLoading(true);
        setShowLoading(true);

        const exportUuid = props.currentProject.export_uuid;

        try {
           
            //--- Step 1 : set gen zip dataset
            let myModelName='Siamese';
            let myModelVersion='tao-5.0.0';

            if (method === 'AdvanceTrain') {
                myModelName=modelSelected.value.split(':')[0];
                myModelVersion=modelSelected.value.split(':')[1];
            }
    
            const myBody1={
                export_uuid:exportUuid,
                tao_model_name:taoModelName,
                pretrained_name:myModelName,
                pretrained_version:myModelVersion,
            }

            console.log(myBody1)

            const res1 = await fetch(genZipDatasetAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myBody1),
            });

            const resJson1 = await res1.json();

            if (resJson1.detail) {
                utilityRef.current?.showErrorMessage(resJson1.detail);
                return;
            }

            console.log(resJson1)
            if (!resJson1.tao_model_uuid) {
                utilityRef.current?.showErrorMessage('tao_model_uuid is null');
                return;
            }

             //--- Step 2 : advace setting parameter
            if (method === 'AdvanceTrain') {
                const myParameterSetting=await handleAdvanceTrain(resJson1.tao_model_uuid);
                if (!myParameterSetting){
                    return;
                }
            }

            //--- Step 3 : set task started
            const res3 = await fetch(taoStartTrainAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({tao_model_uuid: resJson1.tao_model_uuid}),
            })

            const data3 = await res3.json();

            if (data3.detail) {
                setShowLoading(false);
                utilityRef.current?.showErrorMessage(data3.detail);
                return;
            } else {
                //utilityRef.current?.showMessage(`Start train task success, turn to Train Page`);
                setTimeout(() => {

                    utilityRef.current.setCurrentTab('current');
                    //utilityRef.current.setLoading(false);
                    setShowLoading(false);
                    props.setPageKey('TrainPage');
                }, 3000);
            }

        } catch (error) {
            //utilityRef.current.setLoading(false);
            setShowLoading(false);
            if (error.message) {
                utilityRef.current.showMessage(error.message);
            }
        } finally {
            //utilityRef.current.setLoading(false);
            //setShowLoading(false);
        }
    };

    const handleClose = async () => {

        setParameterList([]);
        setCategorySelected(null);
        setModelSelected(null);
        setShow(false);

    }

    const handleTrainingTask_xx = async () => {
    
        let myCheck = true;
     

        if (!myCheck) {
            return;
        }

        utilityRef.current.setLoading(true);

        const exportUuid = props.currentProject.export_uuid;

        console.log(exportUuid)

        try {

            //--- Step 1 : set gen zip dataset

            const res = await fetch(genZipDatasetAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ export_uuid: exportUuid, tao_model_name: taoModelName }),
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current?.showErrorMessage(resJson.detail);
                return;
            }

            console.log(resJson)

            const tao_model_uuid = resJson.tao_model_uuid;

            if (!resJson.tao_model_uuid) {
                utilityRef.current?.showErrorMessage('tao_model_uuid is null');
                return;
            }

            //--- Step 2 : advace upload yaml

            //await handleAdvanceTrain(resJson.tao_model_uuid);

            if (method === 'AdvanceTrain') {
                await handleAdvanceTrain(resJson.tao_model_uuid);
            }


            //--- Step 3 : set task started

            const myData3 = {
                tao_model_uuid: resJson.tao_model_uuid
            };

            const res3 = await fetch(taoStartTrainAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData3),
            })

            const data3 = await res3.json();

            if (data3.detail) {
                utilityRef.current?.showErrorMessage(data3.detail);
                return;
            } else {
                //utilityRef.current?.showMessage(`Start train task success, turn to Train Page`);
                setTimeout(() => {

                    utilityRef.current.setCurrentTab('current');
                    utilityRef.current.setLoading(false);
                    props.setPageKey('TrainPage');
                }, 3000);
            }

        } catch (error) {
            utilityRef.current.setLoading(false);
            if (error.message) {
                utilityRef.current.showMessage(error.message);
            }
        } finally {

        }

    }



    useEffect(() => {


        if ((show) && (props.currentProject.project_name !== '')) {

            setTaoModelName(`${props.currentProject.project_name}_${moment().format('YYYYMMDDHHmmss')}`);

            getPreTrainModel();

        }

        setUploadProgress('');

    }, [show]);

    return (
        <>
            <Utility ref={utilityRef} />
            <ThemeProvider theme={theme}>

                <Modal open={show}>
                    <ModalDialog style={{ width: 800, height: 600, borderRadius: 12,position:'relative' }} layout='center'>

                    
                    { showLoading &&
                    <div className="dialog-container justify-content-center align-items-center" style={{position:'absolute',top:0,left:0,width:800,height:600,borderRadius:12,zIndex:10,backgroundColor:'white'}}>
                        <div className="dialog-content mt-1" style={{paddingTop:155}}>
                            <CssVarsProvider>
                                <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={8}>
                                    <Stack spacing={2}>
                                        <CircularProgress size="lg" color='danger' variant="solid"
                                            sx={{
                                                "--CircularProgress-size": "150px",
                                                "--CircularProgress-trackThickness": "15px",
                                                "--CircularProgress-progressThickness": "15px",
                                                "--CircularProgress-trackColor": "#ed1b2333",
                                                "--CircularProgress-progressColor": "#ed1b23",
                                            
                                            
                                            }}
                                        >
                                            <Typography  level="h4">Processing</Typography>
                                        </CircularProgress>
                                    </Stack>
                                </Stack>
                            </CssVarsProvider>
                        </div>
                    </div>
                    }


                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>

                            <div className='container-fluid'>

                                <div className='row'>
                                    <div className='col-md-12 mt-1'>
                                        <ToggleButtonGroup
                                            size="lg"
                                            value={method}
                                            onChange={(event, newValue) => {
                                                setMethod(newValue);
                                            }}
                                            color='danger'
                                            sx={{ '--ButtonGroup-separatorColor': '#ff000033' }}
                                        >
                                            <Button value="QuickTrain" sx={{ width: '50%' }} color='danger'>Quick Train</Button>
                                            <Button value="AdvanceTrain" sx={{ width: '50%' }}>Advance Train</Button>
                                        </ToggleButtonGroup>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3'>
                                        <div className='my-input-title roboto-b2 py-1'>
                                            Tao Model Name
                                        </div>
                                        <div>
                                            <CustomInput defaultValue={taoModelName} onChange={handleTaoModelNameChange} width="100%" height="48" placeholder="" ref={taoModelNameRef}></CustomInput>
                                        </div>

                                    </div>
                                </div>




                                {
                                    (method === 'AdvanceTrain') ?
                                        <>


                                            <div className='row'>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title roboto-b2 py-1'>
                                                        Model Category
                                                    </div>
                                                    <div>
                                                        <ServerSelector width="100%" height="48" options={categoryList} onChange={handleCategoryChange} ref={categoryRef} />
                                                    </div>

                                                </div>
                                                <div className='col-md-8 mt-3'>
                                                    <div className='my-input-title roboto-b2 py-1'>
                                                        Pretrained Model
                                                    </div>
                                                    <div>
                                                        <ServerSelector width="100%" height="48" options={modelList} onChange={handleModelChange} ref={modelRef} />
                                                    </div>

                                                </div>
                                            </div>

                                            <div className='row'>
                                                {
                                                    parameterList.map((myParameter, index) => {
                                                        return (
                                                            <div className='col-md-4 mt-3' key={index}>
                                                                <div className='my-input-title roboto-b2 py-1'>
                                                                    {myParameter.name}
                                                                </div>
                                                                <div>
                                                                    <CustomInput defaultValue={myParameter.value} width="100%" height="48" disabled={false} 
                                                                        onChange={(myValue) => updateParameter(myParameter.key,myValue)}
                                                                        ref={myParameter.ref}
                                                                    ></CustomInput>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>

                                        </>
                                        :
                                        <></>
                                }



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <input type="file" name="files" onChange={handleFileChange} ref={selectFileRef} style={{ visibility: 'hidden', height: 0 }} accept=".zip" />
                                    <div><CustomButton name="close" width={100} height={32} onClick={handleClose} /></div>
                                    <div><CustomButton name="confirm" width={100} height={32} onClick={handleTrainingTask} /></div>
                                </div>
                            </div>
                        </div>





                    </ModalDialog>
                </Modal>

            </ThemeProvider >
        </>
    );
});

export default TrainingDialog;

