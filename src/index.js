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

var stringify = require('json-stringify-safe');

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
