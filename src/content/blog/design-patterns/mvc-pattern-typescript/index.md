---
title: "MVC 패턴 (Model-View-Controller Pattern)"
summary: "TypeScript/JavaScript에서 MVC 패턴 구현"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
  - Architecture
---

MVC 패턴(Model-View-Controller Pattern)은 **애플리케이션을 Model, View, Controller 세 가지 역할로 분리**하는 아키텍처 패턴이다. 각 컴포넌트가 독립적인 책임을 가지며, 관심사의 분리를 통해 유지보수성과 확장성을 높인다.

Model은 데이터와 비즈니스 로직을 담당하고, View는 사용자 인터페이스를 담당하며, Controller는 사용자 입력을 처리하고 Model과 View를 연결한다. 주로 웹 애플리케이션, 데스크톱 애플리케이션, 모바일 앱 등에서 사용된다.

## MVC 패턴의 구성 요소

**Model**은 애플리케이션의 데이터와 비즈니스 로직을 관리한다. 데이터베이스와 통신하거나, 데이터 유효성 검사를 수행하거나, 비즈니스 규칙을 구현한다. View나 Controller에 의존하지 않으며, 상태가 변경되면 View에 알림을 보낸다.

**View**는 사용자에게 보여지는 UI를 담당한다. Model의 데이터를 시각적으로 표현하며, 사용자 입력을 받아 Controller에 전달한다. View는 Model의 데이터를 읽을 수 있지만 직접 수정하지 않는다.

**Controller**는 사용자 입력을 처리하고 Model과 View를 조율한다. 사용자의 액션을 받아 Model을 업데이트하고, 필요에 따라 View를 갱신한다. 애플리케이션의 흐름을 제어하는 중재자 역할을 수행한다.

## JavaScript로 MVC 패턴 구현하기

모든 로직이 한 곳에 있으면 코드가 복잡해지고 유지보수가 어려워진다.

```javascript
// 모든 로직이 섞여 있는 코드
let todos = [];
const todoList = document.getElementById("todo-list");
const input = document.getElementById("todo-input");

function addTodo() {
  const text = input.value;
  if (text) {
    todos.push({ id: Date.now(), text, completed: false });
    renderTodos();
    input.value = "";
  }
}

function renderTodos() {
  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.textContent = todo.text;
    todoList.appendChild(li);
  });
}
```

위 코드는 데이터 관리, UI 렌더링, 이벤트 처리가 모두 섞여 있어 테스트와 수정이 어렵다.

### 기본 구현

MVC 패턴으로 각 역할을 분리하면 코드 구조가 명확해진다.

