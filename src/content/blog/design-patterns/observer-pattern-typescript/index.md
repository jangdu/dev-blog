---
title: "옵저버 패턴 (Observer Pattern)"
summary: "TypeScript/JavaScript에서 옵저버 패턴 구현"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

옵저버 패턴(Observer Pattern)은 **객체의 상태 변화를 관찰하는 관찰자들에게 자동으로 알림을 보내는** 행동 디자인 패턴이다. 주체(Subject)와 관찰자(Observer) 간의 일대다 의존 관계를 정의한다.

이 패턴은 한 객체의 상태 변화에 따라 다른 객체들이 자동으로 업데이트되어야 할 때 유용하다. 주로 이벤트 시스템, 데이터 바인딩, MVC 패턴, 실시간 알림 시스템 등에서 사용된다.

## JavaScript로 옵저버 패턴 구현하기

일반적으로 객체 간 의존성을 직접 구현하면 강한 결합이 발생한다.

```javascript
class NewsAgency {
  constructor() {
    this.news = "";
    this.emailSubscriber = null;
    this.smsSubscriber = null;
  }

  setNews(news) {
    this.news = news;
    // 모든 구독자에게 직접 알림
    if (this.emailSubscriber) {
      this.emailSubscriber.update(news);
    }
    if (this.smsSubscriber) {
      this.smsSubscriber.update(news);
    }
  }
}
```

위 코드는 새로운 구독자를 추가할 때마다 `NewsAgency` 클래스를 수정해야 하므로 확장성이 떨어진다.

### 기본 구현

옵저버 패턴은 주체와 관찰자를 분리하여 느슨한 결합을 만든다.

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
    console.log(`관찰자 등록됨. 현재 ${this.observers.length}명`);
  }

  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log(`관찰자 제거됨. 현재 ${this.observers.length}명`);
    }
  }

  notify(data) {
    console.log(`${this.observers.length}명의 관찰자에게 알림 전송`);
    this.observers.forEach((observer) => observer.update(data));
  }
}

class NewsAgency extends Subject {
  constructor() {
    super();
    this.news = "";
  }

  setNews(news) {
    console.log(`새 뉴스: ${news}`);
    this.news = news;
    this.notify(news);
  }

  getNews() {
    return this.news;
  }
}

class EmailSubscriber {
  constructor(email) {
    this.email = email;
  }

  update(news) {
    console.log(`[이메일 ${this.email}] 뉴스 수신: ${news}`);
  }
}

class SMSSubscriber {
  constructor(phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  update(news) {
    console.log(`[SMS ${this.phoneNumber}] 뉴스 수신: ${news}`);
  }
}

class AppSubscriber {
  constructor(userId) {
    this.userId = userId;
  }

  update(news) {
    console.log(`[앱 알림 ${this.userId}] 뉴스 수신: ${news}`);
  }
}

// 사용 예제
const newsAgency = new NewsAgency();

const emailSub = new EmailSubscriber("user@example.com");
const smsSub = new SMSSubscriber("010-1234-5678");
const appSub = new AppSubscriber("user123");

newsAgency.attach(emailSub);
newsAgency.attach(smsSub);
newsAgency.attach(appSub);

newsAgency.setNews("TypeScript 5.0 출시!");

// 구독 취소
newsAgency.detach(smsSub);
newsAgency.setNews("React 19 베타 공개!");
```

`Subject` 클래스는 관찰자 목록을 관리하고 상태 변화 시 모든 관찰자에게 알림을 보낸다. 새로운 구독자 타입을 추가해도 `NewsAgency` 클래스를 수정할 필요가 없으며, 구독자는 `update` 메서드만 구현하면 된다.

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 주체와 관찰자 인터페이스를 명시적으로 정의할 수 있다.

```typescript
interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

interface NewsData {
  title: string;
  content: string;
  category: string;
  timestamp: Date;
}

class NewsAgency implements Subject<NewsData> {
  private observers: Observer<NewsData>[] = [];
  private latestNews: NewsData | null = null;

  attach(observer: Observer<NewsData>): void {
    this.observers.push(observer);
    console.log(`관찰자 등록됨. 현재 ${this.observers.length}명`);
  }

  detach(observer: Observer<NewsData>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log(`관찰자 제거됨. 현재 ${this.observers.length}명`);
    }
  }

  notify(data: NewsData): void {
    this.observers.forEach((observer) => observer.update(data));
  }

  publishNews(title: string, content: string, category: string): void {
    const newsData: NewsData = {
      title,
      content,
      category,
      timestamp: new Date(),
    };
    this.latestNews = newsData;
    console.log(`새 뉴스 발행: ${title}`);
    this.notify(newsData);
  }

  getLatestNews(): NewsData | null {
    return this.latestNews;
  }
}

class EmailSubscriber implements Observer<NewsData> {
  constructor(private email: string) {}

