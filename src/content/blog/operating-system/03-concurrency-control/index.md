---
title: "동시성 제어"
summary: "Race Condition, Mutex, Semaphore, Deadlock과 실무 해결책"
date: "Feb 20 2024"
draft: false
tags:
  - Operating System
  - Computer Science
  - Concurrency
---

동시성 제어는 **여러 프로세스나 스레드가 공유 자원에 안전하게 접근하도록 관리하는 기법**이다. 멀티스레드 환경에서는 Race Condition, Deadlock 같은 문제가 발생할 수 있으며, Mutex와 Semaphore로 이를 해결한다.

백엔드 개발에서는 데이터베이스 트랜잭션, 캐시 갱신, 재고 관리 등에서 동시성 문제를 직접 다룬다. 올바른 동기화 없이는 데이터 불일치, 초과 판매, 시스템 정지 같은 심각한 문제가 발생한다.

## Race Condition (경쟁 상태)

Race Condition은 **여러 스레드가 공유 자원에 동시에 접근할 때, 실행 순서에 따라 결과가 달라지는 상황**이다.

### 발생 원리

공유 자원에 대한 **읽기-수정-쓰기(Read-Modify-Write)** 작업이 원자적(Atomic)이지 않을 때 발생한다.

```javascript
// ❌ Race Condition 발생
let counter = 0;

// 스레드 A
counter++; // 1. 읽기: 0  2. 수정: 1  3. 쓰기: 1

// 스레드 B (동시 실행)
counter++; // 1. 읽기: 0  2. 수정: 1  3. 쓰기: 1

// 결과: counter = 1 (예상: 2)
```

**타임라인:**
```text
시간    스레드 A         스레드 B         counter
0ms     읽기 (0)         -               0
1ms     수정 (0+1)       읽기 (0)        0
2ms     쓰기 (1)         수정 (0+1)      1
3ms     -                쓰기 (1)        1 ❌
```

두 스레드가 같은 초기값(0)을 읽어 각각 계산하므로, 한 번의 증가가 손실된다.

### 임계 영역 (Critical Section)

임계 영역은 **공유 자원에 접근하는 코드 영역**이다. 한 번에 하나의 스레드만 진입할 수 있도록 보장해야 한다.

**요구사항:**
1. **상호 배제 (Mutual Exclusion)**: 한 번에 하나만 진입
2. **진행 (Progress)**: 임계 영역이 비어있으면 진입 가능
3. **한정 대기 (Bounded Waiting)**: 무한 대기 방지

## Mutex (상호 배제)

Mutex는 **Mutual Exclusion**의 약자로, 한 번에 하나의 스레드만 임계 영역에 진입하도록 보장한다.

### 동작 원리

```javascript
// Node.js async-mutex 예시
const { Mutex } = require('async-mutex');
const mutex = new Mutex();

let counter = 0;

async function increment() {
  const release = await mutex.acquire(); // 락 획득
  try {
    // 임계 영역
    const temp = counter;
    await new Promise(r => setTimeout(r, 10)); // 작업 시뮬레이션
    counter = temp + 1;
  } finally {
    release(); // 락 해제
  }
}

// 여러 스레드가 동시 실행해도 안전
Promise.all([increment(), increment(), increment()]);
```

**소유권 (Ownership)**:
- 뮤텍스를 획득한 스레드만 해제 가능
- 다른 스레드가 해제하려고 하면 오류

### 실무 예시: 파일 쓰기

```javascript
const fs = require('fs').promises;
const { Mutex } = require('async-mutex');

const fileMutex = new Mutex();

async function writeLog(message) {
  const release = await fileMutex.acquire();
  try {
    await fs.appendFile('app.log', `${message}\n`);
  } finally {
    release();
  }
}

// 여러 요청에서 동시에 로그 작성해도 안전
app.post('/api/users', async (req, res) => {
  await writeLog(`User created: ${req.body.email}`);
  res.json({ success: true });
});
```

## Semaphore (세마포어)

Semaphore는 **정수 값을 가지는 동기화 도구**로, 여러 스레드가 제한된 자원에 동시에 접근하도록 제어한다.

### 종류

