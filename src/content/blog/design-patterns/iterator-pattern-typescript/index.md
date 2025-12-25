---
title: "이터레이터 패턴 (Iterator Pattern)"
summary: "TypeScript에서 이터레이터 패턴 구현"
date: "April 08 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
---

이터레이터 패턴(Iterator Pattern)은 **컬렉션의 내부 구조를 노출하지 않으면서 순차적으로 요소에 접근**할 수 있게 하는 행동 디자인 패턴이다. 컬렉션과 순회 로직을 분리하여 일관된 방식으로 다양한 컬렉션을 탐색할 수 있다.

복잡한 자료구조를 순회하거나, 다양한 순회 방식을 제공하거나, 컬렉션의 내부 구조를 숨기고 싶을 때 유용하다. TypeScript에서는 내장 이터레이터 프로토콜을 통해 `for...of` 루프와 함께 사용된다.

## TypeScript로 이터레이터 패턴 구현하기

배열과 같은 단순한 자료구조는 인덱스로 접근할 수 있지만, 복잡한 자료구조는 순회 방법이 명확하지 않다. 또한 내부 구조를 직접 노출하면 캡슐화가 깨지고 유지보수가 어려워진다.

```typescript
class BookCollection {
  private books: Array<{ title: string; author: string }> = [];

  addBook(book: { title: string; author: string }): void {
    this.books.push(book);
  }

  getBooks(): Array<{ title: string; author: string }> {
    return this.books; // 내부 구조 노출
  }
}

const collection = new BookCollection();
collection.addBook({ title: "Book 1", author: "Author 1" });
collection.addBook({ title: "Book 2", author: "Author 2" });

// 내부 구조를 직접 알아야 함
const books = collection.getBooks();
for (let i = 0; i < books.length; i++) {
  console.log(books[i].title);
}
```

위 코드는 `getBooks()` 메서드가 내부 배열을 직접 반환하여 사용하는 쪽에서는 컬렉션이 배열로 구현되어 있다는 것을 알고 있어야 하며, 만약 내부 구현이 다른 자료구조로 변경되면 모든 사용하는 코드를 수정해야 한다.

또한 내부 배열을 직접 반환하면 외부에서 배열을 수정할 수 있어 데이터 무결성이 보장되지 않는다.

### 기본 구현

이터레이터 패턴은 순회 로직을 별도의 이터레이터 객체로 분리하여, 컬렉션의 내부 구조를 숨기고 일관된 인터페이스로 요소에 접근할 수 있게 한다.

```typescript
interface Iterator<T> {
  hasNext(): boolean;
  next(): T | null;
  reset(): void;
}

interface Iterable<T> {
  createIterator(): Iterator<T>;
}

class Book {
  constructor(
    public title: string,
    public author: string,
    public year: number
  ) {}
}

class BookIterator implements Iterator<Book> {
  private currentIndex: number = 0;

  constructor(private books: Book[]) {}

  hasNext(): boolean {
    return this.currentIndex < this.books.length;
  }

  next(): Book | null {
    if (this.hasNext()) {
      return this.books[this.currentIndex++];
    }
    return null;
  }

  reset(): void {
    this.currentIndex = 0;
  }
}

class BookCollection implements Iterable<Book> {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  createIterator(): Iterator<Book> {
    return new BookIterator(this.books);
  }
}

// 사용 예제
const collection = new BookCollection();
collection.addBook(new Book("1984", "George Orwell", 1949));
collection.addBook(new Book("The Great Gatsby", "F. Scott Fitzgerald", 1925));
collection.addBook(new Book("To Kill a Mockingbird", "Harper Lee", 1960));

const iterator = collection.createIterator();

console.log("책 목록:");
while (iterator.hasNext()) {
  const book = iterator.next();
  if (book) {
    console.log(`- ${book.title} (${book.author}, ${book.year})`);
  }
}
```

