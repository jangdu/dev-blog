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

이 패턴은 한 객체의 상태 변화에 따라 다른 객체들이 자동으로 업데이트되어야 할 때 유용하다. 유튜브에서 어떤 채널을 구독하면 새 영상이 올라올 때 마다 모든 구독자에게 알림을 보내는것 처럼 하나의 변화를 여러곳에 알려주는 패턴이라고 보면된다.

주로 이벤트 시스템, 데이터 바인딩, MVC 패턴, 실시간 알림 시스템 등에서 사용된다.

## JavaScript로 옵저버 패턴 구현하기

일반적인 객체를 생성하는 방식으로 구독자에게 알림을 보내는 기능을 구현하게 되면 아래와 같은 문제가 생긴다.

```javascript
class YouTubeChannel {
  constructor() {
    this.videos = [];
    this.subscriber1 = null;
    this.subscriber2 = null;
  }

  uploadVideo(video) {
    this.videos.push(video);
    // 구독자가 추가될 때마다 여기를 수정해야 함
    if (this.subscriber1) {
      this.subscriber1.notify(video);
    }
    if (this.subscriber2) {
      this.subscriber2.notify(video);
    }
    // 구독자가 100명이면? 코드 100줄...
  }
}
```

위 코드는 새로운 구독자를 추가할 때마다 `NewsAgency` 클래스를 수정해야 하므로 확장성이 떨어진다.

### 기본 구현

옵저버 패턴은 주체와 관찰자를 분리하여 느슨한 결합을 만들어 위 문제를 해결 할 수 있다.

```typescript
// 1️⃣ 관찰자(Observer) 인터페이스 - 알림을 받을 수 있는 능력
interface Subscriber {
  notify(video: string): void; // 새 영상 알림을 받으면 실행되는 메서드
}

// 2️⃣ 주체(Subject) - 유튜브 채널
class YouTubeChannel {
  private subscribers: Subscriber[] = []; // 구독자 목록
  private channelName: string;

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  // 구독하기
  subscribe(subscriber: Subscriber): void {
    this.subscribers.push(subscriber);
    console.log("✅ 구독 완료!");
  }

  // 구독 취소
  unsubscribe(subscriber: Subscriber): void {
    this.subscribers = this.subscribers.filter((sub) => sub !== subscriber);
    console.log("❌ 구독이 취소되었습니다.");
  }

  // 새 영상 업로드 → 모든 구독자에게 자동 알림
  uploadVideo(title: string): void {
    console.log(`\n🎬 [${this.channelName}] 새 영상 업로드: "${title}"\n`);
    this.subscribers.forEach((subscriber) => subscriber.notify(title));
  }
}

// 3️⃣ 구체적인 구독자들
class EmailSubscriber implements Subscriber {
  constructor(private email: string) {}

  notify(video: string): void {
    console.log(`📧 ${this.email}로 이메일 알림: ${video}`);
  }
}

class MobileSubscriber implements Subscriber {
  constructor(private userName: string) {}

  notify(video: string): void {
    console.log(`📱 ${this.userName}님 모바일 앱 푸시 알림: ${video}`);
  }
}

class DiscordSubscriber implements Subscriber {
  constructor(private userName: string) {}

  notify(video: string): void {
    console.log(`💬 ${this.userName}님 디스코드 알림: ${video}`);
  }
}

// 4️⃣ 사용 예제
const channel = new YouTubeChannel("코딩 튜토리얼");

const 철수 = new EmailSubscriber("chulsu@example.com");
const 영희 = new MobileSubscriber("영희");
const 민수 = new DiscordSubscriber("민수");

// 구독하기
channel.subscribe(철수); // ✅ 구독 완료!
channel.subscribe(영희); // ✅ 구독 완료!
channel.subscribe(민수); // ✅ 구독 완료!

// 영상 업로드 → 자동으로 모든 구독자에게 알림
channel.uploadVideo("옵저버 패턴 완벽 정리");
// 결과
// 📧 chulsu@example.com로 이메일 알림: 옵저버 패턴 완벽 정리
// 📱 영희님 모바일 앱 푸시 알림: 옵저버 패턴 완벽 정리
// 💬 민수님 디스코드 알림: 옵저버 패턴 완벽 정리

// 철수가 구독 취소
channel.unsubscribe(철수); // ❌ 구독이 취소되었습니다.

// 다시 영상 업로드 → 철수는 알림 안 받음
channel.uploadVideo("TypeScript 고급 기법");
// 결과
// 📱 영희님 모바일 앱 푸시 알림: TypeScript 고급 기법
// 💬 민수님 디스코드 알림: TypeScript 고급 기법
```

