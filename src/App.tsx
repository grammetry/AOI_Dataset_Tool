import { useCallback, useEffect, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

import { datasetToolProjectAPI } from './APIPath';
import LoadingOverlay from './components/LoadingOverlay';

import ChooseProductPage from './page/ChooseProductPage';
import ExportProductPage from './page/ExportProductPage';
import LoadingCopyToLocalPage from './page/LoadingCopyToLocalPage';
import LoadingPanelDatasetZipPage from './page/LoadingPanelDatasetZipPage';
import ProjectPage from './page/ProjectPage';
import TrainPage from './page/TrainPage';
import Header from './page/Header';
import SetAttributePage from './page/SetAttributePage';


import { Provider } from "react-redux";
import { store } from './redux/store';

import { PageKeyType, ProjectDataType } from './page/type';

export const initialProjectState: ProjectDataType = {
    project_uuid: '',
    dataset_uuid: '',
    export_uuid: '',
    project_name: '',
    project_status: {
        init: false,
        export: {},
        copy_to_local: {
            status: '',
            detail: { panel_path: '', process: '' },
            total_request: 0,
            finish_request: 0,
            panel_error: [],
            format_error: [],
        },
        generate_zip: {
            status: '',
            detail: { step: 0, process: '' },
            total_step: 0,
            finish_step: 0,
        },
    },
    annotation: '',
    create_time: 0,
};

function App() {
    const [pageKey, setPageKey] = useState<PageKeyType>('ProjectPage');
    const [currentProject, setCurrentProject] = useState<ProjectDataType>(initialProjectState);
    const [projectData, setProjectData] = useState<ProjectDataType[]>([]);
    const [isLoading, setIsLoading] = useState(false);



    const fetchProject = useCallback((projectId: string) => {
        setIsLoading(true);

        console.log('datasetToolProjectAPI')
        console.log(datasetToolProjectAPI)

        fetch(datasetToolProjectAPI)
            .then((res) => res.json())
            .then((data) => {
                setProjectData(data);
                if (projectId) {
                    setCurrentProject((state) => data.find((item: ProjectDataType) => item.project_uuid === state.project_uuid));
                }
            })
            .catch((err) => {
                const msg = err?.response?.detail?.[0]?.msg || '';
                const loc = err?.response?.detail?.[0]?.loc || [];
                console.log(`API error: ${msg} [${loc.join(', ')}]`);
                console.log(err)
            })
            .finally(() => setIsLoading(false));
    }, []);



    // 禁止使用者使用右鍵
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <Provider store={store}>
            <div className="app-container">
                <Header />
                <div className="page-container">
                    {pageKey === 'ProjectPage' && <ProjectPage {...{ setPageKey, currentProject, setCurrentProject, projectData, fetchProject }} />}
                    {pageKey === 'ChooseProductPage' && <ChooseProductPage {...{ setPageKey, currentProject }} />}
                    {pageKey === 'LoadingCopyToLocalPage' && <LoadingCopyToLocalPage {...{ setPageKey, currentProject, fetchProject }} />}
                    {pageKey === 'ExportProductPage' && <ExportProductPage {...{ setPageKey, currentProject, fetchProject }} />}
                    {pageKey === 'SetAttributePage' && <SetAttributePage {...{ setPageKey, currentProject }} />}
                    {pageKey === 'LoadingPanelDatasetZipPage' && <LoadingPanelDatasetZipPage {...{ setPageKey, currentProject }} />}
                    {pageKey === 'TrainPage' && <TrainPage {...{ setPageKey, projectData }} />}
                </div>
                <LoadingOverlay show={isLoading} />
            </div>
        </Provider>
    );
}

export default App;