위 코드에서 `BookIterator`는 컬렉션의 순회 상태(`currentIndex`)를 내부적으로 관리한다. 사용하는 쪽에서는 `hasNext()`로 다음 요소가 있는지 확인하고, `next()`로 요소를 가져오기만 하면 되므로 컬렉션의 내부 구조를 알 필요가 없다.

`BookCollection`의 내부 구현이 배열에서 링크드 리스트나 해시 테이블로 변경되더라도, `BookIterator`의 구현만 수정하면 되고 사용하는 쪽 코드는 전혀 변경할 필요가 없다. 또한 내부 데이터를 직접 노출하지 않으므로, 외부에서 데이터를 수정할 수 없어 데이터 무결성이 보장된다.

### ES6 이터레이터 프로토콜 활용

JavaScript ES6부터는 이터레이터 프로토콜이 내장되어 있어 `for...of` 루프와 함께 사용할 수 있다. `Symbol.iterator` 메서드를 구현하면 자동으로 이터러블(iterable) 객체가 되어, JavaScript의 다양한 내장 기능을 사용할 수 있다.

별도의 이터레이터 클래스를 만들지 않고도 컬렉션 자체에 `Symbol.iterator` 메서드를 구현하면, `for...of` 루프, 전개 연산자, 배열 디스트럭처링 등을 바로 사용할 수 있다.

```typescript
class Book {
  constructor(
    public title: string,
    public author: string,
    public year: number
  ) {}
}

class BookCollection {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  // 이터레이터 프로토콜 구현
  [Symbol.iterator](): Iterator<Book> {
    let index = 0;
    const books = this.books;

    return {
      next(): IteratorResult<Book> {
        if (index < books.length) {
          return { value: books[index++], done: false };
        } else {
          return { done: true, value: undefined };
        }
      },
    };
  }
}

// 사용 예제
const collection = new BookCollection();
collection.addBook(new Book("1984", "George Orwell", 1949));
collection.addBook(new Book("The Great Gatsby", "F. Scott Fitzgerald", 1925));
collection.addBook(new Book("To Kill a Mockingbird", "Harper Lee", 1960));

console.log("for...of 루프 사용:");
for (const book of collection) {
  console.log(`- ${book.title} (${book.author})`);
}

console.log("\n전개 연산자 사용:");
const bookArray = [...collection];
console.log(`총 ${bookArray.length}권의 책`);

console.log("\n배열 디스트럭처링:");
const [first, second] = collection;
console.log(`첫 번째: ${first.title}, 두 번째: ${second.title}`);
```

위 코드에서 `Symbol.iterator` 메서드는 `IteratorResult<Book>` 타입의 객체를 반환하는 `next()` 메서드를 가진 객체를 반환한다.

`BookCollection`은 자동으로 이터러블 객체가 되어, `for...of` 루프, 전개 연산자(`...`), 배열 디스트럭처링, `Array.from()` 등 JavaScript의 다양한 내장 기능을 바로 사용할 수 있다. 별도의 이터레이터 클래스를 만들 필요 없이 컬렉션 자체가 순회 가능한 객체가 되므로 더 간결하게 코드를 작성할 수 있다.

### 다양한 순회 방식 제공

동일한 컬렉션에 대해 여러 가지 순회 방식을 제공해야 할 때, 각 순회 방식을 별도의 이터레이터 클래스로 구현할 수 있다.

예를 들어 정방향 순회와 역방향 순회를 모두 지원하려면, 각각 `BookIterator`와 `ReverseBookIterator`를 만들고 둘 다 `Iterator<Book>` 인터페이스를 구현하면 된다.

