---
title: "MVVM 패턴 (Model-View-ViewModel Pattern)"
summary: "TypeScript에서 MVVM 패턴 구현"
date: "April 17 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - Architecture
---

MVVM 패턴(Model-View-ViewModel Pattern)은 **데이터 바인딩을 통해 View와 ViewModel을 자동으로 동기화**하는 아키텍처 패턴이다. View와 비즈니스 로직을 분리하면서도 양방향 데이터 바인딩을 통해 코드를 간결하게 유지할 수 있다.

Model은 데이터와 비즈니스 로직을 담당하고, View는 사용자 인터페이스를 담당하며, ViewModel은 View의 상태와 동작을 캡슐화한다. MVP와 달리 ViewModel은 View를 직접 참조하지 않으며, 데이터 바인딩을 통해 자동으로 동기화된다.

Vue, Angular, Knockout 등이 MVVM 패턴을 기반으로 한다.

> 데이터 바인딩은 MVVM의 핵심 개념이다. View와 ViewModel 간의 양방향 자동 동기화를 제공하여, ViewModel의 데이터가 변경되면 View가 자동으로 업데이트되고, 사용자 입력이 있으면 ViewModel이 자동으로 업데이트된다.

## MVVM 패턴의 구성 요소

- **Model**: MVC, MVP와 동일하게 데이터와 비즈니스 로직을 관리한다. API 호출, 데이터베이스 접근, 유효성 검사 등을 담당하며 다른 컴포넌트에 의존하지 않는다.

- **View**: 사용자 인터페이스를 담당한다. ViewModel의 데이터를 표시하고 사용자 입력을 받지만, ViewModel을 직접 호출하지 않는다. 데이터 바인딩을 통해 ViewModel과 자동으로 동기화된다.

- **ViewModel**: View의 추상화된 표현이다. View에 표시할 데이터와 명령을 제공하며, Model과 상호작용하여 데이터를 가져오거나 업데이트한다. ViewModel은 View의 구현을 알지 못하며, 오직 관찰 가능한 속성과 명령만 노출한다.

## MVC, MVP와 MVVM의 차이점

MVC에서는 Controller가 View와 Model을 중재하며, View가 Model을 직접 참조할 수 있다. 단방향 흐름이 기본이며, 수동으로 View를 업데이트해야 한다.

MVP에서는 Presenter가 View와 Model 사이의 모든 통신을 처리한다. View와 Model이 완전히 분리되지만, Presenter가 View를 직접 제어하므로 View 인터페이스에 의존한다.

MVVM에서는 데이터 바인딩을 통해 View와 ViewModel이 자동으로 동기화된다. ViewModel은 View를 전혀 알지 못하며, 관찰 가능한 속성만 노출한다. 양방향 바인딩으로 코드가 간결해지고 보일러플레이트가 줄어든다.

## TypeScript로 MVVM 패턴 구현하기

수동으로 DOM을 업데이트하는 코드는 복잡하고 유지보수가 어렵다. 데이터가 변경될 때마다 DOM을 직접 조작해야 하므로, 여러 곳에서 같은 데이터를 표시하는 경우 각각 업데이트해야 한다.

```typescript
// 수동 DOM 업데이트
const nameInput = document.getElementById("name") as HTMLInputElement;
const nameDisplay = document.getElementById("display") as HTMLElement;

nameInput.addEventListener("input", (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (nameDisplay) {
    nameDisplay.textContent = target.value; // 매번 수동으로 업데이트
  }
});
```

위 코드는 View와 데이터를 수동으로 동기화해야 하므로 실수하기 쉽고 코드가 분산된다. 같은 데이터를 여러 곳에 표시해야 할 때 각각 업데이트해야 하며, 데이터가 변경되는 모든 지점을 찾아서 수정해야 한다.

### 기본 구현: 간단한 카운터 예시

MVVM 패턴을 이해하기 위해 가장 간단한 카운터 예시부터 살펴보자. 카운터는 숫자를 표시하고 증가/감소 버튼을 제공한다.

먼저 데이터 바인딩을 위한 간단한 Observable 클래스를 만들자. 이 클래스는 값이 변경될 때 자동으로 알림을 보낸다.

