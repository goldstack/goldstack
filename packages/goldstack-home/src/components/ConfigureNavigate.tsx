import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConfigureStep } from 'src/lib/getConfigureSteps';

const SelectedItem = (props: { title: string }): JSX.Element => {
  return (
    <div className="media align-items-center mb-3">
      <span className="d-block font-size-1 mr-3">
        <b>{props.title}</b>
      </span>
    </div>
  );
};

const LinkItem = (props: {
  title: string;
  id: string;
  idx: number;
}): JSX.Element => {
  const router = useRouter();
  const { id, packageId } = router.query;
  return (
    <div className="media align-items-center mb-3">
      <span className="d-block font-size-1 mr-3">
        <Link
          href="/projects/[id]/packages/[packageId]/configure/[step]"
          as={`/projects/${id}/packages/${packageId}/configure/${
            props.idx + 1
          }`}
          prefetch={false}
          shallow={true}
        >
          <a>{props.title}</a>
        </Link>
      </span>
    </div>
  );
};

const Item = (props: {
  title: string;
  id: string;
  idx: number;
  currentItem: number;
}): JSX.Element => {
  if (props.idx === props.currentItem - 1) {
    return <SelectedItem title={props.title}></SelectedItem>;
  }
  return (
    <LinkItem title={props.title} id={props.id} idx={props.idx}></LinkItem>
  );
};

const ConfigureNavigate = (props: {
  currentItem: number;
  configureSteps: ConfigureStep[];
}): JSX.Element => {
  const packageItems = props.configureSteps.map((configureStep) => {
    return (
      <Item
        title={configureStep.title}
        id={configureStep.id}
        idx={configureStep.idx}
        currentItem={props.currentItem}
        key={configureStep.idx}
      ></Item>
    );
  });

  return <>{packageItems}</>;
};

export default ConfigureNavigate;
