interface FoundationCardProps {
  img: string;
  title: string;
  caption: string;
}

export const FoundationCard = (props: FoundationCardProps): JSX.Element => {
  return (
    <div className="card card-frame h-100">
      <a className="card-body" href="app-description.html">
        <div className="media">
          <div className="avatar avatar-xs mt-1 mr-3">
            <img className="avatar-img" src={props.img} alt={props.title} />
          </div>
          <div className="media-body">
            <div className="d-flex align-items-center">
              <span className="d-block text-dark font-weight-bold">{props.title}</span>
            </div>
            <small className="d-block text-body">{props.caption}</small>
          </div>
        </div>
      </a>
    </div>
  );
};

export default FoundationCard;