**이진 세마포어 (Binary Semaphore)**:
- 값: 0 또는 1
- 뮤텍스와 유사하지만 소유권 없음

**카운팅 세마포어 (Counting Semaphore)**:
- 값: 0 이상의 정수
- 여러 스레드 동시 접근 허용

### 동작 원리

```javascript
class Semaphore {
  constructor(count) {
    this.count = count;
    this.waiting = [];
  }

  async acquire() {
    if (this.count > 0) {
      this.count--;
      return;
    }

    // 대기
    await new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release() {
    this.count++;

    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      this.count--;
      resolve();
    }
  }
}

// 최대 3개 동시 실행
const semaphore = new Semaphore(3);

async function processRequest(id) {
  await semaphore.acquire();
  try {
    console.log(`Request ${id} processing...`);
    await new Promise(r => setTimeout(r, 1000));
    console.log(`Request ${id} done`);
  } finally {
    semaphore.release();
  }
}

// 10개 요청 중 한 번에 3개만 실행
for (let i = 1; i <= 10; i++) {
  processRequest(i);
}
```

### Mutex vs Semaphore

| 특성 | Mutex | Semaphore |
|------|-------|-----------|
| **목적** | 임계 영역 보호 | 자원 개수 제한 |
| **값** | 0 또는 1 | 0 이상 정수 |
| **소유권** | 있음 (획득한 스레드만 해제) | 없음 (아무나 signal 가능) |
| **동시 접근** | 1개만 | N개 가능 |
| **사용 예** | 공유 변수 보호 | 커넥션 풀 |

## 실무 활용

### 1. 데이터베이스 커넥션 풀

```javascript
class ConnectionPool {
  constructor(maxConnections) {
    this.semaphore = new Semaphore(maxConnections);
    this.connections = [];

    for (let i = 0; i < maxConnections; i++) {
      this.connections.push(createConnection());
    }
  }

  async execute(query) {
    await this.semaphore.acquire();
    try {
      const conn = this.connections.find(c => !c.inUse);
      conn.inUse = true;

      const result = await conn.query(query);
      return result;
    } finally {
      conn.inUse = false;
      this.semaphore.release();
    }
  }
}

const pool = new ConnectionPool(10); // 최대 10개

// 100개 요청 중 10개씩만 동시 실행
for (let i = 0; i < 100; i++) {
  pool.execute('SELECT * FROM users');
}
```

### 2. 재고 관리 (Race Condition 해결)

```javascript
// ❌ 문제: Race Condition
app.post('/api/purchase', async (req, res) => {
  const product = await db.query('SELECT stock FROM products WHERE id = ?', [req.body.productId]);

  if (product.stock >= req.body.quantity) {
    // 여기서 다른 요청이 개입 가능!
    await db.query('UPDATE products SET stock = stock - ? WHERE id = ?',
      [req.body.quantity, req.body.productId]);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: '재고 부족' });
  }
});

// ✅ 해결 1: 비관적 락
app.post('/api/purchase', async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [product] = await conn.query(
      'SELECT stock FROM products WHERE id = ? FOR UPDATE', // 행 잠금
      [req.body.productId]
    );

    if (product.stock >= req.body.quantity) {
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?',
        [req.body.quantity, req.body.productId]);
      await conn.commit();
      res.json({ success: true });
    } else {
      await conn.rollback();
      res.status(400).json({ error: '재고 부족' });
    }
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});

// ✅ 해결 2: 원자적 UPDATE
app.post('/api/purchase', async (req, res) => {
  const result = await db.query(
    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [req.body.quantity, req.body.productId, req.body.quantity]
  );

  if (result.affectedRows > 0) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: '재고 부족' });
  }
});
```

### 3. 캐시 Stampede 방지 (분산 락)

