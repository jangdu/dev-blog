---
title: "MVP 패턴 (Model-View-Presenter Pattern)"
summary: "TypeScript에서 MVP 패턴 구현"
date: "April 18 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - Architecture
---

MVP 패턴(Model-View-Presenter Pattern)은 **MVC 패턴에서 발전한 아키텍처 패턴**으로, View와 Model을 완전히 분리하고 Presenter가 둘 사이의 모든 상호작용을 중재한다. View는 Presenter를 통해서만 Model과 통신하며, Presenter는 View의 인터페이스를 통해 UI를 업데이트한다.

## MVP 패턴의 구성 요소

- **Model**: MVC와 동일하게 데이터와 비즈니스 로직을 관리한다. Presenter의 요청에 따라 데이터를 제공하거나 업데이트하며, View나 Presenter에 의존하지 않는다.

- **View**: 사용자 인터페이스만 담당한다. 사용자 입력을 받아 Presenter에 전달하고, Presenter의 지시에 따라 화면을 업데이트한다. View는 비즈니스 로직을 포함하지 않고, Presenter가 정의한 인터페이스를 구현한다.

- **Presenter**: View와 Model 사이의 중재자 역할을 한다. View로부터 사용자 입력을 받아 Model을 업데이트하고, Model의 데이터를 가공하여 View에 표시한다. Presenter는 View의 인터페이스에만 의존하므로 테스트가 용이하다.

## MVC와 MVP의 차이점

MVC에서는 View가 Model을 직접 참조하여 데이터를 읽을 수 있다. Controller는 사용자 입력을 처리하고 Model을 업데이트하지만, View의 업데이트는 Model의 변경 알림을 통해 이루어진다.

MVP에서는 View와 Model이 완전히 분리되어 있다. View는 Model을 전혀 알지 못하며, 모든 통신이 Presenter를 통해 이루어진다. Presenter는 View의 인터페이스를 통해 UI를 직접 제어한다.

## TypeScript로 MVP 패턴 구현하기

MVC에서는 View가 Model을 참조할 수 있지만, MVP에서는 완전히 분리된다.

```typescript
// MVC 스타일 - View가 Model을 참조
interface Model {
  getData(): any;
}

class View {
  constructor(private model: Model) {
    // View가 Model을 직접 참조
  }

  render(): void {
    const data = this.model.getData(); // Model에서 직접 데이터 읽기
    // 렌더링...
  }
}
```

위 코드는 View가 Model에 의존하여 테스트가 어렵고, View와 Model 간 결합도가 높다. View를 테스트하려면 Model을 모킹해야 하며, Model이 변경되면 View도 함께 수정해야 할 수 있다.

### 기본 구현

MVP 패턴은 View와 Model을 완전히 분리하고 Presenter가 모든 상호작용을 처리한다. View는 Model을 전혀 알지 못하며, 오직 Presenter를 통해서만 데이터를 받고 이벤트를 전달한다. Presenter는 View의 인터페이스에만 의존하므로, View를 쉽게 교체하거나 모킹할 수 있어 테스트가 용이하다.

