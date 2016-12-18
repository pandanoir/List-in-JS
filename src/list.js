const objToString = Object.prototype.toString;
class InfinityList {
    constructor(generator) {
        this.generator = generator;
    }
    '!!'(n) {
        if (n < 0) throw Error('!! got negative index.');
        if (n === 0) return this.head();
        return this.tail()['!!'](n - 1);
    }
    concat(b) {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            yield* gen();
            yield* b.generator();
        });
        return res;
    }
    drop(n) {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            for (let i = 0; i < n; i++) iter.next();
            yield* iter;
        });
        return res;
    }
    foldr(f, acc) {
        if (this.generator().next().done) return acc;
        return f(this.head(), this.tail().foldr(f, acc));
    }
    head() {
        const iter = this.generator();
        return iter.next().value;
    }
    init() {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            let val = iter.next();
            let next = iter.next();
            while (!next.done) {
                yield val.value;
                val = next;
                next = iter.next();
            }
        });
        return res;
    }
    inits() {
        if (this.generator().next().done) return List.empty;
        return this.init().inits().concat(this);
    }
    insert(n) {
        if (this.head() < n) {
            return List.of(this.head()).concat(this.tail().insert(n));
        } else {
            return List.of(n).concat(this);
        }
    }
    intersect(l) {
        const res = [];
        for (const val of this.generator()) {
            if (l.any(x => x === val)) res.push(val);
        }
        return new List(res);
    }
    intersperse(s) {
        const iter = this.generator();
        if (iter.next().done) return List.empty;
        if (iter.next().done) return this;
        return new List([this.head(), s]).concat(this.tail().intersperse(s));
    }
    lines() {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            let line = '';
            for (const val of iter) {
                if (val === '\n') {
                    if (line !== '') {
                        yield line;
                        line = '';
                    }
                } else line += val;
            }
        });
        return res;
    }
    span(f) {
        if (f(this.head())) {
            const [ys, zs] = this.tail().span(f);
            return [List.of(this.head()).concat(ys), zs];
        } else return [List.empty, this];
    }
    tail() {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            iter.next();
            yield* iter;
        });
        return res;
    }
    tails() {
        const self = this;
        const res = new InfinityList(function*() {
            let tail = self;
            while (true) {
                yield tail;
                tail = tail.tail();
                if (tail.generator().next().done) break;
            }
        });
        return res;
    }
    map(f) {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            for (const val of iter) {
                yield f(val);
            }
        });
        return res;
    }
    take(n) {
        const res = [];
        const iter = this.generator();
        for (let i = 0; i < n; i = 0 | i + 1) {
            res.push(iter.next().value);
        }
        return new List(res);
    }
    takeWhile(f) {
        const res = [];
        const iter = this.generator();
        for (const val of iter) {
            if (!f(val)) break;
            res.push(val);
        }
        return new List(res);
    }
    unlines() {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            for (const val of iter) {
                yield* val;
                yield '\n';
            }
        });
        return res;
    }
    unwords() {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            yield* iter.next().value;
            for (const val of iter) {
                yield ' ';
                yield* val;
            }
        });
        return res;
    }
    words() {
        const gen = this.generator;
        const res = new InfinityList(function*() {
            const iter = gen();
            const ws = /\s/;
            let word = '';
            for (const val of iter) {
                if (ws.test(val)) {
                    if (word !== '') {
                        yield word;
                        word = '';
                    }
                } else word += val;
            }
        });
        return res;
    }
}

