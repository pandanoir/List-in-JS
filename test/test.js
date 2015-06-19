var List=require('../src/list.js');
function curry(f){
    return function _curry(xs){
        return xs.length < f.length ? function(x){ return _curry(xs.concat([x])); } : f.apply(undefined, xs);
    }([]);
};
function add(a, b){ return a+b; };
function isOdd(n){return n%2 === 1;};
function biggerThan(n){return function(m){return n<m;}};
function smallerThan(n){return function(m){return n>m;}};
function id(a) { return a; };

var c_add=curry(add);
var passed=0, failed=0, done=0;
var a = new List([1, 2, 3]),
    b = new List([4, 5, 6]),
    c = new List([7, 8, 9]),
    a1 = a, a2 = a, a3 = a,
    f1 = new List([c_add(1), c_add(2), c_add(3)]),
    f2 = new List([c_add]).ap(new List([1, 2, 3])),
    f=function(a){return a+3},
    g=function(a){return a*3},
    x=100;

//Setoid
ok(a.equals(a) === true, 'reflexivity');
ok(a.equals(b) === b.equals(a), 'symmetry');
ok(a1.equals(a2)  &&  a2.equals(a3)  &&  a1.equals(a3) === true, 'transitivity');

//Semigroup
ok(a.concat(b).concat(c).equals(a.concat(b.concat(c))) === true, 'associativity');

//Monoid
ok(a.concat(a.empty()).equals(a), 'right identity');
ok(a.empty().concat(a).equals(a), 'left identity');

//Functor
ok(a.map(id).equals(a), 'identity');
ok(a.map(function(x){return f(g(x))}).equals(a.map(g).map(f)), 'composition');

//Apply
ok(f1.map(function(f){return function(g){return function(x){return f(g(x))}}}).ap(f2).ap(a).equals(f1.ap(f2.ap(a))), 'composition');

//Applicative
ok(a.of(id).ap(b).equals(b), 'identity');
ok(a.of(f).ap(a.of(x)).equals(a.of(f(x))), 'homomorphism');
ok(f1.ap(a.of(x)).equals(a.of(function(f){return f(x);}).ap(f1)), 'interchange');

// Foldable
ok(a.reduce(add, 0) === a.toArray().reduce(add, 0), 'reduce');

//Chain
ok(a.chain(function(x){return x%2 === 0?List.of(x):List.empty()}).equals(List.of(2)), 'chain');
ok(a.of(3).chain(function(x){return List.of(x*2)}).equals((function(x){return List.of(x*2)})(3)), 'left identity');
ok(a.chain(a.of).equals(a), 'right identity');

// Traversable
ok(new List([[1, 2], [3, 4]]).map(function(y){return new List(y)}).sequence().equals(new List([[1, 3], [1, 4], [2, 3], [2, 4]])), 'traverse1');
ok(new List([[1], [2], [3]]).map(function(y){return new List(y)}).sequence().equals(new List([[1, 2, 3]])), 'traverse2');
ok(new List([[1, 2], [3], [4]]).map(function(y){return new List(y)}).sequence().equals(new List([[1, 3, 4], [2, 3, 4]])), 'traverse3');

//methods

// foldr
// foldl
ok(a.head() === 1, '.head()'); // head
ok(a.tail().equals(new List([2, 3])), '.tail()'); // tail
ok(a.last() === 3, '.head()'); // last
ok(a.init().equals(new List([1, 2])), '.tail()'); // init
ok(a.isnull() === false, '.isnull() 1'); // isnull
ok(List.empty().isnull() === true, '.isnull() 2'); // isnull
ok(a.filter(function(x){return x%2 === 0}).equals(new List([2])), '.filter()'); // filter
ok(a.reverse().equals(new List([3, 2, 1])), '.reverse()'); // reverse
ok(new List([true, true, true]).and() === true, '.and() 1'); // and
ok(new List([true, true, false]).and() === false, '.and() 2'); // and
ok(new List([false, false, false]).or() === false, '.or() 1'); // or
ok(new List([true, false, false]).or() === true, '.or() 2'); // or
ok(a.any(isOdd) === true, '.any() 1'); // any
ok(a.any(biggerThan(10000)) === false, '.any() 2'); // any
ok(a.all(isOdd) === false, '.all() 1'); // all
ok(a.all(smallerThan(10000)) === true, '.all() 2'); // all
ok(a.sum() === 6 && b.sum() === 15 && c.sum() === 24, '.sum()'); // sum
ok(a.product() === 6 && b.product() === 120 && c.product() === 504, '.product()'); // product
ok(a.maximum() === 3 && a.reverse().maximum() === 3, '.maximum()');
ok(a.minimum() === 1 && a.reverse().minimum() === 1, '.maximum()');

testResult();

function ok(test, label){
    // console.log((test === true?'[PASS]':'[FAIL]')+label);
    if(test === true)
        passed++;
    else failed++;
    done++;
};
function testResult(){
    console.log(done+' tests are done. '+passed+' tests passed. '+failed+' tests failed.');
};