위 코드에서 YouTubeChannel 클래스는 구독자 목록(subscribers)을 배열로 관리하여 모든 구독자에게 알림을 보낸다.

새로운 구독자 타입을 추가할 때는 Subscriber 인터페이스를 구현하는 클래스만 만들면 되므로, YouTubeChannel 클래스를 수정할 필요가 없다.

각 구독자는 notify 메서드만 구현하면 되므로, 주체와 관찰자 간의 결합도가 낮아진다. 또한 subscribe와 unsubscribe 메서드를 통해 런타임에 구독자를 동적으로 추가하거나 제거할 수 있어 유연성이 높다.

이렇게 옵저버 패턴을 사용하면 구독자 추가나 제거에 대한 코드 수정 없이 확장 가능한 구조를 만들 수 있다.

## 옵저버 패턴의 장점

옵저버 패턴을 사용하면 주체는 관찰자의 구체적인 클래스를 알 필요 없이 인터페이스만 알면 되므로 의존성이 낮아진다.

런타임에 관찰자를 추가하거나 제거할 수 있는 **동적 관계 설정**이 가능하기 때문에 유연한 구조를 만들 수 있다.

새로운 관찰자를 추가할 때 주체 클래스를 수정하지 않아도 되기 때문에, **개방-폐쇄 원칙(OCP)** 준수 측면에서도 유용하다.

## 옵저버 패턴의 단점

옵저버 패턴을 사용할 때는 **메모리 누수** 위험을 고려해야 한다. 관찰자를 제거하지 않으면 메모리에 계속 남아있어 메모리 누수가 발생할 수 있다.

각 관찰자들이 업데이트되는 순서를 보장할 수 없어 순서에 의존하는 경우에는 **예측 불가능한 업데이트 순서**가 문제가 된다.

관찰자가 많아질수록 알림 전파에 시간이 걸리며, 특히 동기적으로 처리할 경우 **성능에 영향을 줄 수 있다.**

간접적인 호출 관계로 인해 흐름을 추적하기 어렵고, 어떤 관찰자가 어떤 동작을 수행하는지 파악하기 어려워 **디버깅 시 문제가 될 수 있다.**

## 옵저버 패턴 사용 시 고려사항

위 코드로 예제를 든 상황처럼 **이벤트 기반 시스템을 구축하는 경우**에는 옵저버 패턴이 적합하다. 사용자 인터랙션, 시스템 이벤트, 비즈니스 이벤트 등을 처리할 때 효과적이다.

하나의 데이터 소스를 여러 컴포넌트에서 구독해야 하는 **일대다 의존 관계가 필요한 경우** 옵저버 패턴이 깔끔한 구조를 제공한다.

반면 **관찰자가 많지 않고 관계가 단순한 경우**에는 직접 메서드 호출이나 콜백으로 충분히 처리 가능하기 때문에 옵저버 패턴을 사용하면 오히려 복잡해 질 수 있다. **성능이 매우 중요한 경우**에도 옵저버 패턴의 오버헤드를 고려해야 하며, 관찰자 수가 너무 많다면 비동기 처리나 배치 업데이트가 더 적합할 수 있다.
