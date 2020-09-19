import React from 'react';
import { useRouter } from 'next/router';

import Header from 'src/components/Header';

import Navigation from './Navigation';

import sitemap from './../data/docs/sitemap.json';

const Docs = (): JSX.Element => {
  const { query } = useRouter();

  const path = query.slug ? (query.slug as string[]).join('/') : '/';
  return (
    <>
      <Header></Header>
      <main className="container-fluid space-top-3 space-top-md-2 pl-lg-7 pr-xl-7">
        <div className="row justify-content-lg-end">
          <nav className="mt-2 col-lg-3 col-xl-2 hs-sidebar navbar-expand-lg px-0 ml-xl-7">
            <div className="collapse navbar-collapse" id="sidebar-nav">
              <Navigation
                items={sitemap[0].children}
                currentPath={path}
              ></Navigation>
            </div>
          </nav>
          <div className="col-lg-9">{JSON.stringify(query, null, 2)}</div>
        </div>
      </main>
    </>
  );
};

export default Docs;
