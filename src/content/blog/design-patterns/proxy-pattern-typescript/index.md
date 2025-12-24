---
title: "프록시 패턴과 프록시 서버 (Proxy Pattern & Proxy Server)"
summary: "TypeScript/JavaScript에서 프록시 패턴 구현과 프록시 서버 개념"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
  - Network
---

프록시 패턴(Proxy Pattern)은 **다른 객체에 대한 접근을 제어하기 위해 대리자나 placeholder를 제공**하는 구조 디자인 패턴이다. 프록시 객체는 실제 객체와 동일한 인터페이스를 구현하며, 실제 객체로의 접근을 제어하거나 추가 기능을 제공한다.

이 패턴은 객체 생성 비용이 크거나, 접근 제어가 필요하거나, 원격 객체에 접근해야 할 때 유용하다. 주로 지연 초기화, 접근 제어, 로깅, 캐싱 등에서 사용된다.

## JavaScript로 프록시 패턴 구현하기

실제 객체에 직접 접근하면 불필요한 리소스 사용이나 보안 문제가 발생할 수 있다.

```javascript
class ExpensiveObject {
  constructor() {
    console.log("무거운 초기화 작업 수행 중...");
    // 많은 리소스를 사용하는 초기화
    this.data = this.loadLargeData();
  }

  loadLargeData() {
    // 시간이 오래 걸리는 작업
    return "대용량 데이터";
  }

  process() {
    console.log(`데이터 처리: ${this.data}`);
  }
}

// 사용하지 않아도 즉시 생성됨
const obj = new ExpensiveObject(); // 무거운 초기화 작업 수행 중...
```

위 코드는 객체가 필요하지 않은 시점에도 즉시 생성되어 리소스를 낭비한다.

### 기본 구현 - 가상 프록시

가상 프록시는 실제 객체의 생성을 필요한 시점까지 지연시킨다.

```javascript
class ExpensiveObject {
  constructor() {
    console.log("ExpensiveObject 초기화");
    this.data = this.loadLargeData();
  }

  loadLargeData() {
    console.log("대용량 데이터 로딩...");
    return "대용량 데이터";
  }

  process() {
    console.log(`데이터 처리: ${this.data}`);
  }
}

class ExpensiveObjectProxy {
  constructor() {
    this.realObject = null;
  }

  process() {
    // 실제로 사용될 때만 객체 생성
    if (!this.realObject) {
      console.log("프록시: 실제 객체 생성");
      this.realObject = new ExpensiveObject();
    }
    this.realObject.process();
  }
}

// 사용 예제
console.log("프록시 생성");
const proxy = new ExpensiveObjectProxy(); // 실제 객체는 아직 생성되지 않음

console.log("\n첫 번째 호출");
proxy.process(); // 이 시점에 실제 객체 생성

console.log("\n두 번째 호출");
proxy.process(); // 이미 생성된 객체 재사용
```

프록시는 즉시 생성되지만 가볍고, 실제 무거운 객체는 `process` 메서드가 처음 호출될 때만 생성된다. 이를 통해 불필요한 리소스 사용을 방지할 수 있다.

### 보호 프록시

보호 프록시는 객체에 대한 접근 권한을 제어한다.

```javascript
class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }

  withdraw(amount) {
    if (amount <= this.balance) {
      this.balance -= amount;
      console.log(`${amount}원 출금. 잔액: ${this.balance}원`);
      return true;
    }
    console.log("잔액 부족");
    return false;
  }

  deposit(amount) {
    this.balance += amount;
    console.log(`${amount}원 입금. 잔액: ${this.balance}원`);
  }

  getBalance() {
    return this.balance;
  }
}

class BankAccountProxy {
  constructor(balance, user) {
    this.account = new BankAccount(balance);
    this.user = user;
  }

  withdraw(amount) {
    if (!this.checkPermission("withdraw")) {
      console.log("출금 권한이 없습니다.");
      return false;
    }
    return this.account.withdraw(amount);
  }

  deposit(amount) {
    if (!this.checkPermission("deposit")) {
      console.log("입금 권한이 없습니다.");
      return false;
    }
    return this.account.deposit(amount);
  }

  getBalance() {
    if (!this.checkPermission("view")) {
      console.log("잔액 조회 권한이 없습니다.");
      return null;
    }
    return this.account.getBalance();
  }

  checkPermission(action) {
    // 실제로는 더 복잡한 권한 체크 로직
    if (this.user.role === "admin") return true;
    if (this.user.role === "owner") return true;
    if (this.user.role === "guest" && action === "view") return true;
    return false;
  }
}

// 사용 예제
const owner = { role: "owner", name: "Kim" };
const guest = { role: "guest", name: "Lee" };

const ownerAccount = new BankAccountProxy(100000, owner);
ownerAccount.deposit(50000);
ownerAccount.withdraw(30000);

const guestAccount = new BankAccountProxy(100000, guest);
console.log(`잔액: ${guestAccount.getBalance()}원`);
guestAccount.withdraw(10000); // 권한 없음
```

