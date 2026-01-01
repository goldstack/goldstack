export interface BreadcrumbElement {
  description: string;
  link?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  elements: BreadcrumbElement[];
}

const Breadcrumb = (props: BreadcrumbProps): JSX.Element => {
  return (
    <div className="bg-light">
      <div className="container py-3">
        <div className="row justify-content-md-between align-items-md-center">
          <div className="col-md-5 mb-3 mb-md-0">
            <nav className="d-inline-block rounded" aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-no-gutter font-size-1 mb-0">
                {props.elements.map((element) => {
                  return (
                    <li
                      key={element.description}
                      className={element.active ? 'breadcrumb-item active' : 'breadcrumb-item'}
                      aria-current={element.active ? 'page' : 'false'}
                    >
                      {element.link ? (
                        <a href={element.link}>{element.description}</a>
                      ) : (
                        element.description
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