```typescript
// Observable: 값이 변경되면 자동으로 알림을 보내는 클래스
class Observable<T> {
  private value: T;
  private listeners: Array<(value: T) => void> = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      // 값이 변경되면 등록된 모든 리스너에게 알림
      this.listeners.forEach((listener) => listener(newValue));
    }
  }

  subscribe(listener: (value: T) => void): void {
    this.listeners.push(listener);
  }
}

// Model: 데이터 저장소
class CounterModel {
  private count: number = 0;

  getCount(): number {
    return this.count;
  }

  increment(): void {
    this.count++;
  }

  decrement(): void {
    this.count--;
  }
}

// ViewModel: View에 표시할 데이터와 명령을 제공
class CounterViewModel {
  public count: Observable<number>;
  private model: CounterModel;

  constructor(model: CounterModel) {
    this.model = model;
    // Observable로 감싸서 값 변경 시 자동 알림
    this.count = new Observable<number>(this.model.getCount());
  }

  increment(): void {
    this.model.increment();
    // Model이 변경되면 Observable도 업데이트 (View가 자동으로 갱신됨)
    this.count.set(this.model.getCount());
  }

  decrement(): void {
    this.model.decrement();
    this.count.set(this.model.getCount());
  }
}

// View: 화면에 표시하고 사용자 입력을 받음
class CounterView {
  private viewModel: CounterViewModel;
  private countDisplay: HTMLElement;
  private incrementBtn: HTMLButtonElement;
  private decrementBtn: HTMLButtonElement;

  constructor(viewModel: CounterViewModel) {
    this.viewModel = viewModel;
    this.createUI();
    this.bindViewModel();
  }

  private createUI(): void {
    const app = document.getElementById("app");
    if (!app) throw new Error("app element not found");

    this.countDisplay = document.createElement("div");
    this.countDisplay.textContent = "0";

    this.incrementBtn = document.createElement("button");
    this.incrementBtn.textContent = "+";

    this.decrementBtn = document.createElement("button");
    this.decrementBtn.textContent = "-";

    app.append(this.countDisplay, this.incrementBtn, this.decrementBtn);
  }

  private bindViewModel(): void {
    // ViewModel -> View: count 값이 변경되면 화면 자동 업데이트
    this.viewModel.count.subscribe((value) => {
      this.countDisplay.textContent = value.toString();
    });

    // View -> ViewModel: 버튼 클릭 시 ViewModel 메서드 호출
    this.incrementBtn.addEventListener("click", () => {
      this.viewModel.increment();
    });

    this.decrementBtn.addEventListener("click", () => {
      this.viewModel.decrement();
    });
  }
}

// 애플리케이션 초기화
const model = new CounterModel();
const viewModel = new CounterViewModel(model);
const view = new CounterView(viewModel);
```

위 코드의 동작 흐름을 단계별로 설명하면 다음과 같다:

1. **사용자가 "+" 버튼 클릭** → View의 이벤트 리스너가 `viewModel.increment()` 호출
2. **ViewModel의 `increment()` 실행** → Model의 `increment()` 호출하여 데이터 변경
3. **ViewModel이 `count.set()` 호출** → Observable이 값 변경을 감지
4. **Observable이 모든 구독자에게 알림** → View의 `subscribe` 콜백이 실행되어 화면 업데이트

이렇게 하면 ViewModel의 데이터만 변경하면 View가 자동으로 갱신된다. 수동으로 DOM을 조작할 필요가 없어 코드가 간결해진다.

### 실제 사용 예제: 사용자 정보 폼

이제 더 복잡한 예시로 사용자 정보를 입력하고 저장하는 폼을 만들어보자.

