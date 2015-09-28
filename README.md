# kostyl
`kostyl` (russian slang for kludge)

Quick, dirty and simple library for writing components built on top of jQuery and Underscore.
Because you don't always need nothing more.

## What it got?
* No sugar
* No templating (at all)
* Nothing new
* React-like component lifecycle
* Component state as a single point of truth
* State bindings as a simple (and dirty) function

## What it can?
* Mount at DOM node
* Trigger a function on mount
* Trigger a custom fuction on state change (and do not trigger when nothing really changed)
* Trigger a function on unmount
* Get a list of children components
* Get a list of referenced dom elements
* Bind a jquery event
* Unbind an event when component is umount

## Why?
* Single point of truth is a good idea (especially when it's a plain readable object)
* Lifecycle works well when you need to clean the mess behind...
* ...and it works well when you need to understand how component really works
* And it’s nice to have a clear component API which operates the data, not DOM
* Because I can

## Examples
[Hello world](http://jsbin.com/xisidi/22/edit?html,js,output)

[Simple counter](http://jsbin.com/pidare/2/edit?html,js,output)

[Form with step-by-step validation (by parsley)](http://jsbin.com/numufi/69/edit?html,js,output)
