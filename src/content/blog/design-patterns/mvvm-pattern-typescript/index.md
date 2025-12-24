---
title: "MVVM 패턴 (Model-View-ViewModel Pattern)"
summary: "TypeScript/JavaScript에서 MVVM 패턴 구현"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
  - Architecture
---

MVVM 패턴(Model-View-ViewModel Pattern)은 **데이터 바인딩을 통해 View와 ViewModel을 자동으로 동기화**하는 아키텍처 패턴이다. View와 비즈니스 로직을 분리하면서도 양방향 데이터 바인딩을 통해 코드를 간결하게 유지할 수 있다.

Model은 데이터와 비즈니스 로직을 담당하고, View는 사용자 인터페이스를 담당하며, ViewModel은 View의 상태와 동작을 캡슐화한다. MVP와 달리 ViewModel은 View를 직접 참조하지 않으며, 데이터 바인딩을 통해 자동으로 동기화된다.

## MVVM 패턴의 구성 요소

**Model**은 MVC, MVP와 동일하게 데이터와 비즈니스 로직을 관리한다. API 호출, 데이터베이스 접근, 유효성 검사 등을 담당하며 다른 컴포넌트에 의존하지 않는다.

**View**는 사용자 인터페이스를 담당한다. ViewModel의 데이터를 표시하고 사용자 입력을 받지만, ViewModel을 직접 호출하지 않는다. 데이터 바인딩을 통해 ViewModel과 자동으로 동기화된다.

**ViewModel**은 View의 추상화된 표현이다. View에 표시할 데이터와 명령을 제공하며, Model과 상호작용하여 데이터를 가져오거나 업데이트한다. ViewModel은 View의 구현을 알지 못하며, 오직 관찰 가능한 속성과 명령만 노출한다.

**데이터 바인딩**은 MVVM의 핵심 개념이다. View와 ViewModel 간의 양방향 자동 동기화를 제공하여, ViewModel의 데이터가 변경되면 View가 자동으로 업데이트되고, 사용자 입력이 있으면 ViewModel이 자동으로 업데이트된다.

## MVC, MVP와 MVVM의 차이점

MVC에서는 Controller가 View와 Model을 중재하며, View가 Model을 직접 참조할 수 있다. 단방향 흐름이 기본이며, 수동으로 View를 업데이트해야 한다.

MVP에서는 Presenter가 View와 Model 사이의 모든 통신을 처리한다. View와 Model이 완전히 분리되지만, Presenter가 View를 직접 제어하므로 View 인터페이스에 의존한다.

MVVM에서는 데이터 바인딩을 통해 View와 ViewModel이 자동으로 동기화된다. ViewModel은 View를 전혀 알지 못하며, 관찰 가능한 속성만 노출한다. 양방향 바인딩으로 코드가 간결해지고 보일러플레이트가 줄어든다.

## JavaScript로 MVVM 패턴 구현하기

수동으로 DOM을 업데이트하는 코드는 복잡하고 유지보수가 어렵다.

```javascript
// 수동 DOM 업데이트
const nameInput = document.getElementById("name");
const nameDisplay = document.getElementById("display");

nameInput.addEventListener("input", (e) => {
  nameDisplay.textContent = e.target.value; // 매번 수동으로 업데이트
});
```

위 코드는 View와 데이터를 수동으로 동기화해야 하므로 실수하기 쉽고 코드가 분산된다.

### 간단한 데이터 바인딩 구현

JavaScript의 Proxy를 사용하여 간단한 데이터 바인딩을 구현할 수 있다.

