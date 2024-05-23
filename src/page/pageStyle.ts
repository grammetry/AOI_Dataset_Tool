import styled from 'styled-components';


// $background?: string; }>
export const SchedulerHeadContainer = styled.div<{ $noOverFlow?: boolean }>`   
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: flex-start;
  height: 49px;
  width: 100%;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  border-bottom: 1px solid #16272E3D;
  background-color:#ffffff;
  
  @media(max-width: 1366px){
    justify-content: flex-start;
    overflow-x: auto;
  }

  @media(max-height: 850px){
    overflow: auto;
  }
`;

export const SchedulerHeadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin: 0px;
  position: relative;
  width: 1200px;
  height: 42px;
  
`;

export const SchedulerBodyContainer = styled.div<{ $noOverFlow: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  height: calc(100vh - 166px);
  width: 100%;
  overflow: ${(props) => (props.$noOverFlow ? 'hidden' : 'auto')};
  font-family: 'Roboto', sans-serif;
  
  @media(max-width: 1366px){
    justify-content: flex-start;
    overflow-x: auto;
  }

  @media(max-height: 850px){
    overflow: auto;
  }
`;

export const SchedulerBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin: 36px 56px;
  position: relative;
  width: 1200px;
  
`;