```javascript
const Redis = require('ioredis');
const redis = new Redis();

async function getCachedUser(userId) {
  // 캐시 확인
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  // 분산 락 획득
  const lockKey = `lock:user:${userId}`;
  const lockValue = Date.now().toString();
  const acquired = await redis.set(lockKey, lockValue, 'NX', 'EX', 10);

  if (!acquired) {
    // 다른 요청이 락 보유 중 → 대기 후 재시도
    await new Promise(r => setTimeout(r, 100));
    return getCachedUser(userId);
  }

  try {
    // DB 조회 (한 요청만 실행)
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    // 캐시 저장
    await redis.setex(`user:${userId}`, 300, JSON.stringify(user));

    return user;
  } finally {
    // 락 해제
    await redis.del(lockKey);
  }
}

// 동시에 100개 요청이 와도 DB는 1번만 조회
Promise.all(Array(100).fill().map(() => getCachedUser(123)));
```

## Deadlock (교착 상태)

Deadlock은 **두 개 이상의 스레드가 서로 상대방이 가진 자원을 기다리며 무한정 대기하는 상태**다.

### 발생 조건 (Coffman 조건)

네 가지 조건이 **모두** 만족되어야 데드락 발생:

1. **상호 배제 (Mutual Exclusion)**: 자원을 한 번에 하나만 사용
2. **점유와 대기 (Hold and Wait)**: 자원을 가진 채로 다른 자원 대기
3. **비선점 (No Preemption)**: 강제로 자원을 빼앗을 수 없음
4. **순환 대기 (Circular Wait)**: 원형으로 자원을 기다림

### 데드락 예시

```javascript
const lock1 = new Mutex();
const lock2 = new Mutex();

// 스레드 A
async function transferAtoB() {
  await lock1.acquire();
  await new Promise(r => setTimeout(r, 100));
  await lock2.acquire(); // 여기서 대기

  // 송금 로직
  lock2.release();
  lock1.release();
}

// 스레드 B
async function transferBtoA() {
  await lock2.acquire();
  await new Promise(r => setTimeout(r, 100));
  await lock1.acquire(); // 여기서 대기 ← DEADLOCK!

  // 송금 로직
  lock1.release();
  lock2.release();
}

// 동시 실행 시 데드락 발생
Promise.all([transferAtoB(), transferBtoA()]);
```

**타임라인:**
```
시간    스레드 A             스레드 B
0ms     lock1.acquire()     lock2.acquire()
100ms   lock2.acquire()     lock1.acquire()
        → 대기 (B가 보유)    → 대기 (A가 보유)
        ← DEADLOCK! →
```

### 데드락 예방

**1. 자원 순서 규칙 (가장 실용적)**

```javascript
// ✅ 항상 작은 ID부터 잠금
async function transfer(fromId, toId, amount) {
  const [first, second] = fromId < toId ? [fromId, toId] : [toId, fromId];

  await locks[first].acquire();
  await locks[second].acquire();

  try {
    // 송금 로직
    accounts[fromId] -= amount;
    accounts[toId] += amount;
  } finally {
    locks[second].release();
    locks[first].release();
  }
}

// 어떤 순서로 호출해도 안전
transfer(1, 2, 100); // lock1 → lock2
transfer(2, 1, 50);  // lock1 → lock2 (순서 통일!)
```

**2. 타임아웃 설정**

```javascript
async function acquireWithTimeout(lock, timeoutMs) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Lock timeout')), timeoutMs)
  );

  const acquire = lock.acquire();

  return Promise.race([acquire, timeout]);
}

async function safeTransfer() {
  try {
    await acquireWithTimeout(lock1, 5000);
    await acquireWithTimeout(lock2, 5000);

    // 송금 로직
  } catch (error) {
    // 타임아웃 시 롤백 및 재시도
    lock1.release();
    lock2.release();
  }
}
```

### 데이터베이스 데드락

```sql
-- 트랜잭션 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- 행 1 잠금
-- 1초 대기
UPDATE accounts SET balance = balance + 100 WHERE id = 2; -- 대기...

-- 트랜잭션 2 (동시 실행)
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;  -- 행 2 잠금
-- 1초 대기
UPDATE accounts SET balance = balance + 50 WHERE id = 1;  -- 대기... ← DEADLOCK!
```

**해결책:**

```sql
-- ✅ 항상 id 오름차순으로 UPDATE
BEGIN;
UPDATE accounts SET balance = CASE
  WHEN id = 1 THEN balance - 100
  WHEN id = 2 THEN balance + 100
  END
WHERE id IN (1, 2)
ORDER BY id; -- 순서 보장
COMMIT;
```

