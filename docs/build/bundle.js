
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    const globalWindow = window;
    function CodeJar(editor, highlight, opt = {}) {
        const options = Object.assign({ tab: '\t', indentOn: /{$/, spellcheck: false, catchTab: true, preserveIdent: true, addClosing: true, history: true, window: globalWindow }, opt);
        const window = options.window;
        const document = window.document;
        let listeners = [];
        let history = [];
        let at = -1;
        let focus = false;
        let callback;
        let prev; // code content prior keydown event
        editor.setAttribute('contenteditable', 'plaintext-only');
        editor.setAttribute('spellcheck', options.spellcheck ? 'true' : 'false');
        editor.style.outline = 'none';
        editor.style.overflowWrap = 'break-word';
        editor.style.overflowY = 'auto';
        editor.style.whiteSpace = 'pre-wrap';
        let isLegacy = false; // true if plaintext-only is not supported
        highlight(editor);
        if (editor.contentEditable !== 'plaintext-only')
            isLegacy = true;
        if (isLegacy)
            editor.setAttribute('contenteditable', 'true');
        const debounceHighlight = debounce(() => {
            const pos = save();
            highlight(editor, pos);
            restore(pos);
        }, 30);
        let recording = false;
        const shouldRecord = (event) => {
            return !isUndo(event) && !isRedo(event)
                && event.key !== 'Meta'
                && event.key !== 'Control'
                && event.key !== 'Alt'
                && !event.key.startsWith('Arrow');
        };
        const debounceRecordHistory = debounce((event) => {
            if (shouldRecord(event)) {
                recordHistory();
                recording = false;
            }
        }, 300);
        const on = (type, fn) => {
            listeners.push([type, fn]);
            editor.addEventListener(type, fn);
        };
        on('keydown', event => {
            if (event.defaultPrevented)
                return;
            prev = toString();
            if (options.preserveIdent)
                handleNewLine(event);
            else
                legacyNewLineFix(event);
            if (options.catchTab)
                handleTabCharacters(event);
            if (options.addClosing)
                handleSelfClosingCharacters(event);
            if (options.history) {
                handleUndoRedo(event);
                if (shouldRecord(event) && !recording) {
                    recordHistory();
                    recording = true;
                }
            }
            if (isLegacy)
                restore(save());
        });
        on('keyup', event => {
            if (event.defaultPrevented)
                return;
            if (event.isComposing)
                return;
            if (prev !== toString())
                debounceHighlight();
            debounceRecordHistory(event);
            if (callback)
                callback(toString());
        });
        on('focus', _event => {
            focus = true;
        });
        on('blur', _event => {
            focus = false;
        });
        on('paste', event => {
            recordHistory();
            handlePaste(event);
            recordHistory();
            if (callback)
                callback(toString());
        });
        function save() {
            const s = getSelection();
            const pos = { start: 0, end: 0, dir: undefined };
            let { anchorNode, anchorOffset, focusNode, focusOffset } = s;
            if (!anchorNode || !focusNode)
                throw 'error1';
            // Selection anchor and focus are expected to be text nodes,
            // so normalize them.
            if (anchorNode.nodeType === Node.ELEMENT_NODE) {
                const node = document.createTextNode('');
                anchorNode.insertBefore(node, anchorNode.childNodes[anchorOffset]);
                anchorNode = node;
                anchorOffset = 0;
            }
            if (focusNode.nodeType === Node.ELEMENT_NODE) {
                const node = document.createTextNode('');
                focusNode.insertBefore(node, focusNode.childNodes[focusOffset]);
                focusNode = node;
                focusOffset = 0;
            }
            visit(editor, el => {
                if (el === anchorNode && el === focusNode) {
                    pos.start += anchorOffset;
                    pos.end += focusOffset;
                    pos.dir = anchorOffset <= focusOffset ? '->' : '<-';
                    return 'stop';
                }
                if (el === anchorNode) {
                    pos.start += anchorOffset;
                    if (!pos.dir) {
                        pos.dir = '->';
                    }
                    else {
                        return 'stop';
                    }
                }
                else if (el === focusNode) {
                    pos.end += focusOffset;
                    if (!pos.dir) {
                        pos.dir = '<-';
                    }
                    else {
                        return 'stop';
                    }
                }
                if (el.nodeType === Node.TEXT_NODE) {
                    if (pos.dir != '->')
                        pos.start += el.nodeValue.length;
                    if (pos.dir != '<-')
                        pos.end += el.nodeValue.length;
                }
            });
            // collapse empty text nodes
            editor.normalize();
            return pos;
        }
        function restore(pos) {
            const s = getSelection();
            let startNode, startOffset = 0;
            let endNode, endOffset = 0;
            if (!pos.dir)
                pos.dir = '->';
            if (pos.start < 0)
                pos.start = 0;
            if (pos.end < 0)
                pos.end = 0;
            // Flip start and end if the direction reversed
            if (pos.dir == '<-') {
                const { start, end } = pos;
                pos.start = end;
                pos.end = start;
            }
            let current = 0;
            visit(editor, el => {
                if (el.nodeType !== Node.TEXT_NODE)
                    return;
                const len = (el.nodeValue || '').length;
                if (current + len > pos.start) {
                    if (!startNode) {
                        startNode = el;
                        startOffset = pos.start - current;
                    }
                    if (current + len > pos.end) {
                        endNode = el;
                        endOffset = pos.end - current;
                        return 'stop';
                    }
                }
                current += len;
            });
            if (!startNode)
                startNode = editor, startOffset = editor.childNodes.length;
            if (!endNode)
                endNode = editor, endOffset = editor.childNodes.length;
            // Flip back the selection
            if (pos.dir == '<-') {
                [startNode, startOffset, endNode, endOffset] = [endNode, endOffset, startNode, startOffset];
            }
            s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
        }
        function beforeCursor() {
            const s = getSelection();
            const r0 = s.getRangeAt(0);
            const r = document.createRange();
            r.selectNodeContents(editor);
            r.setEnd(r0.startContainer, r0.startOffset);
            return r.toString();
        }
        function afterCursor() {
            const s = getSelection();
            const r0 = s.getRangeAt(0);
            const r = document.createRange();
            r.selectNodeContents(editor);
            r.setStart(r0.endContainer, r0.endOffset);
            return r.toString();
        }
        function handleNewLine(event) {
            if (event.key === 'Enter') {
                const before = beforeCursor();
                const after = afterCursor();
                let [padding] = findPadding(before);
                let newLinePadding = padding;
                // If last symbol is "{" ident new line
                // Allow user defines indent rule
                if (options.indentOn.test(before)) {
                    newLinePadding += options.tab;
                }
                // Preserve padding
                if (newLinePadding.length > 0) {
                    preventDefault(event);
                    event.stopPropagation();
                    insert('\n' + newLinePadding);
                }
                else {
                    legacyNewLineFix(event);
                }
                // Place adjacent "}" on next line
                if (newLinePadding !== padding && after[0] === '}') {
                    const pos = save();
                    insert('\n' + padding);
                    restore(pos);
                }
            }
        }
        function legacyNewLineFix(event) {
            // Firefox does not support plaintext-only mode
            // and puts <div><br></div> on Enter. Let's help.
            if (isLegacy && event.key === 'Enter') {
                preventDefault(event);
                event.stopPropagation();
                if (afterCursor() == '') {
                    insert('\n ');
                    const pos = save();
                    pos.start = --pos.end;
                    restore(pos);
                }
                else {
                    insert('\n');
                }
            }
        }
        function handleSelfClosingCharacters(event) {
            const open = `([{'"`;
            const close = `)]}'"`;
            const codeAfter = afterCursor();
            const codeBefore = beforeCursor();
            const escapeCharacter = codeBefore.substr(codeBefore.length - 1) === '\\';
            const charAfter = codeAfter.substr(0, 1);
            if (close.includes(event.key) && !escapeCharacter && charAfter === event.key) {
                // We already have closing char next to cursor.
                // Move one char to right.
                const pos = save();
                preventDefault(event);
                pos.start = ++pos.end;
                restore(pos);
            }
            else if (open.includes(event.key)
                && !escapeCharacter
                && (`"'`.includes(event.key) || ['', ' ', '\n'].includes(charAfter))) {
                preventDefault(event);
                const pos = save();
                const wrapText = pos.start == pos.end ? '' : getSelection().toString();
                const text = event.key + wrapText + close[open.indexOf(event.key)];
                insert(text);
                pos.start++;
                pos.end++;
                restore(pos);
            }
        }
        function handleTabCharacters(event) {
            if (event.key === 'Tab') {
                preventDefault(event);
                if (event.shiftKey) {
                    const before = beforeCursor();
                    let [padding, start,] = findPadding(before);
                    if (padding.length > 0) {
                        const pos = save();
                        // Remove full length tab or just remaining padding
                        const len = Math.min(options.tab.length, padding.length);
                        restore({ start, end: start + len });
                        document.execCommand('delete');
                        pos.start -= len;
                        pos.end -= len;
                        restore(pos);
                    }
                }
                else {
                    insert(options.tab);
                }
            }
        }
        function handleUndoRedo(event) {
            if (isUndo(event)) {
                preventDefault(event);
                at--;
                const record = history[at];
                if (record) {
                    editor.innerHTML = record.html;
                    restore(record.pos);
                }
                if (at < 0)
                    at = 0;
            }
            if (isRedo(event)) {
                preventDefault(event);
                at++;
                const record = history[at];
                if (record) {
                    editor.innerHTML = record.html;
                    restore(record.pos);
                }
                if (at >= history.length)
                    at--;
            }
        }
        function recordHistory() {
            if (!focus)
                return;
            const html = editor.innerHTML;
            const pos = save();
            const lastRecord = history[at];
            if (lastRecord) {
                if (lastRecord.html === html
                    && lastRecord.pos.start === pos.start
                    && lastRecord.pos.end === pos.end)
                    return;
            }
            at++;
            history[at] = { html, pos };
            history.splice(at + 1);
            const maxHistory = 300;
            if (at > maxHistory) {
                at = maxHistory;
                history.splice(0, 1);
            }
        }
        function handlePaste(event) {
            preventDefault(event);
            const text = (event.originalEvent || event)
                .clipboardData
                .getData('text/plain')
                .replace(/\r/g, '');
            const pos = save();
            insert(text);
            highlight(editor);
            restore({ start: pos.start + text.length, end: pos.start + text.length });
        }
        function visit(editor, visitor) {
            const queue = [];
            if (editor.firstChild)
                queue.push(editor.firstChild);
            let el = queue.pop();
            while (el) {
                if (visitor(el) === 'stop')
                    break;
                if (el.nextSibling)
                    queue.push(el.nextSibling);
                if (el.firstChild)
                    queue.push(el.firstChild);
                el = queue.pop();
            }
        }
        function isCtrl(event) {
            return event.metaKey || event.ctrlKey;
        }
        function isUndo(event) {
            return isCtrl(event) && !event.shiftKey && event.code === 'KeyZ';
        }
        function isRedo(event) {
            return isCtrl(event) && event.shiftKey && event.code === 'KeyZ';
        }
        function insert(text) {
            text = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            document.execCommand('insertHTML', false, text);
        }
        function debounce(cb, wait) {
            let timeout = 0;
            return (...args) => {
                clearTimeout(timeout);
                timeout = window.setTimeout(() => cb(...args), wait);
            };
        }
        function findPadding(text) {
            // Find beginning of previous line.
            let i = text.length - 1;
            while (i >= 0 && text[i] !== '\n')
                i--;
            i++;
            // Find padding of the line.
            let j = i;
            while (j < text.length && /[ \t]/.test(text[j]))
                j++;
            return [text.substring(i, j) || '', i, j];
        }
        function toString() {
            return editor.textContent || '';
        }
        function preventDefault(event) {
            event.preventDefault();
        }
        function getSelection() {
            var _a;
            if (((_a = editor.parentNode) === null || _a === void 0 ? void 0 : _a.nodeType) == Node.DOCUMENT_FRAGMENT_NODE) {
                return editor.parentNode.getSelection();
            }
            return window.getSelection();
        }
        return {
            updateOptions(newOptions) {
                Object.assign(options, newOptions);
            },
            updateCode(code) {
                editor.textContent = code;
                highlight(editor);
            },
            onUpdate(cb) {
                callback = cb;
            },
            toString,
            save,
            restore,
            recordHistory,
            destroy() {
                for (let [type, fn] of listeners) {
                    editor.removeEventListener(type, fn);
                }
            },
        };
    }

    /* src/Board.svelte generated by Svelte v3.46.2 */

    const file$1 = "src/Board.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (8:12) {#each row as color}
    function create_each_block_2(ctx) {
    	let div;
    	let div_data_color_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "cell svelte-1lmg422");
    			attr_dev(div, "data-color", div_data_color_value = /*color*/ ctx[6]);
    			add_location(div, file$1, 8, 16, 193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*board*/ 1 && div_data_color_value !== (div_data_color_value = /*color*/ ctx[6])) {
    				attr_dev(div, "data-color", div_data_color_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(8:12) {#each row as color}",
    		ctx
    	});

    	return block;
    }

    // (6:4) {#each board as row, i}
    function create_each_block_1(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let each_value_2 = /*row*/ ctx[4];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*i*/ ctx[3]);
    			attr_dev(div0, "class", "num svelte-1lmg422");
    			add_location(div0, file$1, 10, 12, 265);
    			attr_dev(div1, "class", "row svelte-1lmg422");
    			add_location(div1, file$1, 6, 8, 126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*board*/ 1) {
    				each_value_2 = /*row*/ ctx[4];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(6:4) {#each board as row, i}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each board[0] as _, i}
    function create_each_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*i*/ ctx[3]);
    			attr_dev(div, "class", "num svelte-1lmg422");
    			add_location(div, file$1, 15, 12, 386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:8) {#each board[0] as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let each_value_1 = /*board*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*board*/ ctx[0][0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "row svelte-1lmg422");
    			add_location(div0, file$1, 13, 4, 323);
    			attr_dev(div1, "class", "board");
    			add_location(div1, file$1, 4, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*board*/ 1) {
    				each_value_1 = /*board*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, t);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*board*/ 1) {
    				each_value = /*board*/ ctx[0][0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('Board', slots, []);
    	let { board = Array(10).fill(Array(10)) } = $$props;
    	const writable_props = ['board'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('board' in $$props) $$invalidate(0, board = $$props.board);
    	};

    	$$self.$capture_state = () => ({ board });

    	$$self.$inject_state = $$props => {
    		if ('board' in $$props) $$invalidate(0, board = $$props.board);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [board];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { board: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get board() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set board(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var Lexer = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildLexer = exports.extractByTokenRange = exports.extractByPositionRange = exports.TokenRangeError = exports.TokenError = void 0;
    function posToString(pos) {
        return pos === undefined ? '<END-OF-FILE>' : JSON.stringify(pos);
    }
    var TokenError = /** @class */ (function (_super) {
        __extends(TokenError, _super);
        function TokenError(pos, errorMessage) {
            var _this = _super.call(this, posToString(pos) + ": " + errorMessage) || this;
            _this.pos = pos;
            _this.errorMessage = errorMessage;
            return _this;
        }
        return TokenError;
    }(Error));
    exports.TokenError = TokenError;
    var TokenRangeError = /** @class */ (function (_super) {
        __extends(TokenRangeError, _super);
        function TokenRangeError(first, next, errorMessage) {
            var _this = _super.call(this, posToString(first) + " - " + posToString(next) + ": " + errorMessage) || this;
            _this.first = first;
            _this.next = next;
            _this.errorMessage = errorMessage;
            return _this;
        }
        return TokenRangeError;
    }(Error));
    exports.TokenRangeError = TokenRangeError;
    function extractByPositionRange(input, first, next) {
        var firstIndex = first === undefined ? input.length : first.index;
        var nextIndex = next === undefined ? input.length : next.index;
        if (firstIndex >= nextIndex) {
            return '';
        }
        return input.substring(firstIndex, nextIndex);
    }
    exports.extractByPositionRange = extractByPositionRange;
    function extractByTokenRange(input, first, next) {
        return extractByPositionRange(input, (first === undefined ? undefined : first.pos), (next === undefined ? undefined : next.pos));
    }
    exports.extractByTokenRange = extractByTokenRange;
    var TokenImpl = /** @class */ (function () {
        function TokenImpl(lexer, input, kind, text, pos, keep) {
            this.lexer = lexer;
            this.input = input;
            this.kind = kind;
            this.text = text;
            this.pos = pos;
            this.keep = keep;
        }
        Object.defineProperty(TokenImpl.prototype, "next", {
            get: function () {
                if (this.nextToken === undefined) {
                    this.nextToken = this.lexer.parseNextAvailable(this.input, this.pos.index + this.text.length, this.pos.rowEnd, this.pos.columnEnd);
                    if (this.nextToken === undefined) {
                        this.nextToken = null;
                    }
                }
                return this.nextToken === null ? undefined : this.nextToken;
            },
            enumerable: false,
            configurable: true
        });
        return TokenImpl;
    }());
    var LexerImpl = /** @class */ (function () {
        function LexerImpl(rules) {
            this.rules = rules;
            for (var _i = 0, _a = this.rules; _i < _a.length; _i++) {
                var rule = _a[_i];
                if (rule[1].source[0] !== '^') {
                    throw new Error("Regular expression patterns for a tokenizer should start with \"^\": " + rule[1].source);
                }
                if (!rule[1].global) {
                    throw new Error("Regular expression patterns for a tokenizer should be global: " + rule[1].source);
                }
            }
        }
        LexerImpl.prototype.parse = function (input) {
            return this.parseNextAvailable(input, 0, 1, 1);
        };
        LexerImpl.prototype.parseNext = function (input, indexStart, rowBegin, columnBegin) {
            if (indexStart === input.length) {
                return undefined;
            }
            var subString = input.substr(indexStart);
            var result;
            for (var _i = 0, _a = this.rules; _i < _a.length; _i++) {
                var _b = _a[_i], keep = _b[0], regexp = _b[1], kind = _b[2];
                regexp.lastIndex = 0;
                if (regexp.test(subString)) {
                    var text = subString.substr(0, regexp.lastIndex);
                    var rowEnd = rowBegin;
                    var columnEnd = columnBegin;
                    for (var _c = 0, text_1 = text; _c < text_1.length; _c++) {
                        var c = text_1[_c];
                        switch (c) {
                            case '\r': break;
                            case '\n':
                                rowEnd++;
                                columnEnd = 1;
                                break;
                            default: columnEnd++;
                        }
                    }
                    var newResult = new TokenImpl(this, input, kind, text, { index: indexStart, rowBegin: rowBegin, columnBegin: columnBegin, rowEnd: rowEnd, columnEnd: columnEnd }, keep);
                    if (result === undefined || result.text.length < newResult.text.length) {
                        result = newResult;
                    }
                }
            }
            if (result === undefined) {
                throw new TokenError({ index: indexStart, rowBegin: rowBegin, columnBegin: columnBegin, rowEnd: rowBegin, columnEnd: columnBegin }, "Unable to tokenize the rest of the input: " + input.substr(indexStart));
            }
            else {
                return result;
            }
        };
        LexerImpl.prototype.parseNextAvailable = function (input, index, rowBegin, columnBegin) {
            var token;
            while (true) {
                token = this.parseNext(input, (token === undefined ? index : token.pos.index + token.text.length), (token === undefined ? rowBegin : token.pos.rowEnd), (token === undefined ? columnBegin : token.pos.columnEnd));
                if (token === undefined) {
                    return undefined;
                }
                else if (token.keep) {
                    return token;
                }
            }
        };
        return LexerImpl;
    }());
    function buildLexer(rules) {
        return new LexerImpl(rules);
    }
    exports.buildLexer = buildLexer;

    });

    var ParserInterface = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unableToConsumeToken = exports.resultOrError = exports.betterError = void 0;
    function betterError(e1, e2) {
        if (e1 === undefined) {
            return e2;
        }
        if (e2 === undefined) {
            return e1;
        }
        if (e1.pos === undefined) {
            return e1;
        }
        if (e2.pos === undefined) {
            return e2;
        }
        if (e1.pos.index < e2.pos.index) {
            return e2;
        }
        else if (e1.pos.index > e2.pos.index) {
            return e1;
        }
        else {
            return e1;
        }
    }
    exports.betterError = betterError;
    function resultOrError(result, error, successful) {
        if (successful) {
            return {
                candidates: result,
                successful: true,
                error: error
            };
        }
        else {
            return {
                successful: false,
                error: error
            };
        }
    }
    exports.resultOrError = resultOrError;
    function unableToConsumeToken(token) {
        return {
            kind: 'Error',
            pos: token === undefined ? undefined : token.pos,
            message: "Unable to consume token: " + (token === undefined ? '<END-OF-FILE>' : token.text)
        };
    }
    exports.unableToConsumeToken = unableToConsumeToken;

    });

    var TokenParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tok = exports.str = exports.nil = void 0;

    function nil() {
        return {
            parse: function (token) {
                return {
                    candidates: [{
                            firstToken: token,
                            nextToken: token,
                            result: undefined
                        }],
                    successful: true,
                    error: undefined
                };
            }
        };
    }
    exports.nil = nil;
    function str(toMatch) {
        return {
            parse: function (token) {
                if (token === undefined || token.text !== toMatch) {
                    return {
                        successful: false,
                        error: ParserInterface.unableToConsumeToken(token)
                    };
                }
                return {
                    candidates: [{
                            firstToken: token,
                            nextToken: token.next,
                            result: token
                        }],
                    successful: true,
                    error: undefined
                };
            }
        };
    }
    exports.str = str;
    function tok(toMatch) {
        return {
            parse: function (token) {
                if (token === undefined || token.kind !== toMatch) {
                    return {
                        successful: false,
                        error: ParserInterface.unableToConsumeToken(token)
                    };
                }
                return {
                    candidates: [{
                            firstToken: token,
                            nextToken: token.next,
                            result: token
                        }],
                    successful: true,
                    error: undefined
                };
            }
        };
    }
    exports.tok = tok;

    });

    var SequencialParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.seq = void 0;

    // CodegenOverloadings:End
    function seq() {
        var ps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ps[_i] = arguments[_i];
        }
        return {
            parse: function (token) {
                var error;
                var result = [{ firstToken: token, nextToken: token, result: [] }];
                for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
                    var p = ps_1[_i];
                    if (result.length === 0) {
                        break;
                    }
                    var steps = result;
                    result = [];
                    for (var _a = 0, steps_1 = steps; _a < steps_1.length; _a++) {
                        var step = steps_1[_a];
                        var output = p.parse(step.nextToken);
                        error = ParserInterface.betterError(error, output.error);
                        if (output.successful) {
                            for (var _b = 0, _c = output.candidates; _b < _c.length; _b++) {
                                var candidate = _c[_b];
                                result.push({
                                    firstToken: step.firstToken,
                                    nextToken: candidate.nextToken,
                                    result: step.result.concat([candidate.result])
                                });
                            }
                        }
                    }
                }
                return ParserInterface.resultOrError(result, error, result.length !== 0);
            }
        };
    }
    exports.seq = seq;

    });

    var AlternativeParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.alt = void 0;

    // CodegenOverloadings:End
    function alt() {
        var ps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ps[_i] = arguments[_i];
        }
        return {
            parse: function (token) {
                var error;
                var result = [];
                var successful = false;
                for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
                    var p = ps_1[_i];
                    var output = p.parse(token);
                    error = ParserInterface.betterError(error, output.error);
                    if (output.successful) {
                        result = result.concat(output.candidates);
                        successful = true;
                    }
                }
                return ParserInterface.resultOrError(result, error, successful);
            }
        };
    }
    exports.alt = alt;

    });

    var OptionalParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.opt_sc = exports.opt = void 0;


    function opt(p) {
        return AlternativeParser.alt(p, TokenParser.nil());
    }
    exports.opt = opt;
    function opt_sc(p) {
        return {
            parse: function (token) {
                var output = p.parse(token);
                if (output.successful) {
                    return output;
                }
                else {
                    return {
                        candidates: [{
                                firstToken: token,
                                nextToken: token,
                                result: undefined
                            }],
                        successful: true,
                        error: output.error
                    };
                }
            }
        };
    }
    exports.opt_sc = opt_sc;

    });

    var ApplyParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.kmid = exports.kright = exports.kleft = exports.apply = void 0;

    function apply(p, callback) {
        return {
            parse: function (token) {
                var output = p.parse(token);
                if (output.successful) {
                    return {
                        candidates: output.candidates.map(function (value) {
                            return {
                                firstToken: token,
                                nextToken: value.nextToken,
                                result: callback(value.result, [token, value.nextToken])
                            };
                        }),
                        successful: true,
                        error: output.error
                    };
                }
                else {
                    return output;
                }
            }
        };
    }
    exports.apply = apply;
    function kleft(p1, p2) {
        return apply(SequencialParser.seq(p1, p2), function (value) { return value[0]; });
    }
    exports.kleft = kleft;
    function kright(p1, p2) {
        return apply(SequencialParser.seq(p1, p2), function (value) { return value[1]; });
    }
    exports.kright = kright;
    function kmid(p1, p2, p3) {
        return apply(SequencialParser.seq(p1, p2, p3), function (value) { return value[1]; });
    }
    exports.kmid = kmid;

    });

    var RepeativeParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lrec_sc = exports.lrec = exports.list_sc = exports.list = exports.repr = exports.rep_sc = exports.rep = void 0;



    function rep(p) {
        var reprParser = repr(p);
        return {
            parse: function (token) {
                var output = reprParser.parse(token);
                if (output.successful) {
                    return {
                        candidates: output.candidates.reverse(),
                        successful: true,
                        error: output.error
                    };
                }
                else {
                    return output;
                }
            }
        };
    }
    exports.rep = rep;
    function rep_sc(p) {
        return {
            parse: function (token) {
                var error;
                var result = [{ firstToken: token, nextToken: token, result: [] }];
                while (true) {
                    var steps = result;
                    result = [];
                    for (var _i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
                        var step = steps_1[_i];
                        var output = p.parse(step.nextToken);
                        error = ParserInterface.betterError(error, output.error);
                        if (output.successful) {
                            for (var _a = 0, _b = output.candidates; _a < _b.length; _a++) {
                                var candidate = _b[_a];
                                if (candidate.nextToken !== step.nextToken) {
                                    result.push({
                                        firstToken: step.firstToken,
                                        nextToken: candidate.nextToken,
                                        result: step.result.concat([candidate.result])
                                    });
                                }
                            }
                        }
                    }
                    if (result.length === 0) {
                        result = steps;
                        break;
                    }
                }
                return ParserInterface.resultOrError(result, error, true);
            }
        };
    }
    exports.rep_sc = rep_sc;
    function repr(p) {
        return {
            parse: function (token) {
                var error;
                var result = [{ firstToken: token, nextToken: token, result: [] }];
                for (var i = 0; i < result.length; i++) {
                    var step = result[i];
                    var output = p.parse(step.nextToken);
                    error = ParserInterface.betterError(error, output.error);
                    if (output.successful) {
                        for (var _i = 0, _a = output.candidates; _i < _a.length; _i++) {
                            var candidate = _a[_i];
                            if (candidate.nextToken !== step.nextToken) {
                                result.push({
                                    firstToken: step.firstToken,
                                    nextToken: candidate.nextToken,
                                    result: step.result.concat([candidate.result])
                                });
                            }
                        }
                    }
                }
                return ParserInterface.resultOrError(result, error, true);
            }
        };
    }
    exports.repr = repr;
    function applyList(value) {
        return [value[0]].concat(value[1].map(function (pair) { return pair[1]; }));
    }
    function list(p, s) {
        return ApplyParser.apply(SequencialParser.seq(p, rep(SequencialParser.seq(s, p))), applyList);
    }
    exports.list = list;
    function list_sc(p, s) {
        return ApplyParser.apply(SequencialParser.seq(p, rep_sc(SequencialParser.seq(s, p))), applyList);
    }
    exports.list_sc = list_sc;
    function applyLrec(callback) {
        return function (value) {
            var result = value[0];
            for (var _i = 0, _a = value[1]; _i < _a.length; _i++) {
                var tail = _a[_i];
                result = callback(result, tail);
            }
            return result;
        };
    }
    function lrec(p, q, callback) {
        return ApplyParser.apply(SequencialParser.seq(p, rep(q)), applyLrec(callback));
    }
    exports.lrec = lrec;
    function lrec_sc(p, q, callback) {
        return ApplyParser.apply(SequencialParser.seq(p, rep_sc(q)), applyLrec(callback));
    }
    exports.lrec_sc = lrec_sc;

    });

    var AmbiguousParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.amb = void 0;
    function amb(p) {
        return {
            parse: function (token) {
                var branches = p.parse(token);
                if (!branches.successful) {
                    return branches;
                }
                var group = new Map();
                for (var _i = 0, _a = branches.candidates; _i < _a.length; _i++) {
                    var r = _a[_i];
                    var rs = group.get(r.nextToken);
                    if (rs === undefined) {
                        group.set(r.nextToken, [r]);
                    }
                    else {
                        rs.push(r);
                    }
                }
                return {
                    candidates: Array.from(group.values())
                        .map(function (rs) { return ({
                        firstToken: rs[0].firstToken,
                        nextToken: rs[0].nextToken,
                        result: rs.map(function (r) { return r.result; })
                    }); }),
                    successful: true,
                    error: branches.error
                };
            }
        };
    }
    exports.amb = amb;

    });

    var ErrorParser = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.errd = exports.err = void 0;
    function err(p, errorMessage) {
        return {
            parse: function (token) {
                var branches = p.parse(token);
                if (branches.successful) {
                    return branches;
                }
                return {
                    successful: false,
                    error: {
                        kind: 'Error',
                        pos: branches.error.pos,
                        message: errorMessage
                    }
                };
            }
        };
    }
    exports.err = err;
    function errd(p, errorMessage, defaultValue) {
        return {
            parse: function (token) {
                var branches = p.parse(token);
                if (branches.successful) {
                    return branches;
                }
                return {
                    successful: true,
                    candidates: [{
                            firstToken: token,
                            nextToken: token,
                            result: defaultValue
                        }],
                    error: {
                        kind: 'Error',
                        pos: branches.error.pos,
                        message: errorMessage
                    }
                };
            }
        };
    }
    exports.errd = errd;

    });

    var Rule = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.expectSingleResult = exports.expectEOF = exports.rule = void 0;


    var RuleImpl = /** @class */ (function () {
        function RuleImpl() {
            // nothing
        }
        RuleImpl.prototype.setPattern = function (parser) {
            this.parser = parser;
        };
        RuleImpl.prototype.parse = function (token) {
            if (this.parser === undefined) {
                throw new Error("Rule has not been initialized. setPattern is required before calling parse.");
            }
            return this.parser.parse(token);
        };
        return RuleImpl;
    }());
    function rule() {
        return new RuleImpl();
    }
    exports.rule = rule;
    function expectEOF(output) {
        if (!output.successful) {
            return output;
        }
        if (output.candidates.length === 0) {
            return {
                successful: false,
                error: {
                    kind: 'Error',
                    pos: undefined,
                    message: 'No result is returned.'
                }
            };
        }
        var filtered = [];
        var error = output.error;
        for (var _i = 0, _a = output.candidates; _i < _a.length; _i++) {
            var candidate = _a[_i];
            if (candidate.nextToken === undefined) {
                filtered.push(candidate);
            }
            else {
                error = ParserInterface.betterError(error, {
                    kind: 'Error',
                    pos: candidate.nextToken === undefined ? undefined : candidate.nextToken.pos,
                    message: "The parser cannot reach the end of file, stops at \"" + candidate.nextToken.text + "\" at position " + JSON.stringify(candidate.nextToken.pos) + "."
                });
            }
        }
        return ParserInterface.resultOrError(filtered, error, filtered.length !== 0);
    }
    exports.expectEOF = expectEOF;
    function expectSingleResult(output) {
        if (!output.successful) {
            throw new Lexer.TokenError(output.error.pos, output.error.message);
        }
        if (output.candidates.length === 0) {
            throw new Lexer.TokenError(undefined, 'No result is returned.');
        }
        if (output.candidates.length !== 1) {
            throw new Lexer.TokenError(undefined, 'Multiple results are returned.');
        }
        return output.candidates[0].result;
    }
    exports.expectSingleResult = expectSingleResult;

    });

    var lib = createCommonjsModule(function (module, exports) {
    // Copyright (c) Microsoft Corporation.
    // Licensed under the MIT license.
    var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(Lexer, exports);
    __exportStar(ParserInterface, exports);
    __exportStar(TokenParser, exports);
    __exportStar(SequencialParser, exports);
    __exportStar(AlternativeParser, exports);
    __exportStar(OptionalParser, exports);
    __exportStar(RepeativeParser, exports);
    __exportStar(ApplyParser, exports);
    __exportStar(AmbiguousParser, exports);
    __exportStar(ErrorParser, exports);
    __exportStar(Rule, exports);

    });

    var K;
    (function (K) {
        K[K["If"] = 0] = "If";
        K[K["Each"] = 1] = "Each";
        K[K["From"] = 2] = "From";
        K[K["To"] = 3] = "To";
        K[K["End"] = 4] = "End";
        K[K["Comment"] = 5] = "Comment";
        K[K["Number"] = 6] = "Number";
        K[K["Op1"] = 7] = "Op1";
        K[K["Op2"] = 8] = "Op2";
        K[K["Assign"] = 9] = "Assign";
        K[K["Comma"] = 10] = "Comma";
        K[K["Col"] = 11] = "Col";
        K[K["LP"] = 12] = "LP";
        K[K["RP"] = 13] = "RP";
        K[K["WS"] = 14] = "WS";
        K[K["Name"] = 15] = "Name";
    })(K || (K = {}));
    const KW_ENGLISH = {
        If: 'if',
        Each: 'each',
        From: 'from',
        To: 'to',
        End: 'end',
    };
    const KW_HEBREW = {
        If: 'אם',
        Each: 'לכל',
        From: 'מ',
        To: 'עד',
        End: 'סוף',
    };
    function getLexer(keepWs = false, KW = KW_ENGLISH) {
        return lib.buildLexer([
            [keepWs, /^\s+/g, K.WS],
            [true, /^#[^\n]*/g, K.Comment],
            [true, new RegExp(`^${KW.If}`, 'g'), K.If],
            [true, new RegExp(`^${KW.Each}`, 'g'), K.Each],
            [true, new RegExp(`^${KW.From}`, 'g'), K.From],
            [true, new RegExp(`^${KW.To}`, 'g'), K.To],
            [true, new RegExp(`^${KW.End}`, 'g'), K.End],
            [true, /^\d+/g, K.Number],
            [true, /^=/g, K.Assign],
            [true, /^[*/%]/g, K.Op1],
            [true, /^[-+]/g, K.Op2],
            [true, /^,/g, K.Comma],
            [true, /^:/g, K.Col],
            [true, /^\(/g, K.LP],
            [true, /^\)/g, K.RP],
            [true, /^[a-z_א-ת]+/g, K.Name],
        ]);
    }
    const ops = {
        '-': (a, b) => a - b,
        '+': (a, b) => a + b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '%': (a, b) => a % b,
    };
    function parse(input, { lexer = getLexer(), host = { vars: {}, funcs: {} } } = {}) {
        function n(num) {
            return +num.text;
        }
        function expVar(name) {
            const v = name.text;
            if (!(v in host.vars)) {
                host.vars[v] = 0;
            }
            return {
                eval: () => host.vars[v]
            };
        }
        function expNum(num) {
            return {
                eval: () => n(num)
            };
        }
        function expOp(first, tail) {
            return {
                eval: () => ops[tail[0].text](first.eval(), tail[1].eval())
            };
        }
        function expFuncCall(value) {
            const [name, args] = value;
            if (!(name.text in host.funcs)) {
                host.funcs[name.text] = (...args) => 0;
            }
            return {
                eval: () => {
                    const vals = args.map(x => x.eval());
                    return host.funcs[name.text](...vals);
                }
            };
        }
        function args(args, arg) {
            args.push(arg[1]);
            return args;
        }
        const ARGS = lib.rule();
        const TERM = lib.rule();
        const FACTOR = lib.rule();
        const EXP = lib.rule();
        const FUNC_CALL = lib.rule();
        const ASSIGN = lib.rule();
        const EACH = lib.rule();
        const IF = lib.rule();
        const COMMENT = lib.rule();
        const STMT = lib.rule();
        const PROG = lib.rule();
        ARGS.setPattern(lib.alt(lib.apply(lib.seq(lib.tok(K.LP), lib.tok(K.RP)), () => []), lib.kmid(lib.tok(K.LP), lib.lrec_sc(lib.apply(EXP, e => [e]), lib.seq(lib.tok(K.Comma), EXP), args), lib.tok(K.RP))));
        TERM.setPattern(lib.alt(lib.apply(lib.tok(K.Name), expVar), lib.apply(lib.tok(K.Number), expNum), lib.kmid(lib.tok(K.LP), EXP, lib.tok(K.RP))));
        FACTOR.setPattern(lib.lrec_sc(TERM, lib.seq(lib.tok(K.Op1), TERM), expOp));
        EXP.setPattern(lib.alt(lib.lrec_sc(FACTOR, lib.seq(lib.tok(K.Op2), FACTOR), expOp), FUNC_CALL));
        FUNC_CALL.setPattern(lib.apply(lib.seq(lib.tok(K.Name), ARGS), expFuncCall));
        function expEach(value) {
            const [$1, name, $2, fromExp, $3, toExp, $4, prog, $5] = value;
            return {
                eval: () => {
                    for (let i = fromExp.eval(); i <= toExp.eval(); i++) {
                        host.vars[name.text] = i;
                        prog.forEach(s => s.eval());
                    }
                    return 0;
                }
            };
        }
        EACH.setPattern(lib.apply(lib.seq(lib.tok(K.Each), lib.tok(K.Name), lib.tok(K.From), EXP, lib.tok(K.To), EXP, lib.tok(K.Col), PROG, lib.tok(K.End)), expEach));
        function expIf(value) {
            const [$1, cond, $2, prog, $3] = value;
            return {
                eval: () => {
                    const v = cond.eval();
                    if (v) {
                        prog.forEach(s => s.eval());
                    }
                    return v;
                }
            };
        }
        IF.setPattern(lib.apply(lib.seq(lib.tok(K.If), EXP, lib.tok(K.Col), PROG, lib.tok(K.End)), expIf));
        function expAssign(value) {
            const [name, _, exp] = value;
            return {
                eval: () => {
                    return host.vars[name.text] = exp.eval();
                }
            };
        }
        ASSIGN.setPattern(lib.apply(lib.seq(lib.tok(K.Name), lib.tok(K.Assign), EXP), expAssign));
        COMMENT.setPattern(lib.apply(lib.tok(K.Comment), () => { return { eval: () => 0 }; }));
        STMT.setPattern(lib.alt(ASSIGN, FUNC_CALL, EACH, IF, COMMENT));
        PROG.setPattern(lib.rep_sc(STMT));
        return lib.expectSingleResult(lib.expectEOF(PROG.parse(lexer.parse(input))));
    }

    /* src/App.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (84:2) {#each [...Array(16).keys()] as i}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*i*/ ctx[1] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "data-color", /*i*/ ctx[1]);
    			attr_dev(div, "class", "svelte-oz9st5");
    			add_location(div, file, 84, 3, 2405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:2) {#each [...Array(16).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let board_1;
    	let t1;
    	let div2;
    	let current;

    	board_1 = new Board({
    			props: { board: /*board*/ ctx[0] },
    			$$inline: true
    		});

    	let each_value = [...Array(16).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			create_component(board_1.$$.fragment);
    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "id", "editor");
    			attr_dev(div0, "class", "svelte-oz9st5");
    			add_location(div0, file, 79, 2, 2295);
    			attr_dev(div1, "class", "edit svelte-oz9st5");
    			add_location(div1, file, 78, 1, 2274);
    			attr_dev(div2, "class", "colors svelte-oz9st5");
    			add_location(div2, file, 82, 1, 2344);
    			attr_dev(main, "dir", "rtl");
    			attr_dev(main, "class", "svelte-oz9st5");
    			add_location(main, file, 77, 0, 2256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			mount_component(board_1, div1, null);
    			append_dev(main, t1);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const board_1_changes = {};
    			if (dirty & /*board*/ 1) board_1_changes.board = /*board*/ ctx[0];
    			board_1.$set(board_1_changes);

    			if (dirty & /*Array*/ 0) {
    				each_value = [...Array(16).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(board_1);
    			destroy_each(each_blocks, detaching);
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

    const n = 16;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const board = Array.from(Array(n), () => new Array(n));

    	addEventListener("DOMContentLoaded", () => {
    		const editor = document.getElementById("editor");
    		const lexer = getLexer(true, KW_HEBREW);

    		function sleep(ms) {
    			
    		}

    		function color(i, j, v) {
    			console.log(i, j, v);

    			if (0 <= i && i < n && 0 <= j && j < n) {
    				$$invalidate(0, board[i][j] = v, board);
    			}

    			return 0;
    		}

    		function token(text, kind) {
    			if (kind === K.WS) {
    				return document.createTextNode(text);
    			} else {
    				const e = document.createElement("t");
    				e.innerText = text;
    				const isKw = kind in [K.If, K.Each, K.From, K.To, K.End];
    				e.setAttribute("kw", isKw ? "true" : "false");
    				e.setAttribute("comment", kind === K.Comment ? "true" : "false");
    				return e;
    			}
    		}

    		const highlight = editor => {
    			const code = editor.textContent;
    			const div = document.createElement("div");
    			let tokens = lexer.parse(code);
    			console.log(tokens);

    			while (tokens) {
    				div.appendChild(token(tokens.text, tokens.kind));
    				tokens = tokens.next;
    			}

    			console.log(div);
    			editor.innerHTML = div.innerHTML;
    		};

    		const jar = CodeJar(editor, highlight, { tab: "  ", indentOn: /.*:$/ });

    		function exec(code) {
    			console.log("executing", code);
    			board.forEach(row => row.fill(0));

    			const host = {
    				vars: {},
    				funcs: { sleep, color, צבע: color, נמנם: sleep }
    			};

    			const prog = parse(code, { host, lexer: getLexer(false, KW_HEBREW) });
    			prog.forEach(s => s.eval());
    		}

    		jar.onUpdate(exec);

    		const code = `# דוגמה לשימוש בפונקציה צבע
		
לכל שורה מ 0 עד 15:
  לכל עמודה מ 0 עד 15:
    צבע(שורה, עמודה, (שורה + עמודה) % 2)
  סוף
סוף`;

    		jar.updateCode(code);
    		exec(code);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		CodeJar,
    		Board,
    		getLexer,
    		K,
    		KW_HEBREW,
    		parse,
    		n,
    		board
    	});

    	return [board];
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

})();
//# sourceMappingURL=bundle.js.map
