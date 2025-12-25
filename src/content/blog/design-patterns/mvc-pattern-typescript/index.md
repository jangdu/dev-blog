---
title: "MVC 패턴 (Model-View-Controller Pattern)"
summary: "TypeScript에서 MVC 패턴 구현"
date: "April 15 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - Architecture
---

MVC 패턴(Model-View-Controller Pattern)은 **애플리케이션을 Model, View, Controller 세 가지 역할로 분리**하는 아키텍처 패턴이다. 각 컴포넌트가 독립적인 책임을 가지며, 관심사의 분리를 통해 유지보수성과 확장성을 높인다.

## MVC 패턴의 구성 요소

**Model**은 애플리케이션의 데이터와 비즈니스 로직을 관리한다. 데이터베이스와 통신, 유효성 검사 수행과 같은 비즈니스 로직을 구현한다. View나 Controller에 의존하지 않으며, 상태가 변경되면 View에 알림을 보낸다.

**View**는 사용자에게 보여지는 UI를 담당한다. Model의 데이터를 시각적으로 표현하며, 사용자 입력을 받아 Controller에 전달한다. View는 Model의 데이터를 읽을 수 있지만 직접 수정하지 않는다.

**Controller**는 사용자 입력을 처리하고 Model과 View를 조율한다. 사용자의 액션을 받아 Model을 업데이트하고, 필요에 따라 View를 갱신한다. 애플리케이션의 흐름을 제어하는 역할을 수행한다.

## TypeScript로 MVC 패턴 구현하기

모든 로직이 한 곳에 있으면 코드가 복잡해지고 유지보수가 어려워진다. 데이터 관리, UI 렌더링, 이벤트 처리가 모두 섞여 있으면 각 부분을 독립적으로 테스트하거나 수정하기 어렵다.

```typescript
// 모든 로직이 섞여 있는 코드
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

let todos: Todo[] = [];

const todoList = document.getElementById("todo-list") as HTMLElement;
const input = document.getElementById("todo-input") as HTMLInputElement;

function addTodo(): void {
  const text = input.value;

  if (text) {
    todos.push({ id: Date.now(), text, completed: false });
    renderTodos();
    input.value = "";
  }
}

function renderTodos(): void {
  if (!todoList) return;

  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");

    li.textContent = todo.text;
    todoList.appendChild(li);
  });
}
```

위 코드는 데이터 관리(`todos` 배열), UI 렌더링(`renderTodos`), 이벤트 처리(`addTodo`)가 모두 한 곳에 섞여 있다.

이런 방식은 데이터 구조를 변경하려면 UI 코드도 함께 수정해야 하고, UI를 변경하려면 데이터 로직도 함께 수정해야 하므로 테스트와 수정이 어렵다. 또한 여러 개발자가 동시에 작업할 때 충돌이 발생하기 쉽다.

### 기본 구현

MVC 패턴으로 각 역할을 Model, View, Controller로 분리하면 코드 구조가 명확해지고, 각 컴포넌트를 독립적으로 테스트하고 수정할 수 있다.

Model은 옵저버 패턴을 사용하여 데이터 변경 시 View에 알림을 보낸다. View는 Model의 데이터를 읽어서 화면에 표시하지만 직접 수정하지는 않는다. Controller는 사용자 입력을 받아 Model을 업데이트하고, Model의 변경 알림을 받아 View를 갱신한다.

```typescript
// Model: 비지니스 로직
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

// View: 보여지는 ui 담당
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

// Controller: Model과 View를 연결
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

위 코드에서 `TodoModel`은 데이터(`todos` 배열)와 비즈니스 로직(추가, 삭제, 토글)만 담당한다. 옵저버 패턴을 사용하여 데이터가 변경되면 등록된 리스너들에게 알림을 보낸다.

`TodoView`는 UI 렌더링과 사용자 입력만 담당한다. Model의 데이터를 받아서 화면에 표시하고, 사용자 이벤트를 Controller에 전달한다. View는 Model을 직접 수정하지 않으며, 데이터를 읽기만 한다.

`TodoController`는 Model과 View를 연결하는 중재자 역할을 한다. View로부터 사용자 입력을 받아 Model을 업데이트하고, Model의 변경 알림을 받아 View를 갱신한다. 이렇게 하면 각 컴포넌트가 독립적이어서 Model을 변경해도 View 코드를 수정할 필요가 없고, View를 변경해도 Model 코드를 수정할 필요가 없다.

## MVC 패턴의 장점

MVC 패턴을 사용하면 **관심사의 분리**가 명확해진다. 데이터 로직, UI 로직, 제어 로직이 분리되어 각각 독립적으로 개발하고 테스트할 수 있다.

Model은 여러 View에서 사용할 수 있고, View는 다른 Controller와 결합할 수 있어, **재사용성**도 향상된다.

프론트엔드 개발자는 View를 작업하고, 백엔드 개발자는 Model을 작업하는 식으로 동시에 **병렬 개발**이 가능하다는 점도 유용하다.

각 컴포넌트를 독립적으로 테스트할 수 있어 **단위 테스트 작성**이 쉬워진다.

## MVC 패턴의 단점

간단한 애플리케이션에도 세 개의 컴포넌트를 만들어야 하므로 초기 **구조가 복잡해질 수** 있다.

View가 Model을 직접 참조하는 경우 완전한 분리가 어려워져, **View와 Model의 의존성**도 문제가 될 수 있다.

복잡한 애플리케이션에서 Controller에 너무 많은 로직이 집중될 수 있다.

## MVC 패턴 사용 시 고려사항

MVC 패턴은 **중대형 규모의 애플리케이션**에 유용하다. 코드베이스가 커질수록 관심사 분리의 이점이 커진다.

**여러 개발자가 협업하는 프로젝트**에도 MVC 패턴이 적합하다. 역할이 명확히 분리되어 있어 작업 분담이 쉽다.

View를 독립적으로 수정할 수 있어 UI 변경이 다른 컴포넌트에 영향을 주지 않아 **UI가 자주 변경되는 경우** MVC 패턴이 적합할 수 있다.

반면 **매우 간단한 애플리케이션**에는 MVC 패턴이 과도할 수 있다. 단순한 페이지에는 더 간단한 구조가 적합하다. **실시간 양방향 데이터 바인딩이 필요한 경우**에는 MVVM 패턴이 더 나은 선택일 수 있다. **현대 프레임워크를 사용하는 경우**에는 React의 단방향 데이터 흐름이나 Vue의 컴포넌트 기반 구조가 더 적합할 수 있다.
