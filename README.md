# Vo Entity Ts

[![npm version](https://badge.fury.io/js/%40technote-space%2Fvo-entity-ts.svg)](https://badge.fury.io/js/%40technote-space%2Fvo-entity-ts)
[![CI Status](https://github.com/technote-space/vo-entity-ts/workflows/CI/badge.svg)](https://github.com/technote-space/vo-entity-ts/actions)
[![codecov](https://codecov.io/gh/technote-space/vo-entity-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/vo-entity-ts)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/vo-entity-ts/badge)](https://www.codefactor.io/repository/github/technote-space/vo-entity-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/vo-entity-ts/blob/master/LICENSE)

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Setup](#setup)
  - [yarn](#yarn)
  - [npm](#npm)
- [Author](#author)
- [特徴](#%E7%89%B9%E5%BE%B4)
- [Value Object](#value-object)
  - [使用例](#%E4%BD%BF%E7%94%A8%E4%BE%8B)
  - [その他の使用例](#%E3%81%9D%E3%81%AE%E4%BB%96%E3%81%AE%E4%BD%BF%E7%94%A8%E4%BE%8B)
- [Entity](#entity)
  - [使用例](#%E4%BD%BF%E7%94%A8%E4%BE%8B-1)
- [コレクション](#%E3%82%B3%E3%83%AC%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3)
- [ライセンス](#%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9)
- [開発](#%E9%96%8B%E7%99%BA)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup
### yarn
- `yarn add @technote-space/vo-entity-ts`
### npm
- `npm i @technote-space/vo-entity-ts`

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)

## 特徴

- Value Object と Entity の基本クラスを提供
- 型安全な実装
- バリデーション機能
- イミュータブルな値の取り扱い
- コレクションのサポート

## Value Object

Value Object は不変な値オブジェクトを表現するための基本クラスです。以下のような Value Object が提供されています：

- `DateObject`: 日付を表現する Value Object
- `Flags`: フラグを表現する Value Object
- `Float`: 浮動小数点数を表現する Value Object
- `Int`: 整数を表現する Value Object
- `ObjectValue`: オブジェクトを表現する Value Object
- `Phone`: 電話番号を表現する Value Object
- `StringId`: 文字列IDを表現する Value Object
- `Text`: テキストを表現する Value Object
- `Url`: URLを表現する Value Object
- `Email`: メールアドレスを表現する Value Object

### 使用例

```typescript
import { Text, Email, ObjectValue } from 'vo-entity-ts';

class UserName extends Text {
  protected get symbol() {
    return Symbol();
  }

  protected override getValidationMinLength(): number | undefined {
    return 3;
  }
}

class UserEmail extends Email {
  protected get symbol() {
    return Symbol();
  }
}

// 使用例
const name1 = new UserName('John');
const name2 = new UserName('Jane');
const shortName = new UserName('Jo');

// 比較
name1.equals(name2); // false
name1.equals(new UserName('John')); // true

// 値の取得
name1.value; // 'John'

// バリデーション
name1.getErrors('name'); // undefined
shortName.getErrors('name'); // [{ name: 'name', error: '3文字より長く入力してください' }]

// イミュータブルな値
const name = name1.value;
name = 'New Name'; // エラー: Cannot assign to 'name' because it is a read-only property
```

### その他の使用例

各 Value Object のより詳細な使用例や実装パターンについては、以下のテストファイルを参照してください：

- **基本的な使用方法**: [`src/valueObject/index.spec.ts`](src/valueObject/index.spec.ts)
- **Text**: [`src/valueObject/text.spec.ts`](src/valueObject/text.spec.ts)
- **Email**: [`src/valueObject/email.test.ts`](src/valueObject/email.test.ts)
- **Url**: [`src/valueObject/url.test.ts`](src/valueObject/url.test.ts)
- **Int**: [`src/valueObject/int.spec.ts`](src/valueObject/int.spec.ts)
- **Float**: [`src/valueObject/float.spec.ts`](src/valueObject/float.spec.ts)
- **DateObject**: [`src/valueObject/date.spec.ts`](src/valueObject/date.spec.ts)
- **Flags**: [`src/valueObject/flags.spec.ts`](src/valueObject/flags.spec.ts)
- **StringId**: [`src/valueObject/stringId.spec.ts`](src/valueObject/stringId.spec.ts)
- **ObjectValue**: [`src/valueObject/object.spec.ts`](src/valueObject/object.spec.ts)
- **Phone**: [`src/valueObject/phone.spec.ts`](src/valueObject/phone.spec.ts)
- **Collection**: [`src/valueObject/collection.spec.ts`](src/valueObject/collection.spec.ts)
- **Entity**: [`src/entity/index.spec.ts`](src/entity/index.spec.ts)

これらのテストファイルには、実際の使用例、エラーハンドリング、エッジケースの処理方法などが含まれています。

## Entity

Entity は識別子を持ち、ライフサイクルを通じて同一性を維持するオブジェクトを表現するための基本クラスです。

Entity を実装する際は、`_create`、`_reconstruct`、`_update` メソッドに対して、実装する Entity の型（例：`User`）をジェネリクスの型パラメータとして渡すことが重要です：
```typescript
// 正しい使用法
public static create(...): User {
  return User._create<User>({ ... });
}

public static reconstruct(...): User {
  return User._reconstruct<User>({ ... });
}

public update(...): User {
  return User._update<User>(this, { ... });
}
```

### 使用例

```typescript
import { Entity, Text } from 'vo-entity-ts';

class User extends Entity {
  protected constructor(props: {
    name: UserName;
    email: UserEmail;
    status?: UserStatus;
  }) {
    super(props);
  }

  public static create(name: UserName, email: UserEmail): User {
    return User._create<User>({ name, email });
  }

  public static reconstruct(
    name: UserName,
    email: UserEmail,
    status?: UserStatus,
  ): User {
    return User._reconstruct<User>({ name, email, status });
  }

  public update({ status }: { status?: UserStatus }): User {
    return User._update<User>(this, { status });
  }

  public equals(other: User): boolean {
    return this.get('email').equals(other.get('email'));
  }
}

// 使用例
// 新規作成
const name = new UserName('John Doe');
const email = new UserEmail('john@example.com');
const user = User.create(name, email);

// 再構築（バリデーションをスキップ）
const status = new UserStatus('active');
const reconstructedUser = User.reconstruct(name, email, status);

// 更新
const newStatus = new UserStatus('inactive');
const updatedUser = user.update({ status: newStatus });

// プロパティの取得
user.get('name').value; // 'John Doe'
user.get('email').value; // 'john@example.com'
user.get('status')?.value; // undefined

// 比較
user.equals(updatedUser); // true（email が同じため）
user.equals(User.create(new UserName('Jane Doe'), new UserEmail('jane@example.com'))); // false

// バリデーションエラー
try {
  User.create(
    new UserName('Jo'),
    new UserEmail('invalid-email')
  );
} catch (error) {
  if (error instanceof ValidationException) {
    console.log(error.errors);
    // {
    //   name: ['3文字より長く入力してください'],
    //   email: ['有効なメールアドレスを指定してください']
    // }
  }
}
```

## コレクション

ValueObject のコレクションを扱うための `Collection` クラスが提供されています。

```typescript
import { Collection } from 'vo-entity-ts';

class UserEmails extends Collection<UserEmail> {
  // カスタムのコレクション実装
}
```

## ライセンス

MIT

## 開発

```bash
# 依存関係のインストール
npm install

# テストの実行
npm test

# ビルド
npm run build
```
