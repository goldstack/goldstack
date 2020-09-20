import React from 'react';
import Docs from './../../components/Docs';

import docsHome from './../../data/docs/index.json';

const DocsHome = (): JSX.Element => {
  return <Docs title={docsHome.data.title} contentHtml={docsHome.html}></Docs>;
};

export default DocsHome;
