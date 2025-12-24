---
title: "노출 모듈 패턴 (Revealing Module Pattern)"
summary: "TypeScript/JavaScript에서 노출 모듈 패턴 구현"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

노출 모듈 패턴(Revealing Module Pattern)은 **모듈의 private 변수와 함수를 캡슐화하고, public API만 선택적으로 노출**하는 JavaScript 디자인 패턴이다. 모듈 패턴의 변형으로, 더 명확하고 읽기 쉬운 구조를 제공한다.

이 패턴은 전역 네임스페이스 오염을 방지하고, 데이터 은닉을 구현하며, 명시적인 public 인터페이스를 제공한다. ES6 이전의 JavaScript에서 모듈화를 구현하는 주요 방법이었으며, 현재도 특정 상황에서 유용하게 사용된다.

## JavaScript로 노출 모듈 패턴 구현하기

전역 스코프에 변수와 함수를 선언하면 이름 충돌과 의도하지 않은 수정이 발생할 수 있다.

```javascript
// 전역 스코프 오염
var counter = 0;

function increment() {
  counter++;
}

function getCount() {
  return counter;
}

// 다른 코드에서 실수로 수정 가능
counter = 100; // 의도하지 않은 수정
```

위 코드는 모든 변수와 함수가 전역 스코프에 노출되어 외부에서 자유롭게 접근하고 수정할 수 있다.

### 기본 구현

노출 모듈 패턴은 즉시 실행 함수(IIFE)와 클로저를 활용하여 private 멤버를 보호한다.

```javascript
const counterModule = (function () {
  // Private 변수와 함수
  let counter = 0;

  function logChange(action) {
    console.log(`[로그] ${action}: counter = ${counter}`);
  }

  // Public 함수들
  function increment() {
    counter++;
    logChange("증가");
  }

  function decrement() {
    counter--;
    logChange("감소");
  }

  function getCount() {
    return counter;
  }

  function reset() {
    counter = 0;
    logChange("초기화");
  }

  // Public API 노출
  return {
    increment: increment,
    decrement: decrement,
    getCount: getCount,
    reset: reset,
  };
})();

// 사용 예제
console.log(counterModule.getCount()); // 0
counterModule.increment(); // [로그] 증가: counter = 1
counterModule.increment(); // [로그] 증가: counter = 2
console.log(counterModule.getCount()); // 2

// Private 변수에 직접 접근 불가
console.log(counterModule.counter); // undefined
console.log(counterModule.logChange); // undefined
```

즉시 실행 함수 내부의 `counter`와 `logChange`는 외부에서 접근할 수 없으며, `return`문을 통해 명시적으로 노출한 메서드만 사용할 수 있다. 이를 통해 데이터 은닉과 캡슐화를 구현한다.

### 설정 객체 패턴

노출 모듈 패턴은 설정 가능한 모듈을 만들 때 유용하다.

```javascript
const calculatorModule = (function () {
  // Private 변수
  let precision = 2;
  let history = [];

  // Private 함수
  function round(value) {
    return Number(value.toFixed(precision));
  }

  function addToHistory(operation, result) {
    history.push({
      operation,
      result,
      timestamp: new Date(),
    });
  }

  // Public 함수
  function add(a, b) {
    const result = round(a + b);
    addToHistory(`${a} + ${b}`, result);
    return result;
  }

  function subtract(a, b) {
    const result = round(a - b);
    addToHistory(`${a} - ${b}`, result);
    return result;
  }

  function multiply(a, b) {
    const result = round(a * b);
    addToHistory(`${a} × ${b}`, result);
    return result;
  }

  function divide(a, b) {
    if (b === 0) {
      console.error("0으로 나눌 수 없습니다");
      return null;
    }
    const result = round(a / b);
    addToHistory(`${a} ÷ ${b}`, result);
    return result;
  }

  function setPrecision(value) {
    if (value >= 0 && value <= 10) {
      precision = value;
      console.log(`정밀도 설정: ${precision}자리`);
    }
  }

  function getHistory() {
    return [...history]; // 복사본 반환
  }

  function clearHistory() {
    history = [];
    console.log("계산 기록 삭제됨");
  }

  // Public API
  return {
    add,
    subtract,
    multiply,
    divide,
    setPrecision,
    getHistory,
    clearHistory,
  };
})();

// 사용 예제
console.log(calculatorModule.add(10.5, 20.7)); // 31.2
console.log(calculatorModule.multiply(3.14159, 2)); // 6.28

calculatorModule.setPrecision(4);
console.log(calculatorModule.divide(10, 3)); // 3.3333

console.log("\n계산 기록:");
calculatorModule.getHistory().forEach((item) => {
  console.log(`${item.operation} = ${item.result}`);
});
```

