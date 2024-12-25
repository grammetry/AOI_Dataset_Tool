import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import './page.scss';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ThemeProvider } from '@mui/material';
import { Slide, Tooltip } from '@mui/material';

import { copyToLocalAPI, dataSourceAPI } from '../APIPath';
import DivEllipsisWithTooltip from '../components/DivEllipsisWithTooltip';
import LoadingOverlay from '../components/LoadingOverlay';
import { theme } from './ProjectPage';

import { PageKeyType, ProjectDataType } from './type';

type DataSourceType = {
    check_count: string | null;
    path: string;
};

type ChooseProductPageProps = {
    currentProject: ProjectDataType;
    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
};

const ChooseProductPage = (props: ChooseProductPageProps) => {
    const { currentProject, setPageKey } = props;
    const [dataPath, setDataPath] = useState('');
    const [pathList, setPathList] = useState<DataSourceType[]>();
    const [pathListSecond, setPathListSecond] = useState<DataSourceType[]>();
    const [pathListThird, setPathListThird] = useState<DataSourceType[]>();
    const [pathListThirdSearch, setPathListThirdSearch] = useState<DataSourceType[]>();
    const [selectedPathList, setSelectedPathList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingFirst, setIsFetchingFirst] = useState(false);
    const [isFetchingSecond, setIsFetchingSecond] = useState(false);
    const [isFetchingThird, setIsFetchingThird] = useState(false);
    const [searchString, setSearchString] = useState('');

    const fetchDataSource = (layer: 1 | 2 | 3, path?: string) => {
        if (layer === 1) setIsFetchingFirst(true);
        if (layer === 2) setIsFetchingSecond(true);
        if (layer === 3) setIsFetchingThird(true);
        fetch(dataSourceAPI(path))
            .then((res) => res.json())
            .then((data) => {
                if (layer === 1) {
                    setPathList(data);
                    setIsFetchingFirst(false);
                }
                if (layer === 2) {
                    setPathListSecond(data);
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

    const handleDeselectAll = (pathListSelect: DataSourceType[] | undefined) => {
        if (!pathListSelect) return;
        const sourceIdList = pathListSelect.map((path) => path.path);
        setSelectedPathList((state) => {
            return state.filter((path) => !sourceIdList.includes(path));
        });
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        if (!pathListThird) return;
        const searchTerm = e.target.value.toLowerCase();
        setSearchString(searchTerm);

        const results = pathListThird.filter((item) => {
            const matchResult = item.path.match(/\/([^/]+)\/?$/);
            if (matchResult) return matchResult[1].toLowerCase().includes(searchTerm);
            return true;
        });

        setPathListThirdSearch(results);
    };

    useEffect(() => {
        fetchDataSource(1);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div className="container">
                <div className="dataSource-wrapper">
                    <div className="title-container">
                        <span className="title-style">
                            Choose Product of&nbsp;
                            <Tooltip enterDelay={500} enterNextDelay={500} title={currentProject.project_name} arrow>
                                <div className='my-project-name'>
                                    <div className="my-ellipsis">{currentProject.project_name}</div>
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
                    <div className="dataSource-content">
                        <div className="dataSource-layer-container">
                            <div className="dataSource-path">C:/root/{dataPath}</div>
                            <div className="dataSource-layer-wrapper">
                                <div className="dataSource-layer">
                                    {isFetchingFirst && (
                                        <div className="dataSource-overlay">
                                            <div className="loading-icon" />
                                        </div>
                                    )}
                                    {pathList &&
                                        (pathList.length > 0 ? (
                                            pathList.map((data) => (
                                                <div
                                                    key={data.path}
                                                    className={`dataSource-item ${dataPath.split('/')[0] === data.path && 'dataSource-item-selected'}`}
                                                    onClick={() => {
                                                        if (dataPath.split('/')[0] !== data.path) {
                                                            setDataPath(data.path);
                                                            setPathListSecond(undefined);
                                                            setPathListThird(undefined);
                                                            setPathListThirdSearch(undefined);
                                                            fetchDataSource(2, data.path);
                                                            setSearchString('');
                                                        }
                                                    }}
                                                >
                                                    <DivEllipsisWithTooltip>{data.path}</DivEllipsisWithTooltip>
                                                </div>
                                            ))
                                        ) : (
                                            <div>No date.</div>
                                        ))}
                                </div>
                                <div className="dataSource-layer">
                                    {isFetchingSecond && (
                                        <div className="dataSource-overlay">
                                            <div className="loading-icon" />
                                        </div>
                                    )}
                                    {pathListSecond &&
                                        (pathListSecond.length > 0 ? (
                                            pathListSecond.map((data) => {
                                                const matchResult = data.path.match(/\/([^/]+)\/?$/);
                                                return (
                                                    <div
                                                        key={data.path}
                                                        className={`dataSource-item ${dataPath === data.path && 'dataSource-item-selected'}`}
                                                        onClick={() => {
                                                            if (dataPath !== data.path) {
                                                                setDataPath(data.path);
                                                                setPathListThird(undefined);
                                                                setPathListThirdSearch(undefined);
                                                                fetchDataSource(3, data.path);
                                                                setSearchString('');
                                                            }
                                                        }}
                                                    >
                                                        <DivEllipsisWithTooltip>{matchResult && matchResult[1]}</DivEllipsisWithTooltip>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div>No station.</div>
                                        ))}
                                </div>
                                <div className="dataSource-layer">
                                    {isFetchingThird && (
                                        <div className="dataSource-overlay">
                                            <div className="loading-icon" />
                                        </div>
                                    )}
                                    {pathListThird && pathListThird.length > 0 && (
                                        <input className="search-bar" type="text" placeholder="Search..." value={searchString} onChange={handleSearch} />
                                    )}
                                    <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                                        {pathListThirdSearch &&
                                            (pathListThirdSearch.length > 0 ? (
                                                pathListThirdSearch.map((data) => {
                                                    const matchResult = data.path.match(/\/([^/]+)\/?$/);
                                                    return (
                                                        <div key={data.path}>
                                                            <label
                                                                className={`dataSource-item ${selectedPathList.findIndex((item) => item === data.path) > -1 && 'dataSource-item-selected'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    name={data.path}
                                                                    value={data.path}
                                                                    checked={selectedPathList.findIndex((item) => item === data.path) > -1}
                                                                    onChange={() => handleChange(data.path)}
                                                                />
                                                                <div style={{ display: 'inline-block', width: 'calc(100% - 20px)' }}>
                                                                    <DivEllipsisWithTooltip>{matchResult && matchResult[1]}</DivEllipsisWithTooltip>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="center-block">No Panel.</div>
                                            ))}
                                    </div>
                                    {pathListThird &&
                                        pathListThirdSearch &&
                                        pathListThird.length > 0 &&
                                        pathListThirdSearch.length > 0 &&
                                        // ↓全選的時候變成deselect按鈕
                                        selectedPathList.filter((path) => pathListThirdSearch.map((thirdPath) => thirdPath.path).includes(path)).length ===
                                        pathListThirdSearch.length ? (
                                        <div className="select-all-button-container">
                                            <Button
                                                variant="contained"
                                                className="select-all-button"
                                                sx={{ textTransform: 'none', borderRadius: 0 }}
                                                onClick={() => handleDeselectAll(pathListThirdSearch)}
                                            >
                                                Deselect all
                                            </Button>
                                        </div>
                                    ) : (
                                        pathListThird &&
                                        pathListThird.length > 0 && (
                                            <div className="select-all-button-container">
                                                <Button
                                                    variant="contained"
                                                    className="select-all-button"
                                                    sx={{ textTransform: 'none', borderRadius: 0 }}
                                                    onClick={() => handleSelectAll(pathListThirdSearch)}
                                                >
                                                    Select all
                                                </Button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="dataSource-cart">
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
                            <div className="selected-path-container">
                                {selectedPathList.map((path, index) => (
                                    <div key={path} className="selected-path">
                                        <span className="delete-button" onClick={() => handleDelete(index)}>
                                            <FontAwesomeIcon icon={faTrashCan} className="icon-button" color="#ed1b23" />
                                        </span>
                                        <div style={{ display: 'inline-block', width: 'calc(100% - 20px)' }}>
                                            <DivEllipsisWithTooltip>{path}</DivEllipsisWithTooltip>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <LoadingOverlay show={isLoading} />
            </div>
        </ThemeProvider>
    );
};

export default ChooseProductPage;
