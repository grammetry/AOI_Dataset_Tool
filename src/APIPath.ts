//const localhost = 'http://172.16.93.107';
//const wsLocalhost = 'ws://172.16.93.107';

// const localhost = 'http://172.16.92.102';
// const wsLocalhost = 'ws://172.16.92.102';

// const localhost = 'http://10.204.16.110:8080';
// const wsLocalhost = 'ws://10.204.16.110:8080';

// judy host
const localhost = (process.env.REACT_APP_API_URL==='')?`http://${window.location.host}`:process.env.REACT_APP_API_URL;
const wsLocalhost = (process.env.REACT_APP_WS_URL==='')?`ws://${window.location.host}`:process.env.REACT_APP_WS_URL;


//const localhost = 'http://127.0.0.1';
//const wsLocalhost = 'ws://127.0.0.1';


// manny host
//const localhost = 'http://172.16.92.102:8080';
//const wsLocalhost = 'ws://172.16.92.102:8080';


// nginx reverse proxy
//const localhost = `http://${window.location.host}`;
//const wsLocalhost = `ws://${window.location.host}/websocket`;

//const localhost = 'http://10.204.16.110';
//const wsLocalhost = 'ws://127.0.0.1:3001/socket';

//const localhost = '';
//const wsLocalhost = '';

const port = '';
const nginx_proxy = '/inmfft';
const apiv1 = '/api/v1';
const dataConvert_server = '/dataConvert';
const restfulv1 = '/rest/v1';
const trainv1 = 'v1';


//const infer_nginx_proxy = '/inmffr';
const infer_nginx_proxy = '/ivit_aoi_r';
const infer_api_version = '/api/v1';
const infer_reset_version = '/rest/v1';
const infer_server = '/inference_backend';






// ProjectPage
export const datasetToolProjectAPI = `${localhost}${port}${nginx_proxy}${apiv1}/datasetToolProject`;

export const projectCoverAPI = (project_uuid: string, image_max_length?: number) =>
  `${localhost}${port}${nginx_proxy}${dataConvert_server}${restfulv1}/project/cover?project_uuid=${project_uuid}${
    image_max_length ? '&image_max_length=' + image_max_length : ''
  }`;

// ChooseProductPage
export const dataSourceAPI = (dataPath?: string) =>
  `${localhost}${port}${nginx_proxy}${dataConvert_server}${restfulv1}/dataSource?boardSnCountFilter=0${
    dataPath ? '&dataPath=' + dataPath : ''
  }`;

export const copyToLocalAPI = `${localhost}${port}${nginx_proxy}${apiv1}/copyToLocal`;

export const copyToLocalWs = (project_uuid: string) =>
  `${wsLocalhost}${port}${nginx_proxy}${apiv1}/projectStatus/copyToLocal?project_uuid=${project_uuid}`;

// ExportProductPage
export const panelSourceAPI = (project_uuid: string, dataset_uuid: string) =>
  `${localhost}${port}${nginx_proxy}${apiv1}/panelSource?project_uuid=${project_uuid}&dataset_uuid=${dataset_uuid}`;

export const panelSourceSourceAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelSource/source`;

export const panelSourceExportAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelSource/export`;

export const panelSourceViewAPI = (dataset_uuid: string, source_uuid: string) =>
  `${localhost}${port}${nginx_proxy}${apiv1}/panelSource/view?dataset_uuid=${dataset_uuid}&source_uuid=${source_uuid}`;

export const datasetImgAPI = (image_uuid: string, image_max_length?: number) =>
  `${localhost}${port}${nginx_proxy}${dataConvert_server}${restfulv1}/dataset/format/image?image_uuid=${image_uuid}${
    image_max_length ? '&image_max_length=' + image_max_length : ''
  }`;

// SetAttributePage
export const panelDatasetAPI = (export_uuid: string) =>
  `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset?export_uuid=${export_uuid}&random_result=true`;

export const postGoldenAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/golden`;

export const postTrainPassAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/train/pass`;

export const postTrainNgAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/train/ng`;

export const postValPassAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/val/pass`;

export const postValNgAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/val/ng`;

export const deleteImgAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/image`;

export const panelDatasetZipAPI = `${localhost}${port}${nginx_proxy}${apiv1}/panelDataset/zip`;

export const downloadDatasetAPI = (export_uuid: string) =>
  `${localhost}${port}${nginx_proxy}${dataConvert_server}${restfulv1}/dataset/export/download?export_uuid=${export_uuid}`;

export const generateZipWs = (project_uuid: string) =>
  `${wsLocalhost}${port}${nginx_proxy}${apiv1}/projectStatus/generateZip?project_uuid=${project_uuid}`;


export const genZipDatasetAPI = `${localhost}${port}${nginx_proxy}${apiv1}/dataset/generation`;

export const dsImageInsertAPI = `${localhost}${port}${nginx_proxy}${dataConvert_server}${restfulv1}/dataset/image/insert`;

export const taoWorkspaceAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace`;

export const taoQuickTrainAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/info`;

export const taoStartTrainAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/train`;

export const taoStartTrainSettingAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/train/setting`;

export const taoTrainStatusWS = `${wsLocalhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/train/container`; 

export const taoEvaluateAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/evaluate`;

export const taoInferenceAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/inference`;

export const taoExportAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/export`;

export const taoPreTrainModelAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/model/nvidia`;

export const taoDownloadAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/export/download`;

export const taoUploadYamlAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/info/spec/upload`;

export const taoDownloadYamlAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/info/spec/download`;

export const taoTrainInfoAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/train/setting`;

export const taoTrainInfoIdAPI = `${localhost}${port}${nginx_proxy}/tao/rest/${trainv1}/modelWorkspace/train/setting/id`;

export const taoMachineAPI = `${localhost}${port}${nginx_proxy}${dataConvert_server}/rest/${trainv1}/machine`;

///inmfft/tao/rest/v1/modelWorkspace/info/spec/download?t


export const inferHealthAPI = `/health`;

export const inferInferenceAPI = `${infer_nginx_proxy}${infer_server}${infer_reset_version}/inferenceModel`;

export const inferUploadAPI = `${infer_nginx_proxy}${infer_server}${infer_reset_version}/inferenceModel/upload`;

export const inferInfoAPI = `${infer_nginx_proxy}${infer_server}${infer_reset_version}/inferenceModel/info`;

export const inferTaskAPI = `${infer_nginx_proxy}${infer_server}${infer_reset_version}/task`;

export const inferTaskStartAPI = `${infer_nginx_proxy}${infer_server}${infer_reset_version}/task/inference/start`;

export const inferTaskStopAPI = `${infer_nginx_proxy}${infer_server}${infer_reset_version}/task/inference/stop`;

export const inferAllSupportPanelAPI = `${infer_nginx_proxy}${infer_server}${infer_api_version}/allSuportPanel`;

export const inferHeartBeatAPI = `${infer_nginx_proxy}${infer_server}${infer_api_version}/heartBeat`;

export const inferTaskInfoAPI = `${infer_nginx_proxy}${infer_server}${infer_api_version}/taskInfo`;

export const inferLogAPI = `${infer_nginx_proxy}${infer_server}${infer_api_version}/logs`;


