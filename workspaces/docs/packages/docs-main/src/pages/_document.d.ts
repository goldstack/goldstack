import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document from 'next/document';
declare class MyDocument extends Document {
  static getStaticProps(ctx: DocumentContext): Promise<DocumentInitialProps>;
  render(): React.ReactElement;
}
export default MyDocument;
//# sourceMappingURL=_document.d.ts.map