```javascript
// Observable: 관찰 가능한 객체
function createObservable(obj) {
  const listeners = new Map();

  const handler = {
    get(target, property) {
      return target[property];
    },
    set(target, property, value) {
      target[property] = value;
      // 속성 변경 시 리스너에 알림
      if (listeners.has(property)) {
        listeners.get(property).forEach((listener) => listener(value));
      }
      return true;
    },
  };

  const proxy = new Proxy(obj, handler);

  proxy.observe = function (property, callback) {
    if (!listeners.has(property)) {
      listeners.set(property, []);
    }
    listeners.get(property).push(callback);
  };

  return proxy;
}

// Model
class UserModel {
  async getUser(id) {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id,
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    };
  }

  async updateUser(user) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...user, updated: true };
  }
}

// ViewModel
class UserViewModel {
  constructor(model) {
    this.model = model;
    this.user = createObservable({
      name: "",
      email: "",
      age: 0,
    });
    this.loading = createObservable({ value: false });
  }

  async loadUser(id) {
    this.loading.value = true;
    const userData = await this.model.getUser(id);
    this.user.name = userData.name;
    this.user.email = userData.email;
    this.user.age = userData.age;
    this.loading.value = false;
  }

  async saveUser() {
    this.loading.value = true;
    await this.model.updateUser({
      name: this.user.name,
      email: this.user.email,
      age: this.user.age,
    });
    this.loading.value = false;
    console.log("사용자 정보 저장됨");
  }
}

// View
class UserView {
  constructor(viewModel) {
    this.viewModel = viewModel;
    this.createUI();
    this.bindViewModel();
  }

  createUI() {
    const app = document.getElementById("app");

    this.nameInput = document.createElement("input");
    this.nameInput.placeholder = "이름";

    this.emailInput = document.createElement("input");
    this.emailInput.placeholder = "이메일";

    this.ageInput = document.createElement("input");
    this.ageInput.type = "number";
    this.ageInput.placeholder = "나이";

    this.saveButton = document.createElement("button");
    this.saveButton.textContent = "저장";

    this.loadingDiv = document.createElement("div");
    this.loadingDiv.textContent = "로딩 중...";
    this.loadingDiv.style.display = "none";

    app.append(
      this.nameInput,
      this.emailInput,
      this.ageInput,
      this.saveButton,
      this.loadingDiv
    );
  }

  bindViewModel() {
    // ViewModel -> View (데이터가 변경되면 View 업데이트)
    this.viewModel.user.observe("name", (value) => {
      this.nameInput.value = value;
    });

    this.viewModel.user.observe("email", (value) => {
      this.emailInput.value = value;
    });

    this.viewModel.user.observe("age", (value) => {
      this.ageInput.value = value;
    });

    this.viewModel.loading.observe("value", (value) => {
      this.loadingDiv.style.display = value ? "block" : "none";
      this.saveButton.disabled = value;
    });

    // View -> ViewModel (사용자 입력을 ViewModel에 반영)
    this.nameInput.addEventListener("input", (e) => {
      this.viewModel.user.name = e.target.value;
    });

    this.emailInput.addEventListener("input", (e) => {
      this.viewModel.user.email = e.target.value;
    });

    this.ageInput.addEventListener("input", (e) => {
      this.viewModel.user.age = parseInt(e.target.value);
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

`createObservable` 함수는 Proxy를 사용하여 속성 변경을 감지하고 리스너에게 알린다. ViewModel의 속성이 변경되면 View가 자동으로 업데이트되고, 사용자 입력이 있으면 ViewModel이 자동으로 업데이트되어 양방향 바인딩이 구현된다.

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 ViewModel의 타입을 명시적으로 정의할 수 있다.

```typescript
// Observable 타입
type Listener<T> = (value: T) => void;

class Observable<T> {
  private value: T;
  private listeners: Listener<T>[] = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.push(listener);
    // 구독 해제 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.value));
  }
}

