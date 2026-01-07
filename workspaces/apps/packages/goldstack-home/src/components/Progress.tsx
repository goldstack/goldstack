import styled from 'styled-components';

const ProgressWrapper = styled.div`
  padding-top: 1.375rem;
  display: inline;
`;

const Progress = (props: { progressMessage: string }): React.ReactNode => {
  return <ProgressWrapper>{props.progressMessage}</ProgressWrapper>;
};

export default Progress;
