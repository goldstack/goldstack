const FeatureTailwind = (): JSX.Element => {
  return (
    <div className="card bg-navy mb-5 w-md-80 w-lg-50 mx-md-auto text-left">
      <div className="card-body text-monospace font-size-1 p-6">
        <div className="mb-3">
          <span className="d-block text-white-70">
            {'<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">'}
          </span>
          <span className="d-block text-white-70 ml-2">
            {'<h1 className="text-2xl font-bold">Hello Tailwind!</h1>'}
          </span>
          <span className="d-block text-white-70 ml-2">
            {'<p className="mt-2">Utility-first CSS framework</p>'}
          </span>
          <span className="d-block text-white-70">{'</div>'}</span>
        </div>
        <div className="mb-0">
          <span className="d-block text-white-70">
            {
              '<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">'
            }
          </span>
          <span className="d-block text-white-70 ml-2">{'Click me'}</span>
          <span className="d-block text-white-70">{'</button>'}</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureTailwind;
