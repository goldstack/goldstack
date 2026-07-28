export interface BreadcrumbElement {
  description: string;
  link?: string;
  active?: boolean;
}
export interface BreadcrumbProps {
  elements: BreadcrumbElement[];
}
declare const Breadcrumb: (props: BreadcrumbProps) => React.ReactNode;
export default Breadcrumb;
//# sourceMappingURL=Breadcrumb.d.ts.map
