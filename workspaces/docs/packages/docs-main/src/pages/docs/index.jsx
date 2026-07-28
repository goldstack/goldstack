import Docs from './../../components/Docs';
import docsHome from './../../data/docs/index.json';
const DocsHome = () => {
    return <Docs title={docsHome.data.title} contentHtml={docsHome.html} toc={[]}></Docs>;
};
export default DocsHome;
//# sourceMappingURL=index.jsx.map