// @flow
/* eslint no-unused-vars: 0 */

import Component from '../src/component.js';

const stateJSON = JSON.stringify({ 'count': 0 });
if (document.body == null) {
  throw new Error('jsdom is not inited');
}
document.body.innerHTML = `
  <div
    data-component="Counter"
    data-component-initialState='${stateJSON}'
  >
    <button data-component-ref="subtract">-</button>
    <div data-component-ref="holder"></div>
    <button data-component-ref="add">-</button>
  </div>
`;
const element: ?HTMLElement = document.querySelector('[data-component="Counter"]');
if (element == null) {
  throw new Error('element is not a DOM node');
}

describe('component mounting life-cycle', () => {
  test('component fails to mount at non element', () => {
    expect(() => { const component = new Component(null); })
    .toThrowError(/must be a dom element/);
  });

  test('componentWillMount called', () => {
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentWillMount () { mockFn(); }
    }
    const component = new MockComponent(element);
    expect(mockFn).toBeCalled();
  });

  test('have an empty root at componentWillMount', () => {
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentWillMount () { expect(this.root).toBeFalsy(); }
    }
    const component = new MockComponent(element);
  });

  test('mounts on element', () => {
    const component = new Component(element);
    expect(component.root).toBe(element);
  });

  test('componentDidMount called', () => {
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentDidMount () { mockFn(); }
    }
    const component = new MockComponent(element);
    expect(mockFn).toBeCalled();
  });

  test('unmounts', () => {
    const component = new Component(element);
    component.unmount();
    expect(component.root).toBe(null);
  });

  test('componentWillUnmount called', () => {
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentWillUnmount () { mockFn(); }
    }
    const component = new MockComponent(element);
    component.unmount();
    expect(mockFn).toBeCalled();
  });
});

describe('component refs', () => {
  test('returns a map of refs', () => {
    const component = new Component(element);
    const exprectedRefs = {
      subtract: element.querySelector('[data-component-ref="subtract"]'),
      holder: element.querySelector('[data-component-ref="holder"]'),
      add: element.querySelector('[data-component-ref="add"]')
    };
    expect(JSON.stringify(component.refs)).toEqual(JSON.stringify(exprectedRefs));
  });

  test('returns null if unmounted', () => {
    const component = new Component(element);
    component.unmount();
    expect(component.refs).toEqual({});
  });
});

describe('component events', () => {
  test('fails to add event on non element', () => {
    const component = new Component(element);
    expect(() => { component.addEvent('click', () => {}, null); })
    .toThrowError(/must be a dom element/);
  });

  test('adds the event', () => {
    const component = new Component(element);
    const mockFn = jest.fn();
    component.addEvent('click', mockFn);
    const event = new Event('click');
    element.dispatchEvent(event);
    expect(mockFn).toBeCalled();
  });

  test('adds the event on .componentDidMount', () => {
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentDidMount () {
        this.addEvent('click', mockFn);
      }
    }
    const component = new MockComponent(element);
    const event = new Event('click');
    element.dispatchEvent(event);
    expect(mockFn).toBeCalled();
  });

  test('adds the event bound on ref', () => {
    const component = new Component(element);
    let subtractButton: HTMLElement = component.refs.subtract;
    const mockFn = jest.fn();
    component.addEvent('click', mockFn, subtractButton);
    const event = new Event('click');
    subtractButton.dispatchEvent(event);
    expect(mockFn).toBeCalled();
  });

  test('events unbound after unmount', () => {
    const component = new Component(element);
    const mockFn = jest.fn();
    component.addEvent('click', mockFn);
    component.unmount();
    const event = new Event('click');
    element.dispatchEvent(event);
    expect(mockFn).not.toBeCalled();
  });
});

