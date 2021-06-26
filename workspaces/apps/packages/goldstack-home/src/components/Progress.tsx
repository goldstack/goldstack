import React from 'react';

import styled from 'styled-components';
const ProgressWrapper = styled.div`
  padding-top: 1.375rem;
`;
const Bounce = styled.span`
  display: inline-flex;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-name: bounce;
  animation-timing-function: ease;
  transform-origin: bottom;

  @keyframes bounce {
    0% {
      transform: scale(1, 1) translateY(0);
    }
    50% {
      transform: scale(1, 1) translateY(-7px);
    }
    100% {
      transform: scale(1, 1) translateY(0);
    }
  }
`;

const Progress = (props: { progressMessage: string }): JSX.Element => {
  return (
    <ProgressWrapper>
      {/* <Bounce hidden={props.progressMessage === ''}>👷</Bounce>{' '} */}
      {props.progressMessage}
    </ProgressWrapper>
  );
};

export default Progress;
