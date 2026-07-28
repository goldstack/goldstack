import Document, { type DocumentContext } from 'next/document';
declare class MyDocument extends Document {
  static getStaticProps(ctx: DocumentContext): Promise<any>;
  render(): React.ReactElement;
}
export default MyDocument;
//# sourceMappingURL=_document.d.ts.map