보호 프록시는 사용자 권한에 따라 실제 객체의 메서드 접근을 제어한다. 권한이 없는 사용자는 특정 작업을 수행할 수 없으며, 프록시가 이를 검증한다.

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 프록시와 실제 객체가 동일한 인터페이스를 구현하도록 강제할 수 있다.

```typescript
interface Image {
  display(): void;
  getSize(): number;
}

class RealImage implements Image {
  private filename: string;
  private size: number;

  constructor(filename: string) {
    this.filename = filename;
    this.size = 0;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`디스크에서 이미지 로딩: ${this.filename}`);
    // 시뮬레이션: 파일 크기 계산
    this.size = Math.floor(Math.random() * 1000) + 100;
    console.log(`로딩 완료: ${this.size}KB`);
  }

  display(): void {
    console.log(`이미지 표시: ${this.filename}`);
  }

  getSize(): number {
    return this.size;
  }
}

class ImageProxy implements Image {
  private realImage: RealImage | null = null;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    console.log(`이미지 프록시 생성: ${filename}`);
  }

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }

  getSize(): number {
    if (!this.realImage) {
      // 실제 이미지를 로드하지 않고 메타데이터만 반환
      console.log("메타데이터에서 크기 조회");
      return 0;
    }
    return this.realImage.getSize();
  }
}

// 사용 예제
const images: Image[] = [
  new ImageProxy("photo1.jpg"),
  new ImageProxy("photo2.jpg"),
  new ImageProxy("photo3.jpg"),
];

console.log("\n이미지 목록 생성 완료\n");

// 첫 번째 이미지만 실제로 표시
console.log("첫 번째 이미지 표시:");
images[0].display();

console.log("\n두 번째 이미지 크기 조회:");
console.log(`크기: ${images[1].getSize()}KB`);
```

`Image` 인터페이스를 통해 프록시와 실제 객체가 동일한 메서드를 제공하도록 보장한다. 프록시를 사용하는지 실제 객체를 사용하는지 알 필요 없이 동일한 방식으로 사용할 수 있다.

### JavaScript Proxy 객체 활용

JavaScript ES6에서 제공하는 `Proxy` 객체를 사용하면 더 강력한 프록시를 만들 수 있다.

```typescript
interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

const user: User = {
  name: "John Doe",
  email: "john@example.com",
  password: "secret123",
  role: "admin",
};

const userProxy = new Proxy(user, {
  get(target, property: string) {
    if (property === "password") {
      console.log("경고: 비밀번호 접근 시도");
      return "********";
    }
    console.log(`속성 접근: ${property}`);
    return target[property as keyof User];
  },

  set(target, property: string, value) {
    if (property === "role") {
      console.log("역할 변경 시도 - 관리자 승인 필요");
      return false;
    }
    if (property === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        console.log("잘못된 이메일 형식");
        return false;
      }
    }
    console.log(`속성 설정: ${property} = ${value}`);
    target[property as keyof User] = value;
    return true;
  },
});

// 사용 예제
console.log(userProxy.name); // 속성 접근: name
console.log(userProxy.password); // 경고 출력, ******** 반환

userProxy.email = "newemail@example.com"; // 유효성 검사 통과
userProxy.email = "invalid-email"; // 유효성 검사 실패
userProxy.role = "user"; // 설정 거부
```