```javascript
// Model: 데이터와 비즈니스 로직
class TodoModel {
  constructor() {
    this.todos = [];
    this.listeners = [];
  }

  addTodo(text) {
    const todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    this.todos.push(todo);
    this.notifyListeners();
    return todo;
  }

  removeTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.notifyListeners();
  }

  toggleTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.notifyListeners();
    }
  }

  getTodos() {
    return this.todos;
  }

  onChange(listener) {
    this.listeners.push(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.todos));
  }
}

// View: UI 렌더링
class TodoView {
  constructor() {
    this.app = document.getElementById("app");
    this.input = this.createElement("input", "todo-input");
    this.input.placeholder = "할 일을 입력하세요";

    this.addButton = this.createElement("button", "add-button");
    this.addButton.textContent = "추가";

    this.todoList = this.createElement("ul", "todo-list");

    this.app.append(this.input, this.addButton, this.todoList);
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  }

  renderTodos(todos) {
    this.todoList.innerHTML = "";

    todos.forEach((todo) => {
      const li = this.createElement("li");
      li.className = todo.completed ? "completed" : "";

      const span = this.createElement("span");
      span.textContent = todo.text;

      const deleteBtn = this.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.dataset.id = todo.id;

      li.append(span, deleteBtn);
      this.todoList.appendChild(li);

      // 토글 이벤트
      span.addEventListener("click", () => {
        this.onToggleTodo(todo.id);
      });

      // 삭제 이벤트
      deleteBtn.addEventListener("click", () => {
        this.onDeleteTodo(todo.id);
      });
    });
  }

  bindAddTodo(handler) {
    this.addButton.addEventListener("click", () => {
      const text = this.input.value.trim();
      if (text) {
        handler(text);
        this.input.value = "";
      }
    });
  }

  bindToggleTodo(handler) {
    this.onToggleTodo = handler;
  }

  bindDeleteTodo(handler) {
    this.onDeleteTodo = handler;
  }
}

// Controller: Model과 View 연결
class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // View의 이벤트를 Model 메서드와 바인딩
    this.view.bindAddTodo(this.handleAddTodo.bind(this));
    this.view.bindToggleTodo(this.handleToggleTodo.bind(this));
    this.view.bindDeleteTodo(this.handleDeleteTodo.bind(this));

    // Model의 변경을 View에 반영
    this.model.onChange((todos) => this.view.renderTodos(todos));

    // 초기 렌더링
    this.view.renderTodos(this.model.getTodos());
  }

  handleAddTodo(text) {
    this.model.addTodo(text);
  }

  handleToggleTodo(id) {
    this.model.toggleTodo(id);
  }

  handleDeleteTodo(id) {
    this.model.removeTodo(id);
  }
}

// 애플리케이션 초기화
const app = new TodoController(new TodoModel(), new TodoView());
```

Model은 데이터와 비즈니스 로직만 담당하고, View는 UI 렌더링만 담당하며, Controller는 둘을 연결한다. 각 컴포넌트가 독립적이어서 테스트와 수정이 용이하다.

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 각 컴포넌트의 인터페이스를 명확히 정의할 수 있다.

```typescript
// Model
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type TodoListener = (todos: Todo[]) => void;

class TodoModel {
  private todos: Todo[] = [];
  private listeners: TodoListener[] = [];

  addTodo(text: string): Todo {
    const todo: Todo = {
      id: Date.now(),
      text,
      completed: false,
    };
    this.todos.push(todo);
    this.notifyListeners();
    return todo;
  }

  removeTodo(id: number): void {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.notifyListeners();
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.notifyListeners();
    }
  }

  getTodos(): Todo[] {
    return [...this.todos];
  }

  onChange(listener: TodoListener): void {
    this.listeners.push(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getTodos()));
  }
}

// View
type AddTodoHandler = (text: string) => void;
type TodoActionHandler = (id: number) => void;

class TodoView {
  private app: HTMLElement;
  private input: HTMLInputElement;
  private addButton: HTMLButtonElement;
  private todoList: HTMLUListElement;
  private onToggleTodo: TodoActionHandler = () => {};
  private onDeleteTodo: TodoActionHandler = () => {};

  constructor() {
    this.app = this.getElement("#app");
    this.input = this.createElement("input") as HTMLInputElement;
    this.input.type = "text";
    this.input.placeholder = "할 일을 입력하세요";

    this.addButton = this.createElement("button") as HTMLButtonElement;
    this.addButton.textContent = "추가";

    this.todoList = this.createElement("ul") as HTMLUListElement;

    this.app.append(this.input, this.addButton, this.todoList);
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element ${selector} not found`);
    }
    return element as HTMLElement;
  }

  private createElement(tag: string): HTMLElement {
    return document.createElement(tag);
  }

  renderTodos(todos: Todo[]): void {
    this.todoList.innerHTML = "";

    todos.forEach((todo) => {
      const li = this.createElement("li") as HTMLLIElement;
      li.className = todo.completed ? "completed" : "";

      const span = this.createElement("span");
      span.textContent = todo.text;

      const deleteBtn = this.createElement("button") as HTMLButtonElement;
      deleteBtn.textContent = "삭제";

      li.append(span, deleteBtn);
      this.todoList.appendChild(li);

      span.addEventListener("click", () => {
        this.onToggleTodo(todo.id);
      });

      deleteBtn.addEventListener("click", () => {
        this.onDeleteTodo(todo.id);
      });
    });
  }

  bindAddTodo(handler: AddTodoHandler): void {
    this.addButton.addEventListener("click", () => {
      const text = this.input.value.trim();
      if (text) {
        handler(text);
        this.input.value = "";
      }
    });
  }

  bindToggleTodo(handler: TodoActionHandler): void {
    this.onToggleTodo = handler;
  }

  bindDeleteTodo(handler: TodoActionHandler): void {
    this.onDeleteTodo = handler;
  }
}

