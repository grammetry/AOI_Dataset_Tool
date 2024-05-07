import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { Box, LinearProgress, ThemeProvider } from '@mui/material';
import useWebSocket from 'react-use-websocket';

import { copyToLocalWs } from '../APIPath';
import { theme } from './ProjectPage';

import { PageKeyType, ProjectDataType } from './type';

type LoadingCopyToLocalPageProps = {
  currentProject: ProjectDataType;
  setPageKey: Dispatch<SetStateAction<PageKeyType>>;
};

const LoadingCopyToLocalPage = (props: LoadingCopyToLocalPageProps) => {
  const { currentProject, setPageKey } = props;

  const { lastMessage } = useWebSocket(copyToLocalWs(currentProject.project_uuid));

  const progress = useMemo(() => {
    if (!lastMessage?.data) return 0;
    const json = JSON.parse(lastMessage?.data);
    const molecular = json.finish_request || 0;
    const denominator = json.total_request || 1;
    return (molecular / denominator) * 100;
  }, [lastMessage]);

  // loading結束後跳轉至ExportPage
  useEffect(() => {
    if (!lastMessage?.data) return;
    const json = JSON.parse(lastMessage?.data);
    if (json.status === 'finish'){
      setPageKey('ExportProductPage');




      
    } 
  }, [lastMessage?.data, setPageKey]);

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="loading-wrapper">
          <div className="loading-container">
            <div className="loading-text">
              <b>{currentProject.project_name}</b>&nbsp;copy to local loading<span className="loading-first-dots">.</span>
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
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default LoadingCopyToLocalPage;
