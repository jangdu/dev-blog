---
title: "프록시 패턴 (Proxy Pattern)"
summary: "TypeScript에서 프록시 패턴 구현"
date: "April 02 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

프록시 패턴(Proxy Pattern)은 **다른 객체에 대한 접근을 제어하기 위해 대리자나 placeholder를 제공**하는 구조 디자인 패턴이다. 프록시 객체는 실제 객체와 동일한 인터페이스를 구현하며, 실제 객체로의 접근을 제어하거나 추가 기능을 제공한다.

이 패턴은 객체 생성 비용이 크거나, 접근 제어가 필요한 원격 객체에 접근해야 할 때 유용하다. 주로 지연 초기화, 접근 제어, 로깅, 캐싱 등에서 사용된다.

## TypeScript로 프록시 패턴 구현하기

실제 객체에 직접 접근하면 불필요한 리소스 사용이나 보안 문제가 발생할 수 있다.

```typescript
class ExpensiveObject {
  private data: string;

  constructor() {
    console.log("무거운 초기화 작업 수행 중...");
    // 많은 리소스를 사용하는 초기화
    this.data = this.loadLargeData();
  }

  private loadLargeData(): string {
    // 시간이 오래 걸리는 작업
    return "대용량 데이터";
  }

  process(): void {
    console.log(`데이터 처리: ${this.data}`);
  }
}

// 사용하지 않아도 즉시 생성됨
const obj = new ExpensiveObject(); // 무거운 초기화 작업 수행 중...
```

위 코드는 객체가 필요하지 않은 경우에도 생성되어 의미없는 메모리와 처리 시간을 낭비할 수 있다.

보안 측면에서는 접근 권한 검증 없이 누구나 민감한 데이터나 중요한 기능에 접근할 수 있어, 권한이 없는 사용자가 금지된 작업을 수행하거나 내부 정보를 조회할 수 있는 위험이 있다. 또한 직접 접근 시에는 접근 로그를 남기거나 유효성 검사를 수행하기 어려워 보안 이벤트를 추적하고 방어하기가 어렵다.

### 기본 구현 - 가상 프록시

가상 프록시는 실제 객체의 생성을 필요한 시점까지 지연시킨다.

```typescript
class ExpensiveObject {
  private data: string;

  constructor() {
    console.log("ExpensiveObject 초기화");
    this.data = this.loadLargeData();
  }

  private loadLargeData(): string {
    console.log("대용량 데이터 로딩...");
    return "대용량 데이터";
  }

  process(): void {
    console.log(`데이터 처리: ${this.data}`);
  }
}

class ExpensiveObjectProxy {
  private realObject: ExpensiveObject | null = null;

  process(): void {
    // 실제로 사용될 때만 객체 생성
    if (!this.realObject) {
      console.log("프록시: 실제 객체 생성");
      this.realObject = new ExpensiveObject();
    }
    this.realObject.process();
  }
}

// 사용 예제
console.log("프록시 생성");
const proxy = new ExpensiveObjectProxy(); // 실제 객체는 아직 생성되지 않음

console.log("\n첫 번째 호출");
proxy.process(); // 이 시점에 실제 객체 생성

console.log("\n두 번째 호출");
proxy.process(); // 이미 생성된 객체 재사용
```

위 코드에서 `ExpensiveObjectProxy`는 단순히 `realObject` 참조만 저장하는 가벼운 객체다. 프록시 자체는 즉시 생성되지만, 실제 무거운 객체(`ExpensiveObject`)는 `process` 메서드가 처음 호출될 때만 생성된다.

이를 **지연 초기화**(Lazy Initialization)라고 하며, 객체가 실제로 사용되지 않으면 생성 리소스를 사용하지 않아도 된다.

100개의 프록시를 생성하더라도 실제로 사용하는 것이 10개뿐이라면 나머지 90개의 무거운 객체는 생성되지 않아 메모리와 처리 시간을 크게 절약할 수 있다.

