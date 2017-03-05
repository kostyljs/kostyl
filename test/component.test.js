import Component from '../src/component.js';

describe('basic component life cycle', () => {
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
    component.bindEvent('click', () => {});
    expect(component.events.length).toBe(1);
  });

  test('Event successfully works', () => {
    let counter: number = 0;
    const func = () => { counter++; };
    component.bindEvent('click', func);
    const event = new Event('click');
    node.dispatchEvent(event);
    expect(counter).toBe(1);
  });

  test('unmounts', () => {
    component.unmount();
    expect(component.root).toBe(null);
  });

  // test('events unbound after unmount', () => {
  //   let counter: number = 0;
  //   const func = () => { counter++; };
  //   component.bindEvent('click', func);
  //   component.unmount();
  //   const event = new Event('click');
  //   node.dispatchEvent(event);
  //   expect(counter).toBe(0);
  // });
});
