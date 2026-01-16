import React from 'react';
import { useRouter } from 'next/router';

const SayItPage = (): React.ReactNode => {
  const router = useRouter();
  const { message } = router.query;

  return (
    <div>
      <h1>Say It</h1>
      <p>The message is: {message}</p>
    </div>
  );
};

export default SayItPage;