  update(data: NewsData): void {
    console.log(`[이메일 ${this.email}]`);
    console.log(`제목: ${data.title}`);
    console.log(`카테고리: ${data.category}`);
  }
}

class MobileAppSubscriber implements Observer<NewsData> {
  constructor(private userId: string, private preferences: string[]) {}

  update(data: NewsData): void {
    if (this.preferences.includes(data.category)) {
      console.log(`[앱 ${this.userId}] 관심 카테고리 뉴스 수신`);
      console.log(`${data.title} - ${data.category}`);
    }
  }
}

// 사용 예제
const agency = new NewsAgency();

const emailSub = new EmailSubscriber("user@example.com");
const mobileSub = new MobileAppSubscriber("user123", ["기술", "스포츠"]);

agency.attach(emailSub);
agency.attach(mobileSub);

agency.publishNews(
  "TypeScript 5.0 출시",
  "새로운 기능 소개...",
  "기술"
);

agency.publishNews(
  "월드컵 결승전",
  "경기 결과...",
  "스포츠"
);
```

인터페이스를 통해 주체와 관찰자의 계약을 명확히 정의하고, 제네릭을 사용하여 다양한 데이터 타입을 안전하게 처리할 수 있다. `NewsData` 타입을 통해 뉴스 데이터의 구조가 명확해지며, 컴파일 시점에 타입 오류를 발견할 수 있다.

### 실제 사용 예제: 주식 가격 모니터링

```typescript
interface StockData {
  symbol: string;
  price: number;
  change: number;
  timestamp: Date;
}

class Stock implements Subject<StockData> {
  private observers: Observer<StockData>[] = [];
  private data: StockData;

  constructor(symbol: string, initialPrice: number) {
    this.data = {
      symbol,
      price: initialPrice,
      change: 0,
      timestamp: new Date(),
    };
  }

  attach(observer: Observer<StockData>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<StockData>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: StockData): void {
    this.observers.forEach((observer) => observer.update(data));
  }

  setPrice(newPrice: number): void {
    const change = newPrice - this.data.price;
    this.data = {
      ...this.data,
      price: newPrice,
      change,
      timestamp: new Date(),
    };
    this.notify(this.data);
  }

  getPrice(): number {
    return this.data.price;
  }
}

class PriceAlertObserver implements Observer<StockData> {
  constructor(
    private name: string,
    private targetPrice: number,
    private condition: "above" | "below"
  ) {}

  update(data: StockData): void {
    const shouldAlert =
      this.condition === "above"
        ? data.price >= this.targetPrice
        : data.price <= this.targetPrice;

    if (shouldAlert) {
      console.log(`[가격 알림 ${this.name}]`);
      console.log(
        `${data.symbol} 가격이 ${this.targetPrice}원 ${
          this.condition === "above" ? "이상" : "이하"
        }입니다!`
      );
      console.log(`현재 가격: ${data.price}원`);
    }
  }
}

class TradingBotObserver implements Observer<StockData> {
  constructor(private name: string, private strategy: string) {}

  update(data: StockData): void {
    console.log(`[트레이딩봇 ${this.name}]`);
    if (data.change > 0) {
      console.log(`${data.symbol} 상승: +${data.change}원`);
      console.log(`전략 ${this.strategy} 실행 고려`);
    } else if (data.change < 0) {
      console.log(`${data.symbol} 하락: ${data.change}원`);
      console.log(`전략 ${this.strategy} 실행 고려`);
    }
  }
}

class LoggerObserver implements Observer<StockData> {
  update(data: StockData): void {
    console.log(
      `[로그] ${data.timestamp.toISOString()} - ${data.symbol}: ${
        data.price
      }원 (${data.change > 0 ? "+" : ""}${data.change})`
    );
  }
}

// 사용 예제
const appleStock = new Stock("AAPL", 150000);

const highPriceAlert = new PriceAlertObserver("고가알림", 160000, "above");
const lowPriceAlert = new PriceAlertObserver("저가알림", 140000, "below");
const tradingBot = new TradingBotObserver("봇1", "모멘텀");
const logger = new LoggerObserver();

appleStock.attach(highPriceAlert);
appleStock.attach(lowPriceAlert);
appleStock.attach(tradingBot);
appleStock.attach(logger);

console.log("=== 가격 변동 시작 ===");
appleStock.setPrice(155000);
console.log("\n");
appleStock.setPrice(162000);
console.log("\n");
appleStock.setPrice(138000);
```

주식 가격 모니터링 시스템에서 하나의 주식 객체에 여러 관찰자를 등록할 수 있다. 가격 알림, 트레이딩 봇, 로거 등 각각 다른 목적의 관찰자들이 동일한 가격 변화 이벤트를 받아 각자의 로직을 수행한다. 새로운 관찰자를 추가해도 주식 클래스를 수정할 필요가 없다.

### 이벤트 기반 옵저버 패턴

```typescript
type EventCallback<T> = (data: T) => void;

