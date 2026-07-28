/* eslint-disable react/prop-types */
import React from 'react';
import './../src/styles/app.css';
const BootstrapApp = ({ Component, pageProps }) => {
    process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
    return <Component {...pageProps}/>;
};
export default BootstrapApp;
//# sourceMappingURL=_app.jsx.map