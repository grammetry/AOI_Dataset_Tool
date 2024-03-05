import { MutableRefObject, useCallback, useEffect, useState } from 'react';

type IsOverflowProps = {
  itemRef: MutableRefObject<HTMLDivElement | null>;
  type?: 'width' | 'height';
};

const useIsOverflow = (props: IsOverflowProps) => {
  const { itemRef, type } = props;

  const [isOverFlow, setIsOverFlow] = useState<boolean>(false);

  const isOverflowActive = useCallback(
    (event: HTMLDivElement | null) => {
      if (event) {
        const originDimension = type === 'height' ? event.offsetHeight : event.offsetWidth;

        const scrollDimension = type === 'height' ? event.scrollHeight : event.scrollWidth;

        if (originDimension < scrollDimension) return true;
      }

      return false;
    },

    [type],
  );

  useEffect(() => {
    if (itemRef.current) {
      setIsOverFlow(isOverflowActive(itemRef.current));
    }
  }, [isOverflowActive, itemRef, itemRef.current?.innerText]);

  return isOverFlow;
};

export default useIsOverflow;
