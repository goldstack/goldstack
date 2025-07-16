import React from 'react';

import Modal from 'react-bootstrap/Modal';
export interface NoModulesAddedModalProps {
  show: boolean;
  handleAddModules: () => void;
  handleProceed: () => void;
}

const NoModulesAddedModal = (props: NoModulesAddedModalProps): JSX.Element => {
  return (
    <>
      <Modal
        id="noModulesModal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="noModulesModal"
        show={props.show}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 id="noModulesModalTitle" className="modal-title">
                ⚠️ Warning
              </h4>
              <div className="modal-close">
                <button
                  type="button"
                  className="btn btn-icon btn-xs btn-ghost-secondary"
                  aria-label="Close"
                  onClick={props.handleAddModules}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 18 18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M11.5,9.5l5-5c0.2-0.2,0.2-0.6-0.1-0.9l-1-1c-0.3-0.3-0.7-0.3-0.9-0.1l-5,5l-5-5C4.3,2.3,3.9,2.4,3.6,2.6l-1,1 C2.4,3.9,2.3,4.3,2.5,4.5l5,5l-5,5c-0.2,0.2-0.2,0.6,0.1,0.9l1,1c0.3,0.3,0.7,0.3,0.9,0.1l5-5l5,5c0.2,0.2,0.6,0.2,0.9-0.1l1-1 c0.3-0.3,0.3-0.7,0.1-0.9L11.5,9.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div>
                <p>Looks like you have not selected any modules to be included in your project. </p>
                <p>Do you want to add modules to your project?</p>
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-white mr-2" onClick={props.handleProceed}>
                  No, proceed as is
                </button>
                <button type="button" className="btn btn-primary" onClick={props.handleAddModules}>
                  Yep, let me add some modules
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default NoModulesAddedModal;