// Controller
class TodoController {
  constructor(
    private model: TodoModel,
    private view: TodoView
  ) {
    this.view.bindAddTodo(this.handleAddTodo.bind(this));
    this.view.bindToggleTodo(this.handleToggleTodo.bind(this));
    this.view.bindDeleteTodo(this.handleDeleteTodo.bind(this));

    this.model.onChange((todos) => this.view.renderTodos(todos));
    this.view.renderTodos(this.model.getTodos());
  }

  private handleAddTodo(text: string): void {
    this.model.addTodo(text);
  }

  private handleToggleTodo(id: number): void {
    this.model.toggleTodo(id);
  }

  private handleDeleteTodo(id: number): void {
    this.model.removeTodo(id);
  }
}

// 애플리케이션 초기화
const app = new TodoController(new TodoModel(), new TodoView());
```

타입 정의를 통해 각 컴포넌트 간 인터페이스가 명확해지고, 컴파일 시점에 타입 오류를 발견할 수 있다. Model의 `Todo` 타입, View의 핸들러 타입 등이 명시적으로 정의되어 있다.

### 실제 사용 예제: 사용자 관리 시스템

```typescript
// Model
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

class UserModel {
  private users: User[] = [];
  private listeners: Array<(users: User[]) => void> = [];

  async fetchUsers(): Promise<void> {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.users = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    ];
    this.notifyListeners();
  }

  addUser(user: Omit<User, "id">): void {
    const newUser: User = {
      id: Date.now(),
      ...user,
    };
    this.users.push(newUser);
    this.notifyListeners();
  }

  updateUser(id: number, updates: Partial<User>): void {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.notifyListeners();
    }
  }

  deleteUser(id: number): void {
    this.users = this.users.filter((user) => user.id !== id);
    this.notifyListeners();
  }

  getUsers(): User[] {
    return [...this.users];
  }

  onChange(listener: (users: User[]) => void): void {
    this.listeners.push(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getUsers()));
  }
}

// View
class UserView {
  private container: HTMLElement;
  private userList: HTMLElement;
  private addUserForm: HTMLFormElement;

  constructor() {
    this.container = document.getElementById("user-app")!;
    this.createUI();
  }

  private createUI(): void {
    this.addUserForm = document.createElement("form");
    this.addUserForm.innerHTML = `
      <input name="name" placeholder="이름" required />
      <input name="email" type="email" placeholder="이메일" required />
      <select name="role">
        <option value="user">사용자</option>
        <option value="admin">관리자</option>
      </select>
      <button type="submit">추가</button>
    `;

    this.userList = document.createElement("div");
    this.userList.className = "user-list";

    this.container.append(this.addUserForm, this.userList);
  }

  renderUsers(users: User[]): void {
    this.userList.innerHTML = "";

    if (users.length === 0) {
      this.userList.innerHTML = "<p>사용자가 없습니다.</p>";
      return;
    }

    users.forEach((user) => {
      const userCard = document.createElement("div");
      userCard.className = "user-card";
      userCard.innerHTML = `
        <h3>${user.name}</h3>
        <p>${user.email}</p>
        <span class="role">${user.role}</span>
        <button class="delete-btn" data-id="${user.id}">삭제</button>
      `;
      this.userList.appendChild(userCard);
    });
  }

