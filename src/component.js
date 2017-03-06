// @flow
import { flow, map, filter, merge } from 'lodash/fp';
import isDOM from 'is-dom';

type EventTuple = [string, Function, Node];
type EventsArray = Array<EventTuple>;

export default class Component {
  root: ?Node;
  state: Object;
  events: EventsArray;

  state = {};
  events = [];

  constructor (root: Node, initalState: Object): void {
    if (!isDOM(root)) {
      throw new Error('root must be a dom element');
    }
    this.componentWillMount();
    this.root = root;
    if (initalState) {
      this.setState(initalState);
    }
    this.componentDidMount();
  }

  componentWillMount (): void {}

  componentDidMount (): void {}

  setState (newState: Object): Object {
    const { state } = this;
    const mergedState: Object = merge(state, newState);
    this.state = mergedState;
    return mergedState;
  }

  bindEvent (
    eventType: string,
    func: Function,
    eventListener: ?Node = this.root
  ): EventsArray {
    if (eventListener == null || !isDOM(eventListener)) {
      throw new Error('eventListener must be a dom element');
    }

    try {
      eventListener.addEventListener(eventType, func);
      this.events.push([eventType, func, eventListener]);
      return this.events;
    }
    catch (error) {
      throw new Error(error);
    }
  }

  unmount (): void {
    this.root = null;

    const cleanEvents = (events: EventsArray): EventsArray => {
      return flow(
        map((eventTuple: EventTuple): null => {
          const [ eventType, func, eventListener ] = eventTuple;
          eventListener.removeEventListener(eventType, func);
          return null;
        }),
        filter((i: ?EventTuple): boolean => {
          return !i == null;
        })
      )(events);
    };

    this.events = cleanEvents(this.events);
  }
};
