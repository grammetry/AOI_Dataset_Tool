import React, { useState, forwardRef, useEffect, useImperativeHandle, useRef, useContext, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { filter, cloneDeep } from 'lodash-es';
import log from "../../utils/console";
import CustomButton from '../../components/Buttons/CustomButton';
import CustomLine from '../../components/Charts/CustomLine';
//import { WsContext } from '../../layout/logIn/LoginLayout';
//import { useAPIModelInit, useCurveDataResult, useAPICurveAndLog } from '../../pages/model/hook/useModelData';
//import { getCurveAPI, getDatasetListAPI } from '../../constant/API';
//import { io } from 'socket.io-client';

//import { selectCurrentTrainInfo } from '../../redux/store/slice/currentTrainInfo';
//import { selectIsTraining } from "../../redux/store/slice/isTraining";
//import { apiHost, socketHost } from '../../constant/API/APIPath';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Decimation,
} from 'chart.js';
import { ChargingStation } from "@mui/icons-material";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Decimation
);


const CustomChart = forwardRef((props, ref) => {

    let { datasetId, dataType, lastIter, totalStep } = props;

    const chart1Ref = useRef();
    const chart2Ref = useRef();

    const [chartType, setChartType] = useState('train');

    const [curveData, setCurveData] = useState([]);


    useImperativeHandle(ref, () => ({

        getCurveHistory: (datasetId, lastIter) => {

          

        },
        resetLineData: () => {
            chart1Ref.current.resetLineData();
            chart2Ref.current.resetLineData();
        },
        updateChart1Line1Data: (step, value) => {
            chart1Ref.current.updateLine1Data(step, value);
        },
        updateChart1Line2Data: (step, value) => {
            chart1Ref.current.updateLine2Data(step, value);
        }

    }));


    // useEffect(() => {

    //     if (datasetId !== '') {

    //         const socket = io(`${socketHost}/${datasetId}/log`);

    //         socket.on('connect', () => {
    //             //log(`Connected to [${datasetId}] channel`);

    //             getCurveAPI(datasetId, { iteration: lastIter })
    //             .then(({ data }) => {
    //                 const status = Object.keys(data.data).map((v) => data.data[v].status)
    //                 const myCurrentStep = status.length;
    //                 props.updateStep(myCurrentStep);

    //                 Object.keys(status).forEach((v) => {

    //                     if (v < myCurrentStep) {

    //                         if (dataType === 'classification') {

    //                             chart1Ref.current.updateLine1Data(Number(v)+1,status[Number(v)].loss);
    //                             chart1Ref.current.updateLine2Data(Number(v)+1,status[Number(v)].acc);
    //                             chart2Ref.current.updateLine1Data(Number(v)+1,status[Number(v)].val_loss);
    //                             chart2Ref.current.updateLine2Data(Number(v)+1,status[Number(v)].val_acc);

    //                         } else {

    //                             chart1Ref.current.updateLine1Data(Number(v)+1,status[Number(v)].avg_loss);
    //                             chart2Ref.current.updateLine1Data(Number(v)+1,status[Number(v)].mAP);

    //                         }

    //                     }

    //                 })
    //             })
    //             .catch((err) => {
    //                 log('getCurveAPI-Err', err);

    //             })
    //         });

    //         socket.on('curve', (message) => {


    //             const myData = JSON.parse(message)
    //             const myStep = parseInt(myData.step);
    //             props.updateStep(myStep);

    //             if (myData.status.avg_loss) {

    //                 chart1Ref.current.updateLine1Data(myStep,myData.status.avg_loss);

    //             }

    //             if (myData.status.mAP) {

    //                 chart2Ref.current.updateLine1Data(myStep,myData.status.mAP);

    //             }

    //             if (myData.status.loss) {

    //                 chart1Ref.current.updateLine1Data(myStep,myData.status.loss);

    //             }

    //             if (myData.status.acc) {

    //                 chart1Ref.current.updateLine2Data(myStep,myData.status.acc);

    //             }

    //             if (myData.status.val_loss) {

    //                 chart2Ref.current.updateLine1Data(myStep,myData.status.val_loss);

    //             }

    //             if (myData.status.val_acc) {

    //                 chart2Ref.current.updateLine2Data(myStep,myData.status.val_acc);

    //             }

    //         })


    //         // 在組件卸載時斷開連接
    //         return () => {
    //             socket.disconnect();
    //         };

    //     }
    // }, [datasetId]);

    return (
        <div className="d-flex flex-column" style={{ padding: '20px 24px 15px 24px' }}>
            <div className="d-flex flex-start" style={{ color: '#16272E', fontSize: 16, fontWeight: 500}}>Data visualized</div>

            <div className="d-flex flex-row justify-content-end" style={{ marginBottom: 5 }}>
                
                {/* <div className="d-flex flex-start">
 
                    <div style={{ marginRight: 8 }}><CustomButton name="train" width={40} height={18} active={chartType === 'train'} onClick={(chartType) => setChartType(chartType)} /></div>
                    <div><CustomButton name="val" width={40} height={18} active={chartType === 'val'} onClick={(chartType) => setChartType(chartType)} /></div>
                 
                </div> */}

                <div className="d-flex flex-row align-items-center" style={{ fontSize: 12, color: '#979CB5' }}>

                    <div style={{ marginRight: 3, width: 10, height: 10, backgroundColor: '#E61F23', borderRadius: 4 }}></div>
                    <div style={{width:60}}>train loss</div>

                </div>

                <div className="d-flex flex-row align-items-center" style={{ fontSize: 12, color: '#979CB5' }}>

                    <div style={{ marginRight: 3, width: 10, height: 10, backgroundColor: '#57B8FF', borderRadius: 4 }}></div>
                    <div>val loss</div>

                </div>
            </div>


            <div className="d-flex flex-row" style={{ height: 200, width: 252 }}>
                <div style={{ display: chartType === 'train' ? 'flex' : 'none', width: '100%', height: '100%' }}>
                    <CustomLine totalStep={totalStep} datasetId={datasetId} ref={chart1Ref} />
                </div>

                <div style={{ display: chartType === 'val' ? 'flex' : 'none', width: '100%', height: '100%' }}>
                    <CustomLine totalStep={totalStep} datasetId={datasetId} ref={chart2Ref} />
                </div>
            </div>


        </div>
    )
});

export default CustomChart;