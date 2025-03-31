import { describe, expect, it } from 'vitest';
import { Email } from './email.js';

class TestEmail extends Email {
  protected get symbol() {
    return Symbol();
  }
}

class TestNullableEmail extends Email<true> {
  protected get symbol() {
    return Symbol();
  }
}

describe('Email', () => {
  it('should create email', () => {
    expect(new TestEmail('test@example.com').value).toBe('test@example.com');
  });

  it('should compare email', () => {
    const email1 = new TestEmail('abc@example.com');
    const email2 = new TestEmail('def@example.com');
    const email3 = new TestEmail('def@example.com');
    expect(email1.compare(email2)).toBe(-1);
    expect(email2.compare(email1)).toBe(1);
    expect(email2.compare(email3)).toBe(0);
    expect(email1.equals(email2)).toBe(false);
    expect(email2.equals(email3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestEmail('test@example.com').getErrors('test')).toBeUndefined();
    expect(new TestEmail('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
    expect(new TestEmail('abc').getErrors('test')).toEqual([
      { name: 'test', error: 'メールアドレスの形式が正しくありません' },
    ]);
  });
});

describe('Email(nullable)', () => {
  it('should create email', () => {
    expect(new TestNullableEmail('test@example.com').value).toBe(
      'test@example.com',
    );
    expect(new TestNullableEmail(null).value).toBeNull();
  });

  it('should compare email', () => {
    const email1 = new TestNullableEmail('abc@example.com');
    const email2 = new TestNullableEmail('def@example.com');
    const email3 = new TestNullableEmail('def@example.com');
    const email4 = new TestNullableEmail(null);
    const email5 = new TestNullableEmail(null);
    expect(email1.compare(email2)).toBe(-1);
    expect(email2.compare(email1)).toBe(1);
    expect(email2.compare(email3)).toBe(0);
    expect(email3.compare(email4)).toBe(-1);
    expect(email4.compare(email3)).toBe(1);
    expect(email4.compare(email5)).toBe(0);
    expect(email1.equals(email2)).toBe(false);
    expect(email2.equals(email3)).toBe(true);
    expect(email3.equals(email4)).toBe(false);
    expect(email4.equals(email5)).toBe(true);
  });

  it('should get errors', () => {
    expect(
      new TestNullableEmail('test@example.com').getErrors('test'),
    ).toBeUndefined();
    expect(new TestNullableEmail(null).getErrors('test')).toBeUndefined();
    expect(new TestNullableEmail('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
    expect(new TestNullableEmail('abc').getErrors('test')).toEqual([
      { name: 'test', error: 'メールアドレスの形式が正しくありません' },
    ]);
  });
});
