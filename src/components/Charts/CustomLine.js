import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import log from "../../utils/console";
import { Line } from 'react-chartjs-2';

const CustomLine = forwardRef((props, ref) => {

    const { totalStep, datasetId } = props;

    const [labels, setLabels] = useState([]);
    const [line1, setLine1] = useState([]);
    const [line2, setLine2] = useState([]);

    const [line1Label, setLine1Label] = useState('train_loss');
    const [line2Label, setLine2Label] = useState('val_loss');

    const theDecimation = {
        enabled: true,
        algorithm: "lttb",
        samples: 50
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            decimation: theDecimation,
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    font: {
                        size: 10,

                    },
                    color: '#979CB5'
                },
            },
            x: {
                beginAtZero: false,
                ticks: {
                    // stepSize: 5000,
                    // min: 0,
                    max: labels.length,
                    //max: totalStep,
                    // maxRotation: 0,
                    autoSkip: true,
                    font: {
                        size: 10
                    },
                    color: '#979CB5'
                },

            },

        },
        pointRadius: props.totalStep >= 40 ? 0 : 1,
        borderWidth: 3,
        pointHoverRadius: 4,
        animation: {
            duration: 0
        },
        parsingOptions: {
            parsing: false
        },
    };

    useImperativeHandle(ref, () => ({

        updateLine1Data: (curStep, curValue) => {

            const myLine1 = line1;
            myLine1[curStep - 1] = curValue;
            setLine1(myLine1);

        },
        updateLine2Data: (curStep, curValue) => {

            const myLine2 = line2;
            myLine2[curStep - 1] = curValue;
            setLine2(myLine2);

        },
        resetLineData:()=>{
            setLine1([]);
            setLine2([]);
        }
    }));

    useEffect(() => {

        if ((props.totalStep > 0) && (props.datasetId !== '')) {

            const myLable = [];
            const myLine1 = [];
            const myLine2 = [];
            for (let i = 1; i <= props.totalStep; i++) {
                myLable.push(i);
                myLine1.push(null);
                myLine2.push(null);
            }
            setLabels(myLable);
            setLine1(myLine1);
            setLine2(myLine2);

        }


    }, [ totalStep, datasetId])




    return (
        <Line options={options} data={{
            labels, datasets: [
                {
                    label: line1Label,
                    data: line1,
                    borderColor: '#E61F23',
                    backgroundColor: '#E61F23',
                    lineTension: 0.2
                },
                {
                    label: line2Label,
                    data: line2,
                    borderColor: '#57B8FF',
                    backgroundColor: '#57B8FF',
                    lineTension: 0.2
                }
            ]
        }} />
    );



});

export default CustomLine;