  bindAddUser(handler: (user: Omit<User, "id">) => void): void {
    this.addUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(this.addUserForm);
      const user = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as "admin" | "user",
      };
      handler(user);
      this.addUserForm.reset();
    });
  }

  bindDeleteUser(handler: (id: number) => void): void {
    this.userList.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("delete-btn")) {
        const id = parseInt(target.dataset.id!);
        handler(id);
      }
    });
  }
}

// Controller
class UserController {
  constructor(
    private model: UserModel,
    private view: UserView
  ) {
    this.view.bindAddUser(this.handleAddUser.bind(this));
    this.view.bindDeleteUser(this.handleDeleteUser.bind(this));

    this.model.onChange((users) => this.view.renderUsers(users));

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.model.fetchUsers();
  }

  private handleAddUser(user: Omit<User, "id">): void {
    this.model.addUser(user);
  }

  private handleDeleteUser(id: number): void {
    if (confirm("정말 삭제하시겠습니까?")) {
      this.model.deleteUser(id);
    }
  }
}
```

사용자 관리 시스템은 MVC 패턴을 통해 데이터 관리(Model), UI 렌더링(View), 사용자 액션 처리(Controller)를 명확히 분리한다. Model은 API 호출과 데이터 관리를 담당하고, View는 폼과 사용자 목록을 렌더링하며, Controller는 이벤트를 처리한다.

## MVC 패턴의 장점

MVC 패턴을 사용하면 **관심사의 분리**가 명확해진다. 데이터 로직, UI 로직, 제어 로직이 분리되어 각각 독립적으로 개발하고 테스트할 수 있다.

**재사용성 향상**도 MVC 패턴의 중요한 장점이다. Model은 여러 View에서 사용할 수 있고, View는 다른 Controller와 결합할 수 있다.

**병렬 개발**이 가능하다는 점도 유용하다. 프론트엔드 개발자는 View를 작업하고, 백엔드 개발자는 Model을 작업하는 식으로 동시에 개발할 수 있다.

**테스트 용이성**도 향상된다. 각 컴포넌트를 독립적으로 테스트할 수 있어 단위 테스트 작성이 쉬워진다.

## MVC 패턴의 단점

MVC 패턴을 사용할 때는 **복잡도 증가** 문제를 고려해야 한다. 간단한 애플리케이션에도 세 개의 컴포넌트를 만들어야 하므로 초기 구조가 복잡해질 수 있다.

**View와 Model의 의존성**도 문제가 될 수 있다. View가 Model을 직접 참조하는 경우 완전한 분리가 어려울 수 있다.

**Controller의 비대화** 위험도 존재한다. 복잡한 애플리케이션에서 Controller에 너무 많은 로직이 집중될 수 있다.

## MVC 패턴 사용 시 고려사항

MVC 패턴은 **중대형 규모의 애플리케이션**에 유용하다. 코드베이스가 커질수록 관심사 분리의 이점이 커진다.

**여러 개발자가 협업하는 프로젝트**에도 MVC 패턴이 적합하다. 역할이 명확히 분리되어 있어 작업 분담이 쉽다.

**UI가 자주 변경되는 경우**라면 MVC 패턴을 고려해볼 만하다. View를 독립적으로 수정할 수 있어 UI 변경이 다른 컴포넌트에 영향을 주지 않는다.

반면 **매우 간단한 애플리케이션**에는 MVC 패턴이 과도할 수 있다. 단순한 페이지에는 더 간단한 구조가 적합하다. **실시간 양방향 데이터 바인딩이 필요한 경우**에는 MVVM 패턴이 더 나은 선택일 수 있다. **현대 프레임워크를 사용하는 경우**에는 React의 단방향 데이터 흐름이나 Vue의 컴포넌트 기반 구조가 더 적합할 수 있다.

MVC 패턴은 관심사의 분리를 통해 유지보수성과 확장성을 높이는 검증된 아키텍처 패턴이다.
