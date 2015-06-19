#About
List in JS provides List like List of Haskell. List in JS implements [Fantasy Land Specification](https://github.com/fantasyland/fantasy-land). List is a Setoid, a Semigroup, a Monoid, a Functor, an Applicative Functor, Foldable, Traversable, a Chain and a Monad.

#Methods
Methods of List behave not like Array of JavaScript but like List of Haskell. So List don't have .slice() but have .tail().

* `List.empty()` returns `new List([])`.
* `List.prototype.empty()` is alias of `List.empty()`.
* `List.prototype.map(f)` return the list of which f applies each item.
* `List.prototype.reduce(f,acc)` is alias of `List.prototype.foldl()`.
* `List.of(x1,x2,..)` returns `new List([x1,x2,..])`.
* `List.prototype.of(x1,x2,..)` is alias of `List.of()`.
* `List.prototype.ap(f)` applies List to f as Applicative Functor.
* `List.prototype.concat(b)` concatenates List and b.
* `List.prototype.equals(a,b)` returns whether a equals b or not.
* `List.prototype.chain(f)` is the same function as >>= in Haskell.
* `List.prototype.traverse(f, of)`
* `List.prototype.sequence(of)`
* `List.prototype.foldr(f,acc)`
* `List.prototype.foldl(f,acc)`
* `List.prototype.head()`
* `List.prototype.tail()`
* `List.prototype.last()`
* `List.prototype.init()`
* `List.prototype.isnull()`
* `List.prototype.length()`
* `List.prototype.toArray() `
* `List.prototype.filter(f)`
* `List.prototype.reverse()`
* `List.prototype.and()`
* `List.prototype.or()`
* `List.prototype.any(f)`
* `List.prototype.all(f)`
* `List.prototype.sum()`
* `List.prototype.product()`
* `List.prototype.maximum()`
* `List.prototype.minimum()`
* `List.pure(x)`
* `List.concat(arr)`
