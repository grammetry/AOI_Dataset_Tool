import React, { useState, useEffect } from 'react';

const ResultTableList = (props) => {

    const tableColumnWidth = [100, 150, 150, 150, 150, 150, 150];
    const [tableHeaderNoShadow, setTableHeaderNoShadow] = useState(true);
    const [resultList, setResultList] = useState([{a:'1',b:'2'},{a:'111',b:'222'}]);


    const handleLabelToggle = (imageUuid) => {
        props.onChange(imageUuid);
    }

    useEffect(() => {

        console.log("ResultTableList", props.data);

        if (props.data.length > 0) {
            //setResultList(props.data);
        }

        

    }, [props.data]);

    useEffect(() => {


        console.log("resultList", resultList);

    

    }, [resultList]);

    return (


        <div className="my-table-container" style={{ width: 1114, marginTop: 25 }}>

            <div className='my-table'>
                <div className={(tableHeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'} style={{ backgroundColor: "#FAFAFD" }}>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[0] }}>Order</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[1] }}>Part No.</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[2] }}>Light Source</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[3] }}>Score</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[4] }}>Image</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[5] }}>Golden</div>
                    <div className='my-thead-th' style={{ width: tableColumnWidth[6] }}>Label</div>
                </div>
                <div className='my-tbody' style={{ height: 615 }}>

                    <div key={`aaa`} >
                        
                        <div className="my-tbody-row-1">

                            <div className='my-tbody-td' style={{ width: tableColumnWidth[0] }} >0</div>
                            <div className='my-tbody-td' style={{ width: tableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                aaa

                            </div>

                            <div className='my-tbody-td' style={{ width: tableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                bbb

                            </div>

                        </div>
                    </div>

                    {
                        resultList.map((item, index) => {

                            <div key={`result_table_${index}`} >
                                
                                <div className="my-tbody-row-1" >

                                    <div className='my-tbody-td' style={{ width: tableColumnWidth[0] }} >{index + 1}</div>
                                    <div className='my-tbody-td' style={{ width: tableColumnWidth[1] }} >

                                        {item.a}

                                    </div>

                                    <div className='my-tbody-td' style={{ width: tableColumnWidth[2] }} >

                                        {item.b}

                                    </div>

                                </div>
                            </div>

                        })
                    }




                </div>
            </div>
        </div>
    );
};

export default ResultTableList;