export default class List extends InfinityList {
    constructor(_arr) {
        if (!Array.isArray(_arr)) {
            throw Error('expect array. Got ' + _arr);
            return;
        }
        super();
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
        this.generator = function*() {
            yield* arr;
        }
    }
    '\\'(l) {
        let res = this;
        for (const val of l.generator()) {
            res = res.delete(val);
        }
        return res;
    }
    '\\\\'(l) {
        return this['\\'](l);
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
        if (b instanceof List) return new List(this.value.concat(b.value));
        return super.concat(b);
    }
    cycle() {
        const value = this.value;
        const res = new InfinityList(function*() {
            while (true) {
                yield* value;
            }
        });
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
        if (!(b instanceof List)) return false;
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
    foldr1(f, acc) {
        return this.init().foldr(f, this.last());
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
    lines() {
        const iter = this.generator();
        const res = [];
        let line = '';
        for (const val of iter) {
            if (val === '\n') {
                if (line !== '') {
                    res.push(line);
                    line = '';
                }
            } else line += val;
        }
        if (line !== '') res.push(line);
        return new List(res);
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
        return List.of(x).concat(xs.filter(y => x !== y).nub());
    }
    of(...args) {
        return new List(args);
    }
    or() {
        return this.foldl((a, b) => a || b, false);
    }
    permutations() {
        let res = List.empty;
        if (this.length === 0) return List.of(List.empty);
        for (let i = 0, _i = this.length; i < _i; i++) {
            res = res.concat(this.take(i).concat(this.drop(i + 1)).permutations().map(l => List.of(this.value[i]).concat(l)));
        }
        return res;
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
    sort() {
        return new List(this.value.concat().sort((a, b) => a > b));
    }
    sortBy(f) {
        return new List(this.value.concat().sort(f));
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
    union(l) {
        return this.concat(l.nub()['\\'](this));
    }
    unlines() {
        let res = '';
        for (let i = 0, _i = this.length; i < _i; i++) {
            if (objToString.call(this.value[i]) !== '[object String]') throw Error('expected [String].');
            res += this.value[i] + '\n';
        }
        return new List([...res]);
    }
    unwords() {
        const res = [];
        for (let i = 0, _i = this.length; i < _i; i++) {
            if (objToString.call(this.value[i]) !== '[object String]') throw Error('expected [String].');
            res.push(this.value[i]);
        }
        return new List([...res.join(' ')])
    }
    unzipHelper(n) {
        const get = n => x => x['!!'] ? x['!!'](n) : x[n];
        const res = [];
        for (let i = 0; i < n; i++) {
            res.push(this.map(get(i)));
        }
        return new List(res);
    }
    unzip() {return this.unzipHelper(2);}
    unzip3() {return this.unzipHelper(3);}
    unzip4() {return this.unzipHelper(4);}
    unzip5() {return this.unzipHelper(5);}
    unzip6() {return this.unzipHelper(6);}
    unzip7() {return this.unzipHelper(7);}
    words() {
        const iter = this.generator();
        const res = [];
        const ws = /\s/;
        let word = '';
        for (const val of iter) {
            if (ws.test(val)) {
                if (word !== '') {
                    res.push(word);
                    word = '';
                }
            } else word += val;
        }
        if (word !== '') res.push(word);
        return new List(res);
    }
};
List.pure = x => new List([x]);
List.concat = list => {
    if (list.length === 0) return List.empty;
    return list.head().concat(List.concat(list.tail()));
};
List.empty = new List([]);
List.iterate = (f, _x) => {
    // create infinity list
    const res = new InfinityList(function*() {
        let x = _x;
        while (true) yield [x, x = f(x)][0];
    });
    return res;
};
List.repeat = x => {
    const res = new InfinityList(function*() {
        while (true) yield x;
    });
    return res;
}
List.replicate = (n, x) => {
    return List.repeat(x).take(n);
}
List.of = List.prototype.of;
List._zip_ = (...args) => {
    args = args.map(val => {
        if (val instanceof List) return val.toArray();
        return val;
    });
    const n = Math.min(...(args.map(a => a.length)));
    const res = [];
    for (let i = 0; i < n; i++) {
        res.push(new List(args.map(a => a[i])));
    }
    return new List(res);
};
List._zipWith_ = (f, ...args) => {
    args = args.map(val => {
        if (val instanceof List) return val.toArray();
        return val;
    });
    const n = Math.min(...(args.map(a => a.length)));
    const res = [];
    for (let i = 0; i < n; i++) {
        res.push(f(...args.map(a => a[i])));
    }
    return new List(res);
};
List.zip = (a, b) => List._zip_(a, b);
List.zip3 = (a, b, c) => List._zip_(a, b, c);
List.zip4 = (a, b, c, d) => List._zip_(a, b, c, d);
List.zip5 = (a, b, c, d, e) => List._zip_(a, b, c, d, e);
List.zip6 = (a, b, c, d, e, f) => List._zip_(a, b, c, d, e, f);
List.zip7 = (a, b, c, d, e, f, g) => List._zip_(a, b, c, d, e, f, g);

List.zipWith = (_f, a, b) => List._zipWith_(_f, a, b);
List.zipWith3 = (_f, a, b, c) => List._zipWith_(_f, a, b, c);
List.zipWith4 = (_f, a, b, c, d) => List._zipWith_(_f, a, b, c, d);
List.zipWith5 = (_f, a, b, c, d, e) => List._zipWith_(_f, a, b, c, d, e);
List.zipWith6 = (_f, a, b, c, d, e, f) => List._zipWith_(_f, a, b, c, d, e, f);
List.zipWith7 = (_f, a, b, c, d, e, f, g) => List._zipWith_(_f, a, b, c, d, e, f, g);