// Model
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoModel {
  private todos: Todo[] = [];

  addTodo(text: string): Todo {
    const todo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    this.todos.push(todo);
    return todo;
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  removeTodo(id: number): void {
    this.todos = this.todos.filter((t) => t.id !== id);
  }

  getTodos(): Todo[] {
    return [...this.todos];
  }
}

// ViewModel
class TodoViewModel {
  // Observable 속성들
  public todos: Observable<Todo[]>;
  public newTodoText: Observable<string>;
  public filter: Observable<"all" | "active" | "completed">;

  constructor(private model: TodoModel) {
    this.todos = new Observable<Todo[]>([]);
    this.newTodoText = new Observable<string>("");
    this.filter = new Observable<"all" | "active" | "completed">("all");
  }

  // 명령 (Commands)
  addTodo(): void {
    const text = this.newTodoText.get().trim();
    if (text) {
      this.model.addTodo(text);
      this.newTodoText.set("");
      this.updateTodos();
    }
  }

  toggleTodo(id: number): void {
    this.model.toggleTodo(id);
    this.updateTodos();
  }

  removeTodo(id: number): void {
    this.model.removeTodo(id);
    this.updateTodos();
  }

  setFilter(filter: "all" | "active" | "completed"): void {
    this.filter.set(filter);
    this.updateTodos();
  }

  // Computed 속성
  get filteredTodos(): Todo[] {
    const allTodos = this.model.getTodos();
    const currentFilter = this.filter.get();

    switch (currentFilter) {
      case "active":
        return allTodos.filter((t) => !t.completed);
      case "completed":
        return allTodos.filter((t) => t.completed);
      default:
        return allTodos;
    }
  }

  private updateTodos(): void {
    this.todos.set(this.filteredTodos);
  }
}

// View
class TodoView {
  private input: HTMLInputElement;
  private addButton: HTMLButtonElement;
  private todoList: HTMLUListElement;
  private filterButtons: HTMLDivElement;

  constructor(private viewModel: TodoViewModel) {
    this.createUI();
    this.bindViewModel();
  }

  private createUI(): void {
    const app = document.getElementById("app")!;

    this.input = document.createElement("input");
    this.input.placeholder = "할 일을 입력하세요";

    this.addButton = document.createElement("button");
    this.addButton.textContent = "추가";

    this.filterButtons = document.createElement("div");
    this.filterButtons.innerHTML = `
      <button data-filter="all">전체</button>
      <button data-filter="active">활성</button>
      <button data-filter="completed">완료</button>
    `;

    this.todoList = document.createElement("ul");

    app.append(
      this.input,
      this.addButton,
      this.filterButtons,
      this.todoList
    );
  }

  private bindViewModel(): void {
    // ViewModel -> View 바인딩
    this.viewModel.todos.subscribe((todos) => {
      this.renderTodos(todos);
    });

    this.viewModel.newTodoText.subscribe((text) => {
      this.input.value = text;
    });

    // View -> ViewModel 바인딩
    this.input.addEventListener("input", (e) => {
      this.viewModel.newTodoText.set((e.target as HTMLInputElement).value);
    });

    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.viewModel.addTodo();
      }
    });

    this.addButton.addEventListener("click", () => {
      this.viewModel.addTodo();
    });

    this.filterButtons.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON") {
        const filter = target.dataset.filter as
          | "all"
          | "active"
          | "completed";
        this.viewModel.setFilter(filter);
      }
    });

    // 초기 렌더링
    this.viewModel.todos.set(this.viewModel.filteredTodos);
  }

  private renderTodos(todos: Todo[]): void {
    this.todoList.innerHTML = "";

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = todo.completed ? "completed" : "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => {
        this.viewModel.toggleTodo(todo.id);
      });

      const span = document.createElement("span");
      span.textContent = todo.text;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.addEventListener("click", () => {
        this.viewModel.removeTodo(todo.id);
      });

      li.append(checkbox, span, deleteBtn);
      this.todoList.appendChild(li);
    });
  }
}

// 애플리케이션 초기화
const todoModel = new TodoModel();
const todoViewModel = new TodoViewModel(todoModel);
const todoView = new TodoView(todoViewModel);
```

`Observable` 클래스를 통해 타입 안전한 데이터 바인딩을 구현한다. ViewModel은 Observable 속성을 통해 View와 자동으로 동기화되며, View는 ViewModel의 명령 메서드를 호출하여 사용자 액션을 처리한다.

### 실제 사용 예제: Vue.js 스타일 MVVM

Vue.js는 MVVM 패턴의 대표적인 구현체다. 간단한 Vue 스타일 예제를 살펴보자.

```typescript
// Vue.js 스타일의 반응형 시스템
class ReactiveSystem {
  static reactive<T extends object>(obj: T): T {
    return new Proxy(obj, {
      get(target, key) {
        // 의존성 추적
        return target[key as keyof T];
      },
      set(target, key, value) {
        const oldValue = target[key as keyof T];
        if (oldValue !== value) {
          target[key as keyof T] = value;
          // 변경 알림
          console.log(`${String(key)} 변경됨:`, value);
        }
        return true;
      },
    });
  }
}

// ViewModel (Vue 컴포넌트와 유사)
interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

class RegistrationViewModel {
  // 반응형 데이터
  public formData: FormData;
  public errors: ValidationErrors;
  public isSubmitting: boolean;

