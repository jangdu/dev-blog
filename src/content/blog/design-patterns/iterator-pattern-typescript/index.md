---
title: "이터레이터 패턴 (Iterator Pattern)"
summary: "TypeScript/JavaScript에서 이터레이터 패턴 구현"
date: "Dec 24 2024"
draft: false
tags:
  - Design Pattern
  - TypeScript
  - JavaScript
---

이터레이터 패턴(Iterator Pattern)은 **컬렉션의 내부 구조를 노출하지 않으면서 순차적으로 요소에 접근**할 수 있게 하는 행동 디자인 패턴이다. 컬렉션과 순회 로직을 분리하여 일관된 방식으로 다양한 컬렉션을 탐색할 수 있다.

이 패턴은 복잡한 자료구조를 순회하거나, 다양한 순회 방식을 제공하거나, 컬렉션의 내부 구조를 숨기고 싶을 때 유용하다. JavaScript/TypeScript에서는 내장 이터레이터 프로토콜을 통해 for...of 루프와 함께 사용된다.

## JavaScript로 이터레이터 패턴 구현하기

배열과 같은 단순한 자료구조는 인덱스로 접근할 수 있지만, 복잡한 자료구조는 순회 방법이 명확하지 않다.

```javascript
class BookCollection {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  getBooks() {
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

위 코드는 내부 배열을 직접 노출하여 캡슐화를 위반하며, 컬렉션의 내부 구조에 의존하게 된다.

### 기본 구현

이터레이터 패턴은 순회 로직을 별도의 이터레이터 객체로 분리한다.

```javascript
class Book {
  constructor(title, author, year) {
    this.title = title;
    this.author = author;
    this.year = year;
  }
}

class BookIterator {
  constructor(books) {
    this.books = books;
    this.currentIndex = 0;
  }

  hasNext() {
    return this.currentIndex < this.books.length;
  }

  next() {
    if (this.hasNext()) {
      return this.books[this.currentIndex++];
    }
    return null;
  }

  reset() {
    this.currentIndex = 0;
  }
}

class BookCollection {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  createIterator() {
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
  console.log(`- ${book.title} (${book.author}, ${book.year})`);
}
```

`BookIterator`는 컬렉션의 순회 상태를 관리하며, `hasNext()`와 `next()` 메서드만 사용하면 된다. 컬렉션의 내부 구조가 변경되어도 이터레이터 인터페이스는 동일하게 유지된다.

### JavaScript 이터레이터 프로토콜 활용

JavaScript ES6부터는 이터레이터 프로토콜이 내장되어 있어 `for...of` 루프와 함께 사용할 수 있다.

```javascript
class Book {
  constructor(title, author, year) {
    this.title = title;
    this.author = author;
    this.year = year;
  }
}

class BookCollection {
  constructor() {
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
  }

