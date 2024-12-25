export type PageKeyType =
    | 'ProjectPage'
    | 'ChooseProductPage'
    | 'LoadingCopyToLocalPage'
    | 'ExportProductPage'
    | 'SetAttributePage'
    | 'LoadingPanelDatasetZipPage'
    | 'TrainPage'
    | 'InferenceResultPage'
    | 'ServerPage'
    | 'InferPage'
    | '';

export type ProjectStatusType = {
    init: false;
    export: {};
    copy_to_local: {
        status: string;
        detail: { panel_path: string; process: string };
        total_request: number;
        finish_request: number;
        panel_error: [];
        format_error: [];
    };
    generate_zip?: {
        status: string;
        detail: { step: number; process: string };
        total_step: number;
        finish_step: number;
    };
};

export type ProjectDataType = {
    project_uuid: string;
    dataset_uuid: string;
    export_uuid: string | null;
    project_name: string;
    project_status: ProjectStatusType;
    annotation: string;
    create_time: number;
};

export type XMLType = {
    source_file_name: string;
    source_uuid: string;
    source_path?: string;
};

export type PanelListType = {
    [key: string]: {
        [key: string]: {
            [key: string]: {
                [key: string]: XMLType;
            };
        };
    };
};

export type XMLDataType = {
    total: number;
    board: {
        [key: number]: string[];
    };
};

export type TrainValType = 'train' | 'val';

export type PassNgType = 'PASS' | 'NG' | 'GOLDEN' | 'DELETE';

export type PanelInfoType = {
    train: { PASS: number; NG: number };
    val: { PASS: number; NG: number };
};

export type PanelDatasetStatusType = {
    image_uuid: string;
    image_file_name: string;
};

export type PanelTrainValType = {
    PASS: Array<PanelDatasetStatusType>;
    NG: Array<PanelDatasetStatusType>;
    GOLDEN?: Array<PanelDatasetStatusType>;
    DELETE?: Array<PanelDatasetStatusType>;
};

export type PanelDatasetType = {
    check: boolean;
    train: PanelTrainValType;
    val: PanelTrainValType;
};

export type PanelDatasetPromiseType = {
    path: string;
    method: 'PUT' | 'DELETE';
    data: string[];
}[];

export type AttributeType = {
    title: string;
    desc: string;
};

export type ProgressType = {
    message: string;
    percent: number;
};

export type PathListType = {
    date: string;
    station: string;
    model: string;

};

export type FileType = {
    check_count: number | null;
    path: string;
}

export type OptionType = {
    value: string;
    label: string;
};

export type WorkspaceType = {
    project_uuid: string | null;
    dataset_uuid: string | null;
    export_uuid: string | null;
    tao_model_name: string | null;

};

export type TaoQuickTrainType = {
    tao_model_uuid: string;
    file: File | null;
}

export type TaoStartTrainType = {
    tao_model_uuid: string;
}


export type ErrorDetailType = {
    type: string;
    loc: string[];
    msg: string;
    input: string | null;
    url: string;
}[];