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
- `StringId`: 文字列IDを表現する Value Object
- `Text`: テキストを表現する Value Object
- `Url`: URLを表現する Value Object
- `Email`: メールアドレスを表現する Value Object

### 使用例

```typescript
import { Text, Email } from 'vo-entity-ts';

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

#### Flags の使用例

```typescript
import { Flags } from 'vo-entity-ts';

// 通常のフラグ
class UserRole extends Flags<'admin' | 'user' | 'guest'> {
  protected get symbol() {
    return Symbol();
  }

  public get flagTypes(): ('admin' | 'user' | 'guest')[] {
    return ['admin', 'user', 'guest'];
  }
}

// null を許容するフラグ
class UserStatus extends Flags<'active' | 'inactive', true> {
  protected get symbol() {
    return Symbol();
  }

  public get flagTypes(): ('active' | 'inactive')[] {
    return ['active', 'inactive'];
  }
}

// 使用例
const role = new UserRole('admin');
const status = new UserStatus('active');
const inactiveStatus = new UserStatus('inactive');
const nullStatus = new UserStatus(null);

// 比較
role.equals(new UserRole('admin')); // true
role.equals(new UserRole('user')); // false
status.equals(inactiveStatus); // false
nullStatus.equals(new UserStatus(null)); // true

// バリデーション
role.getErrors('role'); // undefined
new UserRole('invalid' as never).getErrors('role'); // [{ name: 'role', error: '定義されていないフラグです: invalid' }]
```

## Entity

Entity は識別子を持ち、ライフサイクルを通じて同一性を維持するオブジェクトを表現するための基本クラスです。

### 使用例

```typescript
import { Entity, Text } from 'vo-entity-ts';

class User extends Entity {
  /**
   * @deprecated create または reconstruct 経由で生成してください
   */
  public constructor(
    public readonly name: UserName,
    public readonly email: UserEmail,
    public readonly status?: UserStatus,
  ) {
    super();
  }

  public static create(name: UserName, email: UserEmail): User {
    return User._create(name, email);
  }

  public static reconstruct(
    name: UserName,
    email: UserEmail,
    status?: UserStatus,
  ): User {
    return User._reconstruct(name, email, status);
  }

  public update({ status }: { status?: UserStatus }): User {
    return User._update(this, this.name, this.email, status);
  }

  public equals(other: User): boolean {
    return this.email.equals(other.email);
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

Entity のコレクションを扱うための `Collection` クラスが提供されています。

```typescript
import { Collection } from 'vo-entity-ts';

class UserList extends Collection<User> {
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
