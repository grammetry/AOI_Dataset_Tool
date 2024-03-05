import { Dispatch, FormEventHandler, MouseEvent, SetStateAction, useEffect, useState } from 'react';
import './page.scss';
import { faCheckToSlot, faEllipsis, faFileCircleCheck, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';

import { datasetToolProjectAPI, downloadDatasetAPI, projectCoverAPI } from '../APIPath';
import { initialProjectState } from '../App';
import DivEllipsisWithTooltip from '../components/DivEllipsisWithTooltip';
import LoadingOverlay from '../components/LoadingOverlay';
import ChartDialog from '../dialog/ChartDialog';
import ConfirmDialog from '../dialog/ConfirmDialog';
import UpsertProjectDialog from '../dialog/UpsertProjectDialog';

import { AttributeType, PageKeyType, ProjectDataType } from './type';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#ed1b23',
    },
    secondary: {
      main: '#888',
    },
  },
  typography: {
    fontFamily: 'Google Noto Sans TC',
  },
});

const calculateWidth = (first: boolean, second: boolean, third: boolean, fifth: boolean) => {
  return (first ? 29 : 0) + (second ? 29 : 0) + (third ? 29 : 0) + (fifth ? 29 : 0);
};

type ProjectPageProps = {
  currentProject: ProjectDataType;
  setCurrentProject: Dispatch<SetStateAction<ProjectDataType>>;
  setPageKey: Dispatch<SetStateAction<PageKeyType>>;
  projectData: ProjectDataType[];
  fetchProject: (projectId: string) => void;
};

