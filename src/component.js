// @flow
import isDOM from 'is-dom';
import deepmerge from 'deepmerge';
import deepequal from 'deep-equal';
import objectDiff from 'object-diff';
import groupBy from 'group-by';

type State = { [key: any]: any };
type Refs = { [key: string]: HTMLElement }
type Event = [string, Function, HTMLElement] | null;
type Events = Array<Event>;
type Bindings = { [key: string]: Function };

export default class Component {
  root: ?HTMLElement;
  state: State;
  refs: Refs;
  events: Events;
  bindings: Bindings;

  constructMessage (message: string): string {
    const name: string = this.constructor.name;
    return `${name}: ${message}`;
  }

  getStateFromData (stateJSON: ?string): State {
    try {
      return stateJSON == null ? {} : JSON.parse(stateJSON);
    }
    catch (error) {
      throw new Error(this.constructMessage('data-component-initialState contains not a valid JSON'));
    }
  }

  constructor (root: ?HTMLElement, initalState: ?Object) {
    if (root == null || !isDOM(root)) {
      throw new Error(this.constructMessage('root must be a dom element'));
    }

    this.componentWillMount();

    const stateJSON = root.getAttribute('data-component-initialState');

    this.root = root;
    this.state = initalState || this.getStateFromData(stateJSON) || {};
    this.events = [];
    this.bindings = {};

    const getRefs = (): Refs => {
      if (this.root == null) { return {}; }
      const refsNodeList: NodeList<HTMLElement> = this.root.querySelectorAll('[data-component-ref]');
      const refsArray: Array<HTMLElement> = Array.prototype.slice.call(refsNodeList);
      const groupedRefs: { [key: string]: Array<HTMLElement> } = (
        groupBy(refsArray, (ref: HTMLElement): ?string => {
          return ref.getAttribute('data-component-ref');
        })
      );
      const finalRefs = ((): Refs => {
        let final: Refs = {};
        Object.keys(groupedRefs).forEach((k) => {
          if (groupedRefs[k].length > 1) {
            console.warn(this.constructMessage(`component have more than one '${k}' refs`));
          }
          final[k] = groupedRefs[k][0];
        });
        return final;
      })();
      return finalRefs;
    };
    Object.defineProperty(this, 'refs', ({ get: getRefs }: Object));

    this.componentDidMount();
  }

  componentWillMount (): void {}

  componentDidMount (): void {}

  addBinding (keyOfState: string, action: Function): Bindings {
    this.bindings = { ...this.bindings, [keyOfState]: action };
    return this.bindings;
  }

  shouldComponentUpdate (nextState: ?Object): boolean {
    const prevState: State = this.state;
    return !deepequal(prevState, nextState);
  }

  setState (nextState: State): State {
    const prevState: State = this.state;
    const mergedState: Object = deepmerge(prevState, nextState);
    const shouldUpdate = this.shouldComponentUpdate(nextState);
    if (shouldUpdate) {
      this.componentWillUpdate(mergedState);
    }
    this.state = mergedState;
    if (shouldUpdate) {
      const diffState = objectDiff(prevState, mergedState);
      Object.keys(this.bindings).forEach((bindingName) => {
        if (diffState.hasOwnProperty(bindingName)) {
          this.bindings[bindingName](diffState[bindingName]);
        }
      });
      this.componentDidUpdate(prevState);
    }
    return this.state;
  }

  componentWillUpdate (nextState: State): void {}

  componentDidUpdate (prevState: State): void {}

  addEvent (
    eventType: string,
    action: Function,
    eventListener: ?HTMLElement = this.root
  ): Events {
    if (eventListener == null || !isDOM(eventListener)) {
      throw new Error(this.constructMessage('eventListener must be a dom element'));
    }

    try {
      eventListener.addEventListener(eventType, action);
      this.events.push([eventType, action, eventListener]);
      return this.events;
    }
    catch (error) {
      throw new Error(this.constructMessage(error));
    }
  }

  removeEvent (eventTuple: Event): Event {
    if (eventTuple != null) {
      const [ eventType, action, eventListener ] = eventTuple;
      eventListener.removeEventListener(eventType, action);
      eventTuple = null;
    }
    return eventTuple;
  }

  componentWillUnmount (): void {}

  unmount (): void {
    this.componentWillUnmount();

    this.events = (
      this.events
      .map(this.removeEvent)
      .filter((i: Event): boolean => {
        return !i == null;
      })
    );

    this.root = null;
  }
};
