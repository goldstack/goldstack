import React from 'react';

import { Heading } from '@goldstack/toc-generator';

interface TocProps {
  headings: Heading[];
}

const Toc = (props: TocProps): JSX.Element => {
  return <>{JSON.stringify(props.headings)}</>;
};

export default Toc;
