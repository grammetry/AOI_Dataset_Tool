import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import './page.scss';
import { faEye, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ThemeProvider } from '@mui/material';

import { panelSourceAPI, panelSourceExportAPI, panelSourceSourceAPI } from '../APIPath';
import DivEllipsisWithTooltip from '../components/DivEllipsisWithTooltip';
import LoadingOverlay from '../components/LoadingOverlay';
import ViewXMLDialog from '../dialog/ViewXMLDialog';
import { theme } from './ProjectPage';

import { PageKeyType, PanelListType, ProjectDataType, XMLType } from './type';

type NestedObject = {
  [key: string]: NestedObject | string;
};

const getLeafValues = (obj: NestedObject): string[] => {
  const leafValues: string[] = [];

  function traverse(currentObj: NestedObject) {
    for (const key in currentObj) {
      if (typeof currentObj[key] === 'object') {
        traverse(currentObj[key] as NestedObject);
      } else {
        if (key === 'source_uuid') leafValues.push(currentObj[key] as string);
      }
    }
  }
  traverse(obj);
  return leafValues;
};

const getDeleteIdList = (datasetList: XMLType[], totalIdList: string[]) => {
  if (datasetList.length < 1) return;
  const selectIdList = datasetList.map((dataset) => dataset.source_uuid);
  const setSelectIdList = new Set(selectIdList);
  const result = totalIdList.filter((item) => !setSelectIdList.has(item));
  return result;
};

type ExportProductPageProps = {
  currentProject: ProjectDataType;
  setPageKey: Dispatch<SetStateAction<PageKeyType>>;
  fetchProject: (projectId: string) => void;
};

