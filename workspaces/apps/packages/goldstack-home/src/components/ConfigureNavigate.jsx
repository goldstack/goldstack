import Link from 'next/link';
import { useRouter } from 'next/router';
const SelectedItem = (props) => {
    return (<div className="media align-items-center mb-3">
      <span className="d-block font-size-1 mr-3">
        <b>{props.title}</b>
      </span>
    </div>);
};
const LinkItem = (props) => {
    const router = useRouter();
    const { id, packageId } = router.query;
    return (<div className="media align-items-center mb-3">
      <span className="d-block font-size-1 mr-3">
        <Link href="/projects/[id]/packages/[packageId]/configure/[step]" as={`/projects/${id}/packages/${packageId}/configure/${props.idx + 1}`} prefetch={false} shallow={true}>
          {props.title}
        </Link>
      </span>
    </div>);
};
const Item = (props) => {
    if (props.idx === props.currentItem - 1) {
        return <SelectedItem title={props.title}></SelectedItem>;
    }
    return <LinkItem title={props.title} id={props.id} idx={props.idx}></LinkItem>;
};
const ConfigureNavigate = (props) => {
    const packageItems = props.configureSteps.map((configureStep) => {
        return (<Item title={configureStep.title} id={configureStep.id} idx={configureStep.idx} currentItem={props.currentItem} key={configureStep.idx}></Item>);
    });
    return <>{packageItems}</>;
};
export default ConfigureNavigate;
//# sourceMappingURL=ConfigureNavigate.jsx.map