JavaScript의 `Proxy` 객체는 속성 접근, 설정, 삭제 등 다양한 작업을 가로채서 처리할 수 있다. 유효성 검사, 로깅, 접근 제어 등을 쉽게 구현할 수 있으며, 별도의 프록시 클래스를 만들 필요가 없다.

### 캐싱 프록시

캐싱 프록시는 비용이 큰 연산의 결과를 저장하여 성능을 향상시킨다.

```typescript
interface DataService {
  fetchData(id: string): Promise<any>;
}

class RealDataService implements DataService {
  async fetchData(id: string): Promise<any> {
    console.log(`API 호출: 데이터 ${id} 가져오는 중...`);
    // 시뮬레이션: 네트워크 지연
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id,
      data: `데이터 내용 ${id}`,
      timestamp: new Date(),
    };
  }
}

class CachingDataServiceProxy implements DataService {
  private realService: DataService;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheDuration: number;

  constructor(realService: DataService, cacheDurationMs: number = 5000) {
    this.realService = realService;
    this.cache = new Map();
    this.cacheDuration = cacheDurationMs;
  }

  async fetchData(id: string): Promise<any> {
    const cached = this.cache.get(id);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      console.log(`캐시 히트: 데이터 ${id}`);
      return cached.data;
    }

    console.log(`캐시 미스: 데이터 ${id}`);
    const data = await this.realService.fetchData(id);
    this.cache.set(id, { data, timestamp: now });
    return data;
  }

  clearCache(): void {
    console.log("캐시 초기화");
    this.cache.clear();
  }
}

// 사용 예제
async function demo() {
  const service = new CachingDataServiceProxy(new RealDataService(), 5000);

  console.log("=== 첫 번째 요청 ===");
  await service.fetchData("user-123");

  console.log("\n=== 두 번째 요청 (캐시됨) ===");
  await service.fetchData("user-123");

  console.log("\n=== 다른 데이터 요청 ===");
  await service.fetchData("user-456");

  console.log("\n=== 캐시 초기화 후 ===");
  service.clearCache();
  await service.fetchData("user-123");
}
```

캐싱 프록시는 실제 서비스 호출 전에 캐시를 확인하여 이미 가져온 데이터는 캐시에서 반환한다. 이를 통해 네트워크 호출을 줄이고 응답 시간을 크게 개선할 수 있다.

## 프록시 서버

프록시 패턴의 개념은 네트워크 영역에서 **프록시 서버**로도 구현된다. 프록시 서버는 클라이언트와 서버 사이에서 중개자 역할을 수행한다.

### 프록시 서버의 종류

**포워드 프록시**는 클라이언트 앞에 위치하여 클라이언트를 대신해 서버에 요청을 보낸다. 클라이언트의 IP를 숨기고, 특정 사이트 접근을 제어하며, 캐싱을 통해 성능을 향상시킬 수 있다. 주로 기업 네트워크나 학교에서 사용된다.

**리버스 프록시**는 서버 앞에 위치하여 클라이언트의 요청을 받아 적절한 서버로 전달한다. 서버의 IP를 숨기고, 로드 밸런싱을 수행하며, SSL 종료, 캐싱, 압축 등의 기능을 제공한다. Nginx, Apache, Cloudflare 등이 대표적인 리버스 프록시다.

### Node.js로 간단한 프록시 서버 구현

