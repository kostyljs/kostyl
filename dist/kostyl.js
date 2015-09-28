(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Kostyl"] = factory();
	else
		root["Kostyl"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var debug = window.debug || {
	    log: $.noop,
	    info: $.noop,
	    warn: $.noop,
	    error: $.noop,
	    dir: $.noop,
	    dirxml: $.noop,
	    group: $.noop,
	    groupEnd: $.noop,
	    groupCollapsed: $.noop,
	    time: $.noop,
	    timeEnd: $.noop,
	    profile: $.noop,
	    profileEnd: $.noop,
	    assert: $.noop
	};

	var stringify = __webpack_require__(1);

	var Kostyl = {};

	Kostyl.mount = function (component, element) {
	    if (!component.isComponentMounted()) {
	        component.$root = $(element);
	        component.$root.data('component', component);

	        var data = component.$root.data();

	        if (data.componentState && _.isObject(data.componentState)) {
	            component.setState(data.componentState);
	            component.$root.removeData('componentState');
	        }

	        component.setState({ _mounted: true });
	    }
	    else {
	        debug.warn(component.displayName ? component.displayName : 'Component' + ' mounted already', component);
	    }

	    return component;
	};

	Kostyl.unmount = function (component) {
	    component.setState({ _mounted: false });
	    component.events.forEach(function (event) {
	        try {
	            $(event[0]).off(event[1], event[2], event[3]);
	        }
	        catch (error) {
	            console.error(
	                'Cannot unmount component events',
	                {
	                    component: component,
	                    event: event,
	                    error: error
	                }
	            );
	        }
	    });
	    component.$root.removeData('component');

	    return null;
	};

	Kostyl.Component = function (Proto) {
	    if (!Proto) {
	        debug.error('Component will not be created, because proto should not be empty');
	        return null;
	    }

	    function _component (Proto) {
	        var instance = new Proto();

	        instance.$root = instance.$root || $();
	        instance.state = _.extend(
	            instance.state || {},
	            {
	                _mounted: false
	            }
	        );

	        instance.getChildrens = instance.getChildrens || function () {
	            if (instance.$root) {
	                return _(
	                    instance.$root.find('*').filter(function () {
	                        return $(this).data('component');
	                    })
	                )
	                .chain()
	                .map(function (element) {
	                    return $(element).data('component');
	                })
	                .groupBy(function (component) {
	                    return component.displayName;
	                })
	                .value();
	            }
	            else {
	                return null;
	            }
	        };

	        instance.childrens = instance.getChildrens();

	        instance.getRefs = instance.getRefs || function () {
	            if (instance.$root) {
	                return _(instance.$root.find('[data-ref]'))
	                    .chain()
	                    .map(function (element) {
	                        return [$(element).data('ref'), $(element)];
	                    })
	                    .object()
	                    .value();
	            }
	            else {
	                return null;
	            }
	        };

	        instance.$refs = instance.getRefs();

	        instance.setState = instance.setState || function (newState) {
	            var result = false;

	            if (instance.shouldComponentUpdate(instance.state, newState)) {
	                var previousState;

	                try {
	                    previousState = _(instance.state).clone();
	                }
	                catch (error) {
	                    console.error(
	                        error,
	                        {
	                            componentName: instance.displayName,
	                            component: instance,
	                            state: instance.state
	                        }
	                    );
	                }

	                if (_(previousState).isObject()) {
	                    try {
	                        _(newState)
	                            .chain()
	                            .keys()
	                            .filter(function (key) {
	                                return newState[key] !== instance.state[key];
	                            })
	                            .each(function (key) {
	                                instance.state[key] = newState[key];
	                            })
	                            .each(function (key) {
	                                if (instance.bindings[key] &&
	                                    typeof instance[instance.bindings[key]] === 'function') {
	                                    if (instance.state[key] !== previousState[key]) {
	                                        instance[instance.bindings[key]](instance.state[key], previousState[key]);
	                                    }
	                                }
	                            })
	                            .value();
	                    }
	                    catch (error) {
	                        console.error(
	                            error,
	                            {
	                                componentName: instance.displayName,
	                                component: instance,
	                                state: instance.state
	                            }
	                        );
	                    }
	                }
	                else {
	                    result = true;
	                }

	                result = instance.state;
	            }

	            return result;
	        };

	        instance.bindings = _.extend(
	            instance.bindings || {},
	            {
	                _mounted: 'componentMountStateChange'
	            }
	        );

	        instance.shouldComponentUpdate = instance.shouldComponentUpdate || function (oldState, newState) {
	            var newStateStr = stringify(newState, null);
	            var oldStateStr = stringify(_(oldState).pick(_(newState).keys()), null);
	            return newStateStr !== oldStateStr;
	        };

	        instance.events = instance.events || [];

	        instance.addEvent = instance.addEvent || function (where, what, onWhich, whatToDo) {
	            $(where).on(what, onWhich, whatToDo);
	            this.events.push([where, what, onWhich, whatToDo]);
	            return this.event;
	        };

	        instance.isComponentMounted = instance.isComponentMounted || function () {
	            return instance.state._mounted;
	        };

	        instance.componentDidMount = instance.componentDidMount || function () {};

	        instance.componentWillUnmount = instance.componentWillUnmount || function () {};

	        instance.componentMountStateChange = instance.componentMountStateChange || function (isMounted) {
	            if (isMounted) {
	                instance.childrens = instance.getChildrens();
	                instance.$refs = instance.getRefs();

	                instance.componentDidMount();

	                if (window.debug === window.console) {
	                    debug.info(
	                        (instance.displayName ? instance.displayName : 'Component') + ' mounted', instance.$root, instance
	                    );
	                }
	            }
	            else {
	                instance.componentWillUnmount();
	            }
	        };

	        return instance;
	    }

	    return _component(Proto);
	};

	module.exports = Kostyl;


/***/ },
/* 1 */
/***/ function(module, exports) {

	exports = module.exports = stringify
	exports.getSerialize = serializer

	function stringify(obj, replacer, spaces, cycleReplacer) {
	  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
	}

	function serializer(replacer, cycleReplacer) {
	  var stack = [], keys = []

	  if (cycleReplacer == null) cycleReplacer = function(key, value) {
	    if (stack[0] === value) return "[Circular ~]"
	    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	  }

	  return function(key, value) {
	    if (stack.length > 0) {
	      var thisPos = stack.indexOf(this)
	      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
	      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
	      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
	    }
	    else stack.push(value)

	    return replacer == null ? value : replacer.call(this, key, value)
	  }
	}


/***/ }
/******/ ])
});
;