
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Copy.svelte generated by Svelte v3.23.2 */

    const file = "src/Copy.svelte";

    function create_fragment(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(p, "class", "copy svelte-18mlvw0");
    			add_location(p, file, 14, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Copy> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Copy", $$slots, []);

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class Copy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Copy",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Copy> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Copy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Copy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var i=function(i){var t=i.container,n=i.offset;void 0===n&&(n=.5);var s=i.scenes;this.observer=null,this.i={},this.t=t,this.s=n,this.h=0,this.o=s;};i.prototype.on=function(i,t){(this.i[i]||(this.i[i]=[])).push(t);},i.prototype.off=function(i,t){this.i[i]&&this.i[i].splice(this.i[i].indexOf(t)>>>0,1);},i.prototype.u=function(i,t){(this.i[i]||[]).slice().map(function(i){i(t);});},i.prototype.init=function(){var i=this,t=[];this.observer=new IntersectionObserver(function(n){var s=i.v();n.forEach(function(n){var h=n.target,r={bounds:n.boundingClientRect,element:h,index:t.indexOf(h),isScrollingDown:s},o=h===i.t?"container":"scene";i.u(n.isIntersecting?o+":enter":o+":exit",r);});},{rootMargin:-100*(1-this.s)+"% 0px "+-100*this.s+"%"});for(var n=0;n<this.o.length;n++){var s=this.o[n];t.push(s),this.observer.observe(s);}this.t&&this.observer.observe(this.t),this.u("init");},i.prototype.v=function(){var i=window.pageYOffset,t=i>this.h;return this.h=i,t};

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.23.2 */

    const file$1 = "node_modules/svelte-select/src/Item.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl");
    			add_location(div, file$1, 61, 0, 1353);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
    			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { isActive = false } = $$props;
    	let { isFirst = false } = $$props;
    	let { isHover = false } = $$props;
    	let { getOptionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let itemClasses = "";
    	const writable_props = ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Item", $$slots, []);

    	$$self.$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		isActive,
    		isFirst,
    		isHover,
    		getOptionLabel,
    		item,
    		filterText,
    		itemClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
    			 {
    				const classes = [];

    				if (isActive) {
    					classes.push("active");
    				}

    				if (isFirst) {
    					classes.push("first");
    				}

    				if (isHover) {
    					classes.push("hover");
    				}

    				if (item.isGroupHeader) {
    					classes.push("groupHeader");
    				}

    				if (item.isGroupItem) {
    					classes.push("groupItem");
    				}

    				$$invalidate(3, itemClasses = classes.join(" "));
    			}
    		}
    	};

    	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			isActive: 4,
    			isFirst: 5,
    			isHover: 6,
    			getOptionLabel: 0,
    			item: 1,
    			filterText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFirst() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFirst(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isHover() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isHover(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.23.2 */
    const file$2 = "node_modules/svelte-select/src/VirtualList.svelte";

    const get_default_slot_changes = dirty => ({
    	item: dirty & /*visible*/ 32,
    	i: dirty & /*visible*/ 32,
    	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
    });

    const get_default_slot_context = ctx => ({
    	item: /*row*/ ctx[23].data,
    	i: /*row*/ ctx[23].index,
    	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
    });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (160:57) Missing template
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Missing template");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(160:57) Missing template",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#each visible as row (row.index)}
    function create_each_block(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_row, file$2, 158, 3, 3514);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, visible, hoverItemIndex*/ 8226) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(158:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*visible*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[23].index;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-p6ehlv");
    			add_location(svelte_virtual_list_contents, file$2, 156, 1, 3364);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-p6ehlv");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[17].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$2, 154, 0, 3222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[15](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[16](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[17].bind(svelte_virtual_list_viewport));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$scope, visible, hoverItemIndex*/ 8226) {
    				const each_value = /*visible*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*top*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 128) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[15](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[16](null);
    			svelte_virtual_list_viewport_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { items = undefined } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;

    	// local state
    	let height_map = [];

    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick(); // wait until the DOM is up to date
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(10, end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(7, bottom = remaining * average_height);
    		height_map.length = items.length;
    		$$invalidate(2, viewport.scrollTop = 0, viewport);
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(9, start = i);
    				$$invalidate(6, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(7, bottom = remaining * average_height);

    		// prevent jumping if we scrolled up into unknown territory
    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	} // TODO if we overestimated the space these
    	// rows would occupy we may need to add some

    	// more. maybe we can just call handle_scroll again?
    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(20, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("VirtualList", $$slots, ['default']);

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(3, contents);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(2, viewport);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(4, viewport_height);
    	}

    	$$self.$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		items,
    		height,
    		itemHeight,
    		hoverItemIndex,
    		start,
    		end,
    		height_map,
    		rows,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		mounted,
    		top,
    		bottom,
    		average_height,
    		refresh,
    		handle_scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(2, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(3, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(4, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(20, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(6, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
    			 $$invalidate(5, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 1054736) {
    			// whenever `items` changes, invalidate the current heightmap
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		hoverItemIndex,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		$$scope,
    		$$slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			items: 11,
    			height: 0,
    			itemHeight: 12,
    			hoverItemIndex: 1,
    			start: 9,
    			end: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.23.2 */
    const file$3 = "node_modules/svelte-select/src/List.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (210:0) {#if isVirtualList}
    function create_if_block_3(ctx) {
    	let div;
    	let virtuallist;
    	let current;

    	virtuallist = new VirtualList({
    			props: {
    				items: /*items*/ ctx[4],
    				itemHeight: /*itemHeight*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ item, i }) => ({ 34: item, 36: i }),
    						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(virtuallist.$$.fragment);
    			attr_dev(div, "class", "listContainer virtualList svelte-ux0sbr");
    			add_location(div, file$3, 210, 0, 5850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
    			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

    			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(virtuallist);
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(210:0) {#if isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (213:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[18](/*i*/ ctx[36], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$3, 214, 4, 5972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
    			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(213:2) <VirtualList {items} {itemHeight} let:item let:i>",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if !isVirtualList}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "listContainer svelte-ux0sbr");
    			add_location(div, file$3, 232, 0, 6482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			/*div_binding_1*/ ctx[23](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 32630) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			/*div_binding_1*/ ctx[23](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(232:0) {#if !isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideEmptyState*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:4) {#if !hideEmptyState}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noOptionsMessage*/ ctx[11]);
    			attr_dev(div, "class", "empty svelte-ux0sbr");
    			add_location(div, file$3, 255, 6, 7186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data_dev(t, /*noOptionsMessage*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(255:4) {#if !hideEmptyState}",
    		ctx
    	});

    	return block;
    }

    // (237:4) { :else }
    function create_else_block(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1(...args) {
    		return /*mouseover_handler_1*/ ctx[21](/*i*/ ctx[36], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$3, 237, 4, 6696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
    					listen_dev(div, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(237:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1(ctx) {
    	let div;
    	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "listGroupTitle svelte-ux0sbr");
    			add_location(div, file$3, 235, 6, 6616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(235:4) {#if item.isGroupHeader && !item.isSelectable}",
    		ctx
    	});

    	return block;
    }

    // (234:2) {#each items as item, i}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(234:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3(ctx);
    	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isVirtualList*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*isVirtualList*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function itemClasses(hoverItemIndex, item, itemIndex, items, selectedValue, optionIdentifier, isMulti) {
    	return `${selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]
	? "active "
	: ""}${hoverItemIndex === itemIndex || items.length === 1
	? "hover"
	: ""}`;
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
    	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
    }

    function isItemFirst(itemIndex) {
    	return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
    	return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { items = [] } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		if (option) return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { optionIdentifier = "value" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { isMulti = false } = $$props;
    	let { activeItemIndex = 0 } = $$props;
    	let { filterText = "" } = $$props;
    	let isScrollingTimer = 0;
    	let isScrolling = false;
    	let prev_items;
    	let prev_activeItemIndex;
    	let prev_selectedValue;

    	onMount(() => {
    		if (items.length > 0 && !isMulti && selectedValue) {
    			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

    			if (_hoverItemIndex) {
    				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
    			}
    		}

    		scrollToActiveItem("active");

    		container.addEventListener(
    			"scroll",
    			() => {
    				clearTimeout(isScrollingTimer);

    				isScrollingTimer = setTimeout(
    					() => {
    						isScrolling = false;
    					},
    					100
    				);
    			},
    			false
    		);
    	});

    	onDestroy(() => {
    		
    	}); // clearTimeout(isScrollingTimer);

    	beforeUpdate(() => {
    		if (items !== prev_items && items.length > 0) {
    			$$invalidate(1, hoverItemIndex = 0);
    		}

    		// if (prev_activeItemIndex && activeItemIndex > -1) {
    		//   hoverItemIndex = activeItemIndex;
    		//   scrollToActiveItem('active');
    		// }
    		// if (prev_selectedValue && selectedValue) {
    		//   scrollToActiveItem('active');
    		//   if (items && !isMulti) {
    		//     const hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);
    		//     if (hoverItemIndex) {
    		//       hoverItemIndex = hoverItemIndex;
    		//     }
    		//   }
    		// }
    		prev_items = items;

    		prev_activeItemIndex = activeItemIndex;
    		prev_selectedValue = selectedValue;
    	});

    	function handleSelect(item) {
    		if (item.isCreator) return;
    		dispatch("itemSelected", item);
    	}

    	function handleHover(i) {
    		if (isScrolling) return;
    		$$invalidate(1, hoverItemIndex = i);
    	}

    	function handleClick(args) {
    		const { item, i, event } = args;
    		event.stopPropagation();
    		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

    		if (item.isCreator) {
    			dispatch("itemCreated", filterText);
    		} else {
    			$$invalidate(16, activeItemIndex = i);
    			$$invalidate(1, hoverItemIndex = i);
    			handleSelect(item);
    		}
    	}

    	function closeList() {
    		dispatch("closeList");
    	}

    	async function updateHoverItem(increment) {
    		if (isVirtualList) return;
    		let isNonSelectableItem = true;

    		while (isNonSelectableItem) {
    			if (increment > 0 && hoverItemIndex === items.length - 1) {
    				$$invalidate(1, hoverItemIndex = 0);
    			} else if (increment < 0 && hoverItemIndex === 0) {
    				$$invalidate(1, hoverItemIndex = items.length - 1);
    			} else {
    				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
    			}

    			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
    		}

    		await tick();
    		scrollToActiveItem("hover");
    	}

    	function handleKeyDown(e) {
    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				items.length && updateHoverItem(1);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				items.length && updateHoverItem(-1);
    				break;
    			case "Enter":
    				e.preventDefault();
    				if (items.length === 0) break;
    				const hoverItem = items[hoverItemIndex];
    				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
    					closeList();
    					break;
    				}
    				if (hoverItem.isCreator) {
    					dispatch("itemCreated", filterText);
    				} else {
    					$$invalidate(16, activeItemIndex = hoverItemIndex);
    					handleSelect(items[hoverItemIndex]);
    				}
    				break;
    			case "Tab":
    				e.preventDefault();
    				if (items.length === 0) break;
    				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
    				$$invalidate(16, activeItemIndex = hoverItemIndex);
    				handleSelect(items[hoverItemIndex]);
    				break;
    		}
    	}

    	function scrollToActiveItem(className) {
    		if (isVirtualList || !container) return;
    		let offsetBounding;
    		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

    		if (focusedElemBounding) {
    			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    		}

    		$$invalidate(0, container.scrollTop -= offsetBounding, container);
    	}

    	
    	

    	const writable_props = [
    		"container",
    		"Item",
    		"isVirtualList",
    		"items",
    		"getOptionLabel",
    		"getGroupHeaderLabel",
    		"itemHeight",
    		"hoverItemIndex",
    		"selectedValue",
    		"optionIdentifier",
    		"hideEmptyState",
    		"noOptionsMessage",
    		"isMulti",
    		"activeItemIndex",
    		"filterText"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("List", $$slots, []);
    	const mouseover_handler = i => handleHover(i);
    	const click_handler = (item, i, event) => handleClick({ item, i, event });

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	const mouseover_handler_1 = i => handleHover(i);
    	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		dispatch,
    		container,
    		ItemComponent: Item,
    		VirtualList,
    		Item: Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		hoverItemIndex,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		isMulti,
    		activeItemIndex,
    		filterText,
    		isScrollingTimer,
    		isScrolling,
    		prev_items,
    		prev_activeItemIndex,
    		prev_selectedValue,
    		itemClasses,
    		handleSelect,
    		handleHover,
    		handleClick,
    		closeList,
    		updateHoverItem,
    		handleKeyDown,
    		scrollToActiveItem,
    		isItemActive,
    		isItemFirst,
    		isItemHover
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
    		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
    		if ("prev_items" in $$props) prev_items = $$props.prev_items;
    		if ("prev_activeItemIndex" in $$props) prev_activeItemIndex = $$props.prev_activeItemIndex;
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		hoverItemIndex,
    		Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		filterText,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		activeItemIndex,
    		isMulti,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				container: 0,
    				Item: 2,
    				isVirtualList: 3,
    				items: 4,
    				getOptionLabel: 5,
    				getGroupHeaderLabel: 6,
    				itemHeight: 7,
    				hoverItemIndex: 1,
    				selectedValue: 8,
    				optionIdentifier: 9,
    				hideEmptyState: 10,
    				noOptionsMessage: 11,
    				isMulti: 17,
    				activeItemIndex: 16,
    				filterText: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get container() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.23.2 */

    const file$4 = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "selection svelte-ch6bh7");
    			add_location(div, file$4, 13, 0, 210);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { getSelectionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	const writable_props = ["getSelectionLabel", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Selection", $$slots, []);

    	$$self.$set = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ getSelectionLabel, item });

    	$$self.$inject_state = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSelectionLabel, item];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { getSelectionLabel: 0, item: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get getSelectionLabel() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.23.2 */
    const file$5 = "node_modules/svelte-select/src/MultiSelection.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (22:2) {#if !isDisabled}
    function create_if_block$1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[5](/*i*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$5, 24, 6, 806);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-rtzfov");
    			add_location(svg, file$5, 23, 4, 707);
    			attr_dev(div, "class", "multiSelectItem_clear svelte-rtzfov");
    			add_location(div, file$5, 22, 2, 623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(22:2) {#if !isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#each selectedValue as value, i}
    function create_each_block$2(ctx) {
    	let div1;
    	let div0;
    	let raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "";
    	let t0;
    	let t1;
    	let div1_class_value;
    	let if_block = !/*isDisabled*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "multiSelectItem_label svelte-rtzfov");
    			add_location(div0, file$5, 18, 2, 519);

    			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-rtzfov");

    			add_location(div1, file$5, 17, 0, 412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getSelectionLabel, selectedValue*/ 9 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[3](/*value*/ ctx[7]) + "")) div0.innerHTML = raw_value;
    			if (!/*isDisabled*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[9]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-rtzfov")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:0) {#each selectedValue as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedValue*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSelectedValue, isDisabled, handleClear, getSelectionLabel, selectedValue*/ 31) {
    				each_value = /*selectedValue*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { selectedValue = [] } = $$props;
    	let { activeSelectedValue = undefined } = $$props;
    	let { isDisabled = false } = $$props;
    	let { getSelectionLabel = undefined } = $$props;

    	function handleClear(i, event) {
    		event.stopPropagation();
    		dispatch("multiItemClear", { i });
    	}

    	const writable_props = ["selectedValue", "activeSelectedValue", "isDisabled", "getSelectionLabel"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelection", $$slots, []);
    	const click_handler = (i, event) => handleClear(i, event);

    	$$self.$set = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("getSelectionLabel" in $$props) $$invalidate(3, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		getSelectionLabel,
    		handleClear,
    		click_handler
    	];
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			selectedValue: 0,
    			activeSelectedValue: 1,
    			isDisabled: 2,
    			getSelectionLabel: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelection",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get selectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSelectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSelectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }

    function debounce(func, wait, immediate) {
      let timeout;

      return function executedFunction() {
        let context = this;
        let args = arguments;
    	    
        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;
    	
        clearTimeout(timeout);

        timeout = setTimeout(later, wait);
    	
        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1 } = globals;
    const file$6 = "node_modules/svelte-select/src/Select.svelte";

    // (789:2) {#if Icon}
    function create_if_block_6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*Icon*/ ctx[16];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*Icon*/ ctx[16])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(789:2) {#if Icon}",
    		ctx
    	});

    	return block;
    }

    // (793:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*MultiSelection*/ ctx[7];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selectedValue: /*selectedValue*/ ctx[3],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[12],
    				activeSelectedValue: /*activeSelectedValue*/ ctx[20],
    				isDisabled: /*isDisabled*/ ctx[9]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[24]);
    		switch_instance.$on("focus", /*handleFocus*/ ctx[27]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 8) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[3];
    			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];
    			if (dirty[0] & /*activeSelectedValue*/ 1048576) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[20];
    			if (dirty[0] & /*isDisabled*/ 512) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[9];

    			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[24]);
    					switch_instance.$on("focus", /*handleFocus*/ ctx[27]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(793:2) {#if isMulti && selectedValue && selectedValue.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (813:2) {:else}
    function create_else_block$1(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[21],
    		{ placeholder: /*placeholderText*/ ctx[23] },
    		{ style: /*inputStyles*/ ctx[14] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-2eeumy", true);
    			add_location(input_1, file$6, 813, 4, 19857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding_1*/ ctx[57](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[27], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler_1*/ ctx[58])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 2097152 && /*_inputAttributes*/ ctx[21],
    				dirty[0] & /*placeholderText*/ 8388608 && { placeholder: /*placeholderText*/ ctx[23] },
    				dirty[0] & /*inputStyles*/ 16384 && { style: /*inputStyles*/ ctx[14] }
    			]));

    			if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
    				set_input_value(input_1, /*filterText*/ ctx[4]);
    			}

    			toggle_class(input_1, "svelte-2eeumy", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding_1*/ ctx[57](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(813:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (804:2) {#if isDisabled}
    function create_if_block_4(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[21],
    		{ placeholder: /*placeholderText*/ ctx[23] },
    		{ style: /*inputStyles*/ ctx[14] },
    		{ disabled: true }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-2eeumy", true);
    			add_location(input_1, file$6, 804, 4, 19645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding*/ ctx[55](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[4]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[27], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[56])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 2097152 && /*_inputAttributes*/ ctx[21],
    				dirty[0] & /*placeholderText*/ 8388608 && { placeholder: /*placeholderText*/ ctx[23] },
    				dirty[0] & /*inputStyles*/ 16384 && { style: /*inputStyles*/ ctx[14] },
    				{ disabled: true }
    			]));

    			if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
    				set_input_value(input_1, /*filterText*/ ctx[4]);
    			}

    			toggle_class(input_1, "svelte-2eeumy", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[55](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(804:2) {#if isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (823:2) {#if !isMulti && showSelectedItem}
    function create_if_block_3$1(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Selection*/ ctx[6];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*selectedValue*/ ctx[3],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[12]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "selectedItem svelte-2eeumy");
    			add_location(div, file$6, 823, 4, 20090);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 8) switch_instance_changes.item = /*selectedValue*/ ctx[3];
    			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];

    			if (switch_value !== (switch_value = /*Selection*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(823:2) {#if !isMulti && showSelectedItem}",
    		ctx
    	});

    	return block;
    }

    // (832:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_2$1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n          l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$6, 839, 8, 20553);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-2eeumy");
    			add_location(svg, file$6, 833, 6, 20412);
    			attr_dev(div, "class", "clearSelect svelte-2eeumy");
    			add_location(div, file$6, 832, 4, 20342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[19]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(832:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (848:2) {#if showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem))}
    function create_if_block_1$1(ctx) {
    	let div;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n          3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n          1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n          0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n          0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$6, 855, 8, 21137);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "css-19bqh2r svelte-2eeumy");
    			add_location(svg, file$6, 849, 6, 20998);
    			attr_dev(div, "class", "indicator svelte-2eeumy");
    			add_location(div, file$6, 848, 4, 20968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(848:2) {#if showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem))}",
    		ctx
    	});

    	return block;
    }

    // (866:2) {#if isWaiting}
    function create_if_block$2(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "spinner_path svelte-2eeumy");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "currentColor");
    			attr_dev(circle, "stroke-width", "5");
    			attr_dev(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$6, 868, 8, 21618);
    			attr_dev(svg, "class", "spinner_icon svelte-2eeumy");
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$6, 867, 6, 21561);
    			attr_dev(div, "class", "spinner svelte-2eeumy");
    			add_location(div, file$6, 866, 4, 21533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(866:2) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*Icon*/ ctx[16] && create_if_block_6(ctx);
    	let if_block1 = /*isMulti*/ ctx[8] && /*selectedValue*/ ctx[3] && /*selectedValue*/ ctx[3].length > 0 && create_if_block_5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isDisabled*/ ctx[9]) return create_if_block_4;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = !/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[22] && create_if_block_3$1(ctx);
    	let if_block4 = /*showSelectedItem*/ ctx[22] && /*isClearable*/ ctx[15] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && create_if_block_2$1(ctx);
    	let if_block5 = (/*showChevron*/ ctx[17] && !/*selectedValue*/ ctx[3] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[22] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[22])) && create_if_block_1$1(ctx);
    	let if_block6 = /*isWaiting*/ ctx[5] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[18] + " svelte-2eeumy");
    			attr_dev(div, "style", /*containerStyles*/ ctx[11]);
    			toggle_class(div, "hasError", /*hasError*/ ctx[10]);
    			toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
    			toggle_class(div, "focused", /*isFocused*/ ctx[2]);
    			add_location(div, file$6, 778, 0, 19037);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    			/*div_binding*/ ctx[59](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*handleWindowClick*/ ctx[28], false, false, false),
    					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[26], false, false, false),
    					listen_dev(window, "resize", /*getPosition*/ ctx[25], false, false, false),
    					listen_dev(div, "click", /*handleClick*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Icon*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*Icon*/ 65536) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isMulti*/ ctx[8] && /*selectedValue*/ ctx[3] && /*selectedValue*/ ctx[3].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, selectedValue*/ 264) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			}

    			if (!/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[22]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, showSelectedItem*/ 4194560) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_3$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*showSelectedItem*/ ctx[22] && /*isClearable*/ ctx[15] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_2$1(ctx);
    					if_block4.c();
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*showChevron*/ ctx[17] && !/*selectedValue*/ ctx[3] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[22] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[22])) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_1$1(ctx);
    					if_block5.c();
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*isWaiting*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$2(ctx);
    					if_block6.c();
    					if_block6.m(div, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (!current || dirty[0] & /*containerClasses*/ 262144 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[18] + " svelte-2eeumy")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 2048) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[11]);
    			}

    			if (dirty[0] & /*containerClasses, hasError*/ 263168) {
    				toggle_class(div, "hasError", /*hasError*/ ctx[10]);
    			}

    			if (dirty[0] & /*containerClasses, isMulti*/ 262400) {
    				toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			}

    			if (dirty[0] & /*containerClasses, isDisabled*/ 262656) {
    				toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
    			}

    			if (dirty[0] & /*containerClasses, isFocused*/ 262148) {
    				toggle_class(div, "focused", /*isFocused*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			/*div_binding*/ ctx[59](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { input = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { Selection: Selection$1 = Selection } = $$props;
    	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
    	let { isMulti = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isCreatable = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let { placeholder = "Select..." } = $$props;
    	let { items = [] } = $$props;
    	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
    	let { groupBy = undefined } = $$props;
    	let { groupFilter = groups => groups } = $$props;
    	let { isGroupHeaderSelectable = false } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { optionIdentifier = "value" } = $$props;
    	let { loadOptions = undefined } = $$props;
    	let { hasError = false } = $$props;
    	let { containerStyles = "" } = $$props;

    	let { getSelectionLabel = option => {
    		if (option) return option.label;
    	} } = $$props;

    	let { createGroupHeaderItem = groupValue => {
    		return { value: groupValue, label: groupValue };
    	} } = $$props;

    	let { createItem = filterText => {
    		return { value: filterText, label: filterText };
    	} } = $$props;

    	let { isSearchable = true } = $$props;
    	let { inputStyles = "" } = $$props;
    	let { isClearable = true } = $$props;
    	let { isWaiting = false } = $$props;
    	let { listPlacement = "auto" } = $$props;
    	let { listOpen = false } = $$props;
    	let { list = undefined } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { loadOptionsInterval = 300 } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { filteredItems = [] } = $$props;
    	let { inputAttributes = {} } = $$props;
    	let { listAutoWidth = true } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { Icon = undefined } = $$props;
    	let { showChevron = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let target;
    	let activeSelectedValue;
    	let _items = [];
    	let originalItemsClone;
    	let prev_selectedValue;
    	let prev_listOpen;
    	let prev_filterText;
    	let prev_isFocused;
    	let prev_filteredItems;

    	async function resetFilter() {
    		await tick();
    		$$invalidate(4, filterText = "");
    	}

    	let getItemsHasInvoked = false;

    	const getItems = debounce(
    		async () => {
    			getItemsHasInvoked = true;
    			$$invalidate(5, isWaiting = true);
    			$$invalidate(30, items = await loadOptions(filterText));
    			$$invalidate(5, isWaiting = false);
    			$$invalidate(2, isFocused = true);
    			$$invalidate(31, listOpen = true);
    		},
    		loadOptionsInterval
    	);

    	let _inputAttributes = {};

    	beforeUpdate(() => {
    		if (isMulti && selectedValue && selectedValue.length > 1) {
    			checkSelectedValueForDuplicates();
    		}

    		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
    			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
    			if (checkSelectedValueForDuplicates()) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (container && listOpen !== prev_listOpen) {
    			if (listOpen) {
    				loadList();
    			} else {
    				removeList();
    			}
    		}

    		if (filterText !== prev_filterText) {
    			if (filterText.length > 0) {
    				$$invalidate(2, isFocused = true);
    				$$invalidate(31, listOpen = true);

    				if (loadOptions) {
    					getItems();
    				} else {
    					loadList();
    					$$invalidate(31, listOpen = true);

    					if (isMulti) {
    						$$invalidate(20, activeSelectedValue = undefined);
    					}
    				}
    			} else {
    				setList([]);
    			}

    			if (list) {
    				list.$set({ filterText });
    			}
    		}

    		if (isFocused !== prev_isFocused) {
    			if (isFocused || listOpen) {
    				handleFocus();
    			} else {
    				resetFilter();
    				if (input) input.blur();
    			}
    		}

    		if (prev_filteredItems !== filteredItems) {
    			let _filteredItems = [...filteredItems];

    			if (isCreatable && filterText) {
    				const itemToCreate = createItem(filterText);
    				itemToCreate.isCreator = true;

    				const existingItemWithFilterValue = _filteredItems.find(item => {
    					return item[optionIdentifier] === itemToCreate[optionIdentifier];
    				});

    				let existingSelectionWithFilterValue;

    				if (selectedValue) {
    					if (isMulti) {
    						existingSelectionWithFilterValue = selectedValue.find(selection => {
    							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
    						});
    					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
    						existingSelectionWithFilterValue = selectedValue;
    					}
    				}

    				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
    					_filteredItems = [..._filteredItems, itemToCreate];
    				}
    			}

    			setList(_filteredItems);
    		}

    		prev_selectedValue = selectedValue;
    		prev_listOpen = listOpen;
    		prev_filterText = filterText;
    		prev_isFocused = isFocused;
    		prev_filteredItems = filteredItems;
    	});

    	function checkSelectedValueForDuplicates() {
    		let noDuplicates = true;

    		if (selectedValue) {
    			const ids = [];
    			const uniqueValues = [];

    			selectedValue.forEach(val => {
    				if (!ids.includes(val[optionIdentifier])) {
    					ids.push(val[optionIdentifier]);
    					uniqueValues.push(val);
    				} else {
    					noDuplicates = false;
    				}
    			});

    			$$invalidate(3, selectedValue = uniqueValues);
    		}

    		return noDuplicates;
    	}

    	async function setList(items) {
    		await tick();
    		if (list) return list.$set({ items });
    		if (loadOptions && getItemsHasInvoked && items.length > 0) loadList();
    	}

    	function handleMultiItemClear(event) {
    		const { detail } = event;
    		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

    		if (selectedValue.length === 1) {
    			$$invalidate(3, selectedValue = undefined);
    		} else {
    			$$invalidate(3, selectedValue = selectedValue.filter(item => {
    				return item !== itemToRemove;
    			}));
    		}

    		dispatch("clear", itemToRemove);
    		getPosition();
    	}

    	async function getPosition() {
    		await tick();
    		if (!target || !container) return;
    		const { top, height, width } = container.getBoundingClientRect();
    		target.style["min-width"] = `${width}px`;
    		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
    		target.style.left = "0";

    		if (listPlacement === "top") {
    			target.style.bottom = `${height + 5}px`;
    		} else {
    			target.style.top = `${height + 5}px`;
    		}

    		target = target;

    		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
    			target.style.top = ``;
    			target.style.bottom = `${height + 5}px`;
    		}

    		target.style.visibility = "";
    	}

    	function handleKeyDown(e) {
    		if (!isFocused) return;

    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				$$invalidate(31, listOpen = true);
    				$$invalidate(20, activeSelectedValue = undefined);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				$$invalidate(31, listOpen = true);
    				$$invalidate(20, activeSelectedValue = undefined);
    				break;
    			case "Tab":
    				if (!listOpen) $$invalidate(2, isFocused = false);
    				break;
    			case "Backspace":
    				if (!isMulti || filterText.length > 0) return;
    				if (isMulti && selectedValue && selectedValue.length > 0) {
    					handleMultiItemClear(activeSelectedValue !== undefined
    					? activeSelectedValue
    					: selectedValue.length - 1);

    					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

    					$$invalidate(20, activeSelectedValue = selectedValue.length > activeSelectedValue
    					? activeSelectedValue - 1
    					: undefined);
    				}
    				break;
    			case "ArrowLeft":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0) return;
    				if (activeSelectedValue === undefined) {
    					$$invalidate(20, activeSelectedValue = selectedValue.length - 1);
    				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
    					$$invalidate(20, activeSelectedValue -= 1);
    				}
    				break;
    			case "ArrowRight":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
    				if (activeSelectedValue === selectedValue.length - 1) {
    					$$invalidate(20, activeSelectedValue = undefined);
    				} else if (activeSelectedValue < selectedValue.length - 1) {
    					$$invalidate(20, activeSelectedValue += 1);
    				}
    				break;
    		}
    	}

    	function handleFocus() {
    		$$invalidate(2, isFocused = true);
    		if (input) input.focus();
    	}

    	function removeList() {
    		resetFilter();
    		$$invalidate(20, activeSelectedValue = undefined);
    		if (!list) return;
    		list.$destroy();
    		$$invalidate(32, list = undefined);
    		if (!target) return;
    		if (target.parentNode) target.parentNode.removeChild(target);
    		target = undefined;
    		$$invalidate(32, list);
    		target = target;
    	}

    	function handleWindowClick(event) {
    		if (!container) return;

    		const eventTarget = event.path && event.path.length > 0
    		? event.path[0]
    		: event.target;

    		if (container.contains(eventTarget)) return;
    		$$invalidate(2, isFocused = false);
    		$$invalidate(31, listOpen = false);
    		$$invalidate(20, activeSelectedValue = undefined);
    		if (input) input.blur();
    	}

    	function handleClick() {
    		if (isDisabled) return;
    		$$invalidate(2, isFocused = true);
    		$$invalidate(31, listOpen = !listOpen);
    	}

    	function handleClear() {
    		$$invalidate(3, selectedValue = undefined);
    		$$invalidate(31, listOpen = false);
    		dispatch("clear", selectedValue);
    		handleFocus();
    	}

    	async function loadList() {
    		await tick();
    		if (target && list) return;

    		const data = {
    			Item: Item$1,
    			filterText,
    			optionIdentifier,
    			noOptionsMessage,
    			hideEmptyState,
    			isVirtualList,
    			selectedValue,
    			isMulti,
    			getGroupHeaderLabel,
    			items: filteredItems,
    			itemHeight
    		};

    		if (getOptionLabel) {
    			data.getOptionLabel = getOptionLabel;
    		}

    		target = document.createElement("div");

    		Object.assign(target.style, {
    			position: "absolute",
    			"z-index": 2,
    			visibility: "hidden"
    		});

    		$$invalidate(32, list);
    		target = target;
    		if (container) container.appendChild(target);
    		$$invalidate(32, list = new List({ target, props: data }));

    		list.$on("itemSelected", event => {
    			const { detail } = event;

    			if (detail) {
    				const item = Object.assign({}, detail);

    				if (!item.isGroupHeader || item.isSelectable) {
    					if (isMulti) {
    						$$invalidate(3, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
    					} else {
    						$$invalidate(3, selectedValue = item);
    					}

    					resetFilter();
    					($$invalidate(3, selectedValue), $$invalidate(43, optionIdentifier));

    					setTimeout(() => {
    						$$invalidate(31, listOpen = false);
    						$$invalidate(20, activeSelectedValue = undefined);
    					});
    				}
    			}
    		});

    		list.$on("itemCreated", event => {
    			const { detail } = event;

    			if (isMulti) {
    				$$invalidate(3, selectedValue = selectedValue || []);
    				$$invalidate(3, selectedValue = [...selectedValue, createItem(detail)]);
    			} else {
    				$$invalidate(3, selectedValue = createItem(detail));
    			}

    			$$invalidate(4, filterText = "");
    			$$invalidate(31, listOpen = false);
    			$$invalidate(20, activeSelectedValue = undefined);
    			resetFilter();
    		});

    		list.$on("closeList", () => {
    			$$invalidate(31, listOpen = false);
    		});

    		($$invalidate(32, list), target = target);
    		getPosition();
    	}

    	onMount(() => {
    		if (isFocused) input.focus();
    		if (listOpen) loadList();

    		if (items && items.length > 0) {
    			$$invalidate(61, originalItemsClone = JSON.stringify(items));
    		}

    		if (selectedValue) {
    			if (isMulti) {
    				$$invalidate(3, selectedValue = selectedValue.map(item => {
    					if (typeof item === "string") {
    						return { value: item, label: item };
    					} else {
    						return item;
    					}
    				}));
    			}
    		}
    	});

    	onDestroy(() => {
    		removeList();
    	});

    	const writable_props = [
    		"container",
    		"input",
    		"Item",
    		"Selection",
    		"MultiSelection",
    		"isMulti",
    		"isDisabled",
    		"isCreatable",
    		"isFocused",
    		"selectedValue",
    		"filterText",
    		"placeholder",
    		"items",
    		"itemFilter",
    		"groupBy",
    		"groupFilter",
    		"isGroupHeaderSelectable",
    		"getGroupHeaderLabel",
    		"getOptionLabel",
    		"optionIdentifier",
    		"loadOptions",
    		"hasError",
    		"containerStyles",
    		"getSelectionLabel",
    		"createGroupHeaderItem",
    		"createItem",
    		"isSearchable",
    		"inputStyles",
    		"isClearable",
    		"isWaiting",
    		"listPlacement",
    		"listOpen",
    		"list",
    		"isVirtualList",
    		"loadOptionsInterval",
    		"noOptionsMessage",
    		"hideEmptyState",
    		"filteredItems",
    		"inputAttributes",
    		"listAutoWidth",
    		"itemHeight",
    		"Icon",
    		"showChevron",
    		"containerClasses"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Select", $$slots, []);

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(1, input);
    		});
    	}

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate(4, filterText);
    	}

    	function input_1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(1, input);
    		});
    	}

    	function input_1_input_handler_1() {
    		filterText = this.value;
    		$$invalidate(4, filterText);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(34, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(35, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(2, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(4, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(36, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(30, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(37, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(38, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(39, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(40, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(41, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(42, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(43, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(44, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(45, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(46, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(47, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(31, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(32, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(48, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(49, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(50, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(51, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(33, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(52, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(53, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(54, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(16, Icon = $$props.Icon);
    		if ("showChevron" in $$props) $$invalidate(17, showChevron = $$props.showChevron);
    		if ("containerClasses" in $$props) $$invalidate(18, containerClasses = $$props.containerClasses);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		List,
    		ItemComponent: Item,
    		SelectionComponent: Selection,
    		MultiSelectionComponent: MultiSelection,
    		isOutOfViewport,
    		debounce,
    		dispatch,
    		container,
    		input,
    		Item: Item$1,
    		Selection: Selection$1,
    		MultiSelection: MultiSelection$1,
    		isMulti,
    		isDisabled,
    		isCreatable,
    		isFocused,
    		selectedValue,
    		filterText,
    		placeholder,
    		items,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		createGroupHeaderItem,
    		createItem,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		isWaiting,
    		listPlacement,
    		listOpen,
    		list,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		filteredItems,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		Icon,
    		showChevron,
    		containerClasses,
    		target,
    		activeSelectedValue,
    		_items,
    		originalItemsClone,
    		prev_selectedValue,
    		prev_listOpen,
    		prev_filterText,
    		prev_isFocused,
    		prev_filteredItems,
    		resetFilter,
    		getItemsHasInvoked,
    		getItems,
    		_inputAttributes,
    		checkSelectedValueForDuplicates,
    		setList,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		removeList,
    		handleWindowClick,
    		handleClick,
    		handleClear,
    		loadList,
    		disabled,
    		showSelectedItem,
    		placeholderText
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(34, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(35, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(2, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(4, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(36, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(30, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(37, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(38, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(39, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(40, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(41, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(42, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(43, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(44, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(45, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(46, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(47, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(31, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(32, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(48, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(49, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(50, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(51, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(33, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(52, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(53, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(54, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(16, Icon = $$props.Icon);
    		if ("showChevron" in $$props) $$invalidate(17, showChevron = $$props.showChevron);
    		if ("containerClasses" in $$props) $$invalidate(18, containerClasses = $$props.containerClasses);
    		if ("target" in $$props) target = $$props.target;
    		if ("activeSelectedValue" in $$props) $$invalidate(20, activeSelectedValue = $$props.activeSelectedValue);
    		if ("_items" in $$props) $$invalidate(70, _items = $$props._items);
    		if ("originalItemsClone" in $$props) $$invalidate(61, originalItemsClone = $$props.originalItemsClone);
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    		if ("prev_listOpen" in $$props) prev_listOpen = $$props.prev_listOpen;
    		if ("prev_filterText" in $$props) prev_filterText = $$props.prev_filterText;
    		if ("prev_isFocused" in $$props) prev_isFocused = $$props.prev_isFocused;
    		if ("prev_filteredItems" in $$props) prev_filteredItems = $$props.prev_filteredItems;
    		if ("getItemsHasInvoked" in $$props) getItemsHasInvoked = $$props.getItemsHasInvoked;
    		if ("_inputAttributes" in $$props) $$invalidate(21, _inputAttributes = $$props._inputAttributes);
    		if ("disabled" in $$props) disabled = $$props.disabled;
    		if ("showSelectedItem" in $$props) $$invalidate(22, showSelectedItem = $$props.showSelectedItem);
    		if ("placeholderText" in $$props) $$invalidate(23, placeholderText = $$props.placeholderText);
    	};

    	let disabled;
    	let showSelectedItem;
    	let placeholderText;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*isDisabled*/ 512) {
    			 disabled = isDisabled;
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 8 | $$self.$$.dirty[1] & /*optionIdentifier*/ 4096) {
    			 {
    				if (typeof selectedValue === "string") {
    					$$invalidate(3, selectedValue = {
    						[optionIdentifier]: selectedValue,
    						label: selectedValue
    					});
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 24) {
    			 $$invalidate(22, showSelectedItem = selectedValue && filterText.length === 0);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 8 | $$self.$$.dirty[1] & /*placeholder*/ 32) {
    			 $$invalidate(23, placeholderText = selectedValue ? "" : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*isSearchable*/ 8192 | $$self.$$.dirty[1] & /*inputAttributes*/ 2097152) {
    			 {
    				$$invalidate(21, _inputAttributes = Object.assign(inputAttributes, {
    					autocomplete: "off",
    					autocorrect: "off",
    					spellcheck: false
    				}));

    				if (!isSearchable) {
    					$$invalidate(21, _inputAttributes.readonly = true, _inputAttributes);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*items, filterText, isMulti, selectedValue*/ 1073742104 | $$self.$$.dirty[1] & /*loadOptions, originalItemsClone, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 1073773504) {
    			 {
    				let _filteredItems;
    				let _items = items;

    				if (items && items.length > 0 && typeof items[0] !== "object") {
    					_items = items.map((item, index) => {
    						return { index, value: item, label: item };
    					});
    				}

    				if (loadOptions && filterText.length === 0 && originalItemsClone) {
    					_filteredItems = JSON.parse(originalItemsClone);
    					_items = JSON.parse(originalItemsClone);
    				} else {
    					_filteredItems = loadOptions
    					? filterText.length === 0 ? [] : _items
    					: _items.filter(item => {
    							let keepItem = true;

    							if (isMulti && selectedValue) {
    								keepItem = !selectedValue.find(value => {
    									return value[optionIdentifier] === item[optionIdentifier];
    								});
    							}

    							if (!keepItem) return false;
    							if (filterText.length < 1) return true;
    							return itemFilter(getOptionLabel(item, filterText), filterText, item);
    						});
    				}

    				if (groupBy) {
    					const groupValues = [];
    					const groups = {};

    					_filteredItems.forEach(item => {
    						const groupValue = groupBy(item);

    						if (!groupValues.includes(groupValue)) {
    							groupValues.push(groupValue);
    							groups[groupValue] = [];

    							if (groupValue) {
    								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
    									id: groupValue,
    									isGroupHeader: true,
    									isSelectable: isGroupHeaderSelectable
    								}));
    							}
    						}

    						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
    					});

    					const sortedGroupedItems = [];

    					groupFilter(groupValues).forEach(groupValue => {
    						sortedGroupedItems.push(...groups[groupValue]);
    					});

    					$$invalidate(33, filteredItems = sortedGroupedItems);
    				} else {
    					$$invalidate(33, filteredItems = _filteredItems);
    				}
    			}
    		}
    	};

    	return [
    		container,
    		input,
    		isFocused,
    		selectedValue,
    		filterText,
    		isWaiting,
    		Selection$1,
    		MultiSelection$1,
    		isMulti,
    		isDisabled,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		Icon,
    		showChevron,
    		containerClasses,
    		handleClear,
    		activeSelectedValue,
    		_inputAttributes,
    		showSelectedItem,
    		placeholderText,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		items,
    		listOpen,
    		list,
    		filteredItems,
    		Item$1,
    		isCreatable,
    		placeholder,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		createGroupHeaderItem,
    		createItem,
    		listPlacement,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		input_1_binding,
    		input_1_input_handler,
    		input_1_binding_1,
    		input_1_input_handler_1,
    		div_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				container: 0,
    				input: 1,
    				Item: 34,
    				Selection: 6,
    				MultiSelection: 7,
    				isMulti: 8,
    				isDisabled: 9,
    				isCreatable: 35,
    				isFocused: 2,
    				selectedValue: 3,
    				filterText: 4,
    				placeholder: 36,
    				items: 30,
    				itemFilter: 37,
    				groupBy: 38,
    				groupFilter: 39,
    				isGroupHeaderSelectable: 40,
    				getGroupHeaderLabel: 41,
    				getOptionLabel: 42,
    				optionIdentifier: 43,
    				loadOptions: 44,
    				hasError: 10,
    				containerStyles: 11,
    				getSelectionLabel: 12,
    				createGroupHeaderItem: 45,
    				createItem: 46,
    				isSearchable: 13,
    				inputStyles: 14,
    				isClearable: 15,
    				isWaiting: 5,
    				listPlacement: 47,
    				listOpen: 31,
    				list: 32,
    				isVirtualList: 48,
    				loadOptionsInterval: 49,
    				noOptionsMessage: 50,
    				hideEmptyState: 51,
    				filteredItems: 33,
    				inputAttributes: 52,
    				listAutoWidth: 53,
    				itemHeight: 54,
    				Icon: 16,
    				showChevron: 17,
    				containerClasses: 18,
    				handleClear: 19
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get container() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Selection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Selection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get MultiSelection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set MultiSelection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isCreatable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupBy() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupBy(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGroupHeaderSelectable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGroupHeaderSelectable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptions() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptions(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasError() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasError(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createGroupHeaderItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createGroupHeaderItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearchable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearchable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isWaiting() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isWaiting(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listPlacement() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listPlacement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listOpen() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listOpen(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptionsInterval() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptionsInterval(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filteredItems() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filteredItems(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAttributes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAttributes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listAutoWidth() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listAutoWidth(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Icon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Icon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showChevron() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showChevron(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[19];
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function identity(x) {
      return x;
    }

    function transform(transform) {
      if (transform == null) return identity;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2, n = input.length, output = new Array(n);
        output[0] = (x0 += input[0]) * kx + dx;
        output[1] = (y0 += input[1]) * ky + dy;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function reverse(array, n) {
      var t, j = array.length, i = j - n;
      while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
    }

    function feature(topology, o) {
      return o.type === "GeometryCollection"
          ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
          : feature$1(topology, o);
    }

    function feature$1(topology, o) {
      var id = o.id,
          bbox = o.bbox,
          properties = o.properties == null ? {} : o.properties,
          geometry = object(topology, o);
      return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
          : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
          : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
    }

    function object(topology, o) {
      var transformPoint = transform(topology.transform),
          arcs = topology.arcs;

      function arc(i, points) {
        if (points.length) points.pop();
        for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
          points.push(transformPoint(a[k], k));
        }
        if (i < 0) reverse(points, n);
      }

      function point(p) {
        return transformPoint(p);
      }

      function line(arcs) {
        var points = [];
        for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
        return points;
      }

      function ring(arcs) {
        var points = line(arcs);
        while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
        return points;
      }

      function polygon(arcs) {
        return arcs.map(ring);
      }

      function geometry(o) {
        var type = o.type, coordinates;
        switch (type) {
          case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
          case "Point": coordinates = point(o.coordinates); break;
          case "MultiPoint": coordinates = o.coordinates.map(point); break;
          case "LineString": coordinates = line(o.arcs); break;
          case "MultiLineString": coordinates = o.arcs.map(line); break;
          case "Polygon": coordinates = polygon(o.arcs); break;
          case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
          default: return null;
        }
        return {type: type, coordinates: coordinates};
      }

      return geometry(o);
    }

    function stitch(topology, arcs) {
      var stitchedArcs = {},
          fragmentByStart = {},
          fragmentByEnd = {},
          fragments = [],
          emptyIndex = -1;

      // Stitch empty arcs first, since they may be subsumed by other arcs.
      arcs.forEach(function(i, j) {
        var arc = topology.arcs[i < 0 ? ~i : i], t;
        if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {
          t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;
        }
      });

      arcs.forEach(function(i) {
        var e = ends(i),
            start = e[0],
            end = e[1],
            f, g;

        if (f = fragmentByEnd[start]) {
          delete fragmentByEnd[f.end];
          f.push(i);
          f.end = end;
          if (g = fragmentByStart[end]) {
            delete fragmentByStart[g.start];
            var fg = g === f ? f : f.concat(g);
            fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;
          } else {
            fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
          }
        } else if (f = fragmentByStart[end]) {
          delete fragmentByStart[f.start];
          f.unshift(i);
          f.start = start;
          if (g = fragmentByEnd[start]) {
            delete fragmentByEnd[g.end];
            var gf = g === f ? f : g.concat(f);
            fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;
          } else {
            fragmentByStart[f.start] = fragmentByEnd[f.end] = f;
          }
        } else {
          f = [i];
          fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;
        }
      });

      function ends(i) {
        var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;
        if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });
        else p1 = arc[arc.length - 1];
        return i < 0 ? [p1, p0] : [p0, p1];
      }

      function flush(fragmentByEnd, fragmentByStart) {
        for (var k in fragmentByEnd) {
          var f = fragmentByEnd[k];
          delete fragmentByStart[f.start];
          delete f.start;
          delete f.end;
          f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });
          fragments.push(f);
        }
      }

      flush(fragmentByEnd, fragmentByStart);
      flush(fragmentByStart, fragmentByEnd);
      arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });

      return fragments;
    }

    function mesh(topology) {
      return object(topology, meshArcs.apply(this, arguments));
    }

    function meshArcs(topology, object, filter) {
      var arcs, i, n;
      if (arguments.length > 1) arcs = extractArcs(topology, object, filter);
      else for (i = 0, arcs = new Array(n = topology.arcs.length); i < n; ++i) arcs[i] = i;
      return {type: "MultiLineString", arcs: stitch(topology, arcs)};
    }

    function extractArcs(topology, object, filter) {
      var arcs = [],
          geomsByArc = [],
          geom;

      function extract0(i) {
        var j = i < 0 ? ~i : i;
        (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});
      }

      function extract1(arcs) {
        arcs.forEach(extract0);
      }

      function extract2(arcs) {
        arcs.forEach(extract1);
      }

      function extract3(arcs) {
        arcs.forEach(extract2);
      }

      function geometry(o) {
        switch (geom = o, o.type) {
          case "GeometryCollection": o.geometries.forEach(geometry); break;
          case "LineString": extract1(o.arcs); break;
          case "MultiLineString": case "Polygon": extract2(o.arcs); break;
          case "MultiPolygon": extract3(o.arcs); break;
        }
      }

      geometry(object);

      geomsByArc.forEach(filter == null
          ? function(geoms) { arcs.push(geoms[0].i); }
          : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });

      return arcs;
    }

    // Adds floating point numbers with twice the normal precision.
    // Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
    // Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
    // 305–363 (1997).
    // Code adapted from GeographicLib by Charles F. F. Karney,
    // http://geographiclib.sourceforge.net/

    function adder() {
      return new Adder;
    }

    function Adder() {
      this.reset();
    }

    Adder.prototype = {
      constructor: Adder,
      reset: function() {
        this.s = // rounded value
        this.t = 0; // exact error
      },
      add: function(y) {
        add(temp, y, this.t);
        add(this, temp.s, this.s);
        if (this.s) this.t += temp.t;
        else this.s = temp.t;
      },
      valueOf: function() {
        return this.s;
      }
    };

    var temp = new Adder;

    function add(adder, a, b) {
      var x = adder.s = a + b,
          bv = x - a,
          av = x - bv;
      adder.t = (a - av) + (b - bv);
    }

    var epsilon = 1e-6;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var quarterPi = pi / 4;
    var tau = pi * 2;

    var degrees = 180 / pi;
    var radians = pi / 180;

    var abs = Math.abs;
    var atan = Math.atan;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var exp = Math.exp;
    var log = Math.log;
    var pow = Math.pow;
    var sin = Math.sin;
    var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt = Math.sqrt;
    var tan = Math.tan;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }

    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }

    function noop$1() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    function spherical(cartesian) {
      return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
      return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos(deltaPhi),
          sinDeltaPhi = sin(deltaPhi),
          cosDeltaGamma = cos(deltaGamma),
          sinDeltaGamma = sin(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos(radius),
          sinRadius = sin(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y, m) {
          line.push([x, y, m]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$1,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        if (pointEqual(p0, p1)) {
          if (!p0[2] && !p1[2]) {
            stream.lineStart();
            for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
            stream.lineEnd();
            return;
          }
          // handle degenerate cases by moving the point
          p1[0] += 2 * epsilon;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link(subject);
      link(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    var sum = adder();

    function longitude(point) {
      if (abs(point[0]) <= pi)
        return point[0];
      else
        return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin(phi),
          normal = [sin(lambda), -cos(lambda), 0],
          angle = 0,
          winding = 0;

      sum.reset();

      if (sinPhi === 1) phi = halfPi + epsilon;
      else if (sinPhi === -1) phi = -halfPi - epsilon;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin(phi0),
            cosPhi0 = cos(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin(phi1),
              cosPhi1 = cos(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
          angle += antimeridian ? delta + sign * tau : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);
    var bisectRight = ascendingBisect.right;

    function number(x) {
      return x === null ? NaN : +x;
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        start = Math.floor(start * step);
        stop = Math.ceil(stop * step);
        ticks = new Array(n = Math.ceil(start - stop + 1));
        while (++i < n) ticks[i] = (start - i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function threshold(values, p, valueof) {
      if (valueof == null) valueof = number;
      if (!(n = values.length)) return;
      if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
      if (p >= 1) return +valueof(values[n - 1], n - 1, values);
      var n,
          i = (n - 1) * p,
          i0 = Math.floor(i),
          value0 = +valueof(values[i0], i0, values),
          value1 = +valueof(values[i0 + 1], i0 + 1, values);
      return value0 + (value1 - value0) * (i - i0);
    }

    function merge(arrays) {
      var n = arrays.length,
          m,
          i = -1,
          j = 0,
          merged,
          array;

      while (++i < n) j += arrays[i].length;
      merged = new Array(j);

      while (--n >= 0) {
        array = arrays[n];
        m = array.length;
        while (--m >= 0) {
          merged[--j] = array[m];
        }
      }

      return merged;
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi, -halfPi]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi : -pi,
              delta = abs(lambda1 - lambda0);
          if (abs(delta - pi) < epsilon) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
            if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
            if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin(lambda0 - lambda1);
      return abs(sinLambda0Lambda1) > epsilon
          ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
              - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi, phi);
        stream.point(0, phi);
        stream.point(pi, phi);
        stream.point(pi, 0);
        stream.point(pi, -phi);
        stream.point(0, -phi);
        stream.point(-pi, -phi);
        stream.point(-pi, 0);
        stream.point(-pi, phi);
      } else if (abs(from[0] - to[0]) > epsilon) {
        var lambda = from[0] < to[0] ? pi : -pi;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos(radius),
          delta = 6 * radians,
          smallRadius = cr > 0,
          notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos(lambda) * cos(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
                point1[2] = 1;
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1], 2);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1], 3);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs(delta - pi) < epsilon,
            meridian = polar || delta < epsilon;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
            : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
            : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    function identity$1(x) {
      return x;
    }

    var areaSum = adder(),
        areaRingSum = adder(),
        x00,
        y00,
        x0,
        y0;

    var areaStream = {
      point: noop$1,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$1;
        areaSum.add(abs(areaRingSum));
        areaRingSum.reset();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum.reset();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0 * x - x0 * y);
      x0 = x, y0 = y;
    }

    function areaRingEnd() {
      areaPoint(x00, y00);
    }

    var x0$1 = Infinity,
        y0$1 = x0$1,
        x1 = -x0$1,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$1,
      lineEnd: noop$1,
      polygonStart: noop$1,
      polygonEnd: noop$1,
      result: function() {
        var bounds = [[x0$1, y0$1], [x1, y1]];
        x1 = y1 = -(y0$1 = x0$1 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$1) x0$1 = x;
      if (x > x1) x1 = x;
      if (y < y0$1) y0$1 = y;
      if (y > y1) y1 = y;
    }

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$2,
        y0$2;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$2, dy = y - y0$2, z = sqrt(dx * dx + dy * dy);
      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$2,
          dy = y - y0$2,
          z = sqrt(dx * dx + dy * dy);

      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;

      z = y0$2 * x - x0$2 * y;
      X2 += z * (x0$2 + x);
      Y2 += z * (y0$2 + y);
      Z2 += z * 3;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau);
            break;
          }
        }
      },
      result: noop$1
    };

    var lengthSum = adder(),
        lengthRing,
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var lengthStream = {
      point: noop$1,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00$2, y00$2);
        lengthStream.point = noop$1;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum.reset();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function lengthPoint(x, y) {
      x0$3 -= x, y0$3 -= y;
      lengthSum.add(sqrt(x0$3 * x0$3 + y0$3 * y0$3));
      x0$3 = x, y0$3 = y;
    }

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function geoPath(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(areaStream));
        return areaStream.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(lengthStream));
        return lengthStream.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream));
        return boundsStream.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream));
        return centroidStream.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$1) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transformer(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream));
      fitBounds(boundsStream.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer({
      point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }
    });

    function transformRotate(rotate) {
      return transformer({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy, sx, sy) {
      function transform(x, y) {
        x *= sx; y *= sy;
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k * sx, (dy - y) / k * sy];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, sx, sy, alpha) {
      var cosAlpha = cos(alpha),
          sinAlpha = sin(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        x *= sx; y *= sy;
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
      };
      return transform;
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate angle
          sx = 1, // reflectX
          sy = 1, // reflectX
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity$1, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians, point[1] * radians);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees, point[1] * degrees];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$1) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
      };

      projection.reflectX = function(_) {
        return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
      };

      projection.reflectY = function(_) {
        return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)),
            transform = (alpha ? scaleTranslateRotate : scaleTranslate)(k, x - center[0], y - center[1], sx, sy, alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    function conicProjection(projectAt) {
      var phi0 = 0,
          phi1 = pi / 3,
          m = projectionMutator(projectAt),
          p = m(phi0, phi1);

      p.parallels = function(_) {
        return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
      };

      return p;
    }

    function mercatorRaw(lambda, phi) {
      return [lambda, log(tan((halfPi + phi) / 2))];
    }

    mercatorRaw.invert = function(x, y) {
      return [x, 2 * atan(exp(y)) - halfPi];
    };

    function tany(y) {
      return tan((halfPi + y) / 2);
    }

    function conicConformalRaw(y0, y1) {
      var cy0 = cos(y0),
          n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
          f = cy0 * pow(tany(y0), n) / n;

      if (!n) return mercatorRaw;

      function project(x, y) {
        if (f > 0) { if (y < -halfPi + epsilon) y = -halfPi + epsilon; }
        else { if (y > halfPi - epsilon) y = halfPi - epsilon; }
        var r = f / pow(tany(y), n);
        return [r * sin(n * x), f - r * cos(n * x)];
      }

      project.invert = function(x, y) {
        var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy),
          l = atan2(x, abs(fy)) * sign(fy);
        if (fy * n < 0)
          l -= pi * sign(x) * sign(fy);
        return [l / n, 2 * atan(pow(f / r, 1 / n)) - halfPi];
      };

      return project;
    }

    function geoConicConformal() {
      return conicProjection(conicConformalRaw)
          .scale(109.5)
          .parallels([30, 30]);
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    var prefix = "$";

    function Map$1() {}

    Map$1.prototype = map.prototype = {
      constructor: Map$1,
      has: function(key) {
        return (prefix + key) in this;
      },
      get: function(key) {
        return this[prefix + key];
      },
      set: function(key, value) {
        this[prefix + key] = value;
        return this;
      },
      remove: function(key) {
        var property = prefix + key;
        return property in this && delete this[property];
      },
      clear: function() {
        for (var property in this) if (property[0] === prefix) delete this[property];
      },
      keys: function() {
        var keys = [];
        for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
        return keys;
      },
      values: function() {
        var values = [];
        for (var property in this) if (property[0] === prefix) values.push(this[property]);
        return values;
      },
      entries: function() {
        var entries = [];
        for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
        return entries;
      },
      size: function() {
        var size = 0;
        for (var property in this) if (property[0] === prefix) ++size;
        return size;
      },
      empty: function() {
        for (var property in this) if (property[0] === prefix) return false;
        return true;
      },
      each: function(f) {
        for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
      }
    };

    function map(object, f) {
      var map = new Map$1;

      // Copy constructor.
      if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

      // Index array by numeric index or specified key function.
      else if (Array.isArray(object)) {
        var i = -1,
            n = object.length,
            o;

        if (f == null) while (++i < n) map.set(i, object[i]);
        else while (++i < n) map.set(f(o = object[i], i, object), o);
      }

      // Convert object to map.
      else if (object) for (var key in object) map.set(key, object[key]);

      return map;
    }

    function Set$1() {}

    var proto = map.prototype;

    Set$1.prototype = set.prototype = {
      constructor: Set$1,
      has: proto.has,
      add: function(value) {
        value += "";
        this[prefix + value] = value;
        return this;
      },
      remove: proto.remove,
      clear: proto.clear,
      values: proto.keys,
      size: proto.size,
      empty: proto.empty,
      each: proto.each
    };

    function set(object, f) {
      var set = new Set$1;

      // Copy constructor.
      if (object instanceof Set$1) object.each(function(value) { set.add(value); });

      // Otherwise, assume it’s an array.
      else if (object) {
        var i = -1, n = object.length;
        if (f == null) while (++i < n) set.add(object[i]);
        else while (++i < n) set.add(f(object[i], i, object));
      }

      return set;
    }

    var array = Array.prototype;

    var map$1 = array.map;
    var slice = array.slice;

    var implicit = {name: "implicit"};

    function ordinal() {
      var index = map(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        var key = d + "", i = index.get(key);
        if (!i) {
          if (unknown !== implicit) return unknown;
          index.set(key, i = domain.push(d));
        }
        return range[(i - 1) % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = map();
        var i = -1, n = _.length, d, key;
        while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = slice.call(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    function basis(t1, v0, v1, v2, v3) {
      var t2 = t1 * t1, t3 = t2 * t1;
      return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
    }

    function basis$1(values) {
      var n = values.length - 1;
      return function(t) {
        var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
            v1 = values[i],
            v2 = values[i + 1],
            v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
            v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
        return basis((t - i / n) * n, v0, v1, v2, v3);
      };
    }

    function constant(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function rgbSpline(spline) {
      return function(colors) {
        var n = colors.length,
            r = new Array(n),
            g = new Array(n),
            b = new Array(n),
            i, color;
        for (i = 0; i < n; ++i) {
          color = rgb(colors[i]);
          r[i] = color.r || 0;
          g[i] = color.g || 0;
          b[i] = color.b || 0;
        }
        r = spline(r);
        g = spline(g);
        b = spline(b);
        color.opacity = 1;
        return function(t) {
          color.r = r(t);
          color.g = g(t);
          color.b = b(t);
          return color + "";
        };
      };
    }

    var rgbBasis = rgbSpline(basis$1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object$1(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolateValue(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolateValue(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object$1
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$2(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constant$1(isNaN(b) ? NaN : 0.5);
    }

    function clamper(domain) {
      var a = domain[0], b = domain[domain.length - 1], t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer$1() {
      var domain = unit,
          range = unit,
          interpolate = interpolateValue,
          transform,
          untransform,
          unknown,
          clamp = identity$2,
          piecewise,
          output,
          input;

      function rescale() {
        piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = map$1.call(_, number$1), clamp === identity$2 || (clamp = clamper(domain)), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = slice.call(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? clamper(domain) : identity$2, scale) : clamp !== identity$2;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous(transform, untransform) {
      return transformer$1()(transform, untransform);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimal(1.23) returns ["123", 0].
    function formatDecimal(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": function(x, p) { return (x * 100).toFixed(p); },
      "b": function(x) { return Math.round(x).toString(2); },
      "c": function(x) { return x + ""; },
      "d": function(x) { return Math.round(x).toString(10); },
      "e": function(x, p) { return x.toExponential(p); },
      "f": function(x, p) { return x.toFixed(p); },
      "g": function(x, p) { return x.toPrecision(p); },
      "o": function(x) { return Math.round(x).toString(8); },
      "p": function(x, p) { return formatRounded(x * 100, p); },
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
      "x": function(x) { return Math.round(x).toString(16); }
    };

    function identity$3(x) {
      return x;
    }

    var map$2 = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$3 : formatGroup(map$2.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$3 : formatNumerals(map$2.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "-" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""],
      minus: "-"
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain(),
            i0 = 0,
            i1 = d.length - 1,
            start = d[i0],
            stop = d[i1],
            step;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }

        step = tickIncrement(start, stop, count);

        if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
          step = tickIncrement(start, stop, count);
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
          step = tickIncrement(start, stop, count);
        }

        if (step > 0) {
          d[i0] = Math.floor(start / step) * step;
          d[i1] = Math.ceil(stop / step) * step;
          domain(d);
        } else if (step < 0) {
          d[i0] = Math.ceil(start * step) / step;
          d[i1] = Math.floor(stop * step) / step;
          domain(d);
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous(identity$2, identity$2);

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function quantile() {
      var domain = [],
          range = [],
          thresholds = [],
          unknown;

      function rescale() {
        var i = 0, n = Math.max(1, range.length);
        thresholds = new Array(n - 1);
        while (++i < n) thresholds[i - 1] = threshold(domain, i / n);
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : range[bisectRight(thresholds, x)];
      }

      scale.invertExtent = function(y) {
        var i = range.indexOf(y);
        return i < 0 ? [NaN, NaN] : [
          i > 0 ? thresholds[i - 1] : domain[0],
          i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
        ];
      };

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [];
        for (var i = 0, n = _.length, d; i < n; ++i) if (d = _[i], d != null && !isNaN(d = +d)) domain.push(d);
        domain.sort(ascending);
        return rescale();
      };

      scale.range = function(_) {
        return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.quantiles = function() {
        return thresholds.slice();
      };

      scale.copy = function() {
        return quantile()
            .domain(domain)
            .range(range)
            .unknown(unknown);
      };

      return initRange.apply(scale, arguments);
    }

    function colors(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    }

    function ramp(scheme) {
      return rgbBasis(scheme[scheme.length - 1]);
    }

    var scheme = new Array(3).concat(
      "d8b365f5f5f55ab4ac",
      "a6611adfc27d80cdc1018571",
      "a6611adfc27df5f5f580cdc1018571",
      "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
      "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
      "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
      "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
      "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
      "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
    ).map(colors);

    ramp(scheme);

    /* src/Map.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1$1, console: console_1 } = globals;
    const file$7 = "src/Map.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (63:6) {#each features.features as d}
    function create_each_block$3(ctx) {
    	let path;
    	let path_d_value;
    	let path_fill_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[11](/*d*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "tract svelte-2x7l29");
    			attr_dev(path, "d", path_d_value = /*svgPath*/ ctx[3](/*d*/ ctx[9]));
    			attr_dev(path, "stroke", "#e0e0e0");
    			attr_dev(path, "fill", path_fill_value = /*colorScale*/ ctx[7](/*census*/ ctx[2][`${/*d*/ ctx[9].properties.STATEFP}${/*d*/ ctx[9].properties.COUNTYFP}${/*d*/ ctx[9].properties.TRACTCE}`]));
    			toggle_class(path, "active", /*selectedTract*/ ctx[5] && /*selectedTract*/ ctx[5].properties.name === /*d*/ ctx[9].properties.name);
    			add_location(path, file$7, 63, 8, 1600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = listen_dev(path, "mouseover", mouseover_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*svgPath*/ 8 && path_d_value !== (path_d_value = /*svgPath*/ ctx[3](/*d*/ ctx[9]))) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*census*/ 4 && path_fill_value !== (path_fill_value = /*colorScale*/ ctx[7](/*census*/ ctx[2][`${/*d*/ ctx[9].properties.STATEFP}${/*d*/ ctx[9].properties.COUNTYFP}${/*d*/ ctx[9].properties.TRACTCE}`]))) {
    				attr_dev(path, "fill", path_fill_value);
    			}

    			if (dirty & /*selectedTract, features*/ 96) {
    				toggle_class(path, "active", /*selectedTract*/ ctx[5] && /*selectedTract*/ ctx[5].properties.name === /*d*/ ctx[9].properties.name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(63:6) {#each features.features as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let g1_transform_value;
    	let each_value = /*features*/ ctx[6].features;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g0, "class", "g-tracts");
    			add_location(g0, file$7, 61, 4, 1534);
    			attr_dev(g1, "transform", g1_transform_value = `translate(${/*margin*/ ctx[4].left}, ${/*margin*/ ctx[4].top})`);
    			add_location(g1, file$7, 60, 2, 1471);
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			add_location(svg, file$7, 59, 0, 1446);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*svgPath, features, colorScale, census, selectedTract, handleMouseOver*/ 492) {
    				each_value = /*features*/ ctx[6].features;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { width = 200 } = $$props;
    	let { height = 200 } = $$props;
    	let { tracts } = $$props;
    	let { census } = $$props;

    	// export let projection;
    	const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    	let selectedTract = null;
    	const features = feature(tracts, tracts.objects["tl_2019_06_tract"]);
    	const colorScale = quantile().domain(Object.values(census)).range(scheme[6]);

    	function handleMouseOver(d) {
    		console.log(d);
    		console.log(census[`${d.properties.STATEFP}${d.properties.COUNTYFP}${d.properties.TRACTCE}`]);
    	} // selectedNabe = d;

    	const d = features.features[0];
    	const writable_props = ["width", "height", "tracts", "census"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Map", $$slots, []);
    	const mouseover_handler = d => handleMouseOver(d);

    	$$self.$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tracts" in $$props) $$invalidate(10, tracts = $$props.tracts);
    		if ("census" in $$props) $$invalidate(2, census = $$props.census);
    	};

    	$$self.$capture_state = () => ({
    		feature,
    		mesh,
    		geoPath,
    		geoConicConformal,
    		scaleQuantile: quantile,
    		schemeBrBG: scheme,
    		width,
    		height,
    		tracts,
    		census,
    		margin,
    		selectedTract,
    		features,
    		colorScale,
    		handleMouseOver,
    		d,
    		chartWidth,
    		chartHeight,
    		projection,
    		svgPath
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tracts" in $$props) $$invalidate(10, tracts = $$props.tracts);
    		if ("census" in $$props) $$invalidate(2, census = $$props.census);
    		if ("selectedTract" in $$props) $$invalidate(5, selectedTract = $$props.selectedTract);
    		if ("chartWidth" in $$props) $$invalidate(12, chartWidth = $$props.chartWidth);
    		if ("chartHeight" in $$props) chartHeight = $$props.chartHeight;
    		if ("projection" in $$props) $$invalidate(14, projection = $$props.projection);
    		if ("svgPath" in $$props) $$invalidate(3, svgPath = $$props.svgPath);
    	};

    	let chartWidth;
    	let chartHeight;
    	let projection;
    	let svgPath;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 1) {
    			 $$invalidate(12, chartWidth = width - margin.left - margin.right);
    		}

    		if ($$self.$$.dirty & /*height*/ 2) {
    			 chartHeight = height - margin.top - margin.bottom;
    		}

    		if ($$self.$$.dirty & /*chartWidth, height*/ 4098) {
    			 $$invalidate(14, projection = geoConicConformal().parallels([37 + 4 / 60, 38 + 26 / 60]).rotate([120 + 30 / 60], 0).fitExtent(
    				[
    					[margin.left, margin.top],
    					[chartWidth + margin.right, height + margin.bottom]
    				],
    				features
    			));
    		}

    		if ($$self.$$.dirty & /*projection*/ 16384) {
    			 $$invalidate(3, svgPath = geoPath().projection(projection));
    		}
    	};

    	return [
    		width,
    		height,
    		census,
    		svgPath,
    		margin,
    		selectedTract,
    		features,
    		colorScale,
    		handleMouseOver,
    		d,
    		tracts,
    		mouseover_handler
    	];
    }

    class Map$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			width: 0,
    			height: 1,
    			tracts: 10,
    			census: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tracts*/ ctx[10] === undefined && !("tracts" in props)) {
    			console_1.warn("<Map> was created without expected prop 'tracts'");
    		}

    		if (/*census*/ ctx[2] === undefined && !("census" in props)) {
    			console_1.warn("<Map> was created without expected prop 'census'");
    		}
    	}

    	get width() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tracts() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tracts(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get census() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set census(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var census = {
    	"06075010100": 81509,
    	"06075010200": 125238,
    	"06075010300": 118210,
    	"06075010400": 106979,
    	"06075010500": 108063,
    	"06075010600": 37000,
    	"06075010700": 27786,
    	"06075010800": 100226,
    	"06075010900": 122206,
    	"06075011000": 134948,
    	"06075011100": 100500,
    	"06075011200": 103750,
    	"06075011300": 37159,
    	"06075011700": 52371,
    	"06075011800": 23512,
    	"06075011901": 72038,
    	"06075011902": 84735,
    	"06075012000": 39957,
    	"06075012100": 73521,
    	"06075012201": 56298,
    	"06075012202": 36719,
    	"06075012301": 17342,
    	"06075012302": 40976,
    	"06075012401": 23467,
    	"06075012402": 46422,
    	"06075012501": 21412,
    	"06075012502": 12479,
    	"06075012601": 129139,
    	"06075012602": 129196,
    	"06075012700": 129300,
    	"06075012800": 151830,
    	"06075012901": 143403,
    	"06075012902": 120190,
    	"06075013000": 156117,
    	"06075013101": 130927,
    	"06075013102": 150643,
    	"06075013200": 142650,
    	"06075013300": 144875,
    	"06075013400": 152417,
    	"06075013500": 125804,
    	"06075015100": 97059,
    	"06075015200": 87969,
    	"06075015300": 120833,
    	"06075015400": 121116,
    	"06075015500": 65536,
    	"06075015600": 88083,
    	"06075015700": 111181,
    	"06075015801": 66603,
    	"06075015802": 100509,
    	"06075015900": 62731,
    	"06075016000": 63808,
    	"06075016100": 24041,
    	"06075016200": 88611,
    	"06075016300": 132742,
    	"06075016400": 119321,
    	"06075016500": 117156,
    	"06075016600": 134395,
    	"06075016700": 159634,
    	"06075016801": 103730,
    	"06075016802": 83672,
    	"06075016900": 104570,
    	"06075017000": 161563,
    	"06075017101": 155278,
    	"06075017102": 129792,
    	"06075017601": 40878,
    	"06075017700": 104375,
    	"06075017801": 18930,
    	"06075017802": 73966,
    	"06075017902": 52143,
    	"06075018000": 156932,
    	"06075020100": 46604,
    	"06075020200": 77368,
    	"06075020300": 123099,
    	"06075020401": 156161,
    	"06075020402": 105161,
    	"06075020500": 130000,
    	"06075020600": 141875,
    	"06075020700": 153912,
    	"06075020800": 84833,
    	"06075020900": 83523,
    	"06075021000": 113250,
    	"06075021100": 153750,
    	"06075021200": 154632,
    	"06075021300": 156912,
    	"06075021400": 148594,
    	"06075021500": 122857,
    	"06075021600": 138117,
    	"06075021700": 122875,
    	"06075021800": 137969,
    	"06075022600": 195000,
    	"06075022702": 176944,
    	"06075022704": 176667,
    	"06075022801": 127143,
    	"06075022802": 80385,
    	"06075022803": 114583,
    	"06075022901": 72045,
    	"06075022902": 131571,
    	"06075022903": 113250,
    	"06075023001": 64527,
    	"06075023003": 74113,
    	"06075023102": 28618,
    	"06075023103": 21415,
    	"06075023200": 54375,
    	"06075023300": 55600,
    	"06075023400": 40648,
    	"06075025100": 148500,
    	"06075025200": 133310,
    	"06075025300": 126563,
    	"06075025401": 114211,
    	"06075025402": 128750,
    	"06075025403": 94135,
    	"06075025500": 106000,
    	"06075025600": 74688,
    	"06075025701": 95669,
    	"06075025702": 63311,
    	"06075025800": 72411,
    	"06075025900": 101935,
    	"06075026001": 62656,
    	"06075026002": 94200,
    	"06075026003": 62563,
    	"06075026004": 86192,
    	"06075026100": 78640,
    	"06075026200": 79861,
    	"06075026301": 65893,
    	"06075026302": 79375,
    	"06075026303": 80690,
    	"06075026401": 59453,
    	"06075026402": 87404,
    	"06075026403": 61131,
    	"06075026404": 54958,
    	"06075030101": 117668,
    	"06075030102": 123333,
    	"06075030201": 97039,
    	"06075030202": 114535,
    	"06075030301": 140179,
    	"06075030302": 135143,
    	"06075030400": 156786,
    	"06075030500": 122813,
    	"06075030600": 155000,
    	"06075030700": 139531,
    	"06075030800": 151250,
    	"06075030900": 174946,
    	"06075031000": 131544,
    	"06075031100": 112750,
    	"06075031201": 81443,
    	"06075031202": 77267,
    	"06075031301": 97866,
    	"06075031302": 78548,
    	"06075031400": 64282,
    	"06075032601": 100240,
    	"06075032602": 91433,
    	"06075032700": 111114,
    	"06075032801": 110255,
    	"06075032802": 90700,
    	"06075032901": 98023,
    	"06075032902": 93613,
    	"06075033000": 96818,
    	"06075033100": 111333,
    	"06075033201": 28750,
    	"06075033203": 50360,
    	"06075033204": 59125,
    	"06075035100": 125408,
    	"06075035201": 92719,
    	"06075035202": 83977,
    	"06075035300": 81748,
    	"06075035400": 97689,
    	"06075040100": 96875,
    	"06075040200": 98531,
    	"06075042601": 81815,
    	"06075042602": 113258,
    	"06075042700": 66595,
    	"06075042800": 161523,
    	"06075045100": 101480,
    	"06075045200": 92193,
    	"06075047600": 89031,
    	"06075047701": 82734,
    	"06075047702": 96823,
    	"06075047801": 102083,
    	"06075047802": 80801,
    	"06075047901": 82241,
    	"06075047902": 83984,
    	"06075060100": 195375,
    	"06075060400": 47308,
    	"06075060502": 27989,
    	"06075060700": 141588,
    	"06075061000": 101977,
    	"06075061100": 16560,
    	"06075061200": 60903,
    	"06075061400": 125234,
    	"06075061500": 173449,
    	"06075980200": 149250,
    	"06075980300": 131333,
    	"06075980401": "",
    	"06075980501": 16016,
    	"06075980600": 68958,
    	"06075980900": 103750,
    	"06075990100": ""
    };
    var metros = [
    	{
    		label: "Atlanta",
    		value: "atl"
    	},
    	{
    		label: "Boston",
    		value: "bos"
    	},
    	{
    		label: "Chicago",
    		value: "chi"
    	},
    	{
    		label: "Dallas",
    		value: "dfw"
    	},
    	{
    		label: "Washington D.C.",
    		value: "dc"
    	},
    	{
    		label: "Denver",
    		value: "den"
    	},
    	{
    		label: "Houston",
    		value: "hou"
    	},
    	{
    		label: "Minneapolis",
    		value: "min"
    	},
    	{
    		label: "New York City",
    		value: "nyc"
    	},
    	{
    		label: "Philadelphia",
    		value: "phi"
    	},
    	{
    		label: "Seattle",
    		value: "sea"
    	},
    	{
    		label: "San Francisco",
    		value: "sf"
    	}
    ];
    var rounds = [
    	{
    		label: "first",
    		value: "c0c1"
    	},
    	{
    		label: "second",
    		value: "c1c2"
    	},
    	{
    		label: "third",
    		value: "c2c3"
    	},
    	{
    		label: "fourth",
    		value: "c3c4"
    	},
    	{
    		label: "fifth",
    		value: "c4c5"
    	},
    	{
    		label: "sixth",
    		value: "c5c6"
    	},
    	{
    		label: "seventh",
    		value: "c6c7"
    	}
    ];

    var type = "Topology";
    var arcs = [
    	[
    		[
    			5648,
    			3382
    		],
    		[
    			136,
    			6
    		]
    	],
    	[
    		[
    			5784,
    			3388
    		],
    		[
    			61,
    			0
    		],
    		[
    			195,
    			6
    		]
    	],
    	[
    		[
    			6040,
    			3394
    		],
    		[
    			55,
    			2
    		]
    	],
    	[
    		[
    			6095,
    			3396
    		],
    		[
    			5,
    			-79
    		],
    		[
    			-9,
    			-41
    		],
    		[
    			16,
    			-270
    		],
    		[
    			42,
    			-57
    		],
    		[
    			-20,
    			-2
    		],
    		[
    			-1,
    			-23
    		],
    		[
    			-14,
    			-19
    		],
    		[
    			-25,
    			-11
    		],
    		[
    			-5,
    			-88
    		],
    		[
    			22,
    			-1
    		],
    		[
    			-8,
    			-134
    		]
    	],
    	[
    		[
    			6098,
    			2671
    		],
    		[
    			-73,
    			7
    		],
    		[
    			-84,
    			-73
    		],
    		[
    			-80,
    			-10
    		],
    		[
    			-78,
    			11
    		]
    	],
    	[
    		[
    			5783,
    			2606
    		],
    		[
    			-150,
    			20
    		],
    		[
    			-7,
    			5
    		]
    	],
    	[
    		[
    			5626,
    			2631
    		],
    		[
    			47,
    			106
    		],
    		[
    			-62,
    			36
    		],
    		[
    			53,
    			127
    		],
    		[
    			30,
    			62
    		],
    		[
    			77,
    			171
    		],
    		[
    			-100,
    			60
    		],
    		[
    			-28,
    			62
    		],
    		[
    			-49,
    			7
    		],
    		[
    			54,
    			120
    		]
    	],
    	[
    		[
    			5347,
    			2883
    		],
    		[
    			38,
    			139
    		],
    		[
    			24,
    			105
    		],
    		[
    			15,
    			18
    		],
    		[
    			42,
    			173
    		],
    		[
    			-4,
    			58
    		]
    	],
    	[
    		[
    			5462,
    			3376
    		],
    		[
    			65,
    			3
    		]
    	],
    	[
    		[
    			5527,
    			3379
    		],
    		[
    			121,
    			3
    		]
    	],
    	[
    		[
    			5626,
    			2631
    		],
    		[
    			-249,
    			146
    		],
    		[
    			-43,
    			-97
    		],
    		[
    			-40,
    			-1
    		]
    	],
    	[
    		[
    			5294,
    			2679
    		],
    		[
    			13,
    			64
    		],
    		[
    			40,
    			140
    		]
    	],
    	[
    		[
    			5732,
    			2319
    		],
    		[
    			9,
    			139
    		],
    		[
    			38,
    			-4
    		],
    		[
    			9,
    			147
    		],
    		[
    			-5,
    			5
    		]
    	],
    	[
    		[
    			6098,
    			2671
    		],
    		[
    			23,
    			-2
    		],
    		[
    			-16,
    			-241
    		],
    		[
    			89,
    			-6
    		],
    		[
    			10,
    			34
    		],
    		[
    			27,
    			32
    		]
    	],
    	[
    		[
    			6231,
    			2488
    		],
    		[
    			-1,
    			-46
    		],
    		[
    			-14,
    			-65
    		],
    		[
    			-39,
    			-77
    		],
    		[
    			-38,
    			-47
    		]
    	],
    	[
    		[
    			6139,
    			2253
    		],
    		[
    			-32,
    			-17
    		],
    		[
    			-28,
    			9
    		],
    		[
    			-20,
    			29
    		],
    		[
    			-38,
    			-37
    		],
    		[
    			-292,
    			21
    		],
    		[
    			3,
    			61
    		]
    	],
    	[
    		[
    			3915,
    			1255
    		],
    		[
    			17,
    			74
    		],
    		[
    			42,
    			113
    		],
    		[
    			32,
    			64
    		],
    		[
    			74,
    			111
    		],
    		[
    			37,
    			43
    		],
    		[
    			36,
    			37
    		],
    		[
    			42,
    			34
    		],
    		[
    			65,
    			42
    		],
    		[
    			145,
    			82
    		],
    		[
    			-4,
    			7
    		],
    		[
    			181,
    			96
    		],
    		[
    			60,
    			39
    		],
    		[
    			176,
    			117
    		]
    	],
    	[
    		[
    			4818,
    			2114
    		],
    		[
    			153,
    			104
    		],
    		[
    			71,
    			57
    		]
    	],
    	[
    		[
    			5042,
    			2275
    		],
    		[
    			8,
    			-11
    		],
    		[
    			133,
    			-83
    		],
    		[
    			-13,
    			-25
    		],
    		[
    			-96,
    			-140
    		]
    	],
    	[
    		[
    			5074,
    			2016
    		],
    		[
    			-74,
    			-108
    		],
    		[
    			-5,
    			-1
    		],
    		[
    			-109,
    			-161
    		],
    		[
    			-3,
    			-7
    		]
    	],
    	[
    		[
    			4883,
    			1739
    		],
    		[
    			-67,
    			-93
    		]
    	],
    	[
    		[
    			4816,
    			1646
    		],
    		[
    			-21,
    			-27
    		],
    		[
    			-151,
    			-287
    		]
    	],
    	[
    		[
    			4644,
    			1332
    		],
    		[
    			-95,
    			-16
    		],
    		[
    			-34,
    			1
    		],
    		[
    			-69,
    			-8
    		],
    		[
    			-314,
    			-54
    		],
    		[
    			-33,
    			-1
    		],
    		[
    			-143,
    			2
    		],
    		[
    			-41,
    			-1
    		]
    	],
    	[
    		[
    			5074,
    			2016
    		],
    		[
    			96,
    			-28
    		],
    		[
    			48,
    			-9
    		],
    		[
    			96,
    			-2
    		],
    		[
    			64,
    			7
    		],
    		[
    			66,
    			14
    		]
    	],
    	[
    		[
    			5444,
    			1998
    		],
    		[
    			-3,
    			-61
    		],
    		[
    			91,
    			32
    		],
    		[
    			40,
    			3
    		],
    		[
    			14,
    			-14
    		],
    		[
    			-16,
    			-186
    		],
    		[
    			3,
    			-7
    		],
    		[
    			43,
    			4
    		],
    		[
    			90,
    			-21
    		],
    		[
    			34,
    			-3
    		],
    		[
    			84,
    			35
    		],
    		[
    			43,
    			-149
    		]
    	],
    	[
    		[
    			5867,
    			1631
    		],
    		[
    			-231,
    			-87
    		],
    		[
    			29,
    			-102
    		],
    		[
    			-115,
    			-43
    		]
    	],
    	[
    		[
    			5550,
    			1399
    		],
    		[
    			-115,
    			-43
    		]
    	],
    	[
    		[
    			5435,
    			1356
    		],
    		[
    			-110,
    			385
    		],
    		[
    			-157,
    			-12
    		],
    		[
    			-131,
    			-7
    		],
    		[
    			-101,
    			1
    		],
    		[
    			-53,
    			16
    		]
    	],
    	[
    		[
    			6386,
    			1378
    		],
    		[
    			173,
    			66
    		],
    		[
    			32,
    			-111
    		],
    		[
    			75,
    			-26
    		]
    	],
    	[
    		[
    			6666,
    			1307
    		],
    		[
    			50,
    			-177
    		],
    		[
    			27,
    			-100
    		],
    		[
    			4,
    			-38
    		],
    		[
    			15,
    			-13
    		],
    		[
    			16,
    			-88
    		]
    	],
    	[
    		[
    			6778,
    			891
    		],
    		[
    			-19,
    			-51
    		],
    		[
    			-6,
    			-47
    		],
    		[
    			-19,
    			-105
    		],
    		[
    			-13,
    			31
    		],
    		[
    			-35,
    			212
    		],
    		[
    			-97,
    			-37
    		]
    	],
    	[
    		[
    			6589,
    			894
    		],
    		[
    			-57,
    			203
    		],
    		[
    			-58,
    			-22
    		],
    		[
    			-88,
    			303
    		]
    	],
    	[
    		[
    			5867,
    			1631
    		],
    		[
    			230,
    			87
    		]
    	],
    	[
    		[
    			6097,
    			1718
    		],
    		[
    			116,
    			-405
    		],
    		[
    			173,
    			65
    		]
    	],
    	[
    		[
    			6589,
    			894
    		],
    		[
    			-85,
    			-33
    		],
    		[
    			-18,
    			42
    		],
    		[
    			-85,
    			63
    		],
    		[
    			-46,
    			22
    		],
    		[
    			-19,
    			-7
    		],
    		[
    			-14,
    			-46
    		]
    	],
    	[
    		[
    			6322,
    			935
    		],
    		[
    			-22,
    			74
    		],
    		[
    			-231,
    			-85
    		],
    		[
    			-115,
    			403
    		],
    		[
    			-173,
    			-65
    		],
    		[
    			22,
    			-72
    		],
    		[
    			-63,
    			-6
    		],
    		[
    			-17,
    			56
    		],
    		[
    			-50,
    			-19
    		],
    		[
    			-8,
    			2
    		],
    		[
    			-28,
    			97
    		],
    		[
    			-57,
    			-23
    		],
    		[
    			-30,
    			102
    		]
    	],
    	[
    		[
    			5435,
    			1356
    		],
    		[
    			-114,
    			-43
    		],
    		[
    			-57,
    			-128
    		]
    	],
    	[
    		[
    			5264,
    			1185
    		],
    		[
    			-4,
    			-10
    		],
    		[
    			-188,
    			130
    		]
    	],
    	[
    		[
    			5072,
    			1305
    		],
    		[
    			67,
    			132
    		],
    		[
    			-185,
    			127
    		],
    		[
    			-5,
    			-10
    		],
    		[
    			-133,
    			92
    		]
    	],
    	[
    		[
    			4541,
    			1135
    		],
    		[
    			279,
    			-193
    		]
    	],
    	[
    		[
    			4820,
    			942
    		],
    		[
    			-69,
    			-131
    		],
    		[
    			141,
    			-97
    		]
    	],
    	[
    		[
    			4892,
    			714
    		],
    		[
    			-95,
    			-182
    		]
    	],
    	[
    		[
    			4797,
    			532
    		],
    		[
    			-447,
    			237
    		]
    	],
    	[
    		[
    			4350,
    			769
    		],
    		[
    			1,
    			7
    		],
    		[
    			186,
    			357
    		],
    		[
    			4,
    			2
    		]
    	],
    	[
    		[
    			4405,
    			4566
    		],
    		[
    			178,
    			15
    		],
    		[
    			35,
    			7
    		],
    		[
    			38,
    			20
    		]
    	],
    	[
    		[
    			4656,
    			4608
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			4656,
    			4603
    		],
    		[
    			3,
    			-21
    		],
    		[
    			34,
    			-534
    		]
    	],
    	[
    		[
    			4693,
    			4048
    		],
    		[
    			-7,
    			2
    		],
    		[
    			-183,
    			-19
    		],
    		[
    			2,
    			-29
    		],
    		[
    			-64,
    			-9
    		]
    	],
    	[
    		[
    			4441,
    			3993
    		],
    		[
    			2,
    			7
    		],
    		[
    			-10,
    			132
    		],
    		[
    			-9,
    			164
    		]
    	],
    	[
    		[
    			4424,
    			4296
    		],
    		[
    			-19,
    			270
    		]
    	],
    	[
    		[
    			6393,
    			19
    		],
    		[
    			37,
    			117
    		],
    		[
    			27,
    			59
    		],
    		[
    			73,
    			131
    		],
    		[
    			33,
    			23
    		]
    	],
    	[
    		[
    			6563,
    			349
    		],
    		[
    			54,
    			21
    		],
    		[
    			38,
    			30
    		],
    		[
    			16,
    			23
    		],
    		[
    			14,
    			-2
    		],
    		[
    			41,
    			62
    		],
    		[
    			23,
    			41
    		],
    		[
    			52,
    			135
    		],
    		[
    			8,
    			27
    		],
    		[
    			-11,
    			119
    		]
    	],
    	[
    		[
    			6798,
    			805
    		],
    		[
    			65,
    			95
    		],
    		[
    			-7,
    			5
    		],
    		[
    			29,
    			56
    		],
    		[
    			20,
    			63
    		]
    	],
    	[
    		[
    			6905,
    			1024
    		],
    		[
    			238,
    			-195
    		],
    		[
    			59,
    			-36
    		],
    		[
    			27,
    			43
    		],
    		[
    			176,
    			-147
    		],
    		[
    			12,
    			3
    		],
    		[
    			62,
    			99
    		],
    		[
    			35,
    			-27
    		],
    		[
    			123,
    			197
    		],
    		[
    			78,
    			199
    		]
    	],
    	[
    		[
    			7715,
    			1160
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7715,
    			1159
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			7716,
    			1157
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			7718,
    			1151
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7719,
    			1150
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7720,
    			1147
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7721,
    			1147
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			7721,
    			1144
    		],
    		[
    			-1,
    			-4
    		]
    	],
    	[
    		[
    			7720,
    			1140
    		],
    		[
    			0,
    			-7
    		]
    	],
    	[
    		[
    			7720,
    			1133
    		],
    		[
    			-9,
    			-31
    		]
    	],
    	[
    		[
    			7711,
    			1102
    		],
    		[
    			-1,
    			-3
    		]
    	],
    	[
    		[
    			7710,
    			1099
    		],
    		[
    			-9,
    			-13
    		]
    	],
    	[
    		[
    			7701,
    			1086
    		],
    		[
    			-3,
    			-3
    		]
    	],
    	[
    		[
    			7698,
    			1083
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7697,
    			1083
    		],
    		[
    			-2,
    			-4
    		]
    	],
    	[
    		[
    			7695,
    			1079
    		],
    		[
    			-6,
    			-12
    		]
    	],
    	[
    		[
    			7689,
    			1067
    		],
    		[
    			-6,
    			-13
    		]
    	],
    	[
    		[
    			7683,
    			1054
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7683,
    			1053
    		],
    		[
    			-2,
    			-8
    		]
    	],
    	[
    		[
    			7681,
    			1045
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			7681,
    			1039
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7681,
    			1038
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			7681,
    			1032
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			7683,
    			1030
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			7684,
    			1031
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			7686,
    			1032
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7686,
    			1030
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7686,
    			1028
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7687,
    			1028
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			7690,
    			1026
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			7690,
    			1021
    		],
    		[
    			2,
    			-11
    		]
    	],
    	[
    		[
    			7692,
    			1010
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7693,
    			1009
    		],
    		[
    			20,
    			-13
    		]
    	],
    	[
    		[
    			7713,
    			996
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7713,
    			995
    		],
    		[
    			13,
    			-7
    		]
    	],
    	[
    		[
    			7726,
    			988
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7727,
    			988
    		],
    		[
    			5,
    			-6
    		]
    	],
    	[
    		[
    			7732,
    			982
    		],
    		[
    			19,
    			-16
    		]
    	],
    	[
    		[
    			7751,
    			966
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			7756,
    			963
    		],
    		[
    			6,
    			-4
    		]
    	],
    	[
    		[
    			7762,
    			959
    		],
    		[
    			6,
    			-5
    		]
    	],
    	[
    		[
    			7768,
    			954
    		],
    		[
    			6,
    			-4
    		]
    	],
    	[
    		[
    			7774,
    			950
    		],
    		[
    			7,
    			-10
    		]
    	],
    	[
    		[
    			7781,
    			940
    		],
    		[
    			5,
    			-7
    		]
    	],
    	[
    		[
    			7786,
    			933
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			7788,
    			927
    		],
    		[
    			3,
    			-9
    		]
    	],
    	[
    		[
    			7791,
    			918
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7792,
    			917
    		],
    		[
    			12,
    			-18
    		]
    	],
    	[
    		[
    			7804,
    			899
    		],
    		[
    			10,
    			-2
    		]
    	],
    	[
    		[
    			7814,
    			897
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			7818,
    			897
    		],
    		[
    			5,
    			0
    		]
    	],
    	[
    		[
    			7823,
    			897
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			7824,
    			898
    		],
    		[
    			5,
    			0
    		]
    	],
    	[
    		[
    			7829,
    			898
    		],
    		[
    			9,
    			1
    		]
    	],
    	[
    		[
    			7838,
    			899
    		],
    		[
    			9,
    			-3
    		]
    	],
    	[
    		[
    			7847,
    			896
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7850,
    			895
    		],
    		[
    			11,
    			-7
    		]
    	],
    	[
    		[
    			7861,
    			888
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7862,
    			887
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7864,
    			884
    		],
    		[
    			4,
    			-7
    		]
    	],
    	[
    		[
    			7868,
    			877
    		],
    		[
    			8,
    			-4
    		]
    	],
    	[
    		[
    			7876,
    			873
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			7878,
    			873
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7879,
    			873
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			7883,
    			871
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7883,
    			870
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7884,
    			869
    		],
    		[
    			8,
    			-6
    		]
    	],
    	[
    		[
    			7892,
    			863
    		],
    		[
    			5,
    			0
    		]
    	],
    	[
    		[
    			7897,
    			863
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7898,
    			860
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			7901,
    			857
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7903,
    			854
    		],
    		[
    			7,
    			-8
    		]
    	],
    	[
    		[
    			7910,
    			846
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			7912,
    			842
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7913,
    			842
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7913,
    			840
    		],
    		[
    			3,
    			-6
    		]
    	],
    	[
    		[
    			7916,
    			834
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7917,
    			833
    		],
    		[
    			4,
    			-5
    		]
    	],
    	[
    		[
    			7921,
    			828
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7923,
    			825
    		],
    		[
    			3,
    			-4
    		]
    	],
    	[
    		[
    			7926,
    			821
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7928,
    			820
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			7930,
    			818
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			7933,
    			815
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7934,
    			815
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7934,
    			814
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			7936,
    			814
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7937,
    			811
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7940,
    			810
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7941,
    			809
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7942,
    			809
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			7944,
    			807
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			7949,
    			803
    		],
    		[
    			9,
    			-5
    		]
    	],
    	[
    		[
    			7958,
    			798
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7958,
    			797
    		],
    		[
    			26,
    			-21
    		]
    	],
    	[
    		[
    			7984,
    			776
    		],
    		[
    			19,
    			-12
    		]
    	],
    	[
    		[
    			8003,
    			764
    		],
    		[
    			26,
    			-19
    		]
    	],
    	[
    		[
    			8029,
    			745
    		],
    		[
    			9,
    			-8
    		]
    	],
    	[
    		[
    			8038,
    			737
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			8040,
    			736
    		],
    		[
    			4,
    			-1
    		]
    	],
    	[
    		[
    			8044,
    			735
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			8045,
    			731
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			8050,
    			727
    		],
    		[
    			25,
    			-23
    		]
    	],
    	[
    		[
    			8075,
    			704
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			8076,
    			703
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			8076,
    			702
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			8080,
    			700
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			8082,
    			697
    		],
    		[
    			6,
    			-7
    		]
    	],
    	[
    		[
    			8088,
    			690
    		],
    		[
    			11,
    			-8
    		]
    	],
    	[
    		[
    			8099,
    			682
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			8100,
    			682
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			8103,
    			677
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			8104,
    			677
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			8105,
    			674
    		],
    		[
    			-2,
    			-18
    		],
    		[
    			-55,
    			-98
    		],
    		[
    			-14,
    			-34
    		],
    		[
    			-56,
    			-59
    		],
    		[
    			-34,
    			-46
    		],
    		[
    			-51,
    			-117
    		],
    		[
    			-18,
    			-24
    		],
    		[
    			-2,
    			-45
    		],
    		[
    			4,
    			-23
    		],
    		[
    			39,
    			-27
    		],
    		[
    			23,
    			-26
    		],
    		[
    			17,
    			-42
    		],
    		[
    			14,
    			-18
    		],
    		[
    			11,
    			-44
    		],
    		[
    			29,
    			-15
    		],
    		[
    			38,
    			17
    		],
    		[
    			23,
    			20
    		],
    		[
    			22,
    			54
    		],
    		[
    			44,
    			-6
    		],
    		[
    			10,
    			-12
    		],
    		[
    			43,
    			-30
    		],
    		[
    			14,
    			-16
    		],
    		[
    			1,
    			-22
    		],
    		[
    			-18,
    			-12
    		],
    		[
    			-75,
    			-10
    		],
    		[
    			-72,
    			4
    		],
    		[
    			-126,
    			-1
    		],
    		[
    			-51,
    			28
    		],
    		[
    			-71,
    			12
    		],
    		[
    			-22,
    			0
    		],
    		[
    			-24,
    			15
    		],
    		[
    			-132,
    			20
    		],
    		[
    			-30,
    			16
    		],
    		[
    			-49,
    			41
    		],
    		[
    			-19,
    			0
    		],
    		[
    			-34,
    			-19
    		],
    		[
    			-26,
    			-25
    		],
    		[
    			-46,
    			-65
    		],
    		[
    			-32,
    			14
    		],
    		[
    			-69,
    			65
    		],
    		[
    			-38,
    			-34
    		],
    		[
    			-12,
    			-1
    		],
    		[
    			-49,
    			41
    		],
    		[
    			-15,
    			-7
    		],
    		[
    			-33,
    			-52
    		],
    		[
    			-52,
    			-50
    		],
    		[
    			-24,
    			1
    		],
    		[
    			-673,
    			-5
    		],
    		[
    			-20,
    			0
    		]
    	],
    	[
    		[
    			3874,
    			868
    		],
    		[
    			8,
    			84
    		],
    		[
    			18,
    			218
    		],
    		[
    			15,
    			85
    		]
    	],
    	[
    		[
    			4644,
    			1332
    		],
    		[
    			-103,
    			-197
    		]
    	],
    	[
    		[
    			4350,
    			769
    		],
    		[
    			-86,
    			-163
    		],
    		[
    			-106,
    			-145
    		]
    	],
    	[
    		[
    			4158,
    			461
    		],
    		[
    			-248,
    			288
    		],
    		[
    			-45,
    			38
    		]
    	],
    	[
    		[
    			3865,
    			787
    		],
    		[
    			9,
    			81
    		]
    	],
    	[
    		[
    			2685,
    			8
    		],
    		[
    			27,
    			39
    		],
    		[
    			44,
    			50
    		],
    		[
    			54,
    			46
    		],
    		[
    			47,
    			28
    		],
    		[
    			71,
    			27
    		],
    		[
    			35,
    			6
    		],
    		[
    			194,
    			3
    		]
    	],
    	[
    		[
    			3157,
    			207
    		],
    		[
    			149,
    			1
    		],
    		[
    			58,
    			4
    		],
    		[
    			56,
    			16
    		],
    		[
    			77,
    			41
    		],
    		[
    			68,
    			61
    		],
    		[
    			53,
    			62
    		],
    		[
    			77,
    			98
    		],
    		[
    			82,
    			101
    		],
    		[
    			36,
    			51
    		],
    		[
    			24,
    			48
    		],
    		[
    			22,
    			63
    		],
    		[
    			6,
    			34
    		]
    	],
    	[
    		[
    			4158,
    			461
    		],
    		[
    			-50,
    			-68
    		]
    	],
    	[
    		[
    			4108,
    			393
    		],
    		[
    			-56,
    			-76
    		],
    		[
    			-199,
    			-153
    		],
    		[
    			-312,
    			-154
    		],
    		[
    			17,
    			-2
    		]
    	],
    	[
    		[
    			3558,
    			8
    		],
    		[
    			-514,
    			0
    		],
    		[
    			-47,
    			9
    		],
    		[
    			-29,
    			-9
    		],
    		[
    			-168,
    			-2
    		],
    		[
    			-115,
    			2
    		]
    	],
    	[
    		[
    			371,
    			2302
    		],
    		[
    			102,
    			13
    		],
    		[
    			0,
    			-15
    		],
    		[
    			90,
    			0
    		],
    		[
    			0,
    			16
    		],
    		[
    			158,
    			-1
    		],
    		[
    			31,
    			-4
    		],
    		[
    			57,
    			-18
    		]
    	],
    	[
    		[
    			809,
    			2293
    		],
    		[
    			57,
    			-33
    		],
    		[
    			49,
    			-38
    		],
    		[
    			37,
    			-23
    		],
    		[
    			65,
    			-22
    		],
    		[
    			54,
    			-6
    		]
    	],
    	[
    		[
    			1071,
    			2171
    		],
    		[
    			-12,
    			-22
    		],
    		[
    			-40,
    			-49
    		],
    		[
    			-38,
    			-63
    		],
    		[
    			-56,
    			-58
    		],
    		[
    			55,
    			-21
    		],
    		[
    			45,
    			-140
    		],
    		[
    			19,
    			-31
    		],
    		[
    			19,
    			-15
    		],
    		[
    			39,
    			-10
    		],
    		[
    			20,
    			4
    		],
    		[
    			126,
    			46
    		],
    		[
    			22,
    			-27
    		],
    		[
    			44,
    			-32
    		],
    		[
    			22,
    			-7
    		],
    		[
    			35,
    			6
    		],
    		[
    			26,
    			19
    		],
    		[
    			49,
    			75
    		],
    		[
    			33,
    			24
    		],
    		[
    			40,
    			-2
    		],
    		[
    			134,
    			-60
    		]
    	],
    	[
    		[
    			1653,
    			1808
    		],
    		[
    			51,
    			-22
    		],
    		[
    			19,
    			-23
    		],
    		[
    			79,
    			-136
    		],
    		[
    			10,
    			-62
    		],
    		[
    			-56,
    			-194
    		],
    		[
    			-4,
    			-29
    		]
    	],
    	[
    		[
    			1752,
    			1342
    		],
    		[
    			-13,
    			-7
    		],
    		[
    			-1,
    			-88
    		],
    		[
    			1,
    			-366
    		]
    	],
    	[
    		[
    			1739,
    			881
    		],
    		[
    			0,
    			-43
    		],
    		[
    			-9,
    			-273
    		],
    		[
    			14,
    			-6
    		],
    		[
    			188,
    			-8
    		],
    		[
    			94,
    			-6
    		],
    		[
    			77,
    			-2
    		],
    		[
    			110,
    			2
    		],
    		[
    			23,
    			-2
    		],
    		[
    			41,
    			-14
    		],
    		[
    			33,
    			-20
    		],
    		[
    			81,
    			-60
    		],
    		[
    			99,
    			-52
    		],
    		[
    			53,
    			-3
    		]
    	],
    	[
    		[
    			2543,
    			394
    		],
    		[
    			6,
    			-82
    		],
    		[
    			3,
    			-244
    		],
    		[
    			-7,
    			-53
    		]
    	],
    	[
    		[
    			2545,
    			15
    		],
    		[
    			-30,
    			2
    		],
    		[
    			-540,
    			-9
    		],
    		[
    			-158,
    			9
    		],
    		[
    			-64,
    			0
    		],
    		[
    			-29,
    			-9
    		],
    		[
    			-479,
    			0
    		],
    		[
    			-245,
    			-8
    		],
    		[
    			-292,
    			0
    		],
    		[
    			-11,
    			83
    		],
    		[
    			-13,
    			45
    		],
    		[
    			-2,
    			33
    		],
    		[
    			-14,
    			73
    		],
    		[
    			4,
    			10
    		],
    		[
    			-13,
    			67
    		],
    		[
    			-22,
    			27
    		],
    		[
    			-9,
    			96
    		],
    		[
    			-28,
    			133
    		],
    		[
    			-21,
    			75
    		],
    		[
    			-5,
    			32
    		],
    		[
    			-27,
    			100
    		],
    		[
    			-15,
    			87
    		],
    		[
    			2,
    			16
    		],
    		[
    			-17,
    			48
    		],
    		[
    			-4,
    			132
    		],
    		[
    			-24,
    			85
    		],
    		[
    			-66,
    			571
    		],
    		[
    			-9,
    			62
    		],
    		[
    			-14,
    			55
    		],
    		[
    			-7,
    			96
    		],
    		[
    			9,
    			21
    		],
    		[
    			-5,
    			65
    		],
    		[
    			-18,
    			78
    		],
    		[
    			7,
    			14
    		],
    		[
    			3,
    			109
    		],
    		[
    			-2,
    			39
    		],
    		[
    			-16,
    			50
    		]
    	],
    	[
    		[
    			4797,
    			532
    		],
    		[
    			-50,
    			-97
    		],
    		[
    			-25,
    			2
    		],
    		[
    			-122,
    			80
    		],
    		[
    			-97,
    			-197
    		]
    	],
    	[
    		[
    			4503,
    			320
    		],
    		[
    			-15,
    			8
    		],
    		[
    			-239,
    			-91
    		],
    		[
    			-69,
    			-32
    		],
    		[
    			-20,
    			54
    		],
    		[
    			-24,
    			41
    		],
    		[
    			-28,
    			93
    		]
    	],
    	[
    		[
    			4892,
    			714
    		],
    		[
    			28,
    			-12
    		],
    		[
    			83,
    			-20
    		],
    		[
    			120,
    			-39
    		]
    	],
    	[
    		[
    			5123,
    			643
    		],
    		[
    			-7,
    			-57
    		],
    		[
    			103,
    			-47
    		],
    		[
    			-69,
    			-278
    		],
    		[
    			71,
    			-37
    		],
    		[
    			28,
    			-20
    		],
    		[
    			33,
    			-37
    		]
    	],
    	[
    		[
    			5282,
    			167
    		],
    		[
    			29,
    			-37
    		],
    		[
    			38,
    			-30
    		],
    		[
    			-26,
    			-82
    		]
    	],
    	[
    		[
    			5323,
    			18
    		],
    		[
    			-108,
    			-2
    		],
    		[
    			-144,
    			9
    		],
    		[
    			-73,
    			-9
    		],
    		[
    			-115,
    			-2
    		],
    		[
    			-219,
    			-1
    		]
    	],
    	[
    		[
    			4664,
    			13
    		],
    		[
    			-16,
    			34
    		],
    		[
    			-38,
    			52
    		],
    		[
    			-12,
    			9
    		],
    		[
    			-35,
    			63
    		],
    		[
    			-12,
    			50
    		],
    		[
    			-35,
    			9
    		],
    		[
    			-46,
    			23
    		],
    		[
    			33,
    			67
    		]
    	],
    	[
    		[
    			3913,
    			4175
    		],
    		[
    			35,
    			25
    		],
    		[
    			53,
    			81
    		],
    		[
    			-3,
    			17
    		],
    		[
    			6,
    			115
    		],
    		[
    			-4,
    			57
    		],
    		[
    			-21,
    			58
    		]
    	],
    	[
    		[
    			3979,
    			4528
    		],
    		[
    			23,
    			3
    		]
    	],
    	[
    		[
    			4002,
    			4531
    		],
    		[
    			403,
    			35
    		]
    	],
    	[
    		[
    			4424,
    			4296
    		],
    		[
    			-55,
    			-4
    		],
    		[
    			-29,
    			5
    		],
    		[
    			-92,
    			-9
    		],
    		[
    			-5,
    			-101
    		],
    		[
    			-7,
    			-13
    		],
    		[
    			6,
    			-85
    		],
    		[
    			-41,
    			-35
    		],
    		[
    			-24,
    			15
    		],
    		[
    			-76,
    			75
    		],
    		[
    			-16,
    			4
    		],
    		[
    			-8,
    			-26
    		],
    		[
    			40,
    			-34
    		],
    		[
    			-8,
    			-11
    		],
    		[
    			-28,
    			15
    		],
    		[
    			-53,
    			-17
    		],
    		[
    			-59,
    			12
    		]
    	],
    	[
    		[
    			3969,
    			4087
    		],
    		[
    			-10,
    			27
    		],
    		[
    			-25,
    			27
    		],
    		[
    			-21,
    			34
    		]
    	],
    	[
    		[
    			4664,
    			13
    		],
    		[
    			-243,
    			0
    		],
    		[
    			-27,
    			4
    		],
    		[
    			-69,
    			-1
    		],
    		[
    			-41,
    			-3
    		],
    		[
    			-96,
    			-1
    		],
    		[
    			-75,
    			5
    		],
    		[
    			-71,
    			-7
    		],
    		[
    			-475,
    			-2
    		],
    		[
    			-9,
    			0
    		]
    	],
    	[
    		[
    			6102,
    			699
    		],
    		[
    			248,
    			-99
    		]
    	],
    	[
    		[
    			6350,
    			600
    		],
    		[
    			-68,
    			-227
    		],
    		[
    			-7,
    			-5
    		],
    		[
    			-27,
    			-88
    		],
    		[
    			-158,
    			64
    		],
    		[
    			-42,
    			-135
    		]
    	],
    	[
    		[
    			6048,
    			209
    		],
    		[
    			-271,
    			110
    		]
    	],
    	[
    		[
    			5777,
    			319
    		],
    		[
    			21,
    			69
    		]
    	],
    	[
    		[
    			5798,
    			388
    		],
    		[
    			20,
    			65
    		],
    		[
    			-30,
    			16
    		],
    		[
    			-17,
    			27
    		],
    		[
    			-6,
    			44
    		],
    		[
    			9,
    			41
    		],
    		[
    			23,
    			40
    		],
    		[
    			15,
    			-1
    		],
    		[
    			238,
    			-94
    		],
    		[
    			48,
    			165
    		],
    		[
    			4,
    			8
    		]
    	],
    	[
    		[
    			6778,
    			891
    		],
    		[
    			20,
    			-86
    		]
    	],
    	[
    		[
    			6563,
    			349
    		],
    		[
    			23,
    			33
    		],
    		[
    			3,
    			72
    		],
    		[
    			-20,
    			78
    		],
    		[
    			15,
    			25
    		],
    		[
    			-84,
    			-34
    		],
    		[
    			-111,
    			62
    		],
    		[
    			-39,
    			15
    		]
    	],
    	[
    		[
    			6102,
    			699
    		],
    		[
    			4,
    			23
    		],
    		[
    			105,
    			-23
    		],
    		[
    			5,
    			16
    		],
    		[
    			27,
    			-8
    		],
    		[
    			4,
    			14
    		],
    		[
    			-47,
    			17
    		],
    		[
    			29,
    			103
    		],
    		[
    			58,
    			-23
    		],
    		[
    			35,
    			117
    		]
    	],
    	[
    		[
    			6393,
    			19
    		],
    		[
    			-155,
    			-3
    		],
    		[
    			-249,
    			1
    		]
    	],
    	[
    		[
    			5989,
    			17
    		],
    		[
    			59,
    			192
    		]
    	],
    	[
    		[
    			2956,
    			4881
    		],
    		[
    			62,
    			8
    		],
    		[
    			4,
    			5
    		],
    		[
    			121,
    			8
    		],
    		[
    			0,
    			-6
    		],
    		[
    			131,
    			8
    		],
    		[
    			55,
    			-19
    		],
    		[
    			58,
    			-11
    		],
    		[
    			232,
    			42
    		]
    	],
    	[
    		[
    			3619,
    			4916
    		],
    		[
    			22,
    			-157
    		]
    	],
    	[
    		[
    			3641,
    			4759
    		],
    		[
    			-170,
    			-30
    		],
    		[
    			-314,
    			-129
    		],
    		[
    			-61,
    			-23
    		],
    		[
    			-63,
    			-3
    		],
    		[
    			11,
    			-218
    		],
    		[
    			-27,
    			-22
    		],
    		[
    			-9,
    			-40
    		],
    		[
    			10,
    			-37
    		],
    		[
    			-32,
    			-2
    		]
    	],
    	[
    		[
    			2986,
    			4255
    		],
    		[
    			-8,
    			157
    		]
    	],
    	[
    		[
    			2978,
    			4412
    		],
    		[
    			-22,
    			469
    		]
    	],
    	[
    		[
    			3641,
    			4759
    		],
    		[
    			35,
    			-256
    		],
    		[
    			166,
    			14
    		]
    	],
    	[
    		[
    			3842,
    			4517
    		],
    		[
    			137,
    			11
    		]
    	],
    	[
    		[
    			3913,
    			4175
    		],
    		[
    			-23,
    			37
    		],
    		[
    			-11,
    			49
    		],
    		[
    			-3,
    			36
    		],
    		[
    			-139,
    			-27
    		],
    		[
    			-112,
    			-53
    		],
    		[
    			-28,
    			-23
    		],
    		[
    			-41,
    			-54
    		],
    		[
    			-9,
    			-57
    		],
    		[
    			-38,
    			-81
    		],
    		[
    			-18,
    			-56
    		],
    		[
    			-3,
    			-46
    		],
    		[
    			-35,
    			-78
    		],
    		[
    			-15,
    			-44
    		],
    		[
    			2,
    			-67
    		],
    		[
    			-5,
    			-25
    		],
    		[
    			-21,
    			-27
    		],
    		[
    			-34,
    			-7
    		],
    		[
    			-114,
    			46
    		],
    		[
    			-98,
    			-11
    		],
    		[
    			-47,
    			-25
    		]
    	],
    	[
    		[
    			3121,
    			3662
    		],
    		[
    			-37,
    			38
    		],
    		[
    			-74,
    			90
    		]
    	],
    	[
    		[
    			3010,
    			3790
    		],
    		[
    			-24,
    			66
    		],
    		[
    			0,
    			28
    		],
    		[
    			10,
    			50
    		],
    		[
    			3,
    			47
    		],
    		[
    			-13,
    			274
    		]
    	],
    	[
    		[
    			2198,
    			4841
    		],
    		[
    			382,
    			25
    		]
    	],
    	[
    		[
    			2580,
    			4866
    		],
    		[
    			23,
    			-478
    		]
    	],
    	[
    		[
    			2603,
    			4388
    		],
    		[
    			-375,
    			-24
    		]
    	],
    	[
    		[
    			2228,
    			4364
    		],
    		[
    			-13,
    			158
    		],
    		[
    			-17,
    			319
    		]
    	],
    	[
    		[
    			2603,
    			4388
    		],
    		[
    			375,
    			24
    		]
    	],
    	[
    		[
    			3010,
    			3790
    		],
    		[
    			-64,
    			-11
    		]
    	],
    	[
    		[
    			2946,
    			3779
    		],
    		[
    			-186,
    			-12
    		],
    		[
    			-22,
    			2
    		],
    		[
    			-18,
    			39
    		],
    		[
    			-85,
    			-48
    		],
    		[
    			-6,
    			8
    		],
    		[
    			-46,
    			-33
    		],
    		[
    			-14,
    			20
    		],
    		[
    			-15,
    			62
    		],
    		[
    			-1,
    			21
    		],
    		[
    			10,
    			52
    		],
    		[
    			0,
    			49
    		],
    		[
    			-11,
    			33
    		],
    		[
    			-52,
    			42
    		],
    		[
    			-32,
    			50
    		],
    		[
    			-231,
    			-14
    		]
    	],
    	[
    		[
    			2237,
    			4050
    		],
    		[
    			-6,
    			157
    		],
    		[
    			-10,
    			157
    		]
    	],
    	[
    		[
    			2221,
    			4364
    		],
    		[
    			7,
    			0
    		]
    	],
    	[
    		[
    			2946,
    			3779
    		],
    		[
    			3,
    			-49
    		],
    		[
    			33,
    			-29
    		],
    		[
    			24,
    			-66
    		],
    		[
    			-49,
    			-18
    		],
    		[
    			-11,
    			-10
    		],
    		[
    			-26,
    			12
    		],
    		[
    			-91,
    			-6
    		],
    		[
    			8,
    			-157
    		],
    		[
    			-99,
    			-7
    		],
    		[
    			-31,
    			-5
    		],
    		[
    			-187,
    			-8
    		],
    		[
    			-256,
    			-17
    		]
    	],
    	[
    		[
    			2264,
    			3419
    		],
    		[
    			-5,
    			158
    		]
    	],
    	[
    		[
    			2259,
    			3577
    		],
    		[
    			-7,
    			148
    		],
    		[
    			-11,
    			167
    		],
    		[
    			-4,
    			158
    		]
    	],
    	[
    		[
    			3121,
    			3662
    		],
    		[
    			27,
    			-47
    		],
    		[
    			30,
    			-83
    		],
    		[
    			50,
    			-81
    		],
    		[
    			57,
    			-83
    		],
    		[
    			-3,
    			-36
    		],
    		[
    			-27,
    			-27
    		]
    	],
    	[
    		[
    			3255,
    			3305
    		],
    		[
    			-129,
    			-145
    		],
    		[
    			-135,
    			-154
    		]
    	],
    	[
    		[
    			2991,
    			3006
    		],
    		[
    			-256,
    			-30
    		],
    		[
    			-447,
    			-29
    		]
    	],
    	[
    		[
    			2288,
    			2947
    		],
    		[
    			-7,
    			158
    		],
    		[
    			-9,
    			157
    		],
    		[
    			-8,
    			157
    		]
    	],
    	[
    		[
    			6420,
    			5198
    		],
    		[
    			35,
    			3
    		],
    		[
    			30,
    			26
    		],
    		[
    			259,
    			297
    		],
    		[
    			-90,
    			104
    		],
    		[
    			130,
    			148
    		],
    		[
    			91,
    			-104
    		],
    		[
    			260,
    			297
    		]
    	],
    	[
    		[
    			7135,
    			5969
    		],
    		[
    			196,
    			225
    		],
    		[
    			37,
    			24
    		],
    		[
    			38,
    			1
    		],
    		[
    			2,
    			54
    		],
    		[
    			26,
    			32
    		]
    	],
    	[
    		[
    			7434,
    			6305
    		],
    		[
    			6,
    			-3
    		]
    	],
    	[
    		[
    			7440,
    			6302
    		],
    		[
    			75,
    			5
    		]
    	],
    	[
    		[
    			7515,
    			6307
    		],
    		[
    			87,
    			7
    		]
    	],
    	[
    		[
    			7602,
    			6314
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7603,
    			6313
    		],
    		[
    			2,
    			-12
    		]
    	],
    	[
    		[
    			7605,
    			6301
    		],
    		[
    			-1,
    			-22
    		],
    		[
    			-163,
    			-15
    		],
    		[
    			-16,
    			-6
    		],
    		[
    			2,
    			-40
    		],
    		[
    			128,
    			12
    		],
    		[
    			2,
    			-31
    		],
    		[
    			-123,
    			-10
    		],
    		[
    			3,
    			-41
    		],
    		[
    			161,
    			14
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-161,
    			-13
    		],
    		[
    			2,
    			-38
    		],
    		[
    			158,
    			13
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-158,
    			-13
    		],
    		[
    			3,
    			-34
    		],
    		[
    			158,
    			13
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-158,
    			-13
    		],
    		[
    			2,
    			-30
    		],
    		[
    			155,
    			13
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-155,
    			-13
    		],
    		[
    			2,
    			-28
    		],
    		[
    			155,
    			13
    		],
    		[
    			0,
    			-3
    		],
    		[
    			-155,
    			-13
    		],
    		[
    			2,
    			-27
    		],
    		[
    			151,
    			12
    		],
    		[
    			1,
    			-3
    		],
    		[
    			-152,
    			-12
    		],
    		[
    			3,
    			-46
    		],
    		[
    			-17,
    			-13
    		],
    		[
    			-163,
    			-90
    		],
    		[
    			35,
    			-47
    		],
    		[
    			125,
    			11
    		],
    		[
    			19,
    			-6
    		],
    		[
    			3,
    			-28
    		],
    		[
    			13,
    			-18
    		],
    		[
    			120,
    			20
    		],
    		[
    			12,
    			-80
    		],
    		[
    			-3,
    			-5
    		],
    		[
    			-124,
    			-21
    		],
    		[
    			4,
    			-64
    		],
    		[
    			299,
    			25
    		],
    		[
    			21,
    			-228
    		],
    		[
    			-188,
    			120
    		],
    		[
    			-12,
    			3
    		],
    		[
    			-110,
    			-9
    		],
    		[
    			10,
    			-35
    		],
    		[
    			-8,
    			-7
    		],
    		[
    			15,
    			-92
    		],
    		[
    			33,
    			-58
    		],
    		[
    			13,
    			38
    		],
    		[
    			23,
    			16
    		],
    		[
    			-23,
    			-73
    		],
    		[
    			7,
    			-11
    		],
    		[
    			140,
    			-78
    		],
    		[
    			-13,
    			-32
    		],
    		[
    			-128,
    			71
    		],
    		[
    			6,
    			-29
    		],
    		[
    			26,
    			-82
    		],
    		[
    			-7,
    			-61
    		],
    		[
    			31,
    			-5
    		],
    		[
    			43,
    			4
    		],
    		[
    			2,
    			-32
    		],
    		[
    			81,
    			7
    		],
    		[
    			1,
    			-12
    		],
    		[
    			-144,
    			-13
    		],
    		[
    			2,
    			-25
    		]
    	],
    	[
    		[
    			7595,
    			4989
    		],
    		[
    			-56,
    			1
    		],
    		[
    			-46,
    			-134
    		],
    		[
    			-58,
    			-100
    		],
    		[
    			-18,
    			-8
    		],
    		[
    			-14,
    			217
    		],
    		[
    			-339,
    			-29
    		],
    		[
    			7,
    			-110
    		]
    	],
    	[
    		[
    			7071,
    			4826
    		],
    		[
    			-284,
    			-25
    		]
    	],
    	[
    		[
    			6787,
    			4801
    		],
    		[
    			-338,
    			-29
    		]
    	],
    	[
    		[
    			6449,
    			4772
    		],
    		[
    			-29,
    			426
    		]
    	],
    	[
    		[
    			7578,
    			5911
    		],
    		[
    			48,
    			66
    		],
    		[
    			6,
    			17
    		],
    		[
    			-16,
    			243
    		],
    		[
    			2,
    			1
    		],
    		[
    			15,
    			-244
    		],
    		[
    			-6,
    			-18
    		],
    		[
    			-49,
    			-65
    		]
    	],
    	[
    		[
    			3969,
    			4087
    		],
    		[
    			10,
    			-21
    		],
    		[
    			38,
    			-42
    		],
    		[
    			39,
    			15
    		],
    		[
    			6,
    			-31
    		],
    		[
    			-70,
    			-23
    		],
    		[
    			-26,
    			8
    		],
    		[
    			-31,
    			32
    		],
    		[
    			-19,
    			0
    		],
    		[
    			-5,
    			-24
    		],
    		[
    			14,
    			-59
    		],
    		[
    			19,
    			-52
    		],
    		[
    			38,
    			-54
    		],
    		[
    			-3,
    			-28
    		],
    		[
    			-44,
    			-65
    		],
    		[
    			25,
    			-46
    		],
    		[
    			1,
    			-36
    		],
    		[
    			-32,
    			-50
    		],
    		[
    			-17,
    			-10
    		],
    		[
    			-47,
    			9
    		],
    		[
    			-41,
    			-41
    		],
    		[
    			-15,
    			-50
    		],
    		[
    			-2,
    			-24
    		],
    		[
    			10,
    			-30
    		],
    		[
    			18,
    			-6
    		],
    		[
    			21,
    			19
    		],
    		[
    			36,
    			70
    		],
    		[
    			18,
    			9
    		],
    		[
    			60,
    			-26
    		],
    		[
    			66,
    			-56
    		],
    		[
    			6,
    			-38
    		],
    		[
    			-26,
    			-10
    		],
    		[
    			-22,
    			12
    		],
    		[
    			-37,
    			39
    		],
    		[
    			-24,
    			15
    		],
    		[
    			-13,
    			-9
    		],
    		[
    			-56,
    			-134
    		],
    		[
    			-23,
    			-81
    		],
    		[
    			-10,
    			-12
    		],
    		[
    			-50,
    			-38
    		],
    		[
    			-33,
    			-7
    		],
    		[
    			-6,
    			-24
    		]
    	],
    	[
    		[
    			3742,
    			3188
    		],
    		[
    			-50,
    			-23
    		]
    	],
    	[
    		[
    			3692,
    			3165
    		],
    		[
    			-18,
    			6
    		],
    		[
    			-96,
    			0
    		],
    		[
    			-18,
    			5
    		],
    		[
    			-50,
    			39
    		],
    		[
    			-109,
    			37
    		],
    		[
    			-72,
    			17
    		],
    		[
    			-49,
    			1
    		],
    		[
    			-25,
    			35
    		]
    	],
    	[
    		[
    			3692,
    			3165
    		],
    		[
    			3,
    			-12
    		],
    		[
    			104,
    			-188
    		]
    	],
    	[
    		[
    			3799,
    			2965
    		],
    		[
    			-4,
    			-24
    		],
    		[
    			-25,
    			4
    		],
    		[
    			-46,
    			-2
    		],
    		[
    			-49,
    			-17
    		],
    		[
    			-37,
    			8
    		],
    		[
    			-19,
    			11
    		],
    		[
    			-29,
    			33
    		],
    		[
    			-47,
    			-49
    		],
    		[
    			-23,
    			-43
    		],
    		[
    			-20,
    			-54
    		],
    		[
    			-35,
    			-49
    		],
    		[
    			-125,
    			-88
    		],
    		[
    			-8,
    			-28
    		],
    		[
    			4,
    			-25
    		],
    		[
    			-17,
    			-28
    		],
    		[
    			-26,
    			-5
    		],
    		[
    			-19,
    			10
    		]
    	],
    	[
    		[
    			3274,
    			2619
    		],
    		[
    			-15,
    			37
    		],
    		[
    			-1,
    			46
    		],
    		[
    			15,
    			16
    		],
    		[
    			-3,
    			22
    		],
    		[
    			-27,
    			-2
    		],
    		[
    			-96,
    			151
    		],
    		[
    			-20,
    			28
    		],
    		[
    			-82,
    			52
    		],
    		[
    			-54,
    			37
    		]
    	],
    	[
    		[
    			3799,
    			2965
    		],
    		[
    			42,
    			-36
    		],
    		[
    			38,
    			-11
    		],
    		[
    			81,
    			-10
    		],
    		[
    			26,
    			-12
    		],
    		[
    			23,
    			-31
    		],
    		[
    			6,
    			-46
    		],
    		[
    			10,
    			-30
    		],
    		[
    			15,
    			-13
    		],
    		[
    			48,
    			-13
    		],
    		[
    			32,
    			-24
    		],
    		[
    			16,
    			-29
    		],
    		[
    			23,
    			-23
    		],
    		[
    			49,
    			-17
    		],
    		[
    			19,
    			-27
    		],
    		[
    			-5,
    			-95
    		],
    		[
    			12,
    			-57
    		],
    		[
    			-14,
    			-44
    		],
    		[
    			-51,
    			-44
    		],
    		[
    			-18,
    			-39
    		],
    		[
    			16,
    			-35
    		],
    		[
    			23,
    			-3
    		],
    		[
    			72,
    			26
    		],
    		[
    			46,
    			-21
    		],
    		[
    			27,
    			-51
    		],
    		[
    			86,
    			-34
    		],
    		[
    			48,
    			-27
    		]
    	],
    	[
    		[
    			4469,
    			2219
    		],
    		[
    			-25,
    			-113
    		],
    		[
    			-47,
    			2
    		],
    		[
    			-801,
    			-5
    		],
    		[
    			-5,
    			-1
    		]
    	],
    	[
    		[
    			3591,
    			2102
    		],
    		[
    			-50,
    			-1
    		],
    		[
    			-27,
    			59
    		],
    		[
    			-15,
    			15
    		],
    		[
    			-43,
    			12
    		],
    		[
    			-46,
    			19
    		],
    		[
    			-6,
    			15
    		],
    		[
    			-25,
    			11
    		],
    		[
    			-22,
    			-8
    		],
    		[
    			-56,
    			8
    		],
    		[
    			-22,
    			-3
    		],
    		[
    			-43,
    			-21
    		]
    	],
    	[
    		[
    			3236,
    			2208
    		],
    		[
    			8,
    			38
    		],
    		[
    			-7,
    			35
    		],
    		[
    			-13,
    			29
    		],
    		[
    			-12,
    			50
    		],
    		[
    			-27,
    			57
    		],
    		[
    			-3,
    			75
    		],
    		[
    			20,
    			21
    		],
    		[
    			21,
    			-8
    		],
    		[
    			7,
    			61
    		],
    		[
    			16,
    			40
    		],
    		[
    			28,
    			13
    		]
    	],
    	[
    		[
    			3236,
    			2208
    		],
    		[
    			-30,
    			43
    		],
    		[
    			-72,
    			83
    		],
    		[
    			-46,
    			48
    		],
    		[
    			-65,
    			57
    		],
    		[
    			15,
    			-69
    		],
    		[
    			-11,
    			-31
    		],
    		[
    			-41,
    			-15
    		],
    		[
    			-25,
    			4
    		],
    		[
    			-40,
    			28
    		],
    		[
    			23,
    			-48
    		],
    		[
    			2,
    			-29
    		],
    		[
    			-84,
    			-5
    		],
    		[
    			-20,
    			-11
    		],
    		[
    			-249,
    			-16
    		],
    		[
    			-73,
    			6
    		],
    		[
    			-143,
    			-6
    		],
    		[
    			-49,
    			1
    		],
    		[
    			-8,
    			-17
    		]
    	],
    	[
    		[
    			2320,
    			2231
    		],
    		[
    			-1,
    			17
    		]
    	],
    	[
    		[
    			2319,
    			2248
    		],
    		[
    			-1,
    			9
    		],
    		[
    			-10,
    			218
    		],
    		[
    			-6,
    			158
    		],
    		[
    			-8,
    			157
    		],
    		[
    			-6,
    			157
    		]
    	],
    	[
    		[
    			4441,
    			3993
    		],
    		[
    			-68,
    			-18
    		],
    		[
    			-18,
    			0
    		],
    		[
    			-56,
    			-114
    		],
    		[
    			-30,
    			-34
    		],
    		[
    			-25,
    			-54
    		],
    		[
    			-15,
    			-19
    		],
    		[
    			-2,
    			-19
    		],
    		[
    			-18,
    			-1
    		],
    		[
    			-24,
    			-135
    		]
    	],
    	[
    		[
    			4185,
    			3599
    		],
    		[
    			-18,
    			-112
    		],
    		[
    			-41,
    			-90
    		],
    		[
    			5,
    			-69
    		],
    		[
    			-15,
    			-33
    		],
    		[
    			-23,
    			-17
    		],
    		[
    			16,
    			-24
    		]
    	],
    	[
    		[
    			4109,
    			3254
    		],
    		[
    			-13,
    			7
    		],
    		[
    			-5,
    			22
    		],
    		[
    			-104,
    			-23
    		],
    		[
    			-44,
    			-13
    		]
    	],
    	[
    		[
    			3943,
    			3247
    		],
    		[
    			-115,
    			-40
    		],
    		[
    			-86,
    			-19
    		]
    	],
    	[
    		[
    			6357,
    			6552
    		],
    		[
    			152,
    			171
    		],
    		[
    			82,
    			79
    		],
    		[
    			7,
    			14
    		],
    		[
    			311,
    			354
    		],
    		[
    			18,
    			22
    		]
    	],
    	[
    		[
    			6927,
    			7192
    		],
    		[
    			85,
    			95
    		],
    		[
    			6,
    			1
    		],
    		[
    			92,
    			-105
    		],
    		[
    			35,
    			40
    		],
    		[
    			23,
    			19
    		],
    		[
    			12,
    			-5
    		]
    	],
    	[
    		[
    			7180,
    			7237
    		],
    		[
    			23,
    			-29
    		],
    		[
    			-8,
    			-8
    		],
    		[
    			170,
    			-207
    		],
    		[
    			-7,
    			-8
    		],
    		[
    			19,
    			-48
    		],
    		[
    			14,
    			-1
    		],
    		[
    			17,
    			-23
    		],
    		[
    			136,
    			79
    		],
    		[
    			14,
    			-35
    		],
    		[
    			-11,
    			-9
    		],
    		[
    			-112,
    			-56
    		],
    		[
    			15,
    			-40
    		],
    		[
    			116,
    			40
    		],
    		[
    			13,
    			-48
    		],
    		[
    			-119,
    			-37
    		],
    		[
    			8,
    			-46
    		],
    		[
    			103,
    			24
    		],
    		[
    			7,
    			-35
    		],
    		[
    			-130,
    			-32
    		],
    		[
    			-1,
    			-41
    		],
    		[
    			166,
    			14
    		],
    		[
    			4,
    			-4
    		],
    		[
    			9,
    			-136
    		],
    		[
    			-3,
    			-4
    		],
    		[
    			-173,
    			-15
    		],
    		[
    			-13,
    			-7
    		],
    		[
    			-3,
    			-48
    		],
    		[
    			127,
    			11
    		],
    		[
    			2,
    			-33
    		],
    		[
    			-105,
    			-9
    		],
    		[
    			-27,
    			-9
    		],
    		[
    			-2,
    			-44
    		],
    		[
    			83,
    			7
    		],
    		[
    			3,
    			-46
    		],
    		[
    			-75,
    			-7
    		],
    		[
    			-13,
    			-7
    		],
    		[
    			7,
    			-35
    		]
    	],
    	[
    		[
    			7135,
    			5969
    		],
    		[
    			-271,
    			313
    		]
    	],
    	[
    		[
    			6864,
    			6282
    		],
    		[
    			-180,
    			209
    		],
    		[
    			-131,
    			-150
    		]
    	],
    	[
    		[
    			6553,
    			6341
    		],
    		[
    			-91,
    			103
    		],
    		[
    			-91,
    			107
    		],
    		[
    			-14,
    			1
    		]
    	],
    	[
    		[
    			7603,
    			6313
    		],
    		[
    			2,
    			-12
    		]
    	],
    	[
    		[
    			7602,
    			6314
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7515,
    			6307
    		],
    		[
    			87,
    			7
    		]
    	],
    	[
    		[
    			6529,
    			3912
    		],
    		[
    			-11,
    			142
    		],
    		[
    			-22,
    			72
    		]
    	],
    	[
    		[
    			6496,
    			4126
    		],
    		[
    			334,
    			29
    		],
    		[
    			-14,
    			215
    		]
    	],
    	[
    		[
    			6816,
    			4370
    		],
    		[
    			283,
    			25
    		],
    		[
    			51,
    			4
    		]
    	],
    	[
    		[
    			7150,
    			4399
    		],
    		[
    			3,
    			-49
    		],
    		[
    			1,
    			-131
    		],
    		[
    			-2,
    			-61
    		],
    		[
    			1,
    			-81
    		],
    		[
    			11,
    			-100
    		],
    		[
    			20,
    			-8
    		],
    		[
    			2,
    			-20
    		],
    		[
    			20,
    			-76
    		],
    		[
    			12,
    			-61
    		],
    		[
    			6,
    			-54
    		],
    		[
    			32,
    			1
    		]
    	],
    	[
    		[
    			7256,
    			3759
    		],
    		[
    			-341,
    			-30
    		],
    		[
    			6,
    			-96
    		],
    		[
    			-175,
    			-15
    		],
    		[
    			-62,
    			-27
    		],
    		[
    			-125,
    			-10
    		],
    		[
    			-10,
    			-14
    		],
    		[
    			-5,
    			-72
    		],
    		[
    			-41,
    			-5
    		]
    	],
    	[
    		[
    			6503,
    			3490
    		],
    		[
    			-13,
    			-4
    		]
    	],
    	[
    		[
    			6490,
    			3486
    		],
    		[
    			28,
    			123
    		],
    		[
    			-3,
    			39
    		],
    		[
    			21,
    			92
    		],
    		[
    			1,
    			26
    		],
    		[
    			-8,
    			146
    		]
    	],
    	[
    		[
    			7256,
    			3759
    		],
    		[
    			524,
    			44
    		]
    	],
    	[
    		[
    			7780,
    			3803
    		],
    		[
    			15,
    			-18
    		],
    		[
    			56,
    			-6
    		],
    		[
    			26,
    			2
    		],
    		[
    			5,
    			-76
    		],
    		[
    			226,
    			19
    		],
    		[
    			19,
    			-299
    		],
    		[
    			-534,
    			-48
    		],
    		[
    			-55,
    			0
    		],
    		[
    			-55,
    			-22
    		],
    		[
    			-21,
    			-23
    		],
    		[
    			-22,
    			0
    		],
    		[
    			-8,
    			19
    		],
    		[
    			-69,
    			-5
    		],
    		[
    			-53,
    			-1
    		],
    		[
    			-32,
    			-5
    		],
    		[
    			-32,
    			22
    		],
    		[
    			-78,
    			43
    		],
    		[
    			-50,
    			-2
    		],
    		[
    			-2,
    			-27
    		],
    		[
    			9,
    			-58
    		],
    		[
    			20,
    			-1
    		],
    		[
    			16,
    			-17
    		],
    		[
    			106,
    			-45
    		],
    		[
    			77,
    			7
    		],
    		[
    			56,
    			14
    		],
    		[
    			36,
    			2
    		],
    		[
    			28,
    			12
    		],
    		[
    			6,
    			-17
    		],
    		[
    			255,
    			21
    		],
    		[
    			37,
    			-8
    		],
    		[
    			138,
    			12
    		],
    		[
    			3,
    			-19
    		],
    		[
    			86,
    			12
    		],
    		[
    			98,
    			3
    		],
    		[
    			36,
    			-4
    		],
    		[
    			42,
    			-23
    		],
    		[
    			20,
    			-38
    		],
    		[
    			-9,
    			-54
    		],
    		[
    			47,
    			-65
    		]
    	],
    	[
    		[
    			8223,
    			3110
    		],
    		[
    			-159,
    			-404
    		],
    		[
    			-132,
    			-212
    		],
    		[
    			-4,
    			7
    		],
    		[
    			-55,
    			46
    		],
    		[
    			-45,
    			44
    		],
    		[
    			-39,
    			-60
    		]
    	],
    	[
    		[
    			7789,
    			2531
    		],
    		[
    			-218,
    			179
    		]
    	],
    	[
    		[
    			7571,
    			2710
    		],
    		[
    			-109,
    			89
    		],
    		[
    			38,
    			61
    		],
    		[
    			-70,
    			58
    		],
    		[
    			-18,
    			5
    		],
    		[
    			-14,
    			-68
    		],
    		[
    			-34,
    			-135
    		],
    		[
    			-35,
    			-131
    		],
    		[
    			-108,
    			88
    		],
    		[
    			-165,
    			-263
    		],
    		[
    			-108,
    			89
    		]
    	],
    	[
    		[
    			6948,
    			2503
    		],
    		[
    			-216,
    			177
    		],
    		[
    			-29,
    			3
    		],
    		[
    			-113,
    			-46
    		],
    		[
    			-279,
    			-112
    		]
    	],
    	[
    		[
    			6311,
    			2525
    		],
    		[
    			-5,
    			55
    		],
    		[
    			3,
    			73
    		],
    		[
    			-10,
    			1
    		],
    		[
    			6,
    			78
    		],
    		[
    			22,
    			74
    		],
    		[
    			116,
    			232
    		],
    		[
    			24,
    			94
    		],
    		[
    			-8,
    			58
    		],
    		[
    			15,
    			28
    		],
    		[
    			21,
    			80
    		],
    		[
    			8,
    			47
    		],
    		[
    			-10,
    			53
    		],
    		[
    			-9,
    			3
    		],
    		[
    			19,
    			89
    		]
    	],
    	[
    		[
    			3885,
    			5126
    		],
    		[
    			44,
    			-314
    		],
    		[
    			-47,
    			-9
    		],
    		[
    			19,
    			-141
    		],
    		[
    			-77,
    			-14
    		],
    		[
    			18,
    			-131
    		]
    	],
    	[
    		[
    			3619,
    			4916
    		],
    		[
    			-3,
    			9
    		],
    		[
    			-21,
    			149
    		]
    	],
    	[
    		[
    			3595,
    			5074
    		],
    		[
    			8,
    			0
    		],
    		[
    			282,
    			52
    		]
    	],
    	[
    		[
    			5835,
    			6695
    		],
    		[
    			386,
    			71
    		]
    	],
    	[
    		[
    			6221,
    			6766
    		],
    		[
    			10,
    			-79
    		]
    	],
    	[
    		[
    			6231,
    			6687
    		],
    		[
    			-192,
    			-35
    		],
    		[
    			11,
    			-80
    		],
    		[
    			-192,
    			-35
    		]
    	],
    	[
    		[
    			5858,
    			6537
    		],
    		[
    			-23,
    			158
    		]
    	],
    	[
    		[
    			4911,
    			5557
    		],
    		[
    			11,
    			-78
    		],
    		[
    			96,
    			17
    		],
    		[
    			11,
    			-78
    		],
    		[
    			192,
    			35
    		],
    		[
    			22,
    			-158
    		],
    		[
    			12,
    			-7
    		]
    	],
    	[
    		[
    			5255,
    			5288
    		],
    		[
    			-86,
    			-100
    		]
    	],
    	[
    		[
    			5169,
    			5188
    		],
    		[
    			-16,
    			-5
    		],
    		[
    			-135,
    			-12
    		],
    		[
    			-8,
    			5
    		],
    		[
    			-143,
    			-12
    		]
    	],
    	[
    		[
    			4867,
    			5164
    		],
    		[
    			-52,
    			375
    		]
    	],
    	[
    		[
    			4815,
    			5539
    		],
    		[
    			96,
    			18
    		]
    	],
    	[
    		[
    			5983,
    			7048
    		],
    		[
    			193,
    			35
    		]
    	],
    	[
    		[
    			6176,
    			7083
    		],
    		[
    			95,
    			17
    		]
    	],
    	[
    		[
    			6271,
    			7100
    		],
    		[
    			23,
    			-159
    		],
    		[
    			-96,
    			-17
    		]
    	],
    	[
    		[
    			6198,
    			6924
    		],
    		[
    			-192,
    			-36
    		]
    	],
    	[
    		[
    			6006,
    			6888
    		],
    		[
    			-23,
    			160
    		]
    	],
    	[
    		[
    			5644,
    			6660
    		],
    		[
    			191,
    			35
    		]
    	],
    	[
    		[
    			5858,
    			6537
    		],
    		[
    			10,
    			-78
    		]
    	],
    	[
    		[
    			5868,
    			6459
    		],
    		[
    			-191,
    			-35
    		]
    	],
    	[
    		[
    			5677,
    			6424
    		],
    		[
    			-33,
    			236
    		]
    	],
    	[
    		[
    			5458,
    			6626
    		],
    		[
    			186,
    			34
    		]
    	],
    	[
    		[
    			5677,
    			6424
    		],
    		[
    			-196,
    			-36
    		]
    	],
    	[
    		[
    			5481,
    			6388
    		],
    		[
    			-11,
    			79
    		]
    	],
    	[
    		[
    			5470,
    			6467
    		],
    		[
    			-13,
    			78
    		],
    		[
    			11,
    			2
    		],
    		[
    			-10,
    			79
    		]
    	],
    	[
    		[
    			5677,
    			6424
    		],
    		[
    			33,
    			-236
    		],
    		[
    			191,
    			35
    		]
    	],
    	[
    		[
    			5901,
    			6223
    		],
    		[
    			23,
    			-157
    		],
    		[
    			7,
    			-11
    		]
    	],
    	[
    		[
    			5931,
    			6055
    		],
    		[
    			-169,
    			-194
    		],
    		[
    			-2,
    			-6
    		],
    		[
    			-78,
    			-76
    		],
    		[
    			-63,
    			-80
    		]
    	],
    	[
    		[
    			5619,
    			5699
    		],
    		[
    			-30,
    			-28
    		]
    	],
    	[
    		[
    			5589,
    			5671
    		],
    		[
    			-7,
    			-9
    		]
    	],
    	[
    		[
    			5582,
    			5662
    		],
    		[
    			-1,
    			19
    		]
    	],
    	[
    		[
    			5581,
    			5681
    		],
    		[
    			-5,
    			40
    		],
    		[
    			-20,
    			125
    		],
    		[
    			-10,
    			71
    		],
    		[
    			-24,
    			155
    		]
    	],
    	[
    		[
    			5522,
    			6072
    		],
    		[
    			-41,
    			316
    		]
    	],
    	[
    		[
    			4264,
    			8070
    		],
    		[
    			278,
    			52
    		],
    		[
    			20,
    			-139
    		]
    	],
    	[
    		[
    			4562,
    			7983
    		],
    		[
    			24,
    			-153
    		],
    		[
    			7,
    			-7
    		]
    	],
    	[
    		[
    			4593,
    			7823
    		],
    		[
    			-287,
    			-53
    		]
    	],
    	[
    		[
    			4306,
    			7770
    		],
    		[
    			-42,
    			300
    		]
    	],
    	[
    		[
    			5257,
    			8665
    		],
    		[
    			-9,
    			-1
    		]
    	],
    	[
    		[
    			5248,
    			8664
    		],
    		[
    			9,
    			1
    		]
    	],
    	[
    		[
    			5247,
    			8664
    		],
    		[
    			-8,
    			-2
    		]
    	],
    	[
    		[
    			5239,
    			8662
    		],
    		[
    			8,
    			2
    		]
    	],
    	[
    		[
    			5238,
    			8662
    		],
    		[
    			-20,
    			-8
    		]
    	],
    	[
    		[
    			5218,
    			8654
    		],
    		[
    			20,
    			8
    		]
    	],
    	[
    		[
    			5218,
    			8654
    		],
    		[
    			-10,
    			-5
    		]
    	],
    	[
    		[
    			5208,
    			8649
    		],
    		[
    			10,
    			5
    		]
    	],
    	[
    		[
    			5208,
    			8648
    		],
    		[
    			-15,
    			-12
    		]
    	],
    	[
    		[
    			5193,
    			8636
    		],
    		[
    			15,
    			12
    		]
    	],
    	[
    		[
    			5192,
    			8635
    		],
    		[
    			-8,
    			-8
    		]
    	],
    	[
    		[
    			5184,
    			8627
    		],
    		[
    			8,
    			8
    		]
    	],
    	[
    		[
    			5180,
    			8621
    		],
    		[
    			-18,
    			-30
    		]
    	],
    	[
    		[
    			5162,
    			8591
    		],
    		[
    			18,
    			30
    		]
    	],
    	[
    		[
    			5162,
    			8590
    		],
    		[
    			-6,
    			-13
    		]
    	],
    	[
    		[
    			5156,
    			8577
    		],
    		[
    			6,
    			13
    		]
    	],
    	[
    		[
    			5156,
    			8576
    		],
    		[
    			8,
    			-14
    		]
    	],
    	[
    		[
    			5164,
    			8562
    		],
    		[
    			-3,
    			-11
    		]
    	],
    	[
    		[
    			5161,
    			8551
    		],
    		[
    			-2,
    			-14
    		]
    	],
    	[
    		[
    			5159,
    			8537
    		],
    		[
    			-2,
    			-13
    		]
    	],
    	[
    		[
    			5157,
    			8524
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			5157,
    			8523
    		],
    		[
    			-1,
    			-17
    		]
    	],
    	[
    		[
    			5156,
    			8506
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			5156,
    			8505
    		],
    		[
    			0,
    			-8
    		]
    	],
    	[
    		[
    			5156,
    			8497
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			5157,
    			8499
    		],
    		[
    			1,
    			-15
    		]
    	],
    	[
    		[
    			5158,
    			8484
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			5158,
    			8482
    		],
    		[
    			3,
    			-27
    		]
    	],
    	[
    		[
    			5161,
    			8455
    		],
    		[
    			1,
    			-13
    		]
    	],
    	[
    		[
    			5162,
    			8442
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			5164,
    			8443
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			5165,
    			8436
    		],
    		[
    			-1,
    			-36
    		],
    		[
    			14,
    			-39
    		],
    		[
    			28,
    			-40
    		],
    		[
    			17,
    			-59
    		],
    		[
    			11,
    			-79
    		],
    		[
    			-5,
    			-9
    		],
    		[
    			10,
    			-71
    		]
    	],
    	[
    		[
    			5239,
    			8103
    		],
    		[
    			-283,
    			-52
    		]
    	],
    	[
    		[
    			4956,
    			8051
    		],
    		[
    			-95,
    			-21
    		],
    		[
    			-192,
    			-35
    		],
    		[
    			-97,
    			-15
    		],
    		[
    			-10,
    			3
    		]
    	],
    	[
    		[
    			4264,
    			8070
    		],
    		[
    			-13,
    			94
    		],
    		[
    			-5,
    			79
    		],
    		[
    			-16,
    			113
    		]
    	],
    	[
    		[
    			4230,
    			8356
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4232,
    			8356
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4234,
    			8356
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4234,
    			8355
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			4236,
    			8353
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			4237,
    			8350
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			4238,
    			8342
    		],
    		[
    			3,
    			-14
    		]
    	],
    	[
    		[
    			4241,
    			8328
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4241,
    			8327
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			4243,
    			8326
    		],
    		[
    			0,
    			4
    		]
    	],
    	[
    		[
    			4243,
    			8330
    		],
    		[
    			-2,
    			15
    		]
    	],
    	[
    		[
    			4241,
    			8345
    		],
    		[
    			-3,
    			16
    		]
    	],
    	[
    		[
    			4238,
    			8361
    		],
    		[
    			-14,
    			-3
    		]
    	],
    	[
    		[
    			4224,
    			8358
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			4224,
    			8361
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			4227,
    			8361
    		],
    		[
    			13,
    			3
    		]
    	],
    	[
    		[
    			4240,
    			8364
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			4241,
    			8355
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4242,
    			8356
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4243,
    			8356
    		],
    		[
    			3,
    			10
    		]
    	],
    	[
    		[
    			4246,
    			8366
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4247,
    			8366
    		],
    		[
    			-2,
    			-9
    		]
    	],
    	[
    		[
    			4245,
    			8357
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4247,
    			8357
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4248,
    			8357
    		],
    		[
    			2,
    			10
    		]
    	],
    	[
    		[
    			4250,
    			8367
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			4251,
    			8358
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4252,
    			8359
    		],
    		[
    			0,
    			3
    		]
    	],
    	[
    		[
    			4252,
    			8362
    		],
    		[
    			3,
    			6
    		]
    	],
    	[
    		[
    			4255,
    			8368
    		],
    		[
    			-1,
    			-9
    		]
    	],
    	[
    		[
    			4254,
    			8359
    		],
    		[
    			5,
    			2
    		]
    	],
    	[
    		[
    			4259,
    			8361
    		],
    		[
    			6,
    			2
    		]
    	],
    	[
    		[
    			4265,
    			8363
    		],
    		[
    			5,
    			8
    		]
    	],
    	[
    		[
    			4270,
    			8371
    		],
    		[
    			6,
    			2
    		]
    	],
    	[
    		[
    			4276,
    			8373
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4277,
    			8373
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			4277,
    			8367
    		],
    		[
    			7,
    			8
    		]
    	],
    	[
    		[
    			4284,
    			8375
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			4284,
    			8369
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4285,
    			8369
    		],
    		[
    			2,
    			7
    		]
    	],
    	[
    		[
    			4287,
    			8376
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4288,
    			8376
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			4290,
    			8371
    		],
    		[
    			1,
    			7
    		]
    	],
    	[
    		[
    			4291,
    			8378
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			4292,
    			8377
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			4292,
    			8371
    		],
    		[
    			5,
    			5
    		]
    	],
    	[
    		[
    			4297,
    			8376
    		],
    		[
    			1,
    			3
    		]
    	],
    	[
    		[
    			4298,
    			8379
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4298,
    			8378
    		],
    		[
    			3,
    			-4
    		]
    	],
    	[
    		[
    			4301,
    			8374
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4302,
    			8375
    		],
    		[
    			2,
    			6
    		]
    	],
    	[
    		[
    			4304,
    			8381
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4304,
    			8380
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			4304,
    			8375
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4307,
    			8376
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4311,
    			8377
    		],
    		[
    			4,
    			2
    		]
    	],
    	[
    		[
    			4315,
    			8379
    		],
    		[
    			2,
    			6
    		]
    	],
    	[
    		[
    			4317,
    			8385
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			4318,
    			8383
    		],
    		[
    			0,
    			-8
    		]
    	],
    	[
    		[
    			4318,
    			8375
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			4318,
    			8371
    		],
    		[
    			-4,
    			6
    		]
    	],
    	[
    		[
    			4314,
    			8377
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			4311,
    			8376
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			4312,
    			8369
    		],
    		[
    			-5,
    			6
    		]
    	],
    	[
    		[
    			4307,
    			8375
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			4305,
    			8374
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			4306,
    			8367
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4305,
    			8367
    		],
    		[
    			-2,
    			6
    		]
    	],
    	[
    		[
    			4303,
    			8373
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			4299,
    			8372
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			4297,
    			8371
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			4293,
    			8370
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			4294,
    			8363
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4293,
    			8363
    		],
    		[
    			-6,
    			5
    		]
    	],
    	[
    		[
    			4287,
    			8368
    		],
    		[
    			1,
    			-7
    		]
    	],
    	[
    		[
    			4288,
    			8361
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4287,
    			8361
    		],
    		[
    			-2,
    			7
    		]
    	],
    	[
    		[
    			4285,
    			8368
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			4282,
    			8367
    		],
    		[
    			-1,
    			-6
    		]
    	],
    	[
    		[
    			4281,
    			8361
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4281,
    			8360
    		],
    		[
    			-2,
    			6
    		]
    	],
    	[
    		[
    			4279,
    			8366
    		],
    		[
    			-4,
    			-2
    		]
    	],
    	[
    		[
    			4275,
    			8364
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			4275,
    			8359
    		],
    		[
    			-2,
    			5
    		]
    	],
    	[
    		[
    			4273,
    			8364
    		],
    		[
    			-4,
    			-2
    		]
    	],
    	[
    		[
    			4269,
    			8362
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			4265,
    			8361
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			4263,
    			8361
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			4261,
    			8360
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			4258,
    			8359
    		],
    		[
    			0,
    			-6
    		]
    	],
    	[
    		[
    			4258,
    			8353
    		],
    		[
    			-5,
    			-1
    		]
    	],
    	[
    		[
    			4253,
    			8352
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4252,
    			8352
    		],
    		[
    			-4,
    			-2
    		]
    	],
    	[
    		[
    			4248,
    			8350
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4247,
    			8350
    		],
    		[
    			-5,
    			4
    		]
    	],
    	[
    		[
    			4242,
    			8354
    		],
    		[
    			2,
    			-23
    		]
    	],
    	[
    		[
    			4244,
    			8331
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4245,
    			8332
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			4248,
    			8332
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			4248,
    			8338
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4249,
    			8338
    		],
    		[
    			2,
    			-5
    		]
    	],
    	[
    		[
    			4251,
    			8333
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			4254,
    			8333
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			4254,
    			8339
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4255,
    			8339
    		],
    		[
    			1,
    			-6
    		]
    	],
    	[
    		[
    			4256,
    			8333
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4259,
    			8334
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			4259,
    			8340
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4260,
    			8340
    		],
    		[
    			1,
    			-6
    		]
    	],
    	[
    		[
    			4261,
    			8334
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			4263,
    			8335
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4265,
    			8335
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4267,
    			8335
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4271,
    			8336
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4273,
    			8336
    		],
    		[
    			4,
    			7
    		]
    	],
    	[
    		[
    			4277,
    			8343
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4278,
    			8343
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			4280,
    			8337
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4283,
    			8338
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			4283,
    			8344
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4284,
    			8344
    		],
    		[
    			1,
    			-6
    		]
    	],
    	[
    		[
    			4285,
    			8338
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4289,
    			8339
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4291,
    			8339
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			4293,
    			8340
    		],
    		[
    			3,
    			4
    		]
    	],
    	[
    		[
    			4296,
    			8344
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			4296,
    			8342
    		],
    		[
    			2,
    			6
    		]
    	],
    	[
    		[
    			4298,
    			8348
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4299,
    			8348
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			4301,
    			8349
    		],
    		[
    			2,
    			-7
    		]
    	],
    	[
    		[
    			4303,
    			8342
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4305,
    			8342
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4308,
    			8343
    		],
    		[
    			-1,
    			7
    		]
    	],
    	[
    		[
    			4307,
    			8350
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4308,
    			8350
    		],
    		[
    			2,
    			-7
    		]
    	],
    	[
    		[
    			4310,
    			8343
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4314,
    			8344
    		],
    		[
    			1,
    			7
    		]
    	],
    	[
    		[
    			4315,
    			8351
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			4317,
    			8345
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4321,
    			8346
    		],
    		[
    			0,
    			6
    		]
    	],
    	[
    		[
    			4321,
    			8352
    		],
    		[
    			2,
    			-8
    		],
    		[
    			-30,
    			-9
    		]
    	],
    	[
    		[
    			4293,
    			8335
    		],
    		[
    			6,
    			0
    		]
    	],
    	[
    		[
    			4299,
    			8335
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4302,
    			8336
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4303,
    			8337
    		],
    		[
    			14,
    			3
    		]
    	],
    	[
    		[
    			4317,
    			8340
    		],
    		[
    			50,
    			7
    		],
    		[
    			175,
    			33
    		],
    		[
    			34,
    			10
    		],
    		[
    			43,
    			3
    		],
    		[
    			-2,
    			11
    		],
    		[
    			113,
    			21
    		],
    		[
    			0,
    			-5
    		],
    		[
    			-112,
    			-20
    		],
    		[
    			18,
    			-62
    		],
    		[
    			65,
    			11
    		],
    		[
    			21,
    			-26
    		],
    		[
    			12,
    			-86
    		],
    		[
    			21,
    			-10
    		],
    		[
    			45,
    			10
    		],
    		[
    			30,
    			44
    		],
    		[
    			-10,
    			73
    		],
    		[
    			-11,
    			116
    		],
    		[
    			13,
    			2
    		],
    		[
    			16,
    			-108
    		],
    		[
    			40,
    			8
    		],
    		[
    			-20,
    			144
    		],
    		[
    			23,
    			3
    		],
    		[
    			20,
    			-143
    		],
    		[
    			40,
    			8
    		],
    		[
    			-18,
    			144
    		],
    		[
    			30,
    			4
    		],
    		[
    			16,
    			-117
    		],
    		[
    			33,
    			12
    		],
    		[
    			60,
    			37
    		],
    		[
    			72,
    			-25
    		],
    		[
    			17,
    			5
    		],
    		[
    			-6,
    			76
    		],
    		[
    			11,
    			56
    		]
    	],
    	[
    		[
    			4956,
    			8051
    		],
    		[
    			44,
    			-315
    		],
    		[
    			282,
    			52
    		]
    	],
    	[
    		[
    			5282,
    			7788
    		],
    		[
    			11,
    			-78
    		]
    	],
    	[
    		[
    			5293,
    			7710
    		],
    		[
    			-666,
    			-123
    		]
    	],
    	[
    		[
    			4627,
    			7587
    		],
    		[
    			-32,
    			228
    		],
    		[
    			-2,
    			8
    		]
    	],
    	[
    		[
    			5140,
    			7440
    		],
    		[
    			187,
    			34
    		]
    	],
    	[
    		[
    			5327,
    			7474
    		],
    		[
    			13,
    			-79
    		]
    	],
    	[
    		[
    			5340,
    			7395
    		],
    		[
    			11,
    			-79
    		],
    		[
    			9,
    			-83
    		],
    		[
    			20,
    			-140
    		]
    	],
    	[
    		[
    			5380,
    			7093
    		],
    		[
    			11,
    			-75
    		]
    	],
    	[
    		[
    			5391,
    			7018
    		],
    		[
    			-187,
    			-34
    		],
    		[
    			-64,
    			456
    		]
    	],
    	[
    		[
    			4948,
    			7404
    		],
    		[
    			192,
    			36
    		]
    	],
    	[
    		[
    			5391,
    			7018
    		],
    		[
    			11,
    			-78
    		]
    	],
    	[
    		[
    			5402,
    			6940
    		],
    		[
    			-187,
    			-34
    		]
    	],
    	[
    		[
    			5215,
    			6906
    		],
    		[
    			-192,
    			-35
    		]
    	],
    	[
    		[
    			5023,
    			6871
    		],
    		[
    			-42,
    			301
    		]
    	],
    	[
    		[
    			4981,
    			7172
    		],
    		[
    			-33,
    			232
    		]
    	],
    	[
    		[
    			4211,
    			6317
    		],
    		[
    			228,
    			40
    		],
    		[
    			38,
    			23
    		],
    		[
    			29,
    			7
    		],
    		[
    			181,
    			33
    		],
    		[
    			6,
    			-3
    		]
    	],
    	[
    		[
    			4693,
    			6417
    		],
    		[
    			34,
    			-248
    		]
    	],
    	[
    		[
    			4727,
    			6169
    		],
    		[
    			33,
    			-236
    		]
    	],
    	[
    		[
    			4760,
    			5933
    		],
    		[
    			-192,
    			-35
    		],
    		[
    			-22,
    			157
    		],
    		[
    			-227,
    			-43
    		]
    	],
    	[
    		[
    			4319,
    			6012
    		],
    		[
    			-32,
    			231
    		],
    		[
    			-18,
    			18
    		],
    		[
    			-51,
    			28
    		],
    		[
    			-6,
    			21
    		]
    	],
    	[
    		[
    			4212,
    			6310
    		],
    		[
    			-1,
    			7
    		]
    	],
    	[
    		[
    			4911,
    			5557
    		],
    		[
    			288,
    			53
    		]
    	],
    	[
    		[
    			5199,
    			5610
    		],
    		[
    			280,
    			53
    		],
    		[
    			102,
    			18
    		]
    	],
    	[
    		[
    			5582,
    			5662
    		],
    		[
    			-54,
    			-72
    		],
    		[
    			-27,
    			-24
    		],
    		[
    			-86,
    			-98
    		],
    		[
    			-25,
    			-35
    		]
    	],
    	[
    		[
    			5390,
    			5433
    		],
    		[
    			-60,
    			-57
    		],
    		[
    			-75,
    			-88
    		]
    	],
    	[
    		[
    			3885,
    			5126
    		],
    		[
    			288,
    			54
    		],
    		[
    			40,
    			13
    		]
    	],
    	[
    		[
    			4213,
    			5193
    		],
    		[
    			21,
    			-14
    		],
    		[
    			-55,
    			-46
    		],
    		[
    			-30,
    			-119
    		],
    		[
    			6,
    			-39
    		],
    		[
    			14,
    			-32
    		],
    		[
    			25,
    			-24
    		],
    		[
    			5,
    			-22
    		],
    		[
    			25,
    			-19
    		]
    	],
    	[
    		[
    			4224,
    			4878
    		],
    		[
    			-84,
    			-76
    		],
    		[
    			1,
    			-28
    		],
    		[
    			-17,
    			-32
    		],
    		[
    			-22,
    			-83
    		],
    		[
    			-60,
    			-83
    		],
    		[
    			-14,
    			-9
    		],
    		[
    			-26,
    			-1
    		],
    		[
    			0,
    			-35
    		]
    	],
    	[
    		[
    			6423,
    			6193
    		],
    		[
    			130,
    			148
    		]
    	],
    	[
    		[
    			6864,
    			6282
    		],
    		[
    			-260,
    			-298
    		]
    	],
    	[
    		[
    			6604,
    			5984
    		],
    		[
    			-181,
    			209
    		]
    	],
    	[
    		[
    			5802,
    			5484
    		],
    		[
    			141,
    			159
    		],
    		[
    			480,
    			550
    		]
    	],
    	[
    		[
    			6604,
    			5984
    		],
    		[
    			-622,
    			-709
    		]
    	],
    	[
    		[
    			5982,
    			5275
    		],
    		[
    			-180,
    			209
    		]
    	],
    	[
    		[
    			6414,
    			4769
    		],
    		[
    			35,
    			3
    		]
    	],
    	[
    		[
    			6787,
    			4801
    		],
    		[
    			29,
    			-431
    		]
    	],
    	[
    		[
    			6496,
    			4126
    		],
    		[
    			-28,
    			44
    		],
    		[
    			-81,
    			85
    		],
    		[
    			-41,
    			77
    		],
    		[
    			-14,
    			68
    		],
    		[
    			0,
    			36
    		],
    		[
    			12,
    			60
    		],
    		[
    			37,
    			87
    		],
    		[
    			16,
    			46
    		],
    		[
    			16,
    			74
    		],
    		[
    			1,
    			66
    		]
    	],
    	[
    		[
    			5444,
    			1998
    		],
    		[
    			78,
    			17
    		],
    		[
    			52,
    			5
    		],
    		[
    			121,
    			-1
    		],
    		[
    			43,
    			-3
    		],
    		[
    			42,
    			5
    		],
    		[
    			91,
    			29
    		],
    		[
    			182,
    			133
    		],
    		[
    			86,
    			70
    		]
    	],
    	[
    		[
    			6231,
    			2488
    		],
    		[
    			80,
    			37
    		]
    	],
    	[
    		[
    			6311,
    			2525
    		],
    		[
    			-8,
    			-14
    		],
    		[
    			12,
    			-105
    		],
    		[
    			10,
    			-62
    		],
    		[
    			19,
    			-50
    		]
    	],
    	[
    		[
    			6344,
    			2294
    		],
    		[
    			-49,
    			-22
    		],
    		[
    			89,
    			-220
    		],
    		[
    			-170,
    			-75
    		],
    		[
    			56,
    			-194
    		],
    		[
    			-173,
    			-65
    		]
    	],
    	[
    		[
    			6344,
    			2294
    		],
    		[
    			46,
    			-86
    		],
    		[
    			24,
    			-49
    		],
    		[
    			25,
    			-64
    		],
    		[
    			41,
    			-113
    		],
    		[
    			33,
    			-81
    		],
    		[
    			38,
    			-109
    		],
    		[
    			37,
    			-133
    		]
    	],
    	[
    		[
    			6588,
    			1659
    		],
    		[
    			37,
    			-192
    		],
    		[
    			17,
    			-78
    		],
    		[
    			24,
    			-82
    		]
    	],
    	[
    		[
    			3078,
    			1449
    		],
    		[
    			54,
    			-25
    		],
    		[
    			279,
    			-84
    		],
    		[
    			137,
    			-43
    		],
    		[
    			2,
    			-8
    		],
    		[
    			59,
    			-17
    		],
    		[
    			45,
    			-2
    		]
    	],
    	[
    		[
    			3654,
    			1270
    		],
    		[
    			44,
    			-12
    		],
    		[
    			89,
    			1
    		],
    		[
    			30,
    			-3
    		]
    	],
    	[
    		[
    			3817,
    			1256
    		],
    		[
    			-30,
    			-71
    		],
    		[
    			-92,
    			-210
    		],
    		[
    			-55,
    			30
    		],
    		[
    			-387,
    			-1
    		],
    		[
    			1,
    			-152
    		]
    	],
    	[
    		[
    			3254,
    			852
    		],
    		[
    			-178,
    			-1
    		]
    	],
    	[
    		[
    			3076,
    			851
    		],
    		[
    			-2,
    			298
    		]
    	],
    	[
    		[
    			3074,
    			1149
    		],
    		[
    			0,
    			263
    		],
    		[
    			4,
    			37
    		]
    	],
    	[
    		[
    			3817,
    			1256
    		],
    		[
    			98,
    			-1
    		]
    	],
    	[
    		[
    			3874,
    			868
    		],
    		[
    			-18,
    			-21
    		],
    		[
    			-40,
    			-89
    		],
    		[
    			-47,
    			-80
    		],
    		[
    			-215,
    			166
    		],
    		[
    			-8,
    			9
    		],
    		[
    			-292,
    			-1
    		]
    	],
    	[
    		[
    			1635,
    			4805
    		],
    		[
    			125,
    			9
    		]
    	],
    	[
    		[
    			1760,
    			4814
    		],
    		[
    			23,
    			-478
    		],
    		[
    			438,
    			28
    		]
    	],
    	[
    		[
    			2237,
    			4050
    		],
    		[
    			-564,
    			-36
    		]
    	],
    	[
    		[
    			1673,
    			4014
    		],
    		[
    			-38,
    			791
    		]
    	],
    	[
    		[
    			1704,
    			3384
    		],
    		[
    			376,
    			24
    		],
    		[
    			-8,
    			157
    		],
    		[
    			187,
    			12
    		]
    	],
    	[
    		[
    			2288,
    			2947
    		],
    		[
    			-561,
    			-35
    		]
    	],
    	[
    		[
    			1727,
    			2912
    		],
    		[
    			-23,
    			472
    		]
    	],
    	[
    		[
    			1704,
    			3384
    		],
    		[
    			-8,
    			157
    		]
    	],
    	[
    		[
    			1696,
    			3541
    		],
    		[
    			-23,
    			473
    		]
    	],
    	[
    		[
    			1160,
    			3507
    		],
    		[
    			536,
    			34
    		]
    	],
    	[
    		[
    			1727,
    			2912
    		],
    		[
    			-536,
    			-35
    		]
    	],
    	[
    		[
    			1191,
    			2877
    		],
    		[
    			-9,
    			167
    		],
    		[
    			-22,
    			463
    		]
    	],
    	[
    		[
    			1739,
    			881
    		],
    		[
    			116,
    			-4
    		],
    		[
    			-4,
    			-79
    		],
    		[
    			146,
    			-7
    		],
    		[
    			43,
    			-47
    		],
    		[
    			76,
    			81
    		],
    		[
    			33,
    			-36
    		],
    		[
    			22,
    			-6
    		],
    		[
    			29,
    			25
    		],
    		[
    			74,
    			-66
    		],
    		[
    			9,
    			-3
    		],
    		[
    			33,
    			45
    		],
    		[
    			51,
    			7
    		],
    		[
    			-13,
    			109
    		],
    		[
    			-16,
    			20
    		],
    		[
    			14,
    			12
    		]
    	],
    	[
    		[
    			2352,
    			932
    		],
    		[
    			104,
    			-157
    		],
    		[
    			10,
    			-6
    		]
    	],
    	[
    		[
    			2466,
    			769
    		],
    		[
    			3,
    			-28
    		],
    		[
    			46,
    			-191
    		],
    		[
    			22,
    			-103
    		],
    		[
    			6,
    			-53
    		]
    	],
    	[
    		[
    			1752,
    			1342
    		],
    		[
    			73,
    			-84
    		],
    		[
    			61,
    			-81
    		],
    		[
    			29,
    			-19
    		],
    		[
    			1,
    			-14
    		],
    		[
    			134,
    			-167
    		],
    		[
    			10,
    			-4
    		],
    		[
    			35,
    			41
    		],
    		[
    			3,
    			59
    		],
    		[
    			170,
    			-8
    		],
    		[
    			42,
    			14
    		]
    	],
    	[
    		[
    			2310,
    			1079
    		],
    		[
    			-1,
    			-54
    		],
    		[
    			12,
    			-43
    		],
    		[
    			31,
    			-50
    		]
    	],
    	[
    		[
    			1800,
    			6555
    		],
    		[
    			314,
    			20
    		]
    	],
    	[
    		[
    			2114,
    			6575
    		],
    		[
    			23,
    			-471
    		]
    	],
    	[
    		[
    			2137,
    			6104
    		],
    		[
    			-63,
    			-4
    		]
    	],
    	[
    		[
    			2074,
    			6100
    		],
    		[
    			-125,
    			-7
    		],
    		[
    			-125,
    			-9
    		]
    	],
    	[
    		[
    			1824,
    			6084
    		],
    		[
    			-24,
    			471
    		]
    	],
    	[
    		[
    			2114,
    			6575
    		],
    		[
    			358,
    			24
    		]
    	],
    	[
    		[
    			2472,
    			6599
    		],
    		[
    			-1,
    			-69
    		],
    		[
    			20,
    			-394
    		],
    		[
    			-1,
    			-7
    		]
    	],
    	[
    		[
    			2490,
    			6129
    		],
    		[
    			-100,
    			-8
    		],
    		[
    			-253,
    			-17
    		]
    	],
    	[
    		[
    			1261,
    			6045
    		],
    		[
    			9,
    			2
    		],
    		[
    			242,
    			17
    		]
    	],
    	[
    		[
    			1512,
    			6064
    		],
    		[
    			16,
    			-326
    		]
    	],
    	[
    		[
    			1528,
    			5738
    		],
    		[
    			16,
    			-316
    		]
    	],
    	[
    		[
    			1544,
    			5422
    		],
    		[
    			-376,
    			-24
    		]
    	],
    	[
    		[
    			1168,
    			5398
    		],
    		[
    			-16,
    			315
    		],
    		[
    			-125,
    			-9
    		],
    		[
    			-8,
    			158
    		],
    		[
    			250,
    			16
    		],
    		[
    			-8,
    			167
    		]
    	],
    	[
    		[
    			6219,
    			7476
    		],
    		[
    			170,
    			31
    		]
    	],
    	[
    		[
    			6389,
    			7507
    		],
    		[
    			203,
    			37
    		]
    	],
    	[
    		[
    			6592,
    			7544
    		],
    		[
    			69,
    			12
    		],
    		[
    			22,
    			-150
    		],
    		[
    			20,
    			-147
    		]
    	],
    	[
    		[
    			6703,
    			7259
    		],
    		[
    			-261,
    			-48
    		]
    	],
    	[
    		[
    			6442,
    			7211
    		],
    		[
    			-11,
    			75
    		],
    		[
    			-181,
    			-33
    		]
    	],
    	[
    		[
    			6250,
    			7253
    		],
    		[
    			-31,
    			223
    		]
    	],
    	[
    		[
    			7571,
    			2710
    		],
    		[
    			-32,
    			-53
    		],
    		[
    			-165,
    			-264
    		],
    		[
    			7,
    			-1
    		],
    		[
    			80,
    			-65
    		],
    		[
    			17,
    			-24
    		],
    		[
    			-31,
    			-57
    		],
    		[
    			-95,
    			-154
    		]
    	],
    	[
    		[
    			7352,
    			2092
    		],
    		[
    			-118,
    			97
    		],
    		[
    			-33,
    			-133
    		]
    	],
    	[
    		[
    			7201,
    			2056
    		],
    		[
    			-134,
    			110
    		],
    		[
    			66,
    			105
    		],
    		[
    			-218,
    			179
    		]
    	],
    	[
    		[
    			6915,
    			2450
    		],
    		[
    			33,
    			53
    		]
    	],
    	[
    		[
    			102,
    			5286
    		],
    		[
    			118,
    			48
    		],
    		[
    			72,
    			6
    		],
    		[
    			688,
    			45
    		]
    	],
    	[
    		[
    			980,
    			5385
    		],
    		[
    			188,
    			13
    		]
    	],
    	[
    		[
    			1544,
    			5422
    		],
    		[
    			562,
    			38
    		]
    	],
    	[
    		[
    			2106,
    			5460
    		],
    		[
    			417,
    			27
    		]
    	],
    	[
    		[
    			2523,
    			5487
    		],
    		[
    			372,
    			24
    		],
    		[
    			93,
    			17
    		]
    	],
    	[
    		[
    			2988,
    			5528
    		],
    		[
    			314,
    			58
    		]
    	],
    	[
    		[
    			3302,
    			5586
    		],
    		[
    			215,
    			37
    		]
    	],
    	[
    		[
    			3517,
    			5623
    		],
    		[
    			3,
    			-9
    		],
    		[
    			32,
    			-229
    		],
    		[
    			8,
    			6
    		],
    		[
    			88,
    			16
    		],
    		[
    			12,
    			-1
    		],
    		[
    			661,
    			123
    		]
    	],
    	[
    		[
    			4321,
    			5529
    		],
    		[
    			11,
    			-78
    		]
    	],
    	[
    		[
    			4332,
    			5451
    		],
    		[
    			-651,
    			-119
    		],
    		[
    			-111,
    			-24
    		],
    		[
    			-7,
    			3
    		],
    		[
    			32,
    			-237
    		]
    	],
    	[
    		[
    			2956,
    			4881
    		],
    		[
    			-63,
    			-1
    		],
    		[
    			-1,
    			6
    		],
    		[
    			-312,
    			-20
    		]
    	],
    	[
    		[
    			2198,
    			4841
    		],
    		[
    			-132,
    			-9
    		],
    		[
    			-306,
    			-18
    		]
    	],
    	[
    		[
    			1635,
    			4805
    		],
    		[
    			-305,
    			-20
    		],
    		[
    			-231,
    			-12
    		]
    	],
    	[
    		[
    			1099,
    			4773
    		],
    		[
    			-97,
    			-8
    		],
    		[
    			-306,
    			-20
    		]
    	],
    	[
    		[
    			696,
    			4745
    		],
    		[
    			-313,
    			-20
    		],
    		[
    			-89,
    			-2
    		]
    	],
    	[
    		[
    			294,
    			4723
    		],
    		[
    			-33,
    			-2
    		],
    		[
    			-113,
    			-40
    		]
    	],
    	[
    		[
    			148,
    			4681
    		],
    		[
    			-24,
    			65
    		],
    		[
    			-1,
    			32
    		],
    		[
    			9,
    			75
    		],
    		[
    			-14,
    			75
    		],
    		[
    			-1,
    			38
    		],
    		[
    			-10,
    			10
    		],
    		[
    			-3,
    			36
    		],
    		[
    			4,
    			32
    		],
    		[
    			-6,
    			181
    		],
    		[
    			0,
    			61
    		]
    	],
    	[
    		[
    			5868,
    			6459
    		],
    		[
    			193,
    			36
    		]
    	],
    	[
    		[
    			6061,
    			6495
    		],
    		[
    			22,
    			-158
    		],
    		[
    			-193,
    			-35
    		]
    	],
    	[
    		[
    			5890,
    			6302
    		],
    		[
    			-22,
    			157
    		]
    	],
    	[
    		[
    			1236,
    			6709
    		],
    		[
    			14,
    			-348
    		]
    	],
    	[
    		[
    			1250,
    			6361
    		],
    		[
    			6,
    			-157
    		],
    		[
    			-3,
    			0
    		]
    	],
    	[
    		[
    			1253,
    			6204
    		],
    		[
    			-313,
    			-22
    		]
    	],
    	[
    		[
    			940,
    			6182
    		],
    		[
    			-431,
    			-29
    		],
    		[
    			-33,
    			-22
    		],
    		[
    			-183,
    			-12
    		]
    	],
    	[
    		[
    			293,
    			6119
    		],
    		[
    			-53,
    			121
    		],
    		[
    			33,
    			-2
    		],
    		[
    			28,
    			13
    		],
    		[
    			48,
    			-15
    		],
    		[
    			34,
    			22
    		],
    		[
    			50,
    			-7
    		],
    		[
    			-134,
    			155
    		],
    		[
    			-4,
    			65
    		]
    	],
    	[
    		[
    			295,
    			6471
    		],
    		[
    			43,
    			67
    		],
    		[
    			26,
    			13
    		],
    		[
    			57,
    			64
    		],
    		[
    			9,
    			29
    		],
    		[
    			17,
    			16
    		],
    		[
    			16,
    			35
    		],
    		[
    			26,
    			2
    		],
    		[
    			20,
    			31
    		],
    		[
    			5,
    			28
    		],
    		[
    			52,
    			7
    		],
    		[
    			40,
    			-16
    		],
    		[
    			27,
    			5
    		],
    		[
    			42,
    			-9
    		],
    		[
    			20,
    			11
    		],
    		[
    			17,
    			-9
    		],
    		[
    			103,
    			26
    		],
    		[
    			57,
    			8
    		],
    		[
    			23,
    			22
    		],
    		[
    			8,
    			-21
    		],
    		[
    			23,
    			-10
    		],
    		[
    			25,
    			-1
    		],
    		[
    			28,
    			-37
    		],
    		[
    			30,
    			5
    		],
    		[
    			10,
    			-30
    		],
    		[
    			53,
    			-26
    		],
    		[
    			54,
    			23
    		],
    		[
    			20,
    			15
    		],
    		[
    			28,
    			8
    		],
    		[
    			37,
    			-3
    		],
    		[
    			25,
    			-15
    		]
    	],
    	[
    		[
    			7789,
    			2531
    		],
    		[
    			-15,
    			-33
    		],
    		[
    			5,
    			-40
    		],
    		[
    			-23,
    			-13
    		],
    		[
    			-44,
    			15
    		],
    		[
    			-31,
    			23
    		],
    		[
    			-38,
    			-3
    		],
    		[
    			21,
    			-59
    		],
    		[
    			18,
    			-99
    		],
    		[
    			27,
    			-95
    		],
    		[
    			33,
    			-68
    		],
    		[
    			29,
    			-44
    		],
    		[
    			32,
    			-32
    		],
    		[
    			40,
    			-25
    		],
    		[
    			26,
    			-8
    		],
    		[
    			0,
    			20
    		],
    		[
    			-65,
    			68
    		],
    		[
    			-11,
    			21
    		],
    		[
    			12,
    			27
    		],
    		[
    			63,
    			-50
    		],
    		[
    			16,
    			-19
    		],
    		[
    			34,
    			-116
    		],
    		[
    			-8,
    			-52
    		],
    		[
    			-17,
    			-36
    		],
    		[
    			-32,
    			-23
    		],
    		[
    			-19,
    			-2
    		],
    		[
    			-66,
    			10
    		],
    		[
    			-29,
    			0
    		],
    		[
    			-36,
    			-23
    		],
    		[
    			-32,
    			-51
    		]
    	],
    	[
    		[
    			7679,
    			1824
    		],
    		[
    			-327,
    			268
    		]
    	],
    	[
    		[
    			7138,
    			1785
    		],
    		[
    			27,
    			110
    		],
    		[
    			36,
    			161
    		]
    	],
    	[
    		[
    			7679,
    			1824
    		],
    		[
    			218,
    			-179
    		]
    	],
    	[
    		[
    			7897,
    			1645
    		],
    		[
    			109,
    			-90
    		],
    		[
    			-135,
    			-219
    		],
    		[
    			-75,
    			-95
    		],
    		[
    			-44,
    			-49
    		]
    	],
    	[
    		[
    			7752,
    			1192
    		],
    		[
    			-8,
    			3
    		]
    	],
    	[
    		[
    			7744,
    			1195
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7741,
    			1197
    		],
    		[
    			-3,
    			3
    		]
    	],
    	[
    		[
    			7738,
    			1200
    		],
    		[
    			-2,
    			2
    		]
    	],
    	[
    		[
    			7736,
    			1202
    		],
    		[
    			-2,
    			1
    		]
    	],
    	[
    		[
    			7734,
    			1203
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			7732,
    			1203
    		],
    		[
    			-3,
    			3
    		]
    	],
    	[
    		[
    			7729,
    			1206
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7728,
    			1208
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			7728,
    			1210
    		],
    		[
    			-2,
    			2
    		]
    	],
    	[
    		[
    			7726,
    			1212
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7725,
    			1213
    		],
    		[
    			-7,
    			6
    		]
    	],
    	[
    		[
    			7718,
    			1219
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7714,
    			1222
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7713,
    			1223
    		],
    		[
    			-2,
    			1
    		]
    	],
    	[
    		[
    			7711,
    			1224
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			7709,
    			1224
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7708,
    			1226
    		],
    		[
    			-3,
    			4
    		]
    	],
    	[
    		[
    			7705,
    			1230
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7702,
    			1232
    		],
    		[
    			-4,
    			2
    		]
    	],
    	[
    		[
    			7698,
    			1234
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7698,
    			1235
    		],
    		[
    			-7,
    			6
    		]
    	],
    	[
    		[
    			7691,
    			1241
    		],
    		[
    			-10,
    			8
    		]
    	],
    	[
    		[
    			7681,
    			1249
    		],
    		[
    			-12,
    			8
    		]
    	],
    	[
    		[
    			7669,
    			1257
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7667,
    			1260
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7666,
    			1260
    		],
    		[
    			-1,
    			4
    		]
    	],
    	[
    		[
    			7665,
    			1264
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			7665,
    			1266
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7664,
    			1266
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7663,
    			1268
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7662,
    			1269
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7661,
    			1270
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7661,
    			1271
    		],
    		[
    			-4,
    			0
    		]
    	],
    	[
    		[
    			7657,
    			1271
    		],
    		[
    			-3,
    			7
    		]
    	],
    	[
    		[
    			7654,
    			1278
    		],
    		[
    			-1,
    			6
    		]
    	],
    	[
    		[
    			7653,
    			1284
    		],
    		[
    			-1,
    			6
    		]
    	],
    	[
    		[
    			7652,
    			1290
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7652,
    			1291
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7651,
    			1292
    		],
    		[
    			-12,
    			3
    		]
    	],
    	[
    		[
    			7639,
    			1295
    		],
    		[
    			-4,
    			0
    		]
    	],
    	[
    		[
    			7635,
    			1295
    		],
    		[
    			-6,
    			3
    		]
    	],
    	[
    		[
    			7629,
    			1298
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7625,
    			1301
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7624,
    			1302
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7622,
    			1305
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7621,
    			1305
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7620,
    			1307
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7617,
    			1309
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7616,
    			1309
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7614,
    			1312
    		],
    		[
    			-3,
    			4
    		]
    	],
    	[
    		[
    			7611,
    			1316
    		],
    		[
    			-3,
    			4
    		]
    	],
    	[
    		[
    			7608,
    			1320
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7604,
    			1323
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7602,
    			1326
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7600,
    			1329
    		],
    		[
    			-2,
    			2
    		]
    	],
    	[
    		[
    			7598,
    			1331
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7597,
    			1331
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7596,
    			1331
    		],
    		[
    			-2,
    			1
    		]
    	],
    	[
    		[
    			7594,
    			1332
    		],
    		[
    			-4,
    			7
    		]
    	],
    	[
    		[
    			7590,
    			1339
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7589,
    			1341
    		],
    		[
    			-2,
    			4
    		]
    	],
    	[
    		[
    			7587,
    			1345
    		],
    		[
    			-1,
    			3
    		]
    	],
    	[
    		[
    			7586,
    			1348
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7585,
    			1349
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			7583,
    			1349
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			7579,
    			1348
    		],
    		[
    			-3,
    			0
    		]
    	],
    	[
    		[
    			7576,
    			1348
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7575,
    			1348
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7572,
    			1350
    		],
    		[
    			-4,
    			2
    		]
    	],
    	[
    		[
    			7568,
    			1352
    		],
    		[
    			-7,
    			0
    		]
    	],
    	[
    		[
    			7561,
    			1352
    		],
    		[
    			-7,
    			-1
    		]
    	],
    	[
    		[
    			7554,
    			1351
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7553,
    			1351
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7552,
    			1352
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7551,
    			1352
    		],
    		[
    			-3,
    			4
    		]
    	],
    	[
    		[
    			7548,
    			1356
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7548,
    			1357
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7544,
    			1360
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7543,
    			1361
    		],
    		[
    			-9,
    			6
    		]
    	],
    	[
    		[
    			7534,
    			1367
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7531,
    			1369
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7531,
    			1370
    		],
    		[
    			-3,
    			1
    		]
    	],
    	[
    		[
    			7528,
    			1371
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7524,
    			1374
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7521,
    			1376
    		],
    		[
    			-7,
    			3
    		]
    	],
    	[
    		[
    			7514,
    			1379
    		],
    		[
    			-2,
    			1
    		]
    	],
    	[
    		[
    			7512,
    			1380
    		],
    		[
    			-5,
    			0
    		]
    	],
    	[
    		[
    			7507,
    			1380
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7506,
    			1380
    		],
    		[
    			-5,
    			-1
    		]
    	],
    	[
    		[
    			7501,
    			1379
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			7500,
    			1378
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7499,
    			1378
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			7497,
    			1377
    		],
    		[
    			-5,
    			-2
    		]
    	],
    	[
    		[
    			7492,
    			1375
    		],
    		[
    			-4,
    			-3
    		]
    	],
    	[
    		[
    			7488,
    			1372
    		],
    		[
    			-3,
    			-3
    		]
    	],
    	[
    		[
    			7485,
    			1369
    		],
    		[
    			-3,
    			-4
    		]
    	],
    	[
    		[
    			7482,
    			1365
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			7478,
    			1364
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7477,
    			1364
    		],
    		[
    			-3,
    			-4
    		]
    	],
    	[
    		[
    			7474,
    			1360
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7475,
    			1359
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7475,
    			1357
    		],
    		[
    			1,
    			-6
    		]
    	],
    	[
    		[
    			7476,
    			1351
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7479,
    			1350
    		],
    		[
    			6,
    			-5
    		]
    	],
    	[
    		[
    			7485,
    			1345
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7486,
    			1345
    		],
    		[
    			8,
    			-7
    		]
    	],
    	[
    		[
    			7494,
    			1338
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7495,
    			1337
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7496,
    			1336
    		],
    		[
    			12,
    			-10
    		]
    	],
    	[
    		[
    			7508,
    			1326
    		],
    		[
    			18,
    			-15
    		]
    	],
    	[
    		[
    			7526,
    			1311
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			7531,
    			1308
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			7536,
    			1305
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7537,
    			1302
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7539,
    			1301
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			7543,
    			1299
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7545,
    			1298
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			7546,
    			1296
    		],
    		[
    			7,
    			-7
    		]
    	],
    	[
    		[
    			7553,
    			1289
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7554,
    			1289
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			7558,
    			1286
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7561,
    			1285
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7562,
    			1285
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7564,
    			1284
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			7567,
    			1281
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7568,
    			1281
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7568,
    			1280
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7571,
    			1279
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			7576,
    			1275
    		],
    		[
    			6,
    			-2
    		]
    	],
    	[
    		[
    			7582,
    			1273
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7585,
    			1272
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7586,
    			1272
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			7590,
    			1269
    		],
    		[
    			7,
    			-6
    		]
    	],
    	[
    		[
    			7597,
    			1263
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			7599,
    			1261
    		],
    		[
    			8,
    			-7
    		]
    	],
    	[
    		[
    			7607,
    			1254
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7609,
    			1251
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7611,
    			1250
    		],
    		[
    			5,
    			-6
    		]
    	],
    	[
    		[
    			7616,
    			1244
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7616,
    			1243
    		],
    		[
    			-41,
    			19
    		],
    		[
    			-54,
    			42
    		],
    		[
    			-105,
    			97
    		],
    		[
    			-312,
    			256
    		]
    	],
    	[
    		[
    			7104,
    			1657
    		],
    		[
    			19,
    			65
    		],
    		[
    			15,
    			63
    		]
    	],
    	[
    		[
    			6719,
    			1870
    		],
    		[
    			367,
    			-75
    		],
    		[
    			52,
    			-10
    		]
    	],
    	[
    		[
    			7104,
    			1657
    		],
    		[
    			-19,
    			-65
    		],
    		[
    			-44,
    			-134
    		],
    		[
    			-76,
    			-239
    		],
    		[
    			-39,
    			-132
    		],
    		[
    			-21,
    			-63
    		]
    	],
    	[
    		[
    			6588,
    			1659
    		],
    		[
    			131,
    			211
    		]
    	],
    	[
    		[
    			5753,
    			3869
    		],
    		[
    			255,
    			22
    		]
    	],
    	[
    		[
    			6008,
    			3891
    		],
    		[
    			32,
    			-497
    		]
    	],
    	[
    		[
    			5784,
    			3388
    		],
    		[
    			-31,
    			481
    		]
    	],
    	[
    		[
    			5735,
    			4139
    		],
    		[
    			523,
    			45
    		]
    	],
    	[
    		[
    			6258,
    			4184
    		],
    		[
    			18,
    			-270
    		]
    	],
    	[
    		[
    			6276,
    			3914
    		],
    		[
    			-105,
    			-9
    		]
    	],
    	[
    		[
    			6171,
    			3905
    		],
    		[
    			-163,
    			-14
    		]
    	],
    	[
    		[
    			5753,
    			3869
    		],
    		[
    			-9,
    			135
    		]
    	],
    	[
    		[
    			5744,
    			4004
    		],
    		[
    			-9,
    			135
    		]
    	],
    	[
    		[
    			1528,
    			5738
    		],
    		[
    			563,
    			37
    		]
    	],
    	[
    		[
    			2091,
    			5775
    		],
    		[
    			15,
    			-315
    		]
    	],
    	[
    		[
    			696,
    			4745
    		],
    		[
    			23,
    			-477
    		]
    	],
    	[
    		[
    			719,
    			4268
    		],
    		[
    			-381,
    			-24
    		],
    		[
    			-3,
    			6
    		],
    		[
    			-41,
    			473
    		]
    	],
    	[
    		[
    			4656,
    			4603
    		],
    		[
    			14,
    			-14
    		],
    		[
    			515,
    			45
    		]
    	],
    	[
    		[
    			5185,
    			4634
    		],
    		[
    			35,
    			-540
    		]
    	],
    	[
    		[
    			5220,
    			4094
    		],
    		[
    			-527,
    			-46
    		]
    	],
    	[
    		[
    			3237,
    			6886
    		],
    		[
    			26,
    			0
    		],
    		[
    			561,
    			162
    		],
    		[
    			4,
    			-12
    		],
    		[
    			179,
    			33
    		]
    	],
    	[
    		[
    			4007,
    			7069
    		],
    		[
    			11,
    			-74
    		]
    	],
    	[
    		[
    			4018,
    			6995
    		],
    		[
    			41,
    			-301
    		]
    	],
    	[
    		[
    			4059,
    			6694
    		],
    		[
    			-804,
    			-148
    		]
    	],
    	[
    		[
    			3255,
    			6546
    		],
    		[
    			-18,
    			340
    		]
    	],
    	[
    		[
    			5042,
    			2275
    		],
    		[
    			41,
    			38
    		],
    		[
    			67,
    			71
    		]
    	],
    	[
    		[
    			5150,
    			2384
    		],
    		[
    			30,
    			-25
    		],
    		[
    			95,
    			-11
    		],
    		[
    			7,
    			9
    		],
    		[
    			77,
    			-11
    		],
    		[
    			32,
    			-63
    		],
    		[
    			139,
    			-10
    		],
    		[
    			4,
    			60
    		],
    		[
    			198,
    			-14
    		]
    	],
    	[
    		[
    			7071,
    			4826
    		],
    		[
    			7,
    			-109
    		],
    		[
    			59,
    			6
    		],
    		[
    			7,
    			-55
    		],
    		[
    			16,
    			-200
    		],
    		[
    			-10,
    			-69
    		]
    	],
    	[
    		[
    			5422,
    			6781
    		],
    		[
    			391,
    			72
    		]
    	],
    	[
    		[
    			5813,
    			6853
    		],
    		[
    			22,
    			-158
    		]
    	],
    	[
    		[
    			5458,
    			6626
    		],
    		[
    			-13,
    			-2
    		],
    		[
    			-23,
    			157
    		]
    	],
    	[
    		[
    			5072,
    			1305
    		],
    		[
    			-45,
    			31
    		],
    		[
    			-207,
    			-394
    		]
    	],
    	[
    		[
    			5264,
    			1185
    		],
    		[
    			25,
    			-19
    		],
    		[
    			-66,
    			-145
    		],
    		[
    			-20,
    			-78
    		],
    		[
    			-33,
    			-63
    		],
    		[
    			14,
    			-11
    		],
    		[
    			-23,
    			-100
    		],
    		[
    			-9,
    			-17
    		],
    		[
    			-29,
    			-109
    		]
    	],
    	[
    		[
    			5989,
    			17
    		],
    		[
    			-450,
    			0
    		]
    	],
    	[
    		[
    			5539,
    			17
    		],
    		[
    			42,
    			136
    		],
    		[
    			97,
    			-39
    		],
    		[
    			14,
    			53
    		],
    		[
    			33,
    			-14
    		],
    		[
    			52,
    			166
    		]
    	],
    	[
    		[
    			5150,
    			2384
    		],
    		[
    			66,
    			79
    		],
    		[
    			30,
    			45
    		],
    		[
    			21,
    			49
    		],
    		[
    			14,
    			48
    		],
    		[
    			13,
    			74
    		]
    	],
    	[
    		[
    			4727,
    			6169
    		],
    		[
    			576,
    			106
    		]
    	],
    	[
    		[
    			5303,
    			6275
    		],
    		[
    			33,
    			-236
    		]
    	],
    	[
    		[
    			5336,
    			6039
    		],
    		[
    			11,
    			-79
    		],
    		[
    			-192,
    			-35
    		]
    	],
    	[
    		[
    			5155,
    			5925
    		],
    		[
    			-384,
    			-71
    		]
    	],
    	[
    		[
    			4771,
    			5854
    		],
    		[
    			-11,
    			79
    		]
    	],
    	[
    		[
    			5728,
    			7467
    		],
    		[
    			32,
    			-228
    		]
    	],
    	[
    		[
    			5760,
    			7239
    		],
    		[
    			10,
    			-74
    		]
    	],
    	[
    		[
    			5770,
    			7165
    		],
    		[
    			-390,
    			-72
    		]
    	],
    	[
    		[
    			5340,
    			7395
    		],
    		[
    			152,
    			24
    		],
    		[
    			55,
    			17
    		],
    		[
    			69,
    			14
    		],
    		[
    			112,
    			17
    		]
    	],
    	[
    		[
    			1099,
    			4773
    		],
    		[
    			15,
    			-313
    		],
    		[
    			16,
    			-324
    		],
    		[
    			7,
    			-157
    		]
    	],
    	[
    		[
    			1137,
    			3979
    		],
    		[
    			16,
    			-315
    		]
    	],
    	[
    		[
    			1153,
    			3664
    		],
    		[
    			-278,
    			-17
    		],
    		[
    			8,
    			-158
    		],
    		[
    			-126,
    			-8
    		]
    	],
    	[
    		[
    			757,
    			3481
    		],
    		[
    			-38,
    			787
    		]
    	],
    	[
    		[
    			5539,
    			17
    		],
    		[
    			-216,
    			1
    		]
    	],
    	[
    		[
    			5282,
    			167
    		],
    		[
    			17,
    			13
    		],
    		[
    			47,
    			3
    		],
    		[
    			33,
    			18
    		],
    		[
    			23,
    			39
    		],
    		[
    			26,
    			88
    		],
    		[
    			29,
    			15
    		],
    		[
    			14,
    			94
    		],
    		[
    			19,
    			39
    		],
    		[
    			34,
    			17
    		],
    		[
    			274,
    			-105
    		]
    	],
    	[
    		[
    			2956,
    			6158
    		],
    		[
    			316,
    			20
    		]
    	],
    	[
    		[
    			3272,
    			6178
    		],
    		[
    			30,
    			-592
    		]
    	],
    	[
    		[
    			2988,
    			5528
    		],
    		[
    			-32,
    			630
    		]
    	],
    	[
    		[
    			3517,
    			5623
    		],
    		[
    			771,
    			142
    		]
    	],
    	[
    		[
    			4288,
    			5765
    		],
    		[
    			33,
    			-236
    		]
    	],
    	[
    		[
    			4156,
    			6712
    		],
    		[
    			483,
    			88
    		]
    	],
    	[
    		[
    			4639,
    			6800
    		],
    		[
    			33,
    			-238
    		]
    	],
    	[
    		[
    			4672,
    			6562
    		],
    		[
    			-483,
    			-88
    		]
    	],
    	[
    		[
    			4189,
    			6474
    		],
    		[
    			-33,
    			238
    		]
    	],
    	[
    		[
    			4597,
    			7101
    		],
    		[
    			384,
    			71
    		]
    	],
    	[
    		[
    			5023,
    			6871
    		],
    		[
    			-384,
    			-71
    		]
    	],
    	[
    		[
    			4639,
    			6800
    		],
    		[
    			-42,
    			301
    		]
    	],
    	[
    		[
    			8223,
    			3110
    		],
    		[
    			45,
    			33
    		],
    		[
    			34,
    			12
    		],
    		[
    			300,
    			-454
    		],
    		[
    			-37,
    			-26
    		],
    		[
    			-174,
    			-13
    		],
    		[
    			-1,
    			10
    		],
    		[
    			-125,
    			-11
    		],
    		[
    			-35,
    			-16
    		],
    		[
    			22,
    			-52
    		],
    		[
    			15,
    			-24
    		],
    		[
    			44,
    			-24
    		],
    		[
    			82,
    			-9
    		],
    		[
    			61,
    			2
    		],
    		[
    			48,
    			6
    		],
    		[
    			40,
    			-2
    		],
    		[
    			67,
    			8
    		],
    		[
    			-8,
    			-23
    		],
    		[
    			-59,
    			-11
    		],
    		[
    			-21,
    			-15
    		],
    		[
    			-38,
    			-7
    		],
    		[
    			-54,
    			-27
    		],
    		[
    			-14,
    			-1
    		],
    		[
    			-30,
    			-25
    		],
    		[
    			-56,
    			3
    		],
    		[
    			-36,
    			-4
    		],
    		[
    			-36,
    			12
    		],
    		[
    			-45,
    			50
    		],
    		[
    			-13,
    			4
    		],
    		[
    			-63,
    			47
    		],
    		[
    			-22,
    			8
    		],
    		[
    			-28,
    			-19
    		],
    		[
    			26,
    			-22
    		],
    		[
    			27,
    			0
    		],
    		[
    			19,
    			-10
    		],
    		[
    			17,
    			-26
    		],
    		[
    			2,
    			-39
    		],
    		[
    			-19,
    			-74
    		],
    		[
    			-29,
    			-33
    		],
    		[
    			-16,
    			-54
    		],
    		[
    			8,
    			-12
    		],
    		[
    			29,
    			29
    		],
    		[
    			17,
    			-11
    		],
    		[
    			12,
    			-24
    		],
    		[
    			-15,
    			-38
    		],
    		[
    			13,
    			-14
    		],
    		[
    			-3,
    			-40
    		],
    		[
    			-11,
    			-6
    		],
    		[
    			-14,
    			-43
    		],
    		[
    			-16,
    			-32
    		],
    		[
    			27,
    			3
    		],
    		[
    			11,
    			-16
    		],
    		[
    			36,
    			-20
    		],
    		[
    			35,
    			20
    		],
    		[
    			47,
    			57
    		],
    		[
    			28,
    			46
    		],
    		[
    			16,
    			17
    		],
    		[
    			19,
    			1
    		],
    		[
    			49,
    			-56
    		],
    		[
    			21,
    			-37
    		],
    		[
    			51,
    			-42
    		]
    	],
    	[
    		[
    			8473,
    			2066
    		],
    		[
    			-66,
    			-135
    		],
    		[
    			-60,
    			-96
    		],
    		[
    			-103,
    			-158
    		],
    		[
    			-171,
    			45
    		],
    		[
    			-58,
    			8
    		],
    		[
    			-35,
    			28
    		],
    		[
    			-15,
    			-1
    		],
    		[
    			-68,
    			-112
    		]
    	],
    	[
    		[
    			5699,
    			4680
    		],
    		[
    			211,
    			17
    		],
    		[
    			50,
    			32
    		],
    		[
    			259,
    			23
    		]
    	],
    	[
    		[
    			6219,
    			4752
    		],
    		[
    			29,
    			-433
    		],
    		[
    			10,
    			-135
    		]
    	],
    	[
    		[
    			5735,
    			4139
    		],
    		[
    			-36,
    			541
    		]
    	],
    	[
    		[
    			6420,
    			5198
    		],
    		[
    			-56,
    			-5
    		],
    		[
    			-16,
    			-16
    		],
    		[
    			-46,
    			49
    		],
    		[
    			-58,
    			-68
    		],
    		[
    			-25,
    			7
    		],
    		[
    			-76,
    			87
    		],
    		[
    			-70,
    			-80
    		],
    		[
    			-91,
    			103
    		]
    	],
    	[
    		[
    			5293,
    			7710
    		],
    		[
    			34,
    			-236
    		]
    	],
    	[
    		[
    			4948,
    			7404
    		],
    		[
    			-384,
    			-70
    		],
    		[
    			-11,
    			78
    		]
    	],
    	[
    		[
    			4553,
    			7412
    		],
    		[
    			-22,
    			158
    		],
    		[
    			96,
    			17
    		]
    	],
    	[
    		[
    			8473,
    			2066
    		],
    		[
    			18,
    			-15
    		],
    		[
    			1,
    			-19
    		],
    		[
    			18,
    			-18
    		],
    		[
    			30,
    			-3
    		],
    		[
    			8,
    			27
    		],
    		[
    			24,
    			-2
    		],
    		[
    			26,
    			-22
    		],
    		[
    			25,
    			0
    		],
    		[
    			22,
    			24
    		],
    		[
    			13,
    			-5
    		],
    		[
    			49,
    			78
    		],
    		[
    			30,
    			55
    		],
    		[
    			8,
    			-5
    		],
    		[
    			-79,
    			-131
    		],
    		[
    			18,
    			5
    		],
    		[
    			39,
    			64
    		],
    		[
    			12,
    			-9
    		],
    		[
    			-48,
    			-76
    		],
    		[
    			10,
    			-14
    		],
    		[
    			50,
    			80
    		],
    		[
    			11,
    			-9
    		],
    		[
    			-48,
    			-75
    		],
    		[
    			8,
    			-13
    		],
    		[
    			31,
    			37
    		],
    		[
    			83,
    			-66
    		],
    		[
    			41,
    			67
    		],
    		[
    			22,
    			-6
    		],
    		[
    			-46,
    			-75
    		],
    		[
    			32,
    			-27
    		],
    		[
    			46,
    			74
    		],
    		[
    			17,
    			-11
    		],
    		[
    			-46,
    			-76
    		],
    		[
    			34,
    			-26
    		],
    		[
    			4,
    			-21
    		],
    		[
    			45,
    			-2
    		],
    		[
    			15,
    			-13
    		],
    		[
    			9,
    			27
    		],
    		[
    			48,
    			9
    		],
    		[
    			65,
    			-46
    		],
    		[
    			-10,
    			-23
    		],
    		[
    			-143,
    			-48
    		],
    		[
    			-34,
    			-12
    		],
    		[
    			-16,
    			-15
    		],
    		[
    			16,
    			-15
    		],
    		[
    			32,
    			6
    		],
    		[
    			128,
    			44
    		],
    		[
    			89,
    			34
    		],
    		[
    			15,
    			-17
    		],
    		[
    			-23,
    			-25
    		],
    		[
    			-128,
    			-42
    		],
    		[
    			6,
    			-25
    		],
    		[
    			164,
    			57
    		],
    		[
    			11,
    			-10
    		],
    		[
    			-43,
    			-205
    		],
    		[
    			-18,
    			-20
    		],
    		[
    			-212,
    			-70
    		],
    		[
    			22,
    			-89
    		],
    		[
    			193,
    			66
    		],
    		[
    			7,
    			-27
    		],
    		[
    			-215,
    			-72
    		],
    		[
    			-33,
    			18
    		],
    		[
    			-164,
    			145
    		],
    		[
    			-25,
    			-16
    		],
    		[
    			16,
    			-24
    		],
    		[
    			157,
    			-131
    		],
    		[
    			-23,
    			-35
    		],
    		[
    			162,
    			-138
    		],
    		[
    			-15,
    			-23
    		],
    		[
    			-161,
    			137
    		],
    		[
    			-48,
    			-74
    		],
    		[
    			273,
    			-231
    		],
    		[
    			-1,
    			-11
    		],
    		[
    			-38,
    			-60
    		],
    		[
    			-13,
    			-2
    		],
    		[
    			-157,
    			133
    		],
    		[
    			-55,
    			-86
    		],
    		[
    			64,
    			-52
    		],
    		[
    			3,
    			-24
    		],
    		[
    			230,
    			-192
    		],
    		[
    			-9,
    			-13
    		],
    		[
    			-229,
    			194
    		],
    		[
    			-71,
    			-110
    		],
    		[
    			231,
    			-194
    		],
    		[
    			-7,
    			-11
    		],
    		[
    			-230,
    			193
    		],
    		[
    			-25,
    			-25
    		],
    		[
    			-48,
    			-79
    		],
    		[
    			1,
    			-14
    		],
    		[
    			225,
    			-190
    		],
    		[
    			-1,
    			-3
    		],
    		[
    			-235,
    			198
    		],
    		[
    			57,
    			90
    		],
    		[
    			-23,
    			12
    		],
    		[
    			-21,
    			-34
    		],
    		[
    			-29,
    			2
    		],
    		[
    			-40,
    			64
    		],
    		[
    			-80,
    			69
    		],
    		[
    			-43,
    			13
    		],
    		[
    			-55,
    			1
    		],
    		[
    			-22,
    			15
    		],
    		[
    			-19,
    			43
    		],
    		[
    			-14,
    			14
    		],
    		[
    			-39,
    			6
    		],
    		[
    			-41,
    			22
    		],
    		[
    			-67,
    			-1
    		],
    		[
    			-34,
    			-14
    		],
    		[
    			-20,
    			-1
    		],
    		[
    			-17,
    			14
    		],
    		[
    			-7,
    			40
    		],
    		[
    			-40,
    			53
    		],
    		[
    			-40,
    			32
    		],
    		[
    			-11,
    			56
    		],
    		[
    			-11,
    			130
    		],
    		[
    			-15,
    			35
    		],
    		[
    			-31,
    			34
    		],
    		[
    			4,
    			10
    		],
    		[
    			-25,
    			55
    		],
    		[
    			-85,
    			-23
    		],
    		[
    			-30,
    			-22
    		],
    		[
    			-13,
    			-54
    		],
    		[
    			-32,
    			-27
    		],
    		[
    			-8,
    			-39
    		],
    		[
    			-32,
    			-38
    		],
    		[
    			-27,
    			-4
    		],
    		[
    			-36,
    			29
    		],
    		[
    			-35,
    			10
    		]
    	],
    	[
    		[
    			8104,
    			677
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			8100,
    			682
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			8088,
    			690
    		],
    		[
    			11,
    			-8
    		]
    	],
    	[
    		[
    			8080,
    			700
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			8076,
    			703
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			8050,
    			727
    		],
    		[
    			25,
    			-23
    		]
    	],
    	[
    		[
    			8044,
    			735
    		],
    		[
    			1,
    			-4
    		]
    	],
    	[
    		[
    			8038,
    			737
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			8003,
    			764
    		],
    		[
    			26,
    			-19
    		]
    	],
    	[
    		[
    			7958,
    			797
    		],
    		[
    			26,
    			-21
    		]
    	],
    	[
    		[
    			7949,
    			803
    		],
    		[
    			9,
    			-5
    		]
    	],
    	[
    		[
    			7942,
    			809
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			7940,
    			810
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7936,
    			814
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7934,
    			814
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			7930,
    			818
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			7926,
    			821
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7921,
    			828
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7916,
    			834
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7913,
    			842
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7910,
    			846
    		],
    		[
    			2,
    			-4
    		]
    	],
    	[
    		[
    			7901,
    			857
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7897,
    			863
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7892,
    			863
    		],
    		[
    			5,
    			0
    		]
    	],
    	[
    		[
    			7883,
    			870
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7879,
    			873
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			7876,
    			873
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			7862,
    			887
    		],
    		[
    			2,
    			-3
    		]
    	],
    	[
    		[
    			7850,
    			895
    		],
    		[
    			11,
    			-7
    		]
    	],
    	[
    		[
    			7838,
    			899
    		],
    		[
    			9,
    			-3
    		]
    	],
    	[
    		[
    			7829,
    			898
    		],
    		[
    			9,
    			1
    		]
    	],
    	[
    		[
    			7823,
    			897
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			7814,
    			897
    		],
    		[
    			4,
    			0
    		]
    	],
    	[
    		[
    			7791,
    			918
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7786,
    			933
    		],
    		[
    			2,
    			-6
    		]
    	],
    	[
    		[
    			7774,
    			950
    		],
    		[
    			7,
    			-10
    		]
    	],
    	[
    		[
    			7762,
    			959
    		],
    		[
    			6,
    			-5
    		]
    	],
    	[
    		[
    			7751,
    			966
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			7727,
    			988
    		],
    		[
    			5,
    			-6
    		]
    	],
    	[
    		[
    			7713,
    			995
    		],
    		[
    			13,
    			-7
    		]
    	],
    	[
    		[
    			7693,
    			1009
    		],
    		[
    			20,
    			-13
    		]
    	],
    	[
    		[
    			7692,
    			1010
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7690,
    			1026
    		],
    		[
    			0,
    			-5
    		]
    	],
    	[
    		[
    			7687,
    			1028
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			7686,
    			1032
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7684,
    			1031
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			7681,
    			1039
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7683,
    			1054
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			7695,
    			1079
    		],
    		[
    			-6,
    			-12
    		]
    	],
    	[
    		[
    			7698,
    			1083
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7710,
    			1099
    		],
    		[
    			-9,
    			-13
    		]
    	],
    	[
    		[
    			7720,
    			1133
    		],
    		[
    			-9,
    			-31
    		]
    	],
    	[
    		[
    			7720,
    			1140
    		],
    		[
    			0,
    			-7
    		]
    	],
    	[
    		[
    			7721,
    			1147
    		],
    		[
    			0,
    			-3
    		]
    	],
    	[
    		[
    			7719,
    			1150
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			7715,
    			1159
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			7715,
    			1160
    		],
    		[
    			-3,
    			5
    		]
    	],
    	[
    		[
    			7712,
    			1165
    		],
    		[
    			3,
    			-5
    		]
    	],
    	[
    		[
    			7711,
    			1165
    		],
    		[
    			-18,
    			12
    		]
    	],
    	[
    		[
    			7693,
    			1177
    		],
    		[
    			18,
    			-12
    		]
    	],
    	[
    		[
    			7685,
    			1184
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7682,
    			1186
    		],
    		[
    			3,
    			-2
    		]
    	],
    	[
    		[
    			7677,
    			1190
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7676,
    			1192
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			7676,
    			1192
    		],
    		[
    			-5,
    			4
    		]
    	],
    	[
    		[
    			7671,
    			1196
    		],
    		[
    			5,
    			-4
    		]
    	],
    	[
    		[
    			7671,
    			1196
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7670,
    			1197
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7662,
    			1203
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7661,
    			1204
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7661,
    			1204
    		],
    		[
    			-8,
    			7
    		]
    	],
    	[
    		[
    			7653,
    			1211
    		],
    		[
    			8,
    			-7
    		]
    	],
    	[
    		[
    			7647,
    			1217
    		],
    		[
    			-15,
    			11
    		]
    	],
    	[
    		[
    			7632,
    			1228
    		],
    		[
    			15,
    			-11
    		]
    	],
    	[
    		[
    			7611,
    			1250
    		],
    		[
    			5,
    			-6
    		]
    	],
    	[
    		[
    			7599,
    			1261
    		],
    		[
    			8,
    			-7
    		]
    	],
    	[
    		[
    			7586,
    			1272
    		],
    		[
    			4,
    			-3
    		]
    	],
    	[
    		[
    			7582,
    			1273
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7568,
    			1280
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7567,
    			1281
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7562,
    			1285
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7558,
    			1286
    		],
    		[
    			3,
    			-1
    		]
    	],
    	[
    		[
    			7553,
    			1289
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			7543,
    			1299
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7539,
    			1301
    		],
    		[
    			4,
    			-2
    		]
    	],
    	[
    		[
    			7531,
    			1308
    		],
    		[
    			5,
    			-3
    		]
    	],
    	[
    		[
    			7508,
    			1326
    		],
    		[
    			18,
    			-15
    		]
    	],
    	[
    		[
    			7495,
    			1337
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			7486,
    			1345
    		],
    		[
    			8,
    			-7
    		]
    	],
    	[
    		[
    			7479,
    			1350
    		],
    		[
    			6,
    			-5
    		]
    	],
    	[
    		[
    			7475,
    			1359
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			7482,
    			1365
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			7485,
    			1369
    		],
    		[
    			-3,
    			-4
    		]
    	],
    	[
    		[
    			7499,
    			1378
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			7501,
    			1379
    		],
    		[
    			-1,
    			-1
    		]
    	],
    	[
    		[
    			7507,
    			1380
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7514,
    			1379
    		],
    		[
    			-2,
    			1
    		]
    	],
    	[
    		[
    			7524,
    			1374
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7528,
    			1371
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7531,
    			1369
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7543,
    			1361
    		],
    		[
    			-9,
    			6
    		]
    	],
    	[
    		[
    			7548,
    			1356
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7552,
    			1352
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7553,
    			1351
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7561,
    			1352
    		],
    		[
    			-7,
    			-1
    		]
    	],
    	[
    		[
    			7575,
    			1348
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7579,
    			1348
    		],
    		[
    			-3,
    			0
    		]
    	],
    	[
    		[
    			7583,
    			1349
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			7589,
    			1341
    		],
    		[
    			-2,
    			4
    		]
    	],
    	[
    		[
    			7594,
    			1332
    		],
    		[
    			-4,
    			7
    		]
    	],
    	[
    		[
    			7598,
    			1331
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7604,
    			1323
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7608,
    			1320
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7616,
    			1309
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7620,
    			1307
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			7622,
    			1305
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7625,
    			1301
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7629,
    			1298
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7635,
    			1295
    		],
    		[
    			-6,
    			3
    		]
    	],
    	[
    		[
    			7639,
    			1295
    		],
    		[
    			-4,
    			0
    		]
    	],
    	[
    		[
    			7652,
    			1290
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7654,
    			1278
    		],
    		[
    			-1,
    			6
    		]
    	],
    	[
    		[
    			7657,
    			1271
    		],
    		[
    			-3,
    			7
    		]
    	],
    	[
    		[
    			7661,
    			1270
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			7662,
    			1269
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7663,
    			1268
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7665,
    			1266
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			7666,
    			1260
    		],
    		[
    			-1,
    			4
    		]
    	],
    	[
    		[
    			7669,
    			1257
    		],
    		[
    			-2,
    			3
    		]
    	],
    	[
    		[
    			7681,
    			1249
    		],
    		[
    			-12,
    			8
    		]
    	],
    	[
    		[
    			7698,
    			1235
    		],
    		[
    			-7,
    			6
    		]
    	],
    	[
    		[
    			7702,
    			1232
    		],
    		[
    			-4,
    			2
    		]
    	],
    	[
    		[
    			7709,
    			1224
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7711,
    			1224
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			7718,
    			1219
    		],
    		[
    			-4,
    			3
    		]
    	],
    	[
    		[
    			7726,
    			1212
    		],
    		[
    			-1,
    			1
    		]
    	],
    	[
    		[
    			7729,
    			1206
    		],
    		[
    			-1,
    			2
    		]
    	],
    	[
    		[
    			7732,
    			1203
    		],
    		[
    			-3,
    			3
    		]
    	],
    	[
    		[
    			7734,
    			1203
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			7741,
    			1197
    		],
    		[
    			-3,
    			3
    		]
    	],
    	[
    		[
    			7744,
    			1195
    		],
    		[
    			-3,
    			2
    		]
    	],
    	[
    		[
    			6677,
    			8263
    		],
    		[
    			-70,
    			-60
    		],
    		[
    			-28,
    			-16
    		],
    		[
    			-72,
    			-3
    		],
    		[
    			-98,
    			-28
    		]
    	],
    	[
    		[
    			6409,
    			8156
    		],
    		[
    			-85,
    			-19
    		],
    		[
    			-7,
    			-7
    		],
    		[
    			-46,
    			1
    		],
    		[
    			-332,
    			-59
    		],
    		[
    			-97,
    			-19
    		]
    	],
    	[
    		[
    			5842,
    			8053
    		],
    		[
    			-113,
    			114
    		],
    		[
    			-4,
    			27
    		],
    		[
    			-20,
    			-3
    		],
    		[
    			-67,
    			68
    		],
    		[
    			-20,
    			-4
    		]
    	],
    	[
    		[
    			5618,
    			8255
    		],
    		[
    			-30,
    			213
    		]
    	],
    	[
    		[
    			5588,
    			8468
    		],
    		[
    			79,
    			13
    		],
    		[
    			-8,
    			20
    		],
    		[
    			-113,
    			5
    		],
    		[
    			1,
    			19
    		],
    		[
    			119,
    			-9
    		],
    		[
    			5,
    			-32
    		],
    		[
    			19,
    			-5
    		],
    		[
    			8,
    			-37
    		],
    		[
    			59,
    			10
    		],
    		[
    			9,
    			50
    		],
    		[
    			-73,
    			6
    		],
    		[
    			1,
    			20
    		],
    		[
    			-186,
    			177
    		],
    		[
    			14,
    			21
    		],
    		[
    			67,
    			-52
    		],
    		[
    			10,
    			17
    		],
    		[
    			-18,
    			33
    		],
    		[
    			30,
    			-1
    		],
    		[
    			204,
    			-195
    		],
    		[
    			33,
    			17
    		],
    		[
    			-33,
    			33
    		],
    		[
    			115,
    			-37
    		],
    		[
    			-53,
    			53
    		],
    		[
    			15,
    			16
    		],
    		[
    			10,
    			-25
    		],
    		[
    			72,
    			-64
    		],
    		[
    			43,
    			26
    		],
    		[
    			-57,
    			95
    		],
    		[
    			9,
    			6
    		],
    		[
    			73,
    			-125
    		],
    		[
    			12,
    			-16
    		],
    		[
    			41,
    			-8
    		],
    		[
    			6,
    			42
    		],
    		[
    			-51,
    			137
    		],
    		[
    			23,
    			28
    		],
    		[
    			46,
    			20
    		],
    		[
    			8,
    			-43
    		],
    		[
    			-10,
    			-76
    		],
    		[
    			23,
    			-51
    		],
    		[
    			8,
    			-35
    		],
    		[
    			15,
    			-31
    		],
    		[
    			62,
    			-27
    		],
    		[
    			19,
    			-18
    		],
    		[
    			20,
    			6
    		],
    		[
    			18,
    			-17
    		],
    		[
    			41,
    			-20
    		],
    		[
    			-10,
    			184
    		],
    		[
    			41,
    			2
    		],
    		[
    			13,
    			-241
    		],
    		[
    			33,
    			-25
    		],
    		[
    			54,
    			167
    		],
    		[
    			29,
    			-11
    		],
    		[
    			-47,
    			-147
    		],
    		[
    			44,
    			-33
    		],
    		[
    			70,
    			120
    		],
    		[
    			24,
    			-19
    		],
    		[
    			-63,
    			-110
    		],
    		[
    			37,
    			-38
    		],
    		[
    			108,
    			136
    		],
    		[
    			32,
    			-32
    		],
    		[
    			-11,
    			-104
    		]
    	],
    	[
    		[
    			5496,
    			8755
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			5496,
    			8757
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			5496,
    			8755
    		],
    		[
    			0,
    			2
    		]
    	],
    	[
    		[
    			5618,
    			8255
    		],
    		[
    			66,
    			-472
    		]
    	],
    	[
    		[
    			5684,
    			7783
    		],
    		[
    			-186,
    			-34
    		],
    		[
    			-6,
    			-3
    		],
    		[
    			-199,
    			-36
    		]
    	],
    	[
    		[
    			5282,
    			7788
    		],
    		[
    			-43,
    			315
    		]
    	],
    	[
    		[
    			5165,
    			8436
    		],
    		[
    			9,
    			-42
    		],
    		[
    			41,
    			-49
    		],
    		[
    			53,
    			-29
    		],
    		[
    			30,
    			-4
    		],
    		[
    			29,
    			6
    		],
    		[
    			52,
    			37
    		],
    		[
    			59,
    			61
    		],
    		[
    			43,
    			61
    		],
    		[
    			-2,
    			20
    		],
    		[
    			-20,
    			31
    		],
    		[
    			-84,
    			89
    		],
    		[
    			2,
    			3
    		],
    		[
    			86,
    			-92
    		],
    		[
    			9,
    			2
    		],
    		[
    			18,
    			-33
    		],
    		[
    			22,
    			-3
    		],
    		[
    			4,
    			-39
    		],
    		[
    			72,
    			13
    		]
    	],
    	[
    		[
    			5161,
    			8455
    		],
    		[
    			1,
    			-13
    		]
    	],
    	[
    		[
    			5158,
    			8484
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			5156,
    			8497
    		],
    		[
    			1,
    			2
    		]
    	],
    	[
    		[
    			5156,
    			8506
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			5157,
    			8524
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			5156,
    			8576
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			5162,
    			8590
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			5180,
    			8621
    		],
    		[
    			4,
    			6
    		]
    	],
    	[
    		[
    			5192,
    			8635
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			5208,
    			8648
    		],
    		[
    			0,
    			1
    		]
    	],
    	[
    		[
    			5238,
    			8662
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			5247,
    			8664
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			5257,
    			8665
    		],
    		[
    			31,
    			-9
    		],
    		[
    			-3,
    			-24
    		],
    		[
    			-32,
    			19
    		],
    		[
    			-28,
    			-8
    		],
    		[
    			-31,
    			-24
    		],
    		[
    			-30,
    			-57
    		]
    	],
    	[
    		[
    			5842,
    			8053
    		],
    		[
    			115,
    			-114
    		]
    	],
    	[
    		[
    			5957,
    			7939
    		],
    		[
    			37,
    			-261
    		]
    	],
    	[
    		[
    			5994,
    			7678
    		],
    		[
    			-288,
    			-53
    		]
    	],
    	[
    		[
    			5706,
    			7625
    		],
    		[
    			-22,
    			158
    		]
    	],
    	[
    		[
    			6409,
    			8156
    		],
    		[
    			22,
    			-157
    		],
    		[
    			96,
    			17
    		],
    		[
    			43,
    			-314
    		]
    	],
    	[
    		[
    			6570,
    			7702
    		],
    		[
    			-188,
    			-35
    		],
    		[
    			-33,
    			233
    		],
    		[
    			-5,
    			3
    		],
    		[
    			-297,
    			-54
    		]
    	],
    	[
    		[
    			6047,
    			7849
    		],
    		[
    			-90,
    			90
    		]
    	],
    	[
    		[
    			6677,
    			8263
    		],
    		[
    			-22,
    			-208
    		],
    		[
    			28,
    			-8
    		],
    		[
    			113,
    			96
    		],
    		[
    			18,
    			-30
    		],
    		[
    			-101,
    			-86
    		],
    		[
    			22,
    			-36
    		],
    		[
    			103,
    			85
    		],
    		[
    			18,
    			-29
    		],
    		[
    			-122,
    			-100
    		],
    		[
    			-7,
    			-9
    		],
    		[
    			19,
    			-30
    		],
    		[
    			15,
    			6
    		],
    		[
    			119,
    			95
    		],
    		[
    			56,
    			-93
    		],
    		[
    			-130,
    			-105
    		],
    		[
    			23,
    			-37
    		],
    		[
    			130,
    			105
    		],
    		[
    			18,
    			-29
    		],
    		[
    			-121,
    			-98
    		],
    		[
    			-7,
    			-11
    		],
    		[
    			53,
    			-85
    		],
    		[
    			9,
    			0
    		],
    		[
    			123,
    			102
    		],
    		[
    			3,
    			-4
    		],
    		[
    			-123,
    			-103
    		],
    		[
    			-3,
    			-11
    		],
    		[
    			42,
    			-65
    		],
    		[
    			21,
    			9
    		],
    		[
    			97,
    			81
    		],
    		[
    			16,
    			-26
    		],
    		[
    			-110,
    			-92
    		],
    		[
    			19,
    			-4
    		],
    		[
    			15,
    			-20
    		],
    		[
    			97,
    			83
    		],
    		[
    			16,
    			-26
    		],
    		[
    			-28,
    			-23
    		],
    		[
    			-26,
    			-31
    		],
    		[
    			-55,
    			-49
    		],
    		[
    			7,
    			-11
    		],
    		[
    			32,
    			24
    		],
    		[
    			15,
    			-31
    		],
    		[
    			51,
    			-79
    		],
    		[
    			83,
    			54
    		],
    		[
    			23,
    			-36
    		],
    		[
    			-71,
    			-81
    		],
    		[
    			27,
    			3
    		],
    		[
    			17,
    			-26
    		],
    		[
    			-17,
    			-18
    		],
    		[
    			16,
    			-24
    		],
    		[
    			-18,
    			-15
    		]
    	],
    	[
    		[
    			6927,
    			7192
    		],
    		[
    			-16,
    			106
    		],
    		[
    			-208,
    			-39
    		]
    	],
    	[
    		[
    			6592,
    			7544
    		],
    		[
    			-22,
    			158
    		]
    	],
    	[
    		[
    			6389,
    			7507
    		],
    		[
    			-342,
    			342
    		]
    	],
    	[
    		[
    			6219,
    			7476
    		],
    		[
    			-192,
    			-35
    		]
    	],
    	[
    		[
    			6027,
    			7441
    		],
    		[
    			-33,
    			237
    		]
    	],
    	[
    		[
    			6027,
    			7441
    		],
    		[
    			21,
    			-149
    		]
    	],
    	[
    		[
    			6048,
    			7292
    		],
    		[
    			-288,
    			-53
    		]
    	],
    	[
    		[
    			5728,
    			7467
    		],
    		[
    			-22,
    			158
    		]
    	],
    	[
    		[
    			5770,
    			7165
    		],
    		[
    			21,
    			-153
    		]
    	],
    	[
    		[
    			5791,
    			7012
    		],
    		[
    			22,
    			-159
    		]
    	],
    	[
    		[
    			5422,
    			6781
    		],
    		[
    			-20,
    			159
    		]
    	],
    	[
    		[
    			6048,
    			7292
    		],
    		[
    			95,
    			18
    		],
    		[
    			33,
    			-227
    		]
    	],
    	[
    		[
    			5983,
    			7048
    		],
    		[
    			-192,
    			-36
    		]
    	],
    	[
    		[
    			6250,
    			7253
    		],
    		[
    			21,
    			-153
    		]
    	],
    	[
    		[
    			6271,
    			7100
    		],
    		[
    			182,
    			33
    		],
    		[
    			-11,
    			78
    		]
    	],
    	[
    		[
    			6357,
    			6552
    		],
    		[
    			-13,
    			-21
    		],
    		[
    			-68,
    			-76
    		]
    	],
    	[
    		[
    			6276,
    			6455
    		],
    		[
    			-14,
    			8
    		],
    		[
    			-9,
    			67
    		]
    	],
    	[
    		[
    			6253,
    			6530
    		],
    		[
    			-22,
    			157
    		]
    	],
    	[
    		[
    			6221,
    			6766
    		],
    		[
    			-23,
    			158
    		]
    	],
    	[
    		[
    			4303,
    			8337
    		],
    		[
    			14,
    			3
    		]
    	],
    	[
    		[
    			4299,
    			8335
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4293,
    			8335
    		],
    		[
    			6,
    			0
    		]
    	],
    	[
    		[
    			4317,
    			8345
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4310,
    			8343
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4307,
    			8350
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4305,
    			8342
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4298,
    			8348
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4296,
    			8344
    		],
    		[
    			0,
    			-2
    		]
    	],
    	[
    		[
    			4291,
    			8339
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			4285,
    			8338
    		],
    		[
    			4,
    			1
    		]
    	],
    	[
    		[
    			4283,
    			8344
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4280,
    			8337
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4277,
    			8343
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4261,
    			8334
    		],
    		[
    			2,
    			1
    		]
    	],
    	[
    		[
    			4259,
    			8340
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4256,
    			8333
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4254,
    			8339
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4251,
    			8333
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			4248,
    			8338
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4245,
    			8332
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			4242,
    			8354
    		],
    		[
    			2,
    			-23
    		]
    	],
    	[
    		[
    			4248,
    			8350
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4253,
    			8352
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4261,
    			8360
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			4265,
    			8361
    		],
    		[
    			-2,
    			0
    		]
    	],
    	[
    		[
    			4273,
    			8364
    		],
    		[
    			-4,
    			-2
    		]
    	],
    	[
    		[
    			4279,
    			8366
    		],
    		[
    			-4,
    			-2
    		]
    	],
    	[
    		[
    			4281,
    			8361
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4285,
    			8368
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			4288,
    			8361
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4294,
    			8363
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4297,
    			8371
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			4303,
    			8373
    		],
    		[
    			-4,
    			-1
    		]
    	],
    	[
    		[
    			4306,
    			8367
    		],
    		[
    			-1,
    			0
    		]
    	],
    	[
    		[
    			4307,
    			8375
    		],
    		[
    			-2,
    			-1
    		]
    	],
    	[
    		[
    			4314,
    			8377
    		],
    		[
    			-3,
    			-1
    		]
    	],
    	[
    		[
    			4318,
    			8375
    		],
    		[
    			0,
    			-4
    		]
    	],
    	[
    		[
    			4317,
    			8385
    		],
    		[
    			1,
    			-2
    		]
    	],
    	[
    		[
    			4311,
    			8377
    		],
    		[
    			4,
    			2
    		]
    	],
    	[
    		[
    			4304,
    			8375
    		],
    		[
    			3,
    			1
    		]
    	],
    	[
    		[
    			4304,
    			8381
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4301,
    			8374
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4298,
    			8379
    		],
    		[
    			0,
    			-1
    		]
    	],
    	[
    		[
    			4292,
    			8371
    		],
    		[
    			5,
    			5
    		]
    	],
    	[
    		[
    			4291,
    			8378
    		],
    		[
    			1,
    			-1
    		]
    	],
    	[
    		[
    			4287,
    			8376
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4284,
    			8369
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4277,
    			8367
    		],
    		[
    			7,
    			8
    		]
    	],
    	[
    		[
    			4276,
    			8373
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4265,
    			8363
    		],
    		[
    			5,
    			8
    		]
    	],
    	[
    		[
    			4254,
    			8359
    		],
    		[
    			5,
    			2
    		]
    	],
    	[
    		[
    			4252,
    			8362
    		],
    		[
    			3,
    			6
    		]
    	],
    	[
    		[
    			4251,
    			8358
    		],
    		[
    			1,
    			1
    		]
    	],
    	[
    		[
    			4248,
    			8357
    		],
    		[
    			2,
    			10
    		]
    	],
    	[
    		[
    			4245,
    			8357
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4246,
    			8366
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4242,
    			8356
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			4240,
    			8364
    		],
    		[
    			1,
    			-9
    		]
    	],
    	[
    		[
    			4224,
    			8361
    		],
    		[
    			3,
    			0
    		]
    	],
    	[
    		[
    			4238,
    			8361
    		],
    		[
    			-14,
    			-3
    		]
    	],
    	[
    		[
    			4243,
    			8330
    		],
    		[
    			-2,
    			15
    		]
    	],
    	[
    		[
    			4241,
    			8327
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			4237,
    			8350
    		],
    		[
    			1,
    			-8
    		]
    	],
    	[
    		[
    			4236,
    			8353
    		],
    		[
    			1,
    			-3
    		]
    	],
    	[
    		[
    			4234,
    			8355
    		],
    		[
    			2,
    			-2
    		]
    	],
    	[
    		[
    			4232,
    			8356
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4230,
    			8356
    		],
    		[
    			2,
    			0
    		]
    	],
    	[
    		[
    			4306,
    			7770
    		],
    		[
    			-367,
    			-67
    		]
    	],
    	[
    		[
    			3939,
    			7703
    		],
    		[
    			-21,
    			189
    		],
    		[
    			-31,
    			-4
    		],
    		[
    			-26,
    			16
    		],
    		[
    			-22,
    			25
    		],
    		[
    			-17,
    			32
    		],
    		[
    			-7,
    			59
    		],
    		[
    			12,
    			48
    		],
    		[
    			33,
    			43
    		],
    		[
    			34,
    			21
    		],
    		[
    			-15,
    			136
    		],
    		[
    			20,
    			22
    		],
    		[
    			1,
    			46
    		]
    	],
    	[
    		[
    			3900,
    			8336
    		],
    		[
    			55,
    			49
    		],
    		[
    			112,
    			13
    		],
    		[
    			28,
    			-2
    		],
    		[
    			65,
    			10
    		],
    		[
    			67,
    			26
    		],
    		[
    			92,
    			14
    		],
    		[
    			32,
    			22
    		],
    		[
    			0,
    			-26
    		],
    		[
    			-112,
    			-18
    		],
    		[
    			-5,
    			-25
    		],
    		[
    			-16,
    			-4
    		],
    		[
    			-13,
    			17
    		],
    		[
    			-45,
    			-16
    		],
    		[
    			-20,
    			-25
    		],
    		[
    			-27,
    			0
    		],
    		[
    			-44,
    			-26
    		],
    		[
    			-82,
    			-35
    		],
    		[
    			-21,
    			-4
    		],
    		[
    			13,
    			-95
    		],
    		[
    			46,
    			8
    		],
    		[
    			0,
    			9
    		],
    		[
    			208,
    			37
    		],
    		[
    			-9,
    			45
    		],
    		[
    			-39,
    			-15
    		],
    		[
    			-33,
    			-6
    		],
    		[
    			14,
    			26
    		],
    		[
    			63,
    			10
    		],
    		[
    			1,
    			31
    		]
    	],
    	[
    		[
    			4553,
    			7412
    		],
    		[
    			-571,
    			-105
    		]
    	],
    	[
    		[
    			3982,
    			7307
    		],
    		[
    			-34,
    			317
    		],
    		[
    			-9,
    			79
    		]
    	],
    	[
    		[
    			4597,
    			7101
    		],
    		[
    			-579,
    			-106
    		]
    	],
    	[
    		[
    			4007,
    			7069
    		],
    		[
    			-25,
    			238
    		]
    	],
    	[
    		[
    			4156,
    			6712
    		],
    		[
    			-97,
    			-18
    		]
    	],
    	[
    		[
    			5813,
    			6853
    		],
    		[
    			193,
    			35
    		]
    	],
    	[
    		[
    			5470,
    			6467
    		],
    		[
    			-93,
    			-17
    		],
    		[
    			-28,
    			6
    		],
    		[
    			-49,
    			49
    		],
    		[
    			-30,
    			8
    		]
    	],
    	[
    		[
    			5270,
    			6513
    		],
    		[
    			-2,
    			10
    		]
    	],
    	[
    		[
    			5268,
    			6523
    		],
    		[
    			-20,
    			145
    		]
    	],
    	[
    		[
    			5248,
    			6668
    		],
    		[
    			-33,
    			238
    		]
    	],
    	[
    		[
    			5248,
    			6668
    		],
    		[
    			-576,
    			-106
    		]
    	],
    	[
    		[
    			4189,
    			6474
    		],
    		[
    			22,
    			-157
    		]
    	],
    	[
    		[
    			4212,
    			6310
    		],
    		[
    			-171,
    			-31
    		],
    		[
    			-93,
    			-11
    		],
    		[
    			-3,
    			14
    		],
    		[
    			-95,
    			-17
    		],
    		[
    			-5,
    			-4
    		],
    		[
    			-175,
    			-30
    		],
    		[
    			-124,
    			-25
    		]
    	],
    	[
    		[
    			3546,
    			6206
    		],
    		[
    			-97,
    			-16
    		],
    		[
    			-111,
    			-5
    		],
    		[
    			-66,
    			-7
    		]
    	],
    	[
    		[
    			3272,
    			6178
    		],
    		[
    			-17,
    			368
    		]
    	],
    	[
    		[
    			4319,
    			6012
    		],
    		[
    			-64,
    			-10
    		],
    		[
    			33,
    			-237
    		]
    	],
    	[
    		[
    			3517,
    			5623
    		],
    		[
    			-5,
    			66
    		],
    		[
    			-4,
    			13
    		],
    		[
    			-22,
    			162
    		],
    		[
    			107,
    			19
    		],
    		[
    			-4,
    			13
    		],
    		[
    			-23,
    			161
    		],
    		[
    			0,
    			20
    		],
    		[
    			-20,
    			129
    		]
    	],
    	[
    		[
    			5270,
    			6513
    		],
    		[
    			33,
    			-238
    		]
    	],
    	[
    		[
    			4693,
    			6417
    		],
    		[
    			5,
    			6
    		],
    		[
    			195,
    			35
    		],
    		[
    			182,
    			35
    		],
    		[
    			137,
    			24
    		],
    		[
    			56,
    			6
    		]
    	],
    	[
    		[
    			5522,
    			6072
    		],
    		[
    			-186,
    			-33
    		]
    	],
    	[
    		[
    			5199,
    			5610
    		],
    		[
    			-44,
    			315
    		]
    	],
    	[
    		[
    			4815,
    			5539
    		],
    		[
    			-12,
    			88
    		],
    		[
    			-32,
    			227
    		]
    	],
    	[
    		[
    			4288,
    			5765
    		],
    		[
    			483,
    			89
    		]
    	],
    	[
    		[
    			4815,
    			5539
    		],
    		[
    			-483,
    			-88
    		]
    	],
    	[
    		[
    			4332,
    			5451
    		],
    		[
    			22,
    			-157
    		],
    		[
    			-173,
    			-32
    		],
    		[
    			3,
    			-25
    		],
    		[
    			15,
    			-30
    		],
    		[
    			14,
    			-14
    		]
    	],
    	[
    		[
    			4867,
    			5164
    		],
    		[
    			-246,
    			-21
    		]
    	],
    	[
    		[
    			4621,
    			5143
    		],
    		[
    			-77,
    			-8
    		],
    		[
    			-7,
    			8
    		],
    		[
    			-65,
    			-5
    		],
    		[
    			-28,
    			-51
    		],
    		[
    			-77,
    			-54
    		],
    		[
    			-27,
    			-68
    		],
    		[
    			-82,
    			-88
    		],
    		[
    			-34,
    			1
    		]
    	],
    	[
    		[
    			5169,
    			5188
    		],
    		[
    			-32,
    			-36
    		]
    	],
    	[
    		[
    			5137,
    			5152
    		],
    		[
    			-98,
    			-112
    		],
    		[
    			-20,
    			-10
    		],
    		[
    			1,
    			-19
    		],
    		[
    			-20,
    			-19
    		],
    		[
    			-83,
    			-91
    		],
    		[
    			-53,
    			-63
    		],
    		[
    			-107,
    			-121
    		],
    		[
    			-101,
    			-109
    		]
    	],
    	[
    		[
    			4656,
    			4608
    		],
    		[
    			-35,
    			535
    		]
    	],
    	[
    		[
    			5890,
    			6302
    		],
    		[
    			11,
    			-79
    		]
    	],
    	[
    		[
    			6061,
    			6495
    		],
    		[
    			192,
    			35
    		]
    	],
    	[
    		[
    			6276,
    			6455
    		],
    		[
    			-41,
    			-53
    		],
    		[
    			-304,
    			-347
    		]
    	],
    	[
    		[
    			3076,
    			851
    		],
    		[
    			-24,
    			0
    		],
    		[
    			0,
    			-23
    		]
    	],
    	[
    		[
    			3052,
    			828
    		],
    		[
    			-315,
    			-4
    		],
    		[
    			1,
    			-151
    		],
    		[
    			-201,
    			-2
    		],
    		[
    			-6,
    			4
    		],
    		[
    			-65,
    			94
    		]
    	],
    	[
    		[
    			2466,
    			769
    		],
    		[
    			14,
    			368
    		],
    		[
    			45,
    			2
    		],
    		[
    			542,
    			6
    		],
    		[
    			7,
    			4
    		]
    	],
    	[
    		[
    			3052,
    			828
    		],
    		[
    			3,
    			-307
    		],
    		[
    			2,
    			-34
    		],
    		[
    			-1,
    			-116
    		],
    		[
    			1,
    			-107
    		],
    		[
    			100,
    			-57
    		]
    	],
    	[
    		[
    			2685,
    			8
    		],
    		[
    			-114,
    			0
    		],
    		[
    			-26,
    			7
    		]
    	],
    	[
    		[
    			1137,
    			3979
    		],
    		[
    			536,
    			35
    		]
    	],
    	[
    		[
    			1160,
    			3507
    		],
    		[
    			-7,
    			157
    		]
    	],
    	[
    		[
    			1253,
    			6204
    		],
    		[
    			8,
    			-159
    		]
    	],
    	[
    		[
    			980,
    			5385
    		],
    		[
    			-23,
    			473
    		]
    	],
    	[
    		[
    			957,
    			5858
    		],
    		[
    			-17,
    			324
    		]
    	],
    	[
    		[
    			2310,
    			1079
    		],
    		[
    			12,
    			6
    		],
    		[
    			12,
    			177
    		],
    		[
    			18,
    			499
    		],
    		[
    			-9,
    			169
    		],
    		[
    			-11,
    			6
    		]
    	],
    	[
    		[
    			2332,
    			1936
    		],
    		[
    			-12,
    			295
    		]
    	],
    	[
    		[
    			3236,
    			2208
    		],
    		[
    			25,
    			-55
    		],
    		[
    			-16,
    			-44
    		],
    		[
    			-39,
    			-35
    		],
    		[
    			-24,
    			-6
    		],
    		[
    			-8,
    			-60
    		],
    		[
    			-43,
    			-50
    		],
    		[
    			-5,
    			-54
    		],
    		[
    			-21,
    			-53
    		],
    		[
    			13,
    			-63
    		],
    		[
    			-17,
    			-50
    		],
    		[
    			25,
    			5
    		],
    		[
    			33,
    			-9
    		],
    		[
    			-59,
    			-47
    		],
    		[
    			-32,
    			-9
    		],
    		[
    			-30,
    			4
    		],
    		[
    			16,
    			-45
    		],
    		[
    			4,
    			-45
    		],
    		[
    			-8,
    			-103
    		],
    		[
    			-6,
    			-19
    		],
    		[
    			34,
    			-21
    		]
    	],
    	[
    		[
    			4469,
    			2219
    		],
    		[
    			150,
    			-42
    		]
    	],
    	[
    		[
    			4619,
    			2177
    		],
    		[
    			159,
    			-43
    		],
    		[
    			40,
    			-20
    		]
    	],
    	[
    		[
    			3654,
    			1270
    		],
    		[
    			-2,
    			396
    		],
    		[
    			3,
    			37
    		],
    		[
    			-7,
    			16
    		],
    		[
    			-90,
    			1
    		],
    		[
    			-1,
    			79
    		],
    		[
    			-4,
    			33
    		],
    		[
    			40,
    			0
    		],
    		[
    			-2,
    			270
    		]
    	],
    	[
    		[
    			2319,
    			2248
    		],
    		[
    			-244,
    			-11
    		],
    		[
    			-359,
    			-24
    		],
    		[
    			-21,
    			2
    		],
    		[
    			-174,
    			-13
    		],
    		[
    			-93,
    			-8
    		],
    		[
    			-195,
    			-11
    		]
    	],
    	[
    		[
    			1233,
    			2183
    		],
    		[
    			-11,
    			224
    		],
    		[
    			-9,
    			-1
    		],
    		[
    			-16,
    			314
    		],
    		[
    			-6,
    			157
    		]
    	],
    	[
    		[
    			1071,
    			2171
    		],
    		[
    			162,
    			12
    		]
    	],
    	[
    		[
    			2332,
    			1936
    		],
    		[
    			-56,
    			3
    		],
    		[
    			-350,
    			6
    		],
    		[
    			-43,
    			-2
    		],
    		[
    			-206,
    			-23
    		],
    		[
    			1,
    			-24
    		],
    		[
    			-25,
    			-88
    		]
    	],
    	[
    		[
    			757,
    			3481
    		],
    		[
    			-351,
    			-22
    		],
    		[
    			-54,
    			-24
    		],
    		[
    			-49,
    			2
    		]
    	],
    	[
    		[
    			303,
    			3437
    		],
    		[
    			-11,
    			59
    		],
    		[
    			-31,
    			67
    		],
    		[
    			-7,
    			55
    		],
    		[
    			-2,
    			61
    		],
    		[
    			-26,
    			72
    		],
    		[
    			1,
    			52
    		],
    		[
    			-5,
    			44
    		],
    		[
    			-11,
    			35
    		],
    		[
    			6,
    			32
    		],
    		[
    			3,
    			59
    		],
    		[
    			-8,
    			34
    		],
    		[
    			-16,
    			116
    		],
    		[
    			-2,
    			50
    		],
    		[
    			-16,
    			122
    		],
    		[
    			-6,
    			79
    		],
    		[
    			6,
    			60
    		],
    		[
    			-2,
    			28
    		],
    		[
    			-19,
    			53
    		],
    		[
    			-15,
    			76
    		],
    		[
    			11,
    			57
    		],
    		[
    			-5,
    			33
    		]
    	],
    	[
    		[
    			809,
    			2293
    		],
    		[
    			5,
    			15
    		],
    		[
    			-3,
    			72
    		],
    		[
    			-54,
    			1101
    		]
    	],
    	[
    		[
    			371,
    			2302
    		],
    		[
    			6,
    			77
    		],
    		[
    			-20,
    			104
    		],
    		[
    			3,
    			35
    		],
    		[
    			-4,
    			63
    		],
    		[
    			-5,
    			25
    		],
    		[
    			9,
    			110
    		],
    		[
    			-19,
    			75
    		],
    		[
    			-11,
    			12
    		],
    		[
    			11,
    			94
    		],
    		[
    			-21,
    			111
    		],
    		[
    			-15,
    			61
    		],
    		[
    			12,
    			34
    		],
    		[
    			8,
    			88
    		],
    		[
    			-26,
    			132
    		],
    		[
    			-3,
    			40
    		],
    		[
    			7,
    			74
    		]
    	],
    	[
    		[
    			2927,
    			6789
    		],
    		[
    			284,
    			83
    		],
    		[
    			26,
    			14
    		]
    	],
    	[
    		[
    			2956,
    			6158
    		],
    		[
    			-31,
    			615
    		],
    		[
    			2,
    			16
    		]
    	],
    	[
    		[
    			2472,
    			6599
    		],
    		[
    			13,
    			78
    		]
    	],
    	[
    		[
    			2485,
    			6677
    		],
    		[
    			84,
    			-1
    		],
    		[
    			171,
    			53
    		],
    		[
    			62,
    			24
    		],
    		[
    			125,
    			36
    		]
    	],
    	[
    		[
    			2956,
    			6158
    		],
    		[
    			-180,
    			-11
    		],
    		[
    			-124,
    			-10
    		],
    		[
    			-162,
    			-8
    		]
    	],
    	[
    		[
    			1250,
    			6361
    		],
    		[
    			371,
    			25
    		],
    		[
    			-8,
    			157
    		],
    		[
    			187,
    			12
    		]
    	],
    	[
    		[
    			1824,
    			6084
    		],
    		[
    			-181,
    			-13
    		],
    		[
    			-131,
    			-7
    		]
    	],
    	[
    		[
    			1691,
    			6981
    		],
    		[
    			30,
    			-86
    		],
    		[
    			23,
    			-24
    		],
    		[
    			37,
    			9
    		],
    		[
    			5,
    			36
    		],
    		[
    			20,
    			-25
    		],
    		[
    			-32,
    			-46
    		],
    		[
    			43,
    			-126
    		],
    		[
    			112,
    			-43
    		],
    		[
    			51,
    			-13
    		],
    		[
    			67,
    			-23
    		],
    		[
    			63,
    			9
    		],
    		[
    			63,
    			-9
    		],
    		[
    			126,
    			-1
    		],
    		[
    			130,
    			34
    		],
    		[
    			56,
    			4
    		]
    	],
    	[
    		[
    			1236,
    			6709
    		],
    		[
    			62,
    			11
    		],
    		[
    			33,
    			11
    		],
    		[
    			73,
    			57
    		],
    		[
    			60,
    			79
    		],
    		[
    			49,
    			-17
    		],
    		[
    			30,
    			13
    		],
    		[
    			22,
    			-1
    		],
    		[
    			21,
    			12
    		],
    		[
    			22,
    			-12
    		],
    		[
    			37,
    			52
    		],
    		[
    			29,
    			31
    		],
    		[
    			17,
    			36
    		]
    	],
    	[
    		[
    			2523,
    			5487
    		],
    		[
    			-23,
    			472
    		],
    		[
    			-10,
    			170
    		]
    	],
    	[
    		[
    			2091,
    			5775
    		],
    		[
    			-17,
    			325
    		]
    	],
    	[
    		[
    			5802,
    			5484
    		],
    		[
    			-181,
    			207
    		],
    		[
    			-2,
    			8
    		]
    	],
    	[
    		[
    			6414,
    			4769
    		],
    		[
    			-195,
    			-17
    		]
    	],
    	[
    		[
    			5699,
    			4680
    		],
    		[
    			-27,
    			407
    		],
    		[
    			-4,
    			67
    		],
    		[
    			8,
    			98
    		],
    		[
    			-16,
    			35
    		],
    		[
    			-74,
    			349
    		],
    		[
    			3,
    			35
    		]
    	],
    	[
    		[
    			5699,
    			4680
    		],
    		[
    			-257,
    			-23
    		]
    	],
    	[
    		[
    			5442,
    			4657
    		],
    		[
    			-46,
    			700
    		],
    		[
    			-6,
    			76
    		]
    	],
    	[
    		[
    			7616,
    			1243
    		],
    		[
    			16,
    			-15
    		]
    	],
    	[
    		[
    			7647,
    			1217
    		],
    		[
    			6,
    			-6
    		]
    	],
    	[
    		[
    			7662,
    			1203
    		],
    		[
    			8,
    			-6
    		]
    	],
    	[
    		[
    			7677,
    			1190
    		],
    		[
    			3,
    			-3
    		]
    	],
    	[
    		[
    			7680,
    			1187
    		],
    		[
    			2,
    			-1
    		]
    	],
    	[
    		[
    			7685,
    			1184
    		],
    		[
    			8,
    			-7
    		]
    	],
    	[
    		[
    			7711,
    			1165
    		],
    		[
    			1,
    			0
    		]
    	],
    	[
    		[
    			6095,
    			3396
    		],
    		[
    			108,
    			3
    		]
    	],
    	[
    		[
    			6203,
    			3399
    		],
    		[
    			36,
    			1
    		],
    		[
    			104,
    			44
    		],
    		[
    			87,
    			23
    		],
    		[
    			60,
    			19
    		]
    	],
    	[
    		[
    			1691,
    			6981
    		],
    		[
    			12,
    			15
    		],
    		[
    			27,
    			59
    		],
    		[
    			31,
    			42
    		],
    		[
    			22,
    			45
    		],
    		[
    			18,
    			46
    		],
    		[
    			28,
    			63
    		],
    		[
    			17,
    			54
    		],
    		[
    			-13,
    			4
    		],
    		[
    			39,
    			123
    		],
    		[
    			11,
    			53
    		],
    		[
    			28,
    			86
    		],
    		[
    			6,
    			54
    		],
    		[
    			14,
    			9
    		],
    		[
    			31,
    			80
    		],
    		[
    			12,
    			8
    		],
    		[
    			8,
    			60
    		],
    		[
    			12,
    			10
    		],
    		[
    			33,
    			82
    		],
    		[
    			10,
    			54
    		],
    		[
    			7,
    			71
    		],
    		[
    			24,
    			57
    		],
    		[
    			45,
    			162
    		],
    		[
    			19,
    			219
    		],
    		[
    			29,
    			30
    		],
    		[
    			-3,
    			68
    		],
    		[
    			2,
    			45
    		],
    		[
    			-3,
    			64
    		],
    		[
    			16,
    			7
    		],
    		[
    			-2,
    			27
    		],
    		[
    			45,
    			3
    		],
    		[
    			33,
    			-19
    		],
    		[
    			12,
    			-43
    		],
    		[
    			8,
    			-51
    		],
    		[
    			30,
    			-21
    		],
    		[
    			43,
    			-18
    		],
    		[
    			43,
    			-6
    		],
    		[
    			48,
    			-1
    		],
    		[
    			58,
    			-11
    		],
    		[
    			77,
    			-21
    		],
    		[
    			19,
    			-10
    		],
    		[
    			34,
    			70
    		],
    		[
    			36,
    			-19
    		],
    		[
    			-6,
    			-12
    		],
    		[
    			-31,
    			19
    		],
    		[
    			-29,
    			-59
    		],
    		[
    			7,
    			-11
    		],
    		[
    			49,
    			-42
    		],
    		[
    			16,
    			-19
    		],
    		[
    			26,
    			-56
    		],
    		[
    			33,
    			-21
    		],
    		[
    			64,
    			-68
    		],
    		[
    			66,
    			-36
    		],
    		[
    			122,
    			-55
    		],
    		[
    			24,
    			-5
    		],
    		[
    			79,
    			12
    		],
    		[
    			19,
    			-8
    		],
    		[
    			124,
    			28
    		],
    		[
    			32,
    			11
    		],
    		[
    			62,
    			12
    		],
    		[
    			42,
    			18
    		],
    		[
    			59,
    			13
    		],
    		[
    			43,
    			15
    		],
    		[
    			71,
    			33
    		],
    		[
    			11,
    			-7
    		],
    		[
    			58,
    			-10
    		],
    		[
    			50,
    			0
    		],
    		[
    			46,
    			8
    		],
    		[
    			70,
    			24
    		],
    		[
    			48,
    			8
    		],
    		[
    			19,
    			8
    		],
    		[
    			34,
    			-11
    		],
    		[
    			35,
    			16
    		]
    	],
    	[
    		[
    			293,
    			6119
    		],
    		[
    			26,
    			-65
    		],
    		[
    			12,
    			-237
    		],
    		[
    			626,
    			41
    		]
    	],
    	[
    		[
    			102,
    			5286
    		],
    		[
    			3,
    			97
    		],
    		[
    			-5,
    			42
    		],
    		[
    			5,
    			127
    		],
    		[
    			-4,
    			83
    		],
    		[
    			3,
    			93
    		],
    		[
    			-14,
    			113
    		],
    		[
    			-9,
    			23
    		],
    		[
    			-27,
    			12
    		],
    		[
    			-38,
    			64
    		],
    		[
    			8,
    			62
    		],
    		[
    			-21,
    			24
    		],
    		[
    			-3,
    			27
    		],
    		[
    			19,
    			4
    		],
    		[
    			6,
    			60
    		],
    		[
    			-15,
    			45
    		],
    		[
    			49,
    			40
    		],
    		[
    			25,
    			49
    		],
    		[
    			-8,
    			17
    		],
    		[
    			6,
    			26
    		],
    		[
    			18,
    			4
    		],
    		[
    			22,
    			62
    		],
    		[
    			20,
    			22
    		],
    		[
    			-14,
    			16
    		],
    		[
    			8,
    			19
    		],
    		[
    			27,
    			-31
    		],
    		[
    			11,
    			13
    		],
    		[
    			0,
    			32
    		],
    		[
    			36,
    			-3
    		],
    		[
    			32,
    			32
    		],
    		[
    			53,
    			11
    		]
    	],
    	[
    		[
    			5442,
    			4657
    		],
    		[
    			-257,
    			-23
    		]
    	],
    	[
    		[
    			5185,
    			4634
    		],
    		[
    			-17,
    			232
    		],
    		[
    			-10,
    			177
    		],
    		[
    			-7,
    			93
    		],
    		[
    			-14,
    			16
    		]
    	],
    	[
    		[
    			5442,
    			4657
    		],
    		[
    			45,
    			-676
    		]
    	],
    	[
    		[
    			5487,
    			3981
    		],
    		[
    			-258,
    			-22
    		]
    	],
    	[
    		[
    			5229,
    			3959
    		],
    		[
    			-9,
    			135
    		]
    	],
    	[
    		[
    			5744,
    			4004
    		],
    		[
    			-257,
    			-23
    		]
    	],
    	[
    		[
    			5527,
    			3379
    		],
    		[
    			-40,
    			602
    		]
    	],
    	[
    		[
    			5462,
    			3376
    		],
    		[
    			-53,
    			-5
    		],
    		[
    			-34,
    			-10
    		],
    		[
    			-115,
    			-11
    		]
    	],
    	[
    		[
    			5260,
    			3350
    		],
    		[
    			-5,
    			68
    		],
    		[
    			9,
    			2
    		],
    		[
    			-19,
    			270
    		]
    	],
    	[
    		[
    			5245,
    			3690
    		],
    		[
    			-16,
    			269
    		]
    	],
    	[
    		[
    			5245,
    			3690
    		],
    		[
    			-525,
    			-46
    		]
    	],
    	[
    		[
    			4720,
    			3644
    		],
    		[
    			-27,
    			404
    		]
    	],
    	[
    		[
    			4720,
    			3644
    		],
    		[
    			-129,
    			-13
    		],
    		[
    			-379,
    			-32
    		],
    		[
    			-27,
    			0
    		]
    	],
    	[
    		[
    			4720,
    			3644
    		],
    		[
    			23,
    			-338
    		]
    	],
    	[
    		[
    			4743,
    			3306
    		],
    		[
    			-257,
    			-21
    		],
    		[
    			-9,
    			136
    		],
    		[
    			-143,
    			-2
    		],
    		[
    			-41,
    			-2
    		],
    		[
    			-30,
    			-12
    		],
    		[
    			-35,
    			-24
    		],
    		[
    			-38,
    			-58
    		],
    		[
    			-46,
    			-62
    		],
    		[
    			-35,
    			-7
    		]
    	],
    	[
    		[
    			5260,
    			3350
    		],
    		[
    			-387,
    			-33
    		]
    	],
    	[
    		[
    			4873,
    			3317
    		],
    		[
    			-130,
    			-11
    		]
    	],
    	[
    		[
    			5347,
    			2883
    		],
    		[
    			-440,
    			-38
    		]
    	],
    	[
    		[
    			4907,
    			2845
    		],
    		[
    			-4,
    			7
    		],
    		[
    			-26,
    			398
    		],
    		[
    			-4,
    			67
    		]
    	],
    	[
    		[
    			4907,
    			2845
    		],
    		[
    			-91,
    			-6
    		],
    		[
    			-27,
    			13
    		],
    		[
    			-20,
    			-1
    		],
    		[
    			-7,
    			107
    		],
    		[
    			3,
    			10
    		],
    		[
    			-131,
    			-11
    		],
    		[
    			2,
    			-39
    		],
    		[
    			8,
    			-66
    		],
    		[
    			-11,
    			-26
    		],
    		[
    			-13,
    			42
    		],
    		[
    			-39,
    			65
    		],
    		[
    			-44,
    			46
    		],
    		[
    			-134,
    			116
    		],
    		[
    			-31,
    			42
    		],
    		[
    			-71,
    			-6
    		],
    		[
    			-6,
    			-27
    		],
    		[
    			-38,
    			-38
    		],
    		[
    			-36,
    			-9
    		],
    		[
    			-15,
    			-43
    		],
    		[
    			-50,
    			-40
    		],
    		[
    			-23,
    			-6
    		],
    		[
    			-30,
    			20
    		],
    		[
    			-44,
    			20
    		],
    		[
    			-11,
    			12
    		],
    		[
    			-11,
    			63
    		],
    		[
    			-14,
    			40
    		],
    		[
    			-46,
    			69
    		],
    		[
    			-28,
    			9
    		],
    		[
    			-6,
    			46
    		]
    	],
    	[
    		[
    			4907,
    			2845
    		],
    		[
    			8,
    			-125
    		],
    		[
    			-59,
    			-47
    		],
    		[
    			34,
    			-55
    		],
    		[
    			51,
    			3
    		],
    		[
    			62,
    			-17
    		],
    		[
    			30,
    			-30
    		],
    		[
    			0,
    			-25
    		],
    		[
    			-153,
    			-145
    		],
    		[
    			-64,
    			-62
    		],
    		[
    			-25,
    			-3
    		],
    		[
    			-87,
    			118
    		],
    		[
    			-19,
    			1
    		],
    		[
    			17,
    			-89
    		],
    		[
    			-57,
    			-73
    		],
    		[
    			-26,
    			-119
    		]
    	],
    	[
    		[
    			7595,
    			4989
    		],
    		[
    			1,
    			-19
    		],
    		[
    			117,
    			11
    		],
    		[
    			3,
    			-30
    		],
    		[
    			-179,
    			-16
    		],
    		[
    			-3,
    			-27
    		],
    		[
    			-35,
    			-73
    		],
    		[
    			5,
    			-30
    		],
    		[
    			-1,
    			-56
    		],
    		[
    			-17,
    			-31
    		],
    		[
    			8,
    			-11
    		],
    		[
    			-18,
    			-29
    		],
    		[
    			41,
    			-20
    		],
    		[
    			60,
    			5
    		],
    		[
    			4,
    			-89
    		],
    		[
    			25,
    			-18
    		],
    		[
    			23,
    			2
    		],
    		[
    			-10,
    			162
    		],
    		[
    			9,
    			0
    		],
    		[
    			10,
    			-151
    		],
    		[
    			41,
    			3
    		],
    		[
    			-18,
    			21
    		],
    		[
    			-10,
    			135
    		],
    		[
    			19,
    			9
    		],
    		[
    			17,
    			-10
    		],
    		[
    			11,
    			-153
    		],
    		[
    			48,
    			4
    		],
    		[
    			-13,
    			189
    		],
    		[
    			10,
    			0
    		],
    		[
    			13,
    			-188
    		],
    		[
    			21,
    			2
    		],
    		[
    			4,
    			197
    		],
    		[
    			14,
    			17
    		],
    		[
    			27,
    			-12
    		],
    		[
    			-2,
    			-217
    		],
    		[
    			-134,
    			-12
    		],
    		[
    			77,
    			-122
    		],
    		[
    			18,
    			1
    		],
    		[
    			-9,
    			124
    		],
    		[
    			30,
    			2
    		],
    		[
    			11,
    			-168
    		],
    		[
    			31,
    			3
    		],
    		[
    			-18,
    			266
    		],
    		[
    			13,
    			0
    		],
    		[
    			17,
    			-265
    		],
    		[
    			52,
    			4
    		],
    		[
    			-17,
    			271
    		],
    		[
    			16,
    			1
    		],
    		[
    			19,
    			-298
    		],
    		[
    			-120,
    			-23
    		],
    		[
    			-3,
    			-30
    		],
    		[
    			6,
    			-83
    		],
    		[
    			-14,
    			-53
    		],
    		[
    			12,
    			-153
    		],
    		[
    			28,
    			-28
    		],
    		[
    			0,
    			-28
    		],
    		[
    			-35,
    			-13
    		],
    		[
    			-21,
    			7
    		],
    		[
    			-139,
    			-20
    		],
    		[
    			6,
    			-25
    		],
    		[
    			25,
    			9
    		],
    		[
    			32,
    			-11
    		],
    		[
    			14,
    			-27
    		],
    		[
    			-7,
    			-15
    		],
    		[
    			6,
    			-50
    		],
    		[
    			14,
    			-13
    		],
    		[
    			25,
    			-1
    		],
    		[
    			25,
    			-13
    		]
    	],
    	[
    		[
    			6529,
    			3912
    		],
    		[
    			-195,
    			-17
    		],
    		[
    			-1,
    			24
    		],
    		[
    			-57,
    			-5
    		]
    	],
    	[
    		[
    			6171,
    			3905
    		],
    		[
    			-1,
    			-15
    		],
    		[
    			33,
    			-491
    		]
    	],
    	[
    		[
    			6915,
    			2450
    		],
    		[
    			-99,
    			-156
    		],
    		[
    			-8,
    			-84
    		],
    		[
    			-14,
    			-57
    		],
    		[
    			-84,
    			-112
    		],
    		[
    			35,
    			-51
    		],
    		[
    			-51,
    			-19
    		],
    		[
    			26,
    			-93
    		],
    		[
    			-1,
    			-8
    		]
    	]
    ];
    var transform$1 = {
    	scale: [
    		0.000017119821586414905,
    		0.000011847330725509989
    	],
    	translate: [
    		-122.5148972313244,
    		37.708132
    	]
    };
    var objects = {
    	tl_2019_06_tract: {
    		type: "GeometryCollection",
    		geometries: [
    			{
    				arcs: [
    					[
    						0,
    						1,
    						2,
    						3,
    						4,
    						5,
    						6
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025200"
    				}
    			},
    			{
    				arcs: [
    					[
    						7,
    						8,
    						9,
    						-7,
    						10,
    						11
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025300"
    				}
    			},
    			{
    				arcs: [
    					[
    						12,
    						-5,
    						13,
    						14,
    						15
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025402"
    				}
    			},
    			{
    				arcs: [
    					[
    						16,
    						17,
    						18,
    						19,
    						20,
    						21,
    						22
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025500"
    				}
    			},
    			{
    				arcs: [
    					[
    						23,
    						24,
    						25,
    						26,
    						27,
    						-20
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025600"
    				}
    			},
    			{
    				arcs: [
    					[
    						28,
    						29,
    						30,
    						31
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-26,
    						32,
    						33,
    						-32,
    						34,
    						35
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025900"
    				}
    			},
    			{
    				arcs: [
    					[
    						-28,
    						36,
    						37,
    						38,
    						-21
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026002"
    				}
    			},
    			{
    				arcs: [
    					[
    						39,
    						40,
    						41,
    						42,
    						43
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026004"
    				}
    			},
    			{
    				arcs: [
    					[
    						44,
    						45,
    						46,
    						47,
    						48,
    						49
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020500"
    				}
    			},
    			{
    				arcs: [
    					[
    						50,
    						51,
    						52,
    						53,
    						54,
    						55,
    						56,
    						57,
    						58,
    						59,
    						60,
    						61,
    						62,
    						63,
    						64,
    						65,
    						66,
    						67,
    						68,
    						69,
    						70,
    						71,
    						72,
    						73,
    						74,
    						75,
    						76,
    						77,
    						78,
    						79,
    						80,
    						81,
    						82,
    						83,
    						84,
    						85,
    						86,
    						87,
    						88,
    						89,
    						90,
    						91,
    						92,
    						93,
    						94,
    						95,
    						96,
    						97,
    						98,
    						99,
    						100,
    						101,
    						102,
    						103,
    						104,
    						105,
    						106,
    						107,
    						108,
    						109,
    						110,
    						111,
    						112,
    						113,
    						114,
    						115,
    						116,
    						117,
    						118,
    						119,
    						120,
    						121,
    						122,
    						123,
    						124,
    						125,
    						126,
    						127,
    						128,
    						129,
    						130,
    						131,
    						132,
    						133,
    						134,
    						135,
    						136,
    						137,
    						138,
    						139,
    						140,
    						141,
    						142,
    						143,
    						144,
    						145,
    						146,
    						147,
    						148,
    						149,
    						150,
    						151,
    						152,
    						153,
    						154,
    						155,
    						156,
    						157,
    						158,
    						159,
    						160,
    						161,
    						162,
    						163,
    						164,
    						165,
    						166,
    						167
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "061000"
    				}
    			},
    			{
    				arcs: [
    					[
    						168,
    						-23,
    						169,
    						-44,
    						170,
    						171,
    						172
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026100"
    				}
    			},
    			{
    				arcs: [
    					[
    						173,
    						174,
    						-172,
    						175,
    						176,
    						177
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026200"
    				}
    			},
    			{
    				arcs: [
    					[
    						178,
    						179,
    						180,
    						181,
    						182,
    						183,
    						184,
    						185
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "060400"
    				}
    			},
    			{
    				arcs: [
    					[
    						-176,
    						-171,
    						-43,
    						186,
    						187
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026301"
    				}
    			},
    			{
    				arcs: [
    					[
    						-187,
    						-42,
    						188,
    						189,
    						190,
    						191,
    						192
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026302"
    				}
    			},
    			{
    				arcs: [
    					[
    						193,
    						194,
    						195,
    						-50,
    						196,
    						197
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020401"
    				}
    			},
    			{
    				arcs: [
    					[
    						-188,
    						-193,
    						198,
    						-177
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026303"
    				}
    			},
    			{
    				arcs: [
    					[
    						199,
    						200,
    						201,
    						202,
    						203
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026401"
    				}
    			},
    			{
    				arcs: [
    					[
    						-35,
    						-31,
    						204,
    						-52,
    						205,
    						-200,
    						206
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026402"
    				}
    			},
    			{
    				arcs: [
    					[
    						-201,
    						-206,
    						-51,
    						207,
    						208
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026403"
    				}
    			},
    			{
    				arcs: [
    					[
    						209,
    						210,
    						211,
    						212,
    						213
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030101"
    				}
    			},
    			{
    				arcs: [
    					[
    						-212,
    						214,
    						215,
    						-194,
    						216,
    						217,
    						218
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030102"
    				}
    			},
    			{
    				arcs: [
    					[
    						219,
    						220,
    						221,
    						222
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030201"
    				}
    			},
    			{
    				arcs: [
    					[
    						-222,
    						223,
    						-213,
    						-219,
    						224,
    						225,
    						226,
    						227
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030301"
    				}
    			},
    			{
    				arcs: [
    					[
    						-226,
    						228,
    						229,
    						230
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030302"
    				}
    			},
    			{
    				arcs: [
    					[
    						-229,
    						-225,
    						-218,
    						231,
    						232,
    						233,
    						234
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030400"
    				}
    			},
    			{
    				arcs: [
    					[
    						[
    							235,
    							236,
    							237,
    							238,
    							239,
    							240,
    							241,
    							242,
    							243,
    							244,
    							245,
    							246
    						]
    					],
    					[
    						[
    							247
    						]
    					]
    				],
    				type: "MultiPolygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "060700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-217,
    						-198,
    						248,
    						249,
    						250,
    						-232
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030500"
    				}
    			},
    			{
    				arcs: [
    					[
    						-251,
    						251,
    						252,
    						253,
    						-233
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-253,
    						254,
    						255,
    						256,
    						257
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-234,
    						-254,
    						-258,
    						258,
    						259,
    						260
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-197,
    						-49,
    						261,
    						262,
    						263,
    						264,
    						-249
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020402"
    				}
    			},
    			{
    				arcs: [
    					[
    						265,
    						266,
    						267,
    						-237,
    						268,
    						269,
    						270
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "061500"
    				}
    			},
    			{
    				arcs: [
    					[
    						274,
    						275,
    						276,
    						277,
    						278,
    						279,
    						280
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "061400"
    				}
    			},
    			{
    				arcs: [
    					[
    						-279,
    						281,
    						282,
    						283,
    						284,
    						285,
    						286,
    						287
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "980900"
    				}
    			},
    			{
    				arcs: [
    					[
    						288,
    						-215,
    						-211,
    						289,
    						290
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017102"
    				}
    			},
    			{
    				arcs: [
    					[
    						291,
    						292,
    						293,
    						294
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012302"
    				}
    			},
    			{
    				arcs: [
    					[
    						295,
    						296,
    						297,
    						298,
    						299
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016801"
    				}
    			},
    			{
    				arcs: [
    					[
    						300,
    						301,
    						302,
    						303,
    						304
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011902"
    				}
    			},
    			{
    				arcs: [
    					[
    						305,
    						-295,
    						306,
    						307,
    						308
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012201"
    				}
    			},
    			{
    				arcs: [
    					[
    						309,
    						-309,
    						310,
    						311,
    						312
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012202"
    				}
    			},
    			{
    				arcs: [
    					[
    						-311,
    						313,
    						314,
    						315,
    						316,
    						317,
    						318,
    						319,
    						320
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012402"
    				}
    			},
    			{
    				arcs: [
    					[
    						321,
    						322,
    						323,
    						324
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012601"
    				}
    			},
    			{
    				arcs: [
    					[
    						341,
    						342,
    						343,
    						344,
    						345,
    						346,
    						347,
    						348,
    						349,
    						350,
    						351,
    						352,
    						353,
    						354,
    						355,
    						356,
    						357,
    						358,
    						-322,
    						359,
    						360,
    						361,
    						362,
    						363,
    						364,
    						365,
    						366,
    						367,
    						368,
    						369,
    						370,
    						371,
    						372,
    						373,
    						374,
    						375,
    						376,
    						377,
    						378,
    						379,
    						380,
    						381,
    						382,
    						383,
    						384,
    						385,
    						386,
    						387,
    						388,
    						389,
    						390,
    						391,
    						392,
    						393,
    						394,
    						395,
    						396,
    						397,
    						398,
    						399,
    						400,
    						401,
    						402,
    						403,
    						404,
    						405,
    						406,
    						407,
    						408,
    						409,
    						410,
    						411,
    						412,
    						413,
    						414,
    						415,
    						416,
    						417,
    						418,
    						419,
    						420,
    						421,
    						422,
    						423,
    						424,
    						425,
    						426,
    						427,
    						428,
    						429,
    						430,
    						431,
    						432,
    						433,
    						434,
    						435,
    						436,
    						437,
    						438,
    						439,
    						440,
    						441,
    						442,
    						443,
    						444,
    						445,
    						446,
    						447,
    						448,
    						449,
    						450,
    						451,
    						452,
    						453,
    						454,
    						455,
    						456,
    						457,
    						458,
    						459,
    						460,
    						461,
    						462,
    						463,
    						464,
    						465,
    						466,
    						467,
    						468,
    						469,
    						470,
    						471,
    						472,
    						473,
    						474,
    						475,
    						476,
    						477,
    						478,
    						479,
    						480,
    						481,
    						482,
    						483,
    						484,
    						485,
    						486,
    						487,
    						488,
    						489,
    						490,
    						491,
    						492,
    						493,
    						494,
    						495,
    						496,
    						497,
    						498,
    						499,
    						500,
    						501,
    						502,
    						503,
    						504,
    						505
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012602"
    				}
    			},
    			{
    				arcs: [
    					[
    						-359,
    						506,
    						507,
    						508,
    						509,
    						-323
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012902"
    				}
    			},
    			{
    				arcs: [
    					[
    						510,
    						511,
    						512,
    						513,
    						514
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013101"
    				}
    			},
    			{
    				arcs: [
    					[
    						515,
    						-515,
    						516,
    						517,
    						518,
    						519,
    						520
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013102"
    				}
    			},
    			{
    				arcs: [
    					[
    						521,
    						522,
    						523,
    						524,
    						525,
    						526
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015801"
    				}
    			},
    			{
    				arcs: [
    					[
    						527,
    						528,
    						-319,
    						529,
    						530,
    						-296
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016802"
    				}
    			},
    			{
    				arcs: [
    					[
    						531,
    						532,
    						533,
    						-195,
    						-216,
    						-289
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017101"
    				}
    			},
    			{
    				arcs: [
    					[
    						534,
    						-270,
    						535,
    						536
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017801"
    				}
    			},
    			{
    				arcs: [
    					[
    						537,
    						-537,
    						538,
    						539
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017802"
    				}
    			},
    			{
    				arcs: [
    					[
    						540,
    						-246,
    						541,
    						-276,
    						542
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022704"
    				}
    			},
    			{
    				arcs: [
    					[
    						543,
    						-15,
    						544,
    						545,
    						546,
    						-33,
    						-25
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025701"
    				}
    			},
    			{
    				arcs: [
    					[
    						-547,
    						547,
    						548,
    						-29,
    						-34
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025702"
    				}
    			},
    			{
    				arcs: [
    					[
    						549,
    						550,
    						551,
    						552,
    						553,
    						554
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031201"
    				}
    			},
    			{
    				arcs: [
    					[
    						555,
    						-169,
    						556,
    						-552
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031202"
    				}
    			},
    			{
    				arcs: [
    					[
    						557,
    						558,
    						-227,
    						559,
    						560
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032602"
    				}
    			},
    			{
    				arcs: [
    					[
    						561,
    						-230,
    						-235,
    						562,
    						563
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032801"
    				}
    			},
    			{
    				arcs: [
    					[
    						-560,
    						-231,
    						-562,
    						564,
    						565
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032802"
    				}
    			},
    			{
    				arcs: [
    					[
    						566,
    						-565,
    						-564,
    						567,
    						568
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032901"
    				}
    			},
    			{
    				arcs: [
    					[
    						569,
    						570,
    						571,
    						-184
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "033203"
    				}
    			},
    			{
    				arcs: [
    					[
    						572,
    						573,
    						-570,
    						-183
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "033204"
    				}
    			},
    			{
    				arcs: [
    					[
    						574,
    						575,
    						576,
    						577,
    						578
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "042601"
    				}
    			},
    			{
    				arcs: [
    					[
    						579,
    						580,
    						581,
    						-576
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "042602"
    				}
    			},
    			{
    				arcs: [
    					[
    						582,
    						583,
    						584,
    						585,
    						586
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047801"
    				}
    			},
    			{
    				arcs: [
    					[
    						587,
    						588,
    						589,
    						590,
    						591,
    						592
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "061100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-286,
    						593,
    						594,
    						595,
    						596
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "061200"
    				}
    			},
    			{
    				arcs: [
    					[
    						597,
    						598,
    						-586,
    						599,
    						600,
    						601,
    						602,
    						603,
    						604,
    						605,
    						606,
    						-290,
    						-210,
    						607,
    						-220,
    						608,
    						-558,
    						609,
    						610,
    						611,
    						612,
    						613
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "980300"
    				}
    			},
    			{
    				arcs: [
    					[
    						614,
    						615,
    						616
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012502"
    				}
    			},
    			{
    				arcs: [
    					[
    						617,
    						618,
    						619,
    						620,
    						621,
    						622
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "980200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-285,
    						623,
    						624,
    						-594
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023102"
    				}
    			},
    			{
    				arcs: [
    					[
    						625,
    						-595,
    						-625,
    						626,
    						627,
    						628,
    						629,
    						630,
    						631,
    						632,
    						633,
    						634,
    						635,
    						636,
    						637,
    						638,
    						639,
    						640,
    						641,
    						642,
    						643,
    						644,
    						645,
    						646,
    						647,
    						648,
    						649,
    						650,
    						651,
    						652,
    						653,
    						654,
    						655,
    						656,
    						657,
    						658,
    						659,
    						660,
    						661,
    						662,
    						663,
    						664,
    						665,
    						666,
    						667,
    						668,
    						669,
    						670,
    						671,
    						672,
    						673,
    						674,
    						675,
    						676,
    						677,
    						678,
    						679,
    						680,
    						681,
    						682,
    						683,
    						684,
    						685,
    						686,
    						687,
    						688,
    						689,
    						690,
    						691,
    						692,
    						693,
    						694,
    						695,
    						696,
    						697,
    						698,
    						699,
    						700,
    						701,
    						702,
    						703,
    						704,
    						705,
    						706,
    						707,
    						708,
    						709,
    						710,
    						711,
    						712,
    						713,
    						714,
    						715,
    						716,
    						717,
    						718,
    						719,
    						720,
    						721,
    						722,
    						723,
    						724,
    						725,
    						726,
    						727,
    						728,
    						729,
    						730,
    						731,
    						732,
    						733,
    						734,
    						735,
    						736,
    						737,
    						738,
    						739,
    						740,
    						741,
    						742,
    						743,
    						744,
    						745,
    						746,
    						747,
    						748,
    						749,
    						750,
    						751,
    						752,
    						753,
    						754,
    						755,
    						756,
    						757,
    						758,
    						759,
    						760,
    						761,
    						762,
    						763,
    						764,
    						765,
    						766,
    						767,
    						768,
    						769
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023200"
    				}
    			},
    			{
    				arcs: [
    					[
    						770,
    						-770,
    						771,
    						-53,
    						-205,
    						-30,
    						-549,
    						772
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023300"
    				}
    			},
    			{
    				arcs: [
    					[
    						773,
    						774,
    						-2,
    						775
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022901"
    				}
    			},
    			{
    				arcs: [
    					[
    						776,
    						777,
    						778,
    						779,
    						-774,
    						780,
    						781
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022803"
    				}
    			},
    			{
    				arcs: [
    					[
    						782,
    						783,
    						-600,
    						-585
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047702"
    				}
    			},
    			{
    				arcs: [
    					[
    						-612,
    						784,
    						785
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "035202"
    				}
    			},
    			{
    				arcs: [
    					[
    						786,
    						787,
    						788,
    						-47
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020600"
    				}
    			},
    			{
    				arcs: [
    					[
    						789,
    						790,
    						791,
    						792,
    						793
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013300"
    				}
    			},
    			{
    				arcs: [
    					[
    						794,
    						795,
    						-16,
    						-544,
    						-24,
    						-19
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025403"
    				}
    			},
    			{
    				arcs: [
    					[
    						-245,
    						796,
    						-277,
    						-542
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022702"
    				}
    			},
    			{
    				arcs: [
    					[
    						-608,
    						-214,
    						-224,
    						-221
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030202"
    				}
    			},
    			{
    				arcs: [
    					[
    						797,
    						798,
    						-306,
    						-310,
    						799
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-22,
    						-39,
    						800,
    						-40,
    						-170
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026001"
    				}
    			},
    			{
    				arcs: [
    					[
    						-801,
    						-38,
    						801,
    						-189,
    						-41
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026003"
    				}
    			},
    			{
    				arcs: [
    					[
    						-202,
    						-209,
    						802,
    						803
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "026404"
    				}
    			},
    			{
    				arcs: [
    					[
    						-11,
    						-6,
    						-13,
    						-796,
    						804
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025401"
    				}
    			},
    			{
    				arcs: [
    					[
    						805,
    						806,
    						807,
    						808,
    						809,
    						-524
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016100"
    				}
    			},
    			{
    				arcs: [
    					[
    						810,
    						811,
    						812,
    						-513,
    						813
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-611,
    						814,
    						815,
    						816,
    						817,
    						-785
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "035100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-203,
    						-804,
    						818,
    						-191,
    						819
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "060502"
    				}
    			},
    			{
    				arcs: [
    					[
    						820,
    						821,
    						-603,
    						822
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "045100"
    				}
    			},
    			{
    				arcs: [
    					[
    						823,
    						824,
    						-605
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016500"
    				}
    			},
    			{
    				arcs: [
    					[
    						825,
    						826,
    						827,
    						828
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015300"
    				}
    			},
    			{
    				arcs: [
    					[
    						829,
    						-520,
    						830,
    						831
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013500"
    				}
    			},
    			{
    				arcs: [
    					[
    						-284,
    						832,
    						833,
    						-627,
    						-624
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023103"
    				}
    			},
    			{
    				arcs: [
    					[
    						834,
    						835,
    						-777,
    						836
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022801"
    				}
    			},
    			{
    				arcs: [
    					[
    						-536,
    						-269,
    						-236,
    						837,
    						-539
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "018000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-509,
    						838,
    						-511,
    						-516,
    						839,
    						840
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-802,
    						-37,
    						-27,
    						-36,
    						-207,
    						-204,
    						-820,
    						-190
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "980501"
    				}
    			},
    			{
    				arcs: [
    					[
    						-834,
    						841,
    						-628
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "980600"
    				}
    			},
    			{
    				arcs: [
    					[
    						983,
    						984,
    						985,
    						986,
    						987
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010100"
    				}
    			},
    			{
    				arcs: [
    					[
    						[
    							-987,
    							991,
    							992,
    							-508,
    							993,
    							-357,
    							994
    						]
    					],
    					[
    						[
    							-342,
    							1000,
    							-340,
    							1001,
    							-338,
    							1002,
    							-336,
    							1003,
    							-334,
    							1004,
    							-332,
    							-330,
    							1005,
    							-328,
    							1006,
    							-326,
    							1007
    						]
    					]
    				],
    				type: "MultiPolygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-986,
    						1008,
    						1009,
    						1010,
    						1011,
    						-992
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010300"
    				}
    			},
    			{
    				arcs: [
    					[
    						-985,
    						1012,
    						1013,
    						1014,
    						-1009
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010400"
    				}
    			},
    			{
    				arcs: [
    					[
    						-984,
    						1015,
    						-267,
    						1016,
    						-590,
    						1017,
    						-1013
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010500"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1018,
    						-589,
    						1018,
    						-1014
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1015,
    						-1019,
    						-588,
    						1019,
    						1020,
    						-1010
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1011,
    						-1021,
    						1021,
    						1022,
    						-811,
    						1023
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-993,
    						-1012,
    						-1024,
    						-814,
    						-512,
    						-839
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "010900"
    				}
    			},
    			{
    				arcs: [
    					[
    						-813,
    						1024,
    						1025,
    						-798,
    						1026,
    						-517,
    						-514
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1023,
    						1027,
    						-301,
    						1028,
    						-1025,
    						-812
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1020,
    						-593,
    						1029,
    						-302,
    						-1028,
    						-1022
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011300"
    				}
    			},
    			{
    				arcs: [
    					[
    						-303,
    						1030,
    						-591,
    						-1017,
    						-266,
    						1031,
    						1032,
    						1033,
    						-293,
    						1034
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-592,
    						-1031,
    						-1030
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-360,
    						-325,
    						1103,
    						1104,
    						1105
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1104,
    						-324,
    						-510,
    						-841,
    						1106,
    						1107
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1107,
    						-840,
    						-521,
    						-830,
    						1108,
    						-791,
    						1109
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1109,
    						-832,
    						-826,
    						1110,
    						-792
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "013400"
    				}
    			},
    			{
    				arcs: [
    					[
    						1111,
    						-304,
    						-1035,
    						-292,
    						-799
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-518,
    						-1027,
    						-800,
    						-313,
    						1112,
    						1113,
    						1114,
    						1115
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-831,
    						-519,
    						-1116,
    						1116,
    						-827
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-793,
    						-1111,
    						-829,
    						1117,
    						-527,
    						1118,
    						1119,
    						1120
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015400"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1119,
    						-526,
    						1121,
    						-824,
    						1122
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1114,
    						1123,
    						-806,
    						-523,
    						1124
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015900"
    				}
    			},
    			{
    				arcs: [
    					[
    						-312,
    						-321,
    						1125,
    						-807,
    						-1124,
    						-1113
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-808,
    						-1126,
    						-320,
    						-529,
    						1126
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-809,
    						-1127,
    						-528,
    						-300,
    						1127
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016300"
    				}
    			},
    			{
    				arcs: [
    					[
    						1128,
    						-1128,
    						1129,
    						-606,
    						-825
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016400"
    				}
    			},
    			{
    				arcs: [
    					[
    						1130,
    						-532,
    						-291,
    						-607
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-828,
    						-1117,
    						-1115,
    						-1125,
    						-522,
    						-1118
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015500"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1120,
    						-1123,
    						-604,
    						-822
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1131,
    						-1130,
    						-299,
    						1131,
    						1132,
    						-533
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1132,
    						-298,
    						1133,
    						1134,
    						1135
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "016900"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1133,
    						-1136,
    						-45,
    						-196,
    						-534
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1029,
    						-305,
    						-1112,
    						-1026
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "011901"
    				}
    			},
    			{
    				arcs: [
    					[
    						-308,
    						-617,
    						1136,
    						-314
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012401"
    				}
    			},
    			{
    				arcs: [
    					[
    						-616,
    						1137,
    						-1033,
    						1138,
    						-315,
    						-1137
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012501"
    				}
    			},
    			{
    				arcs: [
    					[
    						-358,
    						-994,
    						-507
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012901"
    				}
    			},
    			{
    				arcs: [
    					[
    						-525,
    						-810,
    						-1129,
    						-1122
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "015802"
    				}
    			},
    			{
    				arcs: [
    					[
    						-554,
    						1139,
    						1140,
    						1141
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031301"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1141,
    						1142,
    						-174,
    						1143,
    						-185,
    						-572
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031302"
    				}
    			},
    			{
    				arcs: [
    					[
    						-609,
    						-223,
    						-228,
    						-559
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032601"
    				}
    			},
    			{
    				arcs: [
    					[
    						1144,
    						-566,
    						-567,
    						1145,
    						-816
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032902"
    				}
    			},
    			{
    				arcs: [
    					[
    						-620,
    						1146,
    						-587,
    						-599,
    						1147,
    						1148
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047802"
    				}
    			},
    			{
    				arcs: [
    					[
    						-294,
    						-1034,
    						-1138,
    						-615,
    						-307
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "012301"
    				}
    			},
    			{
    				arcs: [
    					[
    						1149,
    						1150,
    						-259,
    						1151,
    						-555,
    						-1142,
    						-571,
    						-574
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "030900"
    				}
    			},
    			{
    				arcs: [
    					[
    						-256,
    						1152,
    						1153,
    						-17,
    						-556,
    						-551,
    						1154
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-553,
    						-557,
    						-173,
    						-175,
    						-1143,
    						-1140
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031400"
    				}
    			},
    			{
    				arcs: [
    					[
    						-257,
    						-1155,
    						-550,
    						-1152
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "031000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-610,
    						-561,
    						-1145,
    						-815
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "032700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-568,
    						-563,
    						-261,
    						1155,
    						1156
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "033000"
    				}
    			},
    			{
    				arcs: [
    					[
    						1157,
    						-1156,
    						-260,
    						-1151,
    						1158,
    						-181
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "033100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1150,
    						-573,
    						-182,
    						-1159
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "033201"
    				}
    			},
    			{
    				arcs: [
    					[
    						-613,
    						-786,
    						-818,
    						1159,
    						1160
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "035201"
    				}
    			},
    			{
    				arcs: [
    					[
    						-817,
    						-1146,
    						-569,
    						-1157,
    						-1158,
    						-180,
    						1161
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "035300"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1160,
    						-1162,
    						-179,
    						1162
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "035400"
    				}
    			},
    			{
    				arcs: [
    					[
    						1163,
    						-794,
    						-1121,
    						-821,
    						1164
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "040100"
    				}
    			},
    			{
    				arcs: [
    					[
    						1165,
    						1166,
    						-1165,
    						1167,
    						-581
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "040200"
    				}
    			},
    			{
    				arcs: [
    					[
    						1168,
    						-579,
    						1169,
    						-583,
    						-1147,
    						-619
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "042700"
    				}
    			},
    			{
    				arcs: [
    					[
    						1170,
    						-1166,
    						-580,
    						-575,
    						-1169,
    						-618,
    						1171
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "042800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1168,
    						-823,
    						-602,
    						1172
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "045200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-577,
    						-582,
    						-1173,
    						-601,
    						-784,
    						1173
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-316,
    						-1139,
    						-1032,
    						-271,
    						-535,
    						-538,
    						1174
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017601"
    				}
    			},
    			{
    				arcs: [
    					[
    						-317,
    						-1175,
    						-540,
    						-838,
    						-247,
    						-541,
    						1175,
    						-835,
    						1176
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "017700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-530,
    						-318,
    						-1177,
    						1177,
    						1178
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-769,
    						1179,
    						-915,
    						1180,
    						-913,
    						-911,
    						1181,
    						-909,
    						-907,
    						-905,
    						1182,
    						1183,
    						-903,
    						1184,
    						-901,
    						1185,
    						-899,
    						-54,
    						-772
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023400"
    				}
    			},
    			{
    				arcs: [
    					[
    						1186,
    						1187,
    						-280,
    						-288,
    						-545,
    						-14,
    						-4
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "025100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1170,
    						-578,
    						-1174,
    						-783,
    						-584
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047701"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1105,
    						-1108,
    						-1110,
    						-790,
    						-1164,
    						-1167,
    						-1171,
    						1188
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "060100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-622,
    						1189,
    						-1148,
    						-598,
    						1190
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047901"
    				}
    			},
    			{
    				arcs: [
    					[
    						-621,
    						-1149,
    						-1190
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "047902"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1134,
    						-297,
    						-531,
    						-1179,
    						1191,
    						1192
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1135,
    						-1193,
    						-787,
    						-46
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020300"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1192,
    						1193,
    						1194,
    						1195,
    						-788
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1178,
    						-837,
    						-782,
    						1196,
    						-1194
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1197,
    						-781,
    						-776,
    						-1,
    						-10,
    						1197
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "020900"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1195,
    						-1198,
    						-9,
    						1198,
    						1199,
    						1200
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021000"
    				}
    			},
    			{
    				arcs: [
    					[
    						-789,
    						-1196,
    						-1201,
    						1201,
    						1202
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021100"
    				}
    			},
    			{
    				arcs: [
    					[
    						-48,
    						-1203,
    						1203,
    						-262
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021200"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1204,
    						1204,
    						1205,
    						-263
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021300"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1202,
    						-1200,
    						1206,
    						1207,
    						-1205
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021400"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1207,
    						-1199,
    						-8,
    						1208,
    						1209
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021500"
    				}
    			},
    			{
    				arcs: [
    					[
    						-264,
    						-1206,
    						-1208,
    						-1210,
    						1210
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-250,
    						-265,
    						-1211,
    						1211,
    						-1153,
    						-255,
    						-252
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021700"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1209,
    						-12,
    						-805,
    						-795,
    						-18,
    						-1154,
    						-1212
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "021800"
    				}
    			},
    			{
    				arcs: [
    					[
    						-282,
    						-278,
    						-797,
    						-244,
    						1212
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022600"
    				}
    			},
    			{
    				arcs: [
    					[
    						-1176,
    						-543,
    						-275,
    						1213,
    						-778,
    						-836
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022802"
    				}
    			},
    			{
    				arcs: [
    					[
    						-780,
    						1214,
    						-1187,
    						-3,
    						-775
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022902"
    				}
    			},
    			{
    				arcs: [
    					[
    						-779,
    						-1214,
    						-281,
    						-1188,
    						-1215
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "022903"
    				}
    			},
    			{
    				arcs: [
    					[
    						-287,
    						-597,
    						1215,
    						-773,
    						-548,
    						-546
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023001"
    				}
    			},
    			{
    				arcs: [
    					[
    						-596,
    						-626,
    						-771,
    						-1216
    					]
    				],
    				type: "Polygon",
    				properties: {
    					COUNTYFP: "075",
    					STATEFP: "06",
    					TRACTCE: "023003"
    				}
    			}
    		]
    	}
    };
    var sf = {
    	type: type,
    	arcs: arcs,
    	transform: transform$1,
    	objects: objects
    };

    /* src/Scroller.svelte generated by Svelte v3.23.2 */

    const { console: console_1$1 } = globals;
    const file$8 = "src/Scroller.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i].type;
    	child_ctx[0] = list[i].value;
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (196:10) {#each scene.value as { type, value }
    function create_each_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*elements*/ ctx[5][/*type*/ ctx[15]];

    	function switch_props(ctx) {
    		return {
    			props: { value: /*value*/ ctx[0] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*value*/ 1) switch_instance_changes.value = /*value*/ ctx[0];

    			if (switch_value !== (switch_value = /*elements*/ ctx[5][/*type*/ ctx[15]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(196:10) {#each scene.value as { type, value }",
    		ctx
    	});

    	return block;
    }

    // (193:4) {#each value.scenes as scene}
    function create_each_block$4(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let each_value_1 = /*scene*/ ctx[12].value;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div0, "class", "scene-wrapper svelte-12738hr");
    			add_location(div0, file$8, 194, 8, 4236);
    			attr_dev(div1, "class", "scene svelte-12738hr");
    			add_location(div1, file$8, 193, 6, 4208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*elements, value*/ 33) {
    				each_value_1 = /*scene*/ ctx[12].value;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(193:4) {#each value.scenes as scene}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div8;
    	let div6;
    	let div2;
    	let t0;
    	let div0;
    	let select0;
    	let updating_selectedValue;
    	let t1;
    	let div1;
    	let select1;
    	let updating_selectedValue_1;
    	let t2;
    	let t3;
    	let div5;
    	let div3;
    	let map;
    	let div3_resize_listener;
    	let t4;
    	let div4;
    	let img;
    	let img_src_value;
    	let t5;
    	let div7;
    	let current;

    	function select0_selectedValue_binding(value) {
    		/*select0_selectedValue_binding*/ ctx[6].call(null, value);
    	}

    	let select0_props = { items: rounds };

    	if (/*selectedRound*/ ctx[3] !== void 0) {
    		select0_props.selectedValue = /*selectedRound*/ ctx[3];
    	}

    	select0 = new Select({ props: select0_props, $$inline: true });
    	binding_callbacks.push(() => bind(select0, "selectedValue", select0_selectedValue_binding));

    	function select1_selectedValue_binding(value) {
    		/*select1_selectedValue_binding*/ ctx[7].call(null, value);
    	}

    	let select1_props = { items: metros };

    	if (/*selectedMetro*/ ctx[4] !== void 0) {
    		select1_props.selectedValue = /*selectedMetro*/ ctx[4];
    	}

    	select1 = new Select({ props: select1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select1, "selectedValue", select1_selectedValue_binding));

    	map = new Map$2({
    			props: {
    				width: /*mapWidth*/ ctx[1],
    				height: /*mapHeight*/ ctx[2],
    				tracts: sf,
    				census,
    				"projection{projections[selectedMetro.value]}": true
    			},
    			$$inline: true
    		});

    	let each_value = /*value*/ ctx[0].scenes;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div6 = element("div");
    			div2 = element("div");
    			t0 = text("This is the\n      ");
    			div0 = element("div");
    			create_component(select0.$$.fragment);
    			t1 = text("\n      round of the migration chain for\n      ");
    			div1 = element("div");
    			create_component(select1.$$.fragment);
    			t2 = text("\n      .");
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(map.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			img = element("img");
    			t5 = space();
    			div7 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "dropdown dropdown-round svelte-12738hr");
    			add_location(div0, file$8, 164, 6, 3433);
    			attr_dev(div1, "class", "dropdown dropdown-metro svelte-12738hr");
    			add_location(div1, file$8, 168, 6, 3598);
    			attr_dev(div2, "class", "input-text svelte-12738hr");
    			add_location(div2, file$8, 162, 4, 3384);
    			attr_dev(div3, "class", "map svelte-12738hr");
    			add_render_callback(() => /*div3_elementresize_handler*/ ctx[8].call(div3));
    			add_location(div3, file$8, 174, 6, 3769);
    			if (img.src !== (img_src_value = "arc.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-12738hr");
    			add_location(img, file$8, 186, 8, 4082);
    			attr_dev(div4, "class", "arc");
    			add_location(div4, file$8, 185, 6, 4056);
    			attr_dev(div5, "class", "graphic svelte-12738hr");
    			add_location(div5, file$8, 173, 4, 3741);
    			attr_dev(div6, "class", "scroll-graphic svelte-12738hr");
    			add_location(div6, file$8, 161, 2, 3351);
    			attr_dev(div7, "class", "scroll-scenes svelte-12738hr");
    			add_location(div7, file$8, 191, 2, 4140);
    			attr_dev(div8, "class", "scroller svelte-12738hr");
    			add_location(div8, file$8, 160, 0, 3326);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div6);
    			append_dev(div6, div2);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			mount_component(select0, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(select1, div1, null);
    			append_dev(div2, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(map, div3, null);
    			div3_resize_listener = add_resize_listener(div3, /*div3_elementresize_handler*/ ctx[8].bind(div3));
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, img);
    			append_dev(div8, t5);
    			append_dev(div8, div7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const select0_changes = {};

    			if (!updating_selectedValue && dirty & /*selectedRound*/ 8) {
    				updating_selectedValue = true;
    				select0_changes.selectedValue = /*selectedRound*/ ctx[3];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select0.$set(select0_changes);
    			const select1_changes = {};

    			if (!updating_selectedValue_1 && dirty & /*selectedMetro*/ 16) {
    				updating_selectedValue_1 = true;
    				select1_changes.selectedValue = /*selectedMetro*/ ctx[4];
    				add_flush_callback(() => updating_selectedValue_1 = false);
    			}

    			select1.$set(select1_changes);
    			const map_changes = {};
    			if (dirty & /*mapWidth*/ 2) map_changes.width = /*mapWidth*/ ctx[1];
    			if (dirty & /*mapHeight*/ 4) map_changes.height = /*mapHeight*/ ctx[2];
    			map.$set(map_changes);

    			if (dirty & /*value, elements*/ 33) {
    				each_value = /*value*/ ctx[0].scenes;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div7, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select0.$$.fragment, local);
    			transition_in(select1.$$.fragment, local);
    			transition_in(map.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select0.$$.fragment, local);
    			transition_out(select1.$$.fragment, local);
    			transition_out(map.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_component(select0);
    			destroy_component(select1);
    			destroy_component(map);
    			div3_resize_listener();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	console.log(metros);
    	console.log(rounds);
    	const elements = { text: Copy };
    	let { value } = $$props;
    	let mapWidth;
    	let mapHeight;
    	let slopeWidth;
    	let slopeHeight;
    	let selectedRound = { label: "first", value: "c0c1" };
    	let selectedMetro = { label: "San Francisco", value: "sf" };
    	console.log(selectedMetro);

    	const projections = {
    		sf: geoConicConformal().parallels([37 + 4 / 60, 38 + 26 / 60]).rotate([120 + 30 / 60], 0)
    	};

    	// const projection = geoConicConformal()
    	//   .parallels([37 + 4 / 60, 38 + 26 / 60])
    	//   .rotate([120 + 30 / 60], 0);
    	onMount(() => {
    		const scroller = new i({
    				container: document.querySelector(".scroll-scenes"),
    				scenes: document.querySelectorAll(".scene"),
    				offset: 0
    			});

    		// the `enter` event is triggered every time a scene crosses the threshold
    		scroller.on("scene:enter", d => {
    			console.log("entering");
    			console.log(d);
    			$$invalidate(3, selectedRound = rounds[d.index]);
    			d.element.classList.add("active");
    		});

    		// the `exit` event is triggered every time a scene exits the threshold
    		scroller.on("scene:exit", d => {
    			d.element.classList.remove("active");
    		});

    		scroller.on("init", () => {
    			console.log("Everything is ready to go!");
    		});

    		// starts up the IntersectionObserver
    		scroller.init();
    	});

    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Scroller", $$slots, []);

    	function select0_selectedValue_binding(value) {
    		selectedRound = value;
    		$$invalidate(3, selectedRound);
    	}

    	function select1_selectedValue_binding(value) {
    		selectedMetro = value;
    		$$invalidate(4, selectedMetro);
    	}

    	function div3_elementresize_handler() {
    		mapWidth = this.clientWidth;
    		mapHeight = this.clientHeight;
    		$$invalidate(1, mapWidth);
    		$$invalidate(2, mapHeight);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Scroller: i,
    		Select,
    		Copy,
    		Map: Map$2,
    		geoConicConformal,
    		census,
    		metros,
    		rounds,
    		sf,
    		elements,
    		value,
    		mapWidth,
    		mapHeight,
    		slopeWidth,
    		slopeHeight,
    		selectedRound,
    		selectedMetro,
    		projections
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("mapWidth" in $$props) $$invalidate(1, mapWidth = $$props.mapWidth);
    		if ("mapHeight" in $$props) $$invalidate(2, mapHeight = $$props.mapHeight);
    		if ("slopeWidth" in $$props) slopeWidth = $$props.slopeWidth;
    		if ("slopeHeight" in $$props) slopeHeight = $$props.slopeHeight;
    		if ("selectedRound" in $$props) $$invalidate(3, selectedRound = $$props.selectedRound);
    		if ("selectedMetro" in $$props) $$invalidate(4, selectedMetro = $$props.selectedMetro);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		mapWidth,
    		mapHeight,
    		selectedRound,
    		selectedMetro,
    		elements,
    		select0_selectedValue_binding,
    		select1_selectedValue_binding,
    		div3_elementresize_handler
    	];
    }

    class Scroller_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller_1",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console_1$1.warn("<Scroller> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    function empty$1() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty$1 : function() {
        return this.querySelectorAll(selector);
      };
    }

    function selection_selectAll(select) {
      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection$1(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant$2(x) {
      return function() {
        return x;
      };
    }

    var keyPrefix = "$"; // Protect against keys like “__proto__”.

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = {},
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
          if (keyValue in nodeByKeyValue) {
            exit[i] = node;
          } else {
            nodeByKeyValue[keyValue] = node;
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = keyPrefix + key.call(parent, data[i], i, data);
        if (node = nodeByKeyValue[keyValue]) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue[keyValue] = null;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
          exit[i] = node;
        }
      }
    }

    function selection_data(value, key) {
      if (!value) {
        data = new Array(this.size()), j = -1;
        this.each(function(d) { data[++j] = d; });
        return data;
      }

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant$2(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = value.call(parent, parent && parent.__data__, j, parents),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection$1(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
      if (onupdate != null) update = onupdate(update);
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(selection) {

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection$1(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending$1;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection$1(sortgroups, this._parents).order();
    }

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      var nodes = new Array(this.size()), i = -1;
      this.each(function() { nodes[++i] = this; });
      return nodes;
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      var size = 0;
      this.each(function() { ++size; });
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    var filterEvents = {};

    if (typeof document !== "undefined") {
      var element$1 = document.documentElement;
      if (!("onmouseenter" in element$1)) {
        filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
      }
    }

    function filterContextListener(listener, index, group) {
      listener = contextListener(listener, index, group);
      return function(event) {
        var related = event.relatedTarget;
        if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
          listener.call(this, event);
        }
      };
    }

    function contextListener(listener, index, group) {
      return function(event1) {
        try {
          listener.call(this, this.__data__, index, group);
        } finally {
        }
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, capture) {
      var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
      return function(d, i, group) {
        var on = this.__on, o, listener = wrap(value, i, group);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
            this.addEventListener(o.type, o.listener = listener, o.capture = capture);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, capture);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, capture) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      if (capture == null) capture = false;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    var root = [null];

    function Selection$1(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection$1([[document.documentElement]], root);
    }

    Selection$1.prototype = selection.prototype = {
      constructor: Selection$1,
      select: selection_select,
      selectAll: selection_selectAll,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
          : new Selection$1([[selector]], root);
    }

    var slice$1 = Array.prototype.slice;

    function identity$4(x) {
      return x;
    }

    var top = 1,
        right = 2,
        bottom = 3,
        left = 4,
        epsilon$1 = 1e-6;

    function translateX(x) {
      return "translate(" + (x + 0.5) + ",0)";
    }

    function translateY(y) {
      return "translate(0," + (y + 0.5) + ")";
    }

    function number$2(scale) {
      return function(d) {
        return +scale(d);
      };
    }

    function center(scale) {
      var offset = Math.max(0, scale.bandwidth() - 1) / 2; // Adjust for 0.5px offset.
      if (scale.round()) offset = Math.round(offset);
      return function(d) {
        return +scale(d) + offset;
      };
    }

    function entering() {
      return !this.__axis;
    }

    function axis(orient, scale) {
      var tickArguments = [],
          tickValues = null,
          tickFormat = null,
          tickSizeInner = 6,
          tickSizeOuter = 6,
          tickPadding = 3,
          k = orient === top || orient === left ? -1 : 1,
          x = orient === left || orient === right ? "x" : "y",
          transform = orient === top || orient === bottom ? translateX : translateY;

      function axis(context) {
        var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
            format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$4) : tickFormat,
            spacing = Math.max(tickSizeInner, 0) + tickPadding,
            range = scale.range(),
            range0 = +range[0] + 0.5,
            range1 = +range[range.length - 1] + 0.5,
            position = (scale.bandwidth ? center : number$2)(scale.copy()),
            selection = context.selection ? context.selection() : context,
            path = selection.selectAll(".domain").data([null]),
            tick = selection.selectAll(".tick").data(values, scale).order(),
            tickExit = tick.exit(),
            tickEnter = tick.enter().append("g").attr("class", "tick"),
            line = tick.select("line"),
            text = tick.select("text");

        path = path.merge(path.enter().insert("path", ".tick")
            .attr("class", "domain")
            .attr("stroke", "currentColor"));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append("line")
            .attr("stroke", "currentColor")
            .attr(x + "2", k * tickSizeInner));

        text = text.merge(tickEnter.append("text")
            .attr("fill", "currentColor")
            .attr(x, k * spacing)
            .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

        if (context !== selection) {
          path = path.transition(context);
          tick = tick.transition(context);
          line = line.transition(context);
          text = text.transition(context);

          tickExit = tickExit.transition(context)
              .attr("opacity", epsilon$1)
              .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d) : this.getAttribute("transform"); });

          tickEnter
              .attr("opacity", epsilon$1)
              .attr("transform", function(d) { var p = this.parentNode.__axis; return transform(p && isFinite(p = p(d)) ? p : position(d)); });
        }

        tickExit.remove();

        path
            .attr("d", orient === left || orient == right
                ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H0.5V" + range1 + "H" + k * tickSizeOuter : "M0.5," + range0 + "V" + range1)
                : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V0.5H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + ",0.5H" + range1));

        tick
            .attr("opacity", 1)
            .attr("transform", function(d) { return transform(position(d)); });

        line
            .attr(x + "2", k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format);

        selection.filter(entering)
            .attr("fill", "none")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

        selection
            .each(function() { this.__axis = position; });
      }

      axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
      };

      axis.ticks = function() {
        return tickArguments = slice$1.call(arguments), axis;
      };

      axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : slice$1.call(_), axis) : tickArguments.slice();
      };

      axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : slice$1.call(_), axis) : tickValues && tickValues.slice();
      };

      axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
      };

      axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
      };

      axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
      };

      axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
      };

      axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
      };

      return axis;
    }

    function axisBottom(scale) {
      return axis(bottom, scale);
    }

    function axisLeft(scale) {
      return axis(left, scale);
    }

    /* src/Slope.svelte generated by Svelte v3.23.2 */
    const file$9 = "src/Slope.svelte";

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let select_1;
    	let updating_selectedValue;
    	let t2;
    	let div10;
    	let div3;
    	let div2;
    	let t4;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let div5;
    	let div4;
    	let t7;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let div7;
    	let div6;
    	let t10;
    	let img2;
    	let img2_src_value;
    	let t11;
    	let div9;
    	let div8;
    	let t13;
    	let img3;
    	let img3_src_value;
    	let current;

    	function select_1_selectedValue_binding(value) {
    		/*select_1_selectedValue_binding*/ ctx[3].call(null, value);
    	}

    	let select_1_props = { items: metros };

    	if (/*selectedMetro*/ ctx[0] !== void 0) {
    		select_1_props.selectedValue = /*selectedMetro*/ ctx[0];
    	}

    	select_1 = new Select({ props: select_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(select_1, "selectedValue", select_1_selectedValue_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Select a metro area";
    			t1 = space();
    			create_component(select_1.$$.fragment);
    			t2 = space();
    			div10 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "C0-C1";
    			t4 = space();
    			img0 = element("img");
    			t5 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "C1-C2";
    			t7 = space();
    			img1 = element("img");
    			t8 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "C2-C3";
    			t10 = space();
    			img2 = element("img");
    			t11 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "C3-C4";
    			t13 = space();
    			img3 = element("img");
    			attr_dev(div0, "class", "dropdown-title svelte-1tehum3");
    			add_location(div0, file$9, 72, 2, 1699);
    			attr_dev(div1, "class", "dropdown svelte-1tehum3");
    			add_location(div1, file$9, 71, 0, 1674);
    			attr_dev(div2, "class", "title svelte-1tehum3");
    			add_location(div2, file$9, 77, 4, 1869);
    			if (img0.src !== (img0_src_value = "slope.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "svelte-1tehum3");
    			add_location(img0, file$9, 78, 4, 1904);
    			attr_dev(div3, "class", "image");
    			add_location(div3, file$9, 76, 2, 1845);
    			attr_dev(div4, "class", "title svelte-1tehum3");
    			add_location(div4, file$9, 81, 4, 1963);
    			if (img1.src !== (img1_src_value = "slope.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "svelte-1tehum3");
    			add_location(img1, file$9, 82, 4, 1998);
    			attr_dev(div5, "class", "image");
    			add_location(div5, file$9, 80, 2, 1939);
    			attr_dev(div6, "class", "title svelte-1tehum3");
    			add_location(div6, file$9, 85, 4, 2057);
    			if (img2.src !== (img2_src_value = "slope.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "svelte-1tehum3");
    			add_location(img2, file$9, 86, 4, 2092);
    			attr_dev(div7, "class", "image");
    			add_location(div7, file$9, 84, 2, 2033);
    			attr_dev(div8, "class", "title svelte-1tehum3");
    			add_location(div8, file$9, 89, 4, 2151);
    			if (img3.src !== (img3_src_value = "slope.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "class", "svelte-1tehum3");
    			add_location(img3, file$9, 90, 4, 2186);
    			attr_dev(div9, "class", "image");
    			add_location(div9, file$9, 88, 2, 2127);
    			attr_dev(div10, "class", "slope svelte-1tehum3");
    			add_location(div10, file$9, 75, 0, 1823);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			mount_component(select_1, div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t4);
    			append_dev(div3, img0);
    			append_dev(div10, t5);
    			append_dev(div10, div5);
    			append_dev(div5, div4);
    			append_dev(div5, t7);
    			append_dev(div5, img1);
    			append_dev(div10, t8);
    			append_dev(div10, div7);
    			append_dev(div7, div6);
    			append_dev(div7, t10);
    			append_dev(div7, img2);
    			append_dev(div10, t11);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div9, t13);
    			append_dev(div9, img3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const select_1_changes = {};

    			if (!updating_selectedValue && dirty & /*selectedMetro*/ 1) {
    				updating_selectedValue = true;
    				select_1_changes.selectedValue = /*selectedMetro*/ ctx[0];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select_1.$set(select_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(select_1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div10);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { width = 100 } = $$props;
    	let { height = 100 } = $$props;
    	const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    	let xAxisG;
    	let yAxisG;
    	let selectedMetro = { label: "San Francisco", value: "sf" };
    	const writable_props = ["width", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slope> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Slope", $$slots, []);

    	function select_1_selectedValue_binding(value) {
    		selectedMetro = value;
    		$$invalidate(0, selectedMetro);
    	}

    	$$self.$set = $$props => {
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		Select,
    		beforeUpdate,
    		select,
    		scaleLinear: linear$1,
    		scaleOrdinal: ordinal,
    		axisLeft,
    		axisBottom,
    		metros,
    		width,
    		height,
    		margin,
    		xAxisG,
    		yAxisG,
    		selectedMetro,
    		chartWidth,
    		chartHeight,
    		xScale,
    		yScale,
    		xAxis,
    		yAxis
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("xAxisG" in $$props) xAxisG = $$props.xAxisG;
    		if ("yAxisG" in $$props) yAxisG = $$props.yAxisG;
    		if ("selectedMetro" in $$props) $$invalidate(0, selectedMetro = $$props.selectedMetro);
    		if ("chartWidth" in $$props) $$invalidate(4, chartWidth = $$props.chartWidth);
    		if ("chartHeight" in $$props) $$invalidate(5, chartHeight = $$props.chartHeight);
    		if ("xScale" in $$props) $$invalidate(6, xScale = $$props.xScale);
    		if ("yScale" in $$props) $$invalidate(7, yScale = $$props.yScale);
    		if ("xAxis" in $$props) xAxis = $$props.xAxis;
    		if ("yAxis" in $$props) yAxis = $$props.yAxis;
    	};

    	let chartWidth;
    	let chartHeight;
    	let xScale;
    	let yScale;
    	let xAxis;
    	let yAxis;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 2) {
    			 $$invalidate(4, chartWidth = width - margin.left - margin.right);
    		}

    		if ($$self.$$.dirty & /*height*/ 4) {
    			 $$invalidate(5, chartHeight = height - margin.top - margin.bottom);
    		}

    		if ($$self.$$.dirty & /*chartWidth*/ 16) {
    			 $$invalidate(6, xScale = ordinal().domain(["C0", "C1", "C2", "C3", "C4"]).range([0, chartWidth]));
    		}

    		if ($$self.$$.dirty & /*chartHeight*/ 32) {
    			 $$invalidate(7, yScale = linear$1().domain([0, 200000]).range([chartHeight, 0]));
    		}

    		if ($$self.$$.dirty & /*xScale*/ 64) {
    			 xAxis = axisBottom(xScale);
    		}

    		if ($$self.$$.dirty & /*yScale, chartWidth*/ 144) {
    			 yAxis = axisLeft(yScale).tickSize(-chartWidth).// .tickPadding(tickSize * 1.25)
    			ticks(5);
    		}
    	};

    	return [selectedMetro, width, height, select_1_selectedValue_binding];
    }

    class Slope extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { width: 1, height: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slope",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get width() {
    		throw new Error("<Slope>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Slope>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Slope>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Slope>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var hed = "Migration Chains";
    var dek = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus lacus, blandit a tincidunt ut, molestie et orci.";
    var content = [
    	{
    		type: "text",
    		value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis lacus vitae lacus congue suscipit. Nulla tincidunt urna vel nulla fermentum maximus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla imperdiet enim a scelerisque maximus. Mauris scelerisque mattis orci, eu congue neque sagittis sed."
    	},
    	{
    		type: "scroller",
    		value: {
    			scenes: [
    				{
    					type: "scene",
    					value: [
    						{
    							type: "text",
    							value: "Here is the first round. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus lacus, blandit a tincidunt ut, molestie et orci. Aliquam erat volutpat. Mauris sem erat, facilisis id interdum mollis, lacinia ac erat"
    						}
    					]
    				},
    				{
    					type: "scene",
    					value: [
    						{
    							type: "text",
    							value: "Here is the second round. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus lacus, blandit a tincidunt ut, molestie et orci. Aliquam erat volutpat. Mauris sem erat, facilisis id interdum mollis, lacinia ac erat"
    						}
    					]
    				},
    				{
    					type: "scene",
    					value: [
    						{
    							type: "text",
    							value: "Here is the third round. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus lacus, blandit a tincidunt ut, molestie et orci. Aliquam erat volutpat. Mauris sem erat, facilisis id interdum mollis, lacinia ac erat"
    						}
    					]
    				},
    				{
    					type: "scene",
    					value: [
    						{
    							type: "text",
    							value: "Here is the fourth round. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus lacus, blandit a tincidunt ut, molestie et orci. Aliquam erat volutpat. Mauris sem erat, facilisis id interdum mollis, lacinia ac erat"
    						}
    					]
    				}
    			]
    		}
    	},
    	{
    		type: "text",
    		value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis lacus vitae lacus congue suscipit. Nulla tincidunt urna vel nulla fermentum maximus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla imperdiet enim a scelerisque maximus. Mauris scelerisque mattis orci, eu congue neque sagittis sed."
    	},
    	{
    		type: "slope",
    		value: {
    		}
    	},
    	{
    		type: "text",
    		value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis lacus vitae lacus congue suscipit. Nulla tincidunt urna vel nulla fermentum maximus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nulla imperdiet enim a scelerisque maximus. Mauris scelerisque mattis orci, eu congue neque sagittis sed."
    	}
    ];
    var text$1 = {
    	hed: hed,
    	dek: dek,
    	content: content
    };

    /* src/App.svelte generated by Svelte v3.23.2 */
    const file$a = "src/App.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].type;
    	child_ctx[2] = list[i].value;
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (32:4) {#each text.content as { type, value }
    function create_each_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*elements*/ ctx[0][/*type*/ ctx[1]];

    	function switch_props(ctx) {
    		return {
    			props: { value: /*value*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*elements*/ ctx[0][/*type*/ ctx[1]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(32:4) {#each text.content as { type, value }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let h4;
    	let t3;
    	let article;
    	let current;
    	let each_value = text$1.content;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `${text$1.hed}`;
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = `${text$1.dek}`;
    			t3 = space();
    			article = element("article");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "post-title entry-title svelte-10k9e9p");
    			add_location(h1, file$a, 28, 2, 449);
    			attr_dev(h4, "class", "post-kicker svelte-10k9e9p");
    			add_location(h4, file$a, 29, 2, 502);
    			add_location(article, file$a, 30, 2, 544);
    			add_location(main, file$a, 27, 0, 440);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, h4);
    			append_dev(main, t3);
    			append_dev(main, article);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(article, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*elements, text*/ 1) {
    				each_value = text$1.content;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(article, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const elements = {
    		text: Copy,
    		scroller: Scroller_1,
    		slope: Slope
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Copy, Scroller: Scroller_1, Slope, text: text$1, elements });
    	return [elements];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
