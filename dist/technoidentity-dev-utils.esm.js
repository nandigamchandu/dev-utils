import Chance from 'chance';
import { NumberType, StringType, BooleanType, KeyofType, EnumType, LiteralType, NullType, UndefinedType, VoidType, ReadonlyType, ExactType, RefinementType, ReadonlyArrayType, repeatedly, AnyArrayType, unknown, ArrayType, InterfaceType, PartialType, ObjType, buildObject, IntersectionType, UnionType, TupleType, isType, verify, isInteger, isStruct, isInterface, isList, isDict, isIntersection, isMaybe, isUnion, isEnums, isTuple, isIrreducible, range } from 'technoidentity-utils';
import t, { Any } from 'tcomb';
import { create, defaults, router } from 'json-server';

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
  return repeatedly(n, function () {
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

  if (spec instanceof NumberType) {
    return chance.floating(options.floating);
  }

  if (spec instanceof StringType) {
    return chance.sentence(options.sentence);
  }

  if (spec instanceof BooleanType) {
    return chance.bool();
  }

  if (spec.name === 'Date') {
    return chance.date();
  }

  if (spec.name === 'DateFromISOString') {
    return chance.date();
  }

  if (spec instanceof KeyofType) {
    return chance.pickone(Object.keys(spec.keys));
  }

  if (spec instanceof EnumType) {
    return chance.pickone(spec.keys);
  }

  if (spec instanceof LiteralType) {
    return spec.value;
  }

  if (spec instanceof NullType) {
    // tslint:disable-next-line: no-null-keyword
    return null;
  }

  if (spec instanceof UndefinedType || spec instanceof VoidType) {
    return undefined;
  }

  if (spec instanceof ReadonlyType || spec instanceof ExactType || spec instanceof RefinementType // No easy way to do this correctly?
  ) {
      return fake(spec.type, options);
    }

  if (spec instanceof ReadonlyArrayType) {
    return fakeArrayFromType(spec.type, options);
  }

  if (spec instanceof AnyArrayType) {
    return fakeArrayFromType(unknown, options);
  }

  if (spec instanceof ArrayType) {
    return fakeArray(spec, options);
  }

  if (spec instanceof InterfaceType || spec instanceof PartialType || spec instanceof ObjType) {
    return buildObject(spec.props, function (v) {
      return fake(v, options);
    });
  }

  if (spec instanceof IntersectionType) {
    return spec.types.map(function (t) {
      return fake(t, options);
    }).reduce(function (acc, x) {
      return _extends({}, acc, {}, x);
    });
  }

  if (spec instanceof UnionType) {
    var one = chance.integer({
      min: 0,
      max: spec.types.length - 1
    });
    return fake(spec.types[one], options);
  }

  if (spec instanceof TupleType) {
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

var primitives = [t.Number, t.String, t.Boolean, t.Date, t.Nil];

function fakeFromIrreducible(rt, options) {
  verify(rt.meta.kind === 'irreducible', 'rt must be irreducible');

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
        return fakeFromRT(Any, options);
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
      var kv = repeatedly(kn, function () {
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
      return repeatedly(n, function () {
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

  if (!isType(rt)) {
    console.log(rt.name);
    throw new Error('I have no idea about what do with a function');
  }

  verify(rt && rt.meta && rt.meta.kind);

  if (isInteger(rt)) {
    return chance$1.integer(options.integer);
  }

  if (isStruct(rt)) {
    return rt(buildObject(rt.meta.props, function (p) {
      return fakeFromRT(p, options);
    }));
  }

  if (isInterface(rt)) {
    return buildObject(rt.meta.props, function (p) {
      return fakeFromRT(p, options);
    });
  }

  if (isList(rt)) {
    var n = chance$1.integer({
      min: options.array.minLength,
      max: options.array.maxLength
    });
    return repeatedly(n, function () {
      return fakeFromRT(rt.meta.type, options);
    });
  }

  if (isDict(rt)) {
    return {};
  }

  if (isIntersection(rt)) {
    return rt.meta.types.map(function (p) {
      return fakeFromRT(p, options);
    }).reduce(function (acc, x) {
      return _extends({}, acc, {}, x);
    });
  }

  if (isMaybe(rt)) {
    return chance$1.pickone([fakeFromRT(rt.meta.type), undefined]);
  }

  if (isUnion(rt)) {
    return chance$1.pickone(rt.meta.types.map(function (p) {
      return fakeFromRT(p, options);
    }));
  }

  if (isEnums(rt)) {
    return chance$1.pickone(Object.keys(rt.meta.map));
  }

  if (isTuple(rt)) {
    return rt.meta.types.map(function (p) {
      return fakeFromRT(p, options);
    });
  }

  if (isIrreducible(rt)) {
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
    result[name] = range(count).map(function (_) {
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

  create().use(defaults()).use(router(fakeObjects(resources))).listen(port, function () {
    console.log("fake JSON Server is running at port: " + port);
  });
}

export { defaultOptions, fake, fakeFromRT, startFakeJSONServer };
//# sourceMappingURL=technoidentity-dev-utils.esm.js.map
