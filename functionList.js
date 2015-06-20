var List = require('./src/list.js');
var keys = Object.keys(List.fn);
var _ = require('lodash');
keys.sort();
console.log('basic functions');
console.log('the implemented item has \'-\' on its head.');
console.log(['head', 'last', 'tail', 'init', 'null', 'length', 'map', 'reverse', 'intersperse', 'intercalate', 'transpose', 'subsequences', 'permutations', 'foldl', 'foldl\'', 'foldl1', 'foldl1\'', 'foldr', 'foldr1', 'concat', 'concatMap', 'and', 'or', 'any', 'all', 'sum', 'product', 'maximum', 'minimum', 'scanl', 'scanl1', 'scanr', 'scanr1', 'mapAccumL', 'mapAccumR', 'iterate', 'repeat', 'replicate', 'cycle', 'unfoldr', 'take', 'drop', 'splitAt', 'takeWhile', 'dropWhile', 'dropWhileEnd', 'span', 'break', 'stripPrefix', 'group', 'inits', 'tails', 'isPrefixOf', 'isSuffixOf', 'isInfixOf', 'elem', 'notElem', 'lookup', 'find', 'filter', 'partition', '(!!)', 'elemIndex', 'elemIndices', 'findIndex', 'findIndices', 'zip', 'zip3', 'zip4', 'zip5', 'zip6', 'zip7', 'zipWith', 'zipWith3', 'zipWith4', 'zipWith5', 'zipWith6', 'zipWith7', 'unzip', 'unzip3', 'unzip4', 'unzip5', 'unzip6', 'unzip7', 'lines', 'words', 'unlines', 'unwords', 'nub', 'delete', '(\\)', 'union', 'intersect', 'sort', 'insert', 'nubBy', 'deleteBy', 'deleteFirstsBy', 'unionBy', 'intersectBy', 'groupBy', 'sortBy', 'insertBy', 'maximumBy', 'minimumBy', 'genericLength', 'genericTake', 'genericDrop', 'genericSplitAt', 'genericIndex', 'genericReplicate'].map(function(item) {
    if (_.indexOf(keys, item, true) !== -1) {
        return '- ' + item;
    }
    return item;
}).join('\n'))
