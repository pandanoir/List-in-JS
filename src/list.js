var objToString = Object.prototype.toString;
function isArray(arr) {
    return objToString.call(arr) === '[object Array]';
};
var List = function(_arr) {
    if (!isArray(_arr)) {
        throw Error('expect array.got ' + _arr);
        return;
    }
    var arr = new Array(_arr.length);
    for (var i = 0, _i = _arr.length; i < _i; i++) {
        if (isArray(_arr[i])) {
            arr[i] = new List(_arr[i]);
        } else {
            arr[i] = _arr[i];
        }
    }
    this.value = arr;
    return this;
};
List.fn = List.prototype;
List.pure = function(x) {
    return new List([x]);
};
List.concat = function(list) {
    if (list.length() === 0) return List.empty();
    return list.head().concat(List.concat(list.tail()));
};

List.fn.all = function(f) {
    return this.map(f).and();
};
List.fn.and = function() {
    return this.foldl(function(a, b) {return a && b;}, true);
};
List.fn.any = function(f) {
    return this.map(f).or();
};
List.fn.ap = function(b) {
    var bLength = b.value.length;
    var res = new Array(this.value.length * bLength);
    for (var i = 0, _i = this.value.length; i < _i; i++) {
        for (var j = 0, _j = bLength; j < _j; j++) {
            res[i * bLength + j] = this.value[i](b.value[j]);
        }
    }
    return new List(res);
};
List.fn.chain = List.fn.concatMap = function(f) {
    return List.concat(this.map(f));
};
List.fn.concat = function(b) {
    return new List(this.value.concat(b.value));
};
List.fn.drop = function(n) {
    if (n === 0) return this;
    return this.tail().drop(n - 1);
};
List.fn.dropWhile = function(f) {
    if (f(this.head())) {
        return this.tail().dropWhile(f);
    }
    return this;
};
List.empty = List.fn.empty = function() {
    return new List([]);
};
List.fn.equals = function(b) {
    function isEquals(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0, _i = a.length; i < _i; i++) {
            if (objToString.call(a[i]) !== objToString.call(b[i])) return false;
            if (a[i] && typeof a[i].equals === 'function') {
                if (!a[i].equals(b[i])) return false;
            } else if (isArray(a[i])) {
                if (!isEquals(a[i], b[i])) return false;
            } else {
                if (a[i] !== b[i]) return false;
            }
        }
        return true;
    };
    return isEquals(this.value, b.value);
};
List.fn.filter = function(f) {
    return this.chain(function(m) {
        return f(m) ? List.pure(m) : List.empty();
    });
};
List.fn.foldl = List.fn.reduce = function(f, acc) {
    if (this.value.length === 0) return acc;
    return this.tail().foldl(f, f(acc, this.head()));
};
List.fn.foldl1 = function(f, acc) {
    return this.tail().foldl(f, this.head());
};
List.fn.foldr = function(f, acc) {
    if (this.value.length === 0) return acc;
    return f(this.head(), this.tail().foldr(f, acc));
};
List.fn.foldr1 = function(f, acc) {
    return this.init().foldr(f, this.last());
};
List.fn.head = function() {
    return this.value[0];
};
List.fn.init = function() {
    return new List(this.value.slice(0, -1));
};
List.fn.inits = function() {
    if (this.length() === 0) return List.of(this);
    return this.init().inits().concat(List.of(this));
};
List.fn.intercalate = function(s) {
    return List.concat(this.intersperse(s));
};
List.fn.intersperse = function(s) {
    if (this.length() === 0) return List.empty();
    if (this.length() === 1) return this;
    return new List([this.head(), s]).concat(this.tail().intersperse(s));
};
List.fn.isnull = List.fn['null'] = function() {
    return this.equals(List.empty());
};
List.fn.last = function() {
    return this.value[this.value.length - 1];
};
List.fn.length = function() {
    return this.value.length;
};
List.fn.map = function(f) {
    var res = new Array(this.value.length);
    for (var i = 0, _i = res.length; i < _i; i++) {
        res[i] = f(this.value[i]);
    }
    return new List(res);
};
List.fn.maximum = function() {
    if (this.value.length === 0) return undefined;
    if (this.value.length === 1) return this.value[0];
    var max = this.tail().maximum();
    if (max > this.head()) return max;
    else return this.head();
};
List.fn.minimum = function() {
    if (this.value.length === 0) return undefined;
    if (this.value.length === 1) return this.value[0];
    var min = this.tail().minimum();
    if (min < this.head()) return min;
    else return this.head();
};
List.of = List.fn.of = function() {
    var args = new Array(arguments.length);
    for (var i = 0, _i = args.length; i < _i; i++) {
        args[i] = arguments[i];
    }
    return new List(args);
};
List.fn.or = function() {
    return this.foldl(function(a, b) {return a || b;}, false);
};
List.fn.product = function() {
    return this.foldl(function(a, b) {return a * b;}, 1);
};
List.fn.reverse = function() {
    if (this.value.length === 0) return List.empty();
    return this.tail().reverse().concat(List.of(this.head()));
};
List.fn.scanl = function(f, acc) {
    return this.foldl(function(acc, x) {
        return acc.concat(List.of(f(acc.last(), x)));
    }, List.of(acc));
};
List.fn.scanr = function(f, acc) {
    return this.foldr(function(x, acc) {
        return List.of(f(acc.head(), x)).concat(acc);
    }, List.of(acc));
};
List.fn.sequence = function(of) {
    return this.foldr(function(m, ma) {
        return m.chain(function(x) {
            if (ma.value.length === 0) return List.pure(x);
            return ma.chain(function(xs) {
                return List.pure(List.of(x).concat(xs));
            });
        })
    }, new List([[]]));
};
List.fn.subsequences = function() {
    return this.foldl(function(acc, x) {
        return acc.concat(acc.map(function(item) {return item.concat(List.of(x))}));
    }, new List([List.empty()]));
};
List.fn.sum = function() {
    return this.foldl(function(a, b) {return a + b;}, 0);
};
List.fn.tail = function() {
    return new List(this.value.slice(1));
};
List.fn.tails = function() {
    if (this.length() === 0) return List.of(this);
    return List.of(this).concat(this.tail().tails());
};
List.fn.take = function(n) {
    if (n === 0) return List.empty();
    return List.of(this.head()).concat(this.tail().take(n - 1));
};
List.fn.takeWhile = function(f) {
    if (f(this.head())) {
        return List.of(this.head()).concat(this.tail().takeWhile(f));
    }
    return List.empty();
};
List.fn.toArray = function() {
    return this.reduce(function(acc, x) {
        if (x instanceof List) {
            return acc.concat([x.toArray()]);
        }
        return acc.concat(x);
    }, []);
};
List.fn.transpose = function() {
    var max = this.map(function(item) {return item.length();}).maximum();
    var res = [];
    for (var i = 0; i < max; i++) {
        res[i] = [];
        for (var j = 0, _j = this.length(); j < _j; j++) {
            if (this.value[j] && this.value[j].value && this.value[j].value[i]) {
                res[i].push(this.value[j].value[i]);
            }
        }
    }
    return new List(res);
};
List.fn.traverse = function(f, of) {
    return this.map(f).sequence(of);
};
if (typeof [].map === 'function') {
    List.fn.map = function(f) {
        return new List(this.value.map(function(x) {return f(x)}));
    };
}
if (typeof [].reduce === 'function') {
    List.fn.foldl = List.fn.reduce = function(f, acc) {
        return this.value.reduce(function(acc, x) {return f(acc, x)}, acc);
    };
}
if (typeof [].reduceRight === 'function') {
    List.fn.foldr = function(f, acc) {
        return this.value.reduceRight(function(acc, x) {return f(x, acc)}, acc);
    };
}
module.exports = List;
