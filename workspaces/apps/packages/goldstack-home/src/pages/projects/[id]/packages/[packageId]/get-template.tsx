import { getEndpoint } from '@goldstack/goldstack-api';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ConfigureSession from 'src/components/ConfigureSession';
import GetTemplateDescription from 'src/components/GetTemplateDescription';
import Header from 'src/components/Header';
import useSWR from 'swr';

const fetcher = (url: string): any =>
  fetch(url, {
    credentials: 'include',
  }).then((r) => r.json());

const GetTemplatePage = (): JSX.Element => {
  const router = useRouter();
  const { id, packageId } = router.query;
  if (!id || !packageId) {
    return (
      <>
        <Header></Header>
      </>
    );
  }

  const { data, error } = useSWR(`${getEndpoint()}/sessions`, fetcher);
  const onConfigurationComplete = (): void => {
    router.push(`/projects/${id}/packages/${packageId}/download`);
  };

  if (data && data.paymentReceived) {
    (async (): Promise<void> => {
      const sessionRes = await fetch(`${getEndpoint()}/sessions/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          projectId: id,
          packageId,
          downloadUrl: `https://${window.location.hostname}/projects/${id}/packages/${packageId}/download`,
        }),
      });
      if (sessionRes.status !== 200) {
        throw new Error('Cannot restore session');
      }
      router.push(`/projects/${id}/packages/${packageId}/download`);
    })();
  }

  return (
    <>
      <Head>
        <title>Get Template</title>
      </Head>
      <Header></Header>
      <Container className="space-2 space-lg-3">
        <Row className="justify-content-lg-between align-items-lg-center">
          <Col lg={6}>
            {error && <p>Error loading session data {error.toString()}</p>}
            {data && !data.paymentReceived && (
              <ConfigureSession
                onConfigurationComplete={onConfigurationComplete}
                projectId={id as string}
                packageId={packageId as string}
                stripeId={data.stripeId as string}
              ></ConfigureSession>
            )}
            {data && data.paymentReceived && <p>User session already confirmed. Thank you!</p>}
          </Col>
          <Col lg={5} className="mb-7 mb-lg-0 pt-5">
            <GetTemplateDescription></GetTemplateDescription>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GetTemplatePage;