  constructor() {
    this.formData = ReactiveSystem.reactive({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    this.errors = ReactiveSystem.reactive({});
    this.isSubmitting = false;
  }

  // Computed 속성
  get isValid(): boolean {
    return (
      this.formData.username.length > 0 &&
      this.formData.email.includes("@") &&
      this.formData.password.length >= 6 &&
      this.formData.password === this.formData.confirmPassword
    );
  }

  // 메서드
  validateUsername(): void {
    if (this.formData.username.length < 3) {
      this.errors.username = "사용자명은 3자 이상이어야 합니다.";
    } else {
      delete this.errors.username;
    }
  }

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errors.email = "올바른 이메일 형식이 아닙니다.";
    } else {
      delete this.errors.email;
    }
  }

  validatePassword(): void {
    if (this.formData.password.length < 6) {
      this.errors.password = "비밀번호는 6자 이상이어야 합니다.";
    } else {
      delete this.errors.password;
    }
  }

  validateConfirmPassword(): void {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    } else {
      delete this.errors.confirmPassword;
    }
  }

  async submit(): Promise<void> {
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();

    if (!this.isValid) {
      console.log("유효성 검사 실패");
      return;
    }

    this.isSubmitting = true;

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("회원가입 성공:", this.formData);
    this.isSubmitting = false;

    // 폼 초기화
    this.reset();
  }

  reset(): void {
    this.formData.username = "";
    this.formData.email = "";
    this.formData.password = "";
    this.formData.confirmPassword = "";
    this.errors = ReactiveSystem.reactive({});
  }
}
```

Vue.js 스타일의 ViewModel은 반응형 데이터, computed 속성, 메서드를 포함한다. 데이터가 변경되면 자동으로 View가 업데이트되며, 프레임워크가 이를 자동으로 처리한다.

## MVVM 패턴의 장점

MVVM 패턴을 사용하면 **자동 동기화**를 통해 수동 DOM 조작이 필요 없다. 데이터 바인딩이 View와 ViewModel을 자동으로 동기화한다.

**테스트 용이성**도 MVVM 패턴의 중요한 장점이다. ViewModel은 View를 알지 못하므로 UI 없이도 로직을 테스트할 수 있다.

**관심사의 분리**가 명확하다. View는 표현 로직만, ViewModel은 비즈니스 로직만 담당하여 유지보수가 쉽다.

**선언적 UI**를 통해 코드가 간결해진다. 명령형으로 DOM을 조작하는 대신 선언적으로 데이터를 정의한다.

## MVVM 패턴의 단점

MVVM 패턴을 사용할 때는 **복잡한 바인딩 로직** 문제를 고려해야 한다. 복잡한 UI에서 바인딩 관계를 추적하기 어려울 수 있다.

**메모리 사용**도 문제가 될 수 있다. 양방향 바인딩은 리스너와 옵저버를 많이 생성하여 메모리를 더 사용한다.

**디버깅 어려움**도 존재한다. 자동 바인딩으로 인해 데이터 흐름을 추적하기 어려울 수 있다.

**학습 곡선**이 높을 수 있다. 반응형 시스템과 데이터 바인딩 개념을 이해해야 한다.

## MVVM 패턴 사용 시 고려사항

MVVM 패턴은 **데이터 중심 애플리케이션**에 유용하다. 폼, 대시보드, 관리 페이지 등 데이터 바인딩이 많이 필요한 경우 적합하다.

**실시간 업데이트가 필요한 경우**에도 MVVM 패턴이 적합하다. 양방향 바인딩을 통해 실시간으로 데이터를 동기화할 수 있다.

**현대 프레임워크를 사용하는 경우**라면 MVVM 패턴을 고려해볼 만하다. Vue, Angular, Knockout 등이 MVVM 패턴을 기반으로 한다.

반면 **간단한 정적 페이지**에는 MVVM 패턴이 과도할 수 있다. 바인딩 시스템의 오버헤드가 불필요할 수 있다. **성능이 매우 중요한 경우**에도 양방향 바인딩의 오버헤드를 고려해야 한다. **복잡한 애니메이션이나 Canvas 작업**의 경우 직접 DOM 제어가 더 효율적일 수 있다.

MVVM 패턴은 데이터 바인딩을 통해 View와 비즈니스 로직을 효과적으로 분리하는 현대적인 아키텍처 패턴이다.
