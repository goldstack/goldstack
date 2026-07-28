// biome-ignore lint/correctness/noUnusedImports: React
import React from 'react';
import '../src/styles/globals.css';
const App = ({ Component, pageProps }) => {
    process.env.GOLDSTACK_DEPLOYMENT = process.env.NEXT_PUBLIC_GOLDSTACK_DEPLOYMENT;
    return <Component {...pageProps}/>;
};
export default App;
//# sourceMappingURL=_app.jsx.map