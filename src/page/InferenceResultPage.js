
import { useEffect, useState, useRef } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import { AttributeType, PageKeyType, ProjectDataType } from './type';
import { SchedulerHeadContainer, SchedulerHeadWrapper, SchedulerBodyContainer, SchedulerBodyWrapper } from "./pageStyle";
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoTrainStatusWS, taoEvaluateAPI, taoInferenceAPI, taoExportAPI, taoDownloadAPI } from '../APIPath';

import { postValPassAPI, postValNgAPI } from '../APIPath';
import { theme } from './ProjectPage';
import Hotkeys from 'react-hot-keys';

//postValPassAPI
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';
import FilterPanel from '../components/Panels/FilterPanel';
import ConfirmDialog from '../dialog/ConfirmDialog';


import ResultCardList from '../components/Lists/ResultCardList';
import ResultTableList from '../components/Lists/ResultTableList';


import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, take, slice ,uniqBy} from 'lodash-es';



const InferenceResultPage = (props) => {

    const { setPageKey, projectData, setCurrentProject } = props;

    const [resultList, setResultList] = useState([]);
    const [checkList, setCheckList] = useState([]);
    const [filterList, setFilterList] = useState([]);

    const [compNameList, setCompNameList] = useState([]);
    const [lightSourceList, setLightSourceList] = useState([]);

    const [resultTaoModelId, setResultTaoModelId] = useState('');
    const [resultExportId, setResultExportId] = useState('');

    const [currentPage, setCurrentPage] = useState(1);

    const pageNum = 200;


    const [remainingTime, setRemainingTime] = useState('');
    const [startTime, setStartTime] = useState('');

    const [resultView, setResultView] = useState('card');


    const utilityRef = useRef(null);
    const filterPanelRef = useRef(null);

    const [openConfirmLeaveDialog, setOpenConfirmLeaveDialog] = useState(false);
    const confirmLeaveAttribute = {
        title: 'Confirm leave',
        desc: 'You have unsaved changes.<br/>Are you sure to leave?',
    };

    const handleConfirmLeave = () => {
        setOpenConfirmLeaveDialog(false);
        setPageKey('TrainPage');
    }


    const handleToggleView = (evt) => {

        if (resultView === 'card') { setResultView('table') } else { setResultView('card') };

    }

    const handleDownload_xx = async () => {
        log('handleDownload ' + resultTaoModelId)

        log(moment().format('YYYY-MM-DD HH:mm:ss'));
        //setShowInferenceResultModal(false);

      

    }

    const handleDownload = async () => {
        log('handleDownload ' + resultTaoModelId)
        //setShowInferenceResultModal(false);

        log('--- start time ---')
        log(moment().format('YYYY-MM-DD HH:mm:ss'));

        try {
            log('try export model')

            utilityRef.current.setLoading(true);

            const res = await fetch(taoExportAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "tao_model_uuid": resultTaoModelId }),
            });

            const resJson = await res.json();

            utilityRef.current.setLoading(false);

            if (resJson.detail) {
                const msg = resJson.detail?.[0]?.msg || '';
                const loc = resJson.detail?.[0]?.loc || [];
                utilityRef.current.showMessage(`API error: ${msg} [${loc.join(', ')}]`);
                return;
            }

            window.location.href = `${taoDownloadAPI}?tao_model_uuid=${resultTaoModelId}`;



        } catch (err) {

            console.log(err)
            // const msg = err?.response?.detail?.[0]?.msg || '';
            // const loc = err?.response?.detail?.[0]?.loc || [];
            // console.log(`API error: ${msg} [${loc.join(', ')}]`);

            if (err instanceof Error) {
                utilityRef.current?.showMessage(err.message);
            }

            utilityRef.current.setLoading(false);

        }

        log('--- end time ---')
        log(moment().format('YYYY-MM-DD HH:mm:ss'));

    }

    const handleLabelToggle = (uuid) => {
        log('handleLabelToggle===>', uuid)
        let resultArr = cloneDeep(resultList);
        const myIndex = findIndex(resultArr, function (myItem) { return myItem.imageUuid == uuid });
        if (myIndex >= 0) {
            resultArr[myIndex].label = (resultArr[myIndex].label === 'PASS') ? 'NG' : 'PASS';
            setResultList(resultArr);
        }
    };


    const handleSave = async () => {
        log('handle save')
        log(resultList)
        log(resultTaoModelId)

        try {

            const currentExportId = utilityRef.current.getCurrentExportId();

            const passList = filter(resultList, function (o) { return o.label === 'PASS'; });
            const ngList = filter(resultList, function (o) { return o.label === 'NG'; });
            const passArr = map(passList, 'imageUuid');
            const ngArr = map(ngList, 'imageUuid');

            const myDataPass = {};
            myDataPass.export_uuid = currentExportId;
            myDataPass.image_uuid_list = passArr;

            const myDataNg = {};
            myDataNg.export_uuid = currentExportId;
            myDataNg.image_uuid_list = ngArr;

            utilityRef.current.setLoading(true);

            if (passArr.length > 0) {

                const resPass = await fetch(postValPassAPI, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(myDataPass),
                });

                const resPassJson = await resPass.json();

                if (resPassJson.detail) {
                    const msg = resPassJson.detail?.[0]?.msg || '';
                    const loc = resPassJson.detail?.[0]?.loc || [];
                    utilityRef.current.showMessage(`API error: ${msg} [${loc.join(', ')}]`);
                }

            }

            if (ngArr.length > 0) {

                const resNg = await fetch(postValNgAPI, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(myDataNg),
                });

                const resNgJson = await resNg.json();

                if (resNgJson.detail) {
                    utilityRef.current.showErrorMessage(resNgJson.detail);
                }
            }

            utilityRef.current.setLoading(false);
            utilityRef.current.showMessage(`Save successfully.`);

            setCheckList(resultList);



        } catch (err) {
            console.log(err)

            utilityRef.current.setLoading(false);

        }


    }

    const fetchCSV = async (myTaoModelId) => {

        try {

            const response = await fetch(`${taoInferenceAPI}/result?tao_model_uuid=${myTaoModelId}`, {
                method: 'GET',
            });

            if (response.status === 404) {

                const msg = await response.json();
               
                utilityRef.current.showMessage('API error: ' + msg.detail[0].msg);
                return;
            }


            const data = await response.text();

            console.log('data');
            console.log(data);

            const dataArr = data.split('\n');
            let resultArr = [];
            dataArr.map((item, index) => {


                if (index > 0) {
                    const lineArr = item.split(',');
                    //console.log(lineArr);
                    if (lineArr.length < 3) return;
                    const compName = lineArr[0].substring(0, lineArr[0].indexOf('/'));
                    //log(`compName=${compName}`);
                    const lightSource = lineArr[0].substring(lineArr[0].lastIndexOf('/') + 1, lineArr[0].length);
                    //log(`lightSource=${lightSource}`);
                    const label = lineArr[2];
                    //log(`label=${label}`);
                    const uuidList = lineArr[3].split('_');
                    //console.log(uuidList);
                    const goldenUuid = uuidList[1];
                    //log(`goldenUuid=${goldenUuid}`);
                    const imageUuid = uuidList[2];
                    //log(`imageUuid=${imageUuid}`);
                    const score = lineArr[4];
                    //log(`score=${score}`);

                    let myData = {};
                    myData.compName = compName;
                    myData.lightSource = lightSource;
                    myData.label = label;
                    myData.goldenUuid = goldenUuid;
                    myData.imageUuid = imageUuid;
                    myData.score = parseFloat(score);
                    resultArr.push(myData);
                }
            });


            let resultArrSort = orderBy(resultArr, ['score'], ['desc']);
            resultArrSort.forEach((_, i, a) => a[i].sortIndex = i);

            utilityRef.current.setLoading(false);


            setResultList(resultArrSort);
            setCheckList(resultArrSort);
            setFilterList(resultArrSort);
            setResultTaoModelId(myTaoModelId);



            const myCompNameList = uniqBy(resultArrSort, 'compName');
            const myCompNameArr = map(myCompNameList, 'compName');
            let myCompName = [];
            myCompNameArr.map((item) => {
                myCompName.push({ name: item, checked: true });
            });
            setCompNameList(myCompName);

            console.log(myCompName);


            const myLightSourceList = uniqBy(resultArrSort, 'lightSource');
            const myLightSourceArr = map(myLightSourceList, 'lightSource');
            let myLightSource = [];
            myLightSourceArr.map((item) => {
                myLightSource.push({ name: item, checked: true });
            });
            setLightSourceList(myLightSource);

            console.log(myLightSource);
            //setResultExportId(myExportId);
            //setShowInferenceResultModal(true);

        } catch (err) {
            console.log(err)
            const msg = err?.response?.detail?.[0]?.msg || '';
            const loc = err?.response?.detail?.[0]?.loc || [];
            console.log(`API error: ${msg} [${loc.join(', ')}]`);
            utilityRef.current.setLoading(false);

        }

    }

    const handleKeyDown = (keyName, e) => {

        if (e.code === 'ArrowRight') {
            if (currentPage < Math.ceil(resultList.length / pageNum)) {
                setCurrentPage(currentPage + 1);
            }
        }

        if (e.code === 'ArrowLeft') {
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }

    }

    const handleChange = (myCompNameList, myLightSourceList, myLabelList) => {



        const myCompNameArr = filter(myCompNameList, (item) => item.checked).map((item) => item.name);
        const myLightSourceArr = filter(myLightSourceList, (item) => item.checked).map((item) => item.name);
        const myLabelArr = filter(myLabelList, (item) => item.checked).map((item) => item.name);


        if (myCompNameArr.length === 0 || myLightSourceArr.length === 0 || myLabelArr.length === 0) {
            setFilterList([]);
            return;
        }

        let myFilterArr = cloneDeep(resultList);
        myFilterArr = filter(myFilterArr, (item) => {
            return myCompNameArr.includes(item.compName) && myLightSourceArr.includes(item.lightSource) && myLabelArr.includes(item.label);
        });


        let myFilterArrSort = orderBy(myFilterArr, ['score'], ['desc']);
        myFilterArrSort.forEach((_, i, a) => a[i].sortIndex = i);

        setFilterList(myFilterArrSort);

        setCurrentPage(1);

    }




    useEffect(() => {


        if (utilityRef.current) {
            const taoModelId = utilityRef.current.getCurrentTaoModelId();

            if (taoModelId) {
                fetchCSV(taoModelId);
            };

        }


    }, []);


    return (
        <>
            <Hotkeys
                keyName="Space,Right,Left"
                onKeyDown={handleKeyDown.bind(this)}
                disabled={false}
                allowRepeat={true}
            ></Hotkeys>
            <ThemeProvider theme={theme}>
                <div className="container">

                    <div className="train-page-content">

                        <div className='container-fluid'>
                            <div className='row'>
                                <div className='col-12 p-0 my-dialog-title d-flex flex-row justify-content-between'>
                                    <div>
                                        {utilityRef.current?.getCurrentTaoModelName()}
                                    </div>
                                    <div className='d-flex flex-row gap-2'>
                                        <CustomButton name="view" text="Filter" onClick={() => filterPanelRef.current?.setToggle()} width={100} />
                                        <CustomButton name="view" text={(resultView === 'card') ? "Table view" : "Card view"} onClick={(evt) => handleToggleView(evt)} width={100} />
                                        <CustomButton name="download" onClick={handleDownload}  width={100}/>
                                    </div>

                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-12 p-0 my-dialog-title d-flex flex-row justify-content-between'>
                                    <div>
                                        <FilterPanel compNameList={compNameList} lightSourceList={lightSourceList} onChange={handleChange} ref={filterPanelRef}></FilterPanel>
                                    </div>

                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-12 p-0 my-dialog-content mt-3'>
                                    {
                                        (resultView === 'card') ?
                                            <ResultCardList data={slice(filterList, (currentPage - 1) * pageNum, ((currentPage - 1) * pageNum) + pageNum)} onChange={handleLabelToggle}></ResultCardList>
                                            :
                                            <ResultTableList data={slice(filterList, (currentPage - 1) * pageNum, ((currentPage - 1) * pageNum) + pageNum)} onChange={handleLabelToggle}></ResultTableList>
                                    }


                                </div>
                            </div>



                            <div className='row'>
                                <div className='col-12 d-flex justify-content-between align-items-center' style={{ padding: 10 }}>
                                    <Stack spacing={2}>
                                        <Pagination count={Math.ceil(filterList.length / pageNum)} color="primary" variant="outlined" shape="rounded" page={currentPage} onChange={(e, v) => setCurrentPage(v)} />
                                    </Stack>

                                    <div className='d-flex gap-3'>
                                        <CustomButton name="close" onClick={() => {
                                            //setShowInferenceResultModal(false);
                                            if (isEqual(resultList, checkList)) {
                                                utilityRef.current.setCurrentTab('history');
                                                setPageKey('TrainPage');
                                            } else {
                                                console.log('not equal');
                                                setOpenConfirmLeaveDialog(true);
                                            }

                                        }} width={100}/>
                                        
                                        <CustomButton name="view" text="Save" onClick={handleSave} width={100}/>

                                    </div>
                                </div>
                            </div>


                        </div>


                    </div>
                </div>
            </ThemeProvider >
            <Utility ref={utilityRef} />

            <ConfirmDialog
                openConfirmDialog={openConfirmLeaveDialog}
                setOpenConfirmDialog={setOpenConfirmLeaveDialog}
                handleConfirm={handleConfirmLeave}
                confirmAttribute={confirmLeaveAttribute}
            />
        </>
    );
}

export default InferenceResultPage;