```typescript
// Model: 서버와 통신하여 사용자 데이터 관리
class UserModel {
  async getUser(id: number): Promise<{ name: string; email: string }> {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      name: "홍길동",
      email: "hong@example.com",
    };
  }

  async saveUser(name: string, email: string): Promise<void> {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("저장됨:", { name, email });
  }
}

// ViewModel: View에 표시할 데이터와 명령 제공
class UserViewModel {
  public name: Observable<string>;
  public email: Observable<string>;
  public loading: Observable<boolean>;
  private model: UserModel;

  constructor(model: UserModel) {
    this.model = model;
    this.name = new Observable<string>("");
    this.email = new Observable<string>("");
    this.loading = new Observable<boolean>(false);
  }

  async loadUser(id: number): Promise<void> {
    this.loading.set(true);
    const user = await this.model.getUser(id);
    this.name.set(user.name);
    this.email.set(user.email);
    this.loading.set(false);
  }

  async saveUser(): Promise<void> {
    this.loading.set(true);
    await this.model.saveUser(this.name.get(), this.email.get());
    this.loading.set(false);
  }
}

// View: 화면 표시 및 사용자 입력 처리
class UserView {
  private viewModel: UserViewModel;
  private nameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private saveButton: HTMLButtonElement;
  private loadingDiv: HTMLDivElement;

  constructor(viewModel: UserViewModel) {
    this.viewModel = viewModel;
    this.createUI();
    this.bindViewModel();
  }

  private createUI(): void {
    const app = document.getElementById("app");
    if (!app) throw new Error("app element not found");

    this.nameInput = document.createElement("input");
    this.nameInput.placeholder = "이름";

    this.emailInput = document.createElement("input");
    this.emailInput.placeholder = "이메일";

    this.saveButton = document.createElement("button");
    this.saveButton.textContent = "저장";

    this.loadingDiv = document.createElement("div");
    this.loadingDiv.textContent = "로딩 중...";
    this.loadingDiv.style.display = "none";

    app.append(
      this.nameInput,
      this.emailInput,
      this.saveButton,
      this.loadingDiv
    );
  }

  private bindViewModel(): void {
    // ViewModel -> View: 데이터 변경 시 화면 자동 업데이트
    this.viewModel.name.subscribe((value) => {
      this.nameInput.value = value;
    });

    this.viewModel.email.subscribe((value) => {
      this.emailInput.value = value;
    });

    this.viewModel.loading.subscribe((loading) => {
      this.loadingDiv.style.display = loading ? "block" : "none";
      this.saveButton.disabled = loading;
    });

    // View -> ViewModel: 사용자 입력을 ViewModel에 반영
    this.nameInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.viewModel.name.set(target.value);
    });

    this.emailInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.viewModel.email.set(target.value);
    });

    this.saveButton.addEventListener("click", () => {
      this.viewModel.saveUser();
    });
  }
}

// 애플리케이션 초기화
const model = new UserModel();
const viewModel = new UserViewModel(model);
const view = new UserView(viewModel);

// 사용자 데이터 로드
viewModel.loadUser(1);
```

이 예시에서 양방향 데이터 바인딩이 어떻게 동작하는지 확인할 수 있다:

- **ViewModel → View**: `viewModel.name.set("새 이름")`을 호출하면 자동으로 입력 필드가 업데이트됨
- **View → ViewModel**: 사용자가 입력 필드에 타이핑하면 자동으로 `viewModel.name.set()`이 호출됨

이렇게 하면 데이터와 화면이 항상 동기화되어 있어, 수동으로 DOM을 조작할 필요가 없고 실수할 가능성도 줄어든다.

## MVVM 패턴의 장점

MVVM 패턴을 사용하면 **자동 동기화**를 통해 수동 DOM 조작이 필요 없다. 데이터 바인딩이 View와 ViewModel을 자동으로 동기화한다.

View는 표현 로직만, ViewModel은 비즈니스 로직만 담당하여 **관심사의 분리**가 명확해 유지보수가 쉽다.

명령형으로 DOM을 조작하는 대신 선언적으로 데이터를 정의하는 **선언적 UI**를 통해 코드가 간결해진다.

## MVVM 패턴의 단점

MVVM 패턴을 사용할 때는 **복잡한 바인딩 로직** 문제를 고려해야 한다. 복잡한 UI에서 바인딩 관계를 추적하기 어려울 수 있다.

양방향 바인딩은 리스너와 옵저버를 많이 생성하여 메모리를 더 사용한다.

자동 바인딩으로 인해 데이터 흐름을 추적하기 어려워 **디버깅 어려움**도 문제가 될 수 있다.

## MVVM 패턴 사용 시 고려사항

MVVM 패턴은 **데이터 중심 애플리케이션**에 유용하다. 폼, 대시보드, 관리 페이지 등 데이터 바인딩이 많이 필요한 경우 적합하다.

양방향 바인딩을 통해 실시간으로 데이터를 동기화할 수 있어, **실시간 업데이트가 필요한 경우**에도 MVVM 패턴이 적합하다.

반면 **간단한 정적 페이지**에는 바인딩 시스템의 오버헤드가 불필요할 수 있다. **성능이 매우 중요한 경우**에도 양방향 바인딩의 오버헤드를 고려해야 한다. **복잡한 애니메이션이나 Canvas 작업**의 경우 직접 DOM을 제어하는게 더 효율적일 수 있다.
