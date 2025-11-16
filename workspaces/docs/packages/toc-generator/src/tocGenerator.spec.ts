import cheerio from 'cheerio';
import aboutDoc from './data/about.json';
import howDoesItWorkDoc from './data/how-does-it-work.json';
import moduleDoc from './data/module-nextjs.json';
import { generateToc } from './tocGenerator';

describe('TOC Generator', () => {
  it('Should render multi-level TOC', () => {
    const $ = cheerio.load(moduleDoc.html);

    const res = generateToc($);
    expect(res).toHaveLength(5);
    expect(res[0].title).toEqual('Configure');
    expect(res[1].id).toEqual('getting-started');
    const subheadings = res[2].subheadings;
    expect(subheadings).toHaveLength(3);
    expect(subheadings[2].title).toEqual('Terraform State');
  });
  it('Should render multi-level TOC with one main heading', () => {
    const $ = cheerio.load(aboutDoc.html);

    const res = generateToc($);
    expect(res).toHaveLength(1);
    const subheadings = res[0].subheadings;
    expect(subheadings).toHaveLength(5);
    expect(subheadings[0].title).toEqual('Only the best tech');
    expect(subheadings[2].id).toEqual('serverless');
  });
  it('Should detect highest level heading automatically', () => {
    const $ = cheerio.load(howDoesItWorkDoc.html);
    const res = generateToc($);
    expect(res).toHaveLength(5);
  });
});