또한 한 번 생성된 객체는 프록시 내부에 캐시되어 재사용되므로, 두 번째 호출부터는 추가 생성 비용 없이 바로 사용할 수 있다.

### 보호 프록시

보호 프록시는 객체에 대한 접근 권한을 제어한다.

```typescript
interface User {
  role: string;
  name: string;
}

class BankAccount {
  private balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }

  withdraw(amount: number): boolean {
    if (amount <= this.balance) {
      this.balance -= amount;
      console.log(`${amount}원 출금. 잔액: ${this.balance}원`);
      return true;
    }
    console.log("잔액 부족");
    return false;
  }

  deposit(amount: number): void {
    this.balance += amount;
    console.log(`${amount}원 입금. 잔액: ${this.balance}원`);
  }

  getBalance(): number {
    return this.balance;
  }
}

class BankAccountProxy {
  private account: BankAccount;
  private user: User;

  constructor(balance: number, user: User) {
    this.account = new BankAccount(balance);
    this.user = user;
  }

  withdraw(amount: number): boolean {
    if (!this.checkPermission("withdraw")) {
      console.log("출금 권한이 없습니다.");
      return false;
    }
    return this.account.withdraw(amount);
  }

  deposit(amount: number): void {
    if (!this.checkPermission("deposit")) {
      console.log("입금 권한이 없습니다.");
      return;
    }
    this.account.deposit(amount);
  }

  getBalance(): number | null {
    if (!this.checkPermission("view")) {
      console.log("잔액 조회 권한이 없습니다.");
      return null;
    }
    return this.account.getBalance();
  }

  private checkPermission(action: string): boolean {
    // 실제로는 더 복잡한 권한 체크 로직
    if (this.user.role === "admin") return true;
    if (this.user.role === "owner") return true;
    if (this.user.role === "guest" && action === "view") return true;
    return false;
  }
}

// 사용 예제
const owner: User = { role: "owner", name: "Kim" };
const guest: User = { role: "guest", name: "Lee" };

const ownerAccount = new BankAccountProxy(100000, owner);
ownerAccount.deposit(50000);
ownerAccount.withdraw(30000);

const guestAccount = new BankAccountProxy(100000, guest);
console.log(`잔액: ${guestAccount.getBalance()}원`);
guestAccount.withdraw(10000); // 권한 없음
```

위 코드에서 `BankAccountProxy`는 사용자의 역할(`role`)에 따라 실제 계좌 객체의 메서드 접근을 제어한다.

`checkPermission` 메서드는 각 작업(`withdraw`, `deposit`, `view`)에 대해 사용자의 권한을 검증한다. 예를 들어, `owner`나 `admin` 역할은 모든 작업을 수행할 수 있지만, `guest` 역할은 잔액 조회(`view`)만 가능하고 출금이나 입금은 할 수 없다.

이렇게 보호 프록시를 사용하면 실제 `BankAccount` 객체는 권한 검증 로직을 포함할 필요 없이 비즈니스 로직에만 집중할 수 있다. 권한 정책이 변경되더라도 프록시의 `checkPermission` 메서드만 수정하면 되므로, 실제 객체의 코드는 변경하지 않아도 된다. 또한 모든 접근 시도가 프록시를 거치므로, 보안 로그를 남기거나 접근 패턴을 모니터링하기도 쉬워진다.

### JavaScript Proxy 객체

JavaScript ES6에서 제공하는 `Proxy` 객체를 사용해도 프록시를 만들 수 있다.

이전에 본 클래스 기반 프록시와 달리, Proxy 객체는 별도의 프록시 클래스를 만들 필요 없이 기존 객체를 래핑하기만 하면 된다. `get`, `set`, `has`, `deleteProperty`, `ownKeys` 등 다양한 트랩(trap)을 제공하여 속성 존재 확인, 삭제, 열거 등 거의 모든 객체 작업을 제어할 수 있다.

