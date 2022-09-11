import React from 'react';

function Wrapped<PropType>({
  Component,
}: {
  Component: React.FunctionComponent<PropType>;
}): React.FunctionComponent<PropType> {
  return function Wrapper(props: PropType): JSX.Element {
    return (
      <>
        <Component {...props}></Component>
      </>
    );
  };
}

export default Wrapped;
