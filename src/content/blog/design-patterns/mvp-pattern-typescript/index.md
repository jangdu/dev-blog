---
title: "MVP 패턴 (Model-View-Presenter Pattern)"
summary: "TypeScript/JavaScript에서 MVP 패턴 구현"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
  - Architecture
---

MVP 패턴(Model-View-Presenter Pattern)은 **MVC 패턴에서 발전한 아키텍처 패턴**으로, View와 Model을 완전히 분리하고 Presenter가 둘 사이의 모든 상호작용을 중재한다. View는 Presenter를 통해서만 Model과 통신하며, Presenter는 View의 인터페이스를 통해 UI를 업데이트한다.

Model은 데이터와 비즈니스 로직을 담당하고, View는 UI 표시와 사용자 입력만 담당하며, Presenter는 View와 Model 사이의 모든 로직을 처리한다. MVC와 달리 View는 Model을 직접 참조하지 않아 완전한 분리가 가능하다.

## MVP 패턴의 구성 요소

**Model**은 MVC와 동일하게 데이터와 비즈니스 로직을 관리한다. Presenter의 요청에 따라 데이터를 제공하거나 업데이트하며, View나 Presenter에 의존하지 않는다.

**View**는 사용자 인터페이스만 담당한다. 사용자 입력을 받아 Presenter에 전달하고, Presenter의 지시에 따라 화면을 업데이트한다. View는 비즈니스 로직을 포함하지 않으며, Presenter가 정의한 인터페이스를 구현한다.

**Presenter**는 View와 Model 사이의 중재자 역할을 한다. View로부터 사용자 입력을 받아 Model을 업데이트하고, Model의 데이터를 가공하여 View에 표시한다. Presenter는 View의 인터페이스에만 의존하므로 테스트가 용이하다.

## MVC와 MVP의 차이점

MVC에서는 View가 Model을 직접 참조하여 데이터를 읽을 수 있다. Controller는 사용자 입력을 처리하고 Model을 업데이트하지만, View의 업데이트는 Model의 변경 알림을 통해 이루어진다.

MVP에서는 View와 Model이 완전히 분리되어 있다. View는 Model을 전혀 알지 못하며, 모든 통신이 Presenter를 통해 이루어진다. Presenter는 View의 인터페이스를 통해 UI를 직접 제어한다.

## JavaScript로 MVP 패턴 구현하기

MVC에서는 View가 Model을 참조할 수 있지만, MVP에서는 완전히 분리된다.

```javascript
// MVC 스타일 - View가 Model을 참조
class View {
  constructor(model) {
    this.model = model; // View가 Model을 직접 참조
  }

  render() {
    const data = this.model.getData(); // Model에서 직접 데이터 읽기
    // 렌더링...
  }
}
```

위 코드는 View가 Model에 의존하여 테스트가 어렵고, View와 Model 간 결합도가 높다.

### 기본 구현

MVP 패턴은 View와 Model을 완전히 분리하고 Presenter가 모든 상호작용을 처리한다.

```javascript
// Model: 데이터와 비즈니스 로직
class CounterModel {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
    return this.count;
  }

  decrement() {
    this.count--;
    return this.count;
  }

  reset() {
    this.count = 0;
    return this.count;
  }

  getCount() {
    return this.count;
  }
}

// View 인터페이스 (Presenter가 기대하는 View의 메서드)
class CounterView {
  constructor() {
    this.display = document.getElementById("counter-display");
    this.incrementBtn = document.getElementById("increment-btn");
    this.decrementBtn = document.getElementById("decrement-btn");
    this.resetBtn = document.getElementById("reset-btn");
  }

  // View는 화면 업데이트만 담당
  updateDisplay(count) {
    this.display.textContent = count;
  }

  // 사용자 입력을 Presenter에 전달
  bindIncrement(handler) {
    this.incrementBtn.addEventListener("click", handler);
  }

  bindDecrement(handler) {
    this.decrementBtn.addEventListener("click", handler);
  }

  bindReset(handler) {
    this.resetBtn.addEventListener("click", handler);
  }
}

// Presenter: View와 Model 사이의 중재자
class CounterPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // View의 이벤트와 Presenter 메서드 바인딩
    this.view.bindIncrement(() => this.increment());
    this.view.bindDecrement(() => this.decrement());
    this.view.bindReset(() => this.reset());

    // 초기 화면 업데이트
    this.updateView();
  }

  increment() {
    const newCount = this.model.increment();
    this.updateView();
  }

  decrement() {
    const newCount = this.model.decrement();
    this.updateView();
  }

  reset() {
    const newCount = this.model.reset();
    this.updateView();
  }

  updateView() {
    const count = this.model.getCount();
    this.view.updateDisplay(count);
  }
}

// 애플리케이션 초기화
const model = new CounterModel();
const view = new CounterView();
const presenter = new CounterPresenter(model, view);
```