  // 이터레이터 프로토콜 구현
  [Symbol.iterator]() {
    let index = 0;
    const books = this.books;

    return {
      next() {
        if (index < books.length) {
          return { value: books[index++], done: false };
        } else {
          return { done: true };
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

`Symbol.iterator` 메서드를 구현하면 JavaScript의 다양한 이터러블 기능을 사용할 수 있다. `for...of` 루프, 전개 연산자, 배열 디스트럭처링 등이 모두 이터레이터 프로토콜을 기반으로 동작한다.

### TypeScript로 타입 안전성 강화하기

TypeScript를 사용하면 이터레이터 인터페이스를 명시적으로 정의할 수 있다.

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

인터페이스를 통해 이터레이터의 계약을 명확히 정의하고, 다양한 순회 방식을 제공할 수 있다. `ReverseBookIterator`는 역방향 순회를 구현하며, 동일한 인터페이스로 두 이터레이터를 사용할 수 있다.

### 실제 사용 예제: 트리 순회

```typescript
class TreeNode<T> {
  constructor(
    public value: T,
    public children: TreeNode<T>[] = []
  ) {}

  addChild(child: TreeNode<T>): void {
    this.children.push(child);
  }
}

class TreeIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[] = [];

  constructor(root: TreeNode<T>) {
    this.stack.push(root);
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  next(): T | null {
    if (!this.hasNext()) return null;

    const node = this.stack.pop()!;

    // 자식 노드를 스택에 추가 (역순으로 추가하여 왼쪽부터 순회)
    for (let i = node.children.length - 1; i >= 0; i--) {
      this.stack.push(node.children[i]);
    }

    return node.value;
  }

  reset(): void {
    this.stack = [];
  }
}

class BreadthFirstIterator<T> implements Iterator<T> {
  private queue: TreeNode<T>[] = [];

  constructor(root: TreeNode<T>) {
    this.queue.push(root);
  }

  hasNext(): boolean {
    return this.queue.length > 0;
  }

  next(): T | null {
    if (!this.hasNext()) return null;

    const node = this.queue.shift()!;

    // 자식 노드를 큐에 추가
    node.children.forEach((child) => this.queue.push(child));

    return node.value;
  }

  reset(): void {
    this.queue = [];
  }
}

class Tree<T> implements Iterable<T> {
  constructor(private root: TreeNode<T>) {}

  createIterator(): Iterator<T> {
    return new TreeIterator(this.root);
  }

  createBreadthFirstIterator(): Iterator<T> {
    return new BreadthFirstIterator(this.root);
  }

  getRoot(): TreeNode<T> {
    return this.root;
  }
}

// 사용 예제
const root = new TreeNode("Root");
const child1 = new TreeNode("Child 1");
const child2 = new TreeNode("Child 2");
const child3 = new TreeNode("Child 3");
const grandchild1 = new TreeNode("Grandchild 1");
const grandchild2 = new TreeNode("Grandchild 2");

root.addChild(child1);
root.addChild(child2);
root.addChild(child3);
child1.addChild(grandchild1);
child1.addChild(grandchild2);

const tree = new Tree(root);

console.log("깊이 우선 순회 (DFS):");
const dfsIterator = tree.createIterator();
while (dfsIterator.hasNext()) {
  console.log(`- ${dfsIterator.next()}`);
}

console.log("\n너비 우선 순회 (BFS):");
const bfsIterator = tree.createBreadthFirstIterator();
while (bfsIterator.hasNext()) {
  console.log(`- ${bfsIterator.next()}`);
}
```

트리 구조에서 깊이 우선 탐색(DFS)과 너비 우선 탐색(BFS)을 각각의 이터레이터로 구현했다. 동일한 트리 자료구조에 대해 다양한 순회 방식을 제공하며, 이터레이터 인터페이스만 사용하면 된다.

### 제너레이터를 활용한 이터레이터

JavaScript/TypeScript의 제너레이터 함수를 사용하면 이터레이터를 더 간단하게 구현할 수 있다.

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

제너레이터 함수는 `yield` 키워드로 값을 하나씩 반환하며, 자동으로 이터레이터 프로토콜을 구현한다. 복잡한 상태 관리 없이 간결하게 이터레이터를 만들 수 있고, 지연 평가를 통해 필요한 값만 생성한다.

## 이터레이터 패턴의 장점

이터레이터 패턴을 사용하면 **캡슐화가 향상**된다. 컬렉션의 내부 구조를 노출하지 않고도 요소에 접근할 수 있다.

**단일 책임 원칙(SRP)** 준수 측면에서도 이터레이터 패턴은 유용하다. 컬렉션 관리와 순회 로직을 분리하여 각각의 책임을 명확히 한다.

**다양한 순회 방식 제공**이 가능하다는 점도 중요한 장점이다. 동일한 컬렉션에 대해 정방향, 역방향, 필터링 등 다양한 이터레이터를 제공할 수 있다.

**일관된 인터페이스**를 통해 다양한 컬렉션을 동일한 방식으로 순회할 수 있다. 배열, 트리, 그래프 등 내부 구조가 다르더라도 같은 이터레이터 인터페이스를 사용한다.

## 이터레이터 패턴의 단점

이터레이터 패턴을 사용할 때는 **간단한 컬렉션의 복잡도 증가** 문제를 고려해야 한다. 배열처럼 단순한 자료구조에 이터레이터를 추가하면 오히려 코드가 복잡해질 수 있다.

**추가 메모리 사용**도 문제가 될 수 있다. 이터레이터 객체가 순회 상태를 저장하므로 메모리를 추가로 사용한다.

**성능 오버헤드** 가능성도 존재한다. 직접 인덱스로 접근하는 것보다 이터레이터를 통한 접근이 약간 느릴 수 있다.

## 이터레이터 패턴 사용 시 고려사항

이터레이터 패턴은 **복잡한 자료구조를 순회해야 하는 경우**에 유용하다. 트리, 그래프, 커스텀 컬렉션 등 내부 구조가 복잡한 경우 이터레이터가 순회를 단순화한다.

**컬렉션의 내부 구조를 숨기고 싶은 경우**에도 이터레이터 패턴이 적합하다. 구현 세부사항을 노출하지 않고 요소에 접근할 수 있는 인터페이스를 제공한다.

**다양한 순회 방식이 필요한 경우**라면 이터레이터 패턴을 고려해볼 만하다. 같은 데이터를 여러 방식으로 순회해야 할 때 각각의 이터레이터를 만들면 된다.

반면 **단순한 배열이나 리스트만 사용하는 경우**에는 이터레이터 패턴이 과도할 수 있다. JavaScript 내장 배열 메서드나 `for...of` 루프만으로 충분한 경우가 많다. **성능이 매우 중요하고 컬렉션이 단순한 경우**에도 직접 인덱스로 접근하는 것이 더 효율적일 수 있다.

이터레이터 패턴은 복잡한 컬렉션의 순회를 캡슐화하고 다양한 순회 방식을 제공하는 데 매우 유용한 디자인 패턴이다.
