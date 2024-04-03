import { Dispatch, FormEventHandler, MouseEventHandler, SetStateAction, useCallback, useEffect, useState, useRef, MouseEvent } from 'react';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ThemeProvider } from '@mui/material';
import { cloneDeep, filter, find, remove } from 'lodash';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import moment from"moment";
import Hotkeys from 'react-hot-keys';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentList, setToggleArea, setClearList, setSelectedList } from '../redux/store/slice/currentSelected';
import { selectCurrentDataset, setPanelDatasetThird} from '../redux/store/slice/currentDataset';

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
import ConfirmDialog from '../dialog/ConfirmDialog';
import RatioDialog from '../dialog/RatioDialog';
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

type SetAttributePagePageProps = {
    currentProject: ProjectDataType;
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
};

const SetAttributePage = (props: SetAttributePagePageProps) => {
    const { currentProject, setPageKey } = props;
    const [somethingChange, setSomethingChange] = useState(false);
    const [tempComp, setTempComp] = useState('');
    const [tempLight, setTempLight] = useState('');
    const [openConfirmLeaveDialog, setOpenConfirmLeaveDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openRatioDialog, setOpenRatioDialog] = useState(false);
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

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const dispatch = useDispatch();

    const panelDatasetThird = useSelector(selectCurrentDataset).dataset;
    const selectedList = useSelector(selectCurrentList).list;
    const selectedArea = useSelector(selectCurrentList).area;

    const trainNum = panelDatasetThird ? panelDatasetThird.train.PASS.length + panelDatasetThird.train.NG.length : 0;
    const valNum = panelDatasetThird ? panelDatasetThird.val.PASS.length + panelDatasetThird.val.NG.length : 0;
    const goldenNum = panelDatasetThird?.train?.GOLDEN ? panelDatasetThird.train.GOLDEN.length : 0;

   

    const passPanelRef = useRef<HTMLInputElement>(null);

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
            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const SaveFetchPanelDataset = useCallback(
        (exportId: string) => {
            fetch(panelDatasetAPI(exportId))
                .then((res) => res.json())
                .then((data) => {
                    setPanelInfo(data.info);
                    setPanelDataset(data.data);
                    if (selectComp) setPanelDatasetSecond(data.data[selectComp]);
                    if (selectComp && selectLight) dispatch(setPanelDatasetThird(data.data[selectComp][selectLight]));
                })
                .catch((err) => {
                    const msg = err?.response?.detail?.[0]?.msg || '';
                    const loc = err?.response?.detail?.[0]?.loc || [];
                    console.log(`API error: ${msg} [${loc.join(', ')}]`);
                });
        },
        [selectComp, selectLight],
    );

    const onDragEnd = (event:any) => {

        console.log('on drag end')
      

        //event.stopPropagation();

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

                if (moveItem) {
                    const pasteList = newPanelDataset[destTrainVal]?.[destType] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset[destTrainVal][destType] = pasteList;



                }

            });
            dispatch(setPanelDatasetThird(newPanelDataset));
            setSomethingChange(true);


        } else {
            // 按之前的方式

            const [removeItem] = sourceList.splice(source.index, 1);
            // 在destination位置貼上被拖曳的元素
            const pasteList = newPanelDataset[destTrainVal]?.[destType] || [];
            pasteList.splice(destination.index, 0, removeItem);
            newPanelDataset[destTrainVal][destType] = pasteList;
            dispatch(setPanelDatasetThird(newPanelDataset));
            setSomethingChange(true);
        };
    };

    const moveSelectedListToArea = (AreaNum: number) => {

        console.log('S ---> '+moment().format('YYYY-MM-DD HH:mm:ss'))


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
                }

                if (AreaNum === 2) {
                    pasteList = newPanelDataset['train']?.['NG'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['train']['NG'] = pasteList;
                }

                if (AreaNum === 3) {
                    pasteList = newPanelDataset['val']?.['PASS'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['val']['PASS'] = pasteList;
                }

                if (AreaNum === 4) {
                    pasteList = newPanelDataset['val']?.['NG'] || [];
                    pasteList.splice(0, 0, moveItem);
                    newPanelDataset['val']['NG'] = pasteList;
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
                }
            }

        });

        console.log('setPanelDatasetThird ---> '+moment().format('YYYY-MM-DD HH:mm:ss'))
        dispatch(setPanelDatasetThird(newPanelDataset));
        setSomethingChange(true);


        console.log('E ---> '+moment().format('YYYY-MM-DD HH:mm:ss'))

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

        if (e.code === 'Space') {
            if (hoverItem !== '') {
                if (show === false) setShow(true);
            }
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
        setSomethingChange(true);
    };

    const saveData = (exportId: string | null, data?: PanelDatasetType) => {
        if (!exportId) return;
        if (!data) return;
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
        setSomethingChange(false);
        setTempComp('');
        setTempLight('');
    };

    const handleAreaSelectAll = (areaNum: number) => {

        console.log('S ---> '+moment().format('YYYY-MM-DD HH:mm:ss'))

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

        console.log('E ---> '+moment().format('YYYY-MM-DD HH:mm:ss'))


    }

    const handleBodyDoubleClick = (actionName: string) => {

        console.log('actionName',actionName)

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
        setSomethingChange(false);
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

    useEffect(() => {
        if (currentProject.export_uuid) fetchPanelDataset(currentProject.export_uuid);
    }, [currentProject.export_uuid, fetchPanelDataset]);

    // 離開網站的提醒
    useEffect(() => {
        if (!somethingChange) return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
            return 'sure?';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [somethingChange]);

    useEffect(() => {
        if (passPanelRef.current) passPanelRef.current.focus();
    }, []);

    // useEffect(() => {
    //     console.log('selectedArea')
    //     console.log(selectedArea)
    // }, [selectedArea]);

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
                keyName="Space,Up,Down,Right,Left,Shift"
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
                                Classify Product of&nbsp;
                                <div className="title-name">
                                    <DivEllipsisWithTooltip>{currentProject.project_name}</DivEllipsisWithTooltip>
                                </div>
                            </span>
                            <div className="lower-right-button-container">
                                <span className="title-count">
                                    <span>
                                        ( Train_PASS: <b className={!panelInfo?.train.PASS ? 'red-font' : ''}>{panelInfo?.train.PASS || 0}</b>、
                                    </span>
                                    <span>
                                        Train_NG: <b className={!panelInfo?.train.NG ? 'red-font' : ''}>{panelInfo?.train.NG || 0}</b>、
                                    </span>
                                    <span>
                                        Val_PASS: <b className={!panelInfo?.val.PASS ? 'red-font' : ''}>{panelInfo?.val.PASS || 0}</b>、
                                    </span>
                                    <span>
                                        Val_NG: <b className={!panelInfo?.val.NG ? 'red-font' : ''}>{panelInfo?.val.NG || 0}</b> )
                                    </span>
                                </span>
                                <Button
                                    variant="contained"
                                    className="enlarge-button"
                                    sx={{ width: 160, fontSize: 16, textTransform: 'none', transition: 'transform 0.2s' }}
                                    onClick={() => ConvertPanelDataset(currentProject.project_uuid, currentProject.export_uuid)}
                                    disabled={!panelInfo?.train.PASS || !panelInfo?.train.NG || !panelInfo?.val.PASS || !panelInfo?.val.NG}
                                >
                                    Convert
                                </Button>
                            </div>
                        </div>
                        <div className="attribute-page-content">
                            <div className="component-container">
                                <div className="component-title">Component</div>
                                <div className="component-content">
                                    {panelDataset &&
                                        Object.keys(panelDataset).map((comp) => (
                                            <div
                                                key={comp}
                                                className={`component-item ${comp === selectComp ? 'component-item-selected' : ''}`}
                                                onClick={() => {

                                                    if (comp !== selectComp) {
                                                        if (somethingChange) {
                                                            setOpenConfirmLeaveDialog(true);
                                                            setTempComp(comp);
                                                        } else {
                                                            setSelectComp(comp);
                                                            setSelectLight('');
                                                            setPanelDatasetSecond(panelDataset[comp]);
                                                            dispatch(setPanelDatasetThird(undefined));
                                                            dispatch(setClearList());
                                                        }
                                                    }
                                                }}
                                            >
                                                {/* //若需勾選時使用
                          <input
                          type="checkbox"
                          name={comp}
                          // value={data.path}
                          checked={false}
                          disabled={!getCheckStatus(panelDataset[comp])}
                          onChange={() => {}}
                        /> */}
                                                <div className="component-text">
                                                    <DivEllipsisWithTooltip>{comp}</DivEllipsisWithTooltip>
                                                </div>
                                                {getCheckStatus(panelDataset[comp]) ? (
                                                    <FontAwesomeIcon icon={faCheck} color="green" size="lg" style={{ width: 18 }} />
                                                ) : (
                                                    <FontAwesomeIcon icon={faBan} color="orange" style={{ width: 18 }} />
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            <div className="component-container">
                                <div className="component-title">Light</div>
                                <div className="component-content">
                                    {panelDatasetSecond &&
                                        Object.keys(panelDatasetSecond).map((lightSource) => (
                                            <div
                                                key={lightSource}
                                                className={`component-item ${lightSource === selectLight ? 'component-item-selected' : ''}`}
                                                onClick={() => {

                                                    if (lightSource !== selectLight) {
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
                                                    <FontAwesomeIcon icon={faCheck} color="green" size="lg" style={{ width: 18 }} />
                                                ) : (
                                                    <FontAwesomeIcon icon={faBan} color="orange" style={{ width: 18 }} />
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            <div className="attribute-container">
                                <div className="attribute-title">

                                    Attribute
                                    {panelDatasetThird && (
                                        <span style={{ fontSize: 14, fontWeight: 400 }}> ※Press alt (or option) key and click to check full size image.</span>
                                    )}

                                    {panelDatasetThird && (
                                        <div style={{ marginBottom: '3px' }}>
                                            <Button
                                                variant="outlined"
                                                className="enlarge-button"
                                                sx={{
                                                    width: 'auto',
                                                    height: 30,
                                                    fontSize: 14,
                                                    padding: '2px 6px',
                                                    marginRight: '6px',
                                                    textTransform: 'none',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onClick={() => {
                                                    const trainPass = panelDatasetThird.train.PASS.length;
                                                    const valPass = panelDatasetThird.val.PASS.length;
                                                    const trainNg = panelDatasetThird.train.NG.length;
                                                    const valNg = panelDatasetThird.val.NG.length;
                                                    setTrainPass(Math.floor((trainPass / (trainPass + valPass)) * 100) || 0);
                                                    setValPass(100 - Math.floor((trainPass / (trainPass + valPass)) * 100) || 0);
                                                    setTrainNg(Math.floor((trainNg / (trainNg + valNg)) * 100) || 0);
                                                    setValNg(100 - Math.floor((trainNg / (trainNg + valNg)) * 100) || 0);
                                                    setOpenRatioDialog(true);
                                                }}
                                            >
                                                Ratio distribution
                                            </Button>
                                            <Button
                                                variant="contained"
                                                className="enlarge-button"
                                                sx={{
                                                    width: 100,
                                                    height: 30,
                                                    fontSize: 14,
                                                    boxShadow: 'none',
                                                    padding: '2px 6px',
                                                    textTransform: 'none',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onClick={() => setOpenConfirmDialog(true)}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <DragDropContext onDragEnd={onDragEnd}>
                                {panelDatasetThird && (
                                    <div className="attribute-content">
                                        <div className="train-val-container">
                                            <div className="train-val-wrapper">
                                                <div className="train-val-title">
                                                    Train
                                                    {trainNum < 2 && <span> (Pass + ng need at least two.)</span>}
                                                </div>
                                                <div className="pass-ng-container">
                                                    <div className={trainNum < 2 ? 'pass-ng-wrapper-warn' : 'pass-ng-wrapper'} onClick={(e)=>dispatch(setToggleArea(1))} onDoubleClick={(e) => {e.stopPropagation();handleAreaSelectAll(1)}} style={{ backgroundColor: (selectedArea === 1) ? '#D9FFFF' : '#FFFFFF' }}>
                                                        <div className="pass-ng-title" ref={passPanelRef}>PASS ({panelDatasetThird.train.PASS.length})</div>
                                                        {/* <OutsideClickHandler
                                                            onOutsideClick={handleOutsideClick.bind(this)}
                                                        > */}
                                                        <Droppable droppableId="train_PASS">
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.droppableProps} className="img-container" >
                                                                    {panelDatasetThird?.train?.PASS &&
                                                                        panelDatasetThird.train.PASS.map((img, index) => (
                                                                            <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                onHover={(img: string): void => sethoverItem(img)}
                                                                                onShiftSelect={handleShiftSelect}
                                                                            />
                                                                        ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                        {/* </OutsideClickHandler> */}
                                                    </div>
                                                    <div className={trainNum < 2 ? 'pass-ng-wrapper-warn' : 'pass-ng-wrapper'} onClick={(e)=>dispatch(setToggleArea(2))} onDoubleClick={(e) => {e.stopPropagation();handleAreaSelectAll(2)}} style={{ backgroundColor: (selectedArea === 2) ? '#D9FFFF' : '#FFFFFF' }}>
                                                        <div className="pass-ng-title">NG ({panelDatasetThird.train.NG.length})</div>
                                                        <Droppable droppableId="train_NG">
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.droppableProps} className="img-container">
                                                                    {panelDatasetThird?.train?.NG &&
                                                                        panelDatasetThird.train.NG.map((img, index) => (
                                                                            <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                onHover={(img: string): void => sethoverItem(img)}
                                                                                onShiftSelect={handleShiftSelect}
                                                                            />
                                                                        ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="train-val-wrapper">
                                                <div className="train-val-title">
                                                    Val
                                                    {valNum < 1 && <span> (Pass + ng need at least one.)</span>}
                                                </div>
                                                <div className="pass-ng-container">
                                                    <div className={valNum < 1 ? 'pass-ng-wrapper-warn' : 'pass-ng-wrapper'} onClick={(e)=>dispatch(setToggleArea(3))} onDoubleClick={(e) => {e.stopPropagation();handleAreaSelectAll(3)}} style={{ backgroundColor: (selectedArea === 3) ? '#D9FFFF' : '#FFFFFF' }}>
                                                        <div className="pass-ng-title">PASS ({panelDatasetThird.val.PASS.length})</div>
                                                        <Droppable droppableId="val_PASS">
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.droppableProps} className="img-container">
                                                                    {panelDatasetThird?.val?.PASS &&
                                                                        panelDatasetThird.val.PASS.map((img, index) => (
                                                                            <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                onHover={(img: string): void => sethoverItem(img)}
                                                                                onShiftSelect={handleShiftSelect}
                                                                            />
                                                                        ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </div>
                                                    <div className={valNum < 1 ? 'pass-ng-wrapper-warn' : 'pass-ng-wrapper'} onClick={(e)=>dispatch(setToggleArea(4))} onDoubleClick={(e) => {e.stopPropagation();handleAreaSelectAll(4)}} style={{ backgroundColor: (selectedArea === 4) ? '#D9FFFF' : '#FFFFFF' }}>
                                                        <div className="pass-ng-title">NG ({panelDatasetThird.val.NG.length})</div>
                                                        <Droppable droppableId="val_NG">
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.droppableProps} className="img-container">
                                                                    {panelDatasetThird?.val?.NG &&
                                                                        panelDatasetThird.val.NG.map((img, index) => (
                                                                            <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                                onHover={(img: string): void => sethoverItem(img)}
                                                                                onShiftSelect={handleShiftSelect}
                                                                            />
                                                                        ))}
                                                                    {provided.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="golden-delete-container">
                                            <div className="golden-wrapper">
                                                <div className="train-val-title">
                                                    Golden
                                                    {goldenNum < 1 && <span> (Need one.)</span>}
                                                </div>
                                                <Droppable droppableId="train_GOLDEN">
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`flex-row-center ${goldenNum < 1 ? 'img-container-shadow-warn' : 'img-container-shadow'}`}
                                                            onDoubleClick={(e) => {e.stopPropagation();handleAreaSelectAll(5)}}
                                                            onClick={(e)=>dispatch(setToggleArea(5))} 
                                                            style={{ backgroundColor: (selectedArea === 5) ? '#D9FFFF' : '#FFFFFF' }}
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
                                            <div className="delete-wrapper" >
                                                <div className="train-val-title" >
                                                    Delete
                                                </div>
                                                <Droppable droppableId="train_DELETE">
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.droppableProps} className="img-container-shadow"
                                                            onDoubleClick={(e) => {e.stopPropagation();handleAreaSelectAll(6)}}
                                                            onClick={(e)=>dispatch(setToggleArea(6))}
                                                            style={{ backgroundColor: (selectedArea === 6) ? '#D9FFFF' : '#FFFFFF' }}>
                                                            {panelDatasetThird?.train?.DELETE &&
                                                                panelDatasetThird.train.DELETE.map((img, index) => (
                                                                    <DraggableCard key={img.image_uuid} index={index} item={img}
                                                                        onHover={(img: string): void => sethoverItem(img)}
                                                                        onShiftSelect={handleShiftSelect}
                                                                    />
                                                                ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
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
                        <WarningDialog
                            openWarningDialog={openWarningDialog}
                            setOpenWarningDialog={setOpenWarningDialog}
                            warningAttribute={warningGoldenCheckAttribute}
                        />
                        <LoadingOverlay show={isLoading} />
                    </div>
                
            </ThemeProvider>
        </>
    );
};

export default SetAttributePage;
