
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
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
            set_current_component(null);
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/TimeLeft.svelte generated by Svelte v3.44.2 */

    const file$5 = "src/TimeLeft.svelte";

    function create_fragment$5(ctx) {
    	let h2;
    	let span0;
    	let t0;
    	let t1;
    	let t2_value = (/*daysUntilChristmas*/ ctx[2] !== 1 ? "s" : "") + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4;
    	let t5;
    	let t6_value = (/*hoursUntilChristmas*/ ctx[1] !== 1 ? "s" : "") + "";
    	let t6;
    	let t7;
    	let span2;
    	let t8;
    	let t9;
    	let t10_value = (/*minutesUntilChristmas*/ ctx[0] !== 1 ? "s" : "") + "";
    	let t10;
    	let t11;
    	let span3;
    	let t12;
    	let t13;
    	let t14_value = (/*secondsUntilChristmas*/ ctx[3] !== 1 ? "s" : "") + "";
    	let t14;
    	let t15;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			span0 = element("span");
    			t0 = text(/*daysUntilChristmas*/ ctx[2]);
    			t1 = text(" day");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(/*hoursUntilChristmas*/ ctx[1]);
    			t5 = text("\n  hour");
    			t6 = text(t6_value);
    			t7 = space();
    			span2 = element("span");
    			t8 = text(/*minutesUntilChristmas*/ ctx[0]);
    			t9 = text("\n  minute");
    			t10 = text(t10_value);
    			t11 = text(" and\n  ");
    			span3 = element("span");
    			t12 = text(/*secondsUntilChristmas*/ ctx[3]);
    			t13 = text("\n  second");
    			t14 = text(t14_value);
    			t15 = text(" until christmas!!");
    			add_location(span0, file$5, 30, 2, 893);
    			add_location(span1, file$5, 31, 2, 970);
    			add_location(span2, file$5, 33, 2, 1052);
    			add_location(span3, file$5, 35, 2, 1144);
    			attr_dev(h2, "class", "time-left text-box svelte-7dtxxl");
    			add_location(h2, file$5, 29, 0, 859);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, span0);
    			append_dev(span0, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(h2, span1);
    			append_dev(span1, t4);
    			append_dev(h2, t5);
    			append_dev(h2, t6);
    			append_dev(h2, t7);
    			append_dev(h2, span2);
    			append_dev(span2, t8);
    			append_dev(h2, t9);
    			append_dev(h2, t10);
    			append_dev(h2, t11);
    			append_dev(h2, span3);
    			append_dev(span3, t12);
    			append_dev(h2, t13);
    			append_dev(h2, t14);
    			append_dev(h2, t15);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*daysUntilChristmas*/ 4) set_data_dev(t0, /*daysUntilChristmas*/ ctx[2]);
    			if (dirty & /*daysUntilChristmas*/ 4 && t2_value !== (t2_value = (/*daysUntilChristmas*/ ctx[2] !== 1 ? "s" : "") + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*hoursUntilChristmas*/ 2) set_data_dev(t4, /*hoursUntilChristmas*/ ctx[1]);
    			if (dirty & /*hoursUntilChristmas*/ 2 && t6_value !== (t6_value = (/*hoursUntilChristmas*/ ctx[1] !== 1 ? "s" : "") + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*minutesUntilChristmas*/ 1) set_data_dev(t8, /*minutesUntilChristmas*/ ctx[0]);
    			if (dirty & /*minutesUntilChristmas*/ 1 && t10_value !== (t10_value = (/*minutesUntilChristmas*/ ctx[0] !== 1 ? "s" : "") + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*secondsUntilChristmas*/ 8) set_data_dev(t12, /*secondsUntilChristmas*/ ctx[3]);
    			if (dirty & /*secondsUntilChristmas*/ 8 && t14_value !== (t14_value = (/*secondsUntilChristmas*/ ctx[3] !== 1 ? "s" : "") + "")) set_data_dev(t14, t14_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
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
    	let daysUntilChristmas;
    	let hoursUntilChristmas;
    	let minutesUntilChristmas;
    	let secondsUntilChristmas;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TimeLeft', slots, []);
    	let { millisecondsUntilChristmas } = $$props;
    	const dayMilliseconds = 1000 * 60 * 60 * 24;
    	const hourMilliseconds = 1000 * 60 * 60;
    	const minuteMilliseconds = 1000 * 60;
    	const writable_props = ['millisecondsUntilChristmas'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TimeLeft> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('millisecondsUntilChristmas' in $$props) $$invalidate(4, millisecondsUntilChristmas = $$props.millisecondsUntilChristmas);
    	};

    	$$self.$capture_state = () => ({
    		millisecondsUntilChristmas,
    		dayMilliseconds,
    		hourMilliseconds,
    		minuteMilliseconds,
    		minutesUntilChristmas,
    		hoursUntilChristmas,
    		daysUntilChristmas,
    		secondsUntilChristmas
    	});

    	$$self.$inject_state = $$props => {
    		if ('millisecondsUntilChristmas' in $$props) $$invalidate(4, millisecondsUntilChristmas = $$props.millisecondsUntilChristmas);
    		if ('minutesUntilChristmas' in $$props) $$invalidate(0, minutesUntilChristmas = $$props.minutesUntilChristmas);
    		if ('hoursUntilChristmas' in $$props) $$invalidate(1, hoursUntilChristmas = $$props.hoursUntilChristmas);
    		if ('daysUntilChristmas' in $$props) $$invalidate(2, daysUntilChristmas = $$props.daysUntilChristmas);
    		if ('secondsUntilChristmas' in $$props) $$invalidate(3, secondsUntilChristmas = $$props.secondsUntilChristmas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*millisecondsUntilChristmas*/ 16) {
    			$$invalidate(2, daysUntilChristmas = Math.floor(millisecondsUntilChristmas / dayMilliseconds));
    		}

    		if ($$self.$$.dirty & /*millisecondsUntilChristmas, daysUntilChristmas*/ 20) {
    			$$invalidate(1, hoursUntilChristmas = Math.floor((millisecondsUntilChristmas - dayMilliseconds * daysUntilChristmas) / hourMilliseconds));
    		}

    		if ($$self.$$.dirty & /*millisecondsUntilChristmas, daysUntilChristmas, hoursUntilChristmas*/ 22) {
    			$$invalidate(0, minutesUntilChristmas = Math.floor((millisecondsUntilChristmas - dayMilliseconds * daysUntilChristmas - hourMilliseconds * hoursUntilChristmas) / minuteMilliseconds));
    		}

    		if ($$self.$$.dirty & /*millisecondsUntilChristmas, daysUntilChristmas, hoursUntilChristmas, minutesUntilChristmas*/ 23) {
    			$$invalidate(3, secondsUntilChristmas = Math.floor((millisecondsUntilChristmas - dayMilliseconds * daysUntilChristmas - hourMilliseconds * hoursUntilChristmas - minuteMilliseconds * minutesUntilChristmas) / 1000));
    		}
    	};

    	return [
    		minutesUntilChristmas,
    		hoursUntilChristmas,
    		daysUntilChristmas,
    		secondsUntilChristmas,
    		millisecondsUntilChristmas
    	];
    }

    class TimeLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { millisecondsUntilChristmas: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimeLeft",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*millisecondsUntilChristmas*/ ctx[4] === undefined && !('millisecondsUntilChristmas' in props)) {
    			console.warn("<TimeLeft> was created without expected prop 'millisecondsUntilChristmas'");
    		}
    	}

    	get millisecondsUntilChristmas() {
    		throw new Error("<TimeLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set millisecondsUntilChristmas(value) {
    		throw new Error("<TimeLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Eve.svelte generated by Svelte v3.44.2 */

    const file$4 = "src/Eve.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (42:8) {:else}
    function create_else_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("eve");
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(42:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (40:8) {#if i === days}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("eve!!!");
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(40:8) {#if i === days}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#each { length: days } as _, i}
    function create_each_block(ctx) {
    	let span;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[12] === /*days*/ ctx[4]) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			t = space();
    			attr_dev(span, "class", "eve svelte-gpka3w");
    			set_style(span, "bottom", /*mouseDistance*/ ctx[3].y / /*days*/ ctx[4] * (/*i*/ ctx[12] + 1.0) + "px");
    			set_style(span, "left", /*mouseDistance*/ ctx[3].x / /*days*/ ctx[4] * (/*i*/ ctx[12] + 1.0) + "px");
    			add_location(span, file$4, 33, 6, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_block.m(span, null);
    			append_dev(span, t);
    			/*span_binding*/ ctx[7](span);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, t);
    				}
    			}

    			if (dirty & /*mouseDistance, days*/ 24) {
    				set_style(span, "bottom", /*mouseDistance*/ ctx[3].y / /*days*/ ctx[4] * (/*i*/ ctx[12] + 1.0) + "px");
    			}

    			if (dirty & /*mouseDistance, days*/ 24) {
    				set_style(span, "left", /*mouseDistance*/ ctx[3].x / /*days*/ ctx[4] * (/*i*/ ctx[12] + 1.0) + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_block.d();
    			/*span_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:4) {#each { length: days } as _, i}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if millisecondsUntilChristmas > 0}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("eve");
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:4) {#if millisecondsUntilChristmas > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let h1;
    	let t1;
    	let span0;
    	let t2;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value = { length: /*days*/ ctx[4] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*millisecondsUntilChristmas*/ ctx[0] > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			h1 = element("h1");
    			t1 = text("merry christmas\n  ");
    			span0 = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			span1 = element("span");
    			if (if_block) if_block.c();
    			set_style(span0, "position", "relative");
    			set_style(span0, "width", "0");
    			set_style(span0, "height", "0");
    			add_location(span0, file$4, 31, 2, 850);
    			add_location(span1, file$4, 47, 2, 1250);
    			attr_dev(h1, "class", "text-box seasons-greetings svelte-gpka3w");
    			add_location(h1, file$4, 29, 0, 761);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			append_dev(h1, span0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span0, null);
    			}

    			append_dev(h1, t2);
    			append_dev(h1, span1);
    			if (if_block) if_block.m(span1, null);
    			/*h1_binding*/ ctx[8](h1);

    			if (!mounted) {
    				dispose = listen_dev(document.body, "mousemove", /*handleMousemove*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mouseDistance, days, eve*/ 28) {
    				each_value = { length: /*days*/ ctx[4] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*millisecondsUntilChristmas*/ ctx[0] > 0) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			/*h1_binding*/ ctx[8](null);
    			mounted = false;
    			dispose();
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
    	let daysUntilChristmas;
    	let days;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Eve', slots, []);
    	let { millisecondsUntilChristmas } = $$props;
    	let seasonsGreetings;
    	let eve;
    	const dayMilliseconds = 1000 * 60 * 60 * 24;
    	let mouseDistance = { x: 0, y: 0 };

    	const handleMousemove = e => {
    		if (daysUntilChristmas > 0) {
    			$$invalidate(3, mouseDistance.x = e.clientX - seasonsGreetings.offsetLeft - seasonsGreetings.offsetWidth + eve.offsetWidth / 2, mouseDistance);
    			$$invalidate(3, mouseDistance.y = seasonsGreetings.offsetTop - e.clientY - eve.offsetHeight / 2, mouseDistance);
    		}
    	};

    	const writable_props = ['millisecondsUntilChristmas'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Eve> was created with unknown prop '${key}'`);
    	});

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			eve = $$value;
    			$$invalidate(2, eve);
    		});
    	}

    	function h1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			seasonsGreetings = $$value;
    			$$invalidate(1, seasonsGreetings);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('millisecondsUntilChristmas' in $$props) $$invalidate(0, millisecondsUntilChristmas = $$props.millisecondsUntilChristmas);
    	};

    	$$self.$capture_state = () => ({
    		millisecondsUntilChristmas,
    		seasonsGreetings,
    		eve,
    		dayMilliseconds,
    		mouseDistance,
    		handleMousemove,
    		daysUntilChristmas,
    		days
    	});

    	$$self.$inject_state = $$props => {
    		if ('millisecondsUntilChristmas' in $$props) $$invalidate(0, millisecondsUntilChristmas = $$props.millisecondsUntilChristmas);
    		if ('seasonsGreetings' in $$props) $$invalidate(1, seasonsGreetings = $$props.seasonsGreetings);
    		if ('eve' in $$props) $$invalidate(2, eve = $$props.eve);
    		if ('mouseDistance' in $$props) $$invalidate(3, mouseDistance = $$props.mouseDistance);
    		if ('daysUntilChristmas' in $$props) $$invalidate(6, daysUntilChristmas = $$props.daysUntilChristmas);
    		if ('days' in $$props) $$invalidate(4, days = $$props.days);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*millisecondsUntilChristmas*/ 1) {
    			$$invalidate(6, daysUntilChristmas = Math.floor(millisecondsUntilChristmas / dayMilliseconds));
    		}

    		if ($$self.$$.dirty & /*daysUntilChristmas*/ 64) {
    			// Set the max 'eves' to 150 so peoples devices don't struggle
    			$$invalidate(4, days = Math.min(150, daysUntilChristmas));
    		}
    	};

    	return [
    		millisecondsUntilChristmas,
    		seasonsGreetings,
    		eve,
    		mouseDistance,
    		days,
    		handleMousemove,
    		daysUntilChristmas,
    		span_binding,
    		h1_binding
    	];
    }

    class Eve extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { millisecondsUntilChristmas: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Eve",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*millisecondsUntilChristmas*/ ctx[0] === undefined && !('millisecondsUntilChristmas' in props)) {
    			console.warn("<Eve> was created without expected prop 'millisecondsUntilChristmas'");
    		}
    	}

    	get millisecondsUntilChristmas() {
    		throw new Error("<Eve>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set millisecondsUntilChristmas(value) {
    		throw new Error("<Eve>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Help.svelte generated by Svelte v3.44.2 */

    const file$3 = "src/Help.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let a0;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let a1;
    	let img2;
    	let img2_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Made by\n    ");
    			a0 = element("a");
    			img1 = element("img");
    			t2 = text("\n    &\n    ");
    			a1 = element("a");
    			img2 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/help.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Circle with question mark");
    			set_style(img0, "display", /*showIcon*/ ctx[0] ? 'block' : 'none');
    			add_location(img0, file$3, 13, 2, 170);
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/levi.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Levi");
    			attr_dev(img1, "class", "svelte-m9pxnt");
    			add_location(img1, file$3, 22, 6, 442);
    			attr_dev(a0, "href", "https://leviv.me");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$3, 21, 4, 392);
    			if (!src_url_equal(img2.src, img2_src_value = "./assets/amanda.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Amanda");
    			attr_dev(img2, "class", "svelte-m9pxnt");
    			add_location(img2, file$3, 26, 6, 560);
    			attr_dev(a1, "href", "https://amandayeh.com/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$3, 25, 4, 504);
    			attr_dev(div0, "class", "made-by text-box svelte-m9pxnt");
    			set_style(div0, "display", /*showIcon*/ ctx[0] ? 'none' : 'block');
    			add_location(div0, file$3, 19, 2, 298);
    			attr_dev(div1, "class", "help svelte-m9pxnt");
    			add_location(div1, file$3, 4, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div0, a0);
    			append_dev(a0, img1);
    			append_dev(div0, t2);
    			append_dev(div0, a1);
    			append_dev(a1, img2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[1], false, false, false),
    					listen_dev(div1, "mouseleave", /*mouseleave_handler*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showIcon*/ 1) {
    				set_style(img0, "display", /*showIcon*/ ctx[0] ? 'block' : 'none');
    			}

    			if (dirty & /*showIcon*/ 1) {
    				set_style(div0, "display", /*showIcon*/ ctx[0] ? 'none' : 'block');
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Help', slots, []);
    	let showIcon = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Help> was created with unknown prop '${key}'`);
    	});

    	const mouseenter_handler = () => {
    		$$invalidate(0, showIcon = false);
    	};

    	const mouseleave_handler = () => {
    		$$invalidate(0, showIcon = true);
    	};

    	$$self.$capture_state = () => ({ showIcon });

    	$$self.$inject_state = $$props => {
    		if ('showIcon' in $$props) $$invalidate(0, showIcon = $$props.showIcon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showIcon, mouseenter_handler, mouseleave_handler];
    }

    class Help extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Help",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Album.svelte generated by Svelte v3.44.2 */

    const file$2 = "src/Album.svelte";

    function create_fragment$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./assets/album_cover.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Mariah Carey merry Christmas II you album cover");
    			set_style(img, "left", /*albumLeft*/ ctx[1] + 'px');
    			set_style(img, "top", /*albumTop*/ ctx[2] + 'px');
    			set_style(img, "transform", "rotate(" + (/*album_rotation*/ ctx[3] + 'deg') + ")");
    			set_style(img, "width", /*albumSize*/ ctx[0] + 'px');
    			attr_dev(img, "class", "album svelte-1dagccw");
    			add_location(img, file$2, 15, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
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

    function getRandomArbitrary(min, max) {
    	return Math.random() * (max - min) + min;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Album', slots, []);
    	let { audioVolume } = $$props;

    	// Album size can range from 0-window.innerWidth * 0.7
    	let albumSize = audioVolume * (window.innerWidth * 0.7);

    	let albumLeft = getRandomArbitrary(0, window.innerWidth - albumSize);
    	let albumTop = getRandomArbitrary(0, window.innerHeight - albumSize);
    	let album_rotation = Math.floor(Math.random() * 360);
    	const writable_props = ['audioVolume'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('audioVolume' in $$props) $$invalidate(4, audioVolume = $$props.audioVolume);
    	};

    	$$self.$capture_state = () => ({
    		audioVolume,
    		albumSize,
    		albumLeft,
    		albumTop,
    		album_rotation,
    		getRandomArbitrary
    	});

    	$$self.$inject_state = $$props => {
    		if ('audioVolume' in $$props) $$invalidate(4, audioVolume = $$props.audioVolume);
    		if ('albumSize' in $$props) $$invalidate(0, albumSize = $$props.albumSize);
    		if ('albumLeft' in $$props) $$invalidate(1, albumLeft = $$props.albumLeft);
    		if ('albumTop' in $$props) $$invalidate(2, albumTop = $$props.albumTop);
    		if ('album_rotation' in $$props) $$invalidate(3, album_rotation = $$props.album_rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [albumSize, albumLeft, albumTop, album_rotation, audioVolume];
    }

    class Album extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { audioVolume: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Album",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*audioVolume*/ ctx[4] === undefined && !('audioVolume' in props)) {
    			console.warn("<Album> was created without expected prop 'audioVolume'");
    		}
    	}

    	get audioVolume() {
    		throw new Error("<Album>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set audioVolume(value) {
    		throw new Error("<Album>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Snowflakes.svelte generated by Svelte v3.44.2 */

    const file$1 = "src/Snowflakes.svelte";

    function create_fragment$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "background svelte-eo8b4s");
    			add_location(div, file$1, 60, 0, 1697);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Snowflakes', slots, []);
    	let { audioVolume } = $$props;

    	const snowflakePath = audioVolume < 0.15
    	? "./assets/snow-light.svg"
    	: "./assets/snowflake.svg";

    	// Draw background snowflakes
    	window.onload = () => {
    		drawSnowflakes();
    	};

    	window.onresize = () => {
    		drawSnowflakes();
    	};

    	function drawSnowflakes() {
    		const background = document.getElementsByClassName("background")[0];
    		background.textContent = "";
    		let rows = [];

    		for (let i = 0; i <= window.innerHeight / 50; i++) {
    			let row = document.createElement("div");
    			row.style.position = "relative";
    			row.style.width = "200vw";
    			row.style.zIndex = "-100";

    			if (i % 2 == 0) {
    				row.style.transform = "translateX(-30px)";
    			}

    			rows.push(row);
    		}

    		for (let i = 0; i < rows.length; i++) {
    			if (i % 2 == 0) {
    				for (let j = 0; j <= window.innerWidth / 50; j++) {
    					let img = document.createElement("img");
    					img.style.padding = "20px";
    					img.style.width = "30px";
    					img.style.height = "30px";
    					img.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    					img.src = snowflakePath;
    					rows[i].append(img);
    				}
    			} else {
    				for (let k = 0; k <= window.innerWidth / 50; k++) {
    					let img = document.createElement("img");
    					img.style.padding = "20px";
    					img.style.width = "30px";
    					img.style.height = "30px";
    					img.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    					img.src = snowflakePath;
    					rows[i].append(img);
    				}
    			}

    			background.append(rows[i]);
    		}
    	}

    	const writable_props = ['audioVolume'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Snowflakes> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('audioVolume' in $$props) $$invalidate(0, audioVolume = $$props.audioVolume);
    	};

    	$$self.$capture_state = () => ({
    		audioVolume,
    		snowflakePath,
    		drawSnowflakes
    	});

    	$$self.$inject_state = $$props => {
    		if ('audioVolume' in $$props) $$invalidate(0, audioVolume = $$props.audioVolume);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [audioVolume];
    }

    class Snowflakes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { audioVolume: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Snowflakes",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*audioVolume*/ ctx[0] === undefined && !('audioVolume' in props)) {
    			console.warn("<Snowflakes> was created without expected prop 'audioVolume'");
    		}
    	}

    	get audioVolume() {
    		throw new Error("<Snowflakes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set audioVolume(value) {
    		throw new Error("<Snowflakes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.2 */

    const { document: document_1 } = globals;
    const file = "src/App.svelte";

    // (156:4) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let span;
    	let t1_value = Math.round(/*audioVolume*/ ctx[2] * 10000) / 100 + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("volume: ");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = text("%");
    			add_location(span, file, 156, 14, 4481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*audioVolume*/ 4 && t1_value !== (t1_value = Math.round(/*audioVolume*/ ctx[2] * 10000) / 100 + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(156:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (154:4) {#if !audio || audio.paused}
    function create_if_block(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "play music";
    			add_location(span, file, 154, 6, 4431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(154:4) {#if !audio || audio.paused}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let main;
    	let snowflakes;
    	let t1;
    	let timeleft;
    	let t2;
    	let button;
    	let t3;
    	let audio_1;
    	let source;
    	let source_src_value;
    	let t4;
    	let t5;
    	let album;
    	let t6;
    	let eve;
    	let t7;
    	let help;
    	let current;
    	let mounted;
    	let dispose;

    	snowflakes = new Snowflakes({
    			props: { audioVolume: /*audioVolume*/ ctx[2] },
    			$$inline: true
    		});

    	timeleft = new TimeLeft({
    			props: {
    				millisecondsUntilChristmas: /*millisecondsUntilChristmas*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (!/*audio*/ ctx[0] || /*audio*/ ctx[0].paused) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	album = new Album({
    			props: { audioVolume: /*audioVolume*/ ctx[2] },
    			$$inline: true
    		});

    	eve = new Eve({
    			props: {
    				millisecondsUntilChristmas: /*millisecondsUntilChristmas*/ ctx[1]
    			},
    			$$inline: true
    		});

    	help = new Help({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(snowflakes.$$.fragment);
    			t1 = space();
    			create_component(timeleft.$$.fragment);
    			t2 = space();
    			button = element("button");
    			if_block.c();
    			t3 = space();
    			audio_1 = element("audio");
    			source = element("source");
    			t4 = text("\n    Your browser does not support the audio element.");
    			t5 = space();
    			create_component(album.$$.fragment);
    			t6 = space();
    			create_component(eve.$$.fragment);
    			t7 = space();
    			create_component(help.$$.fragment);
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.googleapis.com");
    			add_location(link0, file, 137, 2, 3880);
    			attr_dev(link1, "rel", "preconnect");
    			attr_dev(link1, "href", "https://fonts.gstatic.com");
    			attr_dev(link1, "crossorigin", "");
    			add_location(link1, file, 138, 2, 3944);
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css2?family=Fuzzy+Bubbles:wght@400;700&display=swap");
    			attr_dev(link2, "rel", "stylesheet");
    			add_location(link2, file, 139, 2, 4017);
    			attr_dev(button, "class", "volume text-box svelte-tw3422");
    			add_location(button, file, 149, 2, 4285);
    			if (!src_url_equal(source.src, source_src_value = "./song.mp3")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "audio/mpeg");
    			add_location(source, file, 160, 4, 4603);
    			audio_1.autoplay = true;
    			audio_1.loop = true;
    			add_location(audio_1, file, 159, 2, 4559);
    			set_style(main, "--cursor-image", "url(" + /*cursorImage*/ ctx[3] + ")");
    			attr_dev(main, "class", "svelte-tw3422");
    			add_location(main, file, 145, 0, 4157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link0);
    			append_dev(document_1.head, link1);
    			append_dev(document_1.head, link2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(snowflakes, main, null);
    			append_dev(main, t1);
    			mount_component(timeleft, main, null);
    			append_dev(main, t2);
    			append_dev(main, button);
    			if_block.m(button, null);
    			append_dev(main, t3);
    			append_dev(main, audio_1);
    			append_dev(audio_1, source);
    			append_dev(audio_1, t4);
    			/*audio_1_binding*/ ctx[5](audio_1);
    			append_dev(main, t5);
    			mount_component(album, main, null);
    			append_dev(main, t6);
    			mount_component(eve, main, null);
    			append_dev(main, t7);
    			mount_component(help, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const snowflakes_changes = {};
    			if (dirty & /*audioVolume*/ 4) snowflakes_changes.audioVolume = /*audioVolume*/ ctx[2];
    			snowflakes.$set(snowflakes_changes);
    			const timeleft_changes = {};
    			if (dirty & /*millisecondsUntilChristmas*/ 2) timeleft_changes.millisecondsUntilChristmas = /*millisecondsUntilChristmas*/ ctx[1];
    			timeleft.$set(timeleft_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			const album_changes = {};
    			if (dirty & /*audioVolume*/ 4) album_changes.audioVolume = /*audioVolume*/ ctx[2];
    			album.$set(album_changes);
    			const eve_changes = {};
    			if (dirty & /*millisecondsUntilChristmas*/ 2) eve_changes.millisecondsUntilChristmas = /*millisecondsUntilChristmas*/ ctx[1];
    			eve.$set(eve_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(snowflakes.$$.fragment, local);
    			transition_in(timeleft.$$.fragment, local);
    			transition_in(album.$$.fragment, local);
    			transition_in(eve.$$.fragment, local);
    			transition_in(help.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(snowflakes.$$.fragment, local);
    			transition_out(timeleft.$$.fragment, local);
    			transition_out(album.$$.fragment, local);
    			transition_out(eve.$$.fragment, local);
    			transition_out(help.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(snowflakes);
    			destroy_component(timeleft);
    			if_block.d();
    			/*audio_1_binding*/ ctx[5](null);
    			destroy_component(album);
    			destroy_component(eve);
    			destroy_component(help);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let audio;

    	onMount(() => {
    		// when the audio binding is ready set the volume
    		$$invalidate(0, audio.volume = 0, audio);
    	});

    	/**
     * Number of MS until 12/25
     */
    	const getMillisecondsUntilChristmas = () => {
    		const today = new Date();
    		const christmas = new Date(today.getFullYear(), 11, 25);

    		// If we're in december
    		if (today.getMonth() == 11 && today.getDate() > 25) {
    			christmas.setFullYear(christmas.getFullYear() + 1);
    		}

    		// It is Christmas!
    		if (today.getMonth() == 11 && today.getDate() === 25) {
    			return 0;
    		}

    		return christmas.getTime() - today.getTime();
    	};

    	/**
     * Helper method to get the day thanksgiving falls on.
     * Fourth thursday of November
     */
    	const getThanksgivingDay = year => {
    		const octoberFirst = new Date(year, 10, 1);
    		const dayOfWeek = octoberFirst.getDay();
    		return 22 + (11 - dayOfWeek) % 7;
    	};

    	/**
     * Number of MS since the last thanksgiving
     */
    	const getMillisecondsSinceThanksgiving = () => {
    		const today = new Date();
    		let day = getThanksgivingDay(today.getFullYear());
    		let thanksgiving = new Date(today.getFullYear(), 10, day);

    		if (today.getTime() > thanksgiving.getTime()) {
    			day = getThanksgivingDay(today.getFullYear() - 1);
    			thanksgiving = new Date(today.getFullYear(), 10, day);
    		}

    		return today.getTime() - thanksgiving.getTime();
    	};

    	/**
     * Audio volume increases linearly from 0-15% 12/26-thanksgiving
     * Then 15-100% thanksgiving-12/25
     */
    	const getAudioVolume = () => {
    		const SPLIT = 0.15;
    		const today = new Date();
    		let dayAfterChristmas = new Date(today.getFullYear(), 11, 26);
    		let day = getThanksgivingDay(today.getFullYear());
    		let thanksgiving = new Date(today.getFullYear(), 10, day);

    		if (today > thanksgiving && today < dayAfterChristmas) {
    			return getMillisecondsSinceThanksgiving() / (getMillisecondsSinceThanksgiving() + getMillisecondsUntilChristmas()) * (1 - SPLIT) + SPLIT;
    		} else {
    			if (today > thanksgiving) {
    				day = getThanksgivingDay(today.getFullYear() + 1);
    				thanksgiving = new Date(today.getFullYear() + 1, 10, day);
    			}

    			if (today < dayAfterChristmas) {
    				dayAfterChristmas = new Date(today.getFullYear() - 1, 11, 26);
    			}

    			const millisecondsUntilThanksgiving = thanksgiving.getTime() - today.getTime();
    			const millisecondsSinceChristmas = today.getTime() - dayAfterChristmas.getTime();
    			return millisecondsSinceChristmas / (millisecondsSinceChristmas + millisecondsUntilThanksgiving) * SPLIT;
    		}
    	};

    	/**
     * Get the custom image cursor path depending on chrismas proximity
     */
    	const getCursor = volume => {
    		if (volume > 0.5) {
    			return "../assets/hat.png";
    		} else if (volume > 0.12) {
    			return "../assets/close.png";
    		} else {
    			return "../assets/sad.png";
    		}
    	};

    	let millisecondsUntilChristmas = getMillisecondsUntilChristmas();
    	let audioVolume = getAudioVolume();
    	const title = document.title;
    	let cursorImage = getCursor(audioVolume);

    	/**
     * Get the number of days, hours, and seconds until xmas
     */
    	const updateTimes = () => {
    		$$invalidate(1, millisecondsUntilChristmas = getMillisecondsUntilChristmas());

    		if (audio) {
    			$$invalidate(2, audioVolume = getAudioVolume());
    			$$invalidate(0, audio.volume = audioVolume, audio);
    		}

    		document.title = `${Math.round(audioVolume * 10000) / 100}% - ${title}`;
    	};

    	// Update every second
    	updateTimes();

    	setInterval(() => updateTimes(), 1_000);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => audio.paused ? audio.play() : audio.pause();

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audio = $$value;
    			$$invalidate(0, audio);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		TimeLeft,
    		Eve,
    		Help,
    		Album,
    		Snowflakes,
    		audio,
    		getMillisecondsUntilChristmas,
    		getThanksgivingDay,
    		getMillisecondsSinceThanksgiving,
    		getAudioVolume,
    		getCursor,
    		millisecondsUntilChristmas,
    		audioVolume,
    		title,
    		cursorImage,
    		updateTimes
    	});

    	$$self.$inject_state = $$props => {
    		if ('audio' in $$props) $$invalidate(0, audio = $$props.audio);
    		if ('millisecondsUntilChristmas' in $$props) $$invalidate(1, millisecondsUntilChristmas = $$props.millisecondsUntilChristmas);
    		if ('audioVolume' in $$props) $$invalidate(2, audioVolume = $$props.audioVolume);
    		if ('cursorImage' in $$props) $$invalidate(3, cursorImage = $$props.cursorImage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		audio,
    		millisecondsUntilChristmas,
    		audioVolume,
    		cursorImage,
    		click_handler,
    		audio_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
