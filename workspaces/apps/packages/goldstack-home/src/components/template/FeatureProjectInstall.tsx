const FeatureProjectInstall = (props: { projectName: string }): JSX.Element => {
  return (
    <>
      <div className="card bg-navy mb-5 w-md-80 w-lg-50 mx-md-auto text-left">
        <div className="card-body text-monospace font-size-1 p-6">
          <div className="mb-6">
            <span className="d-block text-white-70"> $ yarn</span>
            <span className="d-block h4 text-success font-weight-normal">
              Project setup and dependencies downloaded!
            </span>
          </div>
          <div className="mb-0">
            <span className="d-block text-white-70"> $ cd packages/{props.projectName}</span>
            <span className="d-block text-white-70"> $ yarn watch</span>
            <span className="d-block h4 text-success font-weight-normal">
              Ready for local development!
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureProjectInstall;
