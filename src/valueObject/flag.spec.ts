import Flags from './flags';

class TestFlags extends Flags<'test1' | 'test2'> {
  protected get symbol() {
    return Symbol();
  }

  public get flagTypes(): ('test1' | 'test2')[] {
    return ['test1', 'test2'];
  }
}

describe('Flags', () => {
  it('should create flags', () => {
    expect(TestFlags.create('test1').value).toBe('test1');
  });

  it('should compare flags', () => {
    const flag1 = TestFlags.create('test1');
    const flag2 = TestFlags.create('test2');
    const flag3 = TestFlags.create('test2');
    expect(flag1.compare(flag2)).toBe(-1);
    expect(flag2.compare(flag1)).toBe(1);
    expect(flag2.compare(flag3)).toBe(0);
    expect(flag1.equals(flag2)).toBe(false);
    expect(flag2.equals(flag3)).toBe(true);
  });

  it('should get errors', () => {
    expect(TestFlags.create('test1').getErrors('test')).toBeUndefined();
  });

  it('should throw error if not included flag', () => {
    expect(TestFlags.create('test3').getErrors('test')).toEqual([{ name: 'test', error: '定義されていないフラグです: test3' }]);
  });
});
