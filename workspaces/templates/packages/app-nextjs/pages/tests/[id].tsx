import { useRouter } from 'next/router';
import React from 'react';

const TestIdPage = (): React.ReactNode => {
  const router = useRouter();
  const { message: id } = router.query;

  return (
    <div>
      <h1>Test</h1>
      <p>The message is: {id}</p>
    </div>
  );
};

export default TestIdPage;
