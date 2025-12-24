---
title: "싱글톤 패턴 (Singleton Pattern)"
summary: "TypeScript/JavaScript에서 싱글톤 패턴 구현"
date: "Mar 17 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

싱글톤 패턴(Singleton Pattern)은 하나의 클래스에 **하나의 인스턴스만 생성**되도록 보장하고, 해당 인스턴스를 다른 모듈들이 공유해 사용하는 방식이다.

이 디자인 패턴은 인스턴스 생성 비용을 절감할 수 있지만, 모듈 간 의존성이 증가한다는 문제가 있다. 주로 데이터베이스 연결, 로거, 설정 관리 등에서 사용된다.

## JavaScript로 싱글톤 패턴 구현하기

기본적으로 JavaScript에서 객체 리터럴로 생성한 객체들은 각각 독립적인 인스턴스를 가진다.

```javascript
const obj1 = {
  a: 1,
};

const obj2 = {
  a: 1,
};

console.log(obj1 === obj2);
```

위 코드에서 `obj1`과 `obj2`는 동일한 속성과 값을 가지고 있지만, 메모리상 서로 다른 위치에 저장된 별개의 객체다. 따라서 비교 연산자(===)로 비교하면 `false`가 반환된다.

싱글톤 패턴은 이러한 기본 동작과 달리, 클래스의 인스턴스가 여러 번 생성되더라도 항상 동일한 인스턴스를 반환하도록 만드는 패턴이다.

### 기본 구현

```jsx
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }

  getInstance() {
    return this;
  }
}

const instance1 = new Singleton();
const instance2 = new Singleton();

console.log(instance1 === instance2); // true
```

위 코드에서 `Singleton`은 `Singleton.instance`라는 하나의 인스턴스를 가진 클래스입니다.

이렇게 나온 instance1, instance2는 하나의 인스턴스를 가지게됩니다.

### MySQL 데이터베이스 연결 예제

```jsx
const mysql = require("mysql");

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      database: "mydb",
    });

    this.connection.connect((err) => {
      if (err) {
        console.error("데이터베이스 연결 실패:", err);
        return;
      }
      console.log("데이터베이스 연결 성공");
    });

    Database.instance = this;
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

// 사용 예제
const db1 = new Database();
const db2 = new Database();

console.log(db1 === db2); // true - 같은 인스턴스

// 쿼리 실행
db1
  .query("SELECT * FROM users WHERE id = ?", [1])
  .then((results) => console.log(results))
  .catch((err) => console.error(err));
```

위 예제에서 `Database` 클래스는 싱글톤 패턴을 사용하여 MySQL 연결을 관리한다. 여러 곳에서 `new Database()`를 호출하더라도 항상 동일한 데이터베이스 연결 인스턴스를 반환하기 때문에 비용을 아낄 수 있다.

## 싱글톤 패턴의 단점

싱글톤 패턴은 사용하기 쉽고 실용적이지만, 몇 가지 주의해야 할 단점이 있다.

먼저 싱글톤 인스턴스는 모듈 간 강한 결합을 만들어 의존성이 높아진다. 이로 인해 단위 테스트를 작성할 때 각 테스트마다 인스턴스를 초기화하거나 격리하기가 까다로워 독립적인 테스트가 어렵다. 또한 싱글톤이 전역적으로 사용되면 어떤 모듈이 해당 인스턴스에 의존하는지 파악하기 어려워 코드의 가독성과 유지보수성이 떨어진다.

멀티스레드 환경에서는 여러 스레드가 동시에 싱글톤 인스턴스에 접근할 경우 경쟁 조건(race condition)이 발생할 수 있다. JavaScript는 싱글 스레드이지만, Node.js의 비동기 환경이나 웹 워커 사용 시에는 주의가 필요하다.

마지막으로 싱글톤 패턴은 인스턴스가 하나만 존재하도록 강제하기 때문에, 나중에 여러 인스턴스가 필요해질 경우 패턴을 변경하는 것이 어렵다는 확장성의 제약이 있다.

## 의존성 주입을 통한 단점 극복

싱글톤 패턴은 사용하기 쉽고 실용적이지만, 모듈 간 강한 결합으로 인해 실무에서 사용이 제한될 수 있다. 이를 해결하기 위한 방법이 **의존성 주입(Dependency Injection)** 이다.

의존성 주입을 사용하면 각 모듈을 쉽게 교체할 수 있고, Mock 객체를 주입하여 단위 테스트가 용이해진다. 또한 추상화 레이어를 기반으로 의존성의 방향이 일관되어, 구현 시 쉽게 추론할 수 있고 모듈 간 관계가 명확해진다.

다만 모듈이 분리되면서 클래스의 숫자가 늘어나고, 의존성 주입 컨테이너 설정 등 초기 구축 비용이 발생할 수 있다는 점은 고려해야 한다.

> **의존성 역전 원칙 (DIP)**: 상위 모듈은 하위 모듈에서 무엇도 가져오면 안 된다. 모든 모듈은 추상화에 의존해야 하며, 추상화는 세부 사항에 의존해서는 안 된다.