```typescript
interface Iterator<T> {
  hasNext(): boolean;
  next(): T | null;
  reset(): void;
}

interface Iterable<T> {
  createIterator(): Iterator<T>;
}

class Book {
  constructor(
    public title: string,
    public author: string,
    public year: number
  ) {}
}

class BookIterator implements Iterator<Book> {
  private currentIndex: number = 0;

  constructor(private books: Book[]) {}

  hasNext(): boolean {
    return this.currentIndex < this.books.length;
  }

  next(): Book | null {
    if (this.hasNext()) {
      return this.books[this.currentIndex++];
    }
    return null;
  }

  reset(): void {
    this.currentIndex = 0;
  }
}

class ReverseBookIterator implements Iterator<Book> {
  private currentIndex: number;

  constructor(private books: Book[]) {
    this.currentIndex = books.length - 1;
  }

  hasNext(): boolean {
    return this.currentIndex >= 0;
  }

  next(): Book | null {
    if (this.hasNext()) {
      return this.books[this.currentIndex--];
    }
    return null;
  }

  reset(): void {
    this.currentIndex = this.books.length - 1;
  }
}

class BookCollection implements Iterable<Book> {
  private books: Book[] = [];

  addBook(book: Book): void {
    this.books.push(book);
  }

  createIterator(): Iterator<Book> {
    return new BookIterator(this.books);
  }

  createReverseIterator(): Iterator<Book> {
    return new ReverseBookIterator(this.books);
  }
}

// 사용 예제
const collection = new BookCollection();
collection.addBook(new Book("1984", "George Orwell", 1949));
collection.addBook(new Book("The Great Gatsby", "F. Scott Fitzgerald", 1925));
collection.addBook(new Book("To Kill a Mockingbird", "Harper Lee", 1960));

console.log("정방향 순회:");
let iterator = collection.createIterator();
while (iterator.hasNext()) {
  const book = iterator.next();
  if (book) console.log(`- ${book.title}`);
}

console.log("\n역방향 순회:");
const reverseIterator = collection.createReverseIterator();
while (reverseIterator.hasNext()) {
  const book = reverseIterator.next();
  if (book) console.log(`- ${book.title}`);
}
```

위 코드에서 `BookIterator`는 정방향으로 순회하고, `ReverseBookIterator`는 `currentIndex`를 역방향으로 순회한다.

두 이터레이터 모두 동일한 `Iterator<Book>` 인터페이스를 구현하므로, 사용하는 쪽에서는 어떤 이터레이터를 사용하든 `hasNext()`와 `next()` 메서드만 사용하면 된다. 이렇게 하면 정방향과 역방향 순회를 동일한 방식으로 처리할 수 있으며, 새로운 순회 방식을 추가해도 기존 코드를 수정하지 않아도 된다.

### 제너레이터를 활용한 이터레이터

제너레이터 함수를 사용하면 이터레이터를 더 간단하게 구현할 수 있다. 제너레이터는 `function*` 문법으로 정의하며, `yield` 키워드로 값을 하나씩 반환한다. 제너레이터 함수는 자동으로 이터레이터 프로토콜을 구현하므로, 별도의 `next()` 메서드를 작성할 필요가 없다.

제너레이터의 가장 큰 장점은 모든 값을 미리 생성하지 않고 필요할 때마다 생성하므로, 대용량 데이터를 다룰 때 메모리 효율적이다.

```typescript
class Range {
  constructor(
    private start: number,
    private end: number,
    private step: number = 1
  ) {}

  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i += this.step) {
      yield i;
    }
  }

  *reverse() {
    for (let i = this.end; i >= this.start; i -= this.step) {
      yield i;
    }
  }

  *filter(predicate: (value: number) => boolean) {
    for (let i = this.start; i <= this.end; i += this.step) {
      if (predicate(i)) {
        yield i;
      }
    }
  }
}

// 사용 예제
const range = new Range(1, 10, 2);

console.log("정방향:");
for (const num of range) {
  console.log(num); // 1, 3, 5, 7, 9
}

console.log("\n역방향:");
for (const num of range.reverse()) {
  console.log(num); // 9, 7, 5, 3, 1
}

console.log("\n짝수만 필터:");
for (const num of range.filter((n) => n % 2 === 0)) {
  console.log(num);
}

console.log("\n배열로 변환:");
const numbers = [...range];
console.log(numbers); // [1, 3, 5, 7, 9]
```

위 코드에서 `*[Symbol.iterator]()`는 제너레이터 메서드로, `yield` 키워드를 사용하여 값을 하나씩 반환한다. `*reverse()`와 `*filter()`도 제너레이터 메서드로, 각각 역방향 순회와 필터링된 순회를 제공한다.