describe('component updating life-cycle', () => {
  test('has an initalState from data-component-initialState', () => {
    const expectedState = JSON.parse(stateJSON);
    const component = new Component(element);
    expect(component.state).toEqual(expectedState);
  });

  test('has an initalState from second argument', () => {
    const initialState = { count: 42 };
    const component = new Component(element, initialState);
    expect(component.state).toEqual(initialState);
  });

  test('setState updates the state', () => {
    const initialState = { count: 0 };
    const expectedState = { count: 1 };
    const component = new Component(element, initialState);
    component.setState(expectedState);
    expect(component.state).toEqual(expectedState);
  });

  test('componentWillUpdate called with nextState', () => {
    const nextState = { count: 1 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentWillUpdate (nextState) { mockFn(nextState); }
    }
    const component = new MockComponent(element);
    component.setState(nextState);
    expect(mockFn).toBeCalledWith(nextState);
  });

  test('componentWillUpdate called with prevState', () => {
    const initialState = { count: 0 };
    const nextState = { count: 1 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentDidUpdate (prevState) { mockFn(prevState); }
    }
    const component = new MockComponent(element);
    component.setState(nextState);
    expect(mockFn).toBeCalledWith(initialState);
  });

  test('componentWillUpdate and componentDidUpdate is not called at mount', () => {
    const expectedState = { count: 1 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentWillUpdate (nextState) { mockFn(nextState); }
      componentDidUpdate (prevState) { mockFn(prevState); }
    }
    const component = new MockComponent(element);
    expect(mockFn).not.toBeCalled();
  });

  test('componentWillUpdate and componentDidUpdate is not called if state is equal', () => {
    const initialState = { count: 0 };
    const nextState = { count: 0 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentWillUpdate (nextState) { mockFn(nextState); }
      componentDidUpdate (prevState) { mockFn(prevState); }
    }
    const component = new MockComponent(element);
    component.setState(nextState);
    expect(mockFn).not.toBeCalled();
  });

  test('componentWillUpdate and componentDidUpdate is not called if shouldComponentUpdate is falsy', () => {
    const initialState = { count: 0 };
    const nextState = { count: 1 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      shouldComponentUpdate (nextState) { return false; }
      componentWillUpdate (nextState) { mockFn(nextState); }
      componentDidUpdate (prevState) { mockFn(prevState); }
    }
    const component = new MockComponent(element);
    component.setState(nextState);
    expect(mockFn).not.toBeCalled();
  });

  test('bindings called if they are added as class properties', () => {
    const initialState = { count: 0 };
    const nextState = { count: 1 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      bindings = { 'count': this.handleCountUpdate }
      handleCountUpdate (newCount) { mockFn(newCount); }
    }
    const component = new MockComponent(element, initialState);
    component.setState(nextState);
    expect(mockFn).toBeCalledWith(nextState.count);
  });

  test('bindings called if they are added via .addBinding', () => {
    const initialState = { count: 0 };
    const nextState = { count: 1 };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      componentDidMount () {
        this.addBinding('count', this.handleCountUpdate);
      }
      handleCountUpdate (newCount) { mockFn(newCount); }
    }
    const component = new MockComponent(element, initialState);
    component.setState(nextState);
    expect(mockFn).toBeCalledWith(nextState.count);
  });

  test('only update bindings had called', (done) => {
    const initialState = { count: 0, unwanted: 0 };
    const nextState = { count: 1, unwanted: 0 };
    const mockCountUpdate = jest.fn();
    const mockUnwantedUpdate = jest.fn();
    class MockComponent extends Component {
      bindings = {
        'count': this.handleCountUpdate,
        'unwanted': this.handleUnwantedUpdate
      }
      handleCountUpdate (newCount) { mockCountUpdate(newCount); }
      handleUnwantedUpdate (newUnwanted) { mockUnwantedUpdate(newUnwanted); }
    }
    const component = new MockComponent(element, initialState);
    component.setState(nextState);
    expect(mockCountUpdate).toBeCalledWith(nextState.count);
    expect(mockUnwantedUpdate).not.toBeCalled();
    done();
  });

  test('new key in state calls binding', () => {
    const initialState = { count: 0 };
    const nextState = { count: 0, newKey: 'NEW' };
    const mockFn = jest.fn();
    class MockComponent extends Component {
      bindings = { 'newKey': this.handleNewKeyUpdate }
      handleNewKeyUpdate (newNewKey) { mockFn(newNewKey); }
    }
    const component = new MockComponent(element, initialState);
    component.setState(nextState);
    expect(mockFn).toBeCalledWith(nextState.newKey);
  });
});
