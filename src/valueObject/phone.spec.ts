import type { MobilePhoneLocale } from 'validator';
import { describe, expect, it } from 'vitest';
import { Phone } from './phone.js';

class TestPhone extends Phone {
  protected override get symbol(): symbol {
    return Symbol();
  }
}

class JapanesePhone extends Phone {
  protected override get symbol(): symbol {
    return Symbol();
  }

  protected override getLocale(): MobilePhoneLocale {
    return 'ja-JP';
  }

  protected override getStrictMode(): boolean {
    return true;
  }
}

class NullablePhone extends Phone<true> {
  protected override get symbol(): symbol {
    return Symbol();
  }
}

describe('Phone', () => {
  it('should create valid phone number', () => {
    const phone = new TestPhone('+1234567890');
    expect(typeof phone.value).toBe('string');
  });

  it('should normalize phone number format', () => {
    const phone = new TestPhone('+1 (234) 567-890');
    expect(phone.value).toBe('+1234567890');
  });

  it('should validate empty phone number', () => {
    const phone = new TestPhone('');
    const errors = phone.getErrors('phone');

    expect(errors).toHaveLength(1);
    expect(errors?.[0]?.error).toBe('電話番号を指定してください');
  });

  it('should validate invalid phone number format', () => {
    const phone = new TestPhone('invalid-phone');
    const errors = phone.getErrors('phone');

    expect(errors).toHaveLength(1);
    expect(errors?.[0]?.error).toBe('有効な電話番号を入力してください');
  });

  it('should accept valid international phone number', () => {
    const phone = new TestPhone('+819034567890');
    expect(phone.getErrors('phone')).toBeUndefined();
  });

  it('should validate Japanese phone numbers with locale', () => {
    const validJapanesePhone = new JapanesePhone('+819034567890');
    const invalidJapanesePhone = new JapanesePhone('+1234567890');

    expect(validJapanesePhone.getErrors('phone')).toBeUndefined();
    expect(invalidJapanesePhone.getErrors('phone')).toHaveLength(1);
  });

  it('should handle null values when nullable', () => {
    const phone = new NullablePhone(null);
    expect(phone.value).toBeNull();
    expect(phone.getErrors('phone')).toBeUndefined();
  });

  it('should compare phone numbers correctly', () => {
    const phone1 = new TestPhone('+1234567890');
    const phone2 = new TestPhone('+1234567890');
    const phone3 = new TestPhone('+0987654321');

    expect(phone1.equals(phone2)).toBe(true);
    expect(phone1.equals(phone3)).toBe(false);
    expect(phone1.compare(phone2)).toBe(0);
    expect(phone1.compare(phone3)).not.toBe(0);
  });

  it('should handle comparison with null values', () => {
    const phone1 = new NullablePhone(null);
    const phone2 = new NullablePhone(null);
    const phone3 = new NullablePhone('+1234567890');

    expect(phone1.equals(phone2)).toBe(true);
    expect(phone1.equals(phone3)).toBe(false);
    expect(phone3.equals(phone1)).toBe(false);
  });

  it('should normalize various phone number formats', () => {
    const formats = [
      '+1 (234) 567-890',
      '+1-234-567-890',
      '+1 234 567 890',
      '+1(234)567890',
    ];

    // biome-ignore lint/complexity/noForEach:
    formats.forEach((format) => {
      const phone = new TestPhone(format);
      expect(phone.value).toBe('+1234567890');
    });
  });
});
