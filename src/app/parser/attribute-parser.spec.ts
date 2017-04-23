import { AttributeParser, AttributeTokenizer, ParsingError } from './attribute-parser';

describe('AttributeParser', () => {
  let p;

  beforeEach(() => {
    p = new AttributeParser();
  });

  it('Should parse test', () => {
    var r = p.parse('test');
    expect(r.type).toBe('test');
  });

  it('Should parse test:col', () => {
    //var test = 'test:col"test\\""';
    //console.log(test);
    //console.log(new AttributeTokenizer(new ParsingError(test)).tokenize(test));
    var r = p.parse('test:col');
    expect(r.name).toBe('test');
    expect(r.type).toBe('col');
  });


  it('Should parse col:()', () => {
    var r = p.parse('col:()');
    expect(r.type).toBe(null);
    expect(r.name).toBe('col');
  });

  it('Should error col(', () => {
    expect(() => p.parse('col(')).toThrow();
  });

  it('Should parse 3test: 3col(123)', () => {
    var r = p.parse('3test: 3col(123)');
    expect(r.name).toBe('3test');
    expect(r.type).toBe('3col');
    expect(r.args).toEqual([123]);
  });

  it('Should parse test: col(test: null, xyz: -10e3, ab: "x", 123)', () => {
    var r = p.parse('test: col(test: null, xyz: -10e3, ab: "x", 123)');
    expect(r).toEqual({
      name: 'test',
      type: 'col',
      args: [123],
      test: null,
      xyz: -10e3,
      ab: "x"
    });
  });




  /*it('Should parse test:col("xyz")', () => {
    var v = 'test:col("xyz", true, null, test: true)';
    expect(p.parse(v)).toBe({
      name: 'test',
      type: 'col',
      args: ['xyz', true, null],
      test: true
    });
  });*/
});
