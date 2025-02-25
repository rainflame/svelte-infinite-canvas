
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop$3() { }
    const identity = x => x;
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$3;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop$3;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
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
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop$3, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$3,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
            this.$destroy = noop$3;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$3) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$3) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop$3;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /*
    Contains a map of element references and x/y positions:
    {
        [id: String]: {
            element: DOMNode,
            x: Number,
            y: Number,
        }
    }
    */
    const linkedElements = writable({});

    /*
    Contains the item being dragged
    {
        id: String,
        x: Number,
        y: Number,
        dropped: bool,
    }
    */
    const dragging = writable({});

    /*
    Contains the ids of any animating objects
    [
        id: String
    ]
    */
    const animating = writable([]);

    /*
    Contains the zoom level as a Number
    */
    const zoom = writable(1);

    /* src/CanvasElementLink.svelte generated by Svelte v3.35.0 */
    const file$8 = "src/CanvasElementLink.svelte";

    // (99:0) {#if $linkedElements[to] && $linkedElements[from]}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let t;
    	let if_block_anchor;
    	let current;
    	var switch_value = /*LineComponent*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: {
    					line: [
    						create_line_slot,
    						({ hoverColor, color, stroke, hoverStroke }) => ({
    							21: hoverColor,
    							22: color,
    							23: stroke,
    							24: hoverStroke
    						}),
    						({ hoverColor, color, stroke, hoverStroke }) => (hoverColor ? 2097152 : 0) | (color ? 4194304 : 0) | (stroke ? 8388608 : 0) | (hoverStroke ? 16777216 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let if_block = /*hovering*/ ctx[14] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};

    			if (dirty & /*$$scope, width, height, stroke, x, y, from, to, lineX1, lineY1, lineX2, lineY2, hovering, hoverColor, color, hoverStroke*/ 65044323) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*LineComponent*/ ctx[2])) {
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
    					mount_component(switch_instance, t.parentNode, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (/*hovering*/ ctx[14]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*hovering*/ 16384) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(99:0) {#if $linkedElements[to] && $linkedElements[from]}",
    		ctx
    	});

    	return block;
    }

    // (101:4) 
    function create_line_slot(ctx) {
    	let div;
    	let svg;
    	let line;
    	let line_marker_end_value;
    	let line_y__value;
    	let line_stroke_value;
    	let line_stroke_width_value;
    	let svg_viewBox_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			line = svg_element("line");
    			attr_dev(line, "marker-end", line_marker_end_value = "url(#" + /*from*/ ctx[0] + "-" + /*to*/ ctx[1] + ")");
    			attr_dev(line, "x1", /*lineX1*/ ctx[10]);
    			attr_dev(line, "y1", /*lineY1*/ ctx[12]);
    			attr_dev(line, "x2", /*lineX2*/ ctx[11]);
    			attr_dev(line, "y2", line_y__value = /*lineY2*/ ctx[13] + /*stroke*/ ctx[23]);

    			attr_dev(line, "stroke", line_stroke_value = /*hovering*/ ctx[14]
    			? /*hoverColor*/ ctx[21]
    			: /*color*/ ctx[22]);

    			attr_dev(line, "stroke-width", line_stroke_width_value = /*hovering*/ ctx[14]
    			? /*hoverStroke*/ ctx[24]
    			: /*stroke*/ ctx[23]);

    			attr_dev(line, "class", "svelte-1604o2h");
    			add_location(line, file$8, 121, 8, 3449);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*width*/ ctx[6] + " " + (/*height*/ ctx[5] + /*stroke*/ ctx[23] * 2 + 4));
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(svg, "height", /*height*/ ctx[5] + /*stroke*/ ctx[23] * 2 + 4 + "px");
    			set_style(svg, "width", /*width*/ ctx[6] + "px");
    			set_style(svg, "left", /*x*/ ctx[8] + "px");
    			set_style(svg, "top", /*y*/ ctx[9] + "px");
    			attr_dev(svg, "class", "svelte-1604o2h");
    			add_location(svg, file$8, 101, 6, 2889);
    			attr_dev(div, "slot", "line");
    			add_location(div, file$8, 100, 4, 2813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, line);

    			if (!mounted) {
    				dispose = [
    					listen_dev(line, "click", /*handleLineClick*/ ctx[15], false, false, false),
    					listen_dev(line, "mouseover", /*handleLineHover*/ ctx[16], false, false, false),
    					listen_dev(line, "mouseout", /*handleLineLeave*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*from, to*/ 3 && line_marker_end_value !== (line_marker_end_value = "url(#" + /*from*/ ctx[0] + "-" + /*to*/ ctx[1] + ")")) {
    				attr_dev(line, "marker-end", line_marker_end_value);
    			}

    			if (dirty & /*lineX1*/ 1024) {
    				attr_dev(line, "x1", /*lineX1*/ ctx[10]);
    			}

    			if (dirty & /*lineY1*/ 4096) {
    				attr_dev(line, "y1", /*lineY1*/ ctx[12]);
    			}

    			if (dirty & /*lineX2*/ 2048) {
    				attr_dev(line, "x2", /*lineX2*/ ctx[11]);
    			}

    			if (dirty & /*lineY2, stroke*/ 8396800 && line_y__value !== (line_y__value = /*lineY2*/ ctx[13] + /*stroke*/ ctx[23])) {
    				attr_dev(line, "y2", line_y__value);
    			}

    			if (dirty & /*hovering, hoverColor, color*/ 6307840 && line_stroke_value !== (line_stroke_value = /*hovering*/ ctx[14]
    			? /*hoverColor*/ ctx[21]
    			: /*color*/ ctx[22])) {
    				attr_dev(line, "stroke", line_stroke_value);
    			}

    			if (dirty & /*hovering, hoverStroke, stroke*/ 25182208 && line_stroke_width_value !== (line_stroke_width_value = /*hovering*/ ctx[14]
    			? /*hoverStroke*/ ctx[24]
    			: /*stroke*/ ctx[23])) {
    				attr_dev(line, "stroke-width", line_stroke_width_value);
    			}

    			if (dirty & /*width, height, stroke*/ 8388704 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*width*/ ctx[6] + " " + (/*height*/ ctx[5] + /*stroke*/ ctx[23] * 2 + 4))) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*height, stroke*/ 8388640) {
    				set_style(svg, "height", /*height*/ ctx[5] + /*stroke*/ ctx[23] * 2 + 4 + "px");
    			}

    			if (dirty & /*width*/ 64) {
    				set_style(svg, "width", /*width*/ ctx[6] + "px");
    			}

    			if (dirty & /*x*/ 256) {
    				set_style(svg, "left", /*x*/ ctx[8] + "px");
    			}

    			if (dirty & /*y*/ 512) {
    				set_style(svg, "top", /*y*/ ctx[9] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_line_slot.name,
    		type: "slot",
    		source: "(101:4) ",
    		ctx
    	});

    	return block;
    }

    // (138:2) {#if hovering}
    function create_if_block_1$1(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	const switch_instance_spread_levels = [/*lineProps*/ ctx[4]];
    	var switch_value = /*LineAnnotationComponent*/ ctx[3];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "line-annotation svelte-1604o2h");
    			set_style(div, "left", /*x*/ ctx[8] + /*width*/ ctx[6] / 2 + "px");
    			set_style(div, "top", /*y*/ ctx[9] + /*height*/ ctx[5] / 2 + "px");
    			add_location(div, file$8, 138, 4, 3896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*lineProps*/ 16)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*lineProps*/ ctx[4])])
    			: {};

    			if (switch_value !== (switch_value = /*LineAnnotationComponent*/ ctx[3])) {
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
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*x, width*/ 320) {
    				set_style(div, "left", /*x*/ ctx[8] + /*width*/ ctx[6] / 2 + "px");
    			}

    			if (!current || dirty & /*y, height*/ 544) {
    				set_style(div, "top", /*y*/ ctx[9] + /*height*/ ctx[5] / 2 + "px");
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(138:2) {#if hovering}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$linkedElements*/ ctx[7][/*to*/ ctx[1]] && /*$linkedElements*/ ctx[7][/*from*/ ctx[0]] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$linkedElements*/ ctx[7][/*to*/ ctx[1]] && /*$linkedElements*/ ctx[7][/*from*/ ctx[0]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$linkedElements, to, from*/ 131) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $linkedElements;
    	let $dragging;
    	let $animating;
    	let $zoom;
    	validate_store(linkedElements, "linkedElements");
    	component_subscribe($$self, linkedElements, $$value => $$invalidate(7, $linkedElements = $$value));
    	validate_store(dragging, "dragging");
    	component_subscribe($$self, dragging, $$value => $$invalidate(18, $dragging = $$value));
    	validate_store(animating, "animating");
    	component_subscribe($$self, animating, $$value => $$invalidate(19, $animating = $$value));
    	validate_store(zoom, "zoom");
    	component_subscribe($$self, zoom, $$value => $$invalidate(20, $zoom = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CanvasElementLink", slots, []);
    	let { from = null } = $$props;
    	let { to = null } = $$props;
    	let { LineComponent } = $$props;
    	let { LineAnnotationComponent } = $$props;
    	let { lineProps = {} } = $$props;
    	let height = 0;
    	let width = 0;
    	let x = 0;
    	let y = 0;
    	let lineX1 = 0;
    	let lineX2 = 0;
    	let lineY1 = 0;
    	let lineY2 = 0;
    	let hovering = false;

    	const handleLineClick = () => {
    		
    	};

    	const handleLineHover = () => {
    		$$invalidate(14, hovering = true);
    	};

    	const handleLineLeave = () => {
    		$$invalidate(14, hovering = false);
    	};

    	const writable_props = ["from", "to", "LineComponent", "LineAnnotationComponent", "lineProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CanvasElementLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("from" in $$props) $$invalidate(0, from = $$props.from);
    		if ("to" in $$props) $$invalidate(1, to = $$props.to);
    		if ("LineComponent" in $$props) $$invalidate(2, LineComponent = $$props.LineComponent);
    		if ("LineAnnotationComponent" in $$props) $$invalidate(3, LineAnnotationComponent = $$props.LineAnnotationComponent);
    		if ("lineProps" in $$props) $$invalidate(4, lineProps = $$props.lineProps);
    	};

    	$$self.$capture_state = () => ({
    		linkedElements,
    		dragging,
    		animating,
    		zoom,
    		from,
    		to,
    		LineComponent,
    		LineAnnotationComponent,
    		lineProps,
    		height,
    		width,
    		x,
    		y,
    		lineX1,
    		lineX2,
    		lineY1,
    		lineY2,
    		hovering,
    		handleLineClick,
    		handleLineHover,
    		handleLineLeave,
    		$linkedElements,
    		$dragging,
    		$animating,
    		$zoom
    	});

    	$$self.$inject_state = $$props => {
    		if ("from" in $$props) $$invalidate(0, from = $$props.from);
    		if ("to" in $$props) $$invalidate(1, to = $$props.to);
    		if ("LineComponent" in $$props) $$invalidate(2, LineComponent = $$props.LineComponent);
    		if ("LineAnnotationComponent" in $$props) $$invalidate(3, LineAnnotationComponent = $$props.LineAnnotationComponent);
    		if ("lineProps" in $$props) $$invalidate(4, lineProps = $$props.lineProps);
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("width" in $$props) $$invalidate(6, width = $$props.width);
    		if ("x" in $$props) $$invalidate(8, x = $$props.x);
    		if ("y" in $$props) $$invalidate(9, y = $$props.y);
    		if ("lineX1" in $$props) $$invalidate(10, lineX1 = $$props.lineX1);
    		if ("lineX2" in $$props) $$invalidate(11, lineX2 = $$props.lineX2);
    		if ("lineY1" in $$props) $$invalidate(12, lineY1 = $$props.lineY1);
    		if ("lineY2" in $$props) $$invalidate(13, lineY2 = $$props.lineY2);
    		if ("hovering" in $$props) $$invalidate(14, hovering = $$props.hovering);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$linkedElements, to, from, $dragging, $animating, $zoom, height, width*/ 1835235) {
    			{
    				// recalculate when linked elements updates, or one of the ends is being dragged
    				if ($linkedElements[to] && $linkedElements[from] && ($dragging.id === undefined || $dragging.id === from || $dragging.id === to || $animating.includes(to) || $animating.includes(from))) {
    					// TODO: this doesn't work when the elements  render off screen, since everything is relative to the viewport
    					const fromPos = $linkedElements[from].element.getBoundingClientRect();

    					const toPos = $linkedElements[to].element.getBoundingClientRect();

    					// adjust the start and end positions to take into account the size of the element and zoom level
    					const adjustedFromX = Math.round($linkedElements[from].x + fromPos.width * (1 / $zoom));

    					const adjustedFromY = Math.round($linkedElements[from].y + fromPos.height * (1 / $zoom) / 2);
    					const adjustedToY = Math.round($linkedElements[to].y + toPos.height * (1 / $zoom) / 2);
    					$$invalidate(5, height = Math.abs(adjustedToY - adjustedFromY) || 0);
    					$$invalidate(6, width = Math.abs($linkedElements[to].x - adjustedFromX) || 0);

    					if (adjustedToY < adjustedFromY) {
    						// top to bottom
    						$$invalidate(12, lineY1 = height);

    						$$invalidate(13, lineY2 = 0);
    						$$invalidate(9, y = adjustedToY);
    					} else {
    						// bottom to top
    						$$invalidate(12, lineY1 = 0);

    						$$invalidate(13, lineY2 = height);
    						$$invalidate(9, y = adjustedFromY);
    					}

    					if ($linkedElements[to].x < adjustedFromX) {
    						$$invalidate(8, x = $linkedElements[to].x);
    						$$invalidate(10, lineX1 = width);
    						$$invalidate(11, lineX2 = 0);
    					} else {
    						$$invalidate(8, x = adjustedFromX);
    						$$invalidate(11, lineX2 = width);
    						$$invalidate(10, lineX1 = 0);
    					}

    					// remove any of the animating ids from the store now that we've updated the connection
    					if ($animating.includes(to) || $animating.includes(from)) {
    						let newAnimating = [...$animating];

    						newAnimating = newAnimating.filter(id => {
    							return id !== to && id !== from;
    						});

    						animating.set(newAnimating);
    					}
    				}
    			}
    		}
    	};

    	return [
    		from,
    		to,
    		LineComponent,
    		LineAnnotationComponent,
    		lineProps,
    		height,
    		width,
    		$linkedElements,
    		x,
    		y,
    		lineX1,
    		lineX2,
    		lineY1,
    		lineY2,
    		hovering,
    		handleLineClick,
    		handleLineHover,
    		handleLineLeave,
    		$dragging,
    		$animating,
    		$zoom
    	];
    }

    class CanvasElementLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			from: 0,
    			to: 1,
    			LineComponent: 2,
    			LineAnnotationComponent: 3,
    			lineProps: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CanvasElementLink",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*LineComponent*/ ctx[2] === undefined && !("LineComponent" in props)) {
    			console.warn("<CanvasElementLink> was created without expected prop 'LineComponent'");
    		}

    		if (/*LineAnnotationComponent*/ ctx[3] === undefined && !("LineAnnotationComponent" in props)) {
    			console.warn("<CanvasElementLink> was created without expected prop 'LineAnnotationComponent'");
    		}
    	}

    	get from() {
    		throw new Error("<CanvasElementLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set from(value) {
    		throw new Error("<CanvasElementLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		throw new Error("<CanvasElementLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<CanvasElementLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get LineComponent() {
    		throw new Error("<CanvasElementLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set LineComponent(value) {
    		throw new Error("<CanvasElementLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get LineAnnotationComponent() {
    		throw new Error("<CanvasElementLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set LineAnnotationComponent(value) {
    		throw new Error("<CanvasElementLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineProps() {
    		throw new Error("<CanvasElementLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineProps(value) {
    		throw new Error("<CanvasElementLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
    Contains the current transform matrix as a String
    */
    const position = writable("");

    /**
     * This module used to unify mouse wheel behavior between different browsers in 2014
     * Now it's just a wrapper around addEventListener('wheel');
     *
     * Usage:
     *  var addWheelListener = require('wheel').addWheelListener;
     *  var removeWheelListener = require('wheel').removeWheelListener;
     *  addWheelListener(domElement, function (e) {
     *    // mouse wheel event
     *  });
     *  removeWheelListener(domElement, function);
     */
    var wheel = addWheelListener;

    // But also expose "advanced" api with unsubscribe:
    var addWheelListener_1 = addWheelListener;
    var removeWheelListener_1 = removeWheelListener;


    function addWheelListener(element, listener, useCapture) {
      element.addEventListener('wheel', listener, useCapture);
    }

    function removeWheelListener( element, listener, useCapture ) {
      element.removeEventListener('wheel', listener, useCapture);
    }
    wheel.addWheelListener = addWheelListener_1;
    wheel.removeWheelListener = removeWheelListener_1;

    /**
     * https://github.com/gre/bezier-easing
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2015 – MIT License
     */
    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;

    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    var float32ArraySupported = typeof Float32Array === 'function';

    function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
    function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
    function C (aA1)      { return 3.0 * aA1; }

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

    function binarySubdivide (aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    }

    function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
     for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
       var currentSlope = getSlope(aGuessT, mX1, mX2);
       if (currentSlope === 0.0) {
         return aGuessT;
       }
       var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
       aGuessT -= currentX / currentSlope;
     }
     return aGuessT;
    }

    function LinearEasing (x) {
      return x;
    }

    var src = function bezier (mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error('bezier x values must be in [0, 1] range');
      }

      if (mX1 === mY1 && mX2 === mY2) {
        return LinearEasing;
      }

      // Precompute samples table
      var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }

      function getTForX (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }
        --currentSample;

        // Interpolate to provide an initial guess for t
        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;

        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }

      return function BezierEasing (x) {
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (x === 0) {
          return 0;
        }
        if (x === 1) {
          return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
      };
    };

    // Predefined set of animations. Similar to CSS easing functions
    var animations = {
      ease:  src(0.25, 0.1, 0.25, 1),
      easeIn: src(0.42, 0, 1, 1),
      easeOut: src(0, 0, 0.58, 1),
      easeInOut: src(0.42, 0, 0.58, 1),
      linear: src(0, 0, 1, 1)
    };


    var amator = animate;
    var makeAggregateRaf_1 = makeAggregateRaf;
    var sharedScheduler = makeAggregateRaf();


    function animate(source, target, options) {
      var start = Object.create(null);
      var diff = Object.create(null);
      options = options || {};
      // We let clients specify their own easing function
      var easing = (typeof options.easing === 'function') ? options.easing : animations[options.easing];

      // if nothing is specified, default to ease (similar to CSS animations)
      if (!easing) {
        if (options.easing) {
          console.warn('Unknown easing function in amator: ' + options.easing);
        }
        easing = animations.ease;
      }

      var step = typeof options.step === 'function' ? options.step : noop$2;
      var done = typeof options.done === 'function' ? options.done : noop$2;

      var scheduler = getScheduler(options.scheduler);

      var keys = Object.keys(target);
      keys.forEach(function(key) {
        start[key] = source[key];
        diff[key] = target[key] - source[key];
      });

      var durationInMs = typeof options.duration === 'number' ? options.duration : 400;
      var durationInFrames = Math.max(1, durationInMs * 0.06); // 0.06 because 60 frames pers 1,000 ms
      var previousAnimationId;
      var frame = 0;

      previousAnimationId = scheduler.next(loop);

      return {
        cancel: cancel
      }

      function cancel() {
        scheduler.cancel(previousAnimationId);
        previousAnimationId = 0;
      }

      function loop() {
        var t = easing(frame/durationInFrames);
        frame += 1;
        setValues(t);
        if (frame <= durationInFrames) {
          previousAnimationId = scheduler.next(loop);
          step(source);
        } else {
          previousAnimationId = 0;
          setTimeout(function() { done(source); }, 0);
        }
      }

      function setValues(t) {
        keys.forEach(function(key) {
          source[key] = diff[key] * t + start[key];
        });
      }
    }

    function noop$2() { }

    function getScheduler(scheduler) {
      if (!scheduler) {
        var canRaf = typeof window !== 'undefined' && window.requestAnimationFrame;
        return canRaf ? rafScheduler() : timeoutScheduler()
      }
      if (typeof scheduler.next !== 'function') throw new Error('Scheduler is supposed to have next(cb) function')
      if (typeof scheduler.cancel !== 'function') throw new Error('Scheduler is supposed to have cancel(handle) function')

      return scheduler
    }

    function rafScheduler() {
      return {
        next: window.requestAnimationFrame.bind(window),
        cancel: window.cancelAnimationFrame.bind(window)
      }
    }

    function timeoutScheduler() {
      return {
        next: function(cb) {
          return setTimeout(cb, 1000/60)
        },
        cancel: function (id) {
          return clearTimeout(id)
        }
      }
    }

    function makeAggregateRaf() {
      var frontBuffer = new Set();
      var backBuffer = new Set();
      var frameToken = 0;

      return {
        next: next,
        cancel: next,
        clearAll: clearAll
      }

      function clearAll() {
        frontBuffer.clear();
        backBuffer.clear();
        cancelAnimationFrame(frameToken);
        frameToken = 0;
      }

      function next(callback) {
        backBuffer.add(callback);
        renderNextFrame();
      }

      function renderNextFrame() {
        if (!frameToken) frameToken = requestAnimationFrame(renderFrame);
      }

      function renderFrame() {
        frameToken = 0;

        var t = backBuffer;
        backBuffer = frontBuffer;
        frontBuffer = t;

        frontBuffer.forEach(function(callback) {
          callback();
        });
        frontBuffer.clear();
      }
    }
    amator.makeAggregateRaf = makeAggregateRaf_1;
    amator.sharedScheduler = sharedScheduler;

    var ngraph_events = function eventify(subject) {
      validateSubject(subject);

      var eventsStorage = createEventsStorage(subject);
      subject.on = eventsStorage.on;
      subject.off = eventsStorage.off;
      subject.fire = eventsStorage.fire;
      return subject;
    };

    function createEventsStorage(subject) {
      // Store all event listeners to this hash. Key is event name, value is array
      // of callback records.
      //
      // A callback record consists of callback function and its optional context:
      // { 'eventName' => [{callback: function, ctx: object}] }
      var registeredEvents = Object.create(null);

      return {
        on: function (eventName, callback, ctx) {
          if (typeof callback !== 'function') {
            throw new Error('callback is expected to be a function');
          }
          var handlers = registeredEvents[eventName];
          if (!handlers) {
            handlers = registeredEvents[eventName] = [];
          }
          handlers.push({callback: callback, ctx: ctx});

          return subject;
        },

        off: function (eventName, callback) {
          var wantToRemoveAll = (typeof eventName === 'undefined');
          if (wantToRemoveAll) {
            // Killing old events storage should be enough in this case:
            registeredEvents = Object.create(null);
            return subject;
          }

          if (registeredEvents[eventName]) {
            var deleteAllCallbacksForEvent = (typeof callback !== 'function');
            if (deleteAllCallbacksForEvent) {
              delete registeredEvents[eventName];
            } else {
              var callbacks = registeredEvents[eventName];
              for (var i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].callback === callback) {
                  callbacks.splice(i, 1);
                }
              }
            }
          }

          return subject;
        },

        fire: function (eventName) {
          var callbacks = registeredEvents[eventName];
          if (!callbacks) {
            return subject;
          }

          var fireArguments;
          if (arguments.length > 1) {
            fireArguments = Array.prototype.splice.call(arguments, 1);
          }
          for(var i = 0; i < callbacks.length; ++i) {
            var callbackInfo = callbacks[i];
            callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
          }

          return subject;
        }
      };
    }

    function validateSubject(subject) {
      if (!subject) {
        throw new Error('Eventify cannot use falsy object as events subject');
      }
      var reservedWords = ['on', 'fire', 'off'];
      for (var i = 0; i < reservedWords.length; ++i) {
        if (subject.hasOwnProperty(reservedWords[i])) {
          throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
        }
      }
    }

    /**
     * Allows smooth kinetic scrolling of the surface
     */
    var kinetic_1 = kinetic;

    function kinetic(getPoint, scroll, settings) {
      if (typeof settings !== 'object') {
        // setting could come as boolean, we should ignore it, and use an object.
        settings = {};
      }

      var minVelocity = typeof settings.minVelocity === 'number' ? settings.minVelocity : 5;
      var amplitude = typeof settings.amplitude === 'number' ? settings.amplitude : 0.25;
      var cancelAnimationFrame = typeof settings.cancelAnimationFrame === 'function' ? settings.cancelAnimationFrame : getCancelAnimationFrame();
      var requestAnimationFrame = typeof settings.requestAnimationFrame === 'function' ? settings.requestAnimationFrame : getRequestAnimationFrame();

      var lastPoint;
      var timestamp;
      var timeConstant = 342;

      var ticker;
      var vx, targetX, ax;
      var vy, targetY, ay;

      var raf;

      return {
        start: start,
        stop: stop,
        cancel: dispose
      };

      function dispose() {
        cancelAnimationFrame(ticker);
        cancelAnimationFrame(raf);
      }

      function start() {
        lastPoint = getPoint();

        ax = ay = vx = vy = 0;
        timestamp = new Date();

        cancelAnimationFrame(ticker);
        cancelAnimationFrame(raf);

        // we start polling the point position to accumulate velocity
        // Once we stop(), we will use accumulated velocity to keep scrolling
        // an object.
        ticker = requestAnimationFrame(track);
      }

      function track() {
        var now = Date.now();
        var elapsed = now - timestamp;
        timestamp = now;

        var currentPoint = getPoint();

        var dx = currentPoint.x - lastPoint.x;
        var dy = currentPoint.y - lastPoint.y;

        lastPoint = currentPoint;

        var dt = 1000 / (1 + elapsed);

        // moving average
        vx = 0.8 * dx * dt + 0.2 * vx;
        vy = 0.8 * dy * dt + 0.2 * vy;

        ticker = requestAnimationFrame(track);
      }

      function stop() {
        cancelAnimationFrame(ticker);
        cancelAnimationFrame(raf);

        var currentPoint = getPoint();

        targetX = currentPoint.x;
        targetY = currentPoint.y;
        timestamp = Date.now();

        if (vx < -minVelocity || vx > minVelocity) {
          ax = amplitude * vx;
          targetX += ax;
        }

        if (vy < -minVelocity || vy > minVelocity) {
          ay = amplitude * vy;
          targetY += ay;
        }

        raf = requestAnimationFrame(autoScroll);
      }

      function autoScroll() {
        var elapsed = Date.now() - timestamp;

        var moving = false;
        var dx = 0;
        var dy = 0;

        if (ax) {
          dx = -ax * Math.exp(-elapsed / timeConstant);

          if (dx > 0.5 || dx < -0.5) moving = true;
          else dx = ax = 0;
        }

        if (ay) {
          dy = -ay * Math.exp(-elapsed / timeConstant);

          if (dy > 0.5 || dy < -0.5) moving = true;
          else dy = ay = 0;
        }

        if (moving) {
          scroll(targetX + dx, targetY + dy);
          raf = requestAnimationFrame(autoScroll);
        }
      }
    }

    function getCancelAnimationFrame() {
      if (typeof cancelAnimationFrame === 'function') return cancelAnimationFrame;
      return clearTimeout;
    }

    function getRequestAnimationFrame() {
      if (typeof requestAnimationFrame === 'function') return requestAnimationFrame;

      return function (handler) {
        return setTimeout(handler, 16);
      }
    }

    /**
     * Disallows selecting text.
     */
    var createTextSelectionInterceptor_1 = createTextSelectionInterceptor;

    function createTextSelectionInterceptor(useFake) {
      if (useFake) {
        return {
          capture: noop$1,
          release: noop$1
        };
      }

      var dragObject;
      var prevSelectStart;
      var prevDragStart;
      var wasCaptured = false;

      return {
        capture: capture,
        release: release
      };

      function capture(domObject) {
        wasCaptured = true;
        prevSelectStart = window.document.onselectstart;
        prevDragStart = window.document.ondragstart;

        window.document.onselectstart = disabled;

        dragObject = domObject;
        dragObject.ondragstart = disabled;
      }

      function release() {
        if (!wasCaptured) return;
        
        wasCaptured = false;
        window.document.onselectstart = prevSelectStart;
        if (dragObject) dragObject.ondragstart = prevDragStart;
      }
    }

    function disabled(e) {
      e.stopPropagation();
      return false;
    }

    function noop$1() {}

    var transform = Transform;

    function Transform() {
      this.x = 0;
      this.y = 0;
      this.scale = 1;
    }

    var svgController = makeSvgController;
    var canAttach$1 = isSVGElement;

    function makeSvgController(svgElement, options) {
      if (!isSVGElement(svgElement)) {
        throw new Error('svg element is required for svg.panzoom to work')
      }

      var owner = svgElement.ownerSVGElement;
      if (!owner) {
        throw new Error(
          'Do not apply panzoom to the root <svg> element. ' +
          'Use its child instead (e.g. <g></g>). ' +
          'As of March 2016 only FireFox supported transform on the root element')
      }

      if (!options.disableKeyboardInteraction) {
        owner.setAttribute('tabindex', 0);
      }

      var api = {
        getBBox: getBBox,
        getScreenCTM: getScreenCTM,
        getOwner: getOwner,
        applyTransform: applyTransform,
        initTransform: initTransform
      };
      
      return api

      function getOwner() {
        return owner
      }

      function getBBox() {
        var bbox =  svgElement.getBBox();
        return {
          left: bbox.x,
          top: bbox.y,
          width: bbox.width,
          height: bbox.height,
        }
      }

      function getScreenCTM() {
        var ctm = owner.getCTM();
        if (!ctm) {
          // This is likely firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=873106
          // The code below is not entirely correct, but still better than nothing
          return owner.getScreenCTM();
        }
        return ctm;
      }

      function initTransform(transform) {
        var screenCTM = svgElement.getCTM();

        // The above line returns null on Firefox
        if (screenCTM === null) {
          screenCTM = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
        }

        transform.x = screenCTM.e;
        transform.y = screenCTM.f;
        transform.scale = screenCTM.a;
        owner.removeAttributeNS(null, 'viewBox');
      }

      function applyTransform(transform) {
        svgElement.setAttribute('transform', 'matrix(' +
          transform.scale + ' 0 0 ' +
          transform.scale + ' ' +
          transform.x + ' ' + transform.y + ')');
      }
    }

    function isSVGElement(element) {
      return element && element.ownerSVGElement && element.getCTM;
    }
    svgController.canAttach = canAttach$1;

    var domController = makeDomController;

    var canAttach = isDomElement;

    function makeDomController(domElement, options) {
      var elementValid = isDomElement(domElement); 
      if (!elementValid) {
        throw new Error('panzoom requires DOM element to be attached to the DOM tree')
      }

      var owner = domElement.parentElement;
      domElement.scrollTop = 0;
      
      if (!options.disableKeyboardInteraction) {
        owner.setAttribute('tabindex', 0);
      }

      var api = {
        getBBox: getBBox,
        getOwner: getOwner,
        applyTransform: applyTransform,
      };
      
      return api

      function getOwner() {
        return owner
      }

      function getBBox() {
        // TODO: We should probably cache this?
        return  {
          left: 0,
          top: 0,
          width: domElement.clientWidth,
          height: domElement.clientHeight
        }
      }

      function applyTransform(transform) {
        // TODO: Should we cache this?
        domElement.style.transformOrigin = '0 0 0';
        domElement.style.transform = 'matrix(' +
          transform.scale + ', 0, 0, ' +
          transform.scale + ', ' +
          transform.x + ', ' + transform.y + ')';
      }
    }

    function isDomElement(element) {
      return element && element.parentElement && element.style;
    }
    domController.canAttach = canAttach;

    /**
     * Allows to drag and zoom svg elements
     */





    var domTextSelectionInterceptor = createTextSelectionInterceptor_1();
    var fakeTextSelectorInterceptor = createTextSelectionInterceptor_1(true);




    var defaultZoomSpeed = 1;
    var defaultDoubleTapZoomSpeed = 1.75;
    var doubleTapSpeedInMS = 300;

    var panzoom = createPanZoom;

    /**
     * Creates a new instance of panzoom, so that an object can be panned and zoomed
     *
     * @param {DOMElement} domElement where panzoom should be attached.
     * @param {Object} options that configure behavior.
     */
    function createPanZoom(domElement, options) {
      options = options || {};

      var panController = options.controller;

      if (!panController) {
        if (svgController.canAttach(domElement)) {
          panController = svgController(domElement, options);
        } else if (domController.canAttach(domElement)) {
          panController = domController(domElement, options);
        }
      }

      if (!panController) {
        throw new Error(
          'Cannot create panzoom for the current type of dom element'
        );
      }
      var owner = panController.getOwner();
      // just to avoid GC pressure, every time we do intermediate transform
      // we return this object. For internal use only. Never give it back to the consumer of this library
      var storedCTMResult = { x: 0, y: 0 };

      var isDirty = false;
      var transform$1 = new transform();

      if (panController.initTransform) {
        panController.initTransform(transform$1);
      }

      var filterKey = typeof options.filterKey === 'function' ? options.filterKey : noop;
      // TODO: likely need to unite pinchSpeed with zoomSpeed
      var pinchSpeed = typeof options.pinchSpeed === 'number' ? options.pinchSpeed : 1;
      var bounds = options.bounds;
      var maxZoom = typeof options.maxZoom === 'number' ? options.maxZoom : Number.POSITIVE_INFINITY;
      var minZoom = typeof options.minZoom === 'number' ? options.minZoom : 0;

      var boundsPadding = typeof options.boundsPadding === 'number' ? options.boundsPadding : 0.05;
      var zoomDoubleClickSpeed = typeof options.zoomDoubleClickSpeed === 'number' ? options.zoomDoubleClickSpeed : defaultDoubleTapZoomSpeed;
      var beforeWheel = options.beforeWheel || noop;
      var beforeMouseDown = options.beforeMouseDown || noop;
      var speed = typeof options.zoomSpeed === 'number' ? options.zoomSpeed : defaultZoomSpeed;
      var transformOrigin = parseTransformOrigin(options.transformOrigin);
      var textSelection = options.enableTextSelection ? fakeTextSelectorInterceptor : domTextSelectionInterceptor;

      validateBounds(bounds);

      if (options.autocenter) {
        autocenter();
      }

      var frameAnimation;
      var lastTouchEndTime = 0;
      var lastSingleFingerOffset;
      var touchInProgress = false;

      // We only need to fire panstart when actual move happens
      var panstartFired = false;

      // cache mouse coordinates here
      var mouseX;
      var mouseY;

      var pinchZoomLength;

      var smoothScroll;
      if ('smoothScroll' in options && !options.smoothScroll) {
        // If user explicitly asked us not to use smooth scrolling, we obey
        smoothScroll = rigidScroll();
      } else {
        // otherwise we use forward smoothScroll settings to kinetic API
        // which makes scroll smoothing.
        smoothScroll = kinetic_1(getPoint, scroll, options.smoothScroll);
      }

      var moveByAnimation;
      var zoomToAnimation;

      var multiTouch;
      var paused = false;

      listenForEvents();

      var api = {
        dispose: dispose,
        moveBy: internalMoveBy,
        moveTo: moveTo,
        smoothMoveTo: smoothMoveTo, 
        centerOn: centerOn,
        zoomTo: publicZoomTo,
        zoomAbs: zoomAbs,
        smoothZoom: smoothZoom,
        smoothZoomAbs: smoothZoomAbs,
        showRectangle: showRectangle,

        pause: pause,
        resume: resume,
        isPaused: isPaused,

        getTransform: getTransformModel,

        getMinZoom: getMinZoom,
        setMinZoom: setMinZoom,

        getMaxZoom: getMaxZoom,
        setMaxZoom: setMaxZoom,

        getTransformOrigin: getTransformOrigin,
        setTransformOrigin: setTransformOrigin,

        getZoomSpeed: getZoomSpeed,
        setZoomSpeed: setZoomSpeed
      };

      ngraph_events(api);
      
      var initialX = typeof options.initialX === 'number' ? options.initialX : transform$1.x;
      var initialY = typeof options.initialY === 'number' ? options.initialY : transform$1.y;
      var initialZoom = typeof options.initialZoom === 'number' ? options.initialZoom : transform$1.scale;

      if(initialX != transform$1.x || initialY != transform$1.y || initialZoom != transform$1.Scale){
        zoomAbs(initialX, initialY, initialZoom);
      }

      return api;

      function pause() {
        releaseEvents();
        paused = true;
      }

      function resume() {
        if (paused) {
          listenForEvents();
          paused = false;
        }
      }

      function isPaused() {
        return paused;
      }

      function showRectangle(rect) {
        // TODO: this duplicates autocenter. I think autocenter should go.
        var clientRect = owner.getBoundingClientRect();
        var size = transformToScreen(clientRect.width, clientRect.height);

        var rectWidth = rect.right - rect.left;
        var rectHeight = rect.bottom - rect.top;
        if (!Number.isFinite(rectWidth) || !Number.isFinite(rectHeight)) {
          throw new Error('Invalid rectangle');
        }

        var dw = size.x / rectWidth;
        var dh = size.y / rectHeight;
        var scale = Math.min(dw, dh);
        transform$1.x = -(rect.left + rectWidth / 2) * scale + size.x / 2;
        transform$1.y = -(rect.top + rectHeight / 2) * scale + size.y / 2;
        transform$1.scale = scale;
      }

      function transformToScreen(x, y) {
        if (panController.getScreenCTM) {
          var parentCTM = panController.getScreenCTM();
          var parentScaleX = parentCTM.a;
          var parentScaleY = parentCTM.d;
          var parentOffsetX = parentCTM.e;
          var parentOffsetY = parentCTM.f;
          storedCTMResult.x = x * parentScaleX - parentOffsetX;
          storedCTMResult.y = y * parentScaleY - parentOffsetY;
        } else {
          storedCTMResult.x = x;
          storedCTMResult.y = y;
        }

        return storedCTMResult;
      }

      function autocenter() {
        var w; // width of the parent
        var h; // height of the parent
        var left = 0;
        var top = 0;
        var sceneBoundingBox = getBoundingBox();
        if (sceneBoundingBox) {
          // If we have bounding box - use it.
          left = sceneBoundingBox.left;
          top = sceneBoundingBox.top;
          w = sceneBoundingBox.right - sceneBoundingBox.left;
          h = sceneBoundingBox.bottom - sceneBoundingBox.top;
        } else {
          // otherwise just use whatever space we have
          var ownerRect = owner.getBoundingClientRect();
          w = ownerRect.width;
          h = ownerRect.height;
        }
        var bbox = panController.getBBox();
        if (bbox.width === 0 || bbox.height === 0) {
          // we probably do not have any elements in the SVG
          // just bail out;
          return;
        }
        var dh = h / bbox.height;
        var dw = w / bbox.width;
        var scale = Math.min(dw, dh);
        transform$1.x = -(bbox.left + bbox.width / 2) * scale + w / 2 + left;
        transform$1.y = -(bbox.top + bbox.height / 2) * scale + h / 2 + top;
        transform$1.scale = scale;
      }

      function getTransformModel() {
        // TODO: should this be read only?
        return transform$1;
      }

      function getMinZoom() {
        return minZoom;
      }

      function setMinZoom(newMinZoom) {
        minZoom = newMinZoom;
      }

      function getMaxZoom() {
        return maxZoom;
      }

      function setMaxZoom(newMaxZoom) {
        maxZoom = newMaxZoom;
      }

      function getTransformOrigin() {
        return transformOrigin;
      }

      function setTransformOrigin(newTransformOrigin) {
        transformOrigin = parseTransformOrigin(newTransformOrigin);
      }

      function getZoomSpeed() {
        return speed;
      }

      function setZoomSpeed(newSpeed) {
        if (!Number.isFinite(newSpeed)) {
          throw new Error('Zoom speed should be a number');
        }
        speed = newSpeed;
      }

      function getPoint() {
        return {
          x: transform$1.x,
          y: transform$1.y
        };
      }

      function moveTo(x, y) {
        transform$1.x = x;
        transform$1.y = y;

        keepTransformInsideBounds();

        triggerEvent('pan');
        makeDirty();
      }

      function moveBy(dx, dy) {
        moveTo(transform$1.x + dx, transform$1.y + dy);
      }

      function keepTransformInsideBounds() {
        var boundingBox = getBoundingBox();
        if (!boundingBox) return;

        var adjusted = false;
        var clientRect = getClientRect();

        var diff = boundingBox.left - clientRect.right;
        if (diff > 0) {
          transform$1.x += diff;
          adjusted = true;
        }
        // check the other side:
        diff = boundingBox.right - clientRect.left;
        if (diff < 0) {
          transform$1.x += diff;
          adjusted = true;
        }

        // y axis:
        diff = boundingBox.top - clientRect.bottom;
        if (diff > 0) {
          // we adjust transform, so that it matches exactly our bounding box:
          // transform.y = boundingBox.top - (boundingBox.height + boundingBox.y) * transform.scale =>
          // transform.y = boundingBox.top - (clientRect.bottom - transform.y) =>
          // transform.y = diff + transform.y =>
          transform$1.y += diff;
          adjusted = true;
        }

        diff = boundingBox.bottom - clientRect.top;
        if (diff < 0) {
          transform$1.y += diff;
          adjusted = true;
        }
        return adjusted;
      }

      /**
       * Returns bounding box that should be used to restrict scene movement.
       */
      function getBoundingBox() {
        if (!bounds) return; // client does not want to restrict movement

        if (typeof bounds === 'boolean') {
          // for boolean type we use parent container bounds
          var ownerRect = owner.getBoundingClientRect();
          var sceneWidth = ownerRect.width;
          var sceneHeight = ownerRect.height;

          return {
            left: sceneWidth * boundsPadding,
            top: sceneHeight * boundsPadding,
            right: sceneWidth * (1 - boundsPadding),
            bottom: sceneHeight * (1 - boundsPadding)
          };
        }

        return bounds;
      }

      function getClientRect() {
        var bbox = panController.getBBox();
        var leftTop = client(bbox.left, bbox.top);

        return {
          left: leftTop.x,
          top: leftTop.y,
          right: bbox.width * transform$1.scale + leftTop.x,
          bottom: bbox.height * transform$1.scale + leftTop.y
        };
      }

      function client(x, y) {
        return {
          x: x * transform$1.scale + transform$1.x,
          y: y * transform$1.scale + transform$1.y
        };
      }

      function makeDirty() {
        isDirty = true;
        frameAnimation = window.requestAnimationFrame(frame);
      }

      function zoomByRatio(clientX, clientY, ratio) {
        if (isNaN(clientX) || isNaN(clientY) || isNaN(ratio)) {
          throw new Error('zoom requires valid numbers');
        }

        var newScale = transform$1.scale * ratio;

        if (newScale < minZoom) {
          if (transform$1.scale === minZoom) return;

          ratio = minZoom / transform$1.scale;
        }
        if (newScale > maxZoom) {
          if (transform$1.scale === maxZoom) return;

          ratio = maxZoom / transform$1.scale;
        }

        var size = transformToScreen(clientX, clientY);

        transform$1.x = size.x - ratio * (size.x - transform$1.x);
        transform$1.y = size.y - ratio * (size.y - transform$1.y);

        // TODO: https://github.com/anvaka/panzoom/issues/112
        if (bounds && boundsPadding === 1 && minZoom === 1) {
          transform$1.scale *= ratio;
          keepTransformInsideBounds();
        } else {
          var transformAdjusted = keepTransformInsideBounds();
          if (!transformAdjusted) transform$1.scale *= ratio;
        }

        triggerEvent('zoom');

        makeDirty();
      }

      function zoomAbs(clientX, clientY, zoomLevel) {
        var ratio = zoomLevel / transform$1.scale;
        zoomByRatio(clientX, clientY, ratio);
      }

      function centerOn(ui) {
        var parent = ui.ownerSVGElement;
        if (!parent)
          throw new Error('ui element is required to be within the scene');

        // TODO: should i use controller's screen CTM?
        var clientRect = ui.getBoundingClientRect();
        var cx = clientRect.left + clientRect.width / 2;
        var cy = clientRect.top + clientRect.height / 2;

        var container = parent.getBoundingClientRect();
        var dx = container.width / 2 - cx;
        var dy = container.height / 2 - cy;

        internalMoveBy(dx, dy, true);
      }

      function smoothMoveTo(x, y){
        internalMoveBy(x - transform$1.x, y - transform$1.y, true);
      }

      function internalMoveBy(dx, dy, smooth) {
        if (!smooth) {
          return moveBy(dx, dy);
        }

        if (moveByAnimation) moveByAnimation.cancel();

        var from = { x: 0, y: 0 };
        var to = { x: dx, y: dy };
        var lastX = 0;
        var lastY = 0;

        moveByAnimation = amator(from, to, {
          step: function (v) {
            moveBy(v.x - lastX, v.y - lastY);

            lastX = v.x;
            lastY = v.y;
          }
        });
      }

      function scroll(x, y) {
        cancelZoomAnimation();
        moveTo(x, y);
      }

      function dispose() {
        releaseEvents();
      }

      function listenForEvents() {
        owner.addEventListener('mousedown', onMouseDown, { passive: false });
        owner.addEventListener('dblclick', onDoubleClick, { passive: false });
        owner.addEventListener('touchstart', onTouch, { passive: false });
        owner.addEventListener('keydown', onKeyDown, { passive: false });

        // Need to listen on the owner container, so that we are not limited
        // by the size of the scrollable domElement
        wheel.addWheelListener(owner, onMouseWheel, { passive: false });

        makeDirty();
      }

      function releaseEvents() {
        wheel.removeWheelListener(owner, onMouseWheel);
        owner.removeEventListener('mousedown', onMouseDown);
        owner.removeEventListener('keydown', onKeyDown);
        owner.removeEventListener('dblclick', onDoubleClick);
        owner.removeEventListener('touchstart', onTouch);

        if (frameAnimation) {
          window.cancelAnimationFrame(frameAnimation);
          frameAnimation = 0;
        }

        smoothScroll.cancel();

        releaseDocumentMouse();
        releaseTouches();
        textSelection.release();

        triggerPanEnd();
      }

      function frame() {
        if (isDirty) applyTransform();
      }

      function applyTransform() {
        isDirty = false;

        // TODO: Should I allow to cancel this?
        panController.applyTransform(transform$1);

        triggerEvent('transform');
        frameAnimation = 0;
      }

      function onKeyDown(e) {
        var x = 0,
          y = 0,
          z = 0;
        if (e.keyCode === 38) {
          y = 1; // up
        } else if (e.keyCode === 40) {
          y = -1; // down
        } else if (e.keyCode === 37) {
          x = 1; // left
        } else if (e.keyCode === 39) {
          x = -1; // right
        } else if (e.keyCode === 189 || e.keyCode === 109) {
          // DASH or SUBTRACT
          z = 1; // `-` -  zoom out
        } else if (e.keyCode === 187 || e.keyCode === 107) {
          // EQUAL SIGN or ADD
          z = -1; // `=` - zoom in (equal sign on US layout is under `+`)
        }

        if (filterKey(e, x, y, z)) {
          // They don't want us to handle the key: https://github.com/anvaka/panzoom/issues/45
          return;
        }

        if (x || y) {
          e.preventDefault();
          e.stopPropagation();

          var clientRect = owner.getBoundingClientRect();
          // movement speed should be the same in both X and Y direction:
          var offset = Math.min(clientRect.width, clientRect.height);
          var moveSpeedRatio = 0.05;
          var dx = offset * moveSpeedRatio * x;
          var dy = offset * moveSpeedRatio * y;

          // TODO: currently we do not animate this. It could be better to have animation
          internalMoveBy(dx, dy);
        }

        if (z) {
          var scaleMultiplier = getScaleMultiplier(z * 100);
          var offset = transformOrigin ? getTransformOriginOffset() : midPoint();
          publicZoomTo(offset.x, offset.y, scaleMultiplier);
        }
      }

      function midPoint() {
        var ownerRect = owner.getBoundingClientRect();
        return {
          x: ownerRect.width / 2,
          y: ownerRect.height / 2
        };
      }

      function onTouch(e) {
        // let the override the touch behavior
        beforeTouch(e);

        if (e.touches.length === 1) {
          return handleSingleFingerTouch(e, e.touches[0]);
        } else if (e.touches.length === 2) {
          // handleTouchMove() will care about pinch zoom.
          pinchZoomLength = getPinchZoomLength(e.touches[0], e.touches[1]);
          multiTouch = true;
          startTouchListenerIfNeeded();
        }
      }

      function beforeTouch(e) {
        // TODO: Need to unify this filtering names. E.g. use `beforeTouch`
        if (options.onTouch && !options.onTouch(e)) {
          // if they return `false` from onTouch, we don't want to stop
          // events propagation. Fixes https://github.com/anvaka/panzoom/issues/12
          return;
        }

        e.stopPropagation();
        e.preventDefault();
      }

      function beforeDoubleClick(e) {
        // TODO: Need to unify this filtering names. E.g. use `beforeDoubleClick``
        if (options.onDoubleClick && !options.onDoubleClick(e)) {
          // if they return `false` from onTouch, we don't want to stop
          // events propagation. Fixes https://github.com/anvaka/panzoom/issues/46
          return;
        }

        e.preventDefault();
        e.stopPropagation();
      }

      function handleSingleFingerTouch(e) {
        var touch = e.touches[0];
        var offset = getOffsetXY(touch);
        lastSingleFingerOffset = offset;
        var point = transformToScreen(offset.x, offset.y);
        mouseX = point.x;
        mouseY = point.y;

        smoothScroll.cancel();
        startTouchListenerIfNeeded();
      }

      function startTouchListenerIfNeeded() {
        if (touchInProgress) {
          // no need to do anything, as we already listen to events;
          return;
        }

        touchInProgress = true;
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);
      }

      function handleTouchMove(e) {
        if (e.touches.length === 1) {
          e.stopPropagation();
          var touch = e.touches[0];

          var offset = getOffsetXY(touch);
          var point = transformToScreen(offset.x, offset.y);

          var dx = point.x - mouseX;
          var dy = point.y - mouseY;

          if (dx !== 0 && dy !== 0) {
            triggerPanStart();
          }
          mouseX = point.x;
          mouseY = point.y;
          internalMoveBy(dx, dy);
        } else if (e.touches.length === 2) {
          // it's a zoom, let's find direction
          multiTouch = true;
          var t1 = e.touches[0];
          var t2 = e.touches[1];
          var currentPinchLength = getPinchZoomLength(t1, t2);

          // since the zoom speed is always based on distance from 1, we need to apply
          // pinch speed only on that distance from 1:
          var scaleMultiplier =
            1 + (currentPinchLength / pinchZoomLength - 1) * pinchSpeed;

          var firstTouchPoint = getOffsetXY(t1);
          var secondTouchPoint = getOffsetXY(t2);
          mouseX = (firstTouchPoint.x + secondTouchPoint.x) / 2;
          mouseY = (firstTouchPoint.y + secondTouchPoint.y) / 2;
          if (transformOrigin) {
            var offset = getTransformOriginOffset();
            mouseX = offset.x;
            mouseY = offset.y;
          }

          publicZoomTo(mouseX, mouseY, scaleMultiplier);

          pinchZoomLength = currentPinchLength;
          e.stopPropagation();
          e.preventDefault();
        }
      }

      function handleTouchEnd(e) {
        if (e.touches.length > 0) {
          var offset = getOffsetXY(e.touches[0]);
          var point = transformToScreen(offset.x, offset.y);
          mouseX = point.x;
          mouseY = point.y;
        } else {
          var now = new Date();
          if (now - lastTouchEndTime < doubleTapSpeedInMS) {
            if (transformOrigin) {
              var offset = getTransformOriginOffset();
              smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
            } else {
              // We want untransformed x/y here.
              smoothZoom(lastSingleFingerOffset.x, lastSingleFingerOffset.y, zoomDoubleClickSpeed);
            }
          }

          lastTouchEndTime = now;

          triggerPanEnd();
          releaseTouches();
        }
      }

      function getPinchZoomLength(finger1, finger2) {
        var dx = finger1.clientX - finger2.clientX;
        var dy = finger1.clientY - finger2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function onDoubleClick(e) {
        beforeDoubleClick(e);
        var offset = getOffsetXY(e);
        if (transformOrigin) {
          // TODO: looks like this is duplicated in the file.
          // Need to refactor
          offset = getTransformOriginOffset();
        }
        smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
      }

      function onMouseDown(e) {
        // if client does not want to handle this event - just ignore the call
        if (beforeMouseDown(e)) return;

        if (touchInProgress) {
          // modern browsers will fire mousedown for touch events too
          // we do not want this: touch is handled separately.
          e.stopPropagation();
          return false;
        }
        // for IE, left click == 1
        // for Firefox, left click == 0
        var isLeftButton =
          (e.button === 1 && window.event !== null) || e.button === 0;
        if (!isLeftButton) return;

        smoothScroll.cancel();

        var offset = getOffsetXY(e);
        var point = transformToScreen(offset.x, offset.y);
        mouseX = point.x;
        mouseY = point.y;

        // We need to listen on document itself, since mouse can go outside of the
        // window, and we will loose it
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        textSelection.capture(e.target || e.srcElement);

        return false;
      }

      function onMouseMove(e) {
        // no need to worry about mouse events when touch is happening
        if (touchInProgress) return;

        triggerPanStart();

        var offset = getOffsetXY(e);
        var point = transformToScreen(offset.x, offset.y);
        var dx = point.x - mouseX;
        var dy = point.y - mouseY;

        mouseX = point.x;
        mouseY = point.y;

        internalMoveBy(dx, dy);
      }

      function onMouseUp() {
        textSelection.release();
        triggerPanEnd();
        releaseDocumentMouse();
      }

      function releaseDocumentMouse() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        panstartFired = false;
      }

      function releaseTouches() {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
        panstartFired = false;
        multiTouch = false;
        touchInProgress = false;
      }

      function onMouseWheel(e) {
        // if client does not want to handle this event - just ignore the call
        if (beforeWheel(e)) return;

        smoothScroll.cancel();

        var delta = e.deltaY;
        if (e.deltaMode > 0) delta *= 100;

        var scaleMultiplier = getScaleMultiplier(delta);

        if (scaleMultiplier !== 1) {
          var offset = transformOrigin
            ? getTransformOriginOffset()
            : getOffsetXY(e);
          publicZoomTo(offset.x, offset.y, scaleMultiplier);
          e.preventDefault();
        }
      }

      function getOffsetXY(e) {
        var offsetX, offsetY;
        // I tried using e.offsetX, but that gives wrong results for svg, when user clicks on a path.
        var ownerRect = owner.getBoundingClientRect();
        offsetX = e.clientX - ownerRect.left;
        offsetY = e.clientY - ownerRect.top;

        return { x: offsetX, y: offsetY };
      }

      function smoothZoom(clientX, clientY, scaleMultiplier) {
        var fromValue = transform$1.scale;
        var from = { scale: fromValue };
        var to = { scale: scaleMultiplier * fromValue };

        smoothScroll.cancel();
        cancelZoomAnimation();

        zoomToAnimation = amator(from, to, {
          step: function (v) {
            zoomAbs(clientX, clientY, v.scale);
          },
          done: triggerZoomEnd
        });
      }

      function smoothZoomAbs(clientX, clientY, toScaleValue) {
        var fromValue = transform$1.scale;
        var from = { scale: fromValue };
        var to = { scale: toScaleValue };

        smoothScroll.cancel();
        cancelZoomAnimation();

        zoomToAnimation = amator(from, to, {
          step: function (v) {
            zoomAbs(clientX, clientY, v.scale);
          }
        });
      }

      function getTransformOriginOffset() {
        var ownerRect = owner.getBoundingClientRect();
        return {
          x: ownerRect.width * transformOrigin.x,
          y: ownerRect.height * transformOrigin.y
        };
      }

      function publicZoomTo(clientX, clientY, scaleMultiplier) {
        smoothScroll.cancel();
        cancelZoomAnimation();
        return zoomByRatio(clientX, clientY, scaleMultiplier);
      }

      function cancelZoomAnimation() {
        if (zoomToAnimation) {
          zoomToAnimation.cancel();
          zoomToAnimation = null;
        }
      }

      function getScaleMultiplier(delta) {
        var sign = Math.sign(delta);
        var deltaAdjustedSpeed = Math.min(0.25, Math.abs(speed * delta / 128));
        return 1 - sign * deltaAdjustedSpeed;
      }

      function triggerPanStart() {
        if (!panstartFired) {
          triggerEvent('panstart');
          panstartFired = true;
          smoothScroll.start();
        }
      }

      function triggerPanEnd() {
        if (panstartFired) {
          // we should never run smooth scrolling if it was multiTouch (pinch zoom animation):
          if (!multiTouch) smoothScroll.stop();
          triggerEvent('panend');
        }
      }

      function triggerZoomEnd() {
        triggerEvent('zoomend');
      }

      function triggerEvent(name) {
        api.fire(name, api);
      }
    }

    function parseTransformOrigin(options) {
      if (!options) return;
      if (typeof options === 'object') {
        if (!isNumber(options.x) || !isNumber(options.y))
          failTransformOrigin(options);
        return options;
      }

      failTransformOrigin();
    }

    function failTransformOrigin(options) {
      console.error(options);
      throw new Error(
        [
          'Cannot parse transform origin.',
          'Some good examples:',
          '  "center center" can be achieved with {x: 0.5, y: 0.5}',
          '  "top center" can be achieved with {x: 0.5, y: 0}',
          '  "bottom right" can be achieved with {x: 1, y: 1}'
        ].join('\n')
      );
    }

    function noop() { }

    function validateBounds(bounds) {
      var boundsType = typeof bounds;
      if (boundsType === 'undefined' || boundsType === 'boolean') return; // this is okay
      // otherwise need to be more thorough:
      var validBounds =
        isNumber(bounds.left) &&
        isNumber(bounds.top) &&
        isNumber(bounds.bottom) &&
        isNumber(bounds.right);

      if (!validBounds)
        throw new Error(
          'Bounds object is not valid. It can be: ' +
          'undefined, boolean (true|false) or an object {left, top, right, bottom}'
        );
    }

    function isNumber(x) {
      return Number.isFinite(x);
    }

    // IE 11 does not support isNaN:
    function isNaN(value) {
      if (Number.isNaN) {
        return Number.isNaN(value);
      }

      return value !== value;
    }

    function rigidScroll() {
      return {
        start: noop,
        stop: noop,
        cancel: noop
      };
    }

    function autoRun() {
      if (typeof document === 'undefined') return;

      var scripts = document.getElementsByTagName('script');
      if (!scripts) return;
      var panzoomScript;

      for (var i = 0; i < scripts.length; ++i) {
        var x = scripts[i];
        if (x.src && x.src.match(/\bpanzoom(\.min)?\.js/)) {
          panzoomScript = x;
          break;
        }
      }

      if (!panzoomScript) return;

      var query = panzoomScript.getAttribute('query');
      if (!query) return;

      var globalName = panzoomScript.getAttribute('name') || 'pz';
      var started = Date.now();

      tryAttach();

      function tryAttach() {
        var el = document.querySelector(query);
        if (!el) {
          var now = Date.now();
          var elapsed = now - started;
          if (elapsed < 2000) {
            // Let's wait a bit
            setTimeout(tryAttach, 100);
            return;
          }
          // If we don't attach within 2 seconds to the target element, consider it a failure
          console.error('Cannot find the panzoom element', globalName);
          return;
        }
        var options = collectOptions(panzoomScript);
        console.log(options);
        window[globalName] = createPanZoom(el, options);
      }

      function collectOptions(script) {
        var attrs = script.attributes;
        var options = {};
        for (var i = 0; i < attrs.length; ++i) {
          var attr = attrs[i];
          var nameValue = getPanzoomAttributeNameValue(attr);
          if (nameValue) {
            options[nameValue.name] = nameValue.value;
          }
        }

        return options;
      }

      function getPanzoomAttributeNameValue(attr) {
        if (!attr.name) return;
        var isPanZoomAttribute =
          attr.name[0] === 'p' && attr.name[1] === 'z' && attr.name[2] === '-';

        if (!isPanZoomAttribute) return;

        var name = attr.name.substr(3);
        var value = JSON.parse(attr.value);
        return { name: name, value: value };
      }
    }

    autoRun();

    /*
    Contains the start and end elements being linked and the point to draw the line to 
    {
       start: String,
       end: String,
       x: Number,  // mouse x pos
       y: Number,  // mouse y pos
    }
    */
    const linking = writable({});

    /* src/CanvasInteractable.svelte generated by Svelte v3.35.0 */
    const file$7 = "src/CanvasInteractable.svelte";
    const get_controls_slot_changes$1 = dirty => ({});
    const get_controls_slot_context$1 = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	const content_slot_template = /*#slots*/ ctx[8].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[7], get_content_slot_context);
    	const controls_slot_template = /*#slots*/ ctx[8].controls;
    	const controls_slot = create_slot(controls_slot_template, ctx, /*$$scope*/ ctx[7], get_controls_slot_context$1);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (content_slot) content_slot.c();
    			t = space();
    			if (controls_slot) controls_slot.c();
    			set_style(div0, "height", /*y*/ ctx[1] + "px");
    			set_style(div0, "width", /*x*/ ctx[0] + "px");
    			attr_dev(div0, "class", "svelte-z67t9k");
    			add_location(div0, file$7, 56, 2, 1360);
    			attr_dev(div1, "class", "canvas-container svelte-z67t9k");
    			add_location(div1, file$7, 55, 0, 1327);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (content_slot) {
    				content_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[9](div0);
    			append_dev(div1, t);

    			if (controls_slot) {
    				controls_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			if (!current || dirty & /*y*/ 2) {
    				set_style(div0, "height", /*y*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*x*/ 1) {
    				set_style(div0, "width", /*x*/ ctx[0] + "px");
    			}

    			if (controls_slot) {
    				if (controls_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(controls_slot, controls_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_controls_slot_changes$1, get_controls_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			transition_in(controls_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot, local);
    			transition_out(controls_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (content_slot) content_slot.d(detaching);
    			/*div0_binding*/ ctx[9](null);
    			if (controls_slot) controls_slot.d(detaching);
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
    	let $dragging;
    	let $linking;
    	validate_store(dragging, "dragging");
    	component_subscribe($$self, dragging, $$value => $$invalidate(5, $dragging = $$value));
    	validate_store(linking, "linking");
    	component_subscribe($$self, linking, $$value => $$invalidate(6, $linking = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CanvasInteractable", slots, ['content','controls']);

    	let { panzoomOptions = {
    		maxZoom: 5,
    		minZoom: 0.2,
    		initialZoom: 1,
    		zoomDoubleClickSpeed: 1,
    		bounds: true,
    		boundsPadding: 0.01
    	} } = $$props; // beforeMouseDown: (e) => {
    	//   return !e.altKey;
    	// },

    	let { x = 1000 } = $$props;
    	let { y = 1000 } = $$props;
    	let canvasElt = null;
    	let { panzoomInstance = null } = $$props;

    	onMount(() => {
    		$$invalidate(3, panzoomInstance = panzoom(canvasElt, panzoomOptions));

    		// panzoomInstance.moveTo(centerX, centerY);
    		panzoomInstance.on("transform", e => {
    			// keep track of the element's scale so we can adjust dragging to match
    			if (canvasElt) {
    				const level = parseFloat(canvasElt.style.transform.split(",")[0].replace("matrix(", ""));
    				zoom.set(level);
    				position.set(canvasElt.style.transform);
    			}
    		});
    	});

    	onDestroy(() => {
    		panzoomInstance.dispose();
    	});

    	const writable_props = ["panzoomOptions", "x", "y", "panzoomInstance"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CanvasInteractable> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvasElt = $$value;
    			$$invalidate(2, canvasElt);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("panzoomOptions" in $$props) $$invalidate(4, panzoomOptions = $$props.panzoomOptions);
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("panzoomInstance" in $$props) $$invalidate(3, panzoomInstance = $$props.panzoomInstance);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		zoom,
    		position,
    		panzoom,
    		dragging,
    		linking,
    		panzoomOptions,
    		x,
    		y,
    		canvasElt,
    		panzoomInstance,
    		$dragging,
    		$linking
    	});

    	$$self.$inject_state = $$props => {
    		if ("panzoomOptions" in $$props) $$invalidate(4, panzoomOptions = $$props.panzoomOptions);
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("canvasElt" in $$props) $$invalidate(2, canvasElt = $$props.canvasElt);
    		if ("panzoomInstance" in $$props) $$invalidate(3, panzoomInstance = $$props.panzoomInstance);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dragging, $linking, panzoomInstance*/ 104) {
    			{
    				if ($dragging.id || $linking.start) {
    					panzoomInstance.pause();
    				} else if (panzoomInstance) {
    					panzoomInstance.resume();
    				}
    			}
    		}
    	};

    	return [
    		x,
    		y,
    		canvasElt,
    		panzoomInstance,
    		panzoomOptions,
    		$dragging,
    		$linking,
    		$$scope,
    		slots,
    		div0_binding
    	];
    }

    class CanvasInteractable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			panzoomOptions: 4,
    			x: 0,
    			y: 1,
    			panzoomInstance: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CanvasInteractable",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get panzoomOptions() {
    		throw new Error("<CanvasInteractable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set panzoomOptions(value) {
    		throw new Error("<CanvasInteractable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<CanvasInteractable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<CanvasInteractable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<CanvasInteractable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<CanvasInteractable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get panzoomInstance() {
    		throw new Error("<CanvasInteractable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set panzoomInstance(value) {
    		throw new Error("<CanvasInteractable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MousePositionElement.svelte generated by Svelte v3.35.0 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/MousePositionElement.svelte";

    function create_fragment$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "mouse-position svelte-f2ukwj");
    			set_style(div, "top", /*$linking*/ ctx[1].y + "px");
    			set_style(div, "left", /*$linking*/ ctx[1].x + "px");
    			add_location(div, file$6, 82, 0, 1942);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[2](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$linking*/ 2) {
    				set_style(div, "top", /*$linking*/ ctx[1].y + "px");
    			}

    			if (dirty & /*$linking*/ 2) {
    				set_style(div, "left", /*$linking*/ ctx[1].x + "px");
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[2](null);
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
    	let $zoom;
    	let $linkedElements;
    	let $linking;
    	validate_store(zoom, "zoom");
    	component_subscribe($$self, zoom, $$value => $$invalidate(7, $zoom = $$value));
    	validate_store(linkedElements, "linkedElements");
    	component_subscribe($$self, linkedElements, $$value => $$invalidate(8, $linkedElements = $$value));
    	validate_store(linking, "linking");
    	component_subscribe($$self, linking, $$value => $$invalidate(1, $linking = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MousePositionElement", slots, []);
    	let oldX, oldY, thisX, thisY;
    	let element = null;

    	const linkDuring = e => {
    		e.preventDefault();
    		thisX = oldX - e.clientX;
    		thisY = oldY - e.clientY;
    		oldX = e.clientX;
    		oldY = e.clientY;
    		const x = element.offsetLeft - thisX * (1 / $zoom);
    		const y = element.offsetTop - thisY * (1 / $zoom);

    		linking.update(s => {
    			return { ...s, y, x };
    		});

    		linkedElements.update(elts => {
    			return {
    				...elts,
    				"mouse-position": { element, x, y }
    			};
    		});
    	};

    	const linkUp = e => {
    		let linked = false;

    		for (const elt in $linkedElements) {
    			console.log(elt);

    			// did we drop over an element?
    			if ($linking.x > $linkedElements[elt].element.offsetLeft && $linking.x < $linkedElements[elt].element.offsetLeft + $linkedElements[elt].element.offsetWidth && $linking.y > $linkedElements[elt].element.offsetTop && $linking.y < $linkedElements[elt].element.offsetTop + $linkedElements[elt].element.offsetHeight) {
    				if (elt !== $linking.start) {
    					document.onmousemove = null;

    					// make the connection
    					linking.update(s => {
    						return { ...s, end: elt };
    					});

    					linked = true;
    				} else {
    					linked = true;
    				}
    			}
    		}

    		if (!linked) {
    			linking.set({});
    			document.onmousemove = null;
    		}
    	};

    	onMount(() => {
    		document.onmousemove = linkDuring;
    		document.onmouseup = linkUp;
    	});

    	onDestroy(() => {
    		linkedElements.update(elts => {
    			const res = { ...elts };
    			delete res["mouse-position"];
    			return res;
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<MousePositionElement> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$capture_state = () => ({
    		linkedElements,
    		linking,
    		onMount,
    		onDestroy,
    		zoom,
    		oldX,
    		oldY,
    		thisX,
    		thisY,
    		element,
    		linkDuring,
    		linkUp,
    		$zoom,
    		$linkedElements,
    		$linking
    	});

    	$$self.$inject_state = $$props => {
    		if ("oldX" in $$props) oldX = $$props.oldX;
    		if ("oldY" in $$props) oldY = $$props.oldY;
    		if ("thisX" in $$props) thisX = $$props.thisX;
    		if ("thisY" in $$props) thisY = $$props.thisY;
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [element, $linking, div_binding];
    }

    class MousePositionElement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MousePositionElement",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/CanvasElement.svelte generated by Svelte v3.35.0 */
    const file$5 = "src/CanvasElement.svelte";

    // (115:4) 
    function create_grippable_slot(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "slot", "grippable");
    			attr_dev(div, "class", "slot-filler-elt grabber svelte-k2j4yl");
    			toggle_class(div, "grabbed", /*$dragging*/ ctx[11].id === /*id*/ ctx[2]);
    			add_location(div, file$5, 114, 4, 2533);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "mousedown", /*dragStart*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$dragging, id*/ 2052) {
    				toggle_class(div, "grabbed", /*$dragging*/ ctx[11].id === /*id*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_grippable_slot.name,
    		type: "slot",
    		source: "(115:4) ",
    		ctx
    	});

    	return block;
    }

    // (124:22) 
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[4]];
    	var switch_value = /*InnerComponent*/ ctx[6];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
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
    			const switch_instance_changes = (dirty & /*props*/ 16)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[4])])
    			: {};

    			if (switch_value !== (switch_value = /*InnerComponent*/ ctx[6])) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(124:22) ",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#if text}
    function create_if_block$2(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*text*/ ctx[3], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 8) html_tag.p(/*text*/ ctx[3]);
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(122:6) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (121:4) 
    function create_text_slot(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*text*/ ctx[3]) return 0;
    		if (/*props*/ ctx[4]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "text");
    			add_location(div, file$5, 120, 4, 2683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				} else {
    					if_block = null;
    				}
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
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_text_slot.name,
    		type: "slot",
    		source: "(121:4) ",
    		ctx
    	});

    	return block;
    }

    // (128:4) 
    function create_linkStarter_slot(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "slot", "linkStarter");
    			attr_dev(div, "class", "slot-filler-elt starter svelte-k2j4yl");
    			add_location(div, file$5, 127, 4, 2851);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);

    			if (!mounted) {
    				dispose = listen_dev(div, "mousedown", /*linkStart*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_linkStarter_slot.name,
    		type: "slot",
    		source: "(128:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let switch_instance;
    	let div_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*OuterComponent*/ ctx[5];

    	function switch_props(ctx) {
    		return {
    			props: {
    				$$slots: {
    					linkStarter: [create_linkStarter_slot],
    					text: [create_text_slot],
    					grippable: [create_grippable_slot]
    				},
    				$$scope: { ctx }
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
    			attr_dev(div, "class", "canvas-element svelte-k2j4yl");
    			set_style(div, "top", /*y*/ ctx[1] + "px");
    			set_style(div, "left", /*x*/ ctx[0] + "px");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[18].call(div));
    			add_location(div, file$5, 105, 0, 2320);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[18].bind(div));
    			/*div_binding_1*/ ctx[19](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*linkEnd*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};

    			if (dirty & /*$$scope, linkStarterElt, text, InnerComponent, props, $dragging, id*/ 268438620) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*OuterComponent*/ ctx[5])) {
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

    			if (!current || dirty & /*y*/ 2) {
    				set_style(div, "top", /*y*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*x*/ 1) {
    				set_style(div, "left", /*x*/ ctx[0] + "px");
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
    			div_resize_listener();
    			/*div_binding_1*/ ctx[19](null);
    			mounted = false;
    			dispose();
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
    	let $zoom;
    	let $linking;
    	let $dragging;
    	validate_store(zoom, "zoom");
    	component_subscribe($$self, zoom, $$value => $$invalidate(24, $zoom = $$value));
    	validate_store(linking, "linking");
    	component_subscribe($$self, linking, $$value => $$invalidate(25, $linking = $$value));
    	validate_store(dragging, "dragging");
    	component_subscribe($$self, dragging, $$value => $$invalidate(11, $dragging = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CanvasElement", slots, []);
    	let { x = 0 } = $$props;
    	let { y = 0 } = $$props;
    	let { id } = $$props;
    	let { text = null } = $$props;
    	let { props = null } = $$props;
    	let { OuterComponent } = $$props;
    	let { InnerComponent } = $$props;
    	let oldX, oldY, thisX, thisY;
    	let element = null;
    	let linkStarterElt = null;
    	let prevHeight = 0;
    	let prevWidth = 0;
    	let height = 0;
    	let width = 0;

    	onMount(() => {
    		linkedElements.update(elts => {
    			return { ...elts, [id]: { element, x, y } };
    		});
    	});

    	const dragEnd = e => {
    		document.onmouseup = null;
    		document.onmousemove = null;

    		dragging.update(s => {
    			return { ...s, dropped: true };
    		});
    	};

    	const dragDuring = e => {
    		e.preventDefault();
    		thisX = oldX - e.clientX;
    		thisY = oldY - e.clientY;
    		oldX = e.clientX;
    		oldY = e.clientY;
    		$$invalidate(1, y = element.offsetTop - thisY * (1 / $zoom));
    		$$invalidate(0, x = element.offsetLeft - thisX * (1 / $zoom));
    		dragging.set({ y, x, id });

    		linkedElements.update(elts => {
    			return { ...elts, [id]: { element, x, y } };
    		});
    	};

    	const dragStart = e => {
    		e.preventDefault();
    		oldX = e.clientX;
    		oldY = e.clientY;
    		document.onmousemove = dragDuring;
    		document.onmouseup = dragEnd;
    		dragging.set({ id });
    	};

    	const linkStart = e => {
    		e.preventDefault();
    		linking.set({ start: id });

    		linking.set({
    			start: id,
    			x: element.offsetLeft + linkStarterElt.offsetLeft,
    			y: element.offsetTop + linkStarterElt.offsetTop
    		});
    	};

    	const linkEnd = e => {
    		if ($linking.start && $linking.start !== id) {
    			document.onmousemove = null;

    			// make the connection
    			linking.update(s => {
    				return { ...s, end: id };
    			});
    		}
    	};

    	const writable_props = ["x", "y", "id", "text", "props", "OuterComponent", "InnerComponent"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CanvasElement> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			linkStarterElt = $$value;
    			$$invalidate(10, linkStarterElt);
    		});
    	}

    	function div_elementresize_handler() {
    		height = this.clientHeight;
    		width = this.clientWidth;
    		$$invalidate(7, height);
    		$$invalidate(8, width);
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("text" in $$props) $$invalidate(3, text = $$props.text);
    		if ("props" in $$props) $$invalidate(4, props = $$props.props);
    		if ("OuterComponent" in $$props) $$invalidate(5, OuterComponent = $$props.OuterComponent);
    		if ("InnerComponent" in $$props) $$invalidate(6, InnerComponent = $$props.InnerComponent);
    	};

    	$$self.$capture_state = () => ({
    		linkedElements,
    		dragging,
    		linking,
    		animating,
    		zoom,
    		onMount,
    		x,
    		y,
    		id,
    		text,
    		props,
    		OuterComponent,
    		InnerComponent,
    		oldX,
    		oldY,
    		thisX,
    		thisY,
    		element,
    		linkStarterElt,
    		prevHeight,
    		prevWidth,
    		height,
    		width,
    		dragEnd,
    		dragDuring,
    		dragStart,
    		linkStart,
    		linkEnd,
    		$zoom,
    		$linking,
    		$dragging
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("text" in $$props) $$invalidate(3, text = $$props.text);
    		if ("props" in $$props) $$invalidate(4, props = $$props.props);
    		if ("OuterComponent" in $$props) $$invalidate(5, OuterComponent = $$props.OuterComponent);
    		if ("InnerComponent" in $$props) $$invalidate(6, InnerComponent = $$props.InnerComponent);
    		if ("oldX" in $$props) oldX = $$props.oldX;
    		if ("oldY" in $$props) oldY = $$props.oldY;
    		if ("thisX" in $$props) thisX = $$props.thisX;
    		if ("thisY" in $$props) thisY = $$props.thisY;
    		if ("element" in $$props) $$invalidate(9, element = $$props.element);
    		if ("linkStarterElt" in $$props) $$invalidate(10, linkStarterElt = $$props.linkStarterElt);
    		if ("prevHeight" in $$props) $$invalidate(15, prevHeight = $$props.prevHeight);
    		if ("prevWidth" in $$props) $$invalidate(16, prevWidth = $$props.prevWidth);
    		if ("height" in $$props) $$invalidate(7, height = $$props.height);
    		if ("width" in $$props) $$invalidate(8, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*prevHeight, height, prevWidth, width, id*/ 98692) {
    			{
    				// when the width or height changes (perhaps due to an animation)
    				// rerender the connections
    				if (prevHeight !== height || prevWidth !== width) {
    					animating.update(s => {
    						return [...s, id];
    					});

    					$$invalidate(15, prevHeight = height);
    					$$invalidate(16, prevWidth = width);
    				}
    			}
    		}
    	};

    	return [
    		x,
    		y,
    		id,
    		text,
    		props,
    		OuterComponent,
    		InnerComponent,
    		height,
    		width,
    		element,
    		linkStarterElt,
    		$dragging,
    		dragStart,
    		linkStart,
    		linkEnd,
    		prevHeight,
    		prevWidth,
    		div_binding,
    		div_elementresize_handler,
    		div_binding_1
    	];
    }

    class CanvasElement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			x: 0,
    			y: 1,
    			id: 2,
    			text: 3,
    			props: 4,
    			OuterComponent: 5,
    			InnerComponent: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CanvasElement",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<CanvasElement> was created without expected prop 'id'");
    		}

    		if (/*OuterComponent*/ ctx[5] === undefined && !("OuterComponent" in props)) {
    			console.warn("<CanvasElement> was created without expected prop 'OuterComponent'");
    		}

    		if (/*InnerComponent*/ ctx[6] === undefined && !("InnerComponent" in props)) {
    			console.warn("<CanvasElement> was created without expected prop 'InnerComponent'");
    		}
    	}

    	get x() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get OuterComponent() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set OuterComponent(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get InnerComponent() {
    		throw new Error("<CanvasElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set InnerComponent(value) {
    		throw new Error("<CanvasElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Canvas.svelte generated by Svelte v3.35.0 */
    const file$4 = "src/Canvas.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    const get_controls_slot_changes = dirty => ({});
    const get_controls_slot_context = ctx => ({});

    // (71:6) {#each element.links as link}
    function create_each_block_1(ctx) {
    	let canvaselementlink;
    	let current;

    	canvaselementlink = new CanvasElementLink({
    			props: {
    				from: /*element*/ ctx[16].id,
    				to: /*link*/ ctx[19].id,
    				lineProps: /*link*/ ctx[19].props,
    				LineComponent: /*LineComponent*/ ctx[3],
    				LineAnnotationComponent: /*LineAnnotationComponent*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(canvaselementlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(canvaselementlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const canvaselementlink_changes = {};
    			if (dirty & /*data*/ 2) canvaselementlink_changes.from = /*element*/ ctx[16].id;
    			if (dirty & /*data*/ 2) canvaselementlink_changes.to = /*link*/ ctx[19].id;
    			if (dirty & /*data*/ 2) canvaselementlink_changes.lineProps = /*link*/ ctx[19].props;
    			if (dirty & /*LineComponent*/ 8) canvaselementlink_changes.LineComponent = /*LineComponent*/ ctx[3];
    			if (dirty & /*LineAnnotationComponent*/ 32) canvaselementlink_changes.LineAnnotationComponent = /*LineAnnotationComponent*/ ctx[5];
    			canvaselementlink.$set(canvaselementlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvaselementlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvaselementlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(canvaselementlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(71:6) {#each element.links as link}",
    		ctx
    	});

    	return block;
    }

    // (69:4) {#each data as element}
    function create_each_block(ctx) {
    	let canvaselement;
    	let t;
    	let each_1_anchor;
    	let current;

    	const canvaselement_spread_levels = [
    		{
    			OuterComponent: /*OuterComponent*/ ctx[2]
    		},
    		{
    			InnerComponent: /*InnerComponent*/ ctx[4]
    		},
    		/*element*/ ctx[16]
    	];

    	let canvaselement_props = {};

    	for (let i = 0; i < canvaselement_spread_levels.length; i += 1) {
    		canvaselement_props = assign(canvaselement_props, canvaselement_spread_levels[i]);
    	}

    	canvaselement = new CanvasElement({
    			props: canvaselement_props,
    			$$inline: true
    		});

    	let each_value_1 = /*element*/ ctx[16].links;
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
    			create_component(canvaselement.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(canvaselement, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const canvaselement_changes = (dirty & /*OuterComponent, InnerComponent, data*/ 22)
    			? get_spread_update(canvaselement_spread_levels, [
    					dirty & /*OuterComponent*/ 4 && {
    						OuterComponent: /*OuterComponent*/ ctx[2]
    					},
    					dirty & /*InnerComponent*/ 16 && {
    						InnerComponent: /*InnerComponent*/ ctx[4]
    					},
    					dirty & /*data*/ 2 && get_spread_object(/*element*/ ctx[16])
    				])
    			: {};

    			canvaselement.$set(canvaselement_changes);

    			if (dirty & /*data, LineComponent, LineAnnotationComponent*/ 42) {
    				each_value_1 = /*element*/ ctx[16].links;
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
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			transition_in(canvaselement.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvaselement.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(canvaselement, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(69:4) {#each data as element}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if $linking.start}
    function create_if_block$1(ctx) {
    	let mousepositionelement;
    	let t;
    	let canvaselementlink;
    	let current;
    	mousepositionelement = new MousePositionElement({ $$inline: true });

    	canvaselementlink = new CanvasElementLink({
    			props: {
    				from: /*$linking*/ ctx[8].start,
    				to: "mouse-position",
    				LineComponent: /*LineComponent*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mousepositionelement.$$.fragment);
    			t = space();
    			create_component(canvaselementlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mousepositionelement, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(canvaselementlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const canvaselementlink_changes = {};
    			if (dirty & /*$linking*/ 256) canvaselementlink_changes.from = /*$linking*/ ctx[8].start;
    			if (dirty & /*LineComponent*/ 8) canvaselementlink_changes.LineComponent = /*LineComponent*/ ctx[3];
    			canvaselementlink.$set(canvaselementlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mousepositionelement.$$.fragment, local);
    			transition_in(canvaselementlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mousepositionelement.$$.fragment, local);
    			transition_out(canvaselementlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mousepositionelement, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(canvaselementlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(81:4) {#if $linking.start}",
    		ctx
    	});

    	return block;
    }

    // (68:2) 
    function create_content_slot(ctx) {
    	let div;
    	let t;
    	let current;
    	let each_value = /*data*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*$linking*/ ctx[8].start && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "content");
    			add_location(div, file$4, 67, 2, 1757);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, LineComponent, LineAnnotationComponent, OuterComponent, InnerComponent*/ 62) {
    				each_value = /*data*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*$linking*/ ctx[8].start) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$linking*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(68:2) ",
    		ctx
    	});

    	return block;
    }

    // (90:2) 
    function create_controls_slot$1(ctx) {
    	let div;
    	let current;
    	const controls_slot_template = /*#slots*/ ctx[12].controls;
    	const controls_slot = create_slot(controls_slot_template, ctx, /*$$scope*/ ctx[14], get_controls_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (controls_slot) controls_slot.c();
    			attr_dev(div, "slot", "controls");
    			add_location(div, file$4, 89, 2, 2316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (controls_slot) {
    				controls_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (controls_slot) {
    				if (controls_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(controls_slot, controls_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_controls_slot_changes, get_controls_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controls_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controls_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (controls_slot) controls_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_controls_slot$1.name,
    		type: "slot",
    		source: "(90:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let canvasinteractable;
    	let updating_panzoomInstance;
    	let current;

    	function canvasinteractable_panzoomInstance_binding(value) {
    		/*canvasinteractable_panzoomInstance_binding*/ ctx[13](value);
    	}

    	let canvasinteractable_props = {
    		x: /*x*/ ctx[6],
    		y: /*y*/ ctx[7],
    		$$slots: {
    			controls: [create_controls_slot$1],
    			content: [create_content_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*panzoomInstance*/ ctx[0] !== void 0) {
    		canvasinteractable_props.panzoomInstance = /*panzoomInstance*/ ctx[0];
    	}

    	canvasinteractable = new CanvasInteractable({
    			props: canvasinteractable_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(canvasinteractable, "panzoomInstance", canvasinteractable_panzoomInstance_binding));

    	const block = {
    		c: function create() {
    			create_component(canvasinteractable.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(canvasinteractable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const canvasinteractable_changes = {};
    			if (dirty & /*x*/ 64) canvasinteractable_changes.x = /*x*/ ctx[6];
    			if (dirty & /*y*/ 128) canvasinteractable_changes.y = /*y*/ ctx[7];

    			if (dirty & /*$$scope, $linking, LineComponent, data, LineAnnotationComponent, OuterComponent, InnerComponent*/ 16702) {
    				canvasinteractable_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_panzoomInstance && dirty & /*panzoomInstance*/ 1) {
    				updating_panzoomInstance = true;
    				canvasinteractable_changes.panzoomInstance = /*panzoomInstance*/ ctx[0];
    				add_flush_callback(() => updating_panzoomInstance = false);
    			}

    			canvasinteractable.$set(canvasinteractable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvasinteractable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvasinteractable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(canvasinteractable, detaching);
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
    	let $linking;
    	let $dragging;
    	let $position;
    	let $zoom;
    	validate_store(linking, "linking");
    	component_subscribe($$self, linking, $$value => $$invalidate(8, $linking = $$value));
    	validate_store(dragging, "dragging");
    	component_subscribe($$self, dragging, $$value => $$invalidate(9, $dragging = $$value));
    	validate_store(position, "position");
    	component_subscribe($$self, position, $$value => $$invalidate(10, $position = $$value));
    	validate_store(zoom, "zoom");
    	component_subscribe($$self, zoom, $$value => $$invalidate(11, $zoom = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Canvas", slots, ['controls']);
    	const dispatch = createEventDispatcher();
    	let { data } = $$props;
    	let { OuterComponent } = $$props;
    	let { LineComponent } = $$props;
    	let { InnerComponent = null } = $$props;
    	let { LineAnnotationComponent = null } = $$props;
    	let { panzoomInstance = null } = $$props;
    	let { x } = $$props;
    	let { y } = $$props;

    	const writable_props = [
    		"data",
    		"OuterComponent",
    		"LineComponent",
    		"InnerComponent",
    		"LineAnnotationComponent",
    		"panzoomInstance",
    		"x",
    		"y"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Canvas> was created with unknown prop '${key}'`);
    	});

    	function canvasinteractable_panzoomInstance_binding(value) {
    		panzoomInstance = value;
    		$$invalidate(0, panzoomInstance);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("OuterComponent" in $$props) $$invalidate(2, OuterComponent = $$props.OuterComponent);
    		if ("LineComponent" in $$props) $$invalidate(3, LineComponent = $$props.LineComponent);
    		if ("InnerComponent" in $$props) $$invalidate(4, InnerComponent = $$props.InnerComponent);
    		if ("LineAnnotationComponent" in $$props) $$invalidate(5, LineAnnotationComponent = $$props.LineAnnotationComponent);
    		if ("panzoomInstance" in $$props) $$invalidate(0, panzoomInstance = $$props.panzoomInstance);
    		if ("x" in $$props) $$invalidate(6, x = $$props.x);
    		if ("y" in $$props) $$invalidate(7, y = $$props.y);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		CanvasElementLink,
    		CanvasInteractable,
    		MousePositionElement,
    		CanvasElement,
    		createEventDispatcher,
    		linking,
    		dragging,
    		position,
    		zoom,
    		dispatch,
    		data,
    		OuterComponent,
    		LineComponent,
    		InnerComponent,
    		LineAnnotationComponent,
    		panzoomInstance,
    		x,
    		y,
    		$linking,
    		$dragging,
    		$position,
    		$zoom
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("OuterComponent" in $$props) $$invalidate(2, OuterComponent = $$props.OuterComponent);
    		if ("LineComponent" in $$props) $$invalidate(3, LineComponent = $$props.LineComponent);
    		if ("InnerComponent" in $$props) $$invalidate(4, InnerComponent = $$props.InnerComponent);
    		if ("LineAnnotationComponent" in $$props) $$invalidate(5, LineAnnotationComponent = $$props.LineAnnotationComponent);
    		if ("panzoomInstance" in $$props) $$invalidate(0, panzoomInstance = $$props.panzoomInstance);
    		if ("x" in $$props) $$invalidate(6, x = $$props.x);
    		if ("y" in $$props) $$invalidate(7, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$linking*/ 256) {
    			{
    				if ($linking.end) {
    					dispatch("linkend", { from: $linking.start, to: $linking.end });
    					linking.set({});
    				} else if ($linking.start && $linking.x === undefined && $linking.y === undefined) {
    					dispatch("linkstart", { from: $linking.start });
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$dragging*/ 512) {
    			{
    				if ($dragging.dropped) {
    					dispatch("dragend", {
    						id: $dragging.id,
    						x: $dragging.x,
    						y: $dragging.y
    					});

    					dragging.set({});
    				} else if ($dragging.id && $dragging.x === undefined && $dragging.y === undefined) {
    					dispatch("dragstart", { id: $dragging.id });
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$position*/ 1024) {
    			{
    				if ($position) {
    					const parts = $position.split(",");
    					const thisX = -1 * parseInt(parts[4]);
    					const thisY = -1 * parseInt(parts[5]);
    					dispatch("offsetchange", { x: thisX, y: thisY });
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$zoom*/ 2048) {
    			{
    				if ($zoom) {
    					dispatch("scalechange", { scale: $zoom });
    				}
    			}
    		}
    	};

    	return [
    		panzoomInstance,
    		data,
    		OuterComponent,
    		LineComponent,
    		InnerComponent,
    		LineAnnotationComponent,
    		x,
    		y,
    		$linking,
    		$dragging,
    		$position,
    		$zoom,
    		slots,
    		canvasinteractable_panzoomInstance_binding,
    		$$scope
    	];
    }

    class Canvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			data: 1,
    			OuterComponent: 2,
    			LineComponent: 3,
    			InnerComponent: 4,
    			LineAnnotationComponent: 5,
    			panzoomInstance: 0,
    			x: 6,
    			y: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canvas",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !("data" in props)) {
    			console.warn("<Canvas> was created without expected prop 'data'");
    		}

    		if (/*OuterComponent*/ ctx[2] === undefined && !("OuterComponent" in props)) {
    			console.warn("<Canvas> was created without expected prop 'OuterComponent'");
    		}

    		if (/*LineComponent*/ ctx[3] === undefined && !("LineComponent" in props)) {
    			console.warn("<Canvas> was created without expected prop 'LineComponent'");
    		}

    		if (/*x*/ ctx[6] === undefined && !("x" in props)) {
    			console.warn("<Canvas> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[7] === undefined && !("y" in props)) {
    			console.warn("<Canvas> was created without expected prop 'y'");
    		}
    	}

    	get data() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get OuterComponent() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set OuterComponent(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get LineComponent() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set LineComponent(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get InnerComponent() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set InnerComponent(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get LineAnnotationComponent() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set LineAnnotationComponent(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get panzoomInstance() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set panzoomInstance(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* demo/Unit.svelte generated by Svelte v3.35.0 */

    const file$3 = "demo/Unit.svelte";
    const get_linkStarter_slot_changes = dirty => ({});
    const get_linkStarter_slot_context = ctx => ({});
    const get_text_slot_changes = dirty => ({});
    const get_text_slot_context = ctx => ({});
    const get_grippable_slot_changes = dirty => ({});
    const get_grippable_slot_context = ctx => ({});

    function create_fragment$4(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let div2;
    	let current;
    	const grippable_slot_template = /*#slots*/ ctx[1].grippable;
    	const grippable_slot = create_slot(grippable_slot_template, ctx, /*$$scope*/ ctx[0], get_grippable_slot_context);
    	const text_slot_template = /*#slots*/ ctx[1].text;
    	const text_slot = create_slot(text_slot_template, ctx, /*$$scope*/ ctx[0], get_text_slot_context);
    	const linkStarter_slot_template = /*#slots*/ ctx[1].linkStarter;
    	const linkStarter_slot = create_slot(linkStarter_slot_template, ctx, /*$$scope*/ ctx[0], get_linkStarter_slot_context);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (grippable_slot) grippable_slot.c();
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			if (text_slot) text_slot.c();
    			t1 = space();
    			div2 = element("div");
    			if (linkStarter_slot) linkStarter_slot.c();
    			attr_dev(div0, "class", "grippable svelte-154oe5m");
    			add_location(div0, file$3, 1, 2, 21);
    			attr_dev(div1, "class", "text svelte-154oe5m");
    			add_location(div1, file$3, 3, 4, 109);
    			attr_dev(div2, "class", "starter svelte-154oe5m");
    			add_location(div2, file$3, 4, 4, 158);
    			attr_dev(div3, "class", "unit-content svelte-154oe5m");
    			add_location(div3, file$3, 2, 2, 78);
    			attr_dev(div4, "class", "unit svelte-154oe5m");
    			add_location(div4, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);

    			if (grippable_slot) {
    				grippable_slot.m(div0, null);
    			}

    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div1);

    			if (text_slot) {
    				text_slot.m(div1, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			if (linkStarter_slot) {
    				linkStarter_slot.m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (grippable_slot) {
    				if (grippable_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(grippable_slot, grippable_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_grippable_slot_changes, get_grippable_slot_context);
    				}
    			}

    			if (text_slot) {
    				if (text_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(text_slot, text_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_text_slot_changes, get_text_slot_context);
    				}
    			}

    			if (linkStarter_slot) {
    				if (linkStarter_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(linkStarter_slot, linkStarter_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_linkStarter_slot_changes, get_linkStarter_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(grippable_slot, local);
    			transition_in(text_slot, local);
    			transition_in(linkStarter_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(grippable_slot, local);
    			transition_out(text_slot, local);
    			transition_out(linkStarter_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (grippable_slot) grippable_slot.d(detaching);
    			if (text_slot) text_slot.d(detaching);
    			if (linkStarter_slot) linkStarter_slot.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Unit", slots, ['grippable','text','linkStarter']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Unit> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Unit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Unit",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* demo/Inner.svelte generated by Svelte v3.35.0 */
    const file$2 = "demo/Inner.svelte";

    // (10:2) {#if active}
    function create_if_block(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let br2;
    	let t3;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Something secret and hidden");
    			br0 = element("br");
    			t1 = text("Something secret and hidden");
    			br1 = element("br");
    			t2 = text("Something secret and hidden");
    			br2 = element("br");
    			t3 = text("Something secret and hidden");
    			add_location(br0, file$2, 11, 33, 252);
    			add_location(br1, file$2, 11, 66, 285);
    			add_location(br2, file$2, 12, 35, 324);
    			add_location(div, file$2, 10, 4, 196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, br1);
    			append_dev(div, t2);
    			append_dev(div, br2);
    			append_dev(div, t3);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t0;
    	let button;
    	let t1_value = (!/*active*/ ctx[2] ? "Show" : "Hide") + "";
    	let t1;
    	let t2;
    	let p;
    	let t3;
    	let t4;
    	let input;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*active*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(/*description*/ ctx[0]);
    			t4 = space();
    			input = element("input");
    			add_location(button, file$2, 15, 2, 379);
    			add_location(p, file$2, 20, 2, 482);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			add_location(input, file$2, 21, 2, 505);
    			attr_dev(div, "class", "inner-thingy svelte-93v29o");
    			add_location(div, file$2, 8, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			append_dev(button, t1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(div, t4);
    			append_dev(div, input);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*active*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*active*/ 4) && t1_value !== (t1_value = (!/*active*/ ctx[2] ? "Show" : "Hide") + "")) set_data_dev(t1, t1_value);
    			if (!current || dirty & /*description*/ 1) set_data_dev(t3, /*description*/ ctx[0]);

    			if (!current || dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
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
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Inner", slots, []);
    	let { description = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let active = false;
    	const writable_props = ["description", "placeholder"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Inner> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, active = !active);
    	};

    	$$self.$$set = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    	};

    	$$self.$capture_state = () => ({ slide, description, placeholder, active });

    	$$self.$inject_state = $$props => {
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, placeholder, active, click_handler];
    }

    class Inner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { description: 0, placeholder: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Inner",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get description() {
    		throw new Error("<Inner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Inner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Inner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Inner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* demo/Line.svelte generated by Svelte v3.35.0 */
    const get_line_slot_changes = dirty => ({});
    const get_line_slot_context = ctx => ({ color, hoverColor, hoverStroke, stroke });

    function create_fragment$2(ctx) {
    	let current;
    	const line_slot_template = /*#slots*/ ctx[1].line;
    	const line_slot = create_slot(line_slot_template, ctx, /*$$scope*/ ctx[0], get_line_slot_context);

    	const block = {
    		c: function create() {
    			if (line_slot) line_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (line_slot) {
    				line_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (line_slot) {
    				if (line_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(line_slot, line_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_line_slot_changes, get_line_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (line_slot) line_slot.d(detaching);
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

    const color = "black";
    const hoverColor = "grey";
    const stroke = 5;
    const hoverStroke = 10;

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Line", slots, ['line']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ color, hoverColor, stroke, hoverStroke });
    	return [$$scope, slots];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* demo/LineAnnotation.svelte generated by Svelte v3.35.0 */

    const file$1 = "demo/LineAnnotation.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div, "class", "svelte-hsmzih");
    			add_location(div, file$1, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		i: noop$3,
    		o: noop$3,
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
    	validate_slots("LineAnnotation", slots, []);
    	let { text } = $$props;
    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LineAnnotation> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ text });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text];
    }

    class LineAnnotation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineAnnotation",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<LineAnnotation> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<LineAnnotation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<LineAnnotation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* demo/App.svelte generated by Svelte v3.35.0 */

    const { console: console_1 } = globals;
    const file = "demo/App.svelte";

    // (207:6) 
    function create_controls_slot(ctx) {
    	let div1;
    	let button0;
    	let t1;
    	let div0;
    	let button1;
    	let t3;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Create new unit";
    			t1 = space();
    			div0 = element("div");
    			button1 = element("button");
    			button1.textContent = "+ Zoom in";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "- Zoom out";
    			attr_dev(button0, "class", "svelte-2ar2im");
    			add_location(button0, file, 207, 8, 5299);
    			attr_dev(button1, "class", "svelte-2ar2im");
    			add_location(button1, file, 209, 10, 5384);
    			attr_dev(button2, "class", "svelte-2ar2im");
    			add_location(button2, file, 210, 10, 5439);
    			add_location(div0, file, 208, 8, 5368);
    			attr_dev(div1, "slot", "controls");
    			attr_dev(div1, "class", "controls svelte-2ar2im");
    			add_location(div1, file, 206, 6, 5252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button1);
    			append_dev(div0, t3);
    			append_dev(div0, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleCreateUnit*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*zoomIn*/ ctx[10], false, false, false),
    					listen_dev(button2, "click", /*zoomOut*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_controls_slot.name,
    		type: "slot",
    		source: "(207:6) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let canvas;
    	let updating_panzoomInstance;
    	let current;

    	function canvas_panzoomInstance_binding(value) {
    		/*canvas_panzoomInstance_binding*/ ctx[12](value);
    	}

    	let canvas_props = {
    		data: /*data*/ ctx[2],
    		OuterComponent: Unit,
    		InnerComponent: Inner,
    		LineComponent: Line,
    		LineAnnotationComponent: LineAnnotation,
    		x: 2000,
    		y: 2000,
    		$$slots: { controls: [create_controls_slot] },
    		$$scope: { ctx }
    	};

    	if (/*panzoomInstance*/ ctx[1] !== void 0) {
    		canvas_props.panzoomInstance = /*panzoomInstance*/ ctx[1];
    	}

    	canvas = new Canvas({ props: canvas_props, $$inline: true });
    	binding_callbacks.push(() => bind(canvas, "panzoomInstance", canvas_panzoomInstance_binding));
    	canvas.$on("linkstart", /*handleLinkStart*/ ctx[3]);
    	canvas.$on("linkend", /*handleLinkEnd*/ ctx[4]);
    	canvas.$on("dragstart", /*handleDragStart*/ ctx[5]);
    	canvas.$on("dragend", /*handleDragEnd*/ ctx[6]);
    	canvas.$on("offsetchange", /*handleOffset*/ ctx[7]);
    	canvas.$on("scalechange", /*handleScale*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			create_component(canvas.$$.fragment);
    			attr_dev(div0, "class", "sidebar svelte-2ar2im");
    			add_location(div0, file, 187, 2, 4725);
    			attr_dev(div1, "class", "header svelte-2ar2im");
    			add_location(div1, file, 188, 2, 4751);
    			attr_dev(div2, "class", "area svelte-2ar2im");
    			add_location(div2, file, 189, 2, 4776);
    			attr_dev(div3, "class", "layout svelte-2ar2im");
    			add_location(div3, file, 186, 0, 4702);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(canvas, div2, null);
    			/*div2_binding*/ ctx[13](div2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const canvas_changes = {};
    			if (dirty & /*data*/ 4) canvas_changes.data = /*data*/ ctx[2];

    			if (dirty & /*$$scope*/ 1048576) {
    				canvas_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_panzoomInstance && dirty & /*panzoomInstance*/ 2) {
    				updating_panzoomInstance = true;
    				canvas_changes.panzoomInstance = /*panzoomInstance*/ ctx[1];
    				add_flush_callback(() => updating_panzoomInstance = false);
    			}

    			canvas.$set(canvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(canvas);
    			/*div2_binding*/ ctx[13](null);
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
    	validate_slots("App", slots, []);
    	let areaElt = null;
    	let bounds = { width: 0, height: 0 };
    	let offsetX = 0;
    	let offsetY = 0;
    	let scale = 1;
    	let panzoomInstance;

    	const calculateBounds = () => {
    		const eltBounds = areaElt.getBoundingClientRect();

    		bounds = {
    			width: eltBounds.width,
    			height: eltBounds.height
    		};
    	};

    	onMount(() => {
    		calculateBounds();
    	});

    	afterUpdate(() => {
    		
    	}); // calculateBounds();

    	let data = [
    		{
    			id: "one",
    			x: 20,
    			y: 150,
    			text: "<h1>(1) This is a zoomable and pannable canvas which holds movable and linkable elements.</h1>",
    			links: [
    				{
    					id: "two",
    					props: { text: "testing 123" }
    				},
    				{
    					id: "four",
    					props: { text: "one to four, baby" }
    				}
    			]
    		},
    		{
    			id: "two",
    			x: 400,
    			y: 20,
    			text: "(2) These elements can link together. Form new links by clicking on the box to the right of this text and selecting an element to link to.",
    			links: []
    		},
    		{
    			id: "three",
    			x: 700,
    			y: 200,
    			text: "(3) You can render <em>any</em> html you want, like <code>code</code> or <strong>big, bold text</strong> ",
    			links: []
    		},
    		{
    			id: "four",
    			x: 470,
    			y: 300,
    			text: "(4) It's very extensible",
    			links: [
    				{
    					id: "three",
    					props: { text: "four to  three" }
    				}
    			]
    		},
    		{
    			id: "five",
    			x: 700,
    			y: 370,
    			props: {
    				description: "(5) you can even render your own components and pass in props",
    				placeholder: "like this prop!"
    			},
    			links: []
    		}
    	];

    	const handleLinkStart = e => {
    		console.log("link start");
    	};

    	const handleLinkEnd = e => {
    		console.log("link end");

    		$$invalidate(2, data = data.map(elt => {
    			if (elt.id === e.detail.from) {
    				elt.links.push({ id: e.detail.to });
    			}

    			return elt;
    		}));
    	};

    	const handleDragStart = e => {
    		console.log("drag start");
    	};

    	const handleDragEnd = e => {
    		console.log("drag end");

    		$$invalidate(2, data = data.map(elt => {
    			if (elt.id === e.detail.id) {
    				elt.x = e.detail.x;
    				elt.y = e.detail.y;
    			}

    			return elt;
    		}));
    	};

    	const handleOffset = e => {
    		// what space is detail x y in
    		// bounds in pixel space
    		offsetX = e.detail.x;

    		offsetY = e.detail.y;
    		console.log("offset", e.detail.x, e.detail.y, offsetX, offsetY);
    	};

    	const handleScale = e => {
    		// offsetX, y in pixel space
    		// console.log(e.detail.scale, bounds.width, bounds.height);
    		// offsetX *= e.detail.scale;
    		// offsetY *= e.detail.scale;
    		scale = e.detail.scale;

    		console.log("scale", scale);
    	};

    	const handleCreateUnit = () => {
    		$$invalidate(2, data = [
    			...data,
    			{
    				id: data.length + 1,
    				x: offsetX,
    				y: offsetY,
    				text: "a new unit",
    				links: []
    			}
    		]);
    	};

    	const zoomIn = e => {
    		// unit space
    		const centerX = (offsetX + bounds.width / 2) / scale;

    		const centerY = (offsetY + bounds.height / 2) / scale;
    		const dX = bounds.width / 2 / scale;
    		const dY = bounds.height / 2 / scale;
    		const top = centerY - dY * 0.8;
    		const bottom = centerY + dY * 0.8;
    		const left = centerX - dX * 0.8;
    		const right = centerX + dX * 0.8;

    		// HACK: to cancel animation
    		panzoomInstance.zoomTo(centerX, centerY, 1.25); // upper-left corner

    		// relative to original
    		panzoomInstance.showRectangle({ top, bottom, left, right });
    	};

    	const boundWindow = e => {
    		
    	};

    	const zoomOut = () => {
    		// unit space
    		const centerX = (offsetX + bounds.width / 2) / scale;

    		const centerY = (offsetY + bounds.height / 2) / scale;
    		const dX = bounds.width / 2 / scale;
    		const dY = bounds.height / 2 / scale;
    		const top = centerY - dY * 1.25;
    		const bottom = centerY + dY * 1.25;
    		const left = centerX - dX * 1.25;
    		const right = centerX + dX * 1.25;

    		// HACK: to cancel animation
    		panzoomInstance.zoomTo(centerX, centerY, 0.8); // upper-left corner

    		// relative to original
    		panzoomInstance.showRectangle({ top, bottom, left, right });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function canvas_panzoomInstance_binding(value) {
    		panzoomInstance = value;
    		$$invalidate(1, panzoomInstance);
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			areaElt = $$value;
    			$$invalidate(0, areaElt);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		Canvas,
    		Unit,
    		Inner,
    		Line,
    		LineAnnotation,
    		areaElt,
    		bounds,
    		offsetX,
    		offsetY,
    		scale,
    		panzoomInstance,
    		calculateBounds,
    		data,
    		handleLinkStart,
    		handleLinkEnd,
    		handleDragStart,
    		handleDragEnd,
    		handleOffset,
    		handleScale,
    		handleCreateUnit,
    		zoomIn,
    		boundWindow,
    		zoomOut
    	});

    	$$self.$inject_state = $$props => {
    		if ("areaElt" in $$props) $$invalidate(0, areaElt = $$props.areaElt);
    		if ("bounds" in $$props) bounds = $$props.bounds;
    		if ("offsetX" in $$props) offsetX = $$props.offsetX;
    		if ("offsetY" in $$props) offsetY = $$props.offsetY;
    		if ("scale" in $$props) scale = $$props.scale;
    		if ("panzoomInstance" in $$props) $$invalidate(1, panzoomInstance = $$props.panzoomInstance);
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		areaElt,
    		panzoomInstance,
    		data,
    		handleLinkStart,
    		handleLinkEnd,
    		handleDragStart,
    		handleDragEnd,
    		handleOffset,
    		handleScale,
    		handleCreateUnit,
    		zoomIn,
    		zoomOut,
    		canvas_panzoomInstance_binding,
    		div2_binding
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
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