const ExportProductPage = (props: ExportProductPageProps) => {
  const { currentProject, setPageKey, fetchProject } = props;
  const [dataPath, setDataPath] = useState<string[]>([]);
  const [pathList, setPathList] = useState<PanelListType>({});
  const [pathListSecond, setPathListSecond] = useState<any>({});
  const [pathListThird, setPathListThird] = useState<any>({});
  const [pathListForth, setPathListForth] = useState<Record<string, XMLType[]>>({});
  const [pathListFifth, setPathListFifth] = useState<XMLType[]>([]);
  const [selectedPathList, setSelectedPathList] = useState<XMLType[]>([]);
  const [openViewDialog, setOpenViewDialog] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchPanelSource = (project: ProjectDataType) => {
    setIsFetching(true);
    fetch(panelSourceAPI(project.project_uuid, project.dataset_uuid))
      .then((res) => res.json())
      .then((data) => {
        setPathList(data);
        console.log('+++', data);
      })
      .catch((err) => {
        const msg = err?.response?.detail?.[0]?.msg || '';
        const loc = err?.response?.detail?.[0]?.loc || [];
        console.log(`API error: ${msg} [${loc.join(', ')}]`);
      })
      .finally(() => setIsFetching(false));
  };

  const handleChange = (source: XMLType, path: string) => {
    const index = selectedPathList.findIndex((item) => item.source_uuid === source.source_uuid);
    if (index > -1) {
      setSelectedPathList((state) => {
        const result = state.slice(0, index).concat(state.slice(index + 1));
        return result.sort();
      });
    } else {
      const result = {
        source_file_name: source.source_file_name,
        source_uuid: source.source_uuid,
        source_path: path + '/' + source.source_file_name,
      };
      setSelectedPathList((state) => state.concat(result).sort());
    }
  };

  const handleDelete = (index: number) => {
    setSelectedPathList((state) => {
      const result = state.slice(0, index).concat(state.slice(index + 1));
      return result;
    });
  };

  const checkForthCheck = (checkPath: string, _pathListForth: any) => {
    return (
      selectedPathList.filter((path) =>
        _pathListForth[checkPath]
          .map((fifthPath: XMLType) => dataPath.slice(0, 3).join('/') + '/' + checkPath + '/' + fifthPath.source_file_name)
          .includes(path.source_path || ''),
      ).length === _pathListForth[checkPath].length
    );
  };

  const checkForthList = (_pathListForth: any) => {
    return (
      Object.keys(_pathListForth).filter((path) => checkForthCheck(path, _pathListForth)).length === Object.keys(_pathListForth).length
    );
  };

  const handleSelectAllFifth = (pathListSelect: XMLType[], frontPath: string) => {
    setPathListFifth(pathListSelect);

    const result = pathListSelect.map((path) => ({
      source_file_name: path.source_file_name,
      source_uuid: path.source_uuid,
      source_path: frontPath + '/' + path.source_file_name,
    }));

    setSelectedPathList((state) => {
      const sourceIdList = pathListSelect.map((path) => path.source_uuid);
      return state.filter((path) => !sourceIdList.includes(path.source_uuid)).concat(result);
    });
  };

  const handleDeselectAllFifth = (pathListSelect: XMLType[]) => {
    setSelectedPathList((state) => {
      const sourceIdList = pathListSelect.map((path) => path.source_uuid);
      return state.filter((path) => !sourceIdList.includes(path.source_uuid));
    });
  };

  const handleSelectAllForth = (_pathListForth: Record<string, XMLType[]>, frontPath: string) => {
    Object.keys(_pathListForth).forEach((path) => {
      handleSelectAllFifth(_pathListForth[path], frontPath + '/' + path);
    });
    const lastKey = Object.keys(_pathListForth)[Object.keys(_pathListForth).length - 1];
    setDataPath((state) => [...state.slice(0, 3), lastKey]);
    setPathListFifth(_pathListForth[lastKey]);
  };

  const handleDeselectAllForth = (_pathListForth: any) => {
    Object.keys(_pathListForth).forEach((path) => {
      handleDeselectAllFifth(_pathListForth[path]);
    });
    setDataPath((state) => state.slice(0, 3));
    setPathListFifth([]);
  };

  const exportDataset = (projectId: string, datasetId: string, deleteIdList?: string[]) => {
    if (!deleteIdList) return alert('Please select XML.');
    setIsLoading(true);
    const postData = {
      project_uuid: projectId,
      dataset_uuid: datasetId,
      source_uuid: deleteIdList,
    };

    // 先刪除沒有選擇的sourceId
    fetch(panelSourceSourceAPI, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
      .then(() => {
        // 再export dataset_uuid
        fetch(panelSourceExportAPI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dataset_uuid: datasetId }),
        })
          .then(() => {
            fetchProject(currentProject?.project_uuid || '');
            setPageKey('SetAttributePage');
          })
          .catch((err) => {
            const msg = err?.response?.detail?.[0]?.msg || '';
            const loc = err?.response?.detail?.[0]?.loc || [];
            console.log(`API error: ${msg} [${loc.join(', ')}]`);
          })
          .finally(() => setIsLoading(false));
      })
      .catch((err) => {
        const msg = err?.response?.detail?.[0]?.msg || '';
        const loc = err?.response?.detail?.[0]?.loc || [];
        console.log(`API error: ${msg} [${loc.join(', ')}]`);
      });
  };

  useEffect(() => {
    fetchPanelSource(currentProject);
  }, [currentProject]);

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="dataSource-wrapper">
          <div className="title-container">
            <span className="title-style">
              Export Product of&nbsp;<b>{currentProject.project_name}</b>
            </span>
            <div className="lower-right-button-container">
              <Button
                variant="contained"
                className="enlarge-button"
                sx={{ width: 160, fontSize: 16, textTransform: 'none', transition: 'transform 0.2s' }}
                onClick={() =>
                  exportDataset(
                    currentProject.project_uuid,
                    currentProject.dataset_uuid,
                    getDeleteIdList(selectedPathList, getLeafValues(pathList)),
                  )
                }
              >
                Export
              </Button>
            </div>
          </div>
          <div className="dataSource-content">
            <div className="dataSource-layer-container">
              <div className="dataSource-path">C:/root/{dataPath.join('/')}</div>
              <div className="dataSource-layer-wrapper">
                <div className="dataSource-layer">
                  {/* <div>[Date]</div> */}
                  {isFetching && (
                    <div className="dataSource-overlay">
                      <div className="loading-icon" />
                    </div>
                  )}
                  {Object.keys(pathList).map((data) => (
                    <div
                      key={data}
                      className={`dataSource-item ${dataPath[0] === data && 'dataSource-item-selected'}`}
                      onClick={() => {
                        if (dataPath[0] !== data) {
                          setDataPath([data]);
                          setPathListSecond(pathList[data]);
                          setPathListThird({});
                          setPathListForth({});
                          setPathListFifth([]);
                        }
                      }}
                    >
                      <DivEllipsisWithTooltip>{data}</DivEllipsisWithTooltip>
                    </div>
                  ))}
                </div>
                <div className="dataSource-layer">
                  {/* <div>[Station]</div> */}
                  {Object.keys(pathListSecond).map((data) => {
                    return (
                      <div
                        key={data}
                        className={`dataSource-item ${dataPath[1] === data && 'dataSource-item-selected'}`}
                        onClick={() => {
                          if (dataPath[1] !== data) {
                            setDataPath((state) => [state[0], data]);
                            setPathListThird(pathListSecond[data]);
                            setPathListForth({});
                            setPathListFifth([]);
                          }
                        }}
                      >
                        <DivEllipsisWithTooltip>{data}</DivEllipsisWithTooltip>
                      </div>
                    );
                  })}
                </div>
                <div className="dataSource-layer">
                  {/* <div>[Panel]</div> */}
                  {Object.keys(pathListThird).map((data) => {
                    return (
                      <div
                        key={data}
                        className={`dataSource-item ${dataPath[2] === data && 'dataSource-item-selected'}`}
                        onClick={() => {
                          if (dataPath[2] !== data) {
                            setDataPath((state) => [...state.slice(0, 2), data]);
                            setPathListForth(pathListThird[data]);
                            setPathListFifth([]);
                          }
                        }}
                      >
                        <DivEllipsisWithTooltip>{data}</DivEllipsisWithTooltip>
                      </div>
                    );
                  })}
                </div>
                <div className="dataSource-layer-wide">
                  {/* <div>[Board sn]</div> */}
                  <div style={{ height: 'calc(100% - 30px)', overflow: 'auto' }}>
                    {Object.keys(pathListForth).map((data) => {
                      return (
                        <div
                          key={data}
                          className={`dataSource-item ${dataPath[3] === data && 'dataSource-item-selected'}`}
                          onClick={() => {
                            if (dataPath[3] !== data) {
                              setDataPath((state) => [...state.slice(0, 3), data]);
                              setPathListFifth(pathListForth[data]);
                            }
                          }}
                        >
                          <label>
                            <input
                              type="checkbox"
                              name={data}
                              value={data}
                              checked={checkForthCheck(data, pathListForth)}
                              onChange={() =>
                                checkForthCheck(data, pathListForth)
                                  ? handleDeselectAllFifth(pathListForth[data])
                                  : handleSelectAllFifth(pathListForth[data], dataPath.slice(0, 3).join('/') + '/' + data)
                              }
                            />
                          </label>
                          <div className="dataSource-text">
                            <DivEllipsisWithTooltip>{data}</DivEllipsisWithTooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {Object.keys(pathListForth).length > 0 &&
                    // ↓全選的時候變成deselect按鈕
                    (checkForthList(pathListForth) ? (
                      <div className="select-all-button-container">
                        <Button
                          variant="contained"
                          className="select-all-button"
                          sx={{ textTransform: 'none', borderRadius: 0 }}
                          onClick={() => handleDeselectAllForth(pathListForth)}
                        >
                          Deselect all
                        </Button>
                      </div>
                    ) : (
                      <div className="select-all-button-container">
                        <Button
                          variant="contained"
                          className="select-all-button"
                          sx={{ textTransform: 'none', borderRadius: 0 }}
                          onClick={() => handleSelectAllForth(pathListForth, dataPath.slice(0, 3).join('/'))}
                        >
                          Select all
                        </Button>
                      </div>
                    ))}
                </div>
                <div className="dataSource-layer-wide">
                  {pathListFifth.map((data) => {
                    return (
                      <div
                        key={data.source_uuid}
                        className={`dataSource-item ${
                          selectedPathList.findIndex((item) => item.source_file_name === data.source_file_name) > -1 &&
                          'dataSource-item-selected'
                        }`}
                      >
                        <label>
                          <input
                            type="checkbox"
                            name={data.source_uuid}
                            value={data.source_uuid}
                            checked={selectedPathList.findIndex((item) => item.source_uuid === data.source_uuid) > -1}
                            onChange={() => handleChange(data, dataPath.join('/'))}
                          />
                          <div className="dataSource-text">
                            <DivEllipsisWithTooltip>{data.source_file_name}</DivEllipsisWithTooltip>
                          </div>
                        </label>
                        <span className="view-button" onClick={() => setOpenViewDialog(data.source_uuid)}>
                          <FontAwesomeIcon icon={faEye} className="icon-button" color="#ed1b23" />
                        </span>
                      </div>
                    );
                  })}
                  {pathListFifth.length > 0 &&
                  // ↓全選的時候變成deselect按鈕
                  selectedPathList.filter((path) =>
                    pathListFifth
                      .map((fifthPath) => dataPath.join('/') + '/' + fifthPath.source_file_name)
                      .includes(path.source_path || ''),
                  ).length === pathListFifth.length ? (
                    <div className="select-all-button-container">
                      <Button
                        variant="contained"
                        className="select-all-button"
                        sx={{ textTransform: 'none', borderRadius: 0 }}
                        onClick={() => handleDeselectAllFifth(pathListFifth)}
                      >
                        Deselect all
                      </Button>
                    </div>
                  ) : (
                    pathListFifth.length > 0 && (
                      <div className="select-all-button-container">
                        <Button
                          variant="contained"
                          className="select-all-button"
                          sx={{ textTransform: 'none', borderRadius: 0 }}
                          onClick={() => handleSelectAllFifth(pathListFifth, dataPath.join('/'))}
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
                  style={{ width: 80, fontSize: 14, padding: '1px 4px', textTransform: 'none', transition: 'transform 0.2s' }}
                  onClick={() => setSelectedPathList([])}
                >
                  Clear all
                </Button>
              </div>
              <div className="selected-path-container">
                {selectedPathList.map((path, index) => (
                  <div key={path.source_uuid} className="selected-path">
                    <span className="delete-button" onClick={() => handleDelete(index)}>
                      <FontAwesomeIcon icon={faTrashCan} className="icon-button" color="#ed1b23" />
                    </span>
                    <div style={{ display: 'inline-block', width: 'calc(100% - 20px)' }}>
                      <DivEllipsisWithTooltip>{path.source_path}</DivEllipsisWithTooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ViewXMLDialog {...{ openViewDialog, setOpenViewDialog }} datasetId={currentProject.dataset_uuid} />
        </div>
        <LoadingOverlay show={isLoading} />
      </div>
    </ThemeProvider>
  );
};

export default ExportProductPage;