class EventEmitter<T> {
  private events: Map<string, EventCallback<T>[]> = new Map();

  on(eventName: string, callback: EventCallback<T>): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)!.push(callback);
  }

  off(eventName: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(eventName: string, data: T): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

interface UserEvent {
  userId: string;
  action: string;
  timestamp: Date;
}

class UserActivityTracker extends EventEmitter<UserEvent> {
  trackLogin(userId: string): void {
    this.emit("login", {
      userId,
      action: "login",
      timestamp: new Date(),
    });
  }

  trackLogout(userId: string): void {
    this.emit("logout", {
      userId,
      action: "logout",
      timestamp: new Date(),
    });
  }

  trackPurchase(userId: string): void {
    this.emit("purchase", {
      userId,
      action: "purchase",
      timestamp: new Date(),
    });
  }
}

// 사용 예제
const tracker = new UserActivityTracker();

tracker.on("login", (event) => {
  console.log(`[분석] 사용자 ${event.userId} 로그인`);
});

tracker.on("purchase", (event) => {
  console.log(`[알림] 사용자 ${event.userId} 구매 완료`);
  console.log(`[이메일] 구매 확인 메일 전송`);
});

tracker.trackLogin("user123");
tracker.trackPurchase("user123");
tracker.trackLogout("user123");
```

이벤트 기반 옵저버 패턴은 이벤트 이름으로 관찰자를 구분하여 더 세밀한 제어가 가능하다. Node.js의 `EventEmitter`와 유사한 인터페이스로 익숙한 API를 제공하며, 동일한 이벤트에 여러 콜백을 등록할 수 있다.

## 옵저버 패턴의 장점

옵저버 패턴을 사용하면 **느슨한 결합**이 형성된다. 주체는 관찰자의 구체적인 클래스를 알 필요 없이 인터페이스만 알면 되므로 의존성이 낮아진다.

**동적 관계 설정**이 가능하다는 점도 중요한 장점이다. 런타임에 관찰자를 추가하거나 제거할 수 있어 유연한 구조를 만들 수 있다.

**개방-폐쇄 원칙(OCP)** 준수 측면에서도 옵저버 패턴은 유용하다. 새로운 관찰자를 추가할 때 주체 클래스를 수정하지 않아도 된다.

**브로드캐스트 통신**을 통해 하나의 이벤트를 여러 객체에 효율적으로 전파할 수 있다. 일대다 관계를 쉽게 구현할 수 있어 이벤트 기반 시스템에 적합하다.

## 옵저버 패턴의 단점

옵저버 패턴을 사용할 때는 **메모리 누수** 위험을 고려해야 한다. 관찰자를 제거하지 않으면 메모리에 계속 남아있어 메모리 누수가 발생할 수 있다.

**예측 불가능한 업데이트 순서**도 문제가 될 수 있다. 관찰자들이 업데이트되는 순서를 보장할 수 없어 순서에 의존하는 로직은 문제가 발생할 수 있다.

**성능 저하** 가능성도 존재한다. 관찰자가 많아질수록 알림 전파에 시간이 걸리며, 특히 동기적으로 처리할 경우 성능에 영향을 줄 수 있다.

**디버깅 어려움**도 옵저버 패턴의 단점이다. 간접적인 호출 관계로 인해 실행 흐름을 추적하기 어렵고, 어떤 관찰자가 어떤 동작을 수행하는지 파악하기 힘들 수 있다.

## 옵저버 패턴 사용 시 고려사항

옵저버 패턴은 **한 객체의 변경이 다른 객체들에게 전파되어야 하는 경우**에 유용하다. 데이터 모델이 변경될 때 여러 뷰를 업데이트해야 하는 상황에서 적합하다.

**이벤트 기반 시스템을 구축하는 경우**에도 옵저버 패턴이 적합하다. 사용자 인터랙션, 시스템 이벤트, 비즈니스 이벤트 등을 처리할 때 효과적이다.

**일대다 의존 관계가 필요한 경우**라면 옵저버 패턴을 고려해볼 만하다. 하나의 데이터 소스를 여러 컴포넌트에서 구독해야 할 때 옵저버 패턴이 깔끔한 구조를 제공한다.

반면 **관찰자가 많지 않고 관계가 단순한 경우**에는 옵저버 패턴이 과도할 수 있다. 직접 메서드 호출이나 콜백으로 충분히 처리 가능한 경우 옵저버 패턴을 사용하면 오히려 복잡도가 증가한다. **성능이 매우 중요한 경우**에도 옵저버 패턴의 오버헤드를 고려해야 하며, 관찰자 수가 매우 많다면 비동기 처리나 배치 업데이트를 검토해야 한다.

옵저버 패턴은 객체 간 느슨한 결합을 유지하면서 이벤트 기반 시스템을 구축할 때 매우 유용한 디자인 패턴이다.