```typescript
import http from "http";
import https from "https";
import { URL } from "url";

class ProxyServer {
  private cache: Map<string, { data: string; timestamp: number }>;
  private cacheDuration: number;

  constructor(cacheDurationMs: number = 60000) {
    this.cache = new Map();
    this.cacheDuration = cacheDurationMs;
  }

  handleRequest(
    clientReq: http.IncomingMessage,
    clientRes: http.ServerResponse
  ): void {
    const targetUrl = clientReq.url;
    if (!targetUrl) {
      clientRes.writeHead(400);
      clientRes.end("Bad Request");
      return;
    }

    // 캐시 확인
    const cached = this.cache.get(targetUrl);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      console.log(`캐시 히트: ${targetUrl}`);
      clientRes.writeHead(200, { "X-Cache": "HIT" });
      clientRes.end(cached.data);
      return;
    }

    console.log(`프록시 요청: ${targetUrl}`);

    try {
      const url = new URL(targetUrl);
      const protocol = url.protocol === "https:" ? https : http;

      const proxyReq = protocol.request(
        targetUrl,
        {
          method: clientReq.method,
          headers: clientReq.headers,
        },
        (proxyRes) => {
          let data = "";

          proxyRes.on("data", (chunk) => {
            data += chunk;
          });

          proxyRes.on("end", () => {
            // 캐시 저장
            this.cache.set(targetUrl, { data, timestamp: now });

            clientRes.writeHead(proxyRes.statusCode || 200, {
              ...proxyRes.headers,
              "X-Cache": "MISS",
            });
            clientRes.end(data);
          });
        }
      );

      clientReq.pipe(proxyReq);

      proxyReq.on("error", (error) => {
        console.error("프록시 요청 오류:", error);
        clientRes.writeHead(500);
        clientRes.end("Proxy Error");
      });
    } catch (error) {
      clientRes.writeHead(400);
      clientRes.end("Invalid URL");
    }
  }

  start(port: number): void {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, () => {
      console.log(`프록시 서버가 포트 ${port}에서 실행 중입니다.`);
    });
  }
}

// 사용 예제
const proxy = new ProxyServer(60000);
proxy.start(8080);
```

위 프록시 서버는 클라이언트의 요청을 받아 실제 서버로 전달하고, 응답을 캐싱하여 동일한 요청에 대해 빠르게 응답한다. 실제 프로덕션 환경에서는 Nginx나 HAProxy 같은 전문 프록시 서버를 사용하는 것이 좋다.

## 프록시 패턴의 장점

프록시 패턴을 사용하면 **지연 초기화**를 통해 리소스를 효율적으로 사용할 수 있다. 필요한 시점에만 객체를 생성하여 메모리와 처리 시간을 절약한다.

**접근 제어**를 통해 보안을 강화할 수 있다. 프록시가 권한을 검증하여 허가된 사용자만 실제 객체에 접근할 수 있도록 한다.

**추가 기능 제공**이 가능하다는 점도 중요한 장점이다. 로깅, 캐싱, 유효성 검사 등 실제 객체를 수정하지 않고도 기능을 추가할 수 있다.

**개방-폐쇄 원칙(OCP)** 준수 측면에서도 프록시 패턴은 유용하다. 실제 객체의 코드를 변경하지 않고 새로운 기능을 추가할 수 있다.

## 프록시 패턴의 단점

프록시 패턴을 사용할 때는 **복잡도 증가** 문제를 고려해야 한다. 프록시 클래스를 추가로 작성해야 하므로 코드량이 늘어나고 구조가 복잡해진다.

**응답 시간 증가** 가능성도 존재한다. 프록시를 거치는 추가 레이어로 인해 직접 호출보다 약간의 오버헤드가 발생할 수 있다.

**과도한 사용**은 오히려 시스템을 복잡하게 만든다. 간단한 객체에 프록시를 사용하면 불필요한 추상화가 되어 코드 이해가 어려워진다.

## 프록시 패턴 사용 시 고려사항

프록시 패턴은 **객체 생성 비용이 큰 경우**에 유용하다. 대용량 이미지, 비디오, 데이터베이스 연결 등 생성에 많은 리소스가 필요한 객체에 적합하다.

**접근 제어가 필요한 경우**에도 프록시 패턴이 적합하다. 민감한 데이터나 중요한 기능에 대한 접근을 제한해야 할 때 프록시가 효과적인 보안 레이어를 제공한다.

**원격 객체 접근이 필요한 경우**라면 프록시 패턴을 고려해볼 만하다. 네트워크를 통해 다른 서버의 객체를 사용할 때 프록시가 네트워크 통신을 캡슐화할 수 있다.

반면 **간단한 객체인 경우**에는 프록시 패턴이 과도할 수 있다. 생성 비용이 낮고 접근 제어가 필요 없는 객체에 프록시를 사용하면 오히려 복잡도만 증가한다. **성능이 매우 중요한 경우**에도 프록시의 오버헤드를 신중히 고려해야 하며, 프록시를 사용하는 것이 성능상 이득인지 측정이 필요하다.

프록시 패턴은 객체에 대한 접근을 제어하고 추가 기능을 제공하면서도 사용하는 쪽 코드는 변경하지 않아도 되는 유연한 디자인 패턴이다.
