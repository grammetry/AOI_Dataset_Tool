import { Dispatch, FormEventHandler, MouseEventHandler, SetStateAction, useCallback, useEffect, useState, useRef, MouseEvent } from 'react';
import { faCircleExclamation,faBan, faCheck, faTriangleExclamation, faSquareXmark, faSquareCheck, faSquareMinus, faCircle, faCircleMinus, faCircleXmark, faCircleCheck, faCircleInfo, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ThemeProvider } from '@mui/material';
import { cloneDeep, filter, find, remove, keys, set } from 'lodash-es';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import moment from "moment";
import Hotkeys from 'react-hot-keys';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import Utility,{UtilityRef} from '../utils/Utility';




import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import { selectCurrentList, setToggleArea, setClearList, setSelectedList, setSomethingChange, setToggleItem } from '../redux/store/slice/currentSelected';
import { selectCurrentDataset, setPanelDatasetThird } from '../redux/store/slice/currentDataset';

import {
    deleteImgAPI,
    panelDatasetAPI,
    panelDatasetZipAPI,
    postGoldenAPI,
    postTrainNgAPI,
    postTrainPassAPI,
    postValNgAPI,
    postValPassAPI,
} from '../APIPath';
import DivEllipsisWithTooltip from '../components/DivEllipsisWithTooltip';
import DraggableCard from '../components/DraggableCard';
import LoadingOverlay from '../components/LoadingOverlay';
import CustomTab from '../components/Tabs/CustomTab';
import CustomButton from '../components/Buttons/CustomButton';

import ConfirmDialog from '../dialog/ConfirmDialog';
import RatioDialog from '../dialog/RatioDialog';
import TrainingDialog, { TrainingDialogRef } from '../dialog/TrainingDialog';
import HintDialog, { HintDialogRef } from '../dialog/HintDialog';
import AddPicDialog, { AddPicDialogRef } from '../dialog/AddPicDialog';
import WarningDialog from '../dialog/WarningDialog';
import { theme } from './ProjectPage';
import { datasetImgAPI } from '../APIPath';

import {
    AttributeType,
    PageKeyType,
    PanelDatasetPromiseType,
    PanelDatasetType,
    PanelInfoType,
    PassNgType,
    ProjectDataType,
    TrainValType,
} from './type';



const getCheckStatus = (data: Record<string, PanelDatasetType>) => {

    return Object.keys(data)
        .map((item) => data[item].check)
        .reduce((a, b) => a && b);
};

const getCheckStatusNum = (data: Record<string, PanelDatasetType>) => {
    // 1: all checked, 2: all unchekced, 3: mix
    const checkArr = Object.keys(data).map((item) => data[item].check);
    const total = checkArr.length;
    const checkNum = checkArr.filter((item) => item === true).length;
    const uncheckNum = checkArr.filter((item) => item === false).length;

    if (total == checkNum) return 1;
    if (total == uncheckNum) return 2;
    return 3;
};

type SetAttributePagePageProps = {
    currentProject: ProjectDataType;
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    fetchProject: (projectId: string) => void;
};

