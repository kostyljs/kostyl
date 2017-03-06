import Component from '../src/component.js';

describe('basic component life cycle', () => {
  if (document == null || document.body == null) {
    throw new Error('jsdom isn’t enabled');
  }

  document.body.innerHTML = `
    <div
      data-component="Counter"
      data-component-initialState=""
    >
      <button data-component-ref="subtract">-</button>
      <div data-component-ref="holder"></div>
      <button data-component-ref="add">-</button>
    </div>
  `;

  class Counter extends Component {

  }

  const node = document.querySelector('[data-component="Counter"]');
  let component;
  const initialState = { counter: 0 };

  if (node == null) {
    throw new Error('jsdom isn’t enabled');
  }

  test('fails to mount on non node', () => {
    expect(() => {
      component = new Counter();
    })
    .toThrowError(/must be a dom element/);
  });

  test('mounts on node', () => {
    component = new Counter(node, initialState);
    expect(component.root).toBe(node);
  });

  test('have an initialState', () => {
    expect(component.state).toEqual(initialState);
  });

  test('sets a state on setState', () => {
    const newState = { counter: 1 };
    component.setState(newState);
    expect(component.state).toEqual(newState);
  });

  test('fails to add event on non node', () => {
    expect(() => {
      component.bindEvent('click', () => {}, null);
    })
    .toThrowError(/must be a dom element/);
  });

  test('adds the event', () => {
    const func = () => {
      component.setState({ counter: component.state.counter + 1 });
    };
    component.bindEvent('click', func);
    const event = new Event('click');
    node.dispatchEvent(event);
    expect(component.state.counter).toBe(2);
  });

  test('unmounts', () => {
    component.unmount();
    expect(component.root).toBe(null);
  });

  test('events unbound after unmount', () => {
    const event = new Event('click');
    node.dispatchEvent(event);
    expect(component.state.counter).toBe(2);
  });
});
