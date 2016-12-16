const objToString = Object.prototype.toString;
export default class List {
    constructor(_arr) {
        if (!Array.isArray(_arr)) {
            throw Error('expect array.got ' + _arr);
            return;
        }
        const arr = new Array(_arr.length);
        for (let i = 0, _i = _arr.length; i < _i; i++) {
            if (Array.isArray(_arr[i])) {
                arr[i] = new List(_arr[i]);
            } else {
                arr[i] = _arr[i];
            }
        }
        this.value = arr;
        this.length = arr.length;
    }
    '!!'(n) {
        if (n < 0) throw Error('!! got negative index.');
        return this.value[n];
    }
    all(f) {
        return this.map(f).and();
    }
    and() {
        return this.foldl((a, b) => a && b, true);
    }
    any(f) {
        return this.map(f).or();
    }
    ap(b) {
        const bLength = b.value.length;
        const res = new Array(this.value.length * bLength);
        for (let i = 0, _i = this.value.length; i < _i; i++) {
            for (let j = 0, _j = bLength; j < _j; j++) {
                res[i * bLength + j] = this.value[i](b.value[j]);
            }
        }
        return new List(res);
    }
    break(f) {
        for (let i = 0, _i = this.length; i < _i; i++) {
            if (f(this.value[i])) return [new List(this.value.slice(0, i)), new List(this.value.slice(i))];
        }
        return [this, List.empty];
    }
    chain(f) {
        return List.concat(this.map(f));
    }
    concatMap(f) {
        // same as chain()
        return List.concat(this.map(f));
    }
    concat(b) {
        return new List(this.value.concat(b.value));
    }
    cycle() {
        const res = new InfinityList();
        const value = this.value;
        res.iterator = function*() {
            while (true) {
                for (const val of value) {
                    yield val;
                }
            }
        };
        return res;
    }
    delete(a) {
        for (let i = 0, _i = this.length; i < _i; i++) {
            if (this.value[i] === a) return new List(this.value.slice(0, i).concat(this.value.slice(i + 1)));
        }
        return this;
    }
    deleteBy(f, x) {
        for (let i = 0, _i = this.length; i < _i; i++) {
            if (f(x, this.value[i])) return new List(this.value.slice(0, i).concat(this.value.slice(i + 1)));
        }
        return this;
    }
    drop(n) {
        if (n === 0) return this;
        return this.tail().drop(n - 1);
    }
    dropWhile(f) {
        if (f(this.head())) {
            return this.tail().dropWhile(f);
        }
        return this;
    }
    elem(x) {
        return this.any(y => x === y);
    }
    empty() {
        return List.empty;
    }
    equals(b) {
        function isEquals(a, b) {
            if (a.length !== b.length) return false;
            for (let i = 0, _i = a.length; i < _i; i++) {
                if (objToString.call(a[i]) !== objToString.call(b[i])) return false;
                if (a[i] && typeof a[i].equals === 'function') {
                    if (!a[i].equals(b[i])) return false;
                } else if (Array.isArray(a[i])) {
                    if (!isEquals(a[i], b[i])) return false;
                } else {
                    if (a[i] !== b[i]) return false;
                }
            }
            return true;
        };
        return isEquals(this.value, b.value);
    }
    filter(f) {
        return this.chain(m => f(m) ? List.pure(m) : List.empty);
    }
    foldl(f, acc) {
        if (this.value.length === 0) return acc;
        return this.tail().foldl(f, f(acc, this.head()));
    }
    reduce(f, acc) {
        // same as foldl()
        if (this.value.length === 0) return acc;
        return this.tail().foldl(f, f(acc, this.head()));
    }
    foldl1(f, acc) {
        return this.tail().foldl(f, this.head());
    }
    foldr(f, acc) {
        if (this.value.length === 0) return acc;
        return f(this.head(), this.tail().foldr(f, acc));
    }
    foldr1(f, acc) {
        return this.init().foldr(f, this.last());
    }
    head() {
        return this.value[0];
    }
    init() {
        return new List(this.value.slice(0, -1));
    }
    inits() {
        if (this.length === 0) return List.of(this.value);
        return this.init().inits().concat(List.of(this.value));
    }
    intercalate(s) {
        return List.concat(this.intersperse(s));
    }
    intersperse(s) {
        if (this.length === 0) return List.empty;
        if (this.length === 1) return this;
        return new List([this.head(), s]).concat(this.tail().intersperse(s));
    }
    isnull() {
        return this.equals(List.empty);
    }
    null() {
        // same as isnull()
        return this.equals(List.empty);
    }
    last() {
        return this.value[this.value.length - 1];
    }
    map(f) {
        const res = new Array(this.value.length);
        for (let i = 0, _i = res.length; i < _i; i++) {
            res[i] = f(this.value[i]);
        }
        return new List(res);
    }
    maximum() {
        if (this.value.length === 0) return undefined;
        if (this.value.length === 1) return this.value[0];
        const max = this.tail().maximum();
        if (max > this.head()) return max;
        else return this.head();
    }
    minimum() {
        if (this.value.length === 0) return undefined;
        if (this.value.length === 1) return this.value[0];
        const min = this.tail().minimum();
        if (min < this.head()) return min;
        else return this.head();
    }
    nub() {
        if (this.length === 0) return List.empty;
        const x = this.head(), xs = this.tail();
        return List.of(x).concat(xs.filter(y => x !== y).nub())
    }
    of(...args) {
        return new List(args);
    }
    or() {
        return this.foldl((a, b) => a || b, false);
    }
    product() {
        return this.foldl((a, b) => a * b, 1);
    }
    reverse() {
        if (this.value.length === 0) return List.empty;
        return this.tail().reverse().concat(List.of(this.head()));
    }
    scanl(f, acc) {
        return this.foldl((acc, x) => acc.concat(List.of(f(acc.last(), x))), List.of(acc));
    }
    scanr(f, acc) {
        return this.foldr((x, acc) => List.of(f(acc.head(), x)).concat(acc), List.of(acc));
    }
    sequence(of) {
        return this.foldr((m, ma) => m.chain(x => {
                if (ma.value.length === 0) return List.pure(x);
                return ma.chain(xs => List.pure(List.of(x).concat(xs)));
            }), new List([[]]));
    }
    span(f) {
        if (f(this.head())) {
            const res = this.tail().span(f);
            const ys = res[0], zs = res[1];
            return [List.of(this.head()).concat(ys), zs];
        } else return [List.empty, this];
    }
    subsequences() {
        return this.foldl((acc, x) => acc.concat(acc.map(item => item.concat(List.of(x)))), new List([List.empty]));
    }
    sum() {
        return this.foldl((a, b) => a + b, 0);
    }
    tail() {
        return new List(this.value.slice(1));
    }
    tails() {
        if (this.length === 0) return List.of(this.value);
        return List.of(this.value).concat(this.tail().tails());
    }
    take(n) {
        if (n === 0) return List.empty;
        return List.of(this.head()).concat(this.tail().take(n - 1));
    }
    takeWhile(f) {
        if (f(this.head())) {
            return List.of(this.head()).concat(this.tail().takeWhile(f));
        }
        return List.empty;
    }
    toArray() {
        return this.reduce((acc, x) => {
            if (x instanceof List) {
                return acc.concat([x.toArray()]);
            }
            return acc.concat(x);
        }, []);
    }
    transpose() {
        const max = this.map(item => item.length).maximum();
        const res = [];
        for (let i = 0; i < max; i++) {
            res[i] = [];
            for (let j = 0, _j = this.length; j < _j; j++) {
                if (this.value[j] && this.value[j].value && this.value[j].value[i]) {
                    res[i].push(this.value[j].value[i]);
                }
            }
        }
        return new List(res);
    }
    traverse(f, of) {
        return this.map(f).sequence(of);
    }
};
List.pure = x => new List([x]);
List.concat = list => {
    if (list.length === 0) return List.empty;
    return list.head().concat(List.concat(list.tail()));
};
List.empty = new List([]);
List.iterate = (f, x) => {
    // create infinity list
    const res = new InfinityList();
    res.iterator = function*() {
        while (true) yield [x, x = f(x)][0];
    };
    return res;
};
List.repeat = x => {
    const res = new InfinityList();
    res.iterator = function*() {
        while (true) yield x;
    }
    return res;
}
List.replicate = (n, x) => {
    return List.repeat(x).take(n);
}
List.of = List.prototype.of;
class InfinityList {
    constructor() {}
    take(n) {
        const res = [];
        const iter = this.iterator();
        for (let i = 0; i < n; i = 0 | i + 1) {
            res.push(iter.next().value);
        }
        return new List(res);
    }
    takeWhile(f) {
        const res = [];
        const iter = this.iterator();
        for (const val of iter) {
            if (!f(val)) break;
            res.push(val);
        }
        return new List(res);
    }
}

// List.prototype['!!'] = function(n) {
//     if (n === 0) return this.head();
//     if (n < 0) throw Error('!! got negative index.');
//     return this.tail()['!!'](n-1);
// };
if (typeof [].map === 'function') {
    List.prototype.map = function(f) {
        return new List(this.value.map(x => f(x)));
    };
}
if (typeof [].reduce === 'function') {
    List.prototype.foldl = List.prototype.reduce = function(f, acc) {
        return this.value.reduce(f, acc);
    };
}
if (typeof [].reduceRight === 'function') {
    List.prototype.foldr = function(f, acc) {
        return this.value.reduceRight((acc, x) => f(x, acc), acc);
    };
}
