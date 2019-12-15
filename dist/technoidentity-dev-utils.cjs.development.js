'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Chance = _interopDefault(require('chance'));
var technoidentityUtils = require('technoidentity-utils');
var t = require('tcomb');
var t__default = _interopDefault(t);
var server = require('json-server');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var chance =
/*#__PURE__*/
new Chance();
var defaultOptions = {
  integer: {
    min: 100,
    max: 1000
  },
  floating: {
    min: 0,
    max: 100,
    fixed: 2
  },
  sentence: {
    words: 4
  },
  array: {
    minLength: 0,
    maxLength: 6
  }
};

function fakeArrayFromType(spec, options) {
  var n = chance.integer({
    min: options.array.minLength,
    max: options.array.maxLength
  });
  return technoidentityUtils.repeatedly(n, function () {
    return fake(spec, options);
  });
}

function fakeArray(spec, options) {
  return fakeArrayFromType(spec.type, options);
}

function fake(spec, options) {
  if (options === void 0) {
    options = defaultOptions;
  }

  if (spec.name === 'Int') {
    return chance.integer(options.integer);
  }

  if (spec instanceof technoidentityUtils.NumberType) {
    return chance.floating(options.floating);
  }

  if (spec instanceof technoidentityUtils.StringType) {
    return chance.sentence(options.sentence);
  }

  if (spec instanceof technoidentityUtils.BooleanType) {
    return chance.bool();
  }

  if (spec.name === 'Date') {
    return chance.date();
  }

  if (spec.name === 'DateFromISOString') {
    return chance.date();
  }

  if (spec instanceof technoidentityUtils.KeyofType) {
    return chance.pickone(Object.keys(spec.keys));
  }

  if (spec instanceof technoidentityUtils.EnumType) {
    return chance.pickone(spec.keys);
  }

  if (spec instanceof technoidentityUtils.LiteralType) {
    return spec.value;
  }

  if (spec instanceof technoidentityUtils.NullType) {
    // tslint:disable-next-line: no-null-keyword
    return null;
  }

  if (spec instanceof technoidentityUtils.UndefinedType || spec instanceof technoidentityUtils.VoidType) {
    return undefined;
  }

  if (spec instanceof technoidentityUtils.ReadonlyType || spec instanceof technoidentityUtils.ExactType || spec instanceof technoidentityUtils.RefinementType // No easy way to do this correctly?
  ) {
      return fake(spec.type, options);
    }

  if (spec instanceof technoidentityUtils.ReadonlyArrayType) {
    return fakeArrayFromType(spec.type, options);
  }

  if (spec instanceof technoidentityUtils.AnyArrayType) {
    return fakeArrayFromType(technoidentityUtils.unknown, options);
  }

  if (spec instanceof technoidentityUtils.ArrayType) {
    return fakeArray(spec, options);
  }

  if (spec instanceof technoidentityUtils.InterfaceType || spec instanceof technoidentityUtils.PartialType || spec instanceof technoidentityUtils.ObjType) {
    return technoidentityUtils.buildObject(spec.props, function (v) {
      return fake(v, options);
    });
  }

  if (spec instanceof technoidentityUtils.IntersectionType) {
    return spec.types.map(function (t) {
      return fake(t, options);
    }).reduce(function (acc, x) {
      return _extends({}, acc, {}, x);
    });
  }

  if (spec instanceof technoidentityUtils.UnionType) {
    var one = chance.integer({
      min: 0,
      max: spec.types.length - 1
    });
    return fake(spec.types[one], options);
  }

  if (spec instanceof technoidentityUtils.TupleType) {
    return spec.types.map(function (p) {
      return fake(p, options);
    });
  }

  console.log('hello');
  throw new Error("Unsupported type: " + spec.name);
}

var chance$1 =
/*#__PURE__*/
new Chance(); // tslint:disable-next-line: readonly-array

var primitives = [t__default.Number, t__default.String, t__default.Boolean, t__default.Date, t__default.Nil];