View는 화면 업데이트(`updateDisplay`)와 이벤트 바인딩만 담당하며 Model을 전혀 알지 못한다. Presenter가 사용자 입력을 받아 Model을 업데이트하고, Model의 데이터를 View에 전달한다. 이를 통해 View와 Model이 완전히 분리된다.

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 View 인터페이스를 명시적으로 정의할 수 있다.

```typescript
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

// View 인터페이스
interface ITodoView {
  displayTodos(todos: Todo[]): void;
  clearInput(): void;
  bindAddTodo(handler: (text: string) => void): void;
  bindToggleTodo(handler: (id: number) => void): void;
  bindRemoveTodo(handler: (id: number) => void): void;
}

// View 구현
class TodoView implements ITodoView {
  private app: HTMLElement;
  private input: HTMLInputElement;
  private addButton: HTMLButtonElement;
  private todoList: HTMLUListElement;
  private toggleHandler: (id: number) => void = () => {};
  private removeHandler: (id: number) => void = () => {};

  constructor() {
    this.app = document.getElementById("todo-app")!;

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "할 일을 입력하세요";

    this.addButton = document.createElement("button");
    this.addButton.textContent = "추가";

    this.todoList = document.createElement("ul");

    this.app.append(this.input, this.addButton, this.todoList);
  }

  displayTodos(todos: Todo[]): void {
    this.todoList.innerHTML = "";

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = todo.completed ? "completed" : "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => this.toggleHandler(todo.id));

      const span = document.createElement("span");
      span.textContent = todo.text;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.addEventListener("click", () => this.removeHandler(todo.id));

      li.append(checkbox, span, deleteBtn);
      this.todoList.appendChild(li);
    });
  }

  clearInput(): void {
    this.input.value = "";
  }

  bindAddTodo(handler: (text: string) => void): void {
    this.addButton.addEventListener("click", () => {
      const text = this.input.value.trim();
      if (text) {
        handler(text);
      }
    });

    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const text = this.input.value.trim();
        if (text) {
          handler(text);
        }
      }
    });
  }

  bindToggleTodo(handler: (id: number) => void): void {
    this.toggleHandler = handler;
  }

  bindRemoveTodo(handler: (id: number) => void): void {
    this.removeHandler = handler;
  }
}

// Presenter
class TodoPresenter {
  constructor(
    private model: TodoModel,
    private view: ITodoView
  ) {
    this.view.bindAddTodo((text) => this.handleAddTodo(text));
    this.view.bindToggleTodo((id) => this.handleToggleTodo(id));
    this.view.bindRemoveTodo((id) => this.handleRemoveTodo(id));

    this.updateView();
  }

  private handleAddTodo(text: string): void {
    this.model.addTodo(text);
    this.view.clearInput();
    this.updateView();
  }

  private handleToggleTodo(id: number): void {
    this.model.toggleTodo(id);
    this.updateView();
  }

  private handleRemoveTodo(id: number): void {
    this.model.removeTodo(id);
    this.updateView();
  }

  private updateView(): void {
    const todos = this.model.getTodos();
    this.view.displayTodos(todos);
  }
}

// 애플리케이션 초기화
const todoModel = new TodoModel();
const todoView = new TodoView();
const todoPresenter = new TodoPresenter(todoModel, todoView);
```

`ITodoView` 인터페이스를 통해 Presenter가 기대하는 View의 메서드를 명시적으로 정의한다. Presenter는 구체적인 View 구현이 아닌 인터페이스에 의존하므로, View를 쉽게 교체하거나 Mock 객체로 대체하여 테스트할 수 있다.

### 실제 사용 예제: 로그인 폼

