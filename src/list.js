var objToString = Object.prototype.toString;
function isArray(arr){
    return typeof arr.length === 'number' && !!arr && typeof arr === 'object' && objToString.call(arr) === '[object Array]';
}

var List = function(arr) {
    if (!isArray(arr)) {
        throw Error('expect array.got ' + arr);
        return;
    }
    this.value = arr;
    return this;
};
List.fn = List.prototype;
List.empty = List.fn.empty = function() {
    return new List([]);
};
List.fn.map = function(f) {
    if (typeof this.value.map === 'function') {
        return new List(this.value.map(f));
    }
    var res = new Array(this.value.length);
    for (var i = 0, _i = res.length; i < _i; i++) {
        res[i] = f(this.value[i]);
    }
    return new List(res);
};
List.of = List.fn.of = function() {
    var args = new Array(arguments);
    for (var i = 0, _i = args.length; i < _i; i++) {
        args[i] = arguments[i];
    }
    return new List(args);
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
List.fn.concat = function(b) {
    return new List(this.value.concat(b.value));
};
List.fn.equals = function(b) {
    function isEquals(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0, _i = a.length; i < _i; i++) {
            if (objToString.call(a[i]) !== objToString.call(b[i])) return false;
            if (isArray(a[i])) {
                if (!isEquals(a[i], b[i])) return false;
            } else {
                if (a[i] !== b[i]) return false;
            }
        }
        return true;
    };
    return isEquals(this.value, b.value);
};
List.fn.chain = function(f) {
    return List.concat(this.map(f));
};
List.fn.traverse = function(f, of) {
    return this.map(f).sequence(of);
}
List.fn.sequence = function(of) {
     return this.foldr(function(m, ma) {
         return m.chain(function(x) {
             if (ma.value.length === 0) return List.pure(x);
             return ma.chain(function(xs) {
                 var res = xs.concat();
                 res.unshift(x);
                 return List.pure(res);
             });
         })
    }, new List([[]]));
};
//methods
List.fn.foldr = function(f, acc) {
    if (this.value.length === 0) return acc;
    return f(this.head(), this.tail().foldr(f, acc));
};
List.fn.foldl = List.fn.reduce = function(f, acc) {
    if (this.value.length === 0) return acc;
    return this.tail().foldl(f, f(acc, this.head()));
};
List.fn.head = function() {
    return this.value[0];
};
List.fn.tail = function() {
    return new List(this.value.slice(1));
};
List.fn.last = function() {
    return this.value[this.value.length - 1];
};
List.fn.init = function() {
    return new List(this.value.slice(0, -1));
};
List.fn.isnull = function() {
    return this.equals(List.empty());
};
List.fn.length = function() {
    return this.value.length;
};
List.fn.toArray = function() {
    return this.reduce(function(acc, x) {
        return acc.concat(x);
    }, []);
};
List.fn.filter = function(f) {
    return this.chain(function(m) {
        return f(m) ? List.pure(m) : List.empty();
    });
};
List.fn.reverse = function() {
    if (this.value.length === 0) return List.empty();
    return this.tail().reverse().concat(List.of(this.head()));
};
List.fn.and = function() {
    return this.all(function(s) {return s === true;});
};
List.fn.or = function() {
    return this.any(function(s) {return s === true;});
};
List.fn.any = function(f) {
    return this.filter(f).length() > 0;
};
List.fn.all = function(f) {
    return this.filter(function(item) {return !f(item);}).length() === 0;
};
List.fn.sum = function() {
    return this.foldl(function(a, b) {return a + b;}, 0);
};
List.fn.product = function() {
    return this.foldl(function(a, b) {return a * b;}, 1);
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
List.pure = function(x) {
    return new List([x]);
};
List.concat = function(list) {
    if (list.length() === 0) return List.empty();
    return list.head().concat(List.concat(list.tail()));
};
module.exports = List;

// basic functions
// the implemented item has '-' on its head.
// - head 
// - last 
// - tail 
// - init 
// - null 
// - length 
// - map 
// - reverse 
// intersperse 
// intercalate 
// transpose 
// subsequences 
// permutations 
// - foldl 
// foldl' 
// foldl1 
// foldl1' 
// - foldr 
// foldr1 
// - concat 
// concatMap 
// - and 
// - or 
// - any 
// - all 
// - sum 
// - product 
// - maximum 
// - minimum 
// scanl 
// scanl1 
// scanr 
// scanr1 
// mapAccumL 
// mapAccumR 
// iterate 
// - repeat 
// replicate 
// - cycle 
// unfoldr 
// take 
// drop 
// splitAt 
// takeWhile 
// dropWhile 
// dropWhileEnd 
// span 
// break 
// stripPrefix 
// group 
// inits 
// tails 
// isPrefixOf 
// isSuffixOf 
// isInfixOf 
// elem 
// notElem 
// lookup 
// find 
// filter 
// partition 
// (!!) 
// elemIndex 
// elemIndices 
// findIndex 
// findIndices 
// zip 
// zip3 
// zip4 
// zip5 
// zip6 
// zip7 
// zipWith 
// zipWith3 
// zipWith4 
// zipWith5 
// zipWith6 
// zipWith7 
// unzip 
// unzip3 
// unzip4 
// unzip5 
// unzip6 
// unzip7 
// lines 
// words 
// unlines 
// unwords 
// nub 
// delete 
// (\\) 
// union 
// intersect 
// sort 
// insert 
// nubBy 
// deleteBy 
// deleteFirstsBy 
// unionBy 
// intersectBy 
// groupBy 
// sortBy 
// insertBy 
// maximumBy 
// minimumBy 
// genericLength 
// genericTake 
// genericDrop 
// genericSplitAt 
// genericIndex 
// genericReplicate 
