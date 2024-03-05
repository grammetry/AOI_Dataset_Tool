import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, LinearProgress, ThemeProvider } from '@mui/material';
import useWebSocket from 'react-use-websocket';

import { downloadDatasetAPI, generateZipWs } from '../APIPath';
import LoadingOverlay from '../components/LoadingOverlay';
import { theme } from './ProjectPage';

import { PageKeyType, ProjectDataType } from './type';

type LoadingPanelDatasetZipPageProps = {
  currentProject: ProjectDataType;
  setPageKey: Dispatch<SetStateAction<PageKeyType>>;
};

const LoadingPanelDatasetZipPage = (props: LoadingPanelDatasetZipPageProps) => {
  const { currentProject, setPageKey } = props;
  const [isFinish, setIsFinish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // isFinish變成true後會斷開連結
  const { lastMessage } = useWebSocket(generateZipWs(currentProject.project_uuid), undefined, !isFinish);

  const progress = useMemo(() => {
    if (!lastMessage?.data) return 0;
    const json = JSON.parse(lastMessage?.data);
    const molecular = json.finish_step || 0;
    const denominator = json.total_step || 1;
    return (molecular / denominator) * 100;
  }, [lastMessage]);

  const handleDownloadFile = async () => {
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
    if (!lastMessage?.data) return;
    const json = JSON.parse(lastMessage?.data);
    // 完成後關閉ws
    if (json.status === 'finish') {
      setIsFinish(true);
    }
    // 收到錯誤訊息跳出警示視窗、關閉ws、回到前一頁
    if (json.status === 'error') {
      alert('Convert error.');
      setIsFinish(true);
      setPageKey('SetAttributePage');
    }
  }, [currentProject.project_uuid, lastMessage?.data, setPageKey]);

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="loading-wrapper">
          <div className="loading-container">
            {isFinish ? (
              <div className="icon-button-style" onClick={handleDownloadFile}>
                <FontAwesomeIcon icon={faDownload} size="2xl" color="#ed1b23" />
                <div>Download zip file of {<b>{currentProject.project_name}</b>}</div>
              </div>
            ) : (
              <>
                <div className="loading-text">
                  <b>{currentProject.project_name}</b>&nbsp;generate zip loading<span className="loading-first-dots">.</span>
                  <span className="loading-second-dots">.</span>
                  <span className="loading-third-dots">.</span>
                </div>
                <div className="linear-wrapper">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" sx={{ height: 10, borderRadius: 5 }} value={progress} />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>{`${Math.round(progress)}%`}</Box>
                  </Box>
                </div>
              </>
            )}
          </div>
        </div>
        <LoadingOverlay show={isLoading} />
      </div>
    </ThemeProvider>
  );
};

export default LoadingPanelDatasetZipPage;
