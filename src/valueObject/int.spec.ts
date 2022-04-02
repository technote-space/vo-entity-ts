import Int from './int';

class TestInt extends Int {
  protected get symbol() {
    return Symbol();
  }
}

describe('Int', () => {
  it('should validate', () => {
    expect(TestInt.create('123').validate('test')).toBeUndefined();
    expect(TestInt.create('abc').validate('test')).toEqual([{ name: 'test', error: '数値の形式が正しくありません' }]);
    expect(TestInt.create('123.45').validate('test')).toEqual([{ name: 'test', error: '整数の形式が正しくありません' }]);
    expect(TestInt.create('10000000000000000').validate('test')).toEqual([{ name: 'test', error: '有効な整数ではありません' }]);
  });
});