```typescript
// Model: 데이터와 비즈니스 로직
class CounterModel {
  private count: number = 0;

  increment(): number {
    this.count++;
    return this.count;
  }

  decrement(): number {
    this.count--;
    return this.count;
  }

  reset(): number {
    this.count = 0;
    return this.count;
  }

  getCount(): number {
    return this.count;
  }
}

// View 인터페이스 (Presenter가 기대하는 View의 메서드)
interface ICounterView {
  updateDisplay(count: number): void;
  bindIncrement(handler: () => void): void;
  bindDecrement(handler: () => void): void;
  bindReset(handler: () => void): void;
}

class CounterView implements ICounterView {
  private display: HTMLElement;
  private incrementBtn: HTMLElement;
  private decrementBtn: HTMLElement;
  private resetBtn: HTMLElement;

  constructor() {
    const displayEl = document.getElementById("counter-display");
    const incrementBtnEl = document.getElementById("increment-btn");
    const decrementBtnEl = document.getElementById("decrement-btn");
    const resetBtnEl = document.getElementById("reset-btn");

    if (!displayEl || !incrementBtnEl || !decrementBtnEl || !resetBtnEl) {
      throw new Error("Required elements not found");
    }

    this.display = displayEl;
    this.incrementBtn = incrementBtnEl;
    this.decrementBtn = decrementBtnEl;
    this.resetBtn = resetBtnEl;
  }

  // View는 화면 업데이트만 담당
  updateDisplay(count: number): void {
    this.display.textContent = count.toString();
  }

  // 사용자 입력을 Presenter에 전달
  bindIncrement(handler: () => void): void {
    this.incrementBtn.addEventListener("click", handler);
  }

  bindDecrement(handler: () => void): void {
    this.decrementBtn.addEventListener("click", handler);
  }

  bindReset(handler: () => void): void {
    this.resetBtn.addEventListener("click", handler);
  }
}

// Presenter: View와 Model 사이의 중재자
class CounterPresenter {
  constructor(
    private model: CounterModel,
    private view: ICounterView
  ) {
    // View의 이벤트와 Presenter 메서드 바인딩
    this.view.bindIncrement(() => this.increment());
    this.view.bindDecrement(() => this.decrement());
    this.view.bindReset(() => this.reset());

    // 초기 화면 업데이트
    this.updateView();
  }

  private increment(): void {
    this.model.increment();
    this.updateView();
  }

  private decrement(): void {
    this.model.decrement();
    this.updateView();
  }

  private reset(): void {
    this.model.reset();
    this.updateView();
  }

  private updateView(): void {
    const count = this.model.getCount();
    this.view.updateDisplay(count);
  }
}

// 애플리케이션 초기화
const model = new CounterModel();
const view = new CounterView();
const presenter = new CounterPresenter(model, view);
```

위 코드에서 `CounterView`는 화면 업데이트와 이벤트 바인딩만 담당하며 Model을 전혀 알지 못한다. View는 `ICounterView` 인터페이스를 구현하여 Presenter가 기대하는 메서드만 제공한다.

`CounterPresenter`는 사용자 입력을 받아 Model을 업데이트하고, Model의 데이터를 가져와서 View에 전달한다. Presenter는 View의 인터페이스(`ICounterView`)에만 의존하므로, View 구현을 쉽게 교체하거나 모킹할 수 있어 단위 테스트가 용이하다. 또한 View와 Model이 완전히 분리되어 있어, 한쪽을 수정해도 다른 쪽에 영향을 주지 않는다.

## MVP 패턴의 장점

MVP 패턴을 사용하면 **View와 Model의 완전한 분리**가 가능하다. View는 Model을 전혀 알지 못하므로 결합도가 매우 낮아서 아래와 같은 장점이 있다.

Presenter는 View 인터페이스에만 의존하므로 Mock View를 사용하여 쉽게 테스트할 수 있다.

동일한 View 인터페이스를 구현하면 웹, 모바일, 데스크톱 등 다양한 플랫폼에서 같은 Presenter를 사용할 수 있어, **재사용성**이 올라간다.

**비즈니스 로직의 집중화**를 통해 Presenter에 모든 로직이 모여 있어 구조를 파악하기 쉬워진다.

## MVP 패턴의 단점

View 인터페이스를 정의하고 Presenter를 만들어야 하므로 코드가 많아진다. 복잡한 UI는 Presenter에 많은 로직이 집중되어 관리가 어려워질 수 있다.

**View와 Presenter의 1:1 관계**도 단점이 될 수 있다. 각 View마다 Presenter가 필요하므로 클래스 수가 늘어난다.

## MVP 패턴 사용 시 고려사항

MVP 패턴은 **테스트가 중요한 프로젝트**에 유용하다. Presenter를 단위 테스트하기 쉬워 TDD(테스트 주도 개발)에 적합하다.

View 인터페이스만 구현하면 동일한 비즈니스 로직을 재사용할 수 있어, **여러 플랫폼을 지원해야 하는 경우**에도 적합하다.

Presenter가 모든 로직을 처리하므로 View가 단순해져 **복잡한 UI 로직이 있는 경우**라면 MVP 패턴을 고려해볼 만하다.

반면 **간단한 CRUD 애플리케이션**에는 MVC나 더 간단한 패턴으로 충분할 수 있다. **실시간 양방향 바인딩이 필요한 경우**에는 MVVM 패턴이 더 적합할 수 있다. **현대 프레임워크를 사용하는 경우**에는 React, Vue, Angular의 컴포넌트 기반 구조가 더 자연스러울 수 있다.