Private 변수 `precision`과 `history`는 외부에서 직접 수정할 수 없으며, `setPrecision`과 `clearHistory` 같은 public 메서드를 통해서만 제어할 수 있다. `getHistory`는 배열의 복사본을 반환하여 원본 데이터를 보호한다.

### TypeScript로 타입 안전성 강화하기

TypeScript에서는 모듈 패턴과 함께 타입을 명시할 수 있다.

```typescript
interface UserModule {
  register(username: string, email: string): boolean;
  login(username: string, password: string): boolean;
  logout(): void;
  getCurrentUser(): string | null;
  isLoggedIn(): boolean;
}

const userModule = (function (): UserModule {
  // Private 변수
  interface User {
    username: string;
    email: string;
    password: string;
  }

  let users: Map<string, User> = new Map();
  let currentUser: string | null = null;

  // Private 함수
  function hashPassword(password: string): string {
    // 실제로는 bcrypt 등 사용
    return `hashed_${password}`;
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function logActivity(action: string): void {
    console.log(`[${new Date().toISOString()}] ${action}`);
  }

  // Public 함수
  function register(username: string, email: string): boolean {
    if (users.has(username)) {
      console.error("이미 존재하는 사용자명입니다");
      return false;
    }

    if (!validateEmail(email)) {
      console.error("잘못된 이메일 형식입니다");
      return false;
    }

    const password = hashPassword("default123");
    users.set(username, { username, email, password });
    logActivity(`사용자 등록: ${username}`);
    return true;
  }

  function login(username: string, password: string): boolean {
    const user = users.get(username);
    if (!user) {
      console.error("사용자를 찾을 수 없습니다");
      return false;
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      console.error("비밀번호가 일치하지 않습니다");
      return false;
    }

    currentUser = username;
    logActivity(`로그인: ${username}`);
    return true;
  }

  function logout(): void {
    if (currentUser) {
      logActivity(`로그아웃: ${currentUser}`);
      currentUser = null;
    }
  }

  function getCurrentUser(): string | null {
    return currentUser;
  }

  function isLoggedIn(): boolean {
    return currentUser !== null;
  }

  // Public API
  return {
    register,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
  };
})();

// 사용 예제
userModule.register("john", "john@example.com");
userModule.login("john", "default123");
console.log(`현재 사용자: ${userModule.getCurrentUser()}`);
console.log(`로그인 상태: ${userModule.isLoggedIn()}`);
userModule.logout();

// Private 데이터에 접근 불가
// console.log(userModule.users); // 타입 오류
// console.log(userModule.hashPassword("test")); // 타입 오류
```

인터페이스를 통해 모듈의 public API를 명시적으로 정의하고, TypeScript 컴파일러가 타입 검사를 수행한다. Private 멤버는 반환 타입에 포함되지 않으므로 외부에서 접근할 수 없다.

### 실제 사용 예제: API 클라이언트

```typescript
interface APIClient {
  get(endpoint: string): Promise<any>;
  post(endpoint: string, data: any): Promise<any>;
  setBaseURL(url: string): void;
  setAuthToken(token: string): void;
}

const apiClient = (function (): APIClient {
  // Private 변수
  let baseURL: string = "https://api.example.com";
  let authToken: string | null = null;
  let requestCount: number = 0;

  // Private 함수
  function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    return headers;
  }

  function logRequest(method: string, endpoint: string): void {
    requestCount++;
    console.log(
      `[요청 #${requestCount}] ${method} ${baseURL}${endpoint}`
    );
  }

  async function handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error(`HTTP 오류: ${response.status}`);
    }
    return response.json();
  }

  // Public 함수
  async function get(endpoint: string): Promise<any> {
    logRequest("GET", endpoint);
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  }

  async function post(endpoint: string, data: any): Promise<any> {
    logRequest("POST", endpoint);
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  function setBaseURL(url: string): void {
    baseURL = url;
    console.log(`Base URL 설정: ${baseURL}`);
  }

  function setAuthToken(token: string): void {
    authToken = token;
    console.log("인증 토큰 설정됨");
  }

  // Public API
  return {
    get,
    post,
    setBaseURL,
    setAuthToken,
  };
})();

// 사용 예제
apiClient.setBaseURL("https://jsonplaceholder.typicode.com");

