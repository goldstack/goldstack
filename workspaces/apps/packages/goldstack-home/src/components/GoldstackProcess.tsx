const GoldstackProcess = (): React.ReactNode => {
  return (
    <div className="container ">
      <div className="w-md-80 w-lg-50 text-center mx-md-auto mb-5 mb-md-9">
        <h2>Build Your Starter Project in Three Simple Steps</h2>
      </div>

      <ul className="step step-md step-centered">
        <li className="step-item">
          <div className="step-content-wrapper">
            <span className="step-icon step-icon-soft-primary">1</span>
            <div className="step-content">
              <h3>Choose Modules</h3>
              <p>Select the modules you need from our library of golden templates.</p>
            </div>
          </div>
        </li>

        <li className="step-item">
          <div className="step-content-wrapper">
            <span className="step-icon step-icon-soft-primary">2</span>
            <div className="step-content">
              <h3>Configure</h3>
              <p>Provide basic configuration for your project with our web-based UI.</p>
            </div>
          </div>
        </li>

        <li className="step-item">
          <div className="step-content-wrapper">
            <span className="step-icon step-icon-soft-primary">3</span>
            <div className="step-content">
              <h3>Download and Install</h3>
              <p>
                Download ZIP archive with your customized project and run <code>yarn</code>.
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default GoldstackProcess;