### 데드락 탐지

```javascript
// MySQL 데드락 확인
SHOW ENGINE INNODB STATUS;

// PostgreSQL 데드락 확인
SELECT * FROM pg_locks WHERE NOT granted;

// 데드락 발생 시 로그
/*
LATEST DETECTED DEADLOCK
------------------------
Transaction 1:
  waiting for lock on: table accounts, row id=2

Transaction 2:
  waiting for lock on: table accounts, row id=1

TRANSACTION ROLLED BACK: Transaction 2
*/
```

## 동기화 전략 선택

| 상황 | 해결책 | 이유 |
|------|--------|------|
| **공유 변수 보호** | Mutex | 한 번에 하나만 접근 |
| **자원 풀 (DB 커넥션)** | Semaphore | N개 동시 접근 |
| **재고 감소** | 원자적 UPDATE | DB 락 불필요, 빠름 |
| **캐시 갱신** | 분산 락 (Redis) | 여러 서버 동기화 |
| **좋아요 카운터** | 원자적 연산 | `INCR`, `UPDATE count+1` |
| **송금** | 자원 순서 규칙 | 데드락 방지 |

## 성능 최적화

### 1. 임계 영역 최소화

```javascript
// ❌ 나쁜 예: 긴 임계 영역
await mutex.acquire();
const data = await fetchFromDB(); // 느림!
const processed = heavyComputation(data); // 느림!
await saveToCache(processed); // 느림!
mutex.release();

// ✅ 좋은 예: 짧은 임계 영역
const data = await fetchFromDB();
const processed = heavyComputation(data);

await mutex.acquire();
await saveToCache(processed); // 꼭 필요한 부분만
mutex.release();
```

### 2. 읽기-쓰기 락

```javascript
class RWLock {
  constructor() {
    this.readers = 0;
    this.writer = false;
    this.waiting = [];
  }

  async acquireRead() {
    while (this.writer) {
      await new Promise(r => this.waiting.push(r));
    }
    this.readers++;
  }

  releaseRead() {
    this.readers--;
    if (this.readers === 0 && this.waiting.length > 0) {
      this.waiting.shift()();
    }
  }

  async acquireWrite() {
    while (this.writer || this.readers > 0) {
      await new Promise(r => this.waiting.push(r));
    }
    this.writer = true;
  }

  releaseWrite() {
    this.writer = false;
    if (this.waiting.length > 0) {
      this.waiting.shift()();
    }
  }
}

// 여러 리더, 하나의 라이터
const rwLock = new RWLock();

// 읽기 (동시 가능)
async function read() {
  await rwLock.acquireRead();
  const data = await cache.get('data');
  rwLock.releaseRead();
  return data;
}

// 쓰기 (독점)
async function write(data) {
  await rwLock.acquireWrite();
  await cache.set('data', data);
  rwLock.releaseWrite();
}
```

### 3. Lock-Free 자료구조

```javascript
// 원자적 연산 사용 (락 불필요)
const { AtomicInt32 } = require('atomic');

const counter = new AtomicInt32(0);

function increment() {
  counter.add(1); // 원자적 연산
}

// 여러 스레드에서 안전
for (let i = 0; i < 1000; i++) {
  increment();
}

console.log(counter.load()); // 1000 (항상 정확)
```

## 정리

**동시성 문제:**
- Race Condition: 실행 순서에 따라 결과 달라짐
- 임계 영역: 보호 필요한 코드 영역

**해결 도구:**
- Mutex: 임계 영역 보호 (1:1)
- Semaphore: 자원 개수 제한 (1:N)
- 원자적 연산: 락 없이 안전

**함정:**
- Deadlock: 순환 대기로 무한 정지
- 예방: 자원 순서 규칙, 타임아웃

**실무:**
- DB: 트랜잭션 락, 순서 통일
- 캐시: 분산 락 (Redis)
- 성능: 임계 영역 최소화, RW Lock

동시성 제어는 멀티스레드 프로그래밍의 핵심이다. 올바른 동기화로 안전하고 효율적인 시스템을 만들 수 있다.