```typescript
// Model
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  message: string;
  user?: { email: string; name: string };
}

class AuthModel {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 간단한 유효성 검사
    if (
      credentials.email === "user@example.com" &&
      credentials.password === "password123"
    ) {
      return {
        success: true,
        message: "로그인 성공!",
        user: { email: credentials.email, name: "John Doe" },
      };
    } else {
      return {
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 6;
  }
}

// View 인터페이스
interface ILoginView {
  getEmail(): string;
  getPassword(): string;
  showError(message: string): void;
  showSuccess(message: string): void;
  showLoading(loading: boolean): void;
  clearForm(): void;
  bindLogin(handler: () => void): void;
}

// View 구현
class LoginView implements ILoginView {
  private form: HTMLFormElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private messageDiv: HTMLDivElement;

  constructor() {
    this.createUI();
  }

  private createUI(): void {
    this.form = document.createElement("form");
    this.form.className = "login-form";

    this.emailInput = document.createElement("input");
    this.emailInput.type = "email";
    this.emailInput.placeholder = "이메일";
    this.emailInput.required = true;

    this.passwordInput = document.createElement("input");
    this.passwordInput.type = "password";
    this.passwordInput.placeholder = "비밀번호";
    this.passwordInput.required = true;

    this.submitButton = document.createElement("button");
    this.submitButton.type = "submit";
    this.submitButton.textContent = "로그인";

    this.messageDiv = document.createElement("div");
    this.messageDiv.className = "message";

    this.form.append(
      this.emailInput,
      this.passwordInput,
      this.submitButton,
      this.messageDiv
    );

    document.getElementById("app")?.appendChild(this.form);
  }

  getEmail(): string {
    return this.emailInput.value.trim();
  }

  getPassword(): string {
    return this.passwordInput.value;
  }

  showError(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.className = "message error";
  }

  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.className = "message success";
  }

  showLoading(loading: boolean): void {
    this.submitButton.disabled = loading;
    this.submitButton.textContent = loading ? "로그인 중..." : "로그인";
  }

  clearForm(): void {
    this.emailInput.value = "";
    this.passwordInput.value = "";
  }

  bindLogin(handler: () => void): void {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
    });
  }
}

// Presenter
class LoginPresenter {
  constructor(
    private model: AuthModel,
    private view: ILoginView
  ) {
    this.view.bindLogin(() => this.handleLogin());
  }

  private async handleLogin(): Promise<void> {
    const email = this.view.getEmail();
    const password = this.view.getPassword();

    // 사용자 입력 유효성 검사
    if (!this.model.validateEmail(email)) {
      this.view.showError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (!this.model.validatePassword(password)) {
      this.view.showError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    // 로그인 시도
    this.view.showLoading(true);

    try {
      const result = await this.model.login({ email, password });

      this.view.showLoading(false);

      if (result.success) {
        this.view.showSuccess(result.message);
        this.view.clearForm();
        console.log("로그인한 사용자:", result.user);
      } else {
        this.view.showError(result.message);
      }
    } catch (error) {
      this.view.showLoading(false);
      this.view.showError("로그인 중 오류가 발생했습니다.");
    }
  }
}

// 애플리케이션 초기화
const authModel = new AuthModel();
const loginView = new LoginView();
const loginPresenter = new LoginPresenter(authModel, loginView);
```

로그인 폼은 MVP 패턴을 통해 각 역할을 명확히 분리한다. View는 입력 값을 가져오고 메시지를 표시하는 것만 담당하며, Presenter가 유효성 검사와 로그인 로직을 처리한다. Model은 실제 인증 로직과 유효성 검사 규칙을 구현한다.

## MVP 패턴의 장점

MVP 패턴을 사용하면 **View와 Model의 완전한 분리**가 가능하다. View는 Model을 전혀 알지 못하므로 결합도가 매우 낮다.

**테스트 용이성**도 MVP 패턴의 중요한 장점이다. Presenter는 View 인터페이스에만 의존하므로 Mock View를 사용하여 쉽게 테스트할 수 있다.

**View의 재사용성 향상**도 가능하다. 동일한 View 인터페이스를 구현하면 웹, 모바일, 데스크톱 등 다양한 플랫폼에서 같은 Presenter를 사용할 수 있다.

**비즈니스 로직의 집중화**를 통해 Presenter에 모든 로직이 모여 있어 관리가 쉽다.

## MVP 패턴의 단점

MVP 패턴을 사용할 때는 **코드량 증가** 문제를 고려해야 한다. View 인터페이스를 정의하고 Presenter를 만들어야 하므로 코드가 많아진다.

**Presenter의 비대화** 위험도 존재한다. 복잡한 UI는 Presenter에 많은 로직이 집중되어 관리가 어려워질 수 있다.

**View와 Presenter의 1:1 관계**도 단점이 될 수 있다. 각 View마다 Presenter가 필요하므로 클래스 수가 늘어난다.

**학습 곡선**이 MVC보다 높을 수 있다. 인터페이스 기반 설계와 의존성 주입 등의 개념을 이해해야 한다.

## MVP 패턴 사용 시 고려사항

MVP 패턴은 **테스트가 중요한 프로젝트**에 유용하다. Presenter를 단위 테스트하기 쉬워 TDD(테스트 주도 개발)에 적합하다.

**여러 플랫폼을 지원해야 하는 경우**에도 MVP 패턴이 적합하다. View 인터페이스만 구현하면 동일한 비즈니스 로직을 재사용할 수 있다.

**복잡한 UI 로직이 있는 경우**라면 MVP 패턴을 고려해볼 만하다. Presenter가 모든 로직을 처리하므로 View가 단순해진다.

반면 **간단한 CRUD 애플리케이션**에는 MVP 패턴이 과도할 수 있다. MVC나 더 간단한 패턴으로 충분할 수 있다. **실시간 양방향 바인딩이 필요한 경우**에는 MVVM 패턴이 더 적합할 수 있다. **현대 프레임워크를 사용하는 경우**에는 React, Vue, Angular의 컴포넌트 기반 구조가 더 자연스러울 수 있다.

MVP 패턴은 View와 Model을 완전히 분리하고 테스트 가능한 구조를 만드는 데 매우 효과적인 아키텍처 패턴이다.
