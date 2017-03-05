// @flow
import { flow, map, filter, merge } from 'lodash/fp';
import isDOM from 'is-dom';

type EventTuple = [Node, string, Function];

export default class Component {
  root: ?Node;
  state: Object;
  events: Array<EventTuple>;

  state = {};
  events = [];

  constructor (root: Node, initalState: Object) {
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

  componentWillMount () {}

  componentDidMount () {}

  setState (newState: Object) {
    const { state } = this;
    this.state = merge(state, newState);
  }

  bindEvent (eventType: string, func: Function, eventListener: ?Node = this.root): Array<EventTuple> {
    if (eventListener == null || !isDOM(eventListener)) {
      throw new Error('eventListener must be a dom element');
    }

    try {
      eventListener.addEventListener(eventType, func);
      this.events.push([eventListener, eventType, func]);
      return this.events;
    }
    catch (error) {
      throw new Error(error);
    }
  }

  unmount () {
    this.root = null;

    this.events = flow(
      map((eventTuple): null => {
        const [ eventListener, eventType, func ] = eventTuple;
        eventListener.removeEventListener(eventType, func);
        return null;
      }),
      filter((i) => !i === null)
    )(this.events);
  }
};
