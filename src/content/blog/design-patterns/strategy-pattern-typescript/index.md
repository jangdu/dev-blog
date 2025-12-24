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

위 코드는 새로운 결제 방식을 추가할 때마다 `processPayment` 메서드를 수정해야 하므로 개방-폐쇄 원칙을 위반한다.

### 기본 구현

전략 패턴은 각 알고리즘을 별도의 클래스로 캡슐화하여 이 문제를 해결한다.

```javascript
// 전략 인터페이스 역할을 하는 클래스들
class CreditCardStrategy {
  pay(amount) {
    console.log(`신용카드로 ${amount}원 결제합니다.`);
    return { method: "credit-card", amount };
  }
}

class PayPalStrategy {
  pay(amount) {
    console.log(`PayPal로 ${amount}원 결제합니다.`);
    return { method: "paypal", amount };
  }
}

class CryptoStrategy {
  pay(amount) {
    console.log(`암호화폐로 ${amount}원 결제합니다.`);
    return { method: "crypto", amount };
  }
}

// 컨텍스트 클래스
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  processPayment(amount) {
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

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 전략 인터페이스를 명시적으로 정의하여 모든 전략이 동일한 구조를 갖도록 강제할 수 있다.

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
const result = processor.processPayment(10000);
console.log(result);
```

`PaymentStrategy` 인터페이스를 통해 모든 전략 클래스가 `pay` 메서드를 구현하도록 강제하며, 반환 타입도 명확하게 정의된다. 이를 통해 컴파일 타임에 타입 오류를 발견할 수 있다.

### 실제 사용 예제: 정렬 전략

```typescript
interface SortStrategy<T> {
  sort(data: T[]): T[];
}

class BubbleSortStrategy implements SortStrategy<number> {
  sort(data: number[]): number[] {
    const arr = [...data];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }

    return arr;
  }
}

class QuickSortStrategy implements SortStrategy<number> {
  sort(data: number[]): number[] {
    if (data.length <= 1) return data;

    const pivot = data[Math.floor(data.length / 2)];
    const left = data.filter((x) => x < pivot);
    const middle = data.filter((x) => x === pivot);
    const right = data.filter((x) => x > pivot);

    return [...this.sort(left), ...middle, ...this.sort(right)];
  }
}

class MergeSortStrategy implements SortStrategy<number> {
  sort(data: number[]): number[] {
    if (data.length <= 1) return data;

    const mid = Math.floor(data.length / 2);
    const left = this.sort(data.slice(0, mid));
    const right = this.sort(data.slice(mid));

    return this.merge(left, right);
  }

  private merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] < right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    console.log(`정렬 시작: ${data.length}개 항목`);
    const startTime = performance.now();
    const result = this.strategy.sort(data);
    const endTime = performance.now();
    console.log(`정렬 완료: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }
}

// 사용 예제
const data = [64, 34, 25, 12, 22, 11, 90];

const sorter = new Sorter(new BubbleSortStrategy());
console.log(sorter.sort(data));

// 큰 데이터셋에는 퀵소트 사용
const largeData = Array.from({ length: 1000 }, () =>
  Math.floor(Math.random() * 1000)
);
sorter.setStrategy(new QuickSortStrategy());
console.log(sorter.sort(largeData));
```

위 예제는 데이터 크기나 성능 요구사항에 따라 다른 정렬 알고리즘을 선택할 수 있음을 보여준다. `Sorter` 클래스는 정렬 알고리즘의 세부 구현을 알 필요 없이 전략 객체에게 작업을 위임한다. 각 정렬 전략은 독립적으로 테스트하고 최적화할 수 있다.

### 함수형 접근 방식

JavaScript/TypeScript의 일급 함수 특성을 활용하면 클래스 없이도 전략 패턴을 구현할 수 있다.

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

함수형 접근 방식은 간단한 전략에 적합하며, 클래스를 정의하는 오버헤드 없이 전략을 쉽게 추가하고 조합할 수 있다. 각 전략을 순수 함수로 정의하면 테스트와 재사용이 더욱 쉬워진다.

## 전략 패턴의 장점

전략 패턴을 사용하면 **알고리즘의 독립성**이 보장된다. 각 알고리즘이 독립적인 클래스로 분리되어 있어 다른 알고리즘에 영향을 주지 않고 수정할 수 있다.

**개방-폐쇄 원칙(OCP)** 준수 측면에서도 전략 패턴은 유용하다. 새로운 알고리즘을 추가할 때 기존 코드를 수정하지 않고 새로운 전략 클래스만 추가하면 된다.

**런타임 알고리즘 교체**가 가능하다는 점도 중요한 장점이다. 프로그램 실행 중에 상황에 따라 다른 알고리즘을 선택할 수 있어 유연성이 높아진다.

**조건문 제거**를 통해 코드가 간결해진다. 복잡한 if-else나 switch 문을 전략 객체로 대체하여 코드 가독성이 향상된다.

## 전략 패턴의 단점

전략 패턴을 사용할 때는 **클래스 수 증가** 문제를 고려해야 한다. 각 알고리즘마다 별도의 클래스를 만들어야 하므로 전략이 많아질수록 관리해야 할 클래스가 늘어난다.

**전략 선택의 책임**이 필요하다는 점도 단점이다. 사용하는 쪽에서 어떤 전략을 선택할지 결정해야 하므로 각 전략의 차이를 알고 있어야 한다.

**객체 생성 오버헤드**도 존재한다. 전략 객체를 생성하고 관리하는 데 추가적인 메모리와 처리 시간이 필요할 수 있다.

## 전략 패턴 사용 시 고려사항

전략 패턴은 **동일한 작업을 수행하는 여러 방법이 있는 경우**에 유용하다. 정렬, 압축, 암호화처럼 같은 목적을 다른 방식으로 달성하는 알고리즘이 있을 때 적합하다.

**런타임에 알고리즘을 선택해야 하는 경우**에도 전략 패턴이 적합하다. 사용자 설정이나 시스템 상태에 따라 다른 알고리즘을 사용해야 할 때 전략 패턴이 유연성을 제공한다.

**복잡한 조건문을 제거하고 싶은 경우**라면 전략 패턴을 고려해볼 만하다. 알고리즘 선택 로직이 복잡한 if-else나 switch 문으로 구현되어 있다면 전략 패턴으로 리팩토링하면 코드가 깔끔해진다.

반면 **알고리즘이 하나뿐이거나 거의 변경되지 않는 경우**에는 전략 패턴이 과도할 수 있다. 간단한 조건문으로 충분히 처리 가능한 경우 전략 패턴을 사용하면 오히려 복잡도가 증가한다. **전략 간 차이가 미미한 경우**에도 별도의 클래스를 만드는 것이 비효율적일 수 있으므로 신중하게 판단해야 한다.

전략 패턴은 알고리즘의 유연한 교체가 필요한 상황에서 코드의 확장성과 유지보수성을 크게 향상시킬 수 있는 유용한 디자인 패턴이다.
