import Docs from 'src/components/Docs';

export async function getStaticPaths(): Promise<any> {
  return {
    paths: [
      {
        params: {
          slug: ['home'],
        },
      },
    ],
    fallback: false, // Show 404 for pages that are not prerendered
  };
}

export default Docs;
