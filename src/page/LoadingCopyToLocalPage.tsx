import { Dispatch, SetStateAction, useEffect, useMemo,useState } from 'react';
import { Box, LinearProgress, ThemeProvider } from '@mui/material';
import useWebSocket from 'react-use-websocket';

import { copyToLocalWs,panelSourceExportAPI } from '../APIPath';
import { theme } from './ProjectPage';

import { PageKeyType, ProjectDataType } from './type';

type LoadingCopyToLocalPageProps = {
  currentProject: ProjectDataType;
  setPageKey: Dispatch<SetStateAction<PageKeyType>>;
  fetchProject: (projectId: string) => void;
};

const LoadingCopyToLocalPage = (props: LoadingCopyToLocalPageProps) => {


  const [isLoading, setIsLoading] = useState(false);

  const { currentProject, setPageKey ,fetchProject } = props;

  const wsUrl = copyToLocalWs(currentProject.project_uuid);

  const { lastMessage } = useWebSocket(wsUrl);

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
      //setPageKey('ExportProductPage');
      setIsLoading(true);

      fetch(panelSourceExportAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset_uuid: currentProject.dataset_uuid }),
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



    } 
  }, [lastMessage?.data, setPageKey]);

  useEffect(() => {

    console.log('copyToLocalWs(currentProject.project_uuid)')
    console.log(copyToLocalWs(currentProject.project_uuid))

    const url = copyToLocalWs(currentProject.project_uuid);

    var ws = new WebSocket(url)
    // 監聽連線狀態
    ws.onopen = () => {
      console.log('open connection')
    }
    ws.onclose = () => {
      console.log('close connection');
    }
    //接收 Server 發送的訊息
    ws.onmessage = event => {
      console.log('Server:', event.data);
    }
    
  }, []);

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
