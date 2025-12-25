---
title: "전략 패턴 (Strategy Pattern)"
summary: "TypeScript/JavaScript에서 전략 패턴 구현"
date: "Mar 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

전략 패턴(Strategy Pattern)은 **동일한 문제를 해결하는 여러 알고리즘을 캡슐화**하고, 런타임에 적절한 알고리즘을 선택하여 사용할 수 있도록 하는 행동 디자인 패턴이다.

이 패턴은 알고리즘을 사용하는 코드와 독립적으로 알고리즘을 변경할 수 있게 해준다. 주로 정렬 알고리즘, 결제 방식, 압축 방식, 할인 정책 등에서 사용된다.

Node.js 개발자들에게 익숙한 예시로는 **Passport.js**가 있다. passport는 다양한 인증 전략(Google, Facebook, Local 등)을 선택적으로 사용할 수 있게 해주는 인증 미들웨어로, 전략 패턴을 활용하여 구현되었다. 각 인증 방식이 독립적인 전략으로 구현되어 있어, 필요에 따라 적절한 인증 방법을 선택하여 사용할 수 있다.

## JavaScript로 전략 패턴 구현하기

일반적으로 조건문을 사용하여 여러 알고리즘을 처리하면 코드가 복잡해지고 유지보수가 어려워진다.

```javascript
class PaymentProcessor {
  processPayment(amount, method) {
    if (method === "credit-card") {
      console.log(`신용카드로 ${amount}원 결제합니다.`);
      // 신용카드 결제 로직
    } else if (method === "paypal") {
      console.log(`PayPal로 ${amount}원 결제합니다.`);
      // PayPal 결제 로직
    } else if (method === "crypto") {
      console.log(`암호화폐로 ${amount}원 결제합니다.`);
      // 암호화폐 결제 로직
    }
  }
}

const processor = new PaymentProcessor();
processor.processPayment(10000, "credit-card");
```

위 코드는 새로운 결제 방식을 추가할 때마다 `processPayment` 메서드를 수정해야 하므로 **개방-폐쇄** 원칙을 위반한다.

### 기본 구현

전략 패턴은 각 알고리즘을 별도의 클래스로 캡슐화하여 이 문제를 해결한다.

```typescript
interface PaymentStrategy {
  pay(amount: number): PaymentResult;
}

interface PaymentResult {
  method: string;
  amount: number;
  timestamp?: Date;
}

class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number): PaymentResult {
    console.log(`신용카드로 ${amount}원 결제합니다.`);
    return {
      method: "credit-card",
      amount,
      timestamp: new Date(),
    };
  }
}

class PayPalStrategy implements PaymentStrategy {
  pay(amount: number): PaymentResult {
    console.log(`PayPal로 ${amount}원 결제합니다.`);
    return {
      method: "paypal",
      amount,
      timestamp: new Date(),
    };
  }
}

class CryptoStrategy implements PaymentStrategy {
  pay(amount: number): PaymentResult {
    console.log(`암호화폐로 ${amount}원 결제합니다.`);
    return {
      method: "crypto",
      amount,
      timestamp: new Date(),
    };
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: number): PaymentResult {
    return this.strategy.pay(amount);
  }
}

// 사용 예제
const processor = new PaymentProcessor(new CreditCardStrategy());
processor.processPayment(10000);

// 전략 변경
processor.setStrategy(new PayPalStrategy());
processor.processPayment(20000);

processor.setStrategy(new CryptoStrategy());
processor.processPayment(30000);
```

위 코드에서 `PaymentProcessor`는 구체적인 결제 방식을 알 필요 없이 전략 객체의 `pay` 메서드만 호출한다. 새로운 결제 방식을 추가할 때는 새로운 전략 클래스만 만들면 되므로 기존 코드를 수정하지 않아도 된다.

### 함수형 접근 방식

JavaScript/TypeScript의 함수 특성을 활용하면 클래스 없이도 전략 패턴을 구현할 수 있다.

```typescript
type ValidationStrategy = (value: string) => boolean;

const isEmail: ValidationStrategy = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isPhoneNumber: ValidationStrategy = (value: string) => {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(value);
};

const isNotEmpty: ValidationStrategy = (value: string) => {
  return value.trim().length > 0;
};

class Validator {
  constructor(private strategy: ValidationStrategy) {}

  setStrategy(strategy: ValidationStrategy): void {
    this.strategy = strategy;
  }

  validate(value: string): boolean {
    return this.strategy(value);
  }
}

// 사용 예제
const validator = new Validator(isEmail);
console.log(validator.validate("test@example.com")); // true
console.log(validator.validate("invalid-email")); // false

validator.setStrategy(isPhoneNumber);
console.log(validator.validate("010-1234-5678")); // true
console.log(validator.validate("123-456")); // false
```

함수형 접근 방식은 간단한 방법(전략)에 적합하며, 클래스를 정의하는 오버헤드 없이 새로운 방법을 쉽게 추가하고 조합할 수 있다. 각 방법을 순수 함수로 정의하면 테스트와 재사용이 더욱 쉬워진다.

## 전략 패턴의 장점

전략 패턴을 사용하면 각 알고리즘이 독립적인 클래스로 분리되어 있어 다른 알고리즘에 영향을 주지 않고 수정할 수 있는 **알고리즘의 독립성**이 보장된다. 새로운 알고리즘을 추가할 때 기존 코드를 수정하지 않고 새로운 전략 클래스만 추가하면 되므로, `개방-폐쇄 원칙(OCP)`에 위배되지 않는다.

또한 프로그램 실행 중에 상황에 따라 다른 알고리즘을 선택할 수 있어 유연성이 높아진다.

복잡한 if-else나 switch 문을 전략 객체로 대체하여 코드 가독성이 향상된다.

## 전략 패턴의 단점

전략 패턴을 사용할 때는 각 알고리즘마다 별도의 클래스를 만들어야 하므로 전략이 많아질수록 관리해야 할 클래스가 늘어난다.

전략을 사용하는 쪽에서 어떤 전략을 선택할지 결정해야 하므로 각 전략의 차이를 알고 있어야 한다.

전략 객체를 생성하고 관리하는 데 추가적인 메모리와 처리 시간이 필요할 수 있다.

## 전략 패턴 사용 시 고려사항

전략 패턴은 **동일한 작업을 수행하는 여러 방법이 있는 경우**에 유용하다. 정렬, 압축, 암호화처럼 **다른 방식으로 같은 목적을 달성하는 알고리즘**이 있을 때 적합하다. 사용자 설정이나 시스템 상태에 따라 다른 알고리즘을 사용해야 할 때 전략 패턴은 유연성을 제공한다.

**복잡한 조건문을 제거하고 싶은 경우** 알고리즘 선택 로직이 복잡한 if-else나 switch 문으로 구현되어 있다면 전략 패턴으로 리팩토링하면 코드가 깔끔해진다.

반면 **알고리즘이 하나뿐이거나 거의 변경되지 않는 경우**에는 간단한 조건문으로 충분히 처리 가능해서 전략 패턴을 사용하면 오히려 복잡해지게 될 수 있다.