```typescript
interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

const user: User = {
  name: "John Doe",
  email: "john@example.com",
  password: "secret123",
  role: "admin",
};

const userProxy = new Proxy(user, {
  get(target, property: string) {
    if (property === "password") {
      console.log("경고: 비밀번호 접근 시도");
      return "********";
    }
    console.log(`속성 접근: ${property}`);
    return target[property as keyof User];
  },

  set(target, property: string, value) {
    if (property === "role") {
      console.log("역할 변경 시도 - 관리자 승인 필요");
      return false;
    }
    if (property === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        console.log("잘못된 이메일 형식");
        return false;
      }
    }
    console.log(`속성 설정: ${property} = ${value}`);
    target[property as keyof User] = value;
    return true;
  },
});

// 사용 예제
console.log(userProxy.name); // 속성 접근: name
console.log(userProxy.password); // 경고 출력, ******** 반환

userProxy.email = "newemail@example.com"; // 유효성 검사 통과
userProxy.email = "invalid-email"; // 유효성 검사 실패
userProxy.role = "user"; // 설정 거부
```

위 코드에서 JavaScript의 `Proxy` 객체는 대상 객체(`user`)에 대한 모든 작업을 가로채서(intercept) 처리할 수 있다.

`get` 핸들러는 속성 접근 시 호출되어, 비밀번호 같은 민감한 정보에 접근할 때 마스킹하거나 경고를 남길 수 있다. `set` 핸들러는 속성 설정 시 호출되어, 이메일 형식 검증이나 역할 변경 같은 중요한 작업을 제한할 수 있다.

이를 통해 객체의 동작을 런타임에 동적으로 변경할 수 있어, 유효성 검사, 로깅, 접근 제어, 데이터 변환 등의 기능을 기존 객체를 수정하지 않고도 추가할 수 있다.

## 프록시 패턴의 장점

프록시 패턴을 사용하면 **지연 초기화**를 통해 리소스를 효율적으로 사용할 수 있다. 필요한 경우만 객체를 생성하여 메모리와 처리 시간을 절약한다.

프록시가 권한을 검증하여 허가된 사용자만 접근 할 수 있도록 **접근을 제어**해 보안을 강화할 수 있다.

로깅, 캐싱, 유효성 검사 등 실제 객체를 수정하지 않고도 기능을 추가할 수 있다. 실제 객체의 코드를 변경하지 않고 새로운 기능을 추가할 수 있다.

## 프록시 패턴의 단점

프록시 클래스를 추가로 작성해야 하므로 코드량이 늘어나고 구조가 복잡해 질 수 있다.

프록시를 거치는 추가 레이어로 인해 직접 호출보다는 **응답 시간이 증가**할 수 있다.

간단한 객체에 프록시를 사용하면 불필요한 추상화가 되어 코드 이해가 어려워진다. **과도한 사용**은 오히려 시스템을 복잡하게 만든다.

## 프록시 패턴 사용 시 고려사항

대용량 이미지, 비디오, 데이터베이스 연결 등 **생성에 많은 리소스가 필요한 객체**나 민감한 데이터나 중요한 기능에 대한 **접근 제한이 필요한** 경우에도 효과적인 보안 레이어를 제공해 프록시 패턴이 적합하다.

네트워크를 통해 다른 서버의 객체를 사용할 때처럼 **원격 객체 접근이 필요한 경우** 프록시가 네트워크 통신을 캡슐화할 수 있다.

반면 **간단한 객체인 경우**에는 프록시 패턴이 과도할 수 있다. 생성 비용이 낮고 접근 제어가 필요 없는 객체에 프록시를 사용하면 오히려 복잡도만 증가한다. **성능이 매우 중요한 경우**에도 프록시의 오버헤드를 신중히 고려해야 하며, 프록시를 사용하는 것이 성능상 이득인지 측정이 필요하다.