async function fetchData() {
  try {
    const users = await apiClient.get("/users");
    console.log(`사용자 ${users.length}명 조회됨`);

    const newPost = await apiClient.post("/posts", {
      title: "Test Post",
      body: "This is a test",
      userId: 1,
    });
    console.log("새 게시물 생성됨:", newPost.id);
  } catch (error) {
    console.error("API 오류:", error);
  }
}
```

API 클라이언트는 baseURL, authToken, requestCount 같은 내부 상태를 private으로 유지하며, public 메서드를 통해서만 제어할 수 있다. 헤더 설정, 응답 처리 같은 내부 로직은 외부에서 알 필요가 없으므로 캡슐화된다.

### ES6 모듈과의 비교

ES6 이후로는 네이티브 모듈 시스템을 사용할 수 있다.

```typescript
// es6-module.ts
let counter = 0;

function logChange(action: string): void {
  console.log(`[로그] ${action}: counter = ${counter}`);
}

export function increment(): void {
  counter++;
  logChange("증가");
}

export function decrement(): void {
  counter--;
  logChange("감소");
}

export function getCount(): number {
  return counter;
}

export function reset(): void {
  counter = 0;
  logChange("초기화");
}

// 사용
// import { increment, getCount } from './es6-module';
```

ES6 모듈은 파일 레벨에서 캡슐화를 제공하며, `export` 키워드로 명시적으로 내보낸 것만 외부에서 사용할 수 있다. 노출 모듈 패턴과 유사한 효과를 더 간단한 문법으로 구현할 수 있다.

## 노출 모듈 패턴의 장점

노출 모듈 패턴을 사용하면 **명확한 public API**를 제공할 수 있다. 반환 객체에서 어떤 메서드가 public인지 명확하게 확인할 수 있어 코드 가독성이 향상된다.

**데이터 은닉과 캡슐화**가 잘 구현된다는 점도 중요한 장점이다. Private 변수와 함수는 클로저를 통해 보호되어 외부에서 접근할 수 없다.

**전역 네임스페이스 오염 방지**도 노출 모듈 패턴의 장점이다. 모든 코드가 IIFE 내부에 있어 전역 스코프에는 모듈 객체 하나만 생성된다.

**일관된 네이밍**을 유지할 수 있다. Public 함수 이름과 반환 객체의 키를 동일하게 사용하여 혼란을 줄일 수 있다.

## 노출 모듈 패턴의 단점

노출 모듈 패턴을 사용할 때는 **메서드 오버라이드 불가** 문제를 고려해야 한다. 반환된 객체의 메서드는 private 함수를 참조하므로 외부에서 오버라이드해도 private 함수는 변경되지 않는다.

**테스트 어려움**도 단점이 될 수 있다. Private 함수를 직접 테스트할 수 없어 public API를 통한 간접 테스트만 가능하다.

**메모리 사용**도 고려해야 한다. 모듈이 생성될 때 클로저가 형성되어 모든 함수가 메모리에 유지된다.

**ES6 이후에는 네이티브 모듈이 더 나은 선택**일 수 있다. `import/export` 구문이 더 표준적이고 도구 지원도 좋다.

## 노출 모듈 패턴 사용 시 고려사항

노출 모듈 패턴은 **싱글톤 모듈이 필요한 경우**에 유용하다. 애플리케이션 전체에서 하나의 인스턴스만 필요한 설정, 상태 관리, 유틸리티 모듈에 적합하다.

**레거시 코드베이스나 ES5 환경**에서도 노출 모듈 패턴이 적합하다. ES6 모듈을 사용할 수 없는 환경에서 모듈화를 구현할 수 있다.

**명확한 public/private 구분이 필요한 경우**라면 노출 모듈 패턴을 고려해볼 만하다. API 설계가 중요한 라이브러리나 프레임워크에서 어떤 메서드가 공개되는지 명확히 할 수 있다.

반면 **ES6 이상을 사용할 수 있는 환경**에서는 네이티브 모듈 시스템이 더 나은 선택일 수 있다. 표준 문법이며 트리 쉐이킹, 정적 분석 등의 이점이 있다. **클래스 기반 설계가 필요한 경우**에도 ES6 클래스와 private 필드(`#`)를 사용하는 것이 더 적합할 수 있다. **여러 인스턴스가 필요한 경우**에는 팩토리 함수나 클래스를 사용하는 것이 좋다.

노출 모듈 패턴은 JavaScript에서 캡슐화와 모듈화를 구현하는 검증된 방법이며, 특히 레거시 환경이나 싱글톤 모듈에서 여전히 유용하게 사용된다.
