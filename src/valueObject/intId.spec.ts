import IntId from './intId';

class TestIntId extends IntId {
  protected get symbol() {
    return Symbol();
  }
}

describe('IntId', () => {
  it('should create intId', () => {
    expect(TestIntId.create(123).value).toBe(123);
    expect(TestIntId.create(123.1).value).toBe(123);
    expect(TestIntId.create('123').value).toBe(123);
  });

  it('should compare intId', () => {
    const intId1 = TestIntId.create(123);
    const intId2 = TestIntId.create(456);
    const intId3 = TestIntId.create('456');
    expect(intId1.compare(intId2)).toBe(-1);
    expect(intId2.compare(intId1)).toBe(1);
    expect(intId2.compare(intId3)).toBe(0);
    expect(intId1.equals(intId2)).toBe(false);
    expect(intId2.equals(intId3)).toBe(true);
  });

  it('should get errors', () => {
    expect(TestIntId.create('123').getErrors('test')).toBeUndefined();
    expect(TestIntId.create(null).getErrors('test')).toBeUndefined();
    expect(TestIntId.create('').getErrors('test')).toEqual([{ name: 'test', error: '整数の形式が正しくありません' }]);
    expect(TestIntId.create('10000000000000000').getErrors('test')).toEqual([{ name: 'test', error: '有効な整数ではありません' }]);
  });

  it('should throw error if id is not set', () => {
    const id = TestIntId.create(null);
    expect(() => id.value).toThrow('無効な値です');
  });
});
