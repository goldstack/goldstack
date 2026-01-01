import { Fragment } from 'react';

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: gtag is a third-party function with variable arguments
    gtag?: (...args: any[]) => void;
  }
}

export let GA_TRACKING_ID: undefined | string = undefined;

export const initGtm = (ga_tracking_id: string): void => {
  GA_TRACKING_ID = ga_tracking_id;
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (params: { url: string; path: string }): void => {
  if (!window.gtag) {
    return;
  }
  if (!GA_TRACKING_ID) {
    throw new Error('Please define tracking id with initGtm()');
  }
  window.gtag('config', GA_TRACKING_ID, {
    page_path: params.path,
    page_location: params.url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: number;
}): void => {
  if (!window.gtag) {
    return;
  }
  if (!GA_TRACKING_ID) {
    throw new Error('Please define tracking id with initGtm()');
  }
  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (e) {
    console.error(`Cannot log Google Analytics event: ${action} ${category} ${label} ${value}`);
    console.error(e);
  }
};

export const TagFragment = (): JSX.Element => {
  if (!GA_TRACKING_ID) {
    throw new Error('Please define tracking id with initGtm()');
  }
  return (
    <Fragment>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: standard Google Analytics script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${GA_TRACKING_ID}', {
  page_path: window.location.pathname,
});`,
        }}
      />
    </Fragment>
  );
};
