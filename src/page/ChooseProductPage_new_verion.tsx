import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState, useRef, ElementRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './page.scss';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ThemeProvider } from '@mui/material';
import { cloneDeep, filter, find, remove, flatMap, uniq, sortBy } from 'lodash';
import Select, { Props as SelectProps } from 'react-select';
import moment from 'moment';
import Box from '@mui/joy/Box';
import Checkbox from '@mui/joy/Checkbox';
import { CssVarsProvider } from '@mui/joy/styles';
import Input from '@mui/joy/Input';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import LooksOneTwoToneIcon from '@mui/icons-material/LooksOneTwoTone';
import LooksTwoTwoToneIcon from '@mui/icons-material/LooksTwoTwoTone';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



import MemoryIcon from '@mui/icons-material/Memory';
import TodayIcon from '@mui/icons-material/Today';
import Sheet from '@mui/joy/Sheet';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import JoyButton from '@mui/joy/Button';
import '@fontsource/inter';

import { copyToLocalAPI, dataSourceAPI } from '../APIPath';
import DivEllipsisWithTooltip from '../components/DivEllipsisWithTooltip';
import { Tooltip } from '@mui/material';
import ProgressDialog from '../dialog/ProgressDialog';
import LoadingOverlay from '../components/LoadingOverlay';
import ReactSelectSingle from '../components/Dropdowns/ReactSelectSingle';
import { theme } from './ProjectPage';

import MonthSelector, { MonthSelectorRef } from '../components/Dropdowns/MonthSelector';
import ModelSelector, { ModelSelectorRef } from '../components/Dropdowns/ModelSelector';
//import CustomCheckBox from '../components/CheckBoxs/CustomCheckBox';


import { PageKeyType, ProjectDataType, FileType, PathListType, OptionType } from './type';
import { selectCurrentPathList, setAddPathList, setPathListEmpty, setPathListFirstEmpty, setPathListSecondEmpty, setPathListFirst, setPathListSecond, setPathListThird, setPathList } from '../redux/store/slice/currentPathList';
import { setShow, setMessage } from '../redux/store/slice/currentMessage';


type DataSourceType = {
    check_count: string | null;
    path: string;
};



type ChooseProductPageProps = {
    currentProject: ProjectDataType;
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
};

export interface SelectRef {
    focus: () => void;
}

