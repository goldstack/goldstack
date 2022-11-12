import { ReactPropertiesType } from '@goldstack/template-ssr';
import React from 'react';

function Wrapped<PropType extends ReactPropertiesType>({
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
