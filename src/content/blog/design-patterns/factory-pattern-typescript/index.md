---
title: "팩토리 패턴 (Factory Pattern)"
summary: "TypeScript/JavaScript에서 팩토리 패턴 구현"
date: "Mar 20 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

팩토리 패턴(Factory Pattern)은 **객체 생성 로직을 캡슐화**하여, 코드가 구체적인 클래스를 직접 생성하지 않고도 객체를 생성할 수 있도록 하는 디자인 패턴이다.

이 패턴은 객체 생성 과정이 복잡하거나, 생성할 객체의 타입이 런타임에 결정되는 경우에 유용하다. 주로 UI 컴포넌트 생성, 데이터 파서, 알림 시스템 등에서 사용된다.

## Typescript로 팩토리 패턴 구현하기

**javascript**에서 객체를 생성할 때는 `new` 키워드를 사용하여 직접 인스턴스를 생성한다.

```typescript
class Car {
  constructor(model) {
    this.type = "car";
    this.model = model;
  }
}

class Truck {
  constructor(model) {
    this.type = "truck";
    this.model = model;
  }
}

// 직접 클래스를 알고 있어야 함
const myCar = new Car("Sonata");
const myTruck = new Truck("Porter");
```

일반적인 인스턴스를 생성하는 방식은 `Car`와 `Truck` 클래스를 직접 알고 있어야 하며, 객체 생성 로직이 여러 곳에 분산될 수 있다.

팩토리 패턴은 이러한 객체 생성 로직을 중앙화하여, 어떤 객체를 생성할지만 요청하고 실제 생성 과정은 팩토리에 위임한다.

### 기본 구현

```typescript
interface Vehicle {
  type: string;
  model: string;
  wheels: number;
  drive(): void;
}

class Car implements Vehicle {
  type = "car";
  wheels = 4;

  constructor(public model: string) {}

  drive(): void {
    console.log(`${this.model} 자동차가 주행 중입니다.`);
  }
}

class Truck implements Vehicle {
  type = "truck";
  wheels = 6;

  constructor(public model: string) {}

  drive(): void {
    console.log(`${this.model} 트럭이 주행 중입니다.`);
  }
}

class Motorcycle implements Vehicle {
  type = "motorcycle";
  wheels = 2;

  constructor(public model: string) {}

  drive(): void {
    console.log(`${this.model} 오토바이가 주행 중입니다.`);
  }
}

type VehicleType = "car" | "truck" | "motorcycle";

class VehicleFactory {
  static createVehicle(type: VehicleType, model: string): Vehicle {
    switch (type) {
      case "car":
        return new Car(model);
      case "truck":
        return new Truck(model);
      case "motorcycle":
        return new Motorcycle(model);
    }
  }
}

// 사용 예제
const vehicle1 = VehicleFactory.createVehicle("car", "Sonata");
const vehicle2 = VehicleFactory.createVehicle("truck", "Porter");
const vehicle3 = VehicleFactory.createVehicle("motorcycle", "Harley");

vehicle1.drive(); // Sonata 자동차가 주행 중입니다.
vehicle2.drive(); // Porter 트럭이 주행 중입니다.
vehicle3.drive(); // Harley 오토바이가 주행 중입니다.
```

위 코드처럼 정적 메서드(`static`)를 사용하면 `new VehicleFactory()`로 인스턴스를 만들 필요 없이 `VehicleFactory.createVehicle()`로 바로 호출할 수 있다. 이는 불필요한 인스턴스 생성을 방지하고 메모리를 절약하며, 사용법도 더 간단해진다.

`VehicleFactory`는 입력된 타입에 따라 적절한 객체를 생성하므로, 구체적인 클래스(`Car`, `Truck`, `Motorcycle`)를 알 필요 없이 팩토리를 통해 객체를 생성할 수 있다.

## 팩토리 패턴의 특징

팩토리 패턴을 사용하면 구현체가 변경되어도 팩토리를 사용하는 코드를 수정할 필요가 없어진다. 또한 객체 생성 로직이 여러 곳에 분산되지 않고 팩토리에 중앙화되므로, 생성 로직을 수정하거나 확장할 때 한 곳만 변경하면 된다는 장점이 있다.

새로운 타입의 객체를 추가할 때 기존 코드를 수정하지 않고 팩토리에 새로운 케이스만 추가하면 되기 때문에 Mock 객체를 주입하기 쉬워지므로 단위 테스트 작성이 편리해, **개방-폐쇄 원칙(OCP)** 준수 측면에서도 유용하다.

하지만 간단한 객체 생성에도 팩토리 클래스를 만들면 오히려 코드가 복잡해질 수 있다. 각 타입마다 클래스를 만들고 팩토리 클래스까지 추가하면 전체 클래스 개수가 늘어나 프로젝트 구조가 복잡해진다. 또한 생성할 수 있는 객체 타입이 많아질수록 팩토리 클래스의 `switch` 문이나 조건문이 길어져 유지보수가 어려워질 수 있다.

팩토리 패턴은 **객체 생성 로직이 복잡한 경우**나 **생성할 객체의 타입이 런타임에 결정되는 경우**에 유용하다. 사용자 입력이나 설정에 따라 다른 타입의 객체를 생성해야 할 때처럼 **여러 곳에서 동일한 생성 로직을 사용하는 경우**라면 코드 중복을 피하고 생성 로직을 중앙화하기 위해 팩토리 패턴을 고려해볼 만하다. **새로운 타입의 추가가 빈번한 경우**에도 확장 가능한 구조가 필요하므로 팩토리 패턴이 유용하다.

반면 **생성할 객체가 1-2개뿐인 경우**나 **생성 로직이 매우 단순한 경우**에는 `new` 키워드만으로 충분히 처리 가능하므로 팩토리 패턴이 과도할 수 있다. **프로젝트 규모가 작은 경우**에는 추상화 레이어를 추가하는 것이 오히려 복잡도를 높일 수 있으므로 적합하지 않을 수 있다.