function fakeFromIrreducible(rt, options) {
  technoidentityUtils.verify(rt.meta.kind === 'irreducible', 'rt must be irreducible');

  switch (rt.meta.name) {
    case 'Number':
      return chance$1.floating(options.floating);

    case 'Any':
      return fakeFromRT(chance$1.pickone(primitives));

    case 'String':
      return chance$1.sentence(options.sentence);

    case 'Boolean':
      return chance$1.bool();

    case 'Date':
      return chance$1.date();

    case 'Function':
      return function () {
        return fakeFromRT(t.Any, options);
      };

    case 'Nil':
      // tslint:disable-next-line: no-null-keyword
      return chance$1.pickone([undefined, null]);

    case 'Error':
      return new Error('fake error');

    case 'Object':
      var kn = chance$1.integer({
        min: 4,
        max: 8
      });
      var kv = technoidentityUtils.repeatedly(kn, function () {
        return [chance$1.word({
          length: chance$1.integer({
            min: 4,
            max: 8
          })
        }), fakeFromRT(chance$1.pickone(primitives), options)];
      });
      return kv.reduce(function (acc, _ref) {
        var _extends2;

        var k = _ref[0],
            v = _ref[1];
        return _extends({}, acc, (_extends2 = {}, _extends2[k] = v, _extends2));
      });

    case 'Array':
      var n = chance$1.integer({
        min: options.array.minLength,
        max: options.array.maxLength
      });
      return technoidentityUtils.repeatedly(n, function () {
        return fakeFromRT(chance$1.pickone(primitives), options);
      });

    default:
      throw new Error("Unsupported tcomb type: " + rt.meta.kind + ": " + rt.meta.name);
  }
}

function fakeFromRT(rt, options) {
  if (options === void 0) {
    options = defaultOptions;
  }

  if (!technoidentityUtils.isType(rt)) {
    console.log(rt.name);
    throw new Error('I have no idea about what do with a function');
  }

  technoidentityUtils.verify(rt && rt.meta && rt.meta.kind);

  if (technoidentityUtils.isInteger(rt)) {
    return chance$1.integer(options.integer);
  }

  if (technoidentityUtils.isStruct(rt)) {
    return rt(technoidentityUtils.buildObject(rt.meta.props, function (p) {
      return fakeFromRT(p, options);
    }));
  }

  if (technoidentityUtils.isInterface(rt)) {
    return technoidentityUtils.buildObject(rt.meta.props, function (p) {
      return fakeFromRT(p, options);
    });
  }

  if (technoidentityUtils.isList(rt)) {
    var n = chance$1.integer({
      min: options.array.minLength,
      max: options.array.maxLength
    });
    return technoidentityUtils.repeatedly(n, function () {
      return fakeFromRT(rt.meta.type, options);
    });
  }

  if (technoidentityUtils.isDict(rt)) {
    return {};
  }

  if (technoidentityUtils.isIntersection(rt)) {
    return rt.meta.types.map(function (p) {
      return fakeFromRT(p, options);
    }).reduce(function (acc, x) {
      return _extends({}, acc, {}, x);
    });
  }

  if (technoidentityUtils.isMaybe(rt)) {
    return chance$1.pickone([fakeFromRT(rt.meta.type), undefined]);
  }

  if (technoidentityUtils.isUnion(rt)) {
    return chance$1.pickone(rt.meta.types.map(function (p) {
      return fakeFromRT(p, options);
    }));
  }

  if (technoidentityUtils.isEnums(rt)) {
    return chance$1.pickone(Object.keys(rt.meta.map));
  }

  if (technoidentityUtils.isTuple(rt)) {
    return rt.meta.types.map(function (p) {
      return fakeFromRT(p, options);
    });
  }

  if (technoidentityUtils.isIrreducible(rt)) {
    return fakeFromIrreducible(rt, options);
  }

  throw new Error("Unsupported tcomb type: " + rt.meta.kind);
}

function fakeObjects(resources) {
  var result = {};

  var _loop = function _loop() {
    if (_isArray) {
      if (_i >= _iterator.length) return "break";
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) return "break";
      _ref = _i.value;
    }

    var _ref2 = _ref,
        name = _ref2.name,
        count = _ref2.count,
        spec = _ref2.spec;
    // tslint:disable-next-line: no-object-mutation
    result[name] = technoidentityUtils.range(count).map(function (_) {
      return fake(spec);
    });
  };

  for (var _iterator = resources, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    var _ret = _loop();

    if (_ret === "break") break;
  }

  return result;
}

function startFakeJSONServer(resources, port) {
  if (port === void 0) {
    port = process.env.PORT || 5555;
  }

  server.create().use(server.defaults()).use(server.router(fakeObjects(resources))).listen(port, function () {
    console.log("fake JSON Server is running at port: " + port);
  });
}

exports.defaultOptions = defaultOptions;
exports.fake = fake;
exports.fakeFromRT = fakeFromRT;
exports.startFakeJSONServer = startFakeJSONServer;
//# sourceMappingURL=technoidentity-dev-utils.cjs.development.js.map
