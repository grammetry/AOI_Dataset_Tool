import { HtmlHTMLAttributes, MutableRefObject, ReactNode, useRef } from 'react';
import { ThemeProvider } from '@mui/material';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

import { theme } from '../page/ProjectPage';

import useIsOverflow from '../hooks/useIsOverflow';

type PropsType = {
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  overflowDirection?: 'width' | 'height';
  tooltipProps?: Partial<TooltipProps>;
  tooltipContent?: ReactNode;
} & HtmlHTMLAttributes<HTMLDivElement>;

const DivEllipsisWithTooltip = (props: PropsType) => {
  const { innerRef, overflowDirection = 'width', tooltipContent, tooltipProps = {}, ...restProps } = props;
  const ref = useRef<HTMLDivElement | null>(innerRef?.current ?? null);
  const isOverflow = useIsOverflow({ itemRef: ref, type: overflowDirection });

  return (
    <ThemeProvider theme={theme}>
      <Tooltip arrow enterDelay={400} enterNextDelay={400} title={isOverflow ? tooltipContent || props.children : ''} {...tooltipProps}>
        <div ref={ref} className="ellipsis" {...restProps} />
      </Tooltip>
    </ThemeProvider>
  );
};

export default DivEllipsisWithTooltip;
