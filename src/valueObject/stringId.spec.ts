import StringId from './stringId';

class TestStringId extends StringId {
  protected get symbol() {
    return Symbol();
  }
}

describe('StringId', () => {
  it('should create stringId', () => {
    expect(TestStringId.create('test').value).toBe('test');
    expect(TestStringId.create('123').value).toBe('123');
    expect(TestStringId.create('123').isSet()).toBe(true);
  });

  it('should compare stringId', () => {
    const stringId1 = TestStringId.create('abc');
    const stringId2 = TestStringId.create('def');
    const stringId3 = TestStringId.create('def');
    expect(stringId1.compare(stringId2)).toBe(-1);
    expect(stringId2.compare(stringId1)).toBe(1);
    expect(stringId2.compare(stringId3)).toBe(0);
    expect(stringId1.equals(stringId2)).toBe(false);
    expect(stringId2.equals(stringId3)).toBe(true);
  });

  it('should get errors', () => {
    expect(TestStringId.create('123').getErrors('test')).toBeUndefined();
    expect(TestStringId.create(null).getErrors('test')).toBeUndefined();
    expect(TestStringId.create('').getErrors('test')).toEqual([{ name: 'test', error: '値を指定してください' }]);
  });

  it('should throw error if id is not set', () => {
    const id = TestStringId.create(null);
    expect(id.isSet()).toBe(false);
    expect(() => id.value).toThrow('無効な値です');
  });
});
