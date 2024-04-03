import { useState,useEffect } from 'react';

const Pagination = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageGroup, setCurrentPageGroup] = useState(1);
    const totalNum = 123;
    const pageNum = 10;
    const groupNum = 8;
    const [pageArr, setPageArr] = useState<number[]>([]);

    
    useEffect(() => {
        let myArr: number[] = [];
        for (let i = 0; i <= Math.ceil(currentPageGroup*groupNum)-1; i++) {
            myArr.push(i + 1)
            setPageArr(myArr)
        }
    
    }, []);

    return (

        <div className='d-flex flex-row my-page-row'>
            <div className='my-page-item d-flex align-items-center justify-content-center'>{'|<'}</div>
            <div className='my-page-item d-flex align-items-center justify-content-center'>{'<<'}</div>
            {pageArr.map((pageItem, index) =>
                 <div className={(pageItem===currentPage)?'my-page-item-selected d-flex align-items-center justify-content-center':'my-page-item d-flex align-items-center justify-content-center'}
                    onClick={()=>setCurrentPage(pageItem)}
                 >{pageItem}</div>
            )}
            <div className='my-page-item d-flex align-items-center justify-content-center'>{'>>'}</div>
            <div className='my-page-item d-flex align-items-center justify-content-center'>{'>|'}</div>
        </div>

    );
};

export default Pagination;
