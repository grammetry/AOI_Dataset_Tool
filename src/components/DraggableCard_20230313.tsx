import { MouseEvent } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { datasetImgAPI } from '../APIPath';

import { openImgInNewTab } from '../utils';

const DraggableCard = ({ item, index, isGolden }: { item: any; index: number; isGolden?: boolean }) => {
  const handleClick = (e: MouseEvent, img: string) => {

    console.log('item click')

    if (e.altKey) {
      openImgInNewTab(datasetImgAPI(img));
    }
  };

  return (
    <Draggable draggableId={item.image_uuid} index={index}>
      {(provided) => {
        if (isGolden) {
          return (
            <div
              ref={provided.innerRef}
              className="drag-item-golden"
             
              onClick={(e) => handleClick(e, item.image_uuid)}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <img src={datasetImgAPI(item.image_uuid, 256)} alt="img" />
            </div>
          );
        } else {
          return (
            <div
              ref={provided.innerRef}
              className="drag-item"
              style={{backgroundColor:'red'}}
              onClick={(e) => handleClick(e, item.image_uuid)}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <img src={datasetImgAPI(item.image_uuid, 60)} alt="img" />
            </div>
          );
        }
      }}
    </Draggable>
  );
};

export default DraggableCard;
