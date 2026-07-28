import React from 'react';
import { getEndpoint } from '@goldstack/goldstack-api';
import { useRouter } from 'next/router';
import Download from 'src/components/Download';
import Footer from 'src/components/Footer';
import Header from 'src/components/Header';
const DownloadPage = () => {
    const router = useRouter();
    const { id, packageId, token } = router.query;
    // if inject token specified, ensure cookie is set
    if (token) {
        (async () => {
            const sessionRes = await fetch(`${getEndpoint()}/sessions`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify({
                    injectToken: token,
                }),
            });
            if (sessionRes.status !== 200) {
                throw new Error('Cannot restore session');
            }
            router.push(`/projects/${id}/packages/${packageId}/download`);
        })();
    }
    if (!id || !packageId) {
        return (<>
        <Header></Header>
        <Footer></Footer>
      </>);
    }
    return (<>
      <Header></Header>
      {!token && <Download projectId={id} packageId={packageId}></Download>}
      {token && <p>Restoring session</p>}
    </>);
};
export default DownloadPage;
//# sourceMappingURL=download.jsx.map