제너레이터 함수는 자동으로 이터레이터 프로토콜을 구현하므로, 별도의 `next()` 메서드나 상태 관리 로직을 작성할 필요가 없다. `yield`를 만나면 함수 실행이 일시 중지되고 값을 반환하며, 다음 `next()` 호출 시 그 다음 줄부터 계속 실행된다.

클래스 기반 이터레이터와 달리 제너레이터는 복잡한 상태 관리 없이 간결하게 이터레이터를 만들 수 있다. 또한 **지연 평가**(lazy evaluation)를 통해 필요한 값만 생성하므로, 전체 범위를 메모리에 올리지 않고도 순회할 수 있어 대용량 데이터를 다룰 때 효율적이다.

예를 들어 `Range(1, 1000000)`을 생성해도 실제로는 `for...of` 루프에서 요청하는 값만 생성되므로, 메모리 사용량이 크게 줄어든다. 또한 `filter()` 메서드처럼 조건에 맞는 값만 생성하므로 불필요한 계산을 피할 수 있다.

## 이터레이터 패턴의 장점

컬렉션의 내부 구조를 노출하지 않고도 요소에 접근할 수 있어, 내부 구현이 변경되어도 사용하는 쪽 코드를 수정할 필요가 없다. `hasNext()`와 `next()` 메서드만 사용하면 되므로, 컬렉션의 종류에 관계없이 동일한 방식으로 요소에 접근할 수 있다.

컬렉션 관리와 순회 로직을 분리하여 각각의 책임을 명확히 한다. 컬렉션은 데이터를 관리하는 역할만 하고, 이터레이터는 순회하는 역할만 담당하므로 **단일 책임 원칙**을 준수한다.

동일한 컬렉션에 대해 정방향, 역방향, 필터링 등 **다양한 순회 방식을 제공**할 수 있다. 각 순회 방식은 별도의 이터레이터 클래스로 구현하므로, 새로운 순회 방식을 추가해도 기존 코드를 수정하지 않아도 된다.

## 이터레이터 패턴의 단점

JavaScript 내장 배열 메서드나 `for...of` 루프만으로 충분한 경우가 많으므로, 배열처럼 단순한 자료구조에 이터레이터를 추가하면 오히려 코드가 복잡해질 수 있다.

이터레이터 객체가 순회 상태(`currentIndex`, `stack`, `queue` 등)를 저장하므로 **추가 메모리 사용**이 발생한다. 특히 여러 이터레이터를 동시에 사용하는 경우 메모리 사용량이 증가할 수 있다.

직접 인덱스로 접근하는 것보다 이터레이터를 통한 접근이 약간 느릴 수 있다. 메서드 호출 오버헤드와 상태 관리 비용으로 인해 **성능 오버헤드**가 발생할 수 있다.

## 이터레이터 패턴 사용 시 고려사항

이터레이터 패턴은 **복잡한 자료구조를 순회해야 하는 경우**에 유용하다. 트리, 그래프 등 내부 구조가 복잡한 경우 이터레이터가 순회를 단순화하고, 사용하는 쪽에서는 복잡한 내부 구조를 알 필요 없이 요소에 접근할 수 있다.

구현 세부사항을 노출하지 않고 요소에 접근할 수 있는 인터페이스를 제공하여, **컬렉션의 내부 구조를 숨기고 싶은 경우** 이터레이터 패턴이 적합하다.

동일한 데이터를 정방향, 역방향, 필터링 등 **다양한 순회 방식이 필요한 경우** 각각의 이터레이터를 만들면 되며, 새로운 순회 방식을 추가해도 기존 코드를 수정하지 않아도 된다.

반면 **단순한 배열이나 리스트만 사용하는 경우**에는 언어에 내장된 배열 메서드를 사용해도 충분한 경우가 많다. **성능이 매우 중요하고 컬렉션이 단순한 경우**에도 직접 인덱스로 접근하는 것이 더 효율적일 수 있다.