const ProjectPage = (props: ProjectPageProps) => {
  const { setPageKey, currentProject, setCurrentProject, projectData, fetchProject } = props;
  const [openUpsertDialog, setOpenUpsertDialog] = useState<'add' | 'edit' | ''>('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openChartDialog, setOpenChartDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const confirmAttribute: AttributeType = {
    title: 'Delete Project',
    desc: `Are you sure to delete <b>${currentProject?.project_name}</b>?`,
  };

  const handleClickProject = (project: ProjectDataType, runningCopyToLocal: boolean, runningConvert: boolean) => {
    setCurrentProject(project);
    if (runningCopyToLocal) return setPageKey('LoadingCopyToLocalPage');
    if (runningConvert) return setPageKey('LoadingPanelDatasetZipPage');
    if (project.export_uuid) return setPageKey('SetAttributePage');
    return setPageKey('ChooseProductPage');
  };

  const handleClickAddBtn = () => {
    setCurrentProject(initialProjectState);
    setOpenUpsertDialog('add');
  };

  const handleClickEditBtn = (e: MouseEvent<HTMLButtonElement>, project: ProjectDataType) => {
    e.stopPropagation();
    setCurrentProject(project);
    setOpenUpsertDialog('edit');
  };

  const handleClickDeleteBtn = (e: MouseEvent<HTMLButtonElement>, project: ProjectDataType) => {
    e.stopPropagation();
    setCurrentProject(project);
    setOpenConfirmDialog(true);
  };

  const handleClickMoreBtn = (e: MouseEvent<HTMLElement>, project: ProjectDataType) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setCurrentProject(project);
  };

  const handleConfirm: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const postData = {
      project_uuid: currentProject?.project_uuid || '',
    };
    fetch(datasetToolProjectAPI, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw { error: 'API request failed', response: data };
          });
        } else {
          return fetchProject(currentProject?.project_uuid || '');
        }
      })
      .catch((err) => {
        const msg = err?.response?.detail?.[0]?.msg || '';
        const loc = err?.response?.detail?.[0]?.loc || [];
        console.log(`API error: ${msg} [${loc.join(', ')}]`);
      })
      .finally(() => {
        setOpenConfirmDialog(false);
        setIsLoading(false);
      });
  };

  const handleDownloadFile = async () => {
    setAnchorEl(null);
    if (!currentProject.export_uuid) return;
    window.location.href = downloadDatasetAPI(currentProject.export_uuid);
    // setIsLoading(true);
    // try {
    //   const response = await fetch(downloadDatasetAPI(currentProject.export_uuid));
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! Status: ${response.status}`);
    //   }
    //   const blob = await response.blob();
    //   setIsLoading(false);
    //   saveAs(blob, `${currentProject.project_name}.zip`);
    // } catch (error) {
    //   setIsLoading(false);
    //   console.error('API error：', error);
    // }
  };

  useEffect(() => {
    fetchProject(currentProject?.project_uuid || '');
  }, [currentProject?.project_uuid, fetchProject]);

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="title-container first-title-container">
          <div className="title-style">Project Page</div>
          <div onClick={handleClickAddBtn}>
            <Tooltip enterDelay={500} enterNextDelay={500} title="Add project." arrow>
              <FontAwesomeIcon className="icon-button" icon={faFolderPlus} size="2xl" color="#ed1b23" />
            </Tooltip>
          </div>
        </div>
        <div className="project-wrapper">
          {projectData.length > 0 &&
            projectData.map((project) => (
              <div
                key={project.project_uuid}
                className="project-container"
                onClick={() =>
                  handleClickProject(
                    project,
                    project.project_status.copy_to_local.status === 'running',
                    project.project_status.generate_zip?.status === 'running',
                  )
                }
              >
                <div className="name-container">
                  <div
                    style={{
                      width: `calc(100% - ${calculateWidth(
                        project.project_status.copy_to_local.status === 'running',
                        project.project_status.generate_zip?.status === 'running',
                        project.project_status.init,
                        !project.project_status.init && !!project.export_uuid,
                      )}px)`,
                    }}
                  >
                    <DivEllipsisWithTooltip>{project.project_name}</DivEllipsisWithTooltip>
                  </div>
                  <div className="icon-button-container">
                    {project.project_status?.copy_to_local.status === 'running' && (
                      <Tooltip enterDelay={500} enterNextDelay={500} title="Loading copy to local." arrow>
                        <div className="loading-icon" />
                      </Tooltip>
                    )}
                    {project.project_status?.generate_zip?.status === 'running' && (
                      <Tooltip enterDelay={500} enterNextDelay={500} title="Generating zip." arrow>
                        <div className="loading-icon" />
                      </Tooltip>
                    )}
                    {project.project_status?.init && (
                      <Tooltip enterDelay={500} enterNextDelay={500} title="Already converted." arrow>
                        <FontAwesomeIcon icon={faCheckToSlot} color="#444" />
                      </Tooltip>
                    )}
                    {!project.project_status?.init && !!project.export_uuid && (
                      <Tooltip enterDelay={500} enterNextDelay={500} title="Already exported." arrow>
                        <FontAwesomeIcon icon={faFileCircleCheck} color="#444" />
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="project-img">
                  <img src={projectCoverAPI(project.project_uuid)} alt="project img" />
                </div>
                <div>note</div>
                <div className="note-container">
                  <pre>{project.annotation}</pre>
                </div>
                <div className="button-container">
                  <Button
                    variant="contained"
                    style={{ width: 96, height: 36, fontSize: 16, padding: '4px 10px', textTransform: 'none' }}
                    onClick={(e) => handleClickEditBtn(e, project)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    style={{ width: 96, height: 36, fontSize: 16, padding: '4px 10px', textTransform: 'none' }}
                    onClick={(e) => handleClickDeleteBtn(e, project)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    style={{ width: 36, height: 36, minWidth: 36, boxShadow: '0px 2px 2px 0px #00000010' }}
                    onClick={(e) => handleClickMoreBtn(e, project)}
                  >
                    <FontAwesomeIcon icon={faEllipsis} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <UpsertProjectDialog {...{ openUpsertDialog, setOpenUpsertDialog, fetchProject, currentProject, setIsLoading }} />
        <ConfirmDialog {...{ openConfirmDialog, setOpenConfirmDialog, handleConfirm, currentProject, confirmAttribute }} />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {currentProject?.project_status?.init && <MenuItem onClick={handleDownloadFile}>Download zip</MenuItem>}
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setOpenChartDialog(true);
            }}
            disabled
          >
            View chart
          </MenuItem>
        </Menu>
        <ChartDialog {...{ openChartDialog, setOpenChartDialog }} />
        <LoadingOverlay show={isLoading} />
      </div>
    </ThemeProvider>
  );
};

export default ProjectPage;