const SetAttributePage = (props: SetAttributePagePageProps) => {
    const { currentProject, setPageKey, fetchProject } = props;
    //const [somethingChange, setSomethingChange] = useState(false);
    const [tempComp, setTempComp] = useState('');
    const [tempLight, setTempLight] = useState('');
    const [openConfirmLeaveDialog, setOpenConfirmLeaveDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openRatioDialog, setOpenRatioDialog] = useState(false);
    const [openTrainingDialog, setOpenTrainingDialog] = useState(false);
    const [openWarningDialog, setOpenWarningDialog] = useState(false);
    const [panelInfo, setPanelInfo] = useState<PanelInfoType>();
    const [panelDataset, setPanelDataset] = useState<Record<string, Record<string, PanelDatasetType>>>();
    const [panelDatasetSecond, setPanelDatasetSecond] = useState<Record<string, PanelDatasetType>>();
    //const [panelDatasetThird, setPanelDatasetThird] = useState<PanelDatasetType>();
    const [selectComp, setSelectComp] = useState('');
    const [selectLight, setSelectLight] = useState('');
    const [trainPass, setTrainPass] = useState(0);
    const [trainNg, setTrainNg] = useState(0);
    const [valPass, setValPass] = useState(0);
    const [valNg, setValNg] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [hoverItem, sethoverItem] = useState('');
    const [show, setShow] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showAddPic, setShowAddPic] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const dispatch = useDispatch();

    //const utilityRef<UtilityRef></UtilityRef> = useRef(null);

    const utilityRef = useRef<UtilityRef>(null);

    const panelDatasetThird = useSelector(selectCurrentDataset).dataset;
    const selectedList = useSelector(selectCurrentList).list;
    const selectedArea = useSelector(selectCurrentList).area;
    const somethingChange = useSelector(selectCurrentList).somethingChange;

    const trainNum = panelDatasetThird ? panelDatasetThird.train.PASS.length + panelDatasetThird.train.NG.length : 0;
    const valNum = panelDatasetThird ? panelDatasetThird.val.PASS.length + panelDatasetThird.val.NG.length : 0;
    const goldenNum = panelDatasetThird?.train?.GOLDEN ? panelDatasetThird.train.GOLDEN.length : 0;

    const NumPerPage = 100;
    const [trainPassPage, setTrainPassPage] = useState(1);
    const [trainNgPage, setTrainNgPage] = useState(1);
    const [valPassPage, setValPassPage] = useState(1);
    const [valNgPage, setValNgPage] = useState(1);
    const [trainDeletePage, setTrainDeletePage] = useState(1);

    const passPanelRef = useRef<HTMLInputElement>(null);
    const trainingDialogRef = useRef<TrainingDialogRef>(null);
    const hintDialogRef = useRef<HintDialogRef>(null);
    const addPicDialogRef = useRef<AddPicDialogRef>(null);

    const resetAllPage = () => {
        setTrainPassPage(1);
        setTrainNgPage(1);
        setValPassPage(1);
        setValNgPage(1);
    }

    const confirmAttribute: AttributeType = {
        title: 'Save changes',
        desc: `Deleted items <b>can't be restored</b>.<br/>Are you sure to save changes?`,
    };

    const confirmLeaveAttribute: AttributeType = {
        title: 'Confirm leave',
        desc: 'You have unsaved changes.<br/>Are you sure to leave?',
    };

    let warningGoldenCheckAttribute: AttributeType = {
        title: 'Warning',
        desc: 'Golden can be just one. <br/>Please adjust to one.',
    };

    const fetchPanelDataset = useCallback((exportId: string) => {

        setIsLoading(true);
        fetch(panelDatasetAPI(exportId))
            .then((res) => res.json())
            .then((data) => {
                setPanelInfo(data.info);
                setPanelDataset(data.data);

                console.log('--- info ---', data.info);
                console.log('--- data ---', data.data);

                if (keys(data.data)[0]) {
                    const defaultComp = keys(data.data)[0];
                    setSelectComp(defaultComp)
                    setPanelDatasetSecond(data.data[defaultComp]);
                    if (keys(data.data[defaultComp])[0]) {
                        const defaultLight = keys(data.data[defaultComp])[0];
                        setSelectLight(defaultLight);
                        dispatch(setPanelDatasetThird(data.data[defaultComp][defaultLight]));
                    }
                }

            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const fetchPanelDatasetAsync = async (exportId: string) => {

        console.log('--- fetch Panel Dataset Async---')

        setIsLoading(true);
        const res = await fetch(panelDatasetAPI(exportId));
        const resJson = await res.json();
        if (resJson.detail) {
            //utilityRef.current.showErrorMessage(resJson.detail);
            setIsLoading(false);
            console.log('fetchPanelDatasetAsync error', resJson.detail);
            return null;
        }

        setPanelInfo(resJson.info);
        setPanelDataset(resJson.data);

        setIsLoading(false);
        return resJson.data;

    };

    const SaveFetchPanelDataset = useCallback(
        (exportId: string) => {
            fetch(panelDatasetAPI(exportId))
                .then((res) => res.json())
                .then((data) => {

                    console.log('--- data ---')
                    console.log(data);



                    setPanelInfo(data.info);
                    setPanelDataset(data.data);


                    console.log('--- selectComp ---', selectComp);
                    console.log('--- selectLight ---', selectLight);

                    if (data.data[selectComp]){
                        if (selectComp) setPanelDatasetSecond(data.data[selectComp]);
                        if (selectComp && selectLight) dispatch(setPanelDatasetThird(data.data[selectComp][selectLight]));
                        
                    }else{
                        console.log('key')
                        console.log(Object.keys(data.data)[0])
                        const mySelectComp = Object.keys(data.data)[0]
                        setSelectComp(mySelectComp);
                        setPanelDatasetSecond(data.data[mySelectComp]);
                        const mySelectLight = Object.keys(data.data[mySelectComp])[0];
                        setSelectLight(mySelectLight);
                        dispatch(setPanelDatasetThird(data.data[mySelectComp][mySelectLight]));
                        dispatch(setClearList());
                        
                    }


                   
                })
                .catch((err) => {

                    console.log(err)
                    const msg = err?.response?.detail?.[0]?.msg || '';
                    const loc = err?.response?.detail?.[0]?.loc || [];
                    console.log(`API error: ${msg} [${loc.join(', ')}]`);
                });
        },
        [selectComp, selectLight],
    );

    const onDragEnd = (event: any) => {

        if (!panelDatasetThird) return;

        const { source, destination } = event;
        if (!destination) return;

        if (source.droppableId === destination.droppableId) return;

        const sourceTrainVal: TrainValType = source.droppableId.split('_')[0];
        const sourceType: PassNgType = source.droppableId.split('_')[1];
        const destTrainVal: TrainValType = destination.droppableId.split('_')[0];
        const destType: PassNgType = destination.droppableId.split('_')[1];



        // 當golden貼上第二項時觸發
        if ((destType === 'GOLDEN' && panelDatasetThird.train.GOLDEN?.length) || 0 > 1) {
            setOpenWarningDialog(true);
            return;
        }
        //return alert('Golden can be just one. Please remove the original one.');

        let newPanelDataset = cloneDeep(panelDatasetThird);

        // 從source剪下被拖曳的元素
        const sourceList = newPanelDataset[sourceTrainVal]?.[sourceType] || [];

        const removeItem = sourceList[source.index];

        console.log('destType', destType);

        if ((selectedList.includes(removeItem.image_uuid)) && (destType === 'GOLDEN')) {
            if (selectedList.length > 1) {
                setOpenWarningDialog(true);
                return;
            }
        }


        if (selectedList.includes(removeItem.image_uuid)) {
            selectedList.forEach(function (myItem, myIndex) {


                let moveItem = null;
                const item1 = find(newPanelDataset['train']?.['PASS'] || [], { image_uuid: myItem });
                if (item1) remove(newPanelDataset['train']?.['PASS'] || [], { image_uuid: myItem });
                const item2 = find(newPanelDataset['train']?.['NG'] || [], { image_uuid: myItem });
                if (item2) remove(newPanelDataset['train']?.['NG'] || [], { image_uuid: myItem });
                const item3 = find(newPanelDataset['train']?.['GOLDEN'] || [], { image_uuid: myItem });


                if (item3) remove(newPanelDataset['train']?.['GOLDEN'] || [], { image_uuid: myItem });
                const item4 = find(newPanelDataset['train']?.['DELETE'] || [], { image_uuid: myItem });
                if (item4) remove(newPanelDataset['train']?.['DELETE'] || [], { image_uuid: myItem });
                const item5 = find(newPanelDataset['val']?.['PASS'] || [], { image_uuid: myItem });
                if (item5) remove(newPanelDataset['val']?.['PASS'] || [], { image_uuid: myItem });
                const item6 = find(newPanelDataset['val']?.['NG'] || [], { image_uuid: myItem });
                if (item6) remove(newPanelDataset['val']?.['NG'] || [], { image_uuid: myItem });
                moveItem = (item1) ? item1 : (item2) ? item2 : (item3) ? item3 : (item4) ? item4 : (item5) ? item5 : (item6) ? item6 : null;

                console.log('moveItem', moveItem);


                if (moveItem) {
                    const pasteList = newPanelDataset[destTrainVal]?.[destType] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset[destTrainVal][destType] = pasteList;



                }

            });
            dispatch(setPanelDatasetThird(newPanelDataset));
            dispatch(setSomethingChange(true));

        } else {
            // 按之前的方式
            const [removeItem] = sourceList.splice(source.index, 1);
            // 在destination位置貼上被拖曳的元素
            const pasteList = newPanelDataset[destTrainVal]?.[destType] || [];
            pasteList.splice(destination.index, 0, removeItem);
            newPanelDataset[destTrainVal][destType] = pasteList;
            dispatch(setPanelDatasetThird(newPanelDataset));
            dispatch(setSomethingChange(true));
        };
    };

    const moveSelectedListToArea = (AreaNum: number) => {


        if (!panelDatasetThird) return;
        let newPanelDataset = cloneDeep(panelDatasetThird);
        selectedList.forEach(function (myItem, myIndex) {

            let moveItem = null;
            const item1 = find(newPanelDataset['train']?.['PASS'] || [], { image_uuid: myItem });
            if (item1) remove(newPanelDataset['train']?.['PASS'] || [], { image_uuid: myItem });
            const item2 = find(newPanelDataset['train']?.['NG'] || [], { image_uuid: myItem });
            if (item2) remove(newPanelDataset['train']?.['NG'] || [], { image_uuid: myItem });
            const item3 = find(newPanelDataset['train']?.['GOLDEN'] || [], { image_uuid: myItem });
            if (item3) remove(newPanelDataset['train']?.['GOLDEN'] || [], { image_uuid: myItem });
            const item4 = find(newPanelDataset['train']?.['DELETE'] || [], { image_uuid: myItem });
            if (item4) remove(newPanelDataset['train']?.['DELETE'] || [], { image_uuid: myItem });
            const item5 = find(newPanelDataset['val']?.['PASS'] || [], { image_uuid: myItem });
            if (item5) remove(newPanelDataset['val']?.['PASS'] || [], { image_uuid: myItem });
            const item6 = find(newPanelDataset['val']?.['NG'] || [], { image_uuid: myItem });
            if (item6) remove(newPanelDataset['val']?.['NG'] || [], { image_uuid: myItem });
            moveItem = (item1) ? item1 : (item2) ? item2 : (item3) ? item3 : (item4) ? item4 : (item5) ? item5 : (item6) ? item6 : null;

            if (moveItem) {
                let pasteList: any = [];

                if (AreaNum === 1) {
                    pasteList = newPanelDataset['train']?.['PASS'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['train']['PASS'] = pasteList;
                    setTrainPassPage(1);
                }

                if (AreaNum === 2) {
                    pasteList = newPanelDataset['train']?.['NG'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['train']['NG'] = pasteList;
                    setTrainNgPage(1);
                }

                if (AreaNum === 3) {
                    pasteList = newPanelDataset['val']?.['PASS'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['val']['PASS'] = pasteList;
                    setValPassPage(1);
                }

                if (AreaNum === 4) {
                    pasteList = newPanelDataset['val']?.['NG'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['val']['NG'] = pasteList;
                    setValNgPage(1);
                }

                if (AreaNum === 5) {
                    pasteList = newPanelDataset['train']?.['GOLDEN'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['train']['GOLDEN'] = pasteList;
                }

                if (AreaNum === 6) {
                    pasteList = newPanelDataset['train']?.['DELETE'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['train']['DELETE'] = pasteList;
                    setTrainDeletePage(1);
                }
            }

        });

        dispatch(setPanelDatasetThird(newPanelDataset));
        dispatch(setSomethingChange(true));




    }

    const handleShiftSelect = (myIndex: number, myStr1: string, myStr2: string) => {

        if (!panelDatasetThird) return;

        let newPanelDataset = cloneDeep(panelDatasetThird);
        const source1Type: TrainValType = (myStr1 === 'train') ? 'train' : 'val';
        const source2Type: PassNgType = (myStr2 === 'PASS') ? 'PASS' : (myStr2 === 'NG') ? 'NG' : (myStr2 === 'DELETE') ? 'DELETE' : 'GOLDEN';

        const targetList = newPanelDataset[source1Type]?.[source2Type] || [];

        let maxIndex = -1;
        if (targetList.length > 0) {
            selectedList.forEach(function (myItem, myIndex) {

                const indexItems = targetList.map((item, index) => item.image_uuid === myItem ? index : null).filter((item) => item !== null);
                const index = targetList.findIndex(a => a.image_uuid === myItem)
                if (index > maxIndex) maxIndex = index;

            });
        }
        console.log('maxIndex', maxIndex);
        if (maxIndex >= 0) {
            const selectList = targetList.slice(Math.min(maxIndex, myIndex), Math.max(maxIndex, myIndex) + 1)
            const allImageUuid = selectList.flatMap((selectList) => {
                return selectList.image_uuid;
            });
            dispatch(setSelectedList(allImageUuid));
        }

    }

    const handleKeyDown = (keyName: any, e: any) => {

        //console.log('e.code', e.code);

        if (e.code === 'PageUp') {
            if (((selectedArea > 0) && (selectedArea < 5)) || (selectedArea === 6)) {

                if (selectedArea === 1) {
                    if (trainPassPage > 1) setTrainPassPage(trainPassPage - 1)
                }
                if (selectedArea === 2) {
                    if (trainNgPage > 1) setTrainNgPage(trainNgPage - 1)
                }
                if (selectedArea === 3) {
                    if (valPassPage > 1) setValPassPage(valPassPage - 1)
                }
                if (selectedArea === 4) {
                    if (valNgPage > 1) setValNgPage(valNgPage - 1)
                }
                if (selectedArea === 6) {
                    if (trainDeletePage > 1) setTrainDeletePage(trainDeletePage - 1)
                }


            }
        }

        if (e.code === 'PageDown') {
            if (((selectedArea > 0) && (selectedArea < 5)) || (selectedArea === 6)) {
                console.log('do page down')

                if (selectedArea === 1) {
                    const totalPage = Math.ceil(panelDatasetThird.train.PASS.length / NumPerPage);
                    if (trainPassPage < totalPage) setTrainPassPage(trainPassPage + 1)
                }
                if (selectedArea === 2) {
                    const totalPage = Math.ceil(panelDatasetThird.train.NG.length / NumPerPage);
                    if (trainNgPage < totalPage) setTrainNgPage(trainNgPage + 1)
                }
                if (selectedArea === 3) {
                    const totalPage = Math.ceil(panelDatasetThird.val.PASS.length / NumPerPage);
                    if (valPassPage < totalPage) setValPassPage(valPassPage + 1)
                }
                if (selectedArea === 4) {
                    const totalPage = Math.ceil(panelDatasetThird.val.NG.length / NumPerPage);
                    if (valNgPage < totalPage) setValNgPage(valNgPage + 1)
                }
                if (selectedArea === 6) {
                    const totalPage = Math.ceil((panelDatasetThird.train.DELETE ? panelDatasetThird.train.DELETE.length : 0) / NumPerPage);
                    if (trainDeletePage < totalPage) setTrainDeletePage(trainDeletePage + 1)
                }

            }
        }

        if (e.code === 'Space') {
            if (hoverItem !== '') {
                if (show === false) setShow(true);
            }
        }

        if (e.code === 'Escape') {
            dispatch(setToggleArea(0));
            dispatch(setSelectedList([]));
        }

        if (e.code === 'ArrowUp') {
            if (selectedArea === 4) {
                dispatch(setToggleArea(2));
                moveSelectedListToArea(2);
            }
            if (selectedArea === 3) {
                dispatch(setToggleArea(1));
                moveSelectedListToArea(1);
            }
            if (selectedArea === 6) {
                if (goldenNum > 0) {
                    setOpenWarningDialog(true);
                    return;
                }
                if (selectedList.length > 1) {
                    setOpenWarningDialog(true);
                    return;
                }
                dispatch(setToggleArea(5));
                moveSelectedListToArea(5);
            }

        }
        if (e.code === 'ArrowDown') {
            if (selectedArea === 1) {
                dispatch(setToggleArea(3))
                moveSelectedListToArea(3);
            }
            if (selectedArea === 2) {
                dispatch(setToggleArea(4))
                moveSelectedListToArea(4);
            }
            if (selectedArea === 5) {
                dispatch(setToggleArea(6));
                moveSelectedListToArea(6);
            }

        }
        if (e.code === 'ArrowLeft') {
            if (selectedArea === 2) {
                dispatch(setToggleArea(1));
                moveSelectedListToArea(1);
            }
            if (selectedArea === 4) {
                dispatch(setToggleArea(3));
                moveSelectedListToArea(3);
            }
            if (selectedArea === 6) {
                dispatch(setToggleArea(4));
                moveSelectedListToArea(4);
            }
            if (selectedArea === 5) {
                dispatch(setToggleArea(2));
                moveSelectedListToArea(2);
            }

        }
        if (e.code === 'ArrowRight') {
            if (selectedArea === 1) {
                dispatch(setToggleArea(2));
                moveSelectedListToArea(2);
            }
            if (selectedArea === 2) {

                if (goldenNum > 0) {
                    setOpenWarningDialog(true);
                    return;
                }
                if (selectedList.length > 1) {
                    setOpenWarningDialog(true);
                    return;
                }
                dispatch(setToggleArea(5));
                moveSelectedListToArea(5);
            }
            if (selectedArea === 3) {
                dispatch(setToggleArea(4));
                moveSelectedListToArea(4);
            }
            if (selectedArea === 4) {
                dispatch(setToggleArea(6));
                moveSelectedListToArea(6);
            }

        }

    }

    const handleKeyUp = (keyName: any, e: any) => {

        if (e.code === 'Space') {
            setShow(false);
            sethoverItem('');
        }
    }

    const putResource = async (exportId: string, url: string, method: 'PUT' | 'DELETE', putList: string[]): Promise<any> => {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                export_uuid: exportId,
                image_uuid_list: putList,
            }),
        });

        if (!response.ok) {
            throw new Error(`PUT request for resource ${url} failed`);
        }

        return response.json();
    };

    const adjustRatio: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (!panelDatasetThird) return;
        const passArray = [...panelDatasetThird.train.PASS, ...panelDatasetThird.val.PASS];
        const ngArray = [...panelDatasetThird.train.NG, ...panelDatasetThird.val.NG];

        let newPanelDataset = cloneDeep(panelDatasetThird);
        newPanelDataset.train.PASS = passArray.slice(0, Math.ceil((passArray.length * trainPass) / 100));
        newPanelDataset.val.PASS = passArray.slice(Math.ceil((passArray.length * trainPass) / 100), passArray.length);
        newPanelDataset.train.NG = ngArray.slice(0, Math.ceil((ngArray.length * trainNg) / 100));
        newPanelDataset.val.NG = ngArray.slice(Math.ceil((ngArray.length * trainNg) / 100), ngArray.length);

        dispatch(setPanelDatasetThird(newPanelDataset));
        dispatch(setSomethingChange(true));
    };

    const saveData = (exportId: string | null, data?: PanelDatasetType) => {
        if (!exportId) return;
        if (!data) return;


        console.log('--- exportId ---', exportId);

        console.log('--- data ---', data);

        setIsLoading(true);

        const APIList: PanelDatasetPromiseType = [
            { path: postTrainPassAPI, method: 'PUT', data: data?.train.PASS.map((item) => item.image_uuid) || [] },
            { path: postTrainNgAPI, method: 'PUT', data: data?.train.NG.map((item) => item.image_uuid) || [] },
            { path: postValPassAPI, method: 'PUT', data: data?.val.PASS.map((item) => item.image_uuid) || [] },
            { path: postValNgAPI, method: 'PUT', data: data?.val.NG.map((item) => item.image_uuid) || [] },
            { path: postGoldenAPI, method: 'PUT', data: data?.train.GOLDEN?.map((item) => item.image_uuid) || [] },
            { path: deleteImgAPI, method: 'DELETE', data: data?.train.DELETE?.map((item) => item.image_uuid) || [] },
        ];

        const putPromises = APIList.filter((item) => item.data.length > 0).map((resource) => {
            return putResource(exportId, resource.path, resource.method, resource.data);
        });

        Promise.all(putPromises)
            .then(() => {
                SaveFetchPanelDataset(exportId);
            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            })
            .finally(() => setIsLoading(false));
    };

    const handleConfirm: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        saveData(currentProject.export_uuid, panelDatasetThird);
        setOpenConfirmDialog(false);
        dispatch(setSomethingChange(false));
        setTempComp('');
        setTempLight('');
    };

    const handleAddPic_xx = async (picId: string) => { };

    const handleAddPic = async (picId: string) => {

        if (!panelDataset) return;

        if (!currentProject) return;

        if (currentProject.export_uuid) {


            const myData = await fetchPanelDatasetAsync(currentProject.export_uuid);

            console.log('--- myData ---', myData);
            console.log('--- Add Pic ---', picId);


            let currentComp = '';
            let currentLight = '';
            let currentType = '';
            let currentArea = '';

            if (myData !== undefined) {
                const compArr = Object.keys(myData);
                compArr.map((comp) => {
                    //console.log(panelDataset[comp]);
                    const lightArr = Object.keys(myData[comp]);
                    lightArr.map((light) => {
                        //console.log(panelDataset[comp][light]);
                        const myArr1 = myData[comp][light].train.PASS;
                        myArr1?.map((item: any) => {
                            if (item.image_uuid === picId) {

                                currentComp = comp;
                                currentLight = light;
                                currentType = 'train';
                                currentArea = 'PASS';
                            }
                        });
                        const myArr2 = myData[comp][light].train.NG;
                        myArr2?.map((item: any) => {
                            if (item.image_uuid === picId) {

                                currentComp = comp;
                                currentLight = light;
                                currentType = 'train';
                                currentArea = 'NG';
                            }
                        });
                        const myArr3 = myData[comp][light].train.GOLDEN;
                        myArr3?.map((item: any) => {
                            if (item.image_uuid === picId) {

                                currentComp = comp;
                                currentLight = light;
                                currentType = 'train';
                                currentArea = 'GOLDEN';
                            }
                        });
                        const myArr4 = myData[comp][light].val.PASS;
                        myArr4?.map((item: any) => {
                            if (item.image_uuid === picId) {

                                currentComp = comp;
                                currentLight = light;
                                currentType = 'val';
                                currentArea = 'PASS';

                            }
                        });
                        const myArr5 = myData[comp][light].val.NG;
                        myArr5?.map((item: any) => {
                            if (item.image_uuid === picId) {

                                currentComp = comp;
                                currentLight = light;
                                currentType = 'val';
                                currentArea = 'NG';
                            }
                        });
                    })
                })
            }

            console.log('currentComp', currentComp);
            console.log('currentLight', currentLight);
            console.log('currentType', currentType);
            console.log('currentArea', currentArea);

            if (currentComp !== '') {
                setSelectComp(currentComp);
                if (myData) {
                    setPanelDatasetSecond(myData[currentComp]);

                    console.log('--- second panel data ---')
                    console.log(myData[currentComp])


                    const myPanelDatasetThird = myData[currentComp][currentLight];
                    dispatch(setPanelDatasetThird(myPanelDatasetThird));
                    setSelectLight(currentLight);
                    dispatch(setClearList());
                    dispatch(setToggleItem(picId));

                    if (myPanelDatasetThird) {
                        if (currentType !== '' && currentArea !== '') {
                            let totalItems = 0;
                            let currentIndex = -1;
                            if (currentType === 'train') {

                                if (currentArea === 'PASS') {
                                    totalItems = myPanelDatasetThird.train.PASS.length;
                                    currentIndex = myPanelDatasetThird.train.PASS.findIndex((item: any) => item.image_uuid === picId);
                                }
                                if (currentArea === 'NG') {
                                    totalItems = myPanelDatasetThird.train.NG.length;
                                    currentIndex = myPanelDatasetThird.train.NG.findIndex((item: any) => item.image_uuid === picId);
                                }

                            }
                            if (currentType === 'val') {
                                if (currentArea === 'PASS') {
                                    totalItems = myPanelDatasetThird.val.PASS.length;
                                    currentIndex = myPanelDatasetThird.val.PASS.findIndex((item: any) => item.image_uuid === picId);
                                }
                                if (currentArea === 'NG') {
                                    totalItems = myPanelDatasetThird.val.NG.length;
                                    currentIndex = myPanelDatasetThird.val.NG.findIndex((item: any) => item.image_uuid === picId);
                                }
                            }
                            const totalPage = Math.ceil(totalItems / NumPerPage);
                            const currentPage = Math.ceil((currentIndex + 1) / NumPerPage);
                            // console.log('totalItems', totalItems);
                            // console.log('totalPage', totalPage);
                            // console.log('currentIndex', currentIndex);
                            // console.log('currentPage', currentPage);

                            if (currentType === 'train') {
                                if (currentArea === 'PASS') {
                                    setTrainPassPage(currentPage);
                                    dispatch(setToggleArea(1));
                                }
                                if (currentArea === 'NG') {
                                    setTrainNgPage(currentPage);
                                    dispatch(setToggleArea(2));
                                }
                            }
                            if (currentType === 'val') {
                                if (currentArea === 'PASS') {
                                    setValPassPage(currentPage);
                                    dispatch(setToggleArea(3));
                                }
                                if (currentArea === 'NG') {
                                    setValNgPage(currentPage);
                                    dispatch(setToggleArea(4));
                                }
                            }

                        }
                    }

                }

            }

        }
    }

    const handleAreaSelectAll = (areaNum: number) => {

        if (!panelDatasetThird) return;

        if (selectedList.length > 0) {
            dispatch(setSelectedList([]))

        } else {
            if (areaNum === 1) {
                let newPanelDataset = cloneDeep(panelDatasetThird);
                const train_PASS = newPanelDataset['train']?.['PASS'] || [];
                const allImageUuid = train_PASS.flatMap((train_PASS) => {
                    return train_PASS.image_uuid;
                });
                dispatch(setSelectedList(allImageUuid))
            }
            if (areaNum === 2) {
                let newPanelDataset = cloneDeep(panelDatasetThird);
                const train_NG = newPanelDataset['train']?.['NG'] || [];
                const allImageUuid = train_NG.flatMap((train_NG) => {
                    return train_NG.image_uuid;
                });
                dispatch(setSelectedList(allImageUuid))
            }
            if (areaNum === 3) {
                let newPanelDataset = cloneDeep(panelDatasetThird);
                const val_PASS = newPanelDataset['val']?.['PASS'] || [];
                const allImageUuid = val_PASS.flatMap((val_PASS) => {
                    return val_PASS.image_uuid;
                });
                dispatch(setSelectedList(allImageUuid))
            }
            if (areaNum === 4) {
                let newPanelDataset = cloneDeep(panelDatasetThird);
                const val_NG = newPanelDataset['val']?.['NG'] || [];
                const allImageUuid = val_NG.flatMap((val_NG) => {
                    return val_NG.image_uuid;
                });
                dispatch(setSelectedList(allImageUuid))
            }
            if (areaNum === 5) {
                let newPanelDataset = cloneDeep(panelDatasetThird);
                const train_GOLDEN = newPanelDataset['train']?.['GOLDEN'] || [];
                const allImageUuid = train_GOLDEN.flatMap((train_GOLDEN) => {
                    return train_GOLDEN.image_uuid;
                });
                dispatch(setSelectedList(allImageUuid))
            }
            if (areaNum === 6) {
                let newPanelDataset = cloneDeep(panelDatasetThird);
                const train_DELETE = newPanelDataset['train']?.['DELETE'] || [];
                const allImageUuid = train_DELETE.flatMap((train_DELETE) => {
                    return train_DELETE.image_uuid;
                });
                dispatch(setSelectedList(allImageUuid))
            }

        }

    }

    const handleBodyDoubleClick = (actionName: string) => {

        if (actionName === 'body') {
            dispatch(setToggleArea(0));
            dispatch(setSelectedList([]));
        }

    }


    const handleConfirmLeave: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        if (panelDataset && tempComp) {
            setSelectComp(tempComp);
            setPanelDatasetSecond(panelDataset[tempComp]);
            dispatch(setPanelDatasetThird(undefined));
            setSelectLight('');
            setTempLight('');
        }

        if (panelDatasetSecond && tempLight) {
            setSelectLight(tempLight);
            dispatch(setPanelDatasetThird(panelDatasetSecond[tempLight]));
        }

        setOpenConfirmLeaveDialog(false);
        dispatch(setSomethingChange(false));
        setTempComp('');
        setTempLight('');

        dispatch(setClearList());
    };

    const ConvertPanelDataset = (projectId: string, exportId: string | null) => {
        if (!exportId) return;
        const postData = {
            project_uuid: projectId,
            export_uuid: exportId,
        };

        fetch(panelDatasetZipAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then(() => {
                setPageKey('LoadingPanelDatasetZipPage');
            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(',')}]`);
            });
    };

    const OpenTrainingDialog = (projectId: string, exportId: string | null) => {
        if (!exportId) return;
        const postData = {
            project_uuid: projectId,
            export_uuid: exportId,
        };

        setOpenTrainingDialog(true);

        trainingDialogRef.current?.SetOpen();


    };


    useEffect(() => {

        if (panelDatasetThird) {

            const totalPage1 = Math.ceil(panelDatasetThird.train.PASS.length / NumPerPage);
            if ((totalPage1 > 0) && (trainPassPage > totalPage1)) setTrainPassPage(totalPage1)

            const totalPage2 = Math.ceil(panelDatasetThird.train.NG.length / NumPerPage);
            if ((totalPage2 > 0) && (trainNgPage > totalPage2)) setTrainNgPage(totalPage2)

            const totalPage3 = Math.ceil(panelDatasetThird.val.PASS.length / NumPerPage);
            if ((totalPage3 > 0) && (valPassPage > totalPage3)) setValPassPage(totalPage3)

            const totalPage4 = Math.ceil(panelDatasetThird.val.NG.length / NumPerPage);
            if ((totalPage4 > 0) && (valNgPage > totalPage4)) setValNgPage(totalPage4)

            const totalPage6 = Math.ceil((panelDatasetThird.train.DELETE ? panelDatasetThird.train.DELETE.length : 0) / NumPerPage);
            if ((totalPage6 > 0) && (trainDeletePage > totalPage6)) setTrainDeletePage(totalPage6)
        }

    }, [panelDatasetThird]);


    useEffect(() => {
        if (currentProject.export_uuid) fetchPanelDataset(currentProject.export_uuid);
    }, [currentProject.export_uuid, fetchPanelDataset]);


    useEffect(() => {
        if (passPanelRef.current) passPanelRef.current.focus();
    }, []);


    useEffect(() => {
        document.body.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            handleBodyDoubleClick('body');
        });

        return function cleanup() {
            document.body.removeEventListener('dblclick', (e) => {
                e.stopPropagation();
                handleBodyDoubleClick('body');
            });

        }
    }, []);




    return (
        <>
            <Hotkeys
                keyName="Space,Up,Down,Right,Left,Shift,PageUp,PageDown,Esc"
                onKeyDown={handleKeyDown.bind(this)}
                onKeyUp={handleKeyUp.bind(this)}
                disabled={false}
                allowRepeat={true}
            ></Hotkeys>

            <Modal show={show} onHide={handleClose} animation={false} contentClassName="my-dialog" centered>
                <img src={datasetImgAPI(hoverItem)} alt="img" className="my-screen-image" />
            </Modal>

            <ThemeProvider theme={theme}>

                <div className="attribute-page-container" >
                    <div className="title-container">
                        <span className="title-style">
                            <div className="title-name">
                                <DivEllipsisWithTooltip>{currentProject.project_name}</DivEllipsisWithTooltip>
                            </div>
                        </span>

                        <div className="title-count-container d-flex flex-row gap-1 align-items-center">
                            <div className={`title-count${((panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0) <2) ? '-warnning' : ''} d-flex flex-row gap-3 align-items-center`}>
                                <span>
                                    Train_PASS: <span className={'black-font'}>{panelInfo?.train.PASS || 0}</span>
                                </span>
                                +
                                <span>
                                    Train_NG: <span className={'black-font'}>{panelInfo?.train.NG || 0}</span>
                                </span>
                                =
                                <span>
                                    Train_Total:<span className={((panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0) <2) ? 'red-font' : 'black-font'}>{(panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0)}</span>
                                </span>
                                <span>
                                    {((panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0) <2) ?
                                        <FontAwesomeIcon icon={faCircle} color="lightgray" style={{ width: 16 }} size="4x" />
                                        :
                                        <FontAwesomeIcon icon={faCircleCheck} color="green" style={{ width: 16 }} size="4x" />
                                    }
                                </span>
                                {
                                    (panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0) <2 &&
                                    <span className="my-warnning-info">
                                        <FontAwesomeIcon icon={faCircleInfo} color="orange" style={{ width: 16}} size="4x" />
                                        <span>
                                            Train PASS+NG need at least two.
                                        </span>
                                    </span>
                                }
                            </div>
                            <div className={`title-count${((panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0) === 0) ? '-warnning' : ''} d-flex flex-row gap-3 align-items-center`}>
                                <span>
                                    Val_PASS: <span className={'black-font'}>{panelInfo?.val.PASS || 0}</span>
                                </span>
                                +
                                <span>
                                    Val_NG: <span className={'black-font'}>{panelInfo?.val.NG || 0}</span>
                                </span>
                                =
                                <span>
                                    Val_Total:<span className={((panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0) === 0) ? 'red-font' : 'black-font'}>{(panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0)}</span>
                                </span>
                                <span>
                                    {((panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0) === 0) ?
                                        <FontAwesomeIcon icon={faCircle} color="lightgray" style={{ width: 16 }} size="4x" />
                                        :
                                        <FontAwesomeIcon icon={faCircleCheck} color="green" style={{ width: 16 }} size="4x" />
                                    }
                                </span>
                                {
                                    (panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0) === 0 &&
                                    <span className="my-warnning-info">
                                        <FontAwesomeIcon icon={faCircleInfo} color="orange" style={{ width: 16, height: 16 }} size="4x" />
                                        <span>
                                            Val PASS+NG need at least one.
                                        </span>
                                    </span>
                                }
                                
                            </div>
                        </div>

                        <div className="lower-right-button-container">

                            <CustomButton name='view' text='Add' width={100} onClick={() => { addPicDialogRef.current?.SetOpen() }} />
                            <CustomButton name='view' text='Convert' width={100} disabled={( (panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0) === 0)||((panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0) <2)} onClick={() => ConvertPanelDataset(currentProject.project_uuid, currentProject.export_uuid)} />
                            <CustomButton name='view' text='Train' width={100} disabled={( (panelInfo?.val.PASS || 0) + (panelInfo?.val.NG || 0) === 0)||((panelInfo?.train.PASS || 0) + (panelInfo?.train.NG || 0) <2)} onClick={() => OpenTrainingDialog(currentProject.project_uuid, currentProject.export_uuid)} />
                        </div>
                    </div>
                    <div className="attribute-page-content" style={{ userSelect: 'none' }}>
                        <div className="my-component-container">
                            <div className="my-component-title">Component</div>
                            <div className="my-component-content">
                                {panelDataset &&
                                    Object.keys(panelDataset).map((comp, idx) => (
                                        <div
                                            key={comp}
                                            className={`my-component-item-${(idx % 2 === 1) ? "1" : "2"} ${comp === selectComp ? 'my-component-item-selected' : ''}`}
                                            onClick={() => {

                                                if (comp !== selectComp) {
                                                    resetAllPage();
                                                    if (somethingChange) {
                                                        setOpenConfirmLeaveDialog(true);
                                                        setTempComp(comp);
                                                    } else {
                                                        setSelectComp(comp);
                                                        setSelectLight('');
                                                        setPanelDatasetSecond(panelDataset[comp]);
                                                        //dispatch(setPanelDatasetThird(undefined));
                                                        dispatch(setClearList());

                                                        setTempComp(comp);

                                                        // for default select first item    
                                                        if (keys(panelDataset[comp])[0]) {
                                                            const defaultLight = keys(panelDataset[comp])[0];
                                                            setSelectLight(defaultLight);
                                                            dispatch(setPanelDatasetThird(panelDataset[comp][defaultLight]));
                                                        }

                                                    }
                                                }
                                            }}
                                        >

                                            <div className="my-component-text">
                                                <DivEllipsisWithTooltip>{comp}</DivEllipsisWithTooltip>
                                            </div>
                                            {
                                                (getCheckStatusNum(panelDataset[comp]) === 1) ?
                                                    <FontAwesomeIcon icon={faCircleCheck} color="green" style={{ width: 16 }} size="4x" />
                                                    : (getCheckStatusNum(panelDataset[comp]) === 2) ?
                                                        <FontAwesomeIcon icon={faCircle} color="lightgray" style={{ width: 16 }} size="4x" />
                                                        : <FontAwesomeIcon icon={faCircleMinus} color="orange" style={{ width: 16 }} size="4x" />




                                            }
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="my-component-container">
                            <div className="my-component-title">Light</div>
                            <div className="my-component-content">
                                {panelDatasetSecond &&
                                    Object.keys(panelDatasetSecond).map((lightSource, idx) => (
                                        <div
                                            key={lightSource}
                                            className={`my-component-item-${(idx % 2 === 1) ? "1" : "2"} ${lightSource === selectLight ? 'my-component-item-selected' : ''}`}
                                            onClick={() => {

                                                if (lightSource !== selectLight) {
                                                    resetAllPage();
                                                    if (somethingChange) {
                                                        console.log('something change')
                                                        setOpenConfirmLeaveDialog(true);
                                                        setTempLight(lightSource);
                                                    } else {
                                                        console.log('nothing change')
                                                        setSelectLight(lightSource);
                                                        dispatch(setPanelDatasetThird(panelDatasetSecond[lightSource]));
                                                        dispatch(setClearList());
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="component-text">{lightSource}</div>
                                            {panelDatasetSecond[lightSource].check ? (
                                                <FontAwesomeIcon icon={faCircleCheck} color="green" style={{ width: 16 }} size="4x" />
                                            ) : (
                                                <FontAwesomeIcon icon={faCircle} color="lightgray" style={{ width: 16 }} size="4x" />
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div className="my-attribute-container">
                            <div className="my-attribute-title">

                                Attribute
                                {/* {panelDatasetThird && (
                                    <span style={{ fontSize: 14, fontWeight: 400 }}> ※Press alt (or option) key and click to check full size image.</span>
                                )} */}

                                {panelDatasetThird && (
                                    <div className='d-flex flex-row gap-2'>
                                        <CustomButton name='button-type-2' text='Shortcut key hint' width={140} height={28} onClick={() => { hintDialogRef.current?.SetOpen() }} />
                                        <CustomButton name='button-type-2' text='Ratio distribution' width={140} height={28} onClick={() => {
                                            const trainPass = panelDatasetThird.train.PASS.length;
                                            const valPass = panelDatasetThird.val.PASS.length;
                                            const trainNg = panelDatasetThird.train.NG.length;
                                            const valNg = panelDatasetThird.val.NG.length;
                                            setTrainPass(Math.floor((trainPass / (trainPass + valPass)) * 100) || 0);
                                            setValPass(100 - Math.floor((trainPass / (trainPass + valPass)) * 100) || 0);
                                            setTrainNg(Math.floor((trainNg / (trainNg + valNg)) * 100) || 0);
                                            setValNg(100 - Math.floor((trainNg / (trainNg + valNg)) * 100) || 0);
                                            setOpenRatioDialog(true);
                                        }} />
                                        <CustomButton name='button-type-1' text='Save' width={100} height={28} onClick={() => setOpenConfirmDialog(true)} />

                                    </div>
                                )}
                            </div>
                            <DragDropContext onDragEnd={onDragEnd}>
                                {panelDatasetThird && (
                                    <div className="my-attribute-content">
                                        <div className="my-train-val-container">
                                            <div className="my-train-val-wrapper">
                                                <div className="my-train-val-title" >
                                                    
                                                    Train
                                                    {
                                                        trainNum < 1 && 
                                                        <span className="my-warnning-info" style={{position:'relative',top:0,left:5}}>
                                                        <FontAwesomeIcon icon={faCircleInfo} color="orange" style={{ width: 16}} size="4x" />
                                                        Pass + NG need at least one.
                                                        </span>
                                                       
                                                    }
                                                    
                                                    
                                                </div>
                                                <div className="my-pass-ng-container">
                                                    <div style={{ width: '50%', position: 'relative' }}>
                                                        <div className={trainNum < 1 ? 'my-pass-ng-wrapper-warn' : 'my-pass-ng-wrapper'} onClick={(e) => dispatch(setToggleArea(1))} onDoubleClick={(e) => { e.stopPropagation(); handleAreaSelectAll(1) }} style={{ backgroundColor: (selectedArea === 1) ? '#D9FFFF' : '#FAFAFD' }}>

                                                            <CustomTab label="PASS" value={panelDatasetThird.train.PASS.length} warn={(trainNum < 1) ? true : false} focus={(selectedArea === 1) ? true : false}></CustomTab>

                                                            <Droppable droppableId={"train_PASS"}>
                                                                {(provided) => (
                                                                    <div ref={provided.innerRef} {...provided.droppableProps} className="img-container" >
                                                                        {panelDatasetThird?.train?.PASS &&
                                                                            panelDatasetThird.train.PASS.map((img, index) => (

                                                                                ((index >= (trainPassPage - 1) * NumPerPage) && (index < (trainPassPage * NumPerPage))) &&
                                                                                <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                    onHover={(img: string): void => sethoverItem(img)}
                                                                                    onShiftSelect={handleShiftSelect}
                                                                                />

                                                                            ))}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>

                                                            <div className='my-page-row'>
                                                                <Stack spacing={2}>
                                                                    <Pagination count={Math.ceil(panelDatasetThird.train.PASS.length / NumPerPage)} variant="outlined" shape="rounded" onChange={(e, v) => setTrainPassPage(v)} page={trainPassPage} />
                                                                </Stack>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div style={{ width: '50%', position: 'relative' }}>
                                                        <div className={trainNum < 1 ? 'my-pass-ng-wrapper-warn' : 'my-pass-ng-wrapper'} onClick={(e) => dispatch(setToggleArea(2))} onDoubleClick={(e) => { e.stopPropagation(); handleAreaSelectAll(2) }} style={{ backgroundColor: (selectedArea === 2) ? '#D9FFFF' : '#FAFAFD' }}>

                                                            <CustomTab label="NG" value={panelDatasetThird.train.NG.length} warn={(trainNum < 1) ? true : false} focus={(selectedArea === 2) ? true : false}></CustomTab>

                                                            <Droppable droppableId="train_NG">
                                                                {(provided) => (
                                                                    <div ref={provided.innerRef} {...provided.droppableProps} className="img-container">
                                                                        {panelDatasetThird?.train?.NG &&
                                                                            panelDatasetThird.train.NG.map((img, index) => (
                                                                                ((index >= (trainNgPage - 1) * NumPerPage) && (index < (trainNgPage * NumPerPage))) &&
                                                                                <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                    onHover={(img: string): void => sethoverItem(img)}
                                                                                    onShiftSelect={handleShiftSelect}
                                                                                />
                                                                            ))}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                            <div className='my-page-row'>
                                                                <Stack spacing={2}>
                                                                    <Pagination count={Math.ceil(panelDatasetThird.train.NG.length / NumPerPage)} variant="outlined" shape="rounded" onChange={(e, v) => setTrainNgPage(v)} page={trainNgPage} />
                                                                </Stack>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="my-train-val-wrapper">
                                                <div className="my-train-val-title">
                                                    Val
                                                    {/* {valNum < 1 &&
                                                        <div className='my-info-tag'>
                                                            <FontAwesomeIcon icon={faCircleInfo} color="orange" style={{ width: 16, height: 16 }} size="4x" />
                                                            <div style={{ paddingTop: 2 }}> PASS+NG need at least one.</div>
                                                        </div>
                                                    } */}
                                                </div>
                                                <div className="my-pass-ng-container">
                                                    <div style={{ width: '50%', position: 'relative' }}>
                                                        <div className={valNum < 1 ? 'my-pass-ng-wrapper' : 'my-pass-ng-wrapper'} onClick={(e) => dispatch(setToggleArea(3))} onDoubleClick={(e) => { e.stopPropagation(); handleAreaSelectAll(3) }} style={{ backgroundColor: (selectedArea === 3) ? '#D9FFFF' : '#FAFAFD' }}>

                                                            <CustomTab label="PASS" value={panelDatasetThird.val.PASS.length} warn={(valNum < 1) ? false : false} focus={(selectedArea === 3) ? true : false}></CustomTab>

                                                            <Droppable droppableId="val_PASS">
                                                                {(provided) => (
                                                                    <div ref={provided.innerRef} {...provided.droppableProps} className="img-container">
                                                                        {panelDatasetThird?.val?.PASS &&
                                                                            panelDatasetThird.val.PASS.map((img, index) => (
                                                                                ((index >= (valPassPage - 1) * NumPerPage) && (index < (valPassPage * NumPerPage))) &&
                                                                                <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                    onHover={(img: string): void => sethoverItem(img)}
                                                                                    onShiftSelect={handleShiftSelect}
                                                                                />
                                                                            ))}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                            <div className='my-page-row'>
                                                                <Stack spacing={2}>
                                                                    <Pagination count={Math.ceil(panelDatasetThird.val.PASS.length / NumPerPage)} variant="outlined" shape="rounded" onChange={(e, v) => setValPassPage(v)} page={valPassPage} />
                                                                </Stack>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div style={{ width: '50%', position: 'relative' }}>
                                                        <div className={valNum < 1 ? 'my-pass-ng-wrapper' : 'my-pass-ng-wrapper'} onClick={(e) => dispatch(setToggleArea(4))} onDoubleClick={(e) => { e.stopPropagation(); handleAreaSelectAll(4) }} style={{ backgroundColor: (selectedArea === 4) ? '#D9FFFF' : '#FAFAFD' }}>

                                                            <CustomTab label="NG" value={panelDatasetThird.val.NG.length} warn={(valNum < 1) ? false : false} focus={(selectedArea === 4) ? true : false}></CustomTab>

                                                            <Droppable droppableId="val_NG">
                                                                {(provided) => (
                                                                    <div ref={provided.innerRef} {...provided.droppableProps} className="img-container">
                                                                        {panelDatasetThird?.val?.NG &&
                                                                            panelDatasetThird.val.NG.map((img, index) => (
                                                                                ((index >= (valNgPage - 1) * NumPerPage) && (index < (valNgPage * NumPerPage))) &&
                                                                                <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                    onHover={(img: string): void => sethoverItem(img)}
                                                                                    onShiftSelect={handleShiftSelect}
                                                                                />
                                                                            ))}
                                                                        {provided.placeholder}
                                                                    </div>
                                                                )}
                                                            </Droppable>
                                                            <div className='my-page-row'>
                                                                <Stack spacing={2}>
                                                                    <Pagination count={Math.ceil(panelDatasetThird.val.NG.length / NumPerPage)} variant="outlined" shape="rounded" onChange={(e, v) => setValNgPage(v)} page={valNgPage} />
                                                                </Stack>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="my-golden-delete-container">
                                            <div className="my-golden-wrapper">
                                                <div className="my-train-val-title">
                                                    Golden
                                                    {goldenNum < 1 &&
                                                        <div className='my-info-tag'>
                                                            <FontAwesomeIcon icon={faCircleInfo} color="orange" style={{ width: 16, height: 16 }} size="4x" />
                                                            <div style={{ paddingTop: 2 }}> Need one.</div>
                                                        </div>
                                                    }
                                                </div>
                                                <Droppable droppableId="train_GOLDEN">
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`flex-row-center ${goldenNum < 1 ? 'my-golden-img-container-shadow-warn' : 'my-golden-img-container-shadow'}`}
                                                            onDoubleClick={(e) => { e.stopPropagation(); handleAreaSelectAll(5) }}
                                                            onClick={(e) => dispatch(setToggleArea(5))}
                                                            style={{ backgroundColor: (selectedArea === 5) ? '#D9FFFF' : '#FAFAFD' }}
                                                        >
                                                            {panelDatasetThird?.train?.GOLDEN &&
                                                                panelDatasetThird.train.GOLDEN.map((img, index) => (
                                                                    <DraggableCard key={img.image_uuid} index={index} item={img} isGolden
                                                                        onHover={(img: string): void => sethoverItem(img)}
                                                                        onShiftSelect={handleShiftSelect}
                                                                    />
                                                                ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                            <div className="my-delete-wrapper" >
                                                <div className="my-train-val-title" >
                                                    Delete
                                                </div>

                                                <Droppable droppableId="train_DELETE">
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.droppableProps} className="my-img-container-shadow"
                                                            onDoubleClick={(e) => { e.stopPropagation(); handleAreaSelectAll(6) }}
                                                            onClick={(e) => dispatch(setToggleArea(6))}
                                                            style={{ backgroundColor: (selectedArea === 6) ? '#D9FFFF' : '#FAFAFD' }}>
                                                            {panelDatasetThird?.train?.DELETE &&
                                                                panelDatasetThird.train.DELETE.map((img, index) => (
                                                                    ((index >= (trainDeletePage - 1) * NumPerPage) && (index < (trainDeletePage * NumPerPage))) &&
                                                                    <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                        onHover={(img: string): void => sethoverItem(img)}
                                                                        onShiftSelect={handleShiftSelect}
                                                                    />
                                                                ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                                <div className='my-page-del-row'>
                                                    <Stack spacing={2}>
                                                        <Pagination count={Math.ceil((panelDatasetThird.train.DELETE ? (panelDatasetThird.train.DELETE.length) : 0) / NumPerPage)} variant="outlined" shape="rounded" siblingCount={0} boundaryCount={0} onChange={(e, v) => setTrainDeletePage(v)} page={trainDeletePage} />
                                                    </Stack>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DragDropContext>
                        </div>
                    </div>
                    <ConfirmDialog {...{ openConfirmDialog, setOpenConfirmDialog, handleConfirm, confirmAttribute }} />
                    <ConfirmDialog
                        openConfirmDialog={openConfirmLeaveDialog}
                        setOpenConfirmDialog={setOpenConfirmLeaveDialog}
                        handleConfirm={handleConfirmLeave}
                        confirmAttribute={confirmLeaveAttribute}
                    />
                    <RatioDialog
                        {...{
                            openRatioDialog,
                            setOpenRatioDialog,
                            trainPass,
                            setTrainPass,
                            trainNg,
                            setTrainNg,
                            valPass,
                            setValPass,
                            valNg,
                            setValNg,
                            adjustRatio,
                        }}
                    />
                    <TrainingDialog {...{
                        currentProject,
                        setPageKey,
                    }}
                        ref={trainingDialogRef}
                    />
                    <HintDialog
                        ref={hintDialogRef}
                    />
                    <AddPicDialog
                        onAddPic={handleAddPic}
                        currentProject={currentProject}
                        ref={addPicDialogRef}
                    />
                    <WarningDialog
                        openWarningDialog={openWarningDialog}
                        setOpenWarningDialog={setOpenWarningDialog}
                        warningAttribute={warningGoldenCheckAttribute}
                    />
                    <LoadingOverlay show={isLoading} />
                </div>

            </ThemeProvider>
            <Utility ref={utilityRef} />
        </>
    );
};

export default SetAttributePage;
