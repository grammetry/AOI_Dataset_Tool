import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';

const CompList = (props) => {

    return (
        <div className='my-comp-list-container'>
            {
                props.data.map((item, i) => (
                    <div key={`compList_${i}`} className='container-fluid my-comp-list-item mb-3'>
                        <div className='row mt-2 p-0'>
                            <div className='col-12 d-flex justify-content-start' style={{ paddingRight: 21 }}>
                                <div className='my-number-circle-sm' style={{position:'absolute',top:-10,left:-10}}>
                                {i+1}
                                </div>
                            </div>
                        </div>
                        <div className='row mt-2 p-0'>
                            <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                <div className='my-detail-title'>AI Result</div>
                                <div className='my-detail-item'>{(item.ai_result)?item.ai_result:'Null'}</div>
                            </div>
                        </div>
                        <div className='row mt-2 p-0'>
                            <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                <div className='my-detail-title'>Board Lane</div>
                                <div className='my-detail-item'>{item.board_imulti}</div>
                            </div>
                        </div>
                        <div className='row mt-2 p-0'>
                            <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                <div className='my-detail-title'>Component Name</div>
                                <div className='my-detail-item'>{item.component_name}</div>
                            </div>
                        </div>
                        <div className='row mt-2 p-0'>
                            <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                <div className='my-detail-title'>Machine Defect</div>
                                <div className='my-detail-item'>{item.machine_defect}</div>
                            </div>
                        </div>
                        <div className='row mt-2 p-0'>
                            <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                <div className='my-detail-title'>Part No.</div>
                                <div className='my-detail-item'>{item.part_no}</div>
                            </div>
                        </div>
                        <div className='row mt-2 mb-2'>
                            <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                <div className='my-detail-title'>Status</div>
                                <div className='my-detail-item'>{item.status}</div>
                            </div>
                        </div>

                        
                        
                        
                    </div>
                ))
            }
        </div>
    );
};

export default CompList;
