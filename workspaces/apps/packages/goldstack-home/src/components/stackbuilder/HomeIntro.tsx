import React from 'react';

const HomeIntro = (): JSX.Element => {
  return (
    <>
      <p>
        Project builder for fullstack serverless applications on AWS using
        TypeScript.
      </p>
      <div>
        <a href="#" style={{ marginRight: '1rem' }}>
          About
        </a>
        ·<span>2,431 projects generated</span>·
        {/* from https://ghbtns.com/ --> */}
        <iframe
          src="https://ghbtns.com/github-btn.html?user=goldstack&repo=goldstack&type=star&count=true"
          frameBorder="0"
          scrolling="0"
          width="90"
          height="20"
          title="GitHub Star Goldstack"
        ></iframe>
      </div>
    </>
  );
};

export default HomeIntro;
