import React, { useState, forwardRef, useEffect, useImperativeHandle, useRef, useContext, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { filter, cloneDeep, set } from 'lodash-es';
import log from "../../utils/console";
import CustomButton from '../../components/Buttons/CustomButton';
import CustomLine from '../../components/Charts/CustomLine';
import InfoTag from '../../components/Tags/InfoTag';

import LightGreenIcon from '../../image/Light_Green.png';
import LightRedIcon from '../../image/Light_Red.png';
import LightGrayIcon from '../../image/Light_Gray.png';

import styled from 'styled-components';

const Container = styled.div`
    width:820px; 
    font-size:15px;
    text-align:center;
    margin:auto;
    position:relative;
`;


const Line1 = styled.div`
    font-size:0;
    width:1px;
    height:20px;
    color:#fff;
    background-color:gray;
    margin:auto;
`;

const Line2 = styled.div`
    font-size:0;
    width:630px;
    height:1px;
    color:#fff;
    background-color:gray;    
    margin:auto;
`;

const Line3 = styled.div`
    font-size:0;
    display:inline;
    width:1px;
    height:20px;
    color:#fff;
    background-color:gray;
    margin-left:95px;
    float:left;
`;

const Line4 = styled.div`
    font-size:0;
    font-size:0;
    display:inline;
    width:1px;
    height:20px;
    color:#fff;
    background-color:gray;
    margin-left:314px;
    float:left;
`;

const No1 = styled.div`
    width:190px;
    height:95px;
    border:1px solid gray;
    margin:auto;
    border-radius:5px;
    padding-top:0px;
    position:relative;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    &:hover {
        color:#fff;
        background: #3e50b4;
        background: -webkit-linear-gradient(left top, #3e50b4, #2196F3);
        background: -o-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: -moz-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: linear-gradient(to bottom right, #3e50b4, #2196F3);
    }
  }
`;

const No1_Null = styled.div`
    width:190px;
    height:95px;
    border:1px solid gray;
    margin:auto;
    border-radius:5px;
    padding-top:0px;
    position:relative;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
   
`;


const No2 = styled.div`
    display:inline;
    border:1px solid gray;
    clear:both;
    margin-left:0px;
    float:left;
    width:190px; 
    height:95px;
    padding-top:0px;
    border-radius:5px;
    position:relative;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    &:hover {
        color:#fff;
        background: #3e50b4;
        background: -webkit-linear-gradient(left top, #3e50b4, #2196F3);
        background: -o-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: -moz-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: linear-gradient(to bottom right, #3e50b4, #2196F3);
    }
`;

const No3 = styled.div`
    display:inline;
    border:1px solid gray;
    margin-left:125px;
    float:left;
    width:190px; 
    height:95px;
    padding-top:0px;
    border-radius:5px;
    position:relative;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    &:hover {
        color:#fff;
        background: #3e50b4;
        background: -webkit-linear-gradient(left top, #3e50b4, #2196F3);
        background: -o-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: -moz-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: linear-gradient(to bottom right, #3e50b4, #2196F3);
    }
`;
const No4 = styled.div`
    display:inline;  
    border:1px solid gray;
    margin-left:125px;
    float:left;
    width:190px; 
    height:95px;
    padding-top:0px;
    border-radius:5px;
    position:relative;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    &:hover {
        color:#fff;
        background: #3e50b4;
        background: -webkit-linear-gradient(left top, #3e50b4, #2196F3);
        background: -o-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: -moz-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: linear-gradient(to bottom right, #3e50b4, #2196F3);
    }
`;

const No5 = styled.div`
    display:inline;   
    border:1px solid gray;
    margin-left:20px;
    float:left;
    width:190px; 
    height:95px;
    padding-top:0px;
    border-radius:5px;
    position:relative;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    &:hover {
        color:#fff;
        background: #3e50b4;
        background: -webkit-linear-gradient(left top, #3e50b4, #2196F3);
        background: -o-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: -moz-linear-gradient(bottom right, #3e50b4, #2196F3);
        background: linear-gradient(to bottom right, #3e50b4, #2196F3);
    }
`;


const ClinetServerChart = forwardRef((props, ref) => {

    let { data, updateStatus } = props;

    const chart1Ref = useRef();
    const chart2Ref = useRef();

    const [chartType, setChartType] = useState('train');

    const [curveData, setCurveData] = useState([]);

    const [serverCID, setServerCID] = useState('');
    const [serverPID, setServerPID] = useState('');
    const [serverPort, setServerPort] = useState('');
    const [client1CID, setClient1CID] = useState('');
    const [client1PID, setClient1PID] = useState('');
    const [client2CID, setClient2CID] = useState('');
    const [client2PID, setClient2PID] = useState('');
    const [client3CID, setClient3CID] = useState('');
    const [client3PID, setClient3PID] = useState('');
    const [client4CID, setClient4CID] = useState('');
    const [client4PID, setClient4PID] = useState('');


    const refsById = useMemo(() => {
        const refs = {}

        refs[serverCID] = React.createRef(null);
        refs[client1CID] = React.createRef(null);
        refs[client2CID] = React.createRef(null);
        refs[client3CID] = React.createRef(null);
        refs[client4CID] = React.createRef(null);

        return refs
    }, [serverCID, client1CID, client2CID, client3CID, client4CID])


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

    useEffect(() => {

        //console.log('ClinetServerChart data', data);
        //console.log('data.server_container', data.server_container);

        if (data.status === 'running') {
            const server_cid = Object.keys(data.server_container)[0];
            //console.log('server_cid', server_cid);
            setServerCID(server_cid);
            //const server_pid = data.server_container[server_cid].process_uuid;
            //console.log('server_pid', server_pid);
            //setServerPID(server_pid);
            //const server_port = data.server_container[server_cid].port;
            //console.log('server_port', server_port);
            //setServerPort(server_port);
            const client_1_cid = Object.keys(data.client_container)[0];
            //console.log('client_1_cid', client_1_cid);
            setClient1CID(client_1_cid);
            //const client_1_pid = data.client_container[client_1_cid].process_uuid;
            //console.log('client_1_pid', client_1_pid);
            //setClient1PID(client_1_pid);
            const client_2_cid = Object.keys(data.client_container)[1];
            setClient2CID(client_2_cid);
            //const client_2_pid = data.client_container[client_2_cid].process_uuid;
            //setClient2PID(client_2_pid);
            const client_3_cid = Object.keys(data.client_container)[2];
            setClient3CID(client_3_cid);
            //const client_3_pid = data.client_container[client_3_cid].process_uuid;
            //setClient3PID(client_3_pid);
           
        }



        //const offlineContainer=Object.keys(data.offline_container)

        // const offline_cid = Object.keys(data.offline_container_container[offlineContainer])[0];

        //console.log('offline_cid',offlineContainer)

    }, [data]);


    useEffect(() => {

        //console.log('updateStatus', updateStatus);

        if (updateStatus.server_container) {

            if (Object.keys(updateStatus.server_container).length === 0) {
                if (refsById[serverCID]) {
                    if (refsById[serverCID].current) {
                        refsById[serverCID].current.src = LightGrayIcon;
                    }

                }
            }



            const server_cid = Object.keys(updateStatus.server_container)[0];

            const myStatus = updateStatus.server_container[server_cid];


            if (refsById[server_cid]) {
                if (refsById[server_cid].current) {
                    refsById[server_cid].current.src = (myStatus === 'active') ? LightGreenIcon :
                        (myStatus === 'inactive') ? LightRedIcon : LightGrayIcon;
                }

            }

        }

        if (updateStatus.client_container) {

            if (Object.keys(updateStatus.client_container).length === 0) {
                if (refsById[client1CID]) {
                    if (refsById[client1CID].current) {
                        refsById[client1CID].current.src = LightGrayIcon;
                    }

                }
                if (refsById[client2CID]) {
                    if (refsById[client2CID].current) {
                        refsById[client2CID].current.src = LightGrayIcon;
                    }

                }
                if (refsById[client3CID]) {
                    if (refsById[client3CID].current) {
                        refsById[client3CID].current.src = LightGrayIcon;
                    }

                }
                if (refsById[client4CID]) {
                    if (refsById[client4CID].current) {
                        refsById[client4CID].current.src = LightGrayIcon;
                    }

                }

            }

            const client_cids = Object.keys(updateStatus.client_container);

            //console.log('client_cids', client_cids);

            client_cids.forEach((client_cid) => {
                const myStatus = updateStatus.client_container[client_cid];
                if (refsById[client_cid]) {
                    if (refsById[client_cid].current) {
                        refsById[client_cid].current.src = (myStatus === 'active') ? LightGreenIcon :
                            (myStatus === 'inactive') ? LightRedIcon : LightGrayIcon;
                    }
                }

            });



        }


    }, [updateStatus]);

    return (
        <div className="d-flex flex-column" style={{ padding: '0px 0px 0px 0px' }}>
            {
                ((data.status === 'running') || (data.status === 'stop')) ?
                    <Container>
                        <No1 className="d-flex flex-column justify-content-center align-items-center gap-1">
                            Server
                            {/* <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="CID" value={serverCID} />
                            <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="PID" value={serverPID} />
                            <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="Port" value={serverPort} /> */}
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[serverCID]} />
                        </No1>
                        <Line1></Line1>
                        <Line2></Line2>
                        <Line3></Line3>
                        <Line4></Line4>
                        <Line4></Line4>
                       
                        <No2 className="d-flex flex-column justify-content-center align-items-center gap-1">
                            Client 1
                            {/* <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="CID" value={client1CID} />
                            <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="PID" value={client1PID} /> */}
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[client1CID]} />
                        </No2>
                        <No3 className="d-flex flex-column justify-content-center align-items-center gap-1">
                            Client 2
                            {/* <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="CID" value={client2CID} />
                            <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="PID" value={client2PID} /> */}
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[client2CID]} />
                        </No3>
                        
                        <No4 className="d-flex flex-column justify-content-center align-items-center gap-1">
                            Client 3
                            {/* <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="CID" value={client4CID} />
                            <InfoTag size="sm" w1={30} w2={90} color='#E61F23' label="PID" value={client4PID} /> */}
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[client3CID]} />
                        </No4>
                        {/* <div style={{color:'#E61F23',fontSize:14,position:'absolute',top:250,left:0}}>* offline data handler</div> */}
                    </Container>
                    :
                    <Container>
                        <No1_Null className="d-flex flex-column justify-content-center align-items-center gap-1" style={{borderStyle:'dashed',backgroundColor:'white'}}> 
                            Server
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[serverCID]} />
                        </No1_Null>
                        <Line1></Line1>
                        <Line2></Line2>
                        <Line3></Line3>
                        <Line4></Line4>
                        <Line4></Line4>
                        <No2 className="d-flex flex-column justify-content-center align-items-center gap-1" style={{borderStyle:'dashed'}}>
                            Client 1
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[client1CID]} />
                        </No2>
                        <No3 className="d-flex flex-column justify-content-center align-items-center gap-1" style={{borderStyle:'dashed'}}>
                            Client 2
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[client2CID]} />
                        </No3>
                        <No4 className="d-flex flex-column justify-content-center align-items-center gap-1" style={{borderStyle:'dashed'}}>
                            Client 3
                            <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={refsById[client3CID]} />
                        </No4>
                    </Container>
            }

        </div>
    )
});

export default ClinetServerChart;