const ChooseProductPage = (props: ChooseProductPageProps) => {
    const { currentProject, setPageKey } = props;
    const [dataPath, setDataPath] = useState('');
    //const [pathList, setPathList] = useState<DataSourceType[]>();
    //const [pathListSecond, setPathListSecond] = useState<DataSourceType[]>();
    //const [pathListThird, setPathListThird] = useState<DataSourceType[]>();
    const [pathListThirdSearch, setPathListThirdSearch] = useState<DataSourceType[]>();
    const [pathListSearch, setPathListSearch] = useState<PathListType[]>([]);
    const [selectedPathList, setSelectedPathList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingFirst, setIsFetchingFirst] = useState(false);
    const [isFetchingSecond, setIsFetchingSecond] = useState(false);
    const [isFetchingThird, setIsFetchingThird] = useState(false);
    const [searchString, setSearchString] = useState('');

    const [monthOption, setMonthOption] = useState<OptionType[]>([{ value: '', label: '' }]);

    const [modelOption, setModelOption] = useState<OptionType[]>([{ value: '', label: '' }]);

    // const [fromDate, setFromDate] = useState<string>(moment().format("YYYY-MM-DD"));
    // const [toDate, setToDate] = useState<string>(moment().format("YYYY-MM-DD"));

    const [fromDate, setFromDate] = useState<string>('2023-06-01');
    const [toDate, setToDate] = useState<string>('2023-06-10');

    const [modelName, setModelName] = useState<string>('4DM24DK');

    const [openProgressDialog, setOpenProgressDialog] = useState(false);
    const [progressMessage, setProgressMessage] = useState('Loading...');
    const [progressPercent, setProgressPercent] = useState(0);


    const [monthSelectedOption, setMonthSelectedOption] = useState<OptionType | null>({ value: '', label: '' });


    // for prevent strict mode useeffect call twice
    const initialized = useRef(false)

    const [modelArr, setModelArr] = useState<string[][]>([['202306', '2023-06']]);

    const monthSelectorRef = useRef<MonthSelectorRef>(null);
    const modelSelectorRef = useRef<ModelSelectorRef>(null);



    const dispatch = useDispatch();

    const currentPathListFirst = useSelector(selectCurrentPathList).pathListFirst;
    const currentPathListSecond = useSelector(selectCurrentPathList).pathListSecond;
    const currentPathListThird = useSelector(selectCurrentPathList).pathListThird;
    const currentPathList = useSelector(selectCurrentPathList).pathList;

    const delay = (ms: number) => new Promise((resolve) => {
        setTimeout(() => resolve(ms), ms)
    })

    const fetchDataSource = (layer: 1 | 2 | 3, path?: string) => {

        console.log('layer', layer);
        console.log('path', path);

        if (layer === 1) setIsFetchingFirst(true);
        if (layer === 2) setIsFetchingSecond(true);
        if (layer === 3) setIsFetchingThird(true);
        fetch(dataSourceAPI(path))
            .then((res) => res.json())
            .then((data) => {

                console.log('data', data);

                if (layer === 1) {
                    // setPathList(data);
                    // setIsFetchingFirst(false);
                }
                if (layer === 2) {
                    dispatch(setPathListSecond(data));
                    setIsFetchingSecond(false);
                }
                if (layer === 3) {
                    setPathListThird(data);
                    setPathListThirdSearch(data);
                    setIsFetchingThird(false);
                }
            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            });
    };

    const fetchData = () => {

        dispatch(setPathListEmpty());

        fetch(dataSourceAPI(undefined))
            .then((res) => res.json())
            .then((data) => {

                const dateArr = flatMap(data, item => {
                    return item.path;
                })

                let i = 0;

                dateArr.forEach((item2) => {

                    i++;

                    console.log(i, item2)


                    if ((i >= 203) && (i <= 230)) {

                        console.log(item2)

                        fetch(dataSourceAPI(item2))
                            .then((res2) => res2.json())
                            .then((data2) => {


                                data2.forEach((item3: FileType) => {

                                    const myPath = item3.path;

                                    fetch(dataSourceAPI(myPath))
                                        .then((res3) => res3.json())
                                        .then((data3) => {

                                            data3.forEach((item4: FileType) => {

                                                const myArr = item4.path.split("/");
                                                const myList: PathListType = {
                                                    date: myArr[0],
                                                    station: myArr[1],
                                                    model: myArr[2]
                                                }

                                                dispatch(setAddPathList(myList));

                                            })

                                        });

                                })

                            }).catch((err) => {
                                const msg = err?.response?.detail?.[0]?.msg || '';
                                const loc = err?.response?.detail?.[0]?.loc || [];
                                console.log(`API error: ${msg} [${loc.join(', ')}]`);
                            });

                    }
                })



            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            });

    }

    const fetchDataDate = () => {

        console.log('fetch date begin ....')

        dispatch(setPathListFirstEmpty());

        fetch(dataSourceAPI())
            .then((res) => res.json())
            .then((data) => {

                const dateArr = flatMap(data, item => {
                    return item.path;
                })
                dispatch(setPathListFirst(dateArr));

                console.log('fetch date end ....')

            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            });

    }

    const fetchDataMonth_xx = (theMonth: OptionType | null) => {

        console.log('fetchDataMonth', theMonth)

        setIsLoading(true);

        if (theMonth) {

            let myDateArr = filter(
                currentPathListFirst, function (item) {
                    return (item.substring(0, 6) === theMonth.value);
                }
            );

            let requests = myDateArr.map(async function (item) {

                const res = await fetch(dataSourceAPI(item));
                return await res.json();

            });

            let tempPathListSecond: string[] = [];

            Promise.all(requests)
                .then((results) => {

                    results.forEach((item) => {
                        const pathArr = flatMap(item, item2 => {
                            return item2.path;
                        })
                        //console.log('pathArr ---> ', pathArr)
                        tempPathListSecond.push(...pathArr)
                    });

                    dispatch(setPathListSecond(tempPathListSecond));


                }).catch(function (err) {
                    const msg = err?.response?.detail?.[0]?.msg || '';
                    const loc = err?.response?.detail?.[0]?.loc || [];
                    console.log(`API error: ${msg} [${loc.join(', ')}]`);
                })

        }




    }

    const fetchDataMonth = async (theMonth: OptionType | null) => {

        console.log('fetchDataMonth', theMonth)

        if (theMonth) {

            let myDateArr = filter(
                currentPathListFirst, function (item) {
                    return (item.substring(0, 6) === theMonth.value);
                }
            );

            setOpenProgressDialog(true);
            setProgressMessage('Loading...');
            setProgressPercent(0);

            let tempPathList: PathListType[] = [];
            for (let i = 0; i < myDateArr.length; i++) {

                const req1 = await fetch(dataSourceAPI(myDateArr[i]));
                const res1 = await req1.json();

                const pathArr = flatMap(res1, item2 => {
                    return item2.path;
                });

                for (let j = 0; j < pathArr.length; j++) {

                    const req2 = await fetch(dataSourceAPI(pathArr[j]));
                    const res2 = await req2.json();

                    const pathArr2 = flatMap(res2, item2 => {
                        return item2.path;
                    })

                    pathArr2.forEach((item2) => {
                        const myArr = item2.split("/");
                        let myObj: PathListType = { "date": "", "station": "", "model": "" };
                        myObj.date = myArr[0];
                        myObj.station = myArr[1];
                        myObj.model = myArr[2];
                        tempPathList.push(myObj);

                    })

                }

                setProgressMessage(moment(myDateArr[i], 'YYYYMMDD').format('YYYY-MM-DD'));
                setProgressPercent(Math.round((i + 1) / myDateArr.length * 100));

            }
            dispatch(setPathList(tempPathList));

            const myArr1 = flatMap(tempPathList, item2 => {
                return item2.model;
            })

            let myArr2: OptionType[] = [];
            uniq(myArr1).forEach((myItem) => {
                myArr2.push({ "value": myItem, "label": myItem });
            })

            setModelOption(myArr2);
            if (myArr2.length > 0) {
                const myLastOption = myArr2[0];
                //setModelSelectedOption(myLastOption);

                if (modelSelectorRef.current) {
                    modelSelectorRef.current.setValue(myLastOption);
                }

                const pathListSearchArr = filter(tempPathList, function (o) { return o.model === myLastOption.value; });
                setPathListSearch(pathListSearchArr);
            }

            await delay(1000);
            setOpenProgressDialog(false)

        }

    }

    const fetchDataSingleDay_xx = (myDate: string, myModel: string) => {

        console.log('myDate', myDate);
        console.log('myModel', myModel);
        const myDateArr = [myDate];

        let req1 = myDateArr.map(async function (item) {

            const res = await fetch(dataSourceAPI(item));
            return await res.json();

        });

        Promise.all(req1)
            .then((res1) => {

                console.log(" (@) res1----------------------------", res1);

                if (res1[0][0].msg) {
                    console.log(myDate + ' no data')
                    setProgressPercent((prev) => prev + 1);
                } else {

                    res1.forEach((item) => {

                        const pathArr = flatMap(item, item2 => {
                            return item2.path;
                        })
                        const myStationArr = pathArr;

                        let req2 = myStationArr.map(async function (item) {

                            //const orderResult = [];
                            const res = await fetch(dataSourceAPI(item));
                            // orderResult.push(res);
                            return await res.json();

                        });

                        Promise.all(req2)
                            .then((res2) => {

                                res2.forEach((item) => {
                                    const pathArr = flatMap(item, item2 => {
                                        return item2.path;
                                    })

                                    pathArr.forEach((item) => {
                                        if (item) {
                                            const modelName = item.split("/")[2];
                                            if (modelName.indexOf(myModel) >= 0) {
                                                const myItem = { "date": item.split("/")[0], "station": item.split("/")[1], "model": item.split("/")[2] };
                                                setPathListSearch(oldArray => [...oldArray, myItem]);
                                            }
                                        }

                                    })

                                    //console.log('item--->',item);
                                    console.log(moment().format("YYYY-MM-DD HH:mm:ss"));

                                });
                            }).finally(() => {
                                console.log(" (*) finally----------------------------", myDate);


                                console.log(moment().format("YYYY-MM-DD HH:mm:ss"));

                                setProgressMessage(myDate);
                                setProgressPercent((prev) => prev + 1);
                                //setOpenProgressDialog(false);
                            });

                    });

                }

            }).catch(function (err) {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            }).finally(() => {
                console.log("finally----------------------------", myDate);
                console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
                setProgressMessage('--' + myDate + '---');
            });

        //
    }

    const fetchDataSingleDay = async (myDate: string, myModel: string) => {

        const req1 = await fetch(dataSourceAPI(myDate))
        const statusCode1 = req1.status;
           
        if (statusCode1===200) {
            const res1 = await req1.json()
            const pathArr = flatMap(res1, item2 => {
                return item2.path;
            })
    
            pathArr.map(async function (item) {
    
                const req2 = await fetch(dataSourceAPI(item));
                const statusCode2 = req2.status;
                const res2 = await req2.json();
                
    
                if (statusCode2===200) {
        
                 
                    const pathArr = flatMap(res2, item2 => {
                        return item2.path;
                    })
        
                    pathArr.forEach((item) => {
    
                        if (item) {
    
                            const modelName = item.split("/")[2];
    
                            if (modelName.indexOf(myModel) >= 0) {
                                const myItem = { "date": item.split("/")[0], "station": item.split("/")[1], "model": item.split("/")[2] };
                                setPathListSearch(oldArray => [...oldArray, myItem]);
                            }
                        }
        
                    })
    
                }
    
              
    
    
            });
        }
           


       




    }

    const copyToLocal = (projectId: string, datasetId: string, postList: string[]) => {
        if (postList.length < 1) return alert('Please select panel.');
        const postData = {
            project_uuid: projectId,
            dataset_uuid: datasetId,
            panel_path_list: postList,
            filter_top_k: 2,
        };
        fetch(copyToLocalAPI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then(() => {
                setPageKey('LoadingCopyToLocalPage');
            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
            })
            .finally(() => setIsLoading(false));
    };

    const setDataSearch = (item: OptionType | null) => {
        if (item) {
            const pathListSearchArr = filter(currentPathList, function (o) { return o.model === item.value; });
            setPathListSearch(pathListSearchArr);
        }

    }


    const handleDelete = (index: number) => {
        setSelectedPathList((state) => {
            const result = state.slice(0, index).concat(state.slice(index + 1));
            return result;
        });
    };

    const handleChange = (dataPath: string) => {
        const index = selectedPathList.findIndex((item) => item === dataPath);
        if (index > -1) {
            setSelectedPathList((state) => {
                const result = state.slice(0, index).concat(state.slice(index + 1));
                return result.sort();
            });
        } else {
            setSelectedPathList((state) => state.concat(dataPath).sort());
        }
    };

    const handleSelectAll = (pathListSelect: DataSourceType[] | undefined) => {
        if (!pathListSelect) return;
        const sourceIdList = pathListSelect.map((path) => path.path);
        setSelectedPathList((state) => {
            return state.filter((path) => !sourceIdList.includes(path)).concat(sourceIdList);
        });
    };

    const handleSearchSelectAll = (pathListSelect: PathListType[] | undefined) => {
        if (!pathListSelect) return;
        const sourceIdList = pathListSelect.map((data) => data.date + '/' + data.station + '/' + data.model);
        setSelectedPathList((state) => {
            return state.filter((path) => !sourceIdList.includes(path)).concat(sourceIdList);
        });
    };

    const handleSearchDeselectAll = (pathListSelect: PathListType[] | undefined) => {
        if (!pathListSelect) return;
        const sourceIdList = pathListSelect.map((data) => data.date + '/' + data.station + '/' + data.model);
        setSelectedPathList((state) => {
            return state.filter((path) => !sourceIdList.includes(path));
        });
    };

    const handleDeselectAll = (pathListSelect: DataSourceType[] | undefined) => {
        if (!pathListSelect) return;
        const sourceIdList = pathListSelect.map((path) => path.path);
        setSelectedPathList((state) => {
            return state.filter((path) => !sourceIdList.includes(path));
        });
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        if (!currentPathListThird) return;
        const searchTerm = e.target.value.toLowerCase();
        setSearchString(searchTerm);

        const results = currentPathListThird.filter((item) => {
            const matchResult = item.match(/\/([^/]+)\/?$/);
            if (matchResult) return matchResult[1].toLowerCase().includes(searchTerm);
            return true;
        });

        //setPathListThirdSearch(results);
    };



    useEffect(() => {

        // if (!initialized.current) {
        //     initialized.current = true
        //     fetchDataDate();
        // }

        fetchDataDate();

    }, []);


    useEffect(() => {

        // handle fetched date data
        if (currentPathListFirst.length > 0) {
            let myArr1: string[] = [];
            currentPathListFirst.forEach((myItem) => {
                myArr1.push(myItem.slice(0, 6))
            })

            let myArr2: OptionType[] = [];
            uniq(myArr1).forEach((myItem) => {
                myArr2.push({ "value": myItem, "label": myItem.substring(0, 4) + '-' + myItem.substring(4, 6) });
            })
            setMonthOption(myArr2);
           
        }

    }, [currentPathListFirst]);

    useEffect(() => {

        // handle fetched date data
        if (currentPathListSecond.length > 0) {

            // console.log('currentPathListSecond');
            // console.log(currentPathListSecond)
            let requests = currentPathListSecond.map(async function (item) {

                const res = await fetch(dataSourceAPI(item));
                return await res.json();

            });

            let tempPathList: string[] = [];

            Promise.all(requests)
                .then((results) => {

                    //console.log('results ---> ', results)

                    results.forEach((item) => {
                        const pathArr = flatMap(item, item2 => {
                            return item2.path;
                        })
                        //console.log('pathArr ---> ', pathArr)
                        tempPathList.push(...pathArr)
                    });

                    dispatch(setPathListThird(tempPathList));

                    let myTempPathArr: PathListType[] = [];
                    tempPathList.forEach((item) => {

                        const myArr = item.split("/");
                        let myObj: PathListType = { "date": "", "station": "", "model": "" };
                        myObj.date = myArr[0];
                        myObj.station = myArr[1];
                        myObj.model = myArr[2];
                        myTempPathArr.push(myObj);

                        // console.log(item)
                        // console.log(myObj)

                    });
                    dispatch(setPathList(myTempPathArr));


                    flatMap(myTempPathArr)

                    const modelArr = flatMap(myTempPathArr, item => {
                        return item.model;
                    })


                    let myModelOptions: OptionType[] = [];
                    uniq(modelArr).forEach((myItem) => {
                        myModelOptions.push({ "value": myItem, "label": myItem });
                    })


                    let mySortModelOptions = sortBy(myModelOptions, function (o) { return o.value; });


                    setModelOption(mySortModelOptions);

                    if (mySortModelOptions.length > 0) {
                        if (modelSelectorRef.current) modelSelectorRef.current.setValue(mySortModelOptions[0]);
                    }

                    setIsLoading(false);


                }).catch(function (err) {
                    const msg = err?.response?.detail?.[0]?.msg || '';
                    const loc = err?.response?.detail?.[0]?.loc || [];
                    console.log(`API error: ${msg} [${loc.join(', ')}]`);
                })
        }

    }, [currentPathListSecond]);

    const onMonthChange = (newValue: OptionType | null) => {
        //console.log(option)
        setMonthSelectedOption(newValue);
    }


    const searchByName = async () => {

        console.log('search by name')

        if (modelName.trim() === '') {

            dispatch(setMessage('Model name is empty!'));
            dispatch(setShow(true));

            return;
        }

        setOpenProgressDialog(true);
        setProgressMessage('Loading...');
        setProgressPercent(0);
        setPathListSearch([]);

        const theFromDate = moment(fromDate, "YYYYMMDD");
        const theToDate = moment(toDate, "YYYYMMDD");
        const totalDays = theToDate.diff(theFromDate, 'days') + 1;

        let currentCount = 1;
        for (let i = theFromDate; theToDate.diff(theFromDate, 'days') >= 0; theFromDate.add(1, 'days')) {

            await fetchDataSingleDay(i.format("YYYYMMDD"), modelName);
            setProgressMessage(i.format("YYYY-MM-DD"));
            setProgressPercent(Math.round(currentCount / totalDays * 100));
            currentCount++;
        }



        await delay(1000);
        setOpenProgressDialog(false);
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <div className="container">
                    <div className="dataSource-wrapper">
                        <div className="title-container">
                            <span className="title-style">
                                Choose Product of&nbsp;
                                <Tooltip enterDelay={500} enterNextDelay={500} title={currentProject.project_name} arrow>
                                    <div className='my-project-name'>
                                        {currentProject.project_name}
                                    </div>
                                </Tooltip>
                            </span>
                            <div className="lower-right-button-container">
                                <Button
                                    variant="outlined"
                                    className="enlarge-button"
                                    sx={{
                                        width: 160,
                                        fontSize: 16,
                                        textTransform: 'none',
                                        boxShadow: '0px 2px 2px 0px #00000020',
                                        transition: 'transform 0.2s',
                                    }}
                                    onClick={() => setPageKey('ExportProductPage')}
                                >
                                    Skip
                                </Button>
                                <Button
                                    variant="contained"
                                    className="enlarge-button"
                                    sx={{ width: 160, fontSize: 16, textTransform: 'none', transition: 'transform 0.2s' }}
                                    onClick={() => copyToLocal(currentProject.project_uuid, currentProject.dataset_uuid, selectedPathList)}
                                >
                                    Copy to local
                                </Button>
                            </div>
                        </div>


                        <div className='d-flex flex-column mt-2'>
                            <CssVarsProvider>
                                <Tabs aria-label="Basic tabs"
                                    defaultValue={0}
                                    sx={{
                                        backgroundColor: 'transparent'
                                    }}
                                    onChange={()=>{setPathListSearch([]);}}
                                >
                                    <TabList >
                                        <Tab>
                                            <ListItemDecorator>
                                                <LooksOneTwoToneIcon
                                                    sx={{
                                                        color: '#ed1b23',
                                                        fontSize: '30px'
                                                    }} />
                                            </ListItemDecorator>
                                            <div className='my-tag'>Search by month</div>
                                        </Tab>
                                        <Tab>
                                            <ListItemDecorator>
                                                <LooksTwoTwoToneIcon sx={{
                                                    color: '#ed1b23',
                                                    fontSize: '30px'
                                                }} />
                                            </ListItemDecorator>
                                            <div className='my-tag'>Search by model</div>

                                        </Tab>
                                    </TabList>
                                    <TabPanel value={0}>
                                        <div className="d-flex flex-row mt-2 gap-2">
                                            <MonthSelector options={monthOption} onChange={(item: OptionType | null) => { console.log(item); fetchDataMonth(item);setMonthSelectedOption(item); }} className="my-month-select" ref={monthSelectorRef} />
                                            <ModelSelector options={modelOption} onChange={(item: OptionType | null) => { console.log(item); setDataSearch(item); }} className="my-model-select" ref={modelSelectorRef} />
                                        </div>
                                    </TabPanel>
                                    <TabPanel value={1}>
                                        <div className="d-flex flex-row mt-2 gap-2">
                                           
                                            <DatePicker  
                                                dateFormat="yyyy-MM-dd" 
                                                className='form-control form-control-solid w-250px' 
                                                selected={new Date(fromDate)} 
                                                onChange={(date) => {setFromDate(date?date.toISOString().slice(0, 10):'');setToDate(date?date.toISOString().slice(0, 10):'')}} 
                                            />

                                            <DatePicker  
                                                dateFormat="yyyy-MM-dd" 
                                                className='form-control form-control-solid w-250px' 
                                                selected={new Date(toDate)} 
                                                onChange={(date) => setToDate(date?date.toISOString().slice(0, 10):'')} 
                                            />
                                           

                                            
                                            <Input placeholder='Model name here...' sx={{ height: '38px' }} value={modelName}
                                                onChange={(event: ChangeEvent<HTMLInputElement>) => setModelName(event.target.value)}
                                            />

                                            <JoyButton sx={{
                                                backgroundColor: '#ed1b23',
                                                fontFamily: 'Google Noto Sans TC',
                                                "&:hover": {
                                                    backgroundColor: '#A51218'
                                                },
                                            }}
                                                onClick={() => searchByName()}
                                            >Search</JoyButton>
                                        </div>

                                    </TabPanel>
                                </Tabs>
                            </CssVarsProvider>
                        </div>



                        <div className="dataSource-content">
                            <div className="dataSource-layer-container">

                                <div className="second-title-container">
                                    <span className="second-title-style">Candidate path</span>
                                    {
                                        pathListSearch.length > 0 &&
                                        // ↓全選的時候變成deselect按鈕
                                        selectedPathList.filter((path) => pathListSearch.map((data) => data.date + '/' + data.station + '/' + data.model).includes(path)).length ===
                                        pathListSearch.length ?
                                        (

                                            <Button
                                                variant="contained"
                                                className="enlarge-button"
                                                sx={{ fontSize: 14, padding: '1px 12px', textTransform: 'none', transition: 'transform 0.2s' }}
                                                onClick={() => handleSearchDeselectAll(pathListSearch)}
                                            >
                                                Deselect all
                                            </Button>

                                        ) : (
                                           

                                                <Button
                                                    variant="contained"
                                                    className="enlarge-button"
                                                    sx={{ fontSize: 14, padding: '1px 12px', textTransform: 'none', transition: 'transform 0.2s' }}
                                                    onClick={() => handleSearchSelectAll(pathListSearch)}
                                                >
                                                    Select all
                                                </Button>


                                            
                                        )
                                    }
                                </div>

                                <div className="dataSource-layer-wrapper">

                                    <div className="dataSource-layer">
                                        {isFetchingThird && (
                                            <div className="dataSource-overlay">
                                                <div className="loading-icon" />
                                            </div>
                                        )}



                                        <div className='my-dataSource-head'>
                                            <div className="my-talbe-th" style={{ width: '10%' }}>
                                                {/* <CssVarsProvider>
                                                <Checkbox />
                                            </CssVarsProvider> */}
                                            </div>
                                            <div className="my-talbe-th" style={{ width: '20%' }}>Date</div>
                                            <div className="my-talbe-th" style={{ width: '30%' }}>Station</div>
                                            <div className="my-talbe-th" style={{ width: '40%' }}>Model</div>
                                        </div>

                                        <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                                            {pathListSearch &&
                                                (pathListSearch.length > 0 ? (
                                                    pathListSearch.map((data, idx) => {
                                                        // const matchResult = data.path.match(/\/([^/]+)\/?$/);
                                                        return (
                                                            <div key={idx}>
                                                                <label
                                                                    className={`dataSource-item ${selectedPathList.findIndex((item) => item === data.date + '/' + data.station + '/' + data.model) > -1 && 'dataSource-item-selected'
                                                                        }`}
                                                                >
                                                                    <div style={{ width: '10%' }} className='my-talbe-td'>
                                                                        <input
                                                                            type="checkbox"
                                                                            name={data.date + '/' + data.station + '/' + data.model}
                                                                            value={data.date + '/' + data.station + '/' + data.model}
                                                                            checked={selectedPathList.findIndex((item) => item === data.date + '/' + data.station + '/' + data.model) > -1}
                                                                            onChange={() => handleChange(data.date + '/' + data.station + '/' + data.model)}
                                                                        />
                                                                    </div>
                                                                    <div style={{ width: '20%' }} className='my-talbe-td'>
                                                                        <DivEllipsisWithTooltip>{data.date}</DivEllipsisWithTooltip>
                                                                    </div>
                                                                    <div style={{ width: '30%' }} className='my-talbe-td'>
                                                                        <DivEllipsisWithTooltip>{data.station}</DivEllipsisWithTooltip>
                                                                    </div>
                                                                    <div style={{ width: '40%' }} className='my-talbe-td'>
                                                                        <DivEllipsisWithTooltip>{data.model}</DivEllipsisWithTooltip>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="center-block"></div>
                                                ))}
                                        </div>




                                    </div>
                                </div>
                            </div>


                            <div className="dataSource-layer-container">

                                <div className="second-title-container">
                                    <span className="second-title-style">Selected path</span>
                                    <Button
                                        variant="contained"
                                        className="enlarge-button"
                                        sx={{ width: 80, fontSize: 14, padding: '1px 4px', textTransform: 'none', transition: 'transform 0.2s' }}
                                        onClick={() => setSelectedPathList([])}
                                    >
                                        Clear all
                                    </Button>
                                </div>

                                <div className="dataSource-layer-wrapper">
                                    <div className="dataSource-layer">
                                        <div className='my-dataSource-head'>
                                            <div className="my-talbe-th" style={{ width: '10%' }}>
                                                {/* <CssVarsProvider>
                                                <Checkbox />
                                            </CssVarsProvider> */}
                                            </div>
                                            <div className="my-talbe-th" style={{ width: '20%' }}>Date</div>
                                            <div className="my-talbe-th" style={{ width: '30%' }}>Station</div>
                                            <div className="my-talbe-th" style={{ width: '40%' }}>Model</div>
                                        </div>

                                        <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                                            {selectedPathList.map((path, index) => (
                                                <div key={path} className="selected-path">
                                                    <div style={{ width: '10%' }} className='my-talbe-td'>
                                                        <span className="delete-button" onClick={() => handleDelete(index)}>
                                                            <FontAwesomeIcon icon={faTrashCan} className="icon-button" color="#ed1b23" />
                                                        </span>
                                                    </div>
                                                    <div style={{ width: '20%' }} className='my-talbe-td'>
                                                        <DivEllipsisWithTooltip>{path.split("/")[0]}</DivEllipsisWithTooltip>
                                                    </div>
                                                    <div style={{ width: '30%' }} className='my-talbe-td'>
                                                        <DivEllipsisWithTooltip>{path.split("/")[1]}</DivEllipsisWithTooltip>
                                                    </div>
                                                    <div style={{ width: '40%' }} className='my-talbe-td'>
                                                        <DivEllipsisWithTooltip>{path.split("/")[2]}</DivEllipsisWithTooltip>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>




                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <LoadingOverlay show={isLoading} />
                </div>
            </ThemeProvider>

            <ProgressDialog
                openProgressDialog={openProgressDialog}
                setOpenProgressDialog={setOpenProgressDialog}
                progressAttribute={{ "message": progressMessage, "percent": progressPercent }}
            />

        </>
    );
};

export default ChooseProductPage;
