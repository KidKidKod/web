
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
            e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
                if (k !== 'default' && !(k in n)) {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        });
        return Object.freeze(n);
    }

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
    function insert$1(target, node, anchor) {
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
        insert$1(target, node, anchor);
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
    			attr_dev(div, "class", "cell svelte-l3j5n5");
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
    			attr_dev(div0, "class", "num svelte-l3j5n5");
    			add_location(div0, file$1, 10, 12, 265);
    			attr_dev(div1, "class", "row svelte-l3j5n5");
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
    			attr_dev(div, "class", "num svelte-l3j5n5");
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

    			attr_dev(div0, "class", "row svelte-l3j5n5");
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

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

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
        K[K["Compare"] = 16] = "Compare";
        K[K["And"] = 17] = "And";
        K[K["Or"] = 18] = "Or";
    })(K || (K = {}));
    const KW_ENGLISH = {
        If: 'if',
        Each: 'each',
        From: 'from',
        To: 'to',
        End: 'end',
        And: 'and',
        Or: 'or',
    };
    const KW_HEBREW = {
        If: 'אם',
        Each: 'לכל',
        From: 'מ',
        To: 'עד',
        End: 'סוף',
        And: 'וגם',
        Or: 'או',
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
            [true, new RegExp(`^${KW.And}`, 'g'), K.And],
            [true, new RegExp(`^${KW.Or}`, 'g'), K.Or],
            [true, /^\d+/g, K.Number],
            [true, /^[<>]/g, K.Compare],
            [true, /^==/g, K.Compare],
            [true, /^>=/g, K.Compare],
            [true, /^<=/g, K.Compare],
            [true, /^=/g, K.Assign],
            [true, /^[*/%]/g, K.Op1],
            [true, /^[-+]/g, K.Op2],
            [true, /^,/g, K.Comma],
            [true, /^:/g, K.Col],
            [true, /^\(/g, K.LP],
            [true, /^\)/g, K.RP],
            [true, /^[a-zא-ת][a-z_א-ת0-9]*/g, K.Name],
        ]);
    }
    const ops = {
        '-': (a, b) => a - b,
        '+': (a, b) => a + b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '%': (a, b) => a % b,
    };
    function parse$1(input, { lexer = getLexer(), host = { vars: {}, funcs: {} } } = {}) {
        function n(num) {
            return +num.text;
        }
        function expVar(name) {
            return {
                eval: () => {
                    const v = name.text;
                    if (!(v in host.vars)) {
                        host.vars[v] = 0;
                    }
                    return host.vars[v];
                }
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
            return {
                eval: () => {
                    const [name, args] = value;
                    if (!(name.text in host.funcs)) {
                        host.funcs[name.text] = (...args) => 0;
                    }
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
        const COMPARE = lib.rule();
        const AND = lib.rule();
        const BOOL = lib.rule();
        const FUNC_CALL = lib.rule();
        const ASSIGN = lib.rule();
        const EACH = lib.rule();
        const IF = lib.rule();
        const COMMENT = lib.rule();
        const STMT = lib.rule();
        const PROG = lib.rule();
        ARGS.setPattern(lib.alt(lib.apply(lib.seq(lib.tok(K.LP), lib.tok(K.RP)), () => []), lib.kmid(lib.tok(K.LP), lib.lrec_sc(lib.apply(EXP, e => [e]), lib.seq(lib.tok(K.Comma), EXP), args), lib.tok(K.RP))));
        const compare = {
            '<': (a, b) => a < b,
            '>': (a, b) => a > b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '==': (a, b) => a === b,
        };
        function expCompare(value) {
            const [e1, c, e2] = value;
            return {
                eval: () => compare[c.text](e1.eval(), e2.eval())
            };
        }
        COMPARE.setPattern(lib.alt(EXP, lib.apply(lib.seq(EXP, lib.tok(K.Compare), EXP), expCompare)));
        function expAnd(e1, second) {
            const [_, e2] = second;
            return {
                eval: () => e1.eval() && e2.eval()
            };
        }
        AND.setPattern(lib.lrec_sc(COMPARE, lib.seq(lib.tok(K.And), COMPARE), expAnd));
        function expBool(e1, second) {
            const [_, e2] = second;
            return {
                eval: () => e1.eval() || e2.eval()
            };
        }
        BOOL.setPattern(lib.lrec_sc(AND, lib.seq(lib.tok(K.Or), AND), expBool));
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
        IF.setPattern(lib.apply(lib.seq(lib.tok(K.If), BOOL, lib.tok(K.Col), PROG, lib.tok(K.End)), expIf));
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

    function getUserAgent() {
        if (typeof navigator === "object" && "userAgent" in navigator) {
            return navigator.userAgent;
        }
        if (typeof process === "object" && "version" in process) {
            return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
        }
        return "<environment undetectable>";
    }

    var distWeb$a = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getUserAgent: getUserAgent
    });

    var register_1 = register;

    function register(state, name, method, options) {
      if (typeof method !== "function") {
        throw new Error("method for before hook must be a function");
      }

      if (!options) {
        options = {};
      }

      if (Array.isArray(name)) {
        return name.reverse().reduce(function (callback, name) {
          return register.bind(null, state, name, callback, options);
        }, method)();
      }

      return Promise.resolve().then(function () {
        if (!state.registry[name]) {
          return method(options);
        }

        return state.registry[name].reduce(function (method, registered) {
          return registered.hook.bind(null, method, options);
        }, method)();
      });
    }

    var add = addHook;

    function addHook(state, kind, name, hook) {
      var orig = hook;
      if (!state.registry[name]) {
        state.registry[name] = [];
      }

      if (kind === "before") {
        hook = function (method, options) {
          return Promise.resolve()
            .then(orig.bind(null, options))
            .then(method.bind(null, options));
        };
      }

      if (kind === "after") {
        hook = function (method, options) {
          var result;
          return Promise.resolve()
            .then(method.bind(null, options))
            .then(function (result_) {
              result = result_;
              return orig(result, options);
            })
            .then(function () {
              return result;
            });
        };
      }

      if (kind === "error") {
        hook = function (method, options) {
          return Promise.resolve()
            .then(method.bind(null, options))
            .catch(function (error) {
              return orig(error, options);
            });
        };
      }

      state.registry[name].push({
        hook: hook,
        orig: orig,
      });
    }

    var remove = removeHook;

    function removeHook(state, name, method) {
      if (!state.registry[name]) {
        return;
      }

      var index = state.registry[name]
        .map(function (registered) {
          return registered.orig;
        })
        .indexOf(method);

      if (index === -1) {
        return;
      }

      state.registry[name].splice(index, 1);
    }

    // bind with array of arguments: https://stackoverflow.com/a/21792913
    var bind = Function.bind;
    var bindable = bind.bind(bind);

    function bindApi (hook, state, name) {
      var removeHookRef = bindable(remove, null).apply(null, name ? [state, name] : [state]);
      hook.api = { remove: removeHookRef };
      hook.remove = removeHookRef

      ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
        var args = name ? [state, kind, name] : [state, kind];
        hook[kind] = hook.api[kind] = bindable(add, null).apply(null, args);
      });
    }

    function HookSingular () {
      var singularHookName = 'h';
      var singularHookState = {
        registry: {}
      };
      var singularHook = register_1.bind(null, singularHookState, singularHookName);
      bindApi(singularHook, singularHookState, singularHookName);
      return singularHook
    }

    function HookCollection () {
      var state = {
        registry: {}
      };

      var hook = register_1.bind(null, state);
      bindApi(hook, state);

      return hook
    }

    var collectionHookDeprecationMessageDisplayed = false;
    function Hook () {
      if (!collectionHookDeprecationMessageDisplayed) {
        console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4');
        collectionHookDeprecationMessageDisplayed = true;
      }
      return HookCollection()
    }

    Hook.Singular = HookSingular.bind();
    Hook.Collection = HookCollection.bind();

    var beforeAfterHook = Hook;
    // expose constructors as a named property for TypeScript
    var Hook_1 = Hook;
    var Singular = Hook.Singular;
    var Collection = Hook.Collection;
    beforeAfterHook.Hook = Hook_1;
    beforeAfterHook.Singular = Singular;
    beforeAfterHook.Collection = Collection;

    /*!
     * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    function isObject(o) {
      return Object.prototype.toString.call(o) === '[object Object]';
    }

    function isPlainObject(o) {
      var ctor,prot;

      if (isObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (ctor === undefined) return true;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    }

    function lowercaseKeys(object) {
        if (!object) {
            return {};
        }
        return Object.keys(object).reduce((newObj, key) => {
            newObj[key.toLowerCase()] = object[key];
            return newObj;
        }, {});
    }

    function mergeDeep(defaults, options) {
        const result = Object.assign({}, defaults);
        Object.keys(options).forEach((key) => {
            if (isPlainObject(options[key])) {
                if (!(key in defaults))
                    Object.assign(result, { [key]: options[key] });
                else
                    result[key] = mergeDeep(defaults[key], options[key]);
            }
            else {
                Object.assign(result, { [key]: options[key] });
            }
        });
        return result;
    }

    function removeUndefinedProperties(obj) {
        for (const key in obj) {
            if (obj[key] === undefined) {
                delete obj[key];
            }
        }
        return obj;
    }

    function merge(defaults, route, options) {
        if (typeof route === "string") {
            let [method, url] = route.split(" ");
            options = Object.assign(url ? { method, url } : { url: method }, options);
        }
        else {
            options = Object.assign({}, route);
        }
        // lowercase header names before merging with defaults to avoid duplicates
        options.headers = lowercaseKeys(options.headers);
        // remove properties with undefined values before merging
        removeUndefinedProperties(options);
        removeUndefinedProperties(options.headers);
        const mergedOptions = mergeDeep(defaults || {}, options);
        // mediaType.previews arrays are merged, instead of overwritten
        if (defaults && defaults.mediaType.previews.length) {
            mergedOptions.mediaType.previews = defaults.mediaType.previews
                .filter((preview) => !mergedOptions.mediaType.previews.includes(preview))
                .concat(mergedOptions.mediaType.previews);
        }
        mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map((preview) => preview.replace(/-preview/, ""));
        return mergedOptions;
    }

    function addQueryParameters(url, parameters) {
        const separator = /\?/.test(url) ? "&" : "?";
        const names = Object.keys(parameters);
        if (names.length === 0) {
            return url;
        }
        return (url +
            separator +
            names
                .map((name) => {
                if (name === "q") {
                    return ("q=" + parameters.q.split("+").map(encodeURIComponent).join("+"));
                }
                return `${name}=${encodeURIComponent(parameters[name])}`;
            })
                .join("&"));
    }

    const urlVariableRegex = /\{[^}]+\}/g;
    function removeNonChars(variableName) {
        return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
    }
    function extractUrlVariableNames(url) {
        const matches = url.match(urlVariableRegex);
        if (!matches) {
            return [];
        }
        return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
    }

    function omit(object, keysToOmit) {
        return Object.keys(object)
            .filter((option) => !keysToOmit.includes(option))
            .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
        }, {});
    }

    // Based on https://github.com/bramstein/url-template, licensed under BSD
    // TODO: create separate package.
    //
    // Copyright (c) 2012-2014, Bram Stein
    // All rights reserved.
    // Redistribution and use in source and binary forms, with or without
    // modification, are permitted provided that the following conditions
    // are met:
    //  1. Redistributions of source code must retain the above copyright
    //     notice, this list of conditions and the following disclaimer.
    //  2. Redistributions in binary form must reproduce the above copyright
    //     notice, this list of conditions and the following disclaimer in the
    //     documentation and/or other materials provided with the distribution.
    //  3. The name of the author may not be used to endorse or promote products
    //     derived from this software without specific prior written permission.
    // THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
    // WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
    // MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
    // EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
    // INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
    // BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
    // OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    // NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
    // EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    /* istanbul ignore file */
    function encodeReserved(str) {
        return str
            .split(/(%[0-9A-Fa-f]{2})/g)
            .map(function (part) {
            if (!/%[0-9A-Fa-f]/.test(part)) {
                part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
            }
            return part;
        })
            .join("");
    }
    function encodeUnreserved(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
    }
    function encodeValue(operator, value, key) {
        value =
            operator === "+" || operator === "#"
                ? encodeReserved(value)
                : encodeUnreserved(value);
        if (key) {
            return encodeUnreserved(key) + "=" + value;
        }
        else {
            return value;
        }
    }
    function isDefined(value) {
        return value !== undefined && value !== null;
    }
    function isKeyOperator(operator) {
        return operator === ";" || operator === "&" || operator === "?";
    }
    function getValues(context, operator, key, modifier) {
        var value = context[key], result = [];
        if (isDefined(value) && value !== "") {
            if (typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean") {
                value = value.toString();
                if (modifier && modifier !== "*") {
                    value = value.substring(0, parseInt(modifier, 10));
                }
                result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
            }
            else {
                if (modifier === "*") {
                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
                        });
                    }
                    else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                result.push(encodeValue(operator, value[k], k));
                            }
                        });
                    }
                }
                else {
                    const tmp = [];
                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            tmp.push(encodeValue(operator, value));
                        });
                    }
                    else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                tmp.push(encodeUnreserved(k));
                                tmp.push(encodeValue(operator, value[k].toString()));
                            }
                        });
                    }
                    if (isKeyOperator(operator)) {
                        result.push(encodeUnreserved(key) + "=" + tmp.join(","));
                    }
                    else if (tmp.length !== 0) {
                        result.push(tmp.join(","));
                    }
                }
            }
        }
        else {
            if (operator === ";") {
                if (isDefined(value)) {
                    result.push(encodeUnreserved(key));
                }
            }
            else if (value === "" && (operator === "&" || operator === "?")) {
                result.push(encodeUnreserved(key) + "=");
            }
            else if (value === "") {
                result.push("");
            }
        }
        return result;
    }
    function parseUrl(template) {
        return {
            expand: expand.bind(null, template),
        };
    }
    function expand(template, context) {
        var operators = ["+", "#", ".", "/", ";", "?", "&"];
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
            if (expression) {
                let operator = "";
                const values = [];
                if (operators.indexOf(expression.charAt(0)) !== -1) {
                    operator = expression.charAt(0);
                    expression = expression.substr(1);
                }
                expression.split(/,/g).forEach(function (variable) {
                    var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                    values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                });
                if (operator && operator !== "+") {
                    var separator = ",";
                    if (operator === "?") {
                        separator = "&";
                    }
                    else if (operator !== "#") {
                        separator = operator;
                    }
                    return (values.length !== 0 ? operator : "") + values.join(separator);
                }
                else {
                    return values.join(",");
                }
            }
            else {
                return encodeReserved(literal);
            }
        });
    }

    function parse(options) {
        // https://fetch.spec.whatwg.org/#methods
        let method = options.method.toUpperCase();
        // replace :varname with {varname} to make it RFC 6570 compatible
        let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
        let headers = Object.assign({}, options.headers);
        let body;
        let parameters = omit(options, [
            "method",
            "baseUrl",
            "url",
            "headers",
            "request",
            "mediaType",
        ]);
        // extract variable names from URL to calculate remaining variables later
        const urlVariableNames = extractUrlVariableNames(url);
        url = parseUrl(url).expand(parameters);
        if (!/^http/.test(url)) {
            url = options.baseUrl + url;
        }
        const omittedParameters = Object.keys(options)
            .filter((option) => urlVariableNames.includes(option))
            .concat("baseUrl");
        const remainingParameters = omit(parameters, omittedParameters);
        const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
        if (!isBinaryRequest) {
            if (options.mediaType.format) {
                // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
                headers.accept = headers.accept
                    .split(/,/)
                    .map((preview) => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`))
                    .join(",");
            }
            if (options.mediaType.previews.length) {
                const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
                headers.accept = previewsFromAcceptHeader
                    .concat(options.mediaType.previews)
                    .map((preview) => {
                    const format = options.mediaType.format
                        ? `.${options.mediaType.format}`
                        : "+json";
                    return `application/vnd.github.${preview}-preview${format}`;
                })
                    .join(",");
            }
        }
        // for GET/HEAD requests, set URL query parameters from remaining parameters
        // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters
        if (["GET", "HEAD"].includes(method)) {
            url = addQueryParameters(url, remainingParameters);
        }
        else {
            if ("data" in remainingParameters) {
                body = remainingParameters.data;
            }
            else {
                if (Object.keys(remainingParameters).length) {
                    body = remainingParameters;
                }
                else {
                    headers["content-length"] = 0;
                }
            }
        }
        // default content-type for JSON if body is set
        if (!headers["content-type"] && typeof body !== "undefined") {
            headers["content-type"] = "application/json; charset=utf-8";
        }
        // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
        // fetch does not allow to set `content-length` header, but we can set body to an empty string
        if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
            body = "";
        }
        // Only return body/request keys if present
        return Object.assign({ method, url, headers }, typeof body !== "undefined" ? { body } : null, options.request ? { request: options.request } : null);
    }

    function endpointWithDefaults(defaults, route, options) {
        return parse(merge(defaults, route, options));
    }

    function withDefaults$2(oldDefaults, newDefaults) {
        const DEFAULTS = merge(oldDefaults, newDefaults);
        const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
        return Object.assign(endpoint, {
            DEFAULTS,
            defaults: withDefaults$2.bind(null, DEFAULTS),
            merge: merge.bind(null, DEFAULTS),
            parse,
        });
    }

    const VERSION$e = "6.0.12";

    const userAgent = `octokit-endpoint.js/${VERSION$e} ${getUserAgent()}`;
    // DEFAULTS has all properties set that EndpointOptions has, except url.
    // So we use RequestParameters and add method as additional required property.
    const DEFAULTS = {
        method: "GET",
        baseUrl: "https://api.github.com",
        headers: {
            accept: "application/vnd.github.v3+json",
            "user-agent": userAgent,
        },
        mediaType: {
            format: "",
            previews: [],
        },
    };

    const endpoint = withDefaults$2(null, DEFAULTS);

    var browser = createCommonjsModule(function (module, exports) {

    // ref: https://github.com/tc39/proposal-global
    var getGlobal = function () {
    	// the only reliable means to get the global object is
    	// `Function('return this')()`
    	// However, this causes CSP violations in Chrome apps.
    	if (typeof self !== 'undefined') { return self; }
    	if (typeof window !== 'undefined') { return window; }
    	if (typeof global !== 'undefined') { return global; }
    	throw new Error('unable to locate global object');
    };

    var global = getGlobal();

    module.exports = exports = global.fetch;

    // Needed for TypeScript and Webpack.
    if (global.fetch) {
    	exports.default = global.fetch.bind(global);
    }

    exports.Headers = global.Headers;
    exports.Request = global.Request;
    exports.Response = global.Response;
    });

    class Deprecation extends Error {
      constructor(message) {
        super(message); // Maintains proper stack trace (only available on V8)

        /* istanbul ignore next */

        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }

        this.name = 'Deprecation';
      }

    }

    // Returns a wrapper function that returns a wrapped callback
    // The wrapper function should do some stuff, and return a
    // presumably different callback function.
    // This makes sure that own properties are retained, so that
    // decorations and such are not lost along the way.
    var wrappy_1 = wrappy;
    function wrappy (fn, cb) {
      if (fn && cb) return wrappy(fn)(cb)

      if (typeof fn !== 'function')
        throw new TypeError('need wrapper function')

      Object.keys(fn).forEach(function (k) {
        wrapper[k] = fn[k];
      });

      return wrapper

      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb = args[args.length-1];
        if (typeof ret === 'function' && ret !== cb) {
          Object.keys(cb).forEach(function (k) {
            ret[k] = cb[k];
          });
        }
        return ret
      }
    }

    var once_1 = wrappy_1(once);
    var strict = wrappy_1(onceStrict);

    once.proto = once(function () {
      Object.defineProperty(Function.prototype, 'once', {
        value: function () {
          return once(this)
        },
        configurable: true
      });

      Object.defineProperty(Function.prototype, 'onceStrict', {
        value: function () {
          return onceStrict(this)
        },
        configurable: true
      });
    });

    function once (fn) {
      var f = function () {
        if (f.called) return f.value
        f.called = true;
        return f.value = fn.apply(this, arguments)
      };
      f.called = false;
      return f
    }

    function onceStrict (fn) {
      var f = function () {
        if (f.called)
          throw new Error(f.onceError)
        f.called = true;
        return f.value = fn.apply(this, arguments)
      };
      var name = fn.name || 'Function wrapped with `once`';
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f
    }
    once_1.strict = strict;

    const logOnceCode = once_1((deprecation) => console.warn(deprecation));
    const logOnceHeaders = once_1((deprecation) => console.warn(deprecation));
    /**
     * Error with extra properties to help with debugging
     */
    class RequestError extends Error {
        constructor(message, statusCode, options) {
            super(message);
            // Maintains proper stack trace (only available on V8)
            /* istanbul ignore next */
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
            this.name = "HttpError";
            this.status = statusCode;
            let headers;
            if ("headers" in options && typeof options.headers !== "undefined") {
                headers = options.headers;
            }
            if ("response" in options) {
                this.response = options.response;
                headers = options.response.headers;
            }
            // redact request credentials without mutating original request options
            const requestCopy = Object.assign({}, options.request);
            if (options.request.headers.authorization) {
                requestCopy.headers = Object.assign({}, options.request.headers, {
                    authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]"),
                });
            }
            requestCopy.url = requestCopy.url
                // client_id & client_secret can be passed as URL query parameters to increase rate limit
                // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
                .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
                // OAuth tokens can be passed as URL query parameters, although it is not recommended
                // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
                .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
            this.request = requestCopy;
            // deprecations
            Object.defineProperty(this, "code", {
                get() {
                    logOnceCode(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
                    return statusCode;
                },
            });
            Object.defineProperty(this, "headers", {
                get() {
                    logOnceHeaders(new Deprecation("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."));
                    return headers || {};
                },
            });
        }
    }

    var distWeb$9 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        RequestError: RequestError
    });

    const VERSION$d = "5.6.2";

    function getBufferResponse(response) {
        return response.arrayBuffer();
    }

    function fetchWrapper(requestOptions) {
        const log = requestOptions.request && requestOptions.request.log
            ? requestOptions.request.log
            : console;
        if (isPlainObject(requestOptions.body) ||
            Array.isArray(requestOptions.body)) {
            requestOptions.body = JSON.stringify(requestOptions.body);
        }
        let headers = {};
        let status;
        let url;
        const fetch = (requestOptions.request && requestOptions.request.fetch) || browser;
        return fetch(requestOptions.url, Object.assign({
            method: requestOptions.method,
            body: requestOptions.body,
            headers: requestOptions.headers,
            redirect: requestOptions.redirect,
        }, 
        // `requestOptions.request.agent` type is incompatible
        // see https://github.com/octokit/types.ts/pull/264
        requestOptions.request))
            .then(async (response) => {
            url = response.url;
            status = response.status;
            for (const keyAndValue of response.headers) {
                headers[keyAndValue[0]] = keyAndValue[1];
            }
            if ("deprecation" in headers) {
                const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
                const deprecationLink = matches && matches.pop();
                log.warn(`[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${headers.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`);
            }
            if (status === 204 || status === 205) {
                return;
            }
            // GitHub API returns 200 for HEAD requests
            if (requestOptions.method === "HEAD") {
                if (status < 400) {
                    return;
                }
                throw new RequestError(response.statusText, status, {
                    response: {
                        url,
                        status,
                        headers,
                        data: undefined,
                    },
                    request: requestOptions,
                });
            }
            if (status === 304) {
                throw new RequestError("Not modified", status, {
                    response: {
                        url,
                        status,
                        headers,
                        data: await getResponseData(response),
                    },
                    request: requestOptions,
                });
            }
            if (status >= 400) {
                const data = await getResponseData(response);
                const error = new RequestError(toErrorMessage(data), status, {
                    response: {
                        url,
                        status,
                        headers,
                        data,
                    },
                    request: requestOptions,
                });
                throw error;
            }
            return getResponseData(response);
        })
            .then((data) => {
            return {
                status,
                url,
                headers,
                data,
            };
        })
            .catch((error) => {
            if (error instanceof RequestError)
                throw error;
            throw new RequestError(error.message, 500, {
                request: requestOptions,
            });
        });
    }
    async function getResponseData(response) {
        const contentType = response.headers.get("content-type");
        if (/application\/json/.test(contentType)) {
            return response.json();
        }
        if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
            return response.text();
        }
        return getBufferResponse(response);
    }
    function toErrorMessage(data) {
        if (typeof data === "string")
            return data;
        // istanbul ignore else - just in case
        if ("message" in data) {
            if (Array.isArray(data.errors)) {
                return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
            }
            return data.message;
        }
        // istanbul ignore next - just in case
        return `Unknown error: ${JSON.stringify(data)}`;
    }

    function withDefaults$1(oldEndpoint, newDefaults) {
        const endpoint = oldEndpoint.defaults(newDefaults);
        const newApi = function (route, parameters) {
            const endpointOptions = endpoint.merge(route, parameters);
            if (!endpointOptions.request || !endpointOptions.request.hook) {
                return fetchWrapper(endpoint.parse(endpointOptions));
            }
            const request = (route, parameters) => {
                return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
            };
            Object.assign(request, {
                endpoint,
                defaults: withDefaults$1.bind(null, endpoint),
            });
            return endpointOptions.request.hook(request, endpointOptions);
        };
        return Object.assign(newApi, {
            endpoint,
            defaults: withDefaults$1.bind(null, endpoint),
        });
    }

    const request$1 = withDefaults$1(endpoint, {
        headers: {
            "user-agent": `octokit-request.js/${VERSION$d} ${getUserAgent()}`,
        },
    });

    var distWeb$8 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        request: request$1
    });

    const VERSION$c = "4.8.0";

    function _buildMessageForResponseErrors(data) {
        return (`Request failed due to following response errors:\n` +
            data.errors.map((e) => ` - ${e.message}`).join("\n"));
    }
    class GraphqlResponseError extends Error {
        constructor(request, headers, response) {
            super(_buildMessageForResponseErrors(response));
            this.request = request;
            this.headers = headers;
            this.response = response;
            this.name = "GraphqlResponseError";
            // Expose the errors and response data in their shorthand properties.
            this.errors = response.errors;
            this.data = response.data;
            // Maintains proper stack trace (only available on V8)
            /* istanbul ignore next */
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }

    const NON_VARIABLE_OPTIONS = [
        "method",
        "baseUrl",
        "url",
        "headers",
        "request",
        "query",
        "mediaType",
    ];
    const FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
    const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
    function graphql(request, query, options) {
        if (options) {
            if (typeof query === "string" && "query" in options) {
                return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
            }
            for (const key in options) {
                if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
                    continue;
                return Promise.reject(new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
            }
        }
        const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
        const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
            if (NON_VARIABLE_OPTIONS.includes(key)) {
                result[key] = parsedOptions[key];
                return result;
            }
            if (!result.variables) {
                result.variables = {};
            }
            result.variables[key] = parsedOptions[key];
            return result;
        }, {});
        // workaround for GitHub Enterprise baseUrl set with /api/v3 suffix
        // https://github.com/octokit/auth-app.js/issues/111#issuecomment-657610451
        const baseUrl = parsedOptions.baseUrl || request.endpoint.DEFAULTS.baseUrl;
        if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
            requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
        }
        return request(requestOptions).then((response) => {
            if (response.data.errors) {
                const headers = {};
                for (const key of Object.keys(response.headers)) {
                    headers[key] = response.headers[key];
                }
                throw new GraphqlResponseError(requestOptions, headers, response.data);
            }
            return response.data.data;
        });
    }

    function withDefaults(request$1$1, newDefaults) {
        const newRequest = request$1$1.defaults(newDefaults);
        const newApi = (query, options) => {
            return graphql(newRequest, query, options);
        };
        return Object.assign(newApi, {
            defaults: withDefaults.bind(null, newRequest),
            endpoint: request$1.endpoint,
        });
    }

    withDefaults(request$1, {
        headers: {
            "user-agent": `octokit-graphql.js/${VERSION$c} ${getUserAgent()}`,
        },
        method: "POST",
        url: "/graphql",
    });
    function withCustomRequest(customRequest) {
        return withDefaults(customRequest, {
            method: "POST",
            url: "/graphql",
        });
    }

    const REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
    const REGEX_IS_INSTALLATION = /^ghs_/;
    const REGEX_IS_USER_TO_SERVER = /^ghu_/;
    async function auth$5(token) {
        const isApp = token.split(/\./).length === 3;
        const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) ||
            REGEX_IS_INSTALLATION.test(token);
        const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
        const tokenType = isApp
            ? "app"
            : isInstallation
                ? "installation"
                : isUserToServer
                    ? "user-to-server"
                    : "oauth";
        return {
            type: "token",
            token: token,
            tokenType,
        };
    }

    /**
     * Prefix token for usage in the Authorization header
     *
     * @param token OAuth token or JSON Web Token
     */
    function withAuthorizationPrefix(token) {
        if (token.split(/\./).length === 3) {
            return `bearer ${token}`;
        }
        return `token ${token}`;
    }

    async function hook$5(token, request, route, parameters) {
        const endpoint = request.endpoint.merge(route, parameters);
        endpoint.headers.authorization = withAuthorizationPrefix(token);
        return request(endpoint);
    }

    const createTokenAuth = function createTokenAuth(token) {
        if (!token) {
            throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
        }
        if (typeof token !== "string") {
            throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
        }
        token = token.replace(/^(token|bearer) +/i, "");
        return Object.assign(auth$5.bind(null, token), {
            hook: hook$5.bind(null, token),
        });
    };

    const VERSION$b = "3.5.1";

    class Octokit$1 {
        constructor(options = {}) {
            const hook = new Collection();
            const requestDefaults = {
                baseUrl: request$1.endpoint.DEFAULTS.baseUrl,
                headers: {},
                request: Object.assign({}, options.request, {
                    // @ts-ignore internal usage only, no need to type
                    hook: hook.bind(null, "request"),
                }),
                mediaType: {
                    previews: [],
                    format: "",
                },
            };
            // prepend default user agent with `options.userAgent` if set
            requestDefaults.headers["user-agent"] = [
                options.userAgent,
                `octokit-core.js/${VERSION$b} ${getUserAgent()}`,
            ]
                .filter(Boolean)
                .join(" ");
            if (options.baseUrl) {
                requestDefaults.baseUrl = options.baseUrl;
            }
            if (options.previews) {
                requestDefaults.mediaType.previews = options.previews;
            }
            if (options.timeZone) {
                requestDefaults.headers["time-zone"] = options.timeZone;
            }
            this.request = request$1.defaults(requestDefaults);
            this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
            this.log = Object.assign({
                debug: () => { },
                info: () => { },
                warn: console.warn.bind(console),
                error: console.error.bind(console),
            }, options.log);
            this.hook = hook;
            // (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
            //     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registered.
            // (2) If only `options.auth` is set, use the default token authentication strategy.
            // (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
            // TODO: type `options.auth` based on `options.authStrategy`.
            if (!options.authStrategy) {
                if (!options.auth) {
                    // (1)
                    this.auth = async () => ({
                        type: "unauthenticated",
                    });
                }
                else {
                    // (2)
                    const auth = createTokenAuth(options.auth);
                    // @ts-ignore  ¯\_(ツ)_/¯
                    hook.wrap("request", auth.hook);
                    this.auth = auth;
                }
            }
            else {
                const { authStrategy, ...otherOptions } = options;
                const auth = authStrategy(Object.assign({
                    request: this.request,
                    log: this.log,
                    // we pass the current octokit instance as well as its constructor options
                    // to allow for authentication strategies that return a new octokit instance
                    // that shares the same internal state as the current one. The original
                    // requirement for this was the "event-octokit" authentication strategy
                    // of https://github.com/probot/octokit-auth-probot.
                    octokit: this,
                    octokitOptions: otherOptions,
                }, options.auth));
                // @ts-ignore  ¯\_(ツ)_/¯
                hook.wrap("request", auth.hook);
                this.auth = auth;
            }
            // apply plugins
            // https://stackoverflow.com/a/16345172
            const classConstructor = this.constructor;
            classConstructor.plugins.forEach((plugin) => {
                Object.assign(this, plugin(this, options));
            });
        }
        static defaults(defaults) {
            const OctokitWithDefaults = class extends this {
                constructor(...args) {
                    const options = args[0] || {};
                    if (typeof defaults === "function") {
                        super(defaults(options));
                        return;
                    }
                    super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent
                        ? {
                            userAgent: `${options.userAgent} ${defaults.userAgent}`,
                        }
                        : null));
                }
            };
            return OctokitWithDefaults;
        }
        /**
         * Attach a plugin (or many) to your Octokit instance.
         *
         * @example
         * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
         */
        static plugin(...newPlugins) {
            var _a;
            const currentPlugins = this.plugins;
            const NewOctokit = (_a = class extends this {
                },
                _a.plugins = currentPlugins.concat(newPlugins.filter((plugin) => !currentPlugins.includes(plugin))),
                _a);
            return NewOctokit;
        }
    }
    Octokit$1.VERSION = VERSION$b;
    Octokit$1.plugins = [];

    var distWeb$7 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Octokit: Octokit$1
    });

    const VERSION$a = "2.17.0";

    /**
     * Some “list” response that can be paginated have a different response structure
     *
     * They have a `total_count` key in the response (search also has `incomplete_results`,
     * /installation/repositories also has `repository_selection`), as well as a key with
     * the list of the items which name varies from endpoint to endpoint.
     *
     * Octokit normalizes these responses so that paginated results are always returned following
     * the same structure. One challenge is that if the list response has only one page, no Link
     * header is provided, so this header alone is not sufficient to check wether a response is
     * paginated or not.
     *
     * We check if a "total_count" key is present in the response data, but also make sure that
     * a "url" property is not, as the "Get the combined status for a specific ref" endpoint would
     * otherwise match: https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
     */
    function normalizePaginatedListResponse(response) {
        // endpoints can respond with 204 if repository is empty
        if (!response.data) {
            return {
                ...response,
                data: [],
            };
        }
        const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
        if (!responseNeedsNormalization)
            return response;
        // keep the additional properties intact as there is currently no other way
        // to retrieve the same information.
        const incompleteResults = response.data.incomplete_results;
        const repositorySelection = response.data.repository_selection;
        const totalCount = response.data.total_count;
        delete response.data.incomplete_results;
        delete response.data.repository_selection;
        delete response.data.total_count;
        const namespaceKey = Object.keys(response.data)[0];
        const data = response.data[namespaceKey];
        response.data = data;
        if (typeof incompleteResults !== "undefined") {
            response.data.incomplete_results = incompleteResults;
        }
        if (typeof repositorySelection !== "undefined") {
            response.data.repository_selection = repositorySelection;
        }
        response.data.total_count = totalCount;
        return response;
    }

    function iterator$1(octokit, route, parameters) {
        const options = typeof route === "function"
            ? route.endpoint(parameters)
            : octokit.request.endpoint(route, parameters);
        const requestMethod = typeof route === "function" ? route : octokit.request;
        const method = options.method;
        const headers = options.headers;
        let url = options.url;
        return {
            [Symbol.asyncIterator]: () => ({
                async next() {
                    if (!url)
                        return { done: true };
                    try {
                        const response = await requestMethod({ method, url, headers });
                        const normalizedResponse = normalizePaginatedListResponse(response);
                        // `response.headers.link` format:
                        // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
                        // sets `url` to undefined if "next" URL is not present or `link` header is not set
                        url = ((normalizedResponse.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
                        return { value: normalizedResponse };
                    }
                    catch (error) {
                        if (error.status !== 409)
                            throw error;
                        url = "";
                        return {
                            value: {
                                status: 200,
                                headers: {},
                                data: [],
                            },
                        };
                    }
                },
            }),
        };
    }

    function paginate(octokit, route, parameters, mapFn) {
        if (typeof parameters === "function") {
            mapFn = parameters;
            parameters = undefined;
        }
        return gather(octokit, [], iterator$1(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
    }
    function gather(octokit, results, iterator, mapFn) {
        return iterator.next().then((result) => {
            if (result.done) {
                return results;
            }
            let earlyExit = false;
            function done() {
                earlyExit = true;
            }
            results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);
            if (earlyExit) {
                return results;
            }
            return gather(octokit, results, iterator, mapFn);
        });
    }

    const composePaginateRest = Object.assign(paginate, {
        iterator: iterator$1,
    });

    const paginatingEndpoints = [
        "GET /app/hook/deliveries",
        "GET /app/installations",
        "GET /applications/grants",
        "GET /authorizations",
        "GET /enterprises/{enterprise}/actions/permissions/organizations",
        "GET /enterprises/{enterprise}/actions/runner-groups",
        "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations",
        "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners",
        "GET /enterprises/{enterprise}/actions/runners",
        "GET /enterprises/{enterprise}/actions/runners/downloads",
        "GET /events",
        "GET /gists",
        "GET /gists/public",
        "GET /gists/starred",
        "GET /gists/{gist_id}/comments",
        "GET /gists/{gist_id}/commits",
        "GET /gists/{gist_id}/forks",
        "GET /installation/repositories",
        "GET /issues",
        "GET /marketplace_listing/plans",
        "GET /marketplace_listing/plans/{plan_id}/accounts",
        "GET /marketplace_listing/stubbed/plans",
        "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts",
        "GET /networks/{owner}/{repo}/events",
        "GET /notifications",
        "GET /organizations",
        "GET /orgs/{org}/actions/permissions/repositories",
        "GET /orgs/{org}/actions/runner-groups",
        "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories",
        "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners",
        "GET /orgs/{org}/actions/runners",
        "GET /orgs/{org}/actions/runners/downloads",
        "GET /orgs/{org}/actions/secrets",
        "GET /orgs/{org}/actions/secrets/{secret_name}/repositories",
        "GET /orgs/{org}/blocks",
        "GET /orgs/{org}/credential-authorizations",
        "GET /orgs/{org}/events",
        "GET /orgs/{org}/failed_invitations",
        "GET /orgs/{org}/hooks",
        "GET /orgs/{org}/hooks/{hook_id}/deliveries",
        "GET /orgs/{org}/installations",
        "GET /orgs/{org}/invitations",
        "GET /orgs/{org}/invitations/{invitation_id}/teams",
        "GET /orgs/{org}/issues",
        "GET /orgs/{org}/members",
        "GET /orgs/{org}/migrations",
        "GET /orgs/{org}/migrations/{migration_id}/repositories",
        "GET /orgs/{org}/outside_collaborators",
        "GET /orgs/{org}/packages",
        "GET /orgs/{org}/projects",
        "GET /orgs/{org}/public_members",
        "GET /orgs/{org}/repos",
        "GET /orgs/{org}/secret-scanning/alerts",
        "GET /orgs/{org}/team-sync/groups",
        "GET /orgs/{org}/teams",
        "GET /orgs/{org}/teams/{team_slug}/discussions",
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
        "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
        "GET /orgs/{org}/teams/{team_slug}/invitations",
        "GET /orgs/{org}/teams/{team_slug}/members",
        "GET /orgs/{org}/teams/{team_slug}/projects",
        "GET /orgs/{org}/teams/{team_slug}/repos",
        "GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings",
        "GET /orgs/{org}/teams/{team_slug}/teams",
        "GET /projects/columns/{column_id}/cards",
        "GET /projects/{project_id}/collaborators",
        "GET /projects/{project_id}/columns",
        "GET /repos/{owner}/{repo}/actions/artifacts",
        "GET /repos/{owner}/{repo}/actions/runners",
        "GET /repos/{owner}/{repo}/actions/runners/downloads",
        "GET /repos/{owner}/{repo}/actions/runs",
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
        "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
        "GET /repos/{owner}/{repo}/actions/secrets",
        "GET /repos/{owner}/{repo}/actions/workflows",
        "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
        "GET /repos/{owner}/{repo}/assignees",
        "GET /repos/{owner}/{repo}/autolinks",
        "GET /repos/{owner}/{repo}/branches",
        "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations",
        "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs",
        "GET /repos/{owner}/{repo}/code-scanning/alerts",
        "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
        "GET /repos/{owner}/{repo}/code-scanning/analyses",
        "GET /repos/{owner}/{repo}/collaborators",
        "GET /repos/{owner}/{repo}/comments",
        "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions",
        "GET /repos/{owner}/{repo}/commits",
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head",
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
        "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
        "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
        "GET /repos/{owner}/{repo}/commits/{ref}/check-suites",
        "GET /repos/{owner}/{repo}/commits/{ref}/statuses",
        "GET /repos/{owner}/{repo}/contributors",
        "GET /repos/{owner}/{repo}/deployments",
        "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
        "GET /repos/{owner}/{repo}/events",
        "GET /repos/{owner}/{repo}/forks",
        "GET /repos/{owner}/{repo}/git/matching-refs/{ref}",
        "GET /repos/{owner}/{repo}/hooks",
        "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries",
        "GET /repos/{owner}/{repo}/invitations",
        "GET /repos/{owner}/{repo}/issues",
        "GET /repos/{owner}/{repo}/issues/comments",
        "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
        "GET /repos/{owner}/{repo}/issues/events",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions",
        "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
        "GET /repos/{owner}/{repo}/keys",
        "GET /repos/{owner}/{repo}/labels",
        "GET /repos/{owner}/{repo}/milestones",
        "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels",
        "GET /repos/{owner}/{repo}/notifications",
        "GET /repos/{owner}/{repo}/pages/builds",
        "GET /repos/{owner}/{repo}/projects",
        "GET /repos/{owner}/{repo}/pulls",
        "GET /repos/{owner}/{repo}/pulls/comments",
        "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
        "GET /repos/{owner}/{repo}/releases",
        "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
        "GET /repos/{owner}/{repo}/secret-scanning/alerts",
        "GET /repos/{owner}/{repo}/stargazers",
        "GET /repos/{owner}/{repo}/subscribers",
        "GET /repos/{owner}/{repo}/tags",
        "GET /repos/{owner}/{repo}/teams",
        "GET /repositories",
        "GET /repositories/{repository_id}/environments/{environment_name}/secrets",
        "GET /scim/v2/enterprises/{enterprise}/Groups",
        "GET /scim/v2/enterprises/{enterprise}/Users",
        "GET /scim/v2/organizations/{org}/Users",
        "GET /search/code",
        "GET /search/commits",
        "GET /search/issues",
        "GET /search/labels",
        "GET /search/repositories",
        "GET /search/topics",
        "GET /search/users",
        "GET /teams/{team_id}/discussions",
        "GET /teams/{team_id}/discussions/{discussion_number}/comments",
        "GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions",
        "GET /teams/{team_id}/discussions/{discussion_number}/reactions",
        "GET /teams/{team_id}/invitations",
        "GET /teams/{team_id}/members",
        "GET /teams/{team_id}/projects",
        "GET /teams/{team_id}/repos",
        "GET /teams/{team_id}/team-sync/group-mappings",
        "GET /teams/{team_id}/teams",
        "GET /user/blocks",
        "GET /user/emails",
        "GET /user/followers",
        "GET /user/following",
        "GET /user/gpg_keys",
        "GET /user/installations",
        "GET /user/installations/{installation_id}/repositories",
        "GET /user/issues",
        "GET /user/keys",
        "GET /user/marketplace_purchases",
        "GET /user/marketplace_purchases/stubbed",
        "GET /user/memberships/orgs",
        "GET /user/migrations",
        "GET /user/migrations/{migration_id}/repositories",
        "GET /user/orgs",
        "GET /user/packages",
        "GET /user/public_emails",
        "GET /user/repos",
        "GET /user/repository_invitations",
        "GET /user/starred",
        "GET /user/subscriptions",
        "GET /user/teams",
        "GET /users",
        "GET /users/{username}/events",
        "GET /users/{username}/events/orgs/{org}",
        "GET /users/{username}/events/public",
        "GET /users/{username}/followers",
        "GET /users/{username}/following",
        "GET /users/{username}/gists",
        "GET /users/{username}/gpg_keys",
        "GET /users/{username}/keys",
        "GET /users/{username}/orgs",
        "GET /users/{username}/packages",
        "GET /users/{username}/projects",
        "GET /users/{username}/received_events",
        "GET /users/{username}/received_events/public",
        "GET /users/{username}/repos",
        "GET /users/{username}/starred",
        "GET /users/{username}/subscriptions",
    ];

    function isPaginatingEndpoint(arg) {
        if (typeof arg === "string") {
            return paginatingEndpoints.includes(arg);
        }
        else {
            return false;
        }
    }

    /**
     * @param octokit Octokit instance
     * @param options Options passed to Octokit constructor
     */
    function paginateRest(octokit) {
        return {
            paginate: Object.assign(paginate.bind(null, octokit), {
                iterator: iterator$1.bind(null, octokit),
            }),
        };
    }
    paginateRest.VERSION = VERSION$a;

    var distWeb$6 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        composePaginateRest: composePaginateRest,
        isPaginatingEndpoint: isPaginatingEndpoint,
        paginateRest: paginateRest,
        paginatingEndpoints: paginatingEndpoints
    });

    const Endpoints = {
        actions: {
            addSelectedRepoToOrgSecret: [
                "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}",
            ],
            approveWorkflowRun: [
                "POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve",
            ],
            cancelWorkflowRun: [
                "POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel",
            ],
            createOrUpdateEnvironmentSecret: [
                "PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
            ],
            createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
            createOrUpdateRepoSecret: [
                "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
            ],
            createRegistrationTokenForOrg: [
                "POST /orgs/{org}/actions/runners/registration-token",
            ],
            createRegistrationTokenForRepo: [
                "POST /repos/{owner}/{repo}/actions/runners/registration-token",
            ],
            createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
            createRemoveTokenForRepo: [
                "POST /repos/{owner}/{repo}/actions/runners/remove-token",
            ],
            createWorkflowDispatch: [
                "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
            ],
            deleteArtifact: [
                "DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}",
            ],
            deleteEnvironmentSecret: [
                "DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
            ],
            deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
            deleteRepoSecret: [
                "DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}",
            ],
            deleteSelfHostedRunnerFromOrg: [
                "DELETE /orgs/{org}/actions/runners/{runner_id}",
            ],
            deleteSelfHostedRunnerFromRepo: [
                "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}",
            ],
            deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
            deleteWorkflowRunLogs: [
                "DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs",
            ],
            disableSelectedRepositoryGithubActionsOrganization: [
                "DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}",
            ],
            disableWorkflow: [
                "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable",
            ],
            downloadArtifact: [
                "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}",
            ],
            downloadJobLogsForWorkflowRun: [
                "GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs",
            ],
            downloadWorkflowRunAttemptLogs: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs",
            ],
            downloadWorkflowRunLogs: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs",
            ],
            enableSelectedRepositoryGithubActionsOrganization: [
                "PUT /orgs/{org}/actions/permissions/repositories/{repository_id}",
            ],
            enableWorkflow: [
                "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable",
            ],
            getAllowedActionsOrganization: [
                "GET /orgs/{org}/actions/permissions/selected-actions",
            ],
            getAllowedActionsRepository: [
                "GET /repos/{owner}/{repo}/actions/permissions/selected-actions",
            ],
            getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
            getEnvironmentPublicKey: [
                "GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key",
            ],
            getEnvironmentSecret: [
                "GET /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
            ],
            getGithubActionsPermissionsOrganization: [
                "GET /orgs/{org}/actions/permissions",
            ],
            getGithubActionsPermissionsRepository: [
                "GET /repos/{owner}/{repo}/actions/permissions",
            ],
            getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
            getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
            getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
            getPendingDeploymentsForRun: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments",
            ],
            getRepoPermissions: [
                "GET /repos/{owner}/{repo}/actions/permissions",
                {},
                { renamed: ["actions", "getGithubActionsPermissionsRepository"] },
            ],
            getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
            getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
            getReviewsForRun: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals",
            ],
            getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
            getSelfHostedRunnerForRepo: [
                "GET /repos/{owner}/{repo}/actions/runners/{runner_id}",
            ],
            getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
            getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
            getWorkflowRunAttempt: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}",
            ],
            getWorkflowRunUsage: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing",
            ],
            getWorkflowUsage: [
                "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing",
            ],
            listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
            listEnvironmentSecrets: [
                "GET /repositories/{repository_id}/environments/{environment_name}/secrets",
            ],
            listJobsForWorkflowRun: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
            ],
            listJobsForWorkflowRunAttempt: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
            ],
            listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
            listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
            listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
            listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
            listRunnerApplicationsForRepo: [
                "GET /repos/{owner}/{repo}/actions/runners/downloads",
            ],
            listSelectedReposForOrgSecret: [
                "GET /orgs/{org}/actions/secrets/{secret_name}/repositories",
            ],
            listSelectedRepositoriesEnabledGithubActionsOrganization: [
                "GET /orgs/{org}/actions/permissions/repositories",
            ],
            listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
            listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
            listWorkflowRunArtifacts: [
                "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
            ],
            listWorkflowRuns: [
                "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
            ],
            listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
            removeSelectedRepoFromOrgSecret: [
                "DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}",
            ],
            reviewPendingDeploymentsForRun: [
                "POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments",
            ],
            setAllowedActionsOrganization: [
                "PUT /orgs/{org}/actions/permissions/selected-actions",
            ],
            setAllowedActionsRepository: [
                "PUT /repos/{owner}/{repo}/actions/permissions/selected-actions",
            ],
            setGithubActionsPermissionsOrganization: [
                "PUT /orgs/{org}/actions/permissions",
            ],
            setGithubActionsPermissionsRepository: [
                "PUT /repos/{owner}/{repo}/actions/permissions",
            ],
            setSelectedReposForOrgSecret: [
                "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories",
            ],
            setSelectedRepositoriesEnabledGithubActionsOrganization: [
                "PUT /orgs/{org}/actions/permissions/repositories",
            ],
        },
        activity: {
            checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
            deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
            deleteThreadSubscription: [
                "DELETE /notifications/threads/{thread_id}/subscription",
            ],
            getFeeds: ["GET /feeds"],
            getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
            getThread: ["GET /notifications/threads/{thread_id}"],
            getThreadSubscriptionForAuthenticatedUser: [
                "GET /notifications/threads/{thread_id}/subscription",
            ],
            listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
            listNotificationsForAuthenticatedUser: ["GET /notifications"],
            listOrgEventsForAuthenticatedUser: [
                "GET /users/{username}/events/orgs/{org}",
            ],
            listPublicEvents: ["GET /events"],
            listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
            listPublicEventsForUser: ["GET /users/{username}/events/public"],
            listPublicOrgEvents: ["GET /orgs/{org}/events"],
            listReceivedEventsForUser: ["GET /users/{username}/received_events"],
            listReceivedPublicEventsForUser: [
                "GET /users/{username}/received_events/public",
            ],
            listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
            listRepoNotificationsForAuthenticatedUser: [
                "GET /repos/{owner}/{repo}/notifications",
            ],
            listReposStarredByAuthenticatedUser: ["GET /user/starred"],
            listReposStarredByUser: ["GET /users/{username}/starred"],
            listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
            listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
            listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
            listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
            markNotificationsAsRead: ["PUT /notifications"],
            markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
            markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
            setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
            setThreadSubscription: [
                "PUT /notifications/threads/{thread_id}/subscription",
            ],
            starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
            unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"],
        },
        apps: {
            addRepoToInstallation: [
                "PUT /user/installations/{installation_id}/repositories/{repository_id}",
                {},
                { renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] },
            ],
            addRepoToInstallationForAuthenticatedUser: [
                "PUT /user/installations/{installation_id}/repositories/{repository_id}",
            ],
            checkToken: ["POST /applications/{client_id}/token"],
            createContentAttachment: [
                "POST /content_references/{content_reference_id}/attachments",
                { mediaType: { previews: ["corsair"] } },
            ],
            createContentAttachmentForRepo: [
                "POST /repos/{owner}/{repo}/content_references/{content_reference_id}/attachments",
                { mediaType: { previews: ["corsair"] } },
            ],
            createFromManifest: ["POST /app-manifests/{code}/conversions"],
            createInstallationAccessToken: [
                "POST /app/installations/{installation_id}/access_tokens",
            ],
            deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
            deleteInstallation: ["DELETE /app/installations/{installation_id}"],
            deleteToken: ["DELETE /applications/{client_id}/token"],
            getAuthenticated: ["GET /app"],
            getBySlug: ["GET /apps/{app_slug}"],
            getInstallation: ["GET /app/installations/{installation_id}"],
            getOrgInstallation: ["GET /orgs/{org}/installation"],
            getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
            getSubscriptionPlanForAccount: [
                "GET /marketplace_listing/accounts/{account_id}",
            ],
            getSubscriptionPlanForAccountStubbed: [
                "GET /marketplace_listing/stubbed/accounts/{account_id}",
            ],
            getUserInstallation: ["GET /users/{username}/installation"],
            getWebhookConfigForApp: ["GET /app/hook/config"],
            getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
            listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
            listAccountsForPlanStubbed: [
                "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts",
            ],
            listInstallationReposForAuthenticatedUser: [
                "GET /user/installations/{installation_id}/repositories",
            ],
            listInstallations: ["GET /app/installations"],
            listInstallationsForAuthenticatedUser: ["GET /user/installations"],
            listPlans: ["GET /marketplace_listing/plans"],
            listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
            listReposAccessibleToInstallation: ["GET /installation/repositories"],
            listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
            listSubscriptionsForAuthenticatedUserStubbed: [
                "GET /user/marketplace_purchases/stubbed",
            ],
            listWebhookDeliveries: ["GET /app/hook/deliveries"],
            redeliverWebhookDelivery: [
                "POST /app/hook/deliveries/{delivery_id}/attempts",
            ],
            removeRepoFromInstallation: [
                "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
                {},
                { renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] },
            ],
            removeRepoFromInstallationForAuthenticatedUser: [
                "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
            ],
            resetToken: ["PATCH /applications/{client_id}/token"],
            revokeInstallationAccessToken: ["DELETE /installation/token"],
            scopeToken: ["POST /applications/{client_id}/token/scoped"],
            suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
            unsuspendInstallation: [
                "DELETE /app/installations/{installation_id}/suspended",
            ],
            updateWebhookConfigForApp: ["PATCH /app/hook/config"],
        },
        billing: {
            getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
            getGithubActionsBillingUser: [
                "GET /users/{username}/settings/billing/actions",
            ],
            getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
            getGithubPackagesBillingUser: [
                "GET /users/{username}/settings/billing/packages",
            ],
            getSharedStorageBillingOrg: [
                "GET /orgs/{org}/settings/billing/shared-storage",
            ],
            getSharedStorageBillingUser: [
                "GET /users/{username}/settings/billing/shared-storage",
            ],
        },
        checks: {
            create: ["POST /repos/{owner}/{repo}/check-runs"],
            createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
            get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
            getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
            listAnnotations: [
                "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations",
            ],
            listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
            listForSuite: [
                "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs",
            ],
            listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
            rerequestRun: [
                "POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest",
            ],
            rerequestSuite: [
                "POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest",
            ],
            setSuitesPreferences: [
                "PATCH /repos/{owner}/{repo}/check-suites/preferences",
            ],
            update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"],
        },
        codeScanning: {
            deleteAnalysis: [
                "DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}",
            ],
            getAlert: [
                "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
                {},
                { renamedParameters: { alert_id: "alert_number" } },
            ],
            getAnalysis: [
                "GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}",
            ],
            getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
            listAlertInstances: [
                "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
            ],
            listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
            listAlertsInstances: [
                "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
                {},
                { renamed: ["codeScanning", "listAlertInstances"] },
            ],
            listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
            updateAlert: [
                "PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
            ],
            uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"],
        },
        codesOfConduct: {
            getAllCodesOfConduct: ["GET /codes_of_conduct"],
            getConductCode: ["GET /codes_of_conduct/{key}"],
        },
        emojis: { get: ["GET /emojis"] },
        enterpriseAdmin: {
            disableSelectedOrganizationGithubActionsEnterprise: [
                "DELETE /enterprises/{enterprise}/actions/permissions/organizations/{org_id}",
            ],
            enableSelectedOrganizationGithubActionsEnterprise: [
                "PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}",
            ],
            getAllowedActionsEnterprise: [
                "GET /enterprises/{enterprise}/actions/permissions/selected-actions",
            ],
            getGithubActionsPermissionsEnterprise: [
                "GET /enterprises/{enterprise}/actions/permissions",
            ],
            listSelectedOrganizationsEnabledGithubActionsEnterprise: [
                "GET /enterprises/{enterprise}/actions/permissions/organizations",
            ],
            setAllowedActionsEnterprise: [
                "PUT /enterprises/{enterprise}/actions/permissions/selected-actions",
            ],
            setGithubActionsPermissionsEnterprise: [
                "PUT /enterprises/{enterprise}/actions/permissions",
            ],
            setSelectedOrganizationsEnabledGithubActionsEnterprise: [
                "PUT /enterprises/{enterprise}/actions/permissions/organizations",
            ],
        },
        gists: {
            checkIsStarred: ["GET /gists/{gist_id}/star"],
            create: ["POST /gists"],
            createComment: ["POST /gists/{gist_id}/comments"],
            delete: ["DELETE /gists/{gist_id}"],
            deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
            fork: ["POST /gists/{gist_id}/forks"],
            get: ["GET /gists/{gist_id}"],
            getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
            getRevision: ["GET /gists/{gist_id}/{sha}"],
            list: ["GET /gists"],
            listComments: ["GET /gists/{gist_id}/comments"],
            listCommits: ["GET /gists/{gist_id}/commits"],
            listForUser: ["GET /users/{username}/gists"],
            listForks: ["GET /gists/{gist_id}/forks"],
            listPublic: ["GET /gists/public"],
            listStarred: ["GET /gists/starred"],
            star: ["PUT /gists/{gist_id}/star"],
            unstar: ["DELETE /gists/{gist_id}/star"],
            update: ["PATCH /gists/{gist_id}"],
            updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"],
        },
        git: {
            createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
            createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
            createRef: ["POST /repos/{owner}/{repo}/git/refs"],
            createTag: ["POST /repos/{owner}/{repo}/git/tags"],
            createTree: ["POST /repos/{owner}/{repo}/git/trees"],
            deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
            getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
            getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
            getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
            getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
            getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
            listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
            updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"],
        },
        gitignore: {
            getAllTemplates: ["GET /gitignore/templates"],
            getTemplate: ["GET /gitignore/templates/{name}"],
        },
        interactions: {
            getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
            getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
            getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
            getRestrictionsForYourPublicRepos: [
                "GET /user/interaction-limits",
                {},
                { renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] },
            ],
            removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
            removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
            removeRestrictionsForRepo: [
                "DELETE /repos/{owner}/{repo}/interaction-limits",
            ],
            removeRestrictionsForYourPublicRepos: [
                "DELETE /user/interaction-limits",
                {},
                { renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] },
            ],
            setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
            setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
            setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
            setRestrictionsForYourPublicRepos: [
                "PUT /user/interaction-limits",
                {},
                { renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] },
            ],
        },
        issues: {
            addAssignees: [
                "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
            ],
            addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
            checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
            create: ["POST /repos/{owner}/{repo}/issues"],
            createComment: [
                "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
            ],
            createLabel: ["POST /repos/{owner}/{repo}/labels"],
            createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
            deleteComment: [
                "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}",
            ],
            deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
            deleteMilestone: [
                "DELETE /repos/{owner}/{repo}/milestones/{milestone_number}",
            ],
            get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
            getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
            getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
            getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
            getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
            list: ["GET /issues"],
            listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
            listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
            listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
            listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
            listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
            listEventsForTimeline: [
                "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
            ],
            listForAuthenticatedUser: ["GET /user/issues"],
            listForOrg: ["GET /orgs/{org}/issues"],
            listForRepo: ["GET /repos/{owner}/{repo}/issues"],
            listLabelsForMilestone: [
                "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels",
            ],
            listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
            listLabelsOnIssue: [
                "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
            ],
            listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
            lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
            removeAllLabels: [
                "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels",
            ],
            removeAssignees: [
                "DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees",
            ],
            removeLabel: [
                "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}",
            ],
            setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
            unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
            update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
            updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
            updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
            updateMilestone: [
                "PATCH /repos/{owner}/{repo}/milestones/{milestone_number}",
            ],
        },
        licenses: {
            get: ["GET /licenses/{license}"],
            getAllCommonlyUsed: ["GET /licenses"],
            getForRepo: ["GET /repos/{owner}/{repo}/license"],
        },
        markdown: {
            render: ["POST /markdown"],
            renderRaw: [
                "POST /markdown/raw",
                { headers: { "content-type": "text/plain; charset=utf-8" } },
            ],
        },
        meta: {
            get: ["GET /meta"],
            getOctocat: ["GET /octocat"],
            getZen: ["GET /zen"],
            root: ["GET /"],
        },
        migrations: {
            cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
            deleteArchiveForAuthenticatedUser: [
                "DELETE /user/migrations/{migration_id}/archive",
            ],
            deleteArchiveForOrg: [
                "DELETE /orgs/{org}/migrations/{migration_id}/archive",
            ],
            downloadArchiveForOrg: [
                "GET /orgs/{org}/migrations/{migration_id}/archive",
            ],
            getArchiveForAuthenticatedUser: [
                "GET /user/migrations/{migration_id}/archive",
            ],
            getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
            getImportStatus: ["GET /repos/{owner}/{repo}/import"],
            getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
            getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
            getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
            listForAuthenticatedUser: ["GET /user/migrations"],
            listForOrg: ["GET /orgs/{org}/migrations"],
            listReposForAuthenticatedUser: [
                "GET /user/migrations/{migration_id}/repositories",
            ],
            listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
            listReposForUser: [
                "GET /user/migrations/{migration_id}/repositories",
                {},
                { renamed: ["migrations", "listReposForAuthenticatedUser"] },
            ],
            mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
            setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
            startForAuthenticatedUser: ["POST /user/migrations"],
            startForOrg: ["POST /orgs/{org}/migrations"],
            startImport: ["PUT /repos/{owner}/{repo}/import"],
            unlockRepoForAuthenticatedUser: [
                "DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock",
            ],
            unlockRepoForOrg: [
                "DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock",
            ],
            updateImport: ["PATCH /repos/{owner}/{repo}/import"],
        },
        orgs: {
            blockUser: ["PUT /orgs/{org}/blocks/{username}"],
            cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
            checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
            checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
            checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
            convertMemberToOutsideCollaborator: [
                "PUT /orgs/{org}/outside_collaborators/{username}",
            ],
            createInvitation: ["POST /orgs/{org}/invitations"],
            createWebhook: ["POST /orgs/{org}/hooks"],
            deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
            get: ["GET /orgs/{org}"],
            getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
            getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
            getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
            getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
            getWebhookDelivery: [
                "GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}",
            ],
            list: ["GET /organizations"],
            listAppInstallations: ["GET /orgs/{org}/installations"],
            listBlockedUsers: ["GET /orgs/{org}/blocks"],
            listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
            listForAuthenticatedUser: ["GET /user/orgs"],
            listForUser: ["GET /users/{username}/orgs"],
            listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
            listMembers: ["GET /orgs/{org}/members"],
            listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
            listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
            listPendingInvitations: ["GET /orgs/{org}/invitations"],
            listPublicMembers: ["GET /orgs/{org}/public_members"],
            listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
            listWebhooks: ["GET /orgs/{org}/hooks"],
            pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
            redeliverWebhookDelivery: [
                "POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts",
            ],
            removeMember: ["DELETE /orgs/{org}/members/{username}"],
            removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
            removeOutsideCollaborator: [
                "DELETE /orgs/{org}/outside_collaborators/{username}",
            ],
            removePublicMembershipForAuthenticatedUser: [
                "DELETE /orgs/{org}/public_members/{username}",
            ],
            setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
            setPublicMembershipForAuthenticatedUser: [
                "PUT /orgs/{org}/public_members/{username}",
            ],
            unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
            update: ["PATCH /orgs/{org}"],
            updateMembershipForAuthenticatedUser: [
                "PATCH /user/memberships/orgs/{org}",
            ],
            updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
            updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"],
        },
        packages: {
            deletePackageForAuthenticatedUser: [
                "DELETE /user/packages/{package_type}/{package_name}",
            ],
            deletePackageForOrg: [
                "DELETE /orgs/{org}/packages/{package_type}/{package_name}",
            ],
            deletePackageForUser: [
                "DELETE /users/{username}/packages/{package_type}/{package_name}",
            ],
            deletePackageVersionForAuthenticatedUser: [
                "DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}",
            ],
            deletePackageVersionForOrg: [
                "DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}",
            ],
            deletePackageVersionForUser: [
                "DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}",
            ],
            getAllPackageVersionsForAPackageOwnedByAnOrg: [
                "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
                {},
                { renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] },
            ],
            getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
                "GET /user/packages/{package_type}/{package_name}/versions",
                {},
                {
                    renamed: [
                        "packages",
                        "getAllPackageVersionsForPackageOwnedByAuthenticatedUser",
                    ],
                },
            ],
            getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
                "GET /user/packages/{package_type}/{package_name}/versions",
            ],
            getAllPackageVersionsForPackageOwnedByOrg: [
                "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
            ],
            getAllPackageVersionsForPackageOwnedByUser: [
                "GET /users/{username}/packages/{package_type}/{package_name}/versions",
            ],
            getPackageForAuthenticatedUser: [
                "GET /user/packages/{package_type}/{package_name}",
            ],
            getPackageForOrganization: [
                "GET /orgs/{org}/packages/{package_type}/{package_name}",
            ],
            getPackageForUser: [
                "GET /users/{username}/packages/{package_type}/{package_name}",
            ],
            getPackageVersionForAuthenticatedUser: [
                "GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}",
            ],
            getPackageVersionForOrganization: [
                "GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}",
            ],
            getPackageVersionForUser: [
                "GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}",
            ],
            listPackagesForAuthenticatedUser: ["GET /user/packages"],
            listPackagesForOrganization: ["GET /orgs/{org}/packages"],
            listPackagesForUser: ["GET /users/{username}/packages"],
            restorePackageForAuthenticatedUser: [
                "POST /user/packages/{package_type}/{package_name}/restore{?token}",
            ],
            restorePackageForOrg: [
                "POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}",
            ],
            restorePackageForUser: [
                "POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}",
            ],
            restorePackageVersionForAuthenticatedUser: [
                "POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
            ],
            restorePackageVersionForOrg: [
                "POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
            ],
            restorePackageVersionForUser: [
                "POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore",
            ],
        },
        projects: {
            addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}"],
            createCard: ["POST /projects/columns/{column_id}/cards"],
            createColumn: ["POST /projects/{project_id}/columns"],
            createForAuthenticatedUser: ["POST /user/projects"],
            createForOrg: ["POST /orgs/{org}/projects"],
            createForRepo: ["POST /repos/{owner}/{repo}/projects"],
            delete: ["DELETE /projects/{project_id}"],
            deleteCard: ["DELETE /projects/columns/cards/{card_id}"],
            deleteColumn: ["DELETE /projects/columns/{column_id}"],
            get: ["GET /projects/{project_id}"],
            getCard: ["GET /projects/columns/cards/{card_id}"],
            getColumn: ["GET /projects/columns/{column_id}"],
            getPermissionForUser: [
                "GET /projects/{project_id}/collaborators/{username}/permission",
            ],
            listCards: ["GET /projects/columns/{column_id}/cards"],
            listCollaborators: ["GET /projects/{project_id}/collaborators"],
            listColumns: ["GET /projects/{project_id}/columns"],
            listForOrg: ["GET /orgs/{org}/projects"],
            listForRepo: ["GET /repos/{owner}/{repo}/projects"],
            listForUser: ["GET /users/{username}/projects"],
            moveCard: ["POST /projects/columns/cards/{card_id}/moves"],
            moveColumn: ["POST /projects/columns/{column_id}/moves"],
            removeCollaborator: [
                "DELETE /projects/{project_id}/collaborators/{username}",
            ],
            update: ["PATCH /projects/{project_id}"],
            updateCard: ["PATCH /projects/columns/cards/{card_id}"],
            updateColumn: ["PATCH /projects/columns/{column_id}"],
        },
        pulls: {
            checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
            create: ["POST /repos/{owner}/{repo}/pulls"],
            createReplyForReviewComment: [
                "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies",
            ],
            createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
            createReviewComment: [
                "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
            ],
            deletePendingReview: [
                "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
            ],
            deleteReviewComment: [
                "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}",
            ],
            dismissReview: [
                "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals",
            ],
            get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
            getReview: [
                "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
            ],
            getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
            list: ["GET /repos/{owner}/{repo}/pulls"],
            listCommentsForReview: [
                "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
            ],
            listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
            listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
            listRequestedReviewers: [
                "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
            ],
            listReviewComments: [
                "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
            ],
            listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
            listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
            merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
            removeRequestedReviewers: [
                "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
            ],
            requestReviewers: [
                "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers",
            ],
            submitReview: [
                "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events",
            ],
            update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
            updateBranch: [
                "PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch",
            ],
            updateReview: [
                "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
            ],
            updateReviewComment: [
                "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}",
            ],
        },
        rateLimit: { get: ["GET /rate_limit"] },
        reactions: {
            createForCommitComment: [
                "POST /repos/{owner}/{repo}/comments/{comment_id}/reactions",
            ],
            createForIssue: [
                "POST /repos/{owner}/{repo}/issues/{issue_number}/reactions",
            ],
            createForIssueComment: [
                "POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
            ],
            createForPullRequestReviewComment: [
                "POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
            ],
            createForRelease: [
                "POST /repos/{owner}/{repo}/releases/{release_id}/reactions",
            ],
            createForTeamDiscussionCommentInOrg: [
                "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
            ],
            createForTeamDiscussionInOrg: [
                "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
            ],
            deleteForCommitComment: [
                "DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}",
            ],
            deleteForIssue: [
                "DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}",
            ],
            deleteForIssueComment: [
                "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}",
            ],
            deleteForPullRequestComment: [
                "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}",
            ],
            deleteForTeamDiscussion: [
                "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}",
            ],
            deleteForTeamDiscussionComment: [
                "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}",
            ],
            listForCommitComment: [
                "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions",
            ],
            listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
            listForIssueComment: [
                "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
            ],
            listForPullRequestReviewComment: [
                "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
            ],
            listForTeamDiscussionCommentInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
            ],
            listForTeamDiscussionInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
            ],
        },
        repos: {
            acceptInvitation: [
                "PATCH /user/repository_invitations/{invitation_id}",
                {},
                { renamed: ["repos", "acceptInvitationForAuthenticatedUser"] },
            ],
            acceptInvitationForAuthenticatedUser: [
                "PATCH /user/repository_invitations/{invitation_id}",
            ],
            addAppAccessRestrictions: [
                "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
                {},
                { mapToData: "apps" },
            ],
            addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
            addStatusCheckContexts: [
                "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
                {},
                { mapToData: "contexts" },
            ],
            addTeamAccessRestrictions: [
                "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
                {},
                { mapToData: "teams" },
            ],
            addUserAccessRestrictions: [
                "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
                {},
                { mapToData: "users" },
            ],
            checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
            checkVulnerabilityAlerts: [
                "GET /repos/{owner}/{repo}/vulnerability-alerts",
            ],
            compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
            compareCommitsWithBasehead: [
                "GET /repos/{owner}/{repo}/compare/{basehead}",
            ],
            createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
            createCommitComment: [
                "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
            ],
            createCommitSignatureProtection: [
                "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
            ],
            createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
            createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
            createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
            createDeploymentStatus: [
                "POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
            ],
            createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
            createForAuthenticatedUser: ["POST /user/repos"],
            createFork: ["POST /repos/{owner}/{repo}/forks"],
            createInOrg: ["POST /orgs/{org}/repos"],
            createOrUpdateEnvironment: [
                "PUT /repos/{owner}/{repo}/environments/{environment_name}",
            ],
            createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
            createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
            createRelease: ["POST /repos/{owner}/{repo}/releases"],
            createUsingTemplate: [
                "POST /repos/{template_owner}/{template_repo}/generate",
            ],
            createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
            declineInvitation: [
                "DELETE /user/repository_invitations/{invitation_id}",
                {},
                { renamed: ["repos", "declineInvitationForAuthenticatedUser"] },
            ],
            declineInvitationForAuthenticatedUser: [
                "DELETE /user/repository_invitations/{invitation_id}",
            ],
            delete: ["DELETE /repos/{owner}/{repo}"],
            deleteAccessRestrictions: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions",
            ],
            deleteAdminBranchProtection: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
            ],
            deleteAnEnvironment: [
                "DELETE /repos/{owner}/{repo}/environments/{environment_name}",
            ],
            deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
            deleteBranchProtection: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection",
            ],
            deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
            deleteCommitSignatureProtection: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
            ],
            deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
            deleteDeployment: [
                "DELETE /repos/{owner}/{repo}/deployments/{deployment_id}",
            ],
            deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
            deleteInvitation: [
                "DELETE /repos/{owner}/{repo}/invitations/{invitation_id}",
            ],
            deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
            deletePullRequestReviewProtection: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
            ],
            deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
            deleteReleaseAsset: [
                "DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}",
            ],
            deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
            disableAutomatedSecurityFixes: [
                "DELETE /repos/{owner}/{repo}/automated-security-fixes",
            ],
            disableLfsForRepo: ["DELETE /repos/{owner}/{repo}/lfs"],
            disableVulnerabilityAlerts: [
                "DELETE /repos/{owner}/{repo}/vulnerability-alerts",
            ],
            downloadArchive: [
                "GET /repos/{owner}/{repo}/zipball/{ref}",
                {},
                { renamed: ["repos", "downloadZipballArchive"] },
            ],
            downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
            downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
            enableAutomatedSecurityFixes: [
                "PUT /repos/{owner}/{repo}/automated-security-fixes",
            ],
            enableLfsForRepo: ["PUT /repos/{owner}/{repo}/lfs"],
            enableVulnerabilityAlerts: [
                "PUT /repos/{owner}/{repo}/vulnerability-alerts",
            ],
            generateReleaseNotes: [
                "POST /repos/{owner}/{repo}/releases/generate-notes",
            ],
            get: ["GET /repos/{owner}/{repo}"],
            getAccessRestrictions: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions",
            ],
            getAdminBranchProtection: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
            ],
            getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
            getAllStatusCheckContexts: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
            ],
            getAllTopics: [
                "GET /repos/{owner}/{repo}/topics",
                { mediaType: { previews: ["mercy"] } },
            ],
            getAppsWithAccessToProtectedBranch: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
            ],
            getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
            getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
            getBranchProtection: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection",
            ],
            getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
            getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
            getCollaboratorPermissionLevel: [
                "GET /repos/{owner}/{repo}/collaborators/{username}/permission",
            ],
            getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
            getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
            getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
            getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
            getCommitSignatureProtection: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures",
            ],
            getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
            getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
            getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
            getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
            getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
            getDeploymentStatus: [
                "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}",
            ],
            getEnvironment: [
                "GET /repos/{owner}/{repo}/environments/{environment_name}",
            ],
            getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
            getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
            getPages: ["GET /repos/{owner}/{repo}/pages"],
            getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
            getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
            getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
            getPullRequestReviewProtection: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
            ],
            getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
            getReadme: ["GET /repos/{owner}/{repo}/readme"],
            getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
            getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
            getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
            getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
            getStatusChecksProtection: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
            ],
            getTeamsWithAccessToProtectedBranch: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
            ],
            getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
            getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
            getUsersWithAccessToProtectedBranch: [
                "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
            ],
            getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
            getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
            getWebhookConfigForRepo: [
                "GET /repos/{owner}/{repo}/hooks/{hook_id}/config",
            ],
            getWebhookDelivery: [
                "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}",
            ],
            listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
            listBranches: ["GET /repos/{owner}/{repo}/branches"],
            listBranchesForHeadCommit: [
                "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head",
            ],
            listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
            listCommentsForCommit: [
                "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
            ],
            listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
            listCommitStatusesForRef: [
                "GET /repos/{owner}/{repo}/commits/{ref}/statuses",
            ],
            listCommits: ["GET /repos/{owner}/{repo}/commits"],
            listContributors: ["GET /repos/{owner}/{repo}/contributors"],
            listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
            listDeploymentStatuses: [
                "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
            ],
            listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
            listForAuthenticatedUser: ["GET /user/repos"],
            listForOrg: ["GET /orgs/{org}/repos"],
            listForUser: ["GET /users/{username}/repos"],
            listForks: ["GET /repos/{owner}/{repo}/forks"],
            listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
            listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
            listLanguages: ["GET /repos/{owner}/{repo}/languages"],
            listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
            listPublic: ["GET /repositories"],
            listPullRequestsAssociatedWithCommit: [
                "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
            ],
            listReleaseAssets: [
                "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
            ],
            listReleases: ["GET /repos/{owner}/{repo}/releases"],
            listTags: ["GET /repos/{owner}/{repo}/tags"],
            listTeams: ["GET /repos/{owner}/{repo}/teams"],
            listWebhookDeliveries: [
                "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries",
            ],
            listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
            merge: ["POST /repos/{owner}/{repo}/merges"],
            mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
            pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
            redeliverWebhookDelivery: [
                "POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts",
            ],
            removeAppAccessRestrictions: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
                {},
                { mapToData: "apps" },
            ],
            removeCollaborator: [
                "DELETE /repos/{owner}/{repo}/collaborators/{username}",
            ],
            removeStatusCheckContexts: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
                {},
                { mapToData: "contexts" },
            ],
            removeStatusCheckProtection: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
            ],
            removeTeamAccessRestrictions: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
                {},
                { mapToData: "teams" },
            ],
            removeUserAccessRestrictions: [
                "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
                {},
                { mapToData: "users" },
            ],
            renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
            replaceAllTopics: [
                "PUT /repos/{owner}/{repo}/topics",
                { mediaType: { previews: ["mercy"] } },
            ],
            requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
            setAdminBranchProtection: [
                "POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins",
            ],
            setAppAccessRestrictions: [
                "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
                {},
                { mapToData: "apps" },
            ],
            setStatusCheckContexts: [
                "PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
                {},
                { mapToData: "contexts" },
            ],
            setTeamAccessRestrictions: [
                "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
                {},
                { mapToData: "teams" },
            ],
            setUserAccessRestrictions: [
                "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
                {},
                { mapToData: "users" },
            ],
            testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
            transfer: ["POST /repos/{owner}/{repo}/transfer"],
            update: ["PATCH /repos/{owner}/{repo}"],
            updateBranchProtection: [
                "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
            ],
            updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
            updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
            updateInvitation: [
                "PATCH /repos/{owner}/{repo}/invitations/{invitation_id}",
            ],
            updatePullRequestReviewProtection: [
                "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews",
            ],
            updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
            updateReleaseAsset: [
                "PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}",
            ],
            updateStatusCheckPotection: [
                "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
                {},
                { renamed: ["repos", "updateStatusCheckProtection"] },
            ],
            updateStatusCheckProtection: [
                "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
            ],
            updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
            updateWebhookConfigForRepo: [
                "PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config",
            ],
            uploadReleaseAsset: [
                "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
                { baseUrl: "https://uploads.github.com" },
            ],
        },
        search: {
            code: ["GET /search/code"],
            commits: ["GET /search/commits"],
            issuesAndPullRequests: ["GET /search/issues"],
            labels: ["GET /search/labels"],
            repos: ["GET /search/repositories"],
            topics: ["GET /search/topics", { mediaType: { previews: ["mercy"] } }],
            users: ["GET /search/users"],
        },
        secretScanning: {
            getAlert: [
                "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}",
            ],
            listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
            listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
            updateAlert: [
                "PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}",
            ],
        },
        teams: {
            addOrUpdateMembershipForUserInOrg: [
                "PUT /orgs/{org}/teams/{team_slug}/memberships/{username}",
            ],
            addOrUpdateProjectPermissionsInOrg: [
                "PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}",
            ],
            addOrUpdateRepoPermissionsInOrg: [
                "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
            ],
            checkPermissionsForProjectInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/projects/{project_id}",
            ],
            checkPermissionsForRepoInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
            ],
            create: ["POST /orgs/{org}/teams"],
            createDiscussionCommentInOrg: [
                "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
            ],
            createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
            deleteDiscussionCommentInOrg: [
                "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
            ],
            deleteDiscussionInOrg: [
                "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
            ],
            deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
            getByName: ["GET /orgs/{org}/teams/{team_slug}"],
            getDiscussionCommentInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
            ],
            getDiscussionInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
            ],
            getMembershipForUserInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/memberships/{username}",
            ],
            list: ["GET /orgs/{org}/teams"],
            listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
            listDiscussionCommentsInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
            ],
            listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
            listForAuthenticatedUser: ["GET /user/teams"],
            listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
            listPendingInvitationsInOrg: [
                "GET /orgs/{org}/teams/{team_slug}/invitations",
            ],
            listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects"],
            listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
            removeMembershipForUserInOrg: [
                "DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}",
            ],
            removeProjectInOrg: [
                "DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}",
            ],
            removeRepoInOrg: [
                "DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
            ],
            updateDiscussionCommentInOrg: [
                "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}",
            ],
            updateDiscussionInOrg: [
                "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}",
            ],
            updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"],
        },
        users: {
            addEmailForAuthenticated: [
                "POST /user/emails",
                {},
                { renamed: ["users", "addEmailForAuthenticatedUser"] },
            ],
            addEmailForAuthenticatedUser: ["POST /user/emails"],
            block: ["PUT /user/blocks/{username}"],
            checkBlocked: ["GET /user/blocks/{username}"],
            checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
            checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
            createGpgKeyForAuthenticated: [
                "POST /user/gpg_keys",
                {},
                { renamed: ["users", "createGpgKeyForAuthenticatedUser"] },
            ],
            createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
            createPublicSshKeyForAuthenticated: [
                "POST /user/keys",
                {},
                { renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] },
            ],
            createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
            deleteEmailForAuthenticated: [
                "DELETE /user/emails",
                {},
                { renamed: ["users", "deleteEmailForAuthenticatedUser"] },
            ],
            deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
            deleteGpgKeyForAuthenticated: [
                "DELETE /user/gpg_keys/{gpg_key_id}",
                {},
                { renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] },
            ],
            deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
            deletePublicSshKeyForAuthenticated: [
                "DELETE /user/keys/{key_id}",
                {},
                { renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] },
            ],
            deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
            follow: ["PUT /user/following/{username}"],
            getAuthenticated: ["GET /user"],
            getByUsername: ["GET /users/{username}"],
            getContextForUser: ["GET /users/{username}/hovercard"],
            getGpgKeyForAuthenticated: [
                "GET /user/gpg_keys/{gpg_key_id}",
                {},
                { renamed: ["users", "getGpgKeyForAuthenticatedUser"] },
            ],
            getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
            getPublicSshKeyForAuthenticated: [
                "GET /user/keys/{key_id}",
                {},
                { renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] },
            ],
            getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
            list: ["GET /users"],
            listBlockedByAuthenticated: [
                "GET /user/blocks",
                {},
                { renamed: ["users", "listBlockedByAuthenticatedUser"] },
            ],
            listBlockedByAuthenticatedUser: ["GET /user/blocks"],
            listEmailsForAuthenticated: [
                "GET /user/emails",
                {},
                { renamed: ["users", "listEmailsForAuthenticatedUser"] },
            ],
            listEmailsForAuthenticatedUser: ["GET /user/emails"],
            listFollowedByAuthenticated: [
                "GET /user/following",
                {},
                { renamed: ["users", "listFollowedByAuthenticatedUser"] },
            ],
            listFollowedByAuthenticatedUser: ["GET /user/following"],
            listFollowersForAuthenticatedUser: ["GET /user/followers"],
            listFollowersForUser: ["GET /users/{username}/followers"],
            listFollowingForUser: ["GET /users/{username}/following"],
            listGpgKeysForAuthenticated: [
                "GET /user/gpg_keys",
                {},
                { renamed: ["users", "listGpgKeysForAuthenticatedUser"] },
            ],
            listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
            listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
            listPublicEmailsForAuthenticated: [
                "GET /user/public_emails",
                {},
                { renamed: ["users", "listPublicEmailsForAuthenticatedUser"] },
            ],
            listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
            listPublicKeysForUser: ["GET /users/{username}/keys"],
            listPublicSshKeysForAuthenticated: [
                "GET /user/keys",
                {},
                { renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] },
            ],
            listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
            setPrimaryEmailVisibilityForAuthenticated: [
                "PATCH /user/email/visibility",
                {},
                { renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] },
            ],
            setPrimaryEmailVisibilityForAuthenticatedUser: [
                "PATCH /user/email/visibility",
            ],
            unblock: ["DELETE /user/blocks/{username}"],
            unfollow: ["DELETE /user/following/{username}"],
            updateAuthenticated: ["PATCH /user"],
        },
    };

    const VERSION$9 = "5.13.0";

    function endpointsToMethods(octokit, endpointsMap) {
        const newMethods = {};
        for (const [scope, endpoints] of Object.entries(endpointsMap)) {
            for (const [methodName, endpoint] of Object.entries(endpoints)) {
                const [route, defaults, decorations] = endpoint;
                const [method, url] = route.split(/ /);
                const endpointDefaults = Object.assign({ method, url }, defaults);
                if (!newMethods[scope]) {
                    newMethods[scope] = {};
                }
                const scopeMethods = newMethods[scope];
                if (decorations) {
                    scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
                    continue;
                }
                scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
            }
        }
        return newMethods;
    }
    function decorate(octokit, scope, methodName, defaults, decorations) {
        const requestWithDefaults = octokit.request.defaults(defaults);
        /* istanbul ignore next */
        function withDecorations(...args) {
            // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
            let options = requestWithDefaults.endpoint.merge(...args);
            // There are currently no other decorations than `.mapToData`
            if (decorations.mapToData) {
                options = Object.assign({}, options, {
                    data: options[decorations.mapToData],
                    [decorations.mapToData]: undefined,
                });
                return requestWithDefaults(options);
            }
            if (decorations.renamed) {
                const [newScope, newMethodName] = decorations.renamed;
                octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
            }
            if (decorations.deprecated) {
                octokit.log.warn(decorations.deprecated);
            }
            if (decorations.renamedParameters) {
                // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
                const options = requestWithDefaults.endpoint.merge(...args);
                for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
                    if (name in options) {
                        octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);
                        if (!(alias in options)) {
                            options[alias] = options[name];
                        }
                        delete options[name];
                    }
                }
                return requestWithDefaults(options);
            }
            // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
            return requestWithDefaults(...args);
        }
        return Object.assign(withDecorations, requestWithDefaults);
    }

    function restEndpointMethods(octokit) {
        const api = endpointsToMethods(octokit, Endpoints);
        return {
            rest: api,
        };
    }
    restEndpointMethods.VERSION = VERSION$9;

    /**
      * This file contains the Bottleneck library (MIT), compiled to ES2017, and without Clustering support.
      * https://github.com/SGrondin/bottleneck
      */

    var light = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    	var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};

    	function getCjsExportFromNamespace (n) {
    		return n && n['default'] || n;
    	}

    	var load = function(received, defaults, onto = {}) {
    	  var k, ref, v;
    	  for (k in defaults) {
    	    v = defaults[k];
    	    onto[k] = (ref = received[k]) != null ? ref : v;
    	  }
    	  return onto;
    	};

    	var overwrite = function(received, defaults, onto = {}) {
    	  var k, v;
    	  for (k in received) {
    	    v = received[k];
    	    if (defaults[k] !== void 0) {
    	      onto[k] = v;
    	    }
    	  }
    	  return onto;
    	};

    	var parser = {
    		load: load,
    		overwrite: overwrite
    	};

    	var DLList;

    	DLList = class DLList {
    	  constructor(incr, decr) {
    	    this.incr = incr;
    	    this.decr = decr;
    	    this._first = null;
    	    this._last = null;
    	    this.length = 0;
    	  }

    	  push(value) {
    	    var node;
    	    this.length++;
    	    if (typeof this.incr === "function") {
    	      this.incr();
    	    }
    	    node = {
    	      value,
    	      prev: this._last,
    	      next: null
    	    };
    	    if (this._last != null) {
    	      this._last.next = node;
    	      this._last = node;
    	    } else {
    	      this._first = this._last = node;
    	    }
    	    return void 0;
    	  }

    	  shift() {
    	    var value;
    	    if (this._first == null) {
    	      return;
    	    } else {
    	      this.length--;
    	      if (typeof this.decr === "function") {
    	        this.decr();
    	      }
    	    }
    	    value = this._first.value;
    	    if ((this._first = this._first.next) != null) {
    	      this._first.prev = null;
    	    } else {
    	      this._last = null;
    	    }
    	    return value;
    	  }

    	  first() {
    	    if (this._first != null) {
    	      return this._first.value;
    	    }
    	  }

    	  getArray() {
    	    var node, ref, results;
    	    node = this._first;
    	    results = [];
    	    while (node != null) {
    	      results.push((ref = node, node = node.next, ref.value));
    	    }
    	    return results;
    	  }

    	  forEachShift(cb) {
    	    var node;
    	    node = this.shift();
    	    while (node != null) {
    	      (cb(node), node = this.shift());
    	    }
    	    return void 0;
    	  }

    	  debug() {
    	    var node, ref, ref1, ref2, results;
    	    node = this._first;
    	    results = [];
    	    while (node != null) {
    	      results.push((ref = node, node = node.next, {
    	        value: ref.value,
    	        prev: (ref1 = ref.prev) != null ? ref1.value : void 0,
    	        next: (ref2 = ref.next) != null ? ref2.value : void 0
    	      }));
    	    }
    	    return results;
    	  }

    	};

    	var DLList_1 = DLList;

    	var Events;

    	Events = class Events {
    	  constructor(instance) {
    	    this.instance = instance;
    	    this._events = {};
    	    if ((this.instance.on != null) || (this.instance.once != null) || (this.instance.removeAllListeners != null)) {
    	      throw new Error("An Emitter already exists for this object");
    	    }
    	    this.instance.on = (name, cb) => {
    	      return this._addListener(name, "many", cb);
    	    };
    	    this.instance.once = (name, cb) => {
    	      return this._addListener(name, "once", cb);
    	    };
    	    this.instance.removeAllListeners = (name = null) => {
    	      if (name != null) {
    	        return delete this._events[name];
    	      } else {
    	        return this._events = {};
    	      }
    	    };
    	  }

    	  _addListener(name, status, cb) {
    	    var base;
    	    if ((base = this._events)[name] == null) {
    	      base[name] = [];
    	    }
    	    this._events[name].push({cb, status});
    	    return this.instance;
    	  }

    	  listenerCount(name) {
    	    if (this._events[name] != null) {
    	      return this._events[name].length;
    	    } else {
    	      return 0;
    	    }
    	  }

    	  async trigger(name, ...args) {
    	    var e, promises;
    	    try {
    	      if (name !== "debug") {
    	        this.trigger("debug", `Event triggered: ${name}`, args);
    	      }
    	      if (this._events[name] == null) {
    	        return;
    	      }
    	      this._events[name] = this._events[name].filter(function(listener) {
    	        return listener.status !== "none";
    	      });
    	      promises = this._events[name].map(async(listener) => {
    	        var e, returned;
    	        if (listener.status === "none") {
    	          return;
    	        }
    	        if (listener.status === "once") {
    	          listener.status = "none";
    	        }
    	        try {
    	          returned = typeof listener.cb === "function" ? listener.cb(...args) : void 0;
    	          if (typeof (returned != null ? returned.then : void 0) === "function") {
    	            return (await returned);
    	          } else {
    	            return returned;
    	          }
    	        } catch (error) {
    	          e = error;
    	          {
    	            this.trigger("error", e);
    	          }
    	          return null;
    	        }
    	      });
    	      return ((await Promise.all(promises))).find(function(x) {
    	        return x != null;
    	      });
    	    } catch (error) {
    	      e = error;
    	      {
    	        this.trigger("error", e);
    	      }
    	      return null;
    	    }
    	  }

    	};

    	var Events_1 = Events;

    	var DLList$1, Events$1, Queues;

    	DLList$1 = DLList_1;

    	Events$1 = Events_1;

    	Queues = class Queues {
    	  constructor(num_priorities) {
    	    this.Events = new Events$1(this);
    	    this._length = 0;
    	    this._lists = (function() {
    	      var j, ref, results;
    	      results = [];
    	      for (j = 1, ref = num_priorities; (1 <= ref ? j <= ref : j >= ref); 1 <= ref ? ++j : --j) {
    	        results.push(new DLList$1((() => {
    	          return this.incr();
    	        }), (() => {
    	          return this.decr();
    	        })));
    	      }
    	      return results;
    	    }).call(this);
    	  }

    	  incr() {
    	    if (this._length++ === 0) {
    	      return this.Events.trigger("leftzero");
    	    }
    	  }

    	  decr() {
    	    if (--this._length === 0) {
    	      return this.Events.trigger("zero");
    	    }
    	  }

    	  push(job) {
    	    return this._lists[job.options.priority].push(job);
    	  }

    	  queued(priority) {
    	    if (priority != null) {
    	      return this._lists[priority].length;
    	    } else {
    	      return this._length;
    	    }
    	  }

    	  shiftAll(fn) {
    	    return this._lists.forEach(function(list) {
    	      return list.forEachShift(fn);
    	    });
    	  }

    	  getFirst(arr = this._lists) {
    	    var j, len, list;
    	    for (j = 0, len = arr.length; j < len; j++) {
    	      list = arr[j];
    	      if (list.length > 0) {
    	        return list;
    	      }
    	    }
    	    return [];
    	  }

    	  shiftLastFrom(priority) {
    	    return this.getFirst(this._lists.slice(priority).reverse()).shift();
    	  }

    	};

    	var Queues_1 = Queues;

    	var BottleneckError;

    	BottleneckError = class BottleneckError extends Error {};

    	var BottleneckError_1 = BottleneckError;

    	var BottleneckError$1, DEFAULT_PRIORITY, Job, NUM_PRIORITIES, parser$1;

    	NUM_PRIORITIES = 10;

    	DEFAULT_PRIORITY = 5;

    	parser$1 = parser;

    	BottleneckError$1 = BottleneckError_1;

    	Job = class Job {
    	  constructor(task, args, options, jobDefaults, rejectOnDrop, Events, _states, Promise) {
    	    this.task = task;
    	    this.args = args;
    	    this.rejectOnDrop = rejectOnDrop;
    	    this.Events = Events;
    	    this._states = _states;
    	    this.Promise = Promise;
    	    this.options = parser$1.load(options, jobDefaults);
    	    this.options.priority = this._sanitizePriority(this.options.priority);
    	    if (this.options.id === jobDefaults.id) {
    	      this.options.id = `${this.options.id}-${this._randomIndex()}`;
    	    }
    	    this.promise = new this.Promise((_resolve, _reject) => {
    	      this._resolve = _resolve;
    	      this._reject = _reject;
    	    });
    	    this.retryCount = 0;
    	  }

    	  _sanitizePriority(priority) {
    	    var sProperty;
    	    sProperty = ~~priority !== priority ? DEFAULT_PRIORITY : priority;
    	    if (sProperty < 0) {
    	      return 0;
    	    } else if (sProperty > NUM_PRIORITIES - 1) {
    	      return NUM_PRIORITIES - 1;
    	    } else {
    	      return sProperty;
    	    }
    	  }

    	  _randomIndex() {
    	    return Math.random().toString(36).slice(2);
    	  }

    	  doDrop({error, message = "This job has been dropped by Bottleneck"} = {}) {
    	    if (this._states.remove(this.options.id)) {
    	      if (this.rejectOnDrop) {
    	        this._reject(error != null ? error : new BottleneckError$1(message));
    	      }
    	      this.Events.trigger("dropped", {args: this.args, options: this.options, task: this.task, promise: this.promise});
    	      return true;
    	    } else {
    	      return false;
    	    }
    	  }

    	  _assertStatus(expected) {
    	    var status;
    	    status = this._states.jobStatus(this.options.id);
    	    if (!(status === expected || (expected === "DONE" && status === null))) {
    	      throw new BottleneckError$1(`Invalid job status ${status}, expected ${expected}. Please open an issue at https://github.com/SGrondin/bottleneck/issues`);
    	    }
    	  }

    	  doReceive() {
    	    this._states.start(this.options.id);
    	    return this.Events.trigger("received", {args: this.args, options: this.options});
    	  }

    	  doQueue(reachedHWM, blocked) {
    	    this._assertStatus("RECEIVED");
    	    this._states.next(this.options.id);
    	    return this.Events.trigger("queued", {args: this.args, options: this.options, reachedHWM, blocked});
    	  }

    	  doRun() {
    	    if (this.retryCount === 0) {
    	      this._assertStatus("QUEUED");
    	      this._states.next(this.options.id);
    	    } else {
    	      this._assertStatus("EXECUTING");
    	    }
    	    return this.Events.trigger("scheduled", {args: this.args, options: this.options});
    	  }

    	  async doExecute(chained, clearGlobalState, run, free) {
    	    var error, eventInfo, passed;
    	    if (this.retryCount === 0) {
    	      this._assertStatus("RUNNING");
    	      this._states.next(this.options.id);
    	    } else {
    	      this._assertStatus("EXECUTING");
    	    }
    	    eventInfo = {args: this.args, options: this.options, retryCount: this.retryCount};
    	    this.Events.trigger("executing", eventInfo);
    	    try {
    	      passed = (await (chained != null ? chained.schedule(this.options, this.task, ...this.args) : this.task(...this.args)));
    	      if (clearGlobalState()) {
    	        this.doDone(eventInfo);
    	        await free(this.options, eventInfo);
    	        this._assertStatus("DONE");
    	        return this._resolve(passed);
    	      }
    	    } catch (error1) {
    	      error = error1;
    	      return this._onFailure(error, eventInfo, clearGlobalState, run, free);
    	    }
    	  }

    	  doExpire(clearGlobalState, run, free) {
    	    var error, eventInfo;
    	    if (this._states.jobStatus(this.options.id === "RUNNING")) {
    	      this._states.next(this.options.id);
    	    }
    	    this._assertStatus("EXECUTING");
    	    eventInfo = {args: this.args, options: this.options, retryCount: this.retryCount};
    	    error = new BottleneckError$1(`This job timed out after ${this.options.expiration} ms.`);
    	    return this._onFailure(error, eventInfo, clearGlobalState, run, free);
    	  }

    	  async _onFailure(error, eventInfo, clearGlobalState, run, free) {
    	    var retry, retryAfter;
    	    if (clearGlobalState()) {
    	      retry = (await this.Events.trigger("failed", error, eventInfo));
    	      if (retry != null) {
    	        retryAfter = ~~retry;
    	        this.Events.trigger("retry", `Retrying ${this.options.id} after ${retryAfter} ms`, eventInfo);
    	        this.retryCount++;
    	        return run(retryAfter);
    	      } else {
    	        this.doDone(eventInfo);
    	        await free(this.options, eventInfo);
    	        this._assertStatus("DONE");
    	        return this._reject(error);
    	      }
    	    }
    	  }

    	  doDone(eventInfo) {
    	    this._assertStatus("EXECUTING");
    	    this._states.next(this.options.id);
    	    return this.Events.trigger("done", eventInfo);
    	  }

    	};

    	var Job_1 = Job;

    	var BottleneckError$2, LocalDatastore, parser$2;

    	parser$2 = parser;

    	BottleneckError$2 = BottleneckError_1;

    	LocalDatastore = class LocalDatastore {
    	  constructor(instance, storeOptions, storeInstanceOptions) {
    	    this.instance = instance;
    	    this.storeOptions = storeOptions;
    	    this.clientId = this.instance._randomIndex();
    	    parser$2.load(storeInstanceOptions, storeInstanceOptions, this);
    	    this._nextRequest = this._lastReservoirRefresh = this._lastReservoirIncrease = Date.now();
    	    this._running = 0;
    	    this._done = 0;
    	    this._unblockTime = 0;
    	    this.ready = this.Promise.resolve();
    	    this.clients = {};
    	    this._startHeartbeat();
    	  }

    	  _startHeartbeat() {
    	    var base;
    	    if ((this.heartbeat == null) && (((this.storeOptions.reservoirRefreshInterval != null) && (this.storeOptions.reservoirRefreshAmount != null)) || ((this.storeOptions.reservoirIncreaseInterval != null) && (this.storeOptions.reservoirIncreaseAmount != null)))) {
    	      return typeof (base = (this.heartbeat = setInterval(() => {
    	        var amount, incr, maximum, now, reservoir;
    	        now = Date.now();
    	        if ((this.storeOptions.reservoirRefreshInterval != null) && now >= this._lastReservoirRefresh + this.storeOptions.reservoirRefreshInterval) {
    	          this._lastReservoirRefresh = now;
    	          this.storeOptions.reservoir = this.storeOptions.reservoirRefreshAmount;
    	          this.instance._drainAll(this.computeCapacity());
    	        }
    	        if ((this.storeOptions.reservoirIncreaseInterval != null) && now >= this._lastReservoirIncrease + this.storeOptions.reservoirIncreaseInterval) {
    	          ({
    	            reservoirIncreaseAmount: amount,
    	            reservoirIncreaseMaximum: maximum,
    	            reservoir
    	          } = this.storeOptions);
    	          this._lastReservoirIncrease = now;
    	          incr = maximum != null ? Math.min(amount, maximum - reservoir) : amount;
    	          if (incr > 0) {
    	            this.storeOptions.reservoir += incr;
    	            return this.instance._drainAll(this.computeCapacity());
    	          }
    	        }
    	      }, this.heartbeatInterval))).unref === "function" ? base.unref() : void 0;
    	    } else {
    	      return clearInterval(this.heartbeat);
    	    }
    	  }

    	  async __publish__(message) {
    	    await this.yieldLoop();
    	    return this.instance.Events.trigger("message", message.toString());
    	  }

    	  async __disconnect__(flush) {
    	    await this.yieldLoop();
    	    clearInterval(this.heartbeat);
    	    return this.Promise.resolve();
    	  }

    	  yieldLoop(t = 0) {
    	    return new this.Promise(function(resolve, reject) {
    	      return setTimeout(resolve, t);
    	    });
    	  }

    	  computePenalty() {
    	    var ref;
    	    return (ref = this.storeOptions.penalty) != null ? ref : (15 * this.storeOptions.minTime) || 5000;
    	  }

    	  async __updateSettings__(options) {
    	    await this.yieldLoop();
    	    parser$2.overwrite(options, options, this.storeOptions);
    	    this._startHeartbeat();
    	    this.instance._drainAll(this.computeCapacity());
    	    return true;
    	  }

    	  async __running__() {
    	    await this.yieldLoop();
    	    return this._running;
    	  }

    	  async __queued__() {
    	    await this.yieldLoop();
    	    return this.instance.queued();
    	  }

    	  async __done__() {
    	    await this.yieldLoop();
    	    return this._done;
    	  }

    	  async __groupCheck__(time) {
    	    await this.yieldLoop();
    	    return (this._nextRequest + this.timeout) < time;
    	  }

    	  computeCapacity() {
    	    var maxConcurrent, reservoir;
    	    ({maxConcurrent, reservoir} = this.storeOptions);
    	    if ((maxConcurrent != null) && (reservoir != null)) {
    	      return Math.min(maxConcurrent - this._running, reservoir);
    	    } else if (maxConcurrent != null) {
    	      return maxConcurrent - this._running;
    	    } else if (reservoir != null) {
    	      return reservoir;
    	    } else {
    	      return null;
    	    }
    	  }

    	  conditionsCheck(weight) {
    	    var capacity;
    	    capacity = this.computeCapacity();
    	    return (capacity == null) || weight <= capacity;
    	  }

    	  async __incrementReservoir__(incr) {
    	    var reservoir;
    	    await this.yieldLoop();
    	    reservoir = this.storeOptions.reservoir += incr;
    	    this.instance._drainAll(this.computeCapacity());
    	    return reservoir;
    	  }

    	  async __currentReservoir__() {
    	    await this.yieldLoop();
    	    return this.storeOptions.reservoir;
    	  }

    	  isBlocked(now) {
    	    return this._unblockTime >= now;
    	  }

    	  check(weight, now) {
    	    return this.conditionsCheck(weight) && (this._nextRequest - now) <= 0;
    	  }

    	  async __check__(weight) {
    	    var now;
    	    await this.yieldLoop();
    	    now = Date.now();
    	    return this.check(weight, now);
    	  }

    	  async __register__(index, weight, expiration) {
    	    var now, wait;
    	    await this.yieldLoop();
    	    now = Date.now();
    	    if (this.conditionsCheck(weight)) {
    	      this._running += weight;
    	      if (this.storeOptions.reservoir != null) {
    	        this.storeOptions.reservoir -= weight;
    	      }
    	      wait = Math.max(this._nextRequest - now, 0);
    	      this._nextRequest = now + wait + this.storeOptions.minTime;
    	      return {
    	        success: true,
    	        wait,
    	        reservoir: this.storeOptions.reservoir
    	      };
    	    } else {
    	      return {
    	        success: false
    	      };
    	    }
    	  }

    	  strategyIsBlock() {
    	    return this.storeOptions.strategy === 3;
    	  }

    	  async __submit__(queueLength, weight) {
    	    var blocked, now, reachedHWM;
    	    await this.yieldLoop();
    	    if ((this.storeOptions.maxConcurrent != null) && weight > this.storeOptions.maxConcurrent) {
    	      throw new BottleneckError$2(`Impossible to add a job having a weight of ${weight} to a limiter having a maxConcurrent setting of ${this.storeOptions.maxConcurrent}`);
    	    }
    	    now = Date.now();
    	    reachedHWM = (this.storeOptions.highWater != null) && queueLength === this.storeOptions.highWater && !this.check(weight, now);
    	    blocked = this.strategyIsBlock() && (reachedHWM || this.isBlocked(now));
    	    if (blocked) {
    	      this._unblockTime = now + this.computePenalty();
    	      this._nextRequest = this._unblockTime + this.storeOptions.minTime;
    	      this.instance._dropAllQueued();
    	    }
    	    return {
    	      reachedHWM,
    	      blocked,
    	      strategy: this.storeOptions.strategy
    	    };
    	  }

    	  async __free__(index, weight) {
    	    await this.yieldLoop();
    	    this._running -= weight;
    	    this._done += weight;
    	    this.instance._drainAll(this.computeCapacity());
    	    return {
    	      running: this._running
    	    };
    	  }

    	};

    	var LocalDatastore_1 = LocalDatastore;

    	var BottleneckError$3, States;

    	BottleneckError$3 = BottleneckError_1;

    	States = class States {
    	  constructor(status1) {
    	    this.status = status1;
    	    this._jobs = {};
    	    this.counts = this.status.map(function() {
    	      return 0;
    	    });
    	  }

    	  next(id) {
    	    var current, next;
    	    current = this._jobs[id];
    	    next = current + 1;
    	    if ((current != null) && next < this.status.length) {
    	      this.counts[current]--;
    	      this.counts[next]++;
    	      return this._jobs[id]++;
    	    } else if (current != null) {
    	      this.counts[current]--;
    	      return delete this._jobs[id];
    	    }
    	  }

    	  start(id) {
    	    var initial;
    	    initial = 0;
    	    this._jobs[id] = initial;
    	    return this.counts[initial]++;
    	  }

    	  remove(id) {
    	    var current;
    	    current = this._jobs[id];
    	    if (current != null) {
    	      this.counts[current]--;
    	      delete this._jobs[id];
    	    }
    	    return current != null;
    	  }

    	  jobStatus(id) {
    	    var ref;
    	    return (ref = this.status[this._jobs[id]]) != null ? ref : null;
    	  }

    	  statusJobs(status) {
    	    var k, pos, ref, results, v;
    	    if (status != null) {
    	      pos = this.status.indexOf(status);
    	      if (pos < 0) {
    	        throw new BottleneckError$3(`status must be one of ${this.status.join(', ')}`);
    	      }
    	      ref = this._jobs;
    	      results = [];
    	      for (k in ref) {
    	        v = ref[k];
    	        if (v === pos) {
    	          results.push(k);
    	        }
    	      }
    	      return results;
    	    } else {
    	      return Object.keys(this._jobs);
    	    }
    	  }

    	  statusCounts() {
    	    return this.counts.reduce(((acc, v, i) => {
    	      acc[this.status[i]] = v;
    	      return acc;
    	    }), {});
    	  }

    	};

    	var States_1 = States;

    	var DLList$2, Sync;

    	DLList$2 = DLList_1;

    	Sync = class Sync {
    	  constructor(name, Promise) {
    	    this.schedule = this.schedule.bind(this);
    	    this.name = name;
    	    this.Promise = Promise;
    	    this._running = 0;
    	    this._queue = new DLList$2();
    	  }

    	  isEmpty() {
    	    return this._queue.length === 0;
    	  }

    	  async _tryToRun() {
    	    var args, cb, error, reject, resolve, returned, task;
    	    if ((this._running < 1) && this._queue.length > 0) {
    	      this._running++;
    	      ({task, args, resolve, reject} = this._queue.shift());
    	      cb = (await (async function() {
    	        try {
    	          returned = (await task(...args));
    	          return function() {
    	            return resolve(returned);
    	          };
    	        } catch (error1) {
    	          error = error1;
    	          return function() {
    	            return reject(error);
    	          };
    	        }
    	      })());
    	      this._running--;
    	      this._tryToRun();
    	      return cb();
    	    }
    	  }

    	  schedule(task, ...args) {
    	    var promise, reject, resolve;
    	    resolve = reject = null;
    	    promise = new this.Promise(function(_resolve, _reject) {
    	      resolve = _resolve;
    	      return reject = _reject;
    	    });
    	    this._queue.push({task, args, resolve, reject});
    	    this._tryToRun();
    	    return promise;
    	  }

    	};

    	var Sync_1 = Sync;

    	var version = "2.19.5";
    	var version$1 = {
    		version: version
    	};

    	var version$2 = /*#__PURE__*/Object.freeze({
    		version: version,
    		default: version$1
    	});

    	var require$$2 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');

    	var require$$3 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');

    	var require$$4 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');

    	var Events$2, Group, IORedisConnection$1, RedisConnection$1, Scripts$1, parser$3;

    	parser$3 = parser;

    	Events$2 = Events_1;

    	RedisConnection$1 = require$$2;

    	IORedisConnection$1 = require$$3;

    	Scripts$1 = require$$4;

    	Group = (function() {
    	  class Group {
    	    constructor(limiterOptions = {}) {
    	      this.deleteKey = this.deleteKey.bind(this);
    	      this.limiterOptions = limiterOptions;
    	      parser$3.load(this.limiterOptions, this.defaults, this);
    	      this.Events = new Events$2(this);
    	      this.instances = {};
    	      this.Bottleneck = Bottleneck_1;
    	      this._startAutoCleanup();
    	      this.sharedConnection = this.connection != null;
    	      if (this.connection == null) {
    	        if (this.limiterOptions.datastore === "redis") {
    	          this.connection = new RedisConnection$1(Object.assign({}, this.limiterOptions, {Events: this.Events}));
    	        } else if (this.limiterOptions.datastore === "ioredis") {
    	          this.connection = new IORedisConnection$1(Object.assign({}, this.limiterOptions, {Events: this.Events}));
    	        }
    	      }
    	    }

    	    key(key = "") {
    	      var ref;
    	      return (ref = this.instances[key]) != null ? ref : (() => {
    	        var limiter;
    	        limiter = this.instances[key] = new this.Bottleneck(Object.assign(this.limiterOptions, {
    	          id: `${this.id}-${key}`,
    	          timeout: this.timeout,
    	          connection: this.connection
    	        }));
    	        this.Events.trigger("created", limiter, key);
    	        return limiter;
    	      })();
    	    }

    	    async deleteKey(key = "") {
    	      var deleted, instance;
    	      instance = this.instances[key];
    	      if (this.connection) {
    	        deleted = (await this.connection.__runCommand__(['del', ...Scripts$1.allKeys(`${this.id}-${key}`)]));
    	      }
    	      if (instance != null) {
    	        delete this.instances[key];
    	        await instance.disconnect();
    	      }
    	      return (instance != null) || deleted > 0;
    	    }

    	    limiters() {
    	      var k, ref, results, v;
    	      ref = this.instances;
    	      results = [];
    	      for (k in ref) {
    	        v = ref[k];
    	        results.push({
    	          key: k,
    	          limiter: v
    	        });
    	      }
    	      return results;
    	    }

    	    keys() {
    	      return Object.keys(this.instances);
    	    }

    	    async clusterKeys() {
    	      var cursor, end, found, i, k, keys, len, next, start;
    	      if (this.connection == null) {
    	        return this.Promise.resolve(this.keys());
    	      }
    	      keys = [];
    	      cursor = null;
    	      start = `b_${this.id}-`.length;
    	      end = "_settings".length;
    	      while (cursor !== 0) {
    	        [next, found] = (await this.connection.__runCommand__(["scan", cursor != null ? cursor : 0, "match", `b_${this.id}-*_settings`, "count", 10000]));
    	        cursor = ~~next;
    	        for (i = 0, len = found.length; i < len; i++) {
    	          k = found[i];
    	          keys.push(k.slice(start, -end));
    	        }
    	      }
    	      return keys;
    	    }

    	    _startAutoCleanup() {
    	      var base;
    	      clearInterval(this.interval);
    	      return typeof (base = (this.interval = setInterval(async() => {
    	        var e, k, ref, results, time, v;
    	        time = Date.now();
    	        ref = this.instances;
    	        results = [];
    	        for (k in ref) {
    	          v = ref[k];
    	          try {
    	            if ((await v._store.__groupCheck__(time))) {
    	              results.push(this.deleteKey(k));
    	            } else {
    	              results.push(void 0);
    	            }
    	          } catch (error) {
    	            e = error;
    	            results.push(v.Events.trigger("error", e));
    	          }
    	        }
    	        return results;
    	      }, this.timeout / 2))).unref === "function" ? base.unref() : void 0;
    	    }

    	    updateSettings(options = {}) {
    	      parser$3.overwrite(options, this.defaults, this);
    	      parser$3.overwrite(options, options, this.limiterOptions);
    	      if (options.timeout != null) {
    	        return this._startAutoCleanup();
    	      }
    	    }

    	    disconnect(flush = true) {
    	      var ref;
    	      if (!this.sharedConnection) {
    	        return (ref = this.connection) != null ? ref.disconnect(flush) : void 0;
    	      }
    	    }

    	  }
    	  Group.prototype.defaults = {
    	    timeout: 1000 * 60 * 5,
    	    connection: null,
    	    Promise: Promise,
    	    id: "group-key"
    	  };

    	  return Group;

    	}).call(commonjsGlobal$1);

    	var Group_1 = Group;

    	var Batcher, Events$3, parser$4;

    	parser$4 = parser;

    	Events$3 = Events_1;

    	Batcher = (function() {
    	  class Batcher {
    	    constructor(options = {}) {
    	      this.options = options;
    	      parser$4.load(this.options, this.defaults, this);
    	      this.Events = new Events$3(this);
    	      this._arr = [];
    	      this._resetPromise();
    	      this._lastFlush = Date.now();
    	    }

    	    _resetPromise() {
    	      return this._promise = new this.Promise((res, rej) => {
    	        return this._resolve = res;
    	      });
    	    }

    	    _flush() {
    	      clearTimeout(this._timeout);
    	      this._lastFlush = Date.now();
    	      this._resolve();
    	      this.Events.trigger("batch", this._arr);
    	      this._arr = [];
    	      return this._resetPromise();
    	    }

    	    add(data) {
    	      var ret;
    	      this._arr.push(data);
    	      ret = this._promise;
    	      if (this._arr.length === this.maxSize) {
    	        this._flush();
    	      } else if ((this.maxTime != null) && this._arr.length === 1) {
    	        this._timeout = setTimeout(() => {
    	          return this._flush();
    	        }, this.maxTime);
    	      }
    	      return ret;
    	    }

    	  }
    	  Batcher.prototype.defaults = {
    	    maxTime: null,
    	    maxSize: null,
    	    Promise: Promise
    	  };

    	  return Batcher;

    	}).call(commonjsGlobal$1);

    	var Batcher_1 = Batcher;

    	var require$$4$1 = () => console.log('You must import the full version of Bottleneck in order to use this feature.');

    	var require$$8 = getCjsExportFromNamespace(version$2);

    	var Bottleneck, DEFAULT_PRIORITY$1, Events$4, Job$1, LocalDatastore$1, NUM_PRIORITIES$1, Queues$1, RedisDatastore$1, States$1, Sync$1, parser$5,
    	  splice = [].splice;

    	NUM_PRIORITIES$1 = 10;

    	DEFAULT_PRIORITY$1 = 5;

    	parser$5 = parser;

    	Queues$1 = Queues_1;

    	Job$1 = Job_1;

    	LocalDatastore$1 = LocalDatastore_1;

    	RedisDatastore$1 = require$$4$1;

    	Events$4 = Events_1;

    	States$1 = States_1;

    	Sync$1 = Sync_1;

    	Bottleneck = (function() {
    	  class Bottleneck {
    	    constructor(options = {}, ...invalid) {
    	      var storeInstanceOptions, storeOptions;
    	      this._addToQueue = this._addToQueue.bind(this);
    	      this._validateOptions(options, invalid);
    	      parser$5.load(options, this.instanceDefaults, this);
    	      this._queues = new Queues$1(NUM_PRIORITIES$1);
    	      this._scheduled = {};
    	      this._states = new States$1(["RECEIVED", "QUEUED", "RUNNING", "EXECUTING"].concat(this.trackDoneStatus ? ["DONE"] : []));
    	      this._limiter = null;
    	      this.Events = new Events$4(this);
    	      this._submitLock = new Sync$1("submit", this.Promise);
    	      this._registerLock = new Sync$1("register", this.Promise);
    	      storeOptions = parser$5.load(options, this.storeDefaults, {});
    	      this._store = (function() {
    	        if (this.datastore === "redis" || this.datastore === "ioredis" || (this.connection != null)) {
    	          storeInstanceOptions = parser$5.load(options, this.redisStoreDefaults, {});
    	          return new RedisDatastore$1(this, storeOptions, storeInstanceOptions);
    	        } else if (this.datastore === "local") {
    	          storeInstanceOptions = parser$5.load(options, this.localStoreDefaults, {});
    	          return new LocalDatastore$1(this, storeOptions, storeInstanceOptions);
    	        } else {
    	          throw new Bottleneck.prototype.BottleneckError(`Invalid datastore type: ${this.datastore}`);
    	        }
    	      }).call(this);
    	      this._queues.on("leftzero", () => {
    	        var ref;
    	        return (ref = this._store.heartbeat) != null ? typeof ref.ref === "function" ? ref.ref() : void 0 : void 0;
    	      });
    	      this._queues.on("zero", () => {
    	        var ref;
    	        return (ref = this._store.heartbeat) != null ? typeof ref.unref === "function" ? ref.unref() : void 0 : void 0;
    	      });
    	    }

    	    _validateOptions(options, invalid) {
    	      if (!((options != null) && typeof options === "object" && invalid.length === 0)) {
    	        throw new Bottleneck.prototype.BottleneckError("Bottleneck v2 takes a single object argument. Refer to https://github.com/SGrondin/bottleneck#upgrading-to-v2 if you're upgrading from Bottleneck v1.");
    	      }
    	    }

    	    ready() {
    	      return this._store.ready;
    	    }

    	    clients() {
    	      return this._store.clients;
    	    }

    	    channel() {
    	      return `b_${this.id}`;
    	    }

    	    channel_client() {
    	      return `b_${this.id}_${this._store.clientId}`;
    	    }

    	    publish(message) {
    	      return this._store.__publish__(message);
    	    }

    	    disconnect(flush = true) {
    	      return this._store.__disconnect__(flush);
    	    }

    	    chain(_limiter) {
    	      this._limiter = _limiter;
    	      return this;
    	    }

    	    queued(priority) {
    	      return this._queues.queued(priority);
    	    }

    	    clusterQueued() {
    	      return this._store.__queued__();
    	    }

    	    empty() {
    	      return this.queued() === 0 && this._submitLock.isEmpty();
    	    }

    	    running() {
    	      return this._store.__running__();
    	    }

    	    done() {
    	      return this._store.__done__();
    	    }

    	    jobStatus(id) {
    	      return this._states.jobStatus(id);
    	    }

    	    jobs(status) {
    	      return this._states.statusJobs(status);
    	    }

    	    counts() {
    	      return this._states.statusCounts();
    	    }

    	    _randomIndex() {
    	      return Math.random().toString(36).slice(2);
    	    }

    	    check(weight = 1) {
    	      return this._store.__check__(weight);
    	    }

    	    _clearGlobalState(index) {
    	      if (this._scheduled[index] != null) {
    	        clearTimeout(this._scheduled[index].expiration);
    	        delete this._scheduled[index];
    	        return true;
    	      } else {
    	        return false;
    	      }
    	    }

    	    async _free(index, job, options, eventInfo) {
    	      var e, running;
    	      try {
    	        ({running} = (await this._store.__free__(index, options.weight)));
    	        this.Events.trigger("debug", `Freed ${options.id}`, eventInfo);
    	        if (running === 0 && this.empty()) {
    	          return this.Events.trigger("idle");
    	        }
    	      } catch (error1) {
    	        e = error1;
    	        return this.Events.trigger("error", e);
    	      }
    	    }

    	    _run(index, job, wait) {
    	      var clearGlobalState, free, run;
    	      job.doRun();
    	      clearGlobalState = this._clearGlobalState.bind(this, index);
    	      run = this._run.bind(this, index, job);
    	      free = this._free.bind(this, index, job);
    	      return this._scheduled[index] = {
    	        timeout: setTimeout(() => {
    	          return job.doExecute(this._limiter, clearGlobalState, run, free);
    	        }, wait),
    	        expiration: job.options.expiration != null ? setTimeout(function() {
    	          return job.doExpire(clearGlobalState, run, free);
    	        }, wait + job.options.expiration) : void 0,
    	        job: job
    	      };
    	    }

    	    _drainOne(capacity) {
    	      return this._registerLock.schedule(() => {
    	        var args, index, next, options, queue;
    	        if (this.queued() === 0) {
    	          return this.Promise.resolve(null);
    	        }
    	        queue = this._queues.getFirst();
    	        ({options, args} = next = queue.first());
    	        if ((capacity != null) && options.weight > capacity) {
    	          return this.Promise.resolve(null);
    	        }
    	        this.Events.trigger("debug", `Draining ${options.id}`, {args, options});
    	        index = this._randomIndex();
    	        return this._store.__register__(index, options.weight, options.expiration).then(({success, wait, reservoir}) => {
    	          var empty;
    	          this.Events.trigger("debug", `Drained ${options.id}`, {success, args, options});
    	          if (success) {
    	            queue.shift();
    	            empty = this.empty();
    	            if (empty) {
    	              this.Events.trigger("empty");
    	            }
    	            if (reservoir === 0) {
    	              this.Events.trigger("depleted", empty);
    	            }
    	            this._run(index, next, wait);
    	            return this.Promise.resolve(options.weight);
    	          } else {
    	            return this.Promise.resolve(null);
    	          }
    	        });
    	      });
    	    }

    	    _drainAll(capacity, total = 0) {
    	      return this._drainOne(capacity).then((drained) => {
    	        var newCapacity;
    	        if (drained != null) {
    	          newCapacity = capacity != null ? capacity - drained : capacity;
    	          return this._drainAll(newCapacity, total + drained);
    	        } else {
    	          return this.Promise.resolve(total);
    	        }
    	      }).catch((e) => {
    	        return this.Events.trigger("error", e);
    	      });
    	    }

    	    _dropAllQueued(message) {
    	      return this._queues.shiftAll(function(job) {
    	        return job.doDrop({message});
    	      });
    	    }

    	    stop(options = {}) {
    	      var done, waitForExecuting;
    	      options = parser$5.load(options, this.stopDefaults);
    	      waitForExecuting = (at) => {
    	        var finished;
    	        finished = () => {
    	          var counts;
    	          counts = this._states.counts;
    	          return (counts[0] + counts[1] + counts[2] + counts[3]) === at;
    	        };
    	        return new this.Promise((resolve, reject) => {
    	          if (finished()) {
    	            return resolve();
    	          } else {
    	            return this.on("done", () => {
    	              if (finished()) {
    	                this.removeAllListeners("done");
    	                return resolve();
    	              }
    	            });
    	          }
    	        });
    	      };
    	      done = options.dropWaitingJobs ? (this._run = function(index, next) {
    	        return next.doDrop({
    	          message: options.dropErrorMessage
    	        });
    	      }, this._drainOne = () => {
    	        return this.Promise.resolve(null);
    	      }, this._registerLock.schedule(() => {
    	        return this._submitLock.schedule(() => {
    	          var k, ref, v;
    	          ref = this._scheduled;
    	          for (k in ref) {
    	            v = ref[k];
    	            if (this.jobStatus(v.job.options.id) === "RUNNING") {
    	              clearTimeout(v.timeout);
    	              clearTimeout(v.expiration);
    	              v.job.doDrop({
    	                message: options.dropErrorMessage
    	              });
    	            }
    	          }
    	          this._dropAllQueued(options.dropErrorMessage);
    	          return waitForExecuting(0);
    	        });
    	      })) : this.schedule({
    	        priority: NUM_PRIORITIES$1 - 1,
    	        weight: 0
    	      }, () => {
    	        return waitForExecuting(1);
    	      });
    	      this._receive = function(job) {
    	        return job._reject(new Bottleneck.prototype.BottleneckError(options.enqueueErrorMessage));
    	      };
    	      this.stop = () => {
    	        return this.Promise.reject(new Bottleneck.prototype.BottleneckError("stop() has already been called"));
    	      };
    	      return done;
    	    }

    	    async _addToQueue(job) {
    	      var args, blocked, error, options, reachedHWM, shifted, strategy;
    	      ({args, options} = job);
    	      try {
    	        ({reachedHWM, blocked, strategy} = (await this._store.__submit__(this.queued(), options.weight)));
    	      } catch (error1) {
    	        error = error1;
    	        this.Events.trigger("debug", `Could not queue ${options.id}`, {args, options, error});
    	        job.doDrop({error});
    	        return false;
    	      }
    	      if (blocked) {
    	        job.doDrop();
    	        return true;
    	      } else if (reachedHWM) {
    	        shifted = strategy === Bottleneck.prototype.strategy.LEAK ? this._queues.shiftLastFrom(options.priority) : strategy === Bottleneck.prototype.strategy.OVERFLOW_PRIORITY ? this._queues.shiftLastFrom(options.priority + 1) : strategy === Bottleneck.prototype.strategy.OVERFLOW ? job : void 0;
    	        if (shifted != null) {
    	          shifted.doDrop();
    	        }
    	        if ((shifted == null) || strategy === Bottleneck.prototype.strategy.OVERFLOW) {
    	          if (shifted == null) {
    	            job.doDrop();
    	          }
    	          return reachedHWM;
    	        }
    	      }
    	      job.doQueue(reachedHWM, blocked);
    	      this._queues.push(job);
    	      await this._drainAll();
    	      return reachedHWM;
    	    }

    	    _receive(job) {
    	      if (this._states.jobStatus(job.options.id) != null) {
    	        job._reject(new Bottleneck.prototype.BottleneckError(`A job with the same id already exists (id=${job.options.id})`));
    	        return false;
    	      } else {
    	        job.doReceive();
    	        return this._submitLock.schedule(this._addToQueue, job);
    	      }
    	    }

    	    submit(...args) {
    	      var cb, fn, job, options, ref, ref1, task;
    	      if (typeof args[0] === "function") {
    	        ref = args, [fn, ...args] = ref, [cb] = splice.call(args, -1);
    	        options = parser$5.load({}, this.jobDefaults);
    	      } else {
    	        ref1 = args, [options, fn, ...args] = ref1, [cb] = splice.call(args, -1);
    	        options = parser$5.load(options, this.jobDefaults);
    	      }
    	      task = (...args) => {
    	        return new this.Promise(function(resolve, reject) {
    	          return fn(...args, function(...args) {
    	            return (args[0] != null ? reject : resolve)(args);
    	          });
    	        });
    	      };
    	      job = new Job$1(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
    	      job.promise.then(function(args) {
    	        return typeof cb === "function" ? cb(...args) : void 0;
    	      }).catch(function(args) {
    	        if (Array.isArray(args)) {
    	          return typeof cb === "function" ? cb(...args) : void 0;
    	        } else {
    	          return typeof cb === "function" ? cb(args) : void 0;
    	        }
    	      });
    	      return this._receive(job);
    	    }

    	    schedule(...args) {
    	      var job, options, task;
    	      if (typeof args[0] === "function") {
    	        [task, ...args] = args;
    	        options = {};
    	      } else {
    	        [options, task, ...args] = args;
    	      }
    	      job = new Job$1(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
    	      this._receive(job);
    	      return job.promise;
    	    }

    	    wrap(fn) {
    	      var schedule, wrapped;
    	      schedule = this.schedule.bind(this);
    	      wrapped = function(...args) {
    	        return schedule(fn.bind(this), ...args);
    	      };
    	      wrapped.withOptions = function(options, ...args) {
    	        return schedule(options, fn, ...args);
    	      };
    	      return wrapped;
    	    }

    	    async updateSettings(options = {}) {
    	      await this._store.__updateSettings__(parser$5.overwrite(options, this.storeDefaults));
    	      parser$5.overwrite(options, this.instanceDefaults, this);
    	      return this;
    	    }

    	    currentReservoir() {
    	      return this._store.__currentReservoir__();
    	    }

    	    incrementReservoir(incr = 0) {
    	      return this._store.__incrementReservoir__(incr);
    	    }

    	  }
    	  Bottleneck.default = Bottleneck;

    	  Bottleneck.Events = Events$4;

    	  Bottleneck.version = Bottleneck.prototype.version = require$$8.version;

    	  Bottleneck.strategy = Bottleneck.prototype.strategy = {
    	    LEAK: 1,
    	    OVERFLOW: 2,
    	    OVERFLOW_PRIORITY: 4,
    	    BLOCK: 3
    	  };

    	  Bottleneck.BottleneckError = Bottleneck.prototype.BottleneckError = BottleneckError_1;

    	  Bottleneck.Group = Bottleneck.prototype.Group = Group_1;

    	  Bottleneck.RedisConnection = Bottleneck.prototype.RedisConnection = require$$2;

    	  Bottleneck.IORedisConnection = Bottleneck.prototype.IORedisConnection = require$$3;

    	  Bottleneck.Batcher = Bottleneck.prototype.Batcher = Batcher_1;

    	  Bottleneck.prototype.jobDefaults = {
    	    priority: DEFAULT_PRIORITY$1,
    	    weight: 1,
    	    expiration: null,
    	    id: "<no-id>"
    	  };

    	  Bottleneck.prototype.storeDefaults = {
    	    maxConcurrent: null,
    	    minTime: 0,
    	    highWater: null,
    	    strategy: Bottleneck.prototype.strategy.LEAK,
    	    penalty: null,
    	    reservoir: null,
    	    reservoirRefreshInterval: null,
    	    reservoirRefreshAmount: null,
    	    reservoirIncreaseInterval: null,
    	    reservoirIncreaseAmount: null,
    	    reservoirIncreaseMaximum: null
    	  };

    	  Bottleneck.prototype.localStoreDefaults = {
    	    Promise: Promise,
    	    timeout: null,
    	    heartbeatInterval: 250
    	  };

    	  Bottleneck.prototype.redisStoreDefaults = {
    	    Promise: Promise,
    	    timeout: null,
    	    heartbeatInterval: 5000,
    	    clientTimeout: 10000,
    	    Redis: null,
    	    clientOptions: {},
    	    clusterNodes: null,
    	    clearDatastore: false,
    	    connection: null
    	  };

    	  Bottleneck.prototype.instanceDefaults = {
    	    datastore: "local",
    	    connection: null,
    	    id: "<no-id>",
    	    rejectOnDrop: true,
    	    trackDoneStatus: false,
    	    Promise: Promise
    	  };

    	  Bottleneck.prototype.stopDefaults = {
    	    enqueueErrorMessage: "This limiter has been stopped and cannot accept new jobs.",
    	    dropWaitingJobs: true,
    	    dropErrorMessage: "This limiter has been stopped."
    	  };

    	  return Bottleneck;

    	}).call(commonjsGlobal$1);

    	var Bottleneck_1 = Bottleneck;

    	var lib = Bottleneck_1;

    	return lib;

    })));
    });

    // @ts-ignore
    async function errorRequest(octokit, state, error, options) {
        if (!error.request || !error.request.request) {
            // address https://github.com/octokit/plugin-retry.js/issues/8
            throw error;
        }
        // retry all >= 400 && not doNotRetry
        if (error.status >= 400 && !state.doNotRetry.includes(error.status)) {
            const retries = options.request.retries != null ? options.request.retries : state.retries;
            const retryAfter = Math.pow((options.request.retryCount || 0) + 1, 2);
            throw octokit.retry.retryRequest(error, retries, retryAfter);
        }
        // Maybe eventually there will be more cases here
        throw error;
    }

    // @ts-ignore
    // @ts-ignore
    async function wrapRequest(state, request, options) {
        const limiter = new light();
        // @ts-ignore
        limiter.on("failed", function (error, info) {
            const maxRetries = ~~error.request.request.retries;
            const after = ~~error.request.request.retryAfter;
            options.request.retryCount = info.retryCount + 1;
            if (maxRetries > info.retryCount) {
                // Returning a number instructs the limiter to retry
                // the request after that number of milliseconds have passed
                return after * state.retryAfterBaseValue;
            }
        });
        return limiter.schedule(request, options);
    }

    const VERSION$8 = "3.0.9";
    function retry(octokit, octokitOptions) {
        const state = Object.assign({
            enabled: true,
            retryAfterBaseValue: 1000,
            doNotRetry: [400, 401, 403, 404, 422],
            retries: 3,
        }, octokitOptions.retry);
        if (state.enabled) {
            octokit.hook.error("request", errorRequest.bind(null, octokit, state));
            octokit.hook.wrap("request", wrapRequest.bind(null, state));
        }
        return {
            retry: {
                retryRequest: (error, retries, retryAfter) => {
                    error.request.request = Object.assign({}, error.request.request, {
                        retries: retries,
                        retryAfter: retryAfter,
                    });
                    return error;
                },
            },
        };
    }
    retry.VERSION = VERSION$8;

    var btoaBrowser = function _btoa(str) {
      return btoa(str)
    };

    function oauthAuthorizationUrl$1(options) {
        const clientType = options.clientType || "oauth-app";
        const baseUrl = options.baseUrl || "https://github.com";
        const result = {
            clientType,
            allowSignup: options.allowSignup === false ? false : true,
            clientId: options.clientId,
            login: options.login || null,
            redirectUrl: options.redirectUrl || null,
            state: options.state || Math.random().toString(36).substr(2),
            url: "",
        };
        if (clientType === "oauth-app") {
            const scopes = "scopes" in options ? options.scopes : [];
            result.scopes =
                typeof scopes === "string"
                    ? scopes.split(/[,\s]+/).filter(Boolean)
                    : scopes;
        }
        result.url = urlBuilderAuthorize(`${baseUrl}/login/oauth/authorize`, result);
        return result;
    }
    function urlBuilderAuthorize(base, options) {
        const map = {
            allowSignup: "allow_signup",
            clientId: "client_id",
            login: "login",
            redirectUrl: "redirect_uri",
            scopes: "scope",
            state: "state",
        };
        let url = base;
        Object.keys(map)
            // Filter out keys that are null and remove the url key
            .filter((k) => options[k] !== null)
            // Filter out empty scopes array
            .filter((k) => {
            if (k !== "scopes")
                return true;
            if (options.clientType === "github-app")
                return false;
            return !Array.isArray(options[k]) || options[k].length > 0;
        })
            // Map Array with the proper URL parameter names and change the value to a string using template strings
            // @ts-ignore
            .map((key) => [map[key], `${options[key]}`])
            // Finally, build the URL
            .forEach(([key, value], index) => {
            url += index === 0 ? `?` : "&";
            url += `${key}=${encodeURIComponent(value)}`;
        });
        return url;
    }

    var distWeb$5 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        oauthAuthorizationUrl: oauthAuthorizationUrl$1
    });

    var oauthAuthorizationUrl = /*@__PURE__*/getAugmentedNamespace(distWeb$5);

    var request = /*@__PURE__*/getAugmentedNamespace(distWeb$8);

    var requestError = /*@__PURE__*/getAugmentedNamespace(distWeb$9);

    function _interopDefault$2 (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }




    var btoa$1 = _interopDefault$2(btoaBrowser);

    const VERSION$7 = "1.2.6";

    function ownKeys$2(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);

        if (enumerableOnly) {
          symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }

        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2$2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys$2(Object(source), true).forEach(function (key) {
            _defineProperty$2(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys$2(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    function _defineProperty$2(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;

      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }

      return target;
    }

    function _objectWithoutProperties(source, excluded) {
      if (source == null) return {};

      var target = _objectWithoutPropertiesLoose(source, excluded);

      var key, i;

      if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

        for (i = 0; i < sourceSymbolKeys.length; i++) {
          key = sourceSymbolKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
          target[key] = source[key];
        }
      }

      return target;
    }

    function requestToOAuthBaseUrl(request) {
      const endpointDefaults = request.endpoint.DEFAULTS;
      return /^https:\/\/(api\.)?github\.com$/.test(endpointDefaults.baseUrl) ? "https://github.com" : endpointDefaults.baseUrl.replace("/api/v3", "");
    }
    async function oauthRequest(request, route, parameters) {
      const withOAuthParameters = _objectSpread2$2({
        baseUrl: requestToOAuthBaseUrl(request),
        headers: {
          accept: "application/json"
        }
      }, parameters);

      const response = await request(route, withOAuthParameters);

      if ("error" in response.data) {
        const error = new requestError.RequestError(`${response.data.error_description} (${response.data.error}, ${response.data.error_uri})`, 400, {
          request: request.endpoint.merge(route, withOAuthParameters),
          headers: response.headers
        }); // @ts-ignore add custom response property until https://github.com/octokit/request-error.js/issues/169 is resolved

        error.response = response;
        throw error;
      }

      return response;
    }

    const _excluded = ["request"];
    function getWebFlowAuthorizationUrl(_ref) {
      let {
        request: request$1 = request.request
      } = _ref,
          options = _objectWithoutProperties(_ref, _excluded);

      const baseUrl = requestToOAuthBaseUrl(request$1); // @ts-expect-error TypeScript wants `clientType` to be set explicitly ¯\_(ツ)_/¯

      return oauthAuthorizationUrl.oauthAuthorizationUrl(_objectSpread2$2(_objectSpread2$2({}, options), {}, {
        baseUrl
      }));
    }

    async function exchangeWebFlowCode(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const response = await oauthRequest(request$1, "POST /login/oauth/access_token", {
        client_id: options.clientId,
        client_secret: options.clientSecret,
        code: options.code,
        redirect_uri: options.redirectUrl
      });
      const authentication = {
        clientType: options.clientType,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        token: response.data.access_token,
        scopes: response.data.scope.split(/\s+/).filter(Boolean)
      };

      if (options.clientType === "github-app") {
        if ("refresh_token" in response.data) {
          const apiTimeInMs = new Date(response.headers.date).getTime();
          authentication.refreshToken = response.data.refresh_token, authentication.expiresAt = toTimestamp(apiTimeInMs, response.data.expires_in), authentication.refreshTokenExpiresAt = toTimestamp(apiTimeInMs, response.data.refresh_token_expires_in);
        }

        delete authentication.scopes;
      }

      return _objectSpread2$2(_objectSpread2$2({}, response), {}, {
        authentication
      });
    }

    function toTimestamp(apiTimeInMs, expirationInSeconds) {
      return new Date(apiTimeInMs + expirationInSeconds * 1000).toISOString();
    }

    async function createDeviceCode(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const parameters = {
        client_id: options.clientId
      };

      if ("scopes" in options && Array.isArray(options.scopes)) {
        parameters.scope = options.scopes.join(" ");
      }

      return oauthRequest(request$1, "POST /login/device/code", parameters);
    }

    async function exchangeDeviceCode(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const response = await oauthRequest(request$1, "POST /login/oauth/access_token", {
        client_id: options.clientId,
        device_code: options.code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code"
      });
      const authentication = {
        clientType: options.clientType,
        clientId: options.clientId,
        token: response.data.access_token,
        scopes: response.data.scope.split(/\s+/).filter(Boolean)
      };

      if ("clientSecret" in options) {
        authentication.clientSecret = options.clientSecret;
      }

      if (options.clientType === "github-app") {
        if ("refresh_token" in response.data) {
          const apiTimeInMs = new Date(response.headers.date).getTime();
          authentication.refreshToken = response.data.refresh_token, authentication.expiresAt = toTimestamp$1(apiTimeInMs, response.data.expires_in), authentication.refreshTokenExpiresAt = toTimestamp$1(apiTimeInMs, response.data.refresh_token_expires_in);
        }

        delete authentication.scopes;
      }

      return _objectSpread2$2(_objectSpread2$2({}, response), {}, {
        authentication
      });
    }

    function toTimestamp$1(apiTimeInMs, expirationInSeconds) {
      return new Date(apiTimeInMs + expirationInSeconds * 1000).toISOString();
    }

    async function checkToken(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const response = await request$1("POST /applications/{client_id}/token", {
        headers: {
          authorization: `basic ${btoa$1(`${options.clientId}:${options.clientSecret}`)}`
        },
        client_id: options.clientId,
        access_token: options.token
      });
      const authentication = {
        clientType: options.clientType,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        token: options.token,
        scopes: response.data.scopes
      };
      if (response.data.expires_at) authentication.expiresAt = response.data.expires_at;

      if (options.clientType === "github-app") {
        delete authentication.scopes;
      }

      return _objectSpread2$2(_objectSpread2$2({}, response), {}, {
        authentication
      });
    }

    async function refreshToken(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const response = await oauthRequest(request$1, "POST /login/oauth/access_token", {
        client_id: options.clientId,
        client_secret: options.clientSecret,
        grant_type: "refresh_token",
        refresh_token: options.refreshToken
      });
      const apiTimeInMs = new Date(response.headers.date).getTime();
      const authentication = {
        clientType: "github-app",
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: toTimestamp$2(apiTimeInMs, response.data.expires_in),
        refreshTokenExpiresAt: toTimestamp$2(apiTimeInMs, response.data.refresh_token_expires_in)
      };
      return _objectSpread2$2(_objectSpread2$2({}, response), {}, {
        authentication
      });
    }

    function toTimestamp$2(apiTimeInMs, expirationInSeconds) {
      return new Date(apiTimeInMs + expirationInSeconds * 1000).toISOString();
    }

    const _excluded$1 = ["request", "clientType", "clientId", "clientSecret", "token"];
    async function scopeToken(options) {
      const {
        request: request$1,
        clientType,
        clientId,
        clientSecret,
        token
      } = options,
            requestOptions = _objectWithoutProperties(options, _excluded$1);

      const response = await (request$1 ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request)("POST /applications/{client_id}/token/scoped", _objectSpread2$2({
        headers: {
          authorization: `basic ${btoa$1(`${clientId}:${clientSecret}`)}`
        },
        client_id: clientId,
        access_token: token
      }, requestOptions));
      const authentication = Object.assign({
        clientType,
        clientId,
        clientSecret,
        token: response.data.token
      }, response.data.expires_at ? {
        expiresAt: response.data.expires_at
      } : {});
      return _objectSpread2$2(_objectSpread2$2({}, response), {}, {
        authentication
      });
    }

    async function resetToken(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const auth = btoa$1(`${options.clientId}:${options.clientSecret}`);
      const response = await request$1("PATCH /applications/{client_id}/token", {
        headers: {
          authorization: `basic ${auth}`
        },
        client_id: options.clientId,
        access_token: options.token
      });
      const authentication = {
        clientType: options.clientType,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        token: response.data.token,
        scopes: response.data.scopes
      };
      if (response.data.expires_at) authentication.expiresAt = response.data.expires_at;

      if (options.clientType === "github-app") {
        delete authentication.scopes;
      }

      return _objectSpread2$2(_objectSpread2$2({}, response), {}, {
        authentication
      });
    }

    async function deleteToken(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const auth = btoa$1(`${options.clientId}:${options.clientSecret}`);
      return request$1("DELETE /applications/{client_id}/token", {
        headers: {
          authorization: `basic ${auth}`
        },
        client_id: options.clientId,
        access_token: options.token
      });
    }

    async function deleteAuthorization(options) {
      const request$1 = options.request ||
      /* istanbul ignore next: we always pass a custom request in tests */
      request.request;
      const auth = btoa$1(`${options.clientId}:${options.clientSecret}`);
      return request$1("DELETE /applications/{client_id}/grant", {
        headers: {
          authorization: `basic ${auth}`
        },
        client_id: options.clientId,
        access_token: options.token
      });
    }

    var VERSION_1 = VERSION$7;
    var checkToken_1 = checkToken;
    var createDeviceCode_1 = createDeviceCode;
    var deleteAuthorization_1 = deleteAuthorization;
    var deleteToken_1 = deleteToken;
    var exchangeDeviceCode_1 = exchangeDeviceCode;
    var exchangeWebFlowCode_1 = exchangeWebFlowCode;
    var getWebFlowAuthorizationUrl_1 = getWebFlowAuthorizationUrl;
    var refreshToken_1 = refreshToken;
    var resetToken_1 = resetToken;
    var scopeToken_1 = scopeToken;


    var distNode$1 = /*#__PURE__*/Object.defineProperty({
    	VERSION: VERSION_1,
    	checkToken: checkToken_1,
    	createDeviceCode: createDeviceCode_1,
    	deleteAuthorization: deleteAuthorization_1,
    	deleteToken: deleteToken_1,
    	exchangeDeviceCode: exchangeDeviceCode_1,
    	exchangeWebFlowCode: exchangeWebFlowCode_1,
    	getWebFlowAuthorizationUrl: getWebFlowAuthorizationUrl_1,
    	refreshToken: refreshToken_1,
    	resetToken: resetToken_1,
    	scopeToken: scopeToken_1
    }, '__esModule', {value: true});

    async function getOAuthAccessToken(state, options) {
        const cachedAuthentication = getCachedAuthentication(state, options.auth);
        if (cachedAuthentication)
            return cachedAuthentication;
        // Step 1: Request device and user codes
        // https://docs.github.com/en/developers/apps/authorizing-oauth-apps#step-1-app-requests-the-device-and-user-verification-codes-from-github
        const { data: verification } = await createDeviceCode_1({
            clientType: state.clientType,
            clientId: state.clientId,
            request: options.request || state.request,
            // @ts-expect-error the extra code to make TS happy is not worth it
            scopes: options.auth.scopes || state.scopes,
        });
        // Step 2: User must enter the user code on https://github.com/login/device
        // See https://docs.github.com/en/developers/apps/authorizing-oauth-apps#step-2-prompt-the-user-to-enter-the-user-code-in-a-browser
        await state.onVerification(verification);
        // Step 3: Exchange device code for access token
        // See https://docs.github.com/en/developers/apps/authorizing-oauth-apps#step-3-app-polls-github-to-check-if-the-user-authorized-the-device
        const authentication = await waitForAccessToken(options.request || state.request, state.clientId, state.clientType, verification);
        state.authentication = authentication;
        return authentication;
    }
    function getCachedAuthentication(state, auth) {
        if (auth.refresh === true)
            return false;
        if (!state.authentication)
            return false;
        if (state.clientType === "github-app") {
            return state.authentication;
        }
        const authentication = state.authentication;
        const newScope = (("scopes" in auth && auth.scopes) || state.scopes).join(" ");
        const currentScope = authentication.scopes.join(" ");
        return newScope === currentScope ? authentication : false;
    }
    async function wait(seconds) {
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
    async function waitForAccessToken(request, clientId, clientType, verification) {
        try {
            const options = {
                clientId,
                request,
                code: verification.device_code,
            };
            // WHY TYPESCRIPT WHY ARE YOU DOING THIS TO ME
            const { authentication } = clientType === "oauth-app"
                ? await exchangeDeviceCode_1({
                    ...options,
                    clientType: "oauth-app",
                })
                : await exchangeDeviceCode_1({
                    ...options,
                    clientType: "github-app",
                });
            return {
                type: "token",
                tokenType: "oauth",
                ...authentication,
            };
        }
        catch (error) {
            // istanbul ignore if
            if (!error.response)
                throw error;
            const errorType = error.response.data.error;
            if (errorType === "authorization_pending") {
                await wait(verification.interval);
                return waitForAccessToken(request, clientId, clientType, verification);
            }
            if (errorType === "slow_down") {
                await wait(verification.interval + 5);
                return waitForAccessToken(request, clientId, clientType, verification);
            }
            throw error;
        }
    }

    async function auth$4(state, authOptions) {
        return getOAuthAccessToken(state, {
            auth: authOptions,
        });
    }

    async function hook$4(state, request, route, parameters) {
        let endpoint = request.endpoint.merge(route, parameters);
        // Do not intercept request to retrieve codes or token
        if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) {
            return request(endpoint);
        }
        const { token } = await getOAuthAccessToken(state, {
            request,
            auth: { type: "oauth" },
        });
        endpoint.headers.authorization = `token ${token}`;
        return request(endpoint);
    }

    const VERSION$6 = "3.1.2";

    function createOAuthDeviceAuth(options) {
        const requestWithDefaults = options.request ||
            request$1.defaults({
                headers: {
                    "user-agent": `octokit-auth-oauth-device.js/${VERSION$6} ${getUserAgent()}`,
                },
            });
        const { request: request$1$1 = requestWithDefaults, ...otherOptions } = options;
        const state = options.clientType === "github-app"
            ? {
                ...otherOptions,
                clientType: "github-app",
                request: request$1$1,
            }
            : {
                ...otherOptions,
                clientType: "oauth-app",
                request: request$1$1,
                scopes: options.scopes || [],
            };
        if (!options.clientId) {
            throw new Error('[@octokit/auth-oauth-device] "clientId" option must be set (https://github.com/octokit/auth-oauth-device.js#usage)');
        }
        if (!options.onVerification) {
            throw new Error('[@octokit/auth-oauth-device] "onVerification" option must be a function (https://github.com/octokit/auth-oauth-device.js#usage)');
        }
        // @ts-ignore too much for tsc / ts-jest ¯\_(ツ)_/¯
        return Object.assign(auth$4.bind(null, state), {
            hook: hook$4.bind(null, state),
        });
    }

    const VERSION$5 = "1.3.0";

    // @ts-nocheck there is only place for one of us in this file. And it's not you, TS
    async function getAuthentication(state) {
        // handle code exchange form OAuth Web Flow
        if ("code" in state.strategyOptions) {
            const { authentication } = await exchangeWebFlowCode_1({
                clientId: state.clientId,
                clientSecret: state.clientSecret,
                clientType: state.clientType,
                ...state.strategyOptions,
                request: state.request,
            });
            return {
                type: "token",
                tokenType: "oauth",
                ...authentication,
            };
        }
        // handle OAuth device flow
        if ("onVerification" in state.strategyOptions) {
            const deviceAuth = createOAuthDeviceAuth({
                clientType: state.clientType,
                clientId: state.clientId,
                ...state.strategyOptions,
                request: state.request,
            });
            const authentication = await deviceAuth({
                type: "oauth",
            });
            return {
                clientSecret: state.clientSecret,
                ...authentication,
            };
        }
        // use existing authentication
        if ("token" in state.strategyOptions) {
            return {
                type: "token",
                tokenType: "oauth",
                clientId: state.clientId,
                clientSecret: state.clientSecret,
                clientType: state.clientType,
                ...state.strategyOptions,
            };
        }
        throw new Error("[@octokit/auth-oauth-user] Invalid strategy options");
    }

    async function auth$3(state, options = {}) {
        if (!state.authentication) {
            // This is what TS makes us do ¯\_(ツ)_/¯
            state.authentication =
                state.clientType === "oauth-app"
                    ? await getAuthentication(state)
                    : await getAuthentication(state);
        }
        if (state.authentication.invalid) {
            throw new Error("[@octokit/auth-oauth-user] Token is invalid");
        }
        const currentAuthentication = state.authentication;
        // (auto) refresh for user-to-server tokens
        if ("expiresAt" in currentAuthentication) {
            if (options.type === "refresh" ||
                new Date(currentAuthentication.expiresAt) < new Date()) {
                const { authentication } = await refreshToken_1({
                    clientType: "github-app",
                    clientId: state.clientId,
                    clientSecret: state.clientSecret,
                    refreshToken: currentAuthentication.refreshToken,
                    request: state.request,
                });
                state.authentication = {
                    tokenType: "oauth",
                    type: "token",
                    ...authentication,
                };
            }
        }
        // throw error for invalid refresh call
        if (options.type === "refresh") {
            if (state.clientType === "oauth-app") {
                throw new Error("[@octokit/auth-oauth-user] OAuth Apps do not support expiring tokens");
            }
            if (!currentAuthentication.hasOwnProperty("expiresAt")) {
                throw new Error("[@octokit/auth-oauth-user] Refresh token missing");
            }
        }
        // check or reset token
        if (options.type === "check" || options.type === "reset") {
            const method = options.type === "check" ? checkToken_1 : resetToken_1;
            try {
                const { authentication } = await method({
                    // @ts-expect-error making TS happy would require unnecessary code so no
                    clientType: state.clientType,
                    clientId: state.clientId,
                    clientSecret: state.clientSecret,
                    token: state.authentication.token,
                    request: state.request,
                });
                state.authentication = {
                    tokenType: "oauth",
                    type: "token",
                    // @ts-expect-error TBD
                    ...authentication,
                };
                return state.authentication;
            }
            catch (error) {
                // istanbul ignore else
                if (error.status === 404) {
                    error.message = "[@octokit/auth-oauth-user] Token is invalid";
                    // @ts-expect-error TBD
                    state.authentication.invalid = true;
                }
                throw error;
            }
        }
        // invalidate
        if (options.type === "delete" || options.type === "deleteAuthorization") {
            const method = options.type === "delete" ? deleteToken_1 : deleteAuthorization_1;
            try {
                await method({
                    // @ts-expect-error making TS happy would require unnecessary code so no
                    clientType: state.clientType,
                    clientId: state.clientId,
                    clientSecret: state.clientSecret,
                    token: state.authentication.token,
                    request: state.request,
                });
            }
            catch (error) {
                // istanbul ignore if
                if (error.status !== 404)
                    throw error;
            }
            state.authentication.invalid = true;
            return state.authentication;
        }
        return state.authentication;
    }

    /**
     * The following endpoints require an OAuth App to authenticate using its client_id and client_secret.
     *
     * - [`POST /applications/{client_id}/token`](https://docs.github.com/en/rest/reference/apps#check-a-token) - Check a token
     * - [`PATCH /applications/{client_id}/token`](https://docs.github.com/en/rest/reference/apps#reset-a-token) - Reset a token
     * - [`POST /applications/{client_id}/token/scoped`](https://docs.github.com/en/rest/reference/apps#create-a-scoped-access-token) - Create a scoped access token
     * - [`DELETE /applications/{client_id}/token`](https://docs.github.com/en/rest/reference/apps#delete-an-app-token) - Delete an app token
     * - [`DELETE /applications/{client_id}/grant`](https://docs.github.com/en/rest/reference/apps#delete-an-app-authorization) - Delete an app authorization
     *
     * deprecated:
     *
     * - [`GET /applications/{client_id}/tokens/{access_token}`](https://docs.github.com/en/rest/reference/apps#check-an-authorization) - Check an authorization
     * - [`POST /applications/{client_id}/tokens/{access_token}`](https://docs.github.com/en/rest/reference/apps#reset-an-authorization) - Reset an authorization
     * - [`DELETE /applications/{client_id}/tokens/{access_token}`](https://docs.github.com/en/rest/reference/apps#revoke-an-authorization-for-an-application) - Revoke an authorization for an application
     * - [`DELETE /applications/{client_id}/grants/{access_token}`](https://docs.github.com/en/rest/reference/apps#revoke-a-grant-for-an-application) - Revoke a grant for an application
     */
    const ROUTES_REQUIRING_BASIC_AUTH = /\/applications\/[^/]+\/(token|grant)s?/;
    function requiresBasicAuth(url) {
        return url && ROUTES_REQUIRING_BASIC_AUTH.test(url);
    }

    async function hook$3(state, request, route, parameters = {}) {
        const endpoint = request.endpoint.merge(route, parameters);
        // Do not intercept OAuth Web/Device flow request
        if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) {
            return request(endpoint);
        }
        if (requiresBasicAuth(endpoint.url)) {
            const credentials = btoaBrowser(`${state.clientId}:${state.clientSecret}`);
            endpoint.headers.authorization = `basic ${credentials}`;
            return request(endpoint);
        }
        // TS makes us do this ¯\_(ツ)_/¯
        const { token } = state.clientType === "oauth-app"
            ? await auth$3({ ...state, request })
            : await auth$3({ ...state, request });
        endpoint.headers.authorization = "token " + token;
        return request(endpoint);
    }

    function createOAuthUserAuth({ clientId, clientSecret, clientType = "oauth-app", request: request$1$1 = request$1.defaults({
        headers: {
            "user-agent": `octokit-auth-oauth-app.js/${VERSION$5} ${getUserAgent()}`,
        },
    }), ...strategyOptions }) {
        const state = Object.assign({
            clientType,
            clientId,
            clientSecret,
            strategyOptions,
            request: request$1$1,
        });
        // @ts-expect-error not worth the extra code needed to appease TS
        return Object.assign(auth$3.bind(null, state), {
            // @ts-expect-error not worth the extra code needed to appease TS
            hook: hook$3.bind(null, state),
        });
    }
    createOAuthUserAuth.VERSION = VERSION$5;

    var distWeb$4 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createOAuthUserAuth: createOAuthUserAuth,
        requiresBasicAuth: requiresBasicAuth
    });

    async function auth$2(state, authOptions) {
        if (authOptions.type === "oauth-app") {
            return {
                type: "oauth-app",
                clientId: state.clientId,
                clientSecret: state.clientSecret,
                clientType: state.clientType,
                headers: {
                    authorization: `basic ${btoaBrowser(`${state.clientId}:${state.clientSecret}`)}`,
                },
            };
        }
        if ("factory" in authOptions) {
            const { type, ...options } = {
                ...authOptions,
                ...state,
            };
            // @ts-expect-error TODO: `option` cannot be never, is this a bug?
            return authOptions.factory(options);
        }
        const common = {
            clientId: state.clientId,
            clientSecret: state.clientSecret,
            request: state.request,
            ...authOptions,
        };
        // TS: Look what you made me do
        const userAuth = state.clientType === "oauth-app"
            ? await createOAuthUserAuth({
                ...common,
                clientType: state.clientType,
            })
            : await createOAuthUserAuth({
                ...common,
                clientType: state.clientType,
            });
        return userAuth();
    }

    async function hook$2(state, request, route, parameters) {
        let endpoint = request.endpoint.merge(route, parameters);
        // Do not intercept OAuth Web/Device flow request
        if (/\/login\/(oauth\/access_token|device\/code)$/.test(endpoint.url)) {
            return request(endpoint);
        }
        if (state.clientType === "github-app" && !requiresBasicAuth(endpoint.url)) {
            throw new Error(`[@octokit/auth-oauth-app] GitHub Apps cannot use their client ID/secret for basic authentication for endpoints other than "/applications/{client_id}/**". "${endpoint.method} ${endpoint.url}" is not supported.`);
        }
        const credentials = btoaBrowser(`${state.clientId}:${state.clientSecret}`);
        endpoint.headers.authorization = `basic ${credentials}`;
        try {
            return await request(endpoint);
        }
        catch (error) {
            /* istanbul ignore if */
            if (error.status !== 401)
                throw error;
            error.message = `[@octokit/auth-oauth-app] "${endpoint.method} ${endpoint.url}" does not support clientId/clientSecret basic authentication.`;
            throw error;
        }
    }

    const VERSION$4 = "4.3.0";

    function createOAuthAppAuth(options) {
        const state = Object.assign({
            request: request$1.defaults({
                headers: {
                    "user-agent": `octokit-auth-oauth-app.js/${VERSION$4} ${getUserAgent()}`,
                },
            }),
            clientType: "oauth-app",
        }, options);
        // @ts-expect-error not worth the extra code to appease TS
        return Object.assign(auth$2.bind(null, state), {
            hook: hook$2.bind(null, state),
        });
    }

    var distWeb$3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createOAuthAppAuth: createOAuthAppAuth,
        createOAuthUserAuth: createOAuthUserAuth
    });

    function t(t,n,r,e,i,a,o){try{var u=t[a](o),c=u.value;}catch(t){return void r(t)}u.done?n(c):Promise.resolve(c).then(e,i);}function n$1(n){return function(){var r=this,e=arguments;return new Promise((function(i,a){var o=n.apply(r,e);function u(n){t(o,i,a,u,c,"next",n);}function c(n){t(o,i,a,u,c,"throw",n);}u(void 0);}))}}function r(t){for(var n=new ArrayBuffer(t.length),r=new Uint8Array(n),e=0,i=t.length;e<i;e++)r[e]=t.charCodeAt(e);return n}function e(t){return t.replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function i(t){return e(btoa(JSON.stringify(t)))}var a=function(){var t=n$1((function*(t){var{privateKey:n,payload:a}=t;if(/BEGIN RSA PRIVATE KEY/.test(n))throw new Error("[universal-github-app-jwt] Private Key is in PKCS#1 format, but only PKCS#8 is supported. See https://github.com/gr2m/universal-github-app-jwt#readme");var o,u={name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}},c=(o=n.trim().split("\n").slice(1,-1).join(""),r(atob(o))),p=yield crypto.subtle.importKey("pkcs8",c,u,!1,["sign"]),f=function(t,n){return "".concat(i(t),".").concat(i(n))}({alg:"RS256",typ:"JWT"},a),l=r(f),s=function(t){for(var n="",r=new Uint8Array(t),i=r.byteLength,a=0;a<i;a++)n+=String.fromCharCode(r[a]);return e(btoa(n))}(yield crypto.subtle.sign(u.name,p,l));return "".concat(f,".").concat(s)}));return function(n){return t.apply(this,arguments)}}();function o(t){return u.apply(this,arguments)}function u(){return (u=n$1((function*(t){var{id:n,privateKey:r,now:e=Math.floor(Date.now()/1e3)}=t,i=e-30,o=i+600,u={iat:i,exp:o,iss:n};return {appId:n,expiration:o,token:yield a({privateKey:r,payload:u})}}))).apply(this,arguments)}

    var iterator = function (Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };

    var yallist = Yallist;

    Yallist.Node = Node$1;
    Yallist.create = Yallist;

    function Yallist (list) {
      var self = this;
      if (!(self instanceof Yallist)) {
        self = new Yallist();
      }

      self.tail = null;
      self.head = null;
      self.length = 0;

      if (list && typeof list.forEach === 'function') {
        list.forEach(function (item) {
          self.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self.push(arguments[i]);
        }
      }

      return self
    }

    Yallist.prototype.removeNode = function (node) {
      if (node.list !== this) {
        throw new Error('removing node which does not belong to this list')
      }

      var next = node.next;
      var prev = node.prev;

      if (next) {
        next.prev = prev;
      }

      if (prev) {
        prev.next = next;
      }

      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }

      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;

      return next
    };

    Yallist.prototype.unshiftNode = function (node) {
      if (node === this.head) {
        return
      }

      if (node.list) {
        node.list.removeNode(node);
      }

      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }

      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };

    Yallist.prototype.pushNode = function (node) {
      if (node === this.tail) {
        return
      }

      if (node.list) {
        node.list.removeNode(node);
      }

      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }

      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };

    Yallist.prototype.push = function () {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length
    };

    Yallist.prototype.unshift = function () {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length
    };

    Yallist.prototype.pop = function () {
      if (!this.tail) {
        return undefined
      }

      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res
    };

    Yallist.prototype.shift = function () {
      if (!this.head) {
        return undefined
      }

      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res
    };

    Yallist.prototype.forEach = function (fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };

    Yallist.prototype.forEachReverse = function (fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };

    Yallist.prototype.get = function (n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        // abort out of the list early if we hit a cycle
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value
      }
    };

    Yallist.prototype.getReverse = function (n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        // abort out of the list early if we hit a cycle
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value
      }
    };

    Yallist.prototype.map = function (fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null;) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res
    };

    Yallist.prototype.mapReverse = function (fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null;) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res
    };

    Yallist.prototype.reduce = function (fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError('Reduce of empty list with no initial value')
      }

      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }

      return acc
    };

    Yallist.prototype.reduceReverse = function (fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError('Reduce of empty list with no initial value')
      }

      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }

      return acc
    };

    Yallist.prototype.toArray = function () {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr
    };

    Yallist.prototype.toArrayReverse = function () {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr
    };

    Yallist.prototype.slice = function (from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret
    };

    Yallist.prototype.sliceReverse = function (from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret
    };

    Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1;
      }
      if (start < 0) {
        start = this.length + start;
      }

      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next;
      }

      var ret = [];
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value);
        walker = this.removeNode(walker);
      }
      if (walker === null) {
        walker = this.tail;
      }

      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
      }

      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i]);
      }
      return ret;
    };

    Yallist.prototype.reverse = function () {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this
    };

    function insert (self, node, value) {
      var inserted = node === self.head ?
        new Node$1(value, null, node, self) :
        new Node$1(value, node, node.next, self);

      if (inserted.next === null) {
        self.tail = inserted;
      }
      if (inserted.prev === null) {
        self.head = inserted;
      }

      self.length++;

      return inserted
    }

    function push (self, item) {
      self.tail = new Node$1(item, self.tail, null, self);
      if (!self.head) {
        self.head = self.tail;
      }
      self.length++;
    }

    function unshift (self, item) {
      self.head = new Node$1(item, null, self.head, self);
      if (!self.tail) {
        self.tail = self.head;
      }
      self.length++;
    }

    function Node$1 (value, prev, next, list) {
      if (!(this instanceof Node$1)) {
        return new Node$1(value, prev, next, list)
      }

      this.list = list;
      this.value = value;

      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }

      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }

    try {
      // add if support for Symbol.iterator is present
      iterator(Yallist);
    } catch (er) {}

    // A linked list to keep track of recently-used-ness


    const MAX = Symbol('max');
    const LENGTH = Symbol('length');
    const LENGTH_CALCULATOR = Symbol('lengthCalculator');
    const ALLOW_STALE = Symbol('allowStale');
    const MAX_AGE = Symbol('maxAge');
    const DISPOSE = Symbol('dispose');
    const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
    const LRU_LIST = Symbol('lruList');
    const CACHE = Symbol('cache');
    const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

    const naiveLength = () => 1;

    // lruList is a yallist where the head is the youngest
    // item, and the tail is the oldest.  the list contains the Hit
    // objects as the entries.
    // Each Hit object has a reference to its Yallist.Node.  This
    // never changes.
    //
    // cache is a Map (or PseudoMap) that matches the keys to
    // the Yallist.Node object.
    class LRUCache {
      constructor (options) {
        if (typeof options === 'number')
          options = { max: options };

        if (!options)
          options = {};

        if (options.max && (typeof options.max !== 'number' || options.max < 0))
          throw new TypeError('max must be a non-negative number')
        // Kind of weird to have a default max of Infinity, but oh well.
        this[MAX] = options.max || Infinity;

        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== 'number')
          throw new TypeError('maxAge must be a number')
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }

      // resize the cache when the max changes.
      set max (mL) {
        if (typeof mL !== 'number' || mL < 0)
          throw new TypeError('max must be a non-negative number')

        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max () {
        return this[MAX]
      }

      set allowStale (allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale () {
        return this[ALLOW_STALE]
      }

      set maxAge (mA) {
        if (typeof mA !== 'number')
          throw new TypeError('maxAge must be a non-negative number')

        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge () {
        return this[MAX_AGE]
      }

      // resize the cache when the lengthCalculator changes.
      set lengthCalculator (lC) {
        if (typeof lC !== 'function')
          lC = naiveLength;

        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach(hit => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator () { return this[LENGTH_CALCULATOR] }

      get length () { return this[LENGTH] }
      get itemCount () { return this[LRU_LIST].length }

      rforEach (fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null;) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }

      forEach (fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null;) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }

      keys () {
        return this[LRU_LIST].toArray().map(k => k.key)
      }

      values () {
        return this[LRU_LIST].toArray().map(k => k.value)
      }

      reset () {
        if (this[DISPOSE] &&
            this[LRU_LIST] &&
            this[LRU_LIST].length) {
          this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
        }

        this[CACHE] = new Map(); // hash of items by key
        this[LRU_LIST] = new yallist(); // list of items in order of use recency
        this[LENGTH] = 0; // length of items in the list
      }

      dump () {
        return this[LRU_LIST].map(hit =>
          isStale(this, hit) ? false : {
            k: hit.key,
            v: hit.value,
            e: hit.now + (hit.maxAge || 0)
          }).toArray().filter(h => h)
      }

      dumpLru () {
        return this[LRU_LIST]
      }

      set (key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];

        if (maxAge && typeof maxAge !== 'number')
          throw new TypeError('maxAge must be a number')

        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);

        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false
          }

          const node = this[CACHE].get(key);
          const item = node.value;

          // dispose of the old one before overwriting
          // split out into 2 ifs for better coverage tracking
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }

          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true
        }

        const hit = new Entry(key, value, len, now, maxAge);

        // oversized objects fall out of cache automatically.
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);

          return false
        }

        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true
      }

      has (key) {
        if (!this[CACHE].has(key)) return false
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit)
      }

      get (key) {
        return get$1(this, key, true)
      }

      peek (key) {
        return get$1(this, key, false)
      }

      pop () {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null

        del(this, node);
        return node.value
      }

      del (key) {
        del(this, this[CACHE].get(key));
      }

      load (arr) {
        // reset the cache
        this.reset();

        const now = Date.now();
        // A previous serialized cache has the most recent items first
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            // the item was created without expiration in a non aged cache
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            // dont add already expired items
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }

      prune () {
        this[CACHE].forEach((value, key) => get$1(this, key, false));
      }
    }

    const get$1 = (self, key, doUse) => {
      const node = self[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self, hit)) {
          del(self, node);
          if (!self[ALLOW_STALE])
            return undefined
        } else {
          if (doUse) {
            if (self[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value
      }
    };

    const isStale = (self, hit) => {
      if (!hit || (!hit.maxAge && !self[MAX_AGE]))
        return false

      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge
        : self[MAX_AGE] && (diff > self[MAX_AGE])
    };

    const trim = self => {
      if (self[LENGTH] > self[MAX]) {
        for (let walker = self[LRU_LIST].tail;
          self[LENGTH] > self[MAX] && walker !== null;) {
          // We know that we're about to delete this one, and also
          // what the next least recently used key will be, so just
          // go ahead and set it now.
          const prev = walker.prev;
          del(self, walker);
          walker = prev;
        }
      }
    };

    const del = (self, node) => {
      if (node) {
        const hit = node.value;
        if (self[DISPOSE])
          self[DISPOSE](hit.key, hit.value);

        self[LENGTH] -= hit.length;
        self[CACHE].delete(hit.key);
        self[LRU_LIST].removeNode(node);
      }
    };

    class Entry {
      constructor (key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    }

    const forEachStep = (self, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self, hit)) {
        del(self, node);
        if (!self[ALLOW_STALE])
          hit = undefined;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self);
    };

    var lruCache = LRUCache;

    async function getAppAuthentication({ appId, privateKey, timeDifference, }) {
        try {
            const appAuthentication = await o({
                id: +appId,
                privateKey,
                now: timeDifference && Math.floor(Date.now() / 1000) + timeDifference,
            });
            return {
                type: "app",
                token: appAuthentication.token,
                appId: appAuthentication.appId,
                expiresAt: new Date(appAuthentication.expiration * 1000).toISOString(),
            };
        }
        catch (error) {
            if (privateKey === "-----BEGIN RSA PRIVATE KEY-----") {
                throw new Error("The 'privateKey` option contains only the first line '-----BEGIN RSA PRIVATE KEY-----'. If you are setting it using a `.env` file, make sure it is set on a single line with newlines replaced by '\n'");
            }
            else {
                throw error;
            }
        }
    }

    // https://github.com/isaacs/node-lru-cache#readme
    function getCache() {
        return new lruCache({
            // cache max. 15000 tokens, that will use less than 10mb memory
            max: 15000,
            // Cache for 1 minute less than GitHub expiry
            maxAge: 1000 * 60 * 59,
        });
    }
    async function get(cache, options) {
        const cacheKey = optionsToCacheKey(options);
        const result = await cache.get(cacheKey);
        if (!result) {
            return;
        }
        const [token, createdAt, expiresAt, repositorySelection, permissionsString, singleFileName,] = result.split("|");
        const permissions = options.permissions ||
            permissionsString.split(/,/).reduce((permissions, string) => {
                if (/!$/.test(string)) {
                    permissions[string.slice(0, -1)] = "write";
                }
                else {
                    permissions[string] = "read";
                }
                return permissions;
            }, {});
        return {
            token,
            createdAt,
            expiresAt,
            permissions,
            repositoryIds: options.repositoryIds,
            repositoryNames: options.repositoryNames,
            singleFileName,
            repositorySelection: repositorySelection,
        };
    }
    async function set(cache, options, data) {
        const key = optionsToCacheKey(options);
        const permissionsString = options.permissions
            ? ""
            : Object.keys(data.permissions)
                .map((name) => `${name}${data.permissions[name] === "write" ? "!" : ""}`)
                .join(",");
        const value = [
            data.token,
            data.createdAt,
            data.expiresAt,
            data.repositorySelection,
            permissionsString,
            data.singleFileName,
        ].join("|");
        await cache.set(key, value);
    }
    function optionsToCacheKey({ installationId, permissions = {}, repositoryIds = [], repositoryNames = [], }) {
        const permissionsString = Object.keys(permissions)
            .sort()
            .map((name) => (permissions[name] === "read" ? name : `${name}!`))
            .join(",");
        const repositoryIdsString = repositoryIds.sort().join(",");
        const repositoryNamesString = repositoryNames.join(",");
        return [
            installationId,
            repositoryIdsString,
            repositoryNamesString,
            permissionsString,
        ]
            .filter(Boolean)
            .join("|");
    }

    function toTokenAuthentication({ installationId, token, createdAt, expiresAt, repositorySelection, permissions, repositoryIds, repositoryNames, singleFileName, }) {
        return Object.assign({
            type: "token",
            tokenType: "installation",
            token,
            installationId,
            permissions,
            createdAt,
            expiresAt,
            repositorySelection,
        }, repositoryIds ? { repositoryIds } : null, repositoryNames ? { repositoryNames } : null, singleFileName ? { singleFileName } : null);
    }

    async function getInstallationAuthentication(state, options, customRequest) {
        const installationId = Number(options.installationId || state.installationId);
        if (!installationId) {
            throw new Error("[@octokit/auth-app] installationId option is required for installation authentication.");
        }
        if (options.factory) {
            const { type, factory, oauthApp, ...factoryAuthOptions } = {
                ...state,
                ...options,
            };
            // @ts-expect-error if `options.factory` is set, the return type for `auth()` should be `Promise<ReturnType<options.factory>>`
            return factory(factoryAuthOptions);
        }
        const optionsWithInstallationTokenFromState = Object.assign({ installationId }, options);
        if (!options.refresh) {
            const result = await get(state.cache, optionsWithInstallationTokenFromState);
            if (result) {
                const { token, createdAt, expiresAt, permissions, repositoryIds, repositoryNames, singleFileName, repositorySelection, } = result;
                return toTokenAuthentication({
                    installationId,
                    token,
                    createdAt,
                    expiresAt,
                    permissions,
                    repositorySelection,
                    repositoryIds,
                    repositoryNames,
                    singleFileName,
                });
            }
        }
        const appAuthentication = await getAppAuthentication(state);
        const request = customRequest || state.request;
        const { data: { token, expires_at: expiresAt, repositories, permissions: permissionsOptional, repository_selection: repositorySelectionOptional, single_file: singleFileName, }, } = await request("POST /app/installations/{installation_id}/access_tokens", {
            installation_id: installationId,
            repository_ids: options.repositoryIds,
            repositories: options.repositoryNames,
            permissions: options.permissions,
            mediaType: {
                previews: ["machine-man"],
            },
            headers: {
                authorization: `bearer ${appAuthentication.token}`,
            },
        });
        /* istanbul ignore next - permissions are optional per OpenAPI spec, but we think that is incorrect */
        const permissions = permissionsOptional || {};
        /* istanbul ignore next - repositorySelection are optional per OpenAPI spec, but we think that is incorrect */
        const repositorySelection = repositorySelectionOptional || "all";
        const repositoryIds = repositories
            ? repositories.map((r) => r.id)
            : void 0;
        const repositoryNames = repositories
            ? repositories.map((repo) => repo.name)
            : void 0;
        const createdAt = new Date().toISOString();
        await set(state.cache, optionsWithInstallationTokenFromState, {
            token,
            createdAt,
            expiresAt,
            repositorySelection,
            permissions,
            repositoryIds,
            repositoryNames,
            singleFileName,
        });
        return toTokenAuthentication({
            installationId,
            token,
            createdAt,
            expiresAt,
            repositorySelection,
            permissions,
            repositoryIds,
            repositoryNames,
            singleFileName,
        });
    }

    async function auth$1(state, authOptions) {
        switch (authOptions.type) {
            case "app":
                return getAppAuthentication(state);
            // @ts-expect-error "oauth" is not supperted in types
            case "oauth":
                state.log.warn(
                // @ts-expect-error `log.warn()` expects string
                new Deprecation(`[@octokit/auth-app] {type: "oauth"} is deprecated. Use {type: "oauth-app"} instead`));
            case "oauth-app":
                return state.oauthApp({ type: "oauth-app" });
            case "installation":
                return getInstallationAuthentication(state, {
                    ...authOptions,
                    type: "installation",
                });
            case "oauth-user":
                // @ts-expect-error TODO: infer correct auth options type based on type. authOptions should be typed as "WebFlowAuthOptions | OAuthAppDeviceFlowAuthOptions | GitHubAppDeviceFlowAuthOptions"
                return state.oauthApp(authOptions);
            default:
                // @ts-expect-error type is "never" at this point
                throw new Error(`Invalid auth type: ${authOptions.type}`);
        }
    }

    const PATHS = [
        "/app",
        "/app/hook/config",
        "/app/hook/deliveries",
        "/app/hook/deliveries/{delivery_id}",
        "/app/hook/deliveries/{delivery_id}/attempts",
        "/app/installations",
        "/app/installations/{installation_id}",
        "/app/installations/{installation_id}/access_tokens",
        "/app/installations/{installation_id}/suspended",
        "/marketplace_listing/accounts/{account_id}",
        "/marketplace_listing/plan",
        "/marketplace_listing/plans",
        "/marketplace_listing/plans/{plan_id}/accounts",
        "/marketplace_listing/stubbed/accounts/{account_id}",
        "/marketplace_listing/stubbed/plan",
        "/marketplace_listing/stubbed/plans",
        "/marketplace_listing/stubbed/plans/{plan_id}/accounts",
        "/orgs/{org}/installation",
        "/repos/{owner}/{repo}/installation",
        "/users/{username}/installation",
    ];
    // CREDIT: Simon Grondin (https://github.com/SGrondin)
    // https://github.com/octokit/plugin-throttling.js/blob/45c5d7f13b8af448a9dbca468d9c9150a73b3948/lib/route-matcher.js
    function routeMatcher(paths) {
        // EXAMPLE. For the following paths:
        /* [
            "/orgs/{org}/invitations",
            "/repos/{owner}/{repo}/collaborators/{username}"
        ] */
        const regexes = paths.map((p) => p
            .split("/")
            .map((c) => (c.startsWith("{") ? "(?:.+?)" : c))
            .join("/"));
        // 'regexes' would contain:
        /* [
            '/orgs/(?:.+?)/invitations',
            '/repos/(?:.+?)/(?:.+?)/collaborators/(?:.+?)'
        ] */
        const regex = `^(?:${regexes.map((r) => `(?:${r})`).join("|")})[^/]*$`;
        // 'regex' would contain:
        /*
          ^(?:(?:\/orgs\/(?:.+?)\/invitations)|(?:\/repos\/(?:.+?)\/(?:.+?)\/collaborators\/(?:.+?)))[^\/]*$
      
          It may look scary, but paste it into https://www.debuggex.com/
          and it will make a lot more sense!
        */
        return new RegExp(regex, "i");
    }
    const REGEX = routeMatcher(PATHS);
    function requiresAppAuth(url) {
        return !!url && REGEX.test(url);
    }

    const FIVE_SECONDS_IN_MS = 5 * 1000;
    function isNotTimeSkewError(error) {
        return !(error.message.match(/'Expiration time' claim \('exp'\) must be a numeric value representing the future time at which the assertion expires/) ||
            error.message.match(/'Issued at' claim \('iat'\) must be an Integer representing the time that the assertion was issued/));
    }
    async function hook$1(state, request, route, parameters) {
        const endpoint = request.endpoint.merge(route, parameters);
        const url = endpoint.url;
        // Do not intercept request to retrieve a new token
        if (/\/login\/oauth\/access_token$/.test(url)) {
            return request(endpoint);
        }
        if (requiresAppAuth(url.replace(request.endpoint.DEFAULTS.baseUrl, ""))) {
            const { token } = await getAppAuthentication(state);
            endpoint.headers.authorization = `bearer ${token}`;
            let response;
            try {
                response = await request(endpoint);
            }
            catch (error) {
                // If there's an issue with the expiration, regenerate the token and try again.
                // Otherwise rethrow the error for upstream handling.
                if (isNotTimeSkewError(error)) {
                    throw error;
                }
                // If the date header is missing, we can't correct the system time skew.
                // Throw the error to be handled upstream.
                if (typeof error.response.headers.date === "undefined") {
                    throw error;
                }
                const diff = Math.floor((Date.parse(error.response.headers.date) -
                    Date.parse(new Date().toString())) /
                    1000);
                state.log.warn(error.message);
                state.log.warn(`[@octokit/auth-app] GitHub API time and system time are different by ${diff} seconds. Retrying request with the difference accounted for.`);
                const { token } = await getAppAuthentication({
                    ...state,
                    timeDifference: diff,
                });
                endpoint.headers.authorization = `bearer ${token}`;
                return request(endpoint);
            }
            return response;
        }
        if (requiresBasicAuth(url)) {
            const authentication = await state.oauthApp({ type: "oauth-app" });
            endpoint.headers.authorization = authentication.headers.authorization;
            return request(endpoint);
        }
        const { token, createdAt } = await getInstallationAuthentication(state, 
        // @ts-expect-error TBD
        {}, request);
        endpoint.headers.authorization = `token ${token}`;
        return sendRequestWithRetries(state, request, endpoint, createdAt);
    }
    /**
     * Newly created tokens might not be accessible immediately after creation.
     * In case of a 401 response, we retry with an exponential delay until more
     * than five seconds pass since the creation of the token.
     *
     * @see https://github.com/octokit/auth-app.js/issues/65
     */
    async function sendRequestWithRetries(state, request, options, createdAt, retries = 0) {
        const timeSinceTokenCreationInMs = +new Date() - +new Date(createdAt);
        try {
            return await request(options);
        }
        catch (error) {
            if (error.status !== 401) {
                throw error;
            }
            if (timeSinceTokenCreationInMs >= FIVE_SECONDS_IN_MS) {
                if (retries > 0) {
                    error.message = `After ${retries} retries within ${timeSinceTokenCreationInMs / 1000}s of creating the installation access token, the response remains 401. At this point, the cause may be an authentication problem or a system outage. Please check https://www.githubstatus.com for status information`;
                }
                throw error;
            }
            ++retries;
            const awaitTime = retries * 1000;
            state.log.warn(`[@octokit/auth-app] Retrying after 401 response to account for token replication delay (retry: ${retries}, wait: ${awaitTime / 1000}s)`);
            await new Promise((resolve) => setTimeout(resolve, awaitTime));
            return sendRequestWithRetries(state, request, options, createdAt, retries);
        }
    }

    const VERSION$3 = "3.6.1";

    function createAppAuth(options) {
        if (!options.appId) {
            throw new Error("[@octokit/auth-app] appId option is required");
        }
        if (!options.privateKey) {
            throw new Error("[@octokit/auth-app] privateKey option is required");
        }
        if ("installationId" in options && !options.installationId) {
            throw new Error("[@octokit/auth-app] installationId is set to a falsy value");
        }
        const log = Object.assign({
            warn: console.warn.bind(console),
        }, options.log);
        const request$1$1 = options.request ||
            request$1.defaults({
                headers: {
                    "user-agent": `octokit-auth-app.js/${VERSION$3} ${getUserAgent()}`,
                },
            });
        const state = Object.assign({
            request: request$1$1,
            cache: getCache(),
        }, options, options.installationId
            ? { installationId: Number(options.installationId) }
            : {}, {
            log,
            oauthApp: createOAuthAppAuth({
                clientType: "github-app",
                clientId: options.clientId || "",
                clientSecret: options.clientSecret || "",
                request: request$1$1,
            }),
        });
        // @ts-expect-error not worth the extra code to appease TS
        return Object.assign(auth$1.bind(null, state), {
            hook: hook$1.bind(null, state),
        });
    }

    var distWeb$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createAppAuth: createAppAuth,
        createOAuthUserAuth: createOAuthUserAuth
    });

    async function auth(reason) {
        return {
            type: "unauthenticated",
            reason,
        };
    }

    function isRateLimitError(error) {
        if (error.status !== 403) {
            return false;
        }
        /* istanbul ignore if */
        if (!error.response) {
            return false;
        }
        return error.response.headers["x-ratelimit-remaining"] === "0";
    }

    const REGEX_ABUSE_LIMIT_MESSAGE = /\babuse\b/i;
    function isAbuseLimitError(error) {
        if (error.status !== 403) {
            return false;
        }
        return REGEX_ABUSE_LIMIT_MESSAGE.test(error.message);
    }

    async function hook(reason, request, route, parameters) {
        const endpoint = request.endpoint.merge(route, parameters);
        return request(endpoint).catch((error) => {
            if (error.status === 404) {
                error.message = `Not found. May be due to lack of authentication. Reason: ${reason}`;
                throw error;
            }
            if (isRateLimitError(error)) {
                error.message = `API rate limit exceeded. This maybe caused by the lack of authentication. Reason: ${reason}`;
                throw error;
            }
            if (isAbuseLimitError(error)) {
                error.message = `You have triggered an abuse detection mechanism. This maybe caused by the lack of authentication. Reason: ${reason}`;
                throw error;
            }
            if (error.status === 401) {
                error.message = `Unauthorized. "${endpoint.method} ${endpoint.url}" failed most likely due to lack of authentication. Reason: ${reason}`;
                throw error;
            }
            if (error.status >= 400 && error.status < 500) {
                error.message = error.message.replace(/\.?$/, `. May be caused by lack of authentication (${reason}).`);
            }
            throw error;
        });
    }

    const createUnauthenticatedAuth = function createUnauthenticatedAuth(options) {
        if (!options || !options.reason) {
            throw new Error("[@octokit/auth-unauthenticated] No reason passed to createUnauthenticatedAuth");
        }
        return Object.assign(auth.bind(null, options.reason), {
            hook: hook.bind(null, options.reason),
        });
    };

    var distWeb$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createUnauthenticatedAuth: createUnauthenticatedAuth
    });

    /*! fromentries. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
    var fromentries = function fromEntries (iterable) {
      return [...iterable].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj
      }, {})
    };

    var OAuthAppAuth = /*@__PURE__*/getAugmentedNamespace(distWeb$3);

    var core = /*@__PURE__*/getAugmentedNamespace(distWeb$7);

    var universalUserAgent = /*@__PURE__*/getAugmentedNamespace(distWeb$a);

    var authOauthUser = /*@__PURE__*/getAugmentedNamespace(distWeb$4);

    var OAuthMethods = distNode$1;

    var authUnauthenticated = /*@__PURE__*/getAugmentedNamespace(distWeb$1);

    function _interopDefault$1 (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }







    var fromEntries = _interopDefault$1(fromentries);

    function ownKeys$1(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);

        if (enumerableOnly) {
          symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }

        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2$1(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys$1(Object(source), true).forEach(function (key) {
            _defineProperty$1(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys$1(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    function _defineProperty$1(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    const VERSION$2 = "3.6.0";

    function addEventHandler(state, eventName, eventHandler) {
      if (Array.isArray(eventName)) {
        for (const singleEventName of eventName) {
          addEventHandler(state, singleEventName, eventHandler);
        }

        return;
      }

      if (!state.eventHandlers[eventName]) {
        state.eventHandlers[eventName] = [];
      }

      state.eventHandlers[eventName].push(eventHandler);
    }

    const OAuthAppOctokit = core.Octokit.defaults({
      userAgent: `octokit-oauth-app.js/${VERSION$2} ${universalUserAgent.getUserAgent()}`
    });

    async function emitEvent(state, context) {
      const {
        name,
        action
      } = context;

      if (state.eventHandlers[`${name}.${action}`]) {
        for (const eventHandler of state.eventHandlers[`${name}.${action}`]) {
          await eventHandler(context);
        }
      }

      if (state.eventHandlers[name]) {
        for (const eventHandler of state.eventHandlers[name]) {
          await eventHandler(context);
        }
      }
    }

    async function getUserOctokitWithState(state, options) {
      return state.octokit.auth(_objectSpread2$1(_objectSpread2$1({
        type: "oauth-user"
      }, options), {}, {
        async factory(options) {
          const octokit = new state.Octokit({
            authStrategy: authOauthUser.createOAuthUserAuth,
            auth: options
          });
          const authentication = await octokit.auth({
            type: "get"
          });
          await emitEvent(state, {
            name: "token",
            action: "created",
            token: authentication.token,
            scopes: authentication.scopes,
            authentication,
            octokit
          });
          return octokit;
        }

      }));
    }

    function getWebFlowAuthorizationUrlWithState(state, options) {
      const optionsWithDefaults = _objectSpread2$1(_objectSpread2$1({
        clientId: state.clientId,
        request: state.octokit.request
      }, options), {}, {
        allowSignup: options.allowSignup || state.allowSignup,
        scopes: options.scopes || state.defaultScopes
      });

      return OAuthMethods.getWebFlowAuthorizationUrl(_objectSpread2$1({
        clientType: state.clientType
      }, optionsWithDefaults));
    }

    async function createTokenWithState(state, options) {
      const authentication = await state.octokit.auth(_objectSpread2$1({
        type: "oauth-user"
      }, options));
      await emitEvent(state, {
        name: "token",
        action: "created",
        token: authentication.token,
        scopes: authentication.scopes,
        authentication,
        octokit: new state.Octokit({
          authStrategy: OAuthAppAuth.createOAuthUserAuth,
          auth: {
            clientType: state.clientType,
            clientId: state.clientId,
            clientSecret: state.clientSecret,
            token: authentication.token,
            scopes: authentication.scopes,
            refreshToken: authentication.refreshToken,
            expiresAt: authentication.expiresAt,
            refreshTokenExpiresAt: authentication.refreshTokenExpiresAt
          }
        })
      });
      return {
        authentication
      };
    }

    async function checkTokenWithState(state, options) {
      const result = await OAuthMethods.checkToken(_objectSpread2$1({
        // @ts-expect-error not worth the extra code to appease TS
        clientType: state.clientType,
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        request: state.octokit.request
      }, options));
      Object.assign(result.authentication, {
        type: "token",
        tokenType: "oauth"
      });
      return result;
    }

    async function resetTokenWithState(state, options) {
      const optionsWithDefaults = _objectSpread2$1({
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        request: state.octokit.request
      }, options);

      if (state.clientType === "oauth-app") {
        const response = await OAuthMethods.resetToken(_objectSpread2$1({
          clientType: "oauth-app"
        }, optionsWithDefaults));
        const authentication = Object.assign(response.authentication, {
          type: "token",
          tokenType: "oauth"
        });
        await emitEvent(state, {
          name: "token",
          action: "reset",
          token: response.authentication.token,
          scopes: response.authentication.scopes || undefined,
          authentication: authentication,
          octokit: new state.Octokit({
            authStrategy: authOauthUser.createOAuthUserAuth,
            auth: {
              clientType: state.clientType,
              clientId: state.clientId,
              clientSecret: state.clientSecret,
              token: response.authentication.token,
              scopes: response.authentication.scopes
            }
          })
        });
        return _objectSpread2$1(_objectSpread2$1({}, response), {}, {
          authentication
        });
      }

      const response = await OAuthMethods.resetToken(_objectSpread2$1({
        clientType: "github-app"
      }, optionsWithDefaults));
      const authentication = Object.assign(response.authentication, {
        type: "token",
        tokenType: "oauth"
      });
      await emitEvent(state, {
        name: "token",
        action: "reset",
        token: response.authentication.token,
        authentication: authentication,
        octokit: new state.Octokit({
          authStrategy: authOauthUser.createOAuthUserAuth,
          auth: {
            clientType: state.clientType,
            clientId: state.clientId,
            clientSecret: state.clientSecret,
            token: response.authentication.token
          }
        })
      });
      return _objectSpread2$1(_objectSpread2$1({}, response), {}, {
        authentication
      });
    }

    async function refreshTokenWithState(state, options) {
      if (state.clientType === "oauth-app") {
        throw new Error("[@octokit/oauth-app] app.refreshToken() is not supported for OAuth Apps");
      }

      const response = await OAuthMethods.refreshToken({
        clientType: "github-app",
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        request: state.octokit.request,
        refreshToken: options.refreshToken
      });
      const authentication = Object.assign(response.authentication, {
        type: "token",
        tokenType: "oauth"
      });
      await emitEvent(state, {
        name: "token",
        action: "refreshed",
        token: response.authentication.token,
        authentication: authentication,
        octokit: new state.Octokit({
          authStrategy: authOauthUser.createOAuthUserAuth,
          auth: {
            clientType: state.clientType,
            clientId: state.clientId,
            clientSecret: state.clientSecret,
            token: response.authentication.token
          }
        })
      });
      return _objectSpread2$1(_objectSpread2$1({}, response), {}, {
        authentication
      });
    }

    async function scopeTokenWithState(state, options) {
      if (state.clientType === "oauth-app") {
        throw new Error("[@octokit/oauth-app] app.scopeToken() is not supported for OAuth Apps");
      }

      const response = await OAuthMethods.scopeToken(_objectSpread2$1({
        clientType: "github-app",
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        request: state.octokit.request
      }, options));
      const authentication = Object.assign(response.authentication, {
        type: "token",
        tokenType: "oauth"
      });
      await emitEvent(state, {
        name: "token",
        action: "scoped",
        token: response.authentication.token,
        authentication: authentication,
        octokit: new state.Octokit({
          authStrategy: authOauthUser.createOAuthUserAuth,
          auth: {
            clientType: state.clientType,
            clientId: state.clientId,
            clientSecret: state.clientSecret,
            token: response.authentication.token
          }
        })
      });
      return _objectSpread2$1(_objectSpread2$1({}, response), {}, {
        authentication
      });
    }

    async function deleteTokenWithState(state, options) {
      const optionsWithDefaults = _objectSpread2$1({
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        request: state.octokit.request
      }, options);

      const response = state.clientType === "oauth-app" ? await OAuthMethods.deleteToken(_objectSpread2$1({
        clientType: "oauth-app"
      }, optionsWithDefaults)) : // istanbul ignore next
      await OAuthMethods.deleteToken(_objectSpread2$1({
        clientType: "github-app"
      }, optionsWithDefaults));
      await emitEvent(state, {
        name: "token",
        action: "deleted",
        token: options.token,
        octokit: new state.Octokit({
          authStrategy: authUnauthenticated.createUnauthenticatedAuth,
          auth: {
            reason: `Handling "token.deleted" event. The access for the token has been revoked.`
          }
        })
      });
      return response;
    }

    async function deleteAuthorizationWithState(state, options) {
      const optionsWithDefaults = _objectSpread2$1({
        clientId: state.clientId,
        clientSecret: state.clientSecret,
        request: state.octokit.request
      }, options);

      const response = state.clientType === "oauth-app" ? await OAuthMethods.deleteAuthorization(_objectSpread2$1({
        clientType: "oauth-app"
      }, optionsWithDefaults)) : // istanbul ignore next
      await OAuthMethods.deleteAuthorization(_objectSpread2$1({
        clientType: "github-app"
      }, optionsWithDefaults));
      await emitEvent(state, {
        name: "token",
        action: "deleted",
        token: options.token,
        octokit: new state.Octokit({
          authStrategy: authUnauthenticated.createUnauthenticatedAuth,
          auth: {
            reason: `Handling "token.deleted" event. The access for the token has been revoked.`
          }
        })
      });
      await emitEvent(state, {
        name: "authorization",
        action: "deleted",
        token: options.token,
        octokit: new state.Octokit({
          authStrategy: authUnauthenticated.createUnauthenticatedAuth,
          auth: {
            reason: `Handling "authorization.deleted" event. The access for the app has been revoked.`
          }
        })
      });
      return response;
    }

    function parseRequest(request) {
      const {
        method,
        url,
        headers
      } = request;

      async function text() {
        const text = await new Promise((resolve, reject) => {
          let bodyChunks = [];
          request.on("error", reject).on("data", chunk => bodyChunks.push(chunk)).on("end", () => resolve(Buffer.concat(bodyChunks).toString()));
        });
        return text;
      }

      return {
        method,
        url,
        headers,
        text
      };
    }

    function sendResponse(octokitResponse, response) {
      response.writeHead(octokitResponse.status, octokitResponse.headers);
      response.end(octokitResponse.text);
    }

    function onUnhandledRequestDefault$1(request) {
      return {
        status: 404,
        headers: {
          "content-type": "application/json"
        },
        text: JSON.stringify({
          error: `Unknown route: ${request.method} ${request.url}`
        })
      };
    }

    async function handleRequest(app, {
      pathPrefix = "/api/github/oauth"
    }, request) {
      if (request.method === "OPTIONS") {
        return {
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "*",
            "access-control-allow-headers": "Content-Type, User-Agent, Authorization"
          }
        };
      } // request.url may include ?query parameters which we don't want for `route`
      // hence the workaround using new URL()


      const {
        pathname
      } = new URL(request.url, "http://localhost");
      const route = [request.method, pathname].join(" ");
      const routes = {
        getLogin: `GET ${pathPrefix}/login`,
        getCallback: `GET ${pathPrefix}/callback`,
        createToken: `POST ${pathPrefix}/token`,
        getToken: `GET ${pathPrefix}/token`,
        patchToken: `PATCH ${pathPrefix}/token`,
        patchRefreshToken: `PATCH ${pathPrefix}/refresh-token`,
        scopeToken: `POST ${pathPrefix}/token/scoped`,
        deleteToken: `DELETE ${pathPrefix}/token`,
        deleteGrant: `DELETE ${pathPrefix}/grant`
      }; // handle unknown routes

      if (!Object.values(routes).includes(route)) {
        return null;
      }

      let json;

      try {
        const text = await request.text();
        json = text ? JSON.parse(text) : {};
      } catch (error) {
        return {
          status: 400,
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*"
          },
          text: JSON.stringify({
            error: "[@octokit/oauth-app] request error"
          })
        };
      }

      const {
        searchParams
      } = new URL(request.url, "http://localhost");
      const query = fromEntries(searchParams);
      const headers = request.headers;

      try {
        var _headers$authorizatio6;

        if (route === routes.getLogin) {
          const {
            url
          } = app.getWebFlowAuthorizationUrl({
            state: query.state,
            scopes: query.scopes ? query.scopes.split(",") : undefined,
            allowSignup: query.allowSignup !== "false",
            redirectUrl: query.redirectUrl
          });
          return {
            status: 302,
            headers: {
              location: url
            }
          };
        }

        if (route === routes.getCallback) {
          if (query.error) {
            throw new Error(`[@octokit/oauth-app] ${query.error} ${query.error_description}`);
          }

          if (!query.state || !query.code) {
            throw new Error('[@octokit/oauth-app] Both "code" & "state" parameters are required');
          }

          const {
            authentication: {
              token
            }
          } = await app.createToken({
            state: query.state,
            code: query.code
          });
          return {
            status: 200,
            headers: {
              "content-type": "text/html"
            },
            text: `<h1>Token created successfull</h1>
    
<p>Your token is: <strong>${token}</strong>. Copy it now as it cannot be shown again.</p>`
          };
        }

        if (route === routes.createToken) {
          const {
            state: oauthState,
            code,
            redirectUrl
          } = json;

          if (!oauthState || !code) {
            throw new Error('[@octokit/oauth-app] Both "code" & "state" parameters are required');
          }

          const result = await app.createToken({
            state: oauthState,
            code,
            redirectUrl
          }); // @ts-ignore

          delete result.authentication.clientSecret;
          return {
            status: 201,
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*"
            },
            text: JSON.stringify(result)
          };
        }

        if (route === routes.getToken) {
          var _headers$authorizatio;

          const token = (_headers$authorizatio = headers.authorization) === null || _headers$authorizatio === void 0 ? void 0 : _headers$authorizatio.substr("token ".length);

          if (!token) {
            throw new Error('[@octokit/oauth-app] "Authorization" header is required');
          }

          const result = await app.checkToken({
            token
          }); // @ts-ignore

          delete result.authentication.clientSecret;
          return {
            status: 200,
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*"
            },
            text: JSON.stringify(result)
          };
        }

        if (route === routes.patchToken) {
          var _headers$authorizatio2;

          const token = (_headers$authorizatio2 = headers.authorization) === null || _headers$authorizatio2 === void 0 ? void 0 : _headers$authorizatio2.substr("token ".length);

          if (!token) {
            throw new Error('[@octokit/oauth-app] "Authorization" header is required');
          }

          const result = await app.resetToken({
            token
          }); // @ts-ignore

          delete result.authentication.clientSecret;
          return {
            status: 200,
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*"
            },
            text: JSON.stringify(result)
          };
        }

        if (route === routes.patchRefreshToken) {
          var _headers$authorizatio3;

          const token = (_headers$authorizatio3 = headers.authorization) === null || _headers$authorizatio3 === void 0 ? void 0 : _headers$authorizatio3.substr("token ".length);

          if (!token) {
            throw new Error('[@octokit/oauth-app] "Authorization" header is required');
          }

          const {
            refreshToken
          } = json;

          if (!refreshToken) {
            throw new Error("[@octokit/oauth-app] refreshToken must be sent in request body");
          }

          const result = await app.refreshToken({
            refreshToken
          }); // @ts-ignore

          delete result.authentication.clientSecret;
          return {
            status: 200,
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*"
            },
            text: JSON.stringify(result)
          };
        }

        if (route === routes.scopeToken) {
          var _headers$authorizatio4;

          const token = (_headers$authorizatio4 = headers.authorization) === null || _headers$authorizatio4 === void 0 ? void 0 : _headers$authorizatio4.substr("token ".length);

          if (!token) {
            throw new Error('[@octokit/oauth-app] "Authorization" header is required');
          }

          const result = await app.scopeToken(_objectSpread2$1({
            token
          }, json)); // @ts-ignore

          delete result.authentication.clientSecret;
          return {
            status: 200,
            headers: {
              "content-type": "application/json",
              "access-control-allow-origin": "*"
            },
            text: JSON.stringify(result)
          };
        }

        if (route === routes.deleteToken) {
          var _headers$authorizatio5;

          const token = (_headers$authorizatio5 = headers.authorization) === null || _headers$authorizatio5 === void 0 ? void 0 : _headers$authorizatio5.substr("token ".length);

          if (!token) {
            throw new Error('[@octokit/oauth-app] "Authorization" header is required');
          }

          await app.deleteToken({
            token
          });
          return {
            status: 204,
            headers: {
              "access-control-allow-origin": "*"
            }
          };
        } // route === routes.deleteGrant


        const token = (_headers$authorizatio6 = headers.authorization) === null || _headers$authorizatio6 === void 0 ? void 0 : _headers$authorizatio6.substr("token ".length);

        if (!token) {
          throw new Error('[@octokit/oauth-app] "Authorization" header is required');
        }

        await app.deleteAuthorization({
          token
        });
        return {
          status: 204,
          headers: {
            "access-control-allow-origin": "*"
          }
        };
      } catch (error) {
        return {
          status: 400,
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*"
          },
          text: JSON.stringify({
            error: error.message
          })
        };
      }
    }

    function onUnhandledRequestDefaultNode(request, response) {
      const octokitRequest = parseRequest(request);
      const octokitResponse = onUnhandledRequestDefault$1(octokitRequest);
      sendResponse(octokitResponse, response);
    }

    function createNodeMiddleware$1(app, {
      pathPrefix,
      onUnhandledRequest = onUnhandledRequestDefaultNode
    } = {}) {
      return async function (request, response, next) {
        const octokitRequest = parseRequest(request);
        const octokitResponse = await handleRequest(app, {
          pathPrefix
        }, octokitRequest);

        if (octokitResponse) {
          sendResponse(octokitResponse, response);
        } else if (typeof next === "function") {
          next();
        } else {
          onUnhandledRequest(request, response);
        }
      };
    }

    function parseRequest$1(request) {
      // @ts-ignore Worker environment supports fromEntries/entries.
      const headers = Object.fromEntries(request.headers.entries());
      return {
        method: request.method,
        url: request.url,
        headers,
        text: () => request.text()
      };
    }

    function sendResponse$1(octokitResponse) {
      return new Response(octokitResponse.text, {
        status: octokitResponse.status,
        headers: octokitResponse.headers
      });
    }

    async function onUnhandledRequestDefaultCloudflare(request) {
      const octokitRequest = parseRequest$1(request);
      const octokitResponse = onUnhandledRequestDefault$1(octokitRequest);
      return sendResponse$1(octokitResponse);
    }

    function createCloudflareHandler(app, {
      pathPrefix,
      onUnhandledRequest = onUnhandledRequestDefaultCloudflare
    } = {}) {
      return async function (request) {
        const octokitRequest = parseRequest$1(request);
        const octokitResponse = await handleRequest(app, {
          pathPrefix
        }, octokitRequest);
        return octokitResponse ? sendResponse$1(octokitResponse) : await onUnhandledRequest(request);
      };
    }

    function parseRequest$2(request) {
      const {
        method
      } = request.requestContext.http;
      let url = request.rawPath;
      const {
        stage
      } = request.requestContext;
      if (url.startsWith("/" + stage)) url = url.substring(stage.length + 1);
      if (request.rawQueryString) url += "?" + request.rawQueryString;
      const headers = request.headers;

      const text = async () => request.body || "";

      return {
        method,
        url,
        headers,
        text
      };
    }

    function sendResponse$2(octokitResponse) {
      return {
        statusCode: octokitResponse.status,
        headers: octokitResponse.headers,
        body: octokitResponse.text
      };
    }

    async function onUnhandledRequestDefaultAWSAPIGatewayV2(event) {
      const request = parseRequest$2(event);
      const response = onUnhandledRequestDefault$1(request);
      return sendResponse$2(response);
    }

    function createAWSLambdaAPIGatewayV2Handler(app, {
      pathPrefix,
      onUnhandledRequest = onUnhandledRequestDefaultAWSAPIGatewayV2
    } = {}) {
      return async function (event) {
        const request = parseRequest$2(event);
        const response = await handleRequest(app, {
          pathPrefix
        }, request);
        return response ? sendResponse$2(response) : onUnhandledRequest(event);
      };
    }

    class OAuthApp {
      constructor(options) {
        const Octokit = options.Octokit || OAuthAppOctokit;
        this.type = options.clientType || "oauth-app";
        const octokit = new Octokit({
          authStrategy: OAuthAppAuth.createOAuthAppAuth,
          auth: {
            clientType: this.type,
            clientId: options.clientId,
            clientSecret: options.clientSecret
          }
        });
        const state = {
          clientType: this.type,
          clientId: options.clientId,
          clientSecret: options.clientSecret,
          // @ts-expect-error defaultScopes not permitted for GitHub Apps
          defaultScopes: options.defaultScopes || [],
          allowSignup: options.allowSignup,
          baseUrl: options.baseUrl,
          log: options.log,
          Octokit,
          octokit,
          eventHandlers: {}
        };
        this.on = addEventHandler.bind(null, state); // @ts-expect-error TODO: figure this out

        this.octokit = octokit;
        this.getUserOctokit = getUserOctokitWithState.bind(null, state);
        this.getWebFlowAuthorizationUrl = getWebFlowAuthorizationUrlWithState.bind(null, state);
        this.createToken = createTokenWithState.bind(null, state);
        this.checkToken = checkTokenWithState.bind(null, state);
        this.resetToken = resetTokenWithState.bind(null, state);
        this.refreshToken = refreshTokenWithState.bind(null, state);
        this.scopeToken = scopeTokenWithState.bind(null, state);
        this.deleteToken = deleteTokenWithState.bind(null, state);
        this.deleteAuthorization = deleteAuthorizationWithState.bind(null, state);
      }

      static defaults(defaults) {
        const OAuthAppWithDefaults = class extends this {
          constructor(...args) {
            super(_objectSpread2$1(_objectSpread2$1({}, defaults), args[0]));
          }

        };
        return OAuthAppWithDefaults;
      }

    }
    OAuthApp.VERSION = VERSION$2;

    var OAuthApp_1 = OAuthApp;
    var createAWSLambdaAPIGatewayV2Handler_1 = createAWSLambdaAPIGatewayV2Handler;
    var createCloudflareHandler_1 = createCloudflareHandler;
    var createNodeMiddleware_1 = createNodeMiddleware$1;


    var distNode = /*#__PURE__*/Object.defineProperty({
    	OAuthApp: OAuthApp_1,
    	createAWSLambdaAPIGatewayV2Handler: createAWSLambdaAPIGatewayV2Handler_1,
    	createCloudflareHandler: createCloudflareHandler_1,
    	createNodeMiddleware: createNodeMiddleware_1
    }, '__esModule', {value: true});

    var indentString = (string, count = 1, options) => {
    	options = {
    		indent: ' ',
    		includeEmptyLines: false,
    		...options
    	};

    	if (typeof string !== 'string') {
    		throw new TypeError(
    			`Expected \`input\` to be a \`string\`, got \`${typeof string}\``
    		);
    	}

    	if (typeof count !== 'number') {
    		throw new TypeError(
    			`Expected \`count\` to be a \`number\`, got \`${typeof count}\``
    		);
    	}

    	if (typeof options.indent !== 'string') {
    		throw new TypeError(
    			`Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``
    		);
    	}

    	if (count === 0) {
    		return string;
    	}

    	const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;

    	return string.replace(regex, options.indent.repeat(count));
    };

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var os = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/;
    const pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:babel-polyfill|pirates)\/.*)?\w+)\.js:\d+:\d+)|native)/;
    const homeDir = typeof os.homedir === 'undefined' ? '' : os.homedir();

    var cleanStack = (stack, options) => {
    	options = Object.assign({pretty: false}, options);

    	return stack.replace(/\\/g, '/')
    		.split('\n')
    		.filter(line => {
    			const pathMatches = line.match(extractPathRegex);
    			if (pathMatches === null || !pathMatches[1]) {
    				return true;
    			}

    			const match = pathMatches[1];

    			// Electron
    			if (
    				match.includes('.app/Contents/Resources/electron.asar') ||
    				match.includes('.app/Contents/Resources/default_app.asar')
    			) {
    				return false;
    			}

    			return !pathRegex.test(match);
    		})
    		.filter(line => line.trim() !== '')
    		.map(line => {
    			if (options.pretty) {
    				return line.replace(extractPathRegex, (m, p1) => m.replace(p1, p1.replace(homeDir, '~')));
    			}

    			return line;
    		})
    		.join('\n');
    };

    const cleanInternalStack = stack => stack.replace(/\s+at .*aggregate-error\/index.js:\d+:\d+\)?/g, '');

    class AggregateError extends Error {
    	constructor(errors) {
    		if (!Array.isArray(errors)) {
    			throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
    		}

    		errors = [...errors].map(error => {
    			if (error instanceof Error) {
    				return error;
    			}

    			if (error !== null && typeof error === 'object') {
    				// Handle plain error objects with message property and/or possibly other metadata
    				return Object.assign(new Error(error.message), error);
    			}

    			return new Error(error);
    		});

    		let message = errors
    			.map(error => {
    				// The `stack` property is not standardized, so we can't assume it exists
    				return typeof error.stack === 'string' ? cleanInternalStack(cleanStack(error.stack)) : String(error);
    			})
    			.join('\n');
    		message = '\n' + indentString(message, 4);
    		super(message);

    		this.name = 'AggregateError';

    		Object.defineProperty(this, '_errors', {value: errors});
    	}

    	* [Symbol.iterator]() {
    		for (const error of this._errors) {
    			yield error;
    		}
    	}
    }

    var aggregateError = AggregateError;

    const enc = new TextEncoder();
    async function sign$1(secret, data) {
        const signature = await crypto.subtle.sign("HMAC", await importKey(secret), enc.encode(data));
        return UInt8ArrayToHex(signature);
    }
    async function verify$1(secret, data, signature) {
        return await crypto.subtle.verify("HMAC", await importKey(secret), hexToUInt8Array(signature), enc.encode(data));
    }
    function hexToUInt8Array(string) {
        // convert string to pairs of 2 characters
        const pairs = string.match(/[\dA-F]{2}/gi);
        // convert the octets to integers
        const integers = pairs.map(function (s) {
            return parseInt(s, 16);
        });
        return new Uint8Array(integers);
    }
    function UInt8ArrayToHex(signature) {
        return Array.prototype.map
            .call(new Uint8Array(signature), (x) => x.toString(16).padStart(2, "0"))
            .join("");
    }
    async function importKey(secret) {
        return crypto.subtle.importKey("raw", // raw format of the key - should be Uint8Array
        enc.encode(secret), {
            // algorithm details
            name: "HMAC",
            hash: { name: "SHA-256" },
        }, false, // export = false
        ["sign", "verify"] // what this key can do
        );
    }

    const createLogger = (logger) => ({
        debug: () => { },
        info: () => { },
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        ...logger,
    });

    // THIS FILE IS GENERATED - DO NOT EDIT DIRECTLY
    // make edits in scripts/generate-types.ts
    const emitterEventNames = [
        "branch_protection_rule",
        "branch_protection_rule.created",
        "branch_protection_rule.deleted",
        "branch_protection_rule.edited",
        "check_run",
        "check_run.completed",
        "check_run.created",
        "check_run.requested_action",
        "check_run.rerequested",
        "check_suite",
        "check_suite.completed",
        "check_suite.requested",
        "check_suite.rerequested",
        "code_scanning_alert",
        "code_scanning_alert.appeared_in_branch",
        "code_scanning_alert.closed_by_user",
        "code_scanning_alert.created",
        "code_scanning_alert.fixed",
        "code_scanning_alert.reopened",
        "code_scanning_alert.reopened_by_user",
        "commit_comment",
        "commit_comment.created",
        "create",
        "delete",
        "deploy_key",
        "deploy_key.created",
        "deploy_key.deleted",
        "deployment",
        "deployment.created",
        "deployment_status",
        "deployment_status.created",
        "discussion",
        "discussion.answered",
        "discussion.category_changed",
        "discussion.created",
        "discussion.deleted",
        "discussion.edited",
        "discussion.labeled",
        "discussion.locked",
        "discussion.pinned",
        "discussion.transferred",
        "discussion.unanswered",
        "discussion.unlabeled",
        "discussion.unlocked",
        "discussion.unpinned",
        "discussion_comment",
        "discussion_comment.created",
        "discussion_comment.deleted",
        "discussion_comment.edited",
        "fork",
        "github_app_authorization",
        "github_app_authorization.revoked",
        "gollum",
        "installation",
        "installation.created",
        "installation.deleted",
        "installation.new_permissions_accepted",
        "installation.suspend",
        "installation.unsuspend",
        "installation_repositories",
        "installation_repositories.added",
        "installation_repositories.removed",
        "issue_comment",
        "issue_comment.created",
        "issue_comment.deleted",
        "issue_comment.edited",
        "issues",
        "issues.assigned",
        "issues.closed",
        "issues.deleted",
        "issues.demilestoned",
        "issues.edited",
        "issues.labeled",
        "issues.locked",
        "issues.milestoned",
        "issues.opened",
        "issues.pinned",
        "issues.reopened",
        "issues.transferred",
        "issues.unassigned",
        "issues.unlabeled",
        "issues.unlocked",
        "issues.unpinned",
        "label",
        "label.created",
        "label.deleted",
        "label.edited",
        "marketplace_purchase",
        "marketplace_purchase.cancelled",
        "marketplace_purchase.changed",
        "marketplace_purchase.pending_change",
        "marketplace_purchase.pending_change_cancelled",
        "marketplace_purchase.purchased",
        "member",
        "member.added",
        "member.edited",
        "member.removed",
        "membership",
        "membership.added",
        "membership.removed",
        "meta",
        "meta.deleted",
        "milestone",
        "milestone.closed",
        "milestone.created",
        "milestone.deleted",
        "milestone.edited",
        "milestone.opened",
        "org_block",
        "org_block.blocked",
        "org_block.unblocked",
        "organization",
        "organization.deleted",
        "organization.member_added",
        "organization.member_invited",
        "organization.member_removed",
        "organization.renamed",
        "package",
        "package.published",
        "package.updated",
        "page_build",
        "ping",
        "project",
        "project.closed",
        "project.created",
        "project.deleted",
        "project.edited",
        "project.reopened",
        "project_card",
        "project_card.converted",
        "project_card.created",
        "project_card.deleted",
        "project_card.edited",
        "project_card.moved",
        "project_column",
        "project_column.created",
        "project_column.deleted",
        "project_column.edited",
        "project_column.moved",
        "public",
        "pull_request",
        "pull_request.assigned",
        "pull_request.auto_merge_disabled",
        "pull_request.auto_merge_enabled",
        "pull_request.closed",
        "pull_request.converted_to_draft",
        "pull_request.edited",
        "pull_request.labeled",
        "pull_request.locked",
        "pull_request.opened",
        "pull_request.ready_for_review",
        "pull_request.reopened",
        "pull_request.review_request_removed",
        "pull_request.review_requested",
        "pull_request.synchronize",
        "pull_request.unassigned",
        "pull_request.unlabeled",
        "pull_request.unlocked",
        "pull_request_review",
        "pull_request_review.dismissed",
        "pull_request_review.edited",
        "pull_request_review.submitted",
        "pull_request_review_comment",
        "pull_request_review_comment.created",
        "pull_request_review_comment.deleted",
        "pull_request_review_comment.edited",
        "pull_request_review_thread",
        "pull_request_review_thread.resolved",
        "pull_request_review_thread.unresolved",
        "push",
        "release",
        "release.created",
        "release.deleted",
        "release.edited",
        "release.prereleased",
        "release.published",
        "release.released",
        "release.unpublished",
        "repository",
        "repository.archived",
        "repository.created",
        "repository.deleted",
        "repository.edited",
        "repository.privatized",
        "repository.publicized",
        "repository.renamed",
        "repository.transferred",
        "repository.unarchived",
        "repository_dispatch",
        "repository_import",
        "repository_vulnerability_alert",
        "repository_vulnerability_alert.create",
        "repository_vulnerability_alert.dismiss",
        "repository_vulnerability_alert.resolve",
        "secret_scanning_alert",
        "secret_scanning_alert.created",
        "secret_scanning_alert.reopened",
        "secret_scanning_alert.resolved",
        "security_advisory",
        "security_advisory.performed",
        "security_advisory.published",
        "security_advisory.updated",
        "security_advisory.withdrawn",
        "sponsorship",
        "sponsorship.cancelled",
        "sponsorship.created",
        "sponsorship.edited",
        "sponsorship.pending_cancellation",
        "sponsorship.pending_tier_change",
        "sponsorship.tier_changed",
        "star",
        "star.created",
        "star.deleted",
        "status",
        "team",
        "team.added_to_repository",
        "team.created",
        "team.deleted",
        "team.edited",
        "team.removed_from_repository",
        "team_add",
        "watch",
        "watch.started",
        "workflow_dispatch",
        "workflow_job",
        "workflow_job.completed",
        "workflow_job.in_progress",
        "workflow_job.queued",
        "workflow_job.started",
        "workflow_run",
        "workflow_run.completed",
        "workflow_run.requested",
    ];

    function handleEventHandlers(state, webhookName, handler) {
        if (!state.hooks[webhookName]) {
            state.hooks[webhookName] = [];
        }
        state.hooks[webhookName].push(handler);
    }
    function receiverOn(state, webhookNameOrNames, handler) {
        if (Array.isArray(webhookNameOrNames)) {
            webhookNameOrNames.forEach((webhookName) => receiverOn(state, webhookName, handler));
            return;
        }
        if (["*", "error"].includes(webhookNameOrNames)) {
            const webhookName = webhookNameOrNames === "*" ? "any" : webhookNameOrNames;
            const message = `Using the "${webhookNameOrNames}" event with the regular Webhooks.on() function is not supported. Please use the Webhooks.on${webhookName.charAt(0).toUpperCase() + webhookName.slice(1)}() method instead`;
            throw new Error(message);
        }
        if (!emitterEventNames.includes(webhookNameOrNames)) {
            state.log.warn(`"${webhookNameOrNames}" is not a known webhook name (https://developer.github.com/v3/activity/events/types/)`);
        }
        handleEventHandlers(state, webhookNameOrNames, handler);
    }
    function receiverOnAny(state, handler) {
        handleEventHandlers(state, "*", handler);
    }
    function receiverOnError(state, handler) {
        handleEventHandlers(state, "error", handler);
    }

    // Errors thrown or rejected Promises in "error" event handlers are not handled
    // as they are in the webhook event handlers. If errors occur, we log a
    // "Fatal: Error occurred" message to stdout
    function wrapErrorHandler(handler, error) {
        let returnValue;
        try {
            returnValue = handler(error);
        }
        catch (error) {
            console.log('FATAL: Error occurred in "error" event handler');
            console.log(error);
        }
        if (returnValue && returnValue.catch) {
            returnValue.catch((error) => {
                console.log('FATAL: Error occurred in "error" event handler');
                console.log(error);
            });
        }
    }

    // @ts-ignore to address #245
    function getHooks(state, eventPayloadAction, eventName) {
        const hooks = [state.hooks[eventName], state.hooks["*"]];
        if (eventPayloadAction) {
            hooks.unshift(state.hooks[`${eventName}.${eventPayloadAction}`]);
        }
        return [].concat(...hooks.filter(Boolean));
    }
    // main handler function
    function receiverHandle(state, event) {
        const errorHandlers = state.hooks.error || [];
        if (event instanceof Error) {
            const error = Object.assign(new aggregateError([event]), {
                event,
                errors: [event],
            });
            errorHandlers.forEach((handler) => wrapErrorHandler(handler, error));
            return Promise.reject(error);
        }
        if (!event || !event.name) {
            throw new aggregateError(["Event name not passed"]);
        }
        if (!event.payload) {
            throw new aggregateError(["Event payload not passed"]);
        }
        // flatten arrays of event listeners and remove undefined values
        const hooks = getHooks(state, "action" in event.payload ? event.payload.action : null, event.name);
        if (hooks.length === 0) {
            return Promise.resolve();
        }
        const errors = [];
        const promises = hooks.map((handler) => {
            let promise = Promise.resolve(event);
            if (state.transform) {
                promise = promise.then(state.transform);
            }
            return promise
                .then((event) => {
                return handler(event);
            })
                .catch((error) => errors.push(Object.assign(error, { event })));
        });
        return Promise.all(promises).then(() => {
            if (errors.length === 0) {
                return;
            }
            const error = new aggregateError(errors);
            Object.assign(error, {
                event,
                errors,
            });
            errorHandlers.forEach((handler) => wrapErrorHandler(handler, error));
            throw error;
        });
    }

    function removeListener(state, webhookNameOrNames, handler) {
        if (Array.isArray(webhookNameOrNames)) {
            webhookNameOrNames.forEach((webhookName) => removeListener(state, webhookName, handler));
            return;
        }
        if (!state.hooks[webhookNameOrNames]) {
            return;
        }
        // remove last hook that has been added, that way
        // it behaves the same as removeListener
        for (let i = state.hooks[webhookNameOrNames].length - 1; i >= 0; i--) {
            if (state.hooks[webhookNameOrNames][i] === handler) {
                state.hooks[webhookNameOrNames].splice(i, 1);
                return;
            }
        }
    }

    function createEventHandler(options) {
        const state = {
            hooks: {},
            log: createLogger(options && options.log),
        };
        if (options && options.transform) {
            state.transform = options.transform;
        }
        return {
            on: receiverOn.bind(null, state),
            onAny: receiverOnAny.bind(null, state),
            onError: receiverOnError.bind(null, state),
            removeListener: removeListener.bind(null, state),
            receive: receiverHandle.bind(null, state),
        };
    }

    /**
     * GitHub sends its JSON with an indentation of 2 spaces and a line break at the end
     */
    function toNormalizedJsonString(payload) {
        const payloadString = JSON.stringify(payload);
        return payloadString.replace(/[^\\]\\u[\da-f]{4}/g, (s) => {
            return s.substr(0, 3) + s.substr(3).toUpperCase();
        });
    }

    async function sign(secret, payload) {
        return sign$1(secret, typeof payload === "string" ? payload : toNormalizedJsonString(payload));
    }

    async function verify(secret, payload, signature) {
        return verify$1(secret, typeof payload === "string" ? payload : toNormalizedJsonString(payload), signature);
    }

    async function verifyAndReceive(state, event) {
        // verify will validate that the secret is not undefined
        const matchesSignature = await verify$1(state.secret, typeof event.payload === "object"
            ? toNormalizedJsonString(event.payload)
            : event.payload, event.signature);
        if (!matchesSignature) {
            const error = new Error("[@octokit/webhooks] signature does not match event payload and secret");
            return state.eventHandler.receive(Object.assign(error, { event, status: 400 }));
        }
        return state.eventHandler.receive({
            id: event.id,
            name: event.name,
            payload: typeof event.payload === "string"
                ? JSON.parse(event.payload)
                : event.payload,
        });
    }

    const WEBHOOK_HEADERS = [
        "x-github-event",
        "x-hub-signature-256",
        "x-github-delivery",
    ];
    // https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#delivery-headers
    function getMissingHeaders(request) {
        return WEBHOOK_HEADERS.filter((header) => !(header in request.headers));
    }

    // @ts-ignore to address #245
    function getPayload(request) {
        // If request.body already exists we can stop here
        // See https://github.com/octokit/webhooks.js/pull/23
        if (request.body)
            return Promise.resolve(request.body);
        return new Promise((resolve, reject) => {
            let data = "";
            request.setEncoding("utf8");
            // istanbul ignore next
            request.on("error", (error) => reject(new aggregateError([error])));
            request.on("data", (chunk) => (data += chunk));
            request.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch (error) {
                    error.message = "Invalid JSON";
                    error.status = 400;
                    reject(new aggregateError([error]));
                }
            });
        });
    }

    async function middleware(webhooks, options, request, response, next) {
        let pathname;
        try {
            pathname = new URL(request.url, "http://localhost").pathname;
        }
        catch (error) {
            response.writeHead(422, {
                "content-type": "application/json",
            });
            response.end(JSON.stringify({
                error: `Request URL could not be parsed: ${request.url}`,
            }));
            return;
        }
        const isUnknownRoute = request.method !== "POST" || pathname !== options.path;
        const isExpressMiddleware = typeof next === "function";
        if (isUnknownRoute) {
            if (isExpressMiddleware) {
                return next();
            }
            else {
                return options.onUnhandledRequest(request, response);
            }
        }
        const missingHeaders = getMissingHeaders(request).join(", ");
        if (missingHeaders) {
            response.writeHead(400, {
                "content-type": "application/json",
            });
            response.end(JSON.stringify({
                error: `Required headers missing: ${missingHeaders}`,
            }));
            return;
        }
        const eventName = request.headers["x-github-event"];
        const signatureSHA256 = request.headers["x-hub-signature-256"];
        const id = request.headers["x-github-delivery"];
        options.log.debug(`${eventName} event received (id: ${id})`);
        // GitHub will abort the request if it does not receive a response within 10s
        // See https://github.com/octokit/webhooks.js/issues/185
        let didTimeout = false;
        const timeout = setTimeout(() => {
            didTimeout = true;
            response.statusCode = 202;
            response.end("still processing\n");
        }, 9000).unref();
        try {
            const payload = await getPayload(request);
            await webhooks.verifyAndReceive({
                id: id,
                name: eventName,
                payload: payload,
                signature: signatureSHA256,
            });
            clearTimeout(timeout);
            if (didTimeout)
                return;
            response.end("ok\n");
        }
        catch (error) {
            clearTimeout(timeout);
            if (didTimeout)
                return;
            const statusCode = Array.from(error)[0].status;
            response.statusCode = typeof statusCode !== "undefined" ? statusCode : 500;
            response.end(String(error));
        }
    }

    function onUnhandledRequestDefault(request, response) {
        response.writeHead(404, {
            "content-type": "application/json",
        });
        response.end(JSON.stringify({
            error: `Unknown route: ${request.method} ${request.url}`,
        }));
    }

    function createNodeMiddleware(webhooks, { path = "/api/github/webhooks", onUnhandledRequest = onUnhandledRequestDefault, log = createLogger(), } = {}) {
        return middleware.bind(null, webhooks, {
            path,
            onUnhandledRequest,
            log,
        });
    }

    // U holds the return value of `transform` function in Options
    class Webhooks {
        constructor(options) {
            if (!options || !options.secret) {
                throw new Error("[@octokit/webhooks] options.secret required");
            }
            const state = {
                eventHandler: createEventHandler(options),
                secret: options.secret,
                hooks: {},
                log: createLogger(options.log),
            };
            this.sign = sign.bind(null, options.secret);
            this.verify = verify.bind(null, options.secret);
            this.on = state.eventHandler.on;
            this.onAny = state.eventHandler.onAny;
            this.onError = state.eventHandler.onError;
            this.removeListener = state.eventHandler.removeListener;
            this.receive = state.eventHandler.receive;
            this.verifyAndReceive = verifyAndReceive.bind(null, state);
        }
    }

    var distWeb = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Webhooks: Webhooks,
        createEventHandler: createEventHandler,
        createNodeMiddleware: createNodeMiddleware,
        emitterEventNames: emitterEventNames
    });

    var authApp = /*@__PURE__*/getAugmentedNamespace(distWeb$2);

    var webhooks$1 = /*@__PURE__*/getAugmentedNamespace(distWeb);

    var pluginPaginateRest = /*@__PURE__*/getAugmentedNamespace(distWeb$6);

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);

        if (enumerableOnly) {
          symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }

        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    function _asyncIterator(iterable) {
      var method;

      if (typeof Symbol !== "undefined") {
        if (Symbol.asyncIterator) method = iterable[Symbol.asyncIterator];
        if (method == null && Symbol.iterator) method = iterable[Symbol.iterator];
      }

      if (method == null) method = iterable["@@asyncIterator"];
      if (method == null) method = iterable["@@iterator"];
      if (method == null) throw new TypeError("Object is not async iterable");
      return method.call(iterable);
    }

    function _AwaitValue(value) {
      this.wrapped = value;
    }

    function _AsyncGenerator(gen) {
      var front, back;

      function send(key, arg) {
        return new Promise(function (resolve, reject) {
          var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
          };

          if (back) {
            back = back.next = request;
          } else {
            front = back = request;
            resume(key, arg);
          }
        });
      }

      function resume(key, arg) {
        try {
          var result = gen[key](arg);
          var value = result.value;
          var wrappedAwait = value instanceof _AwaitValue;
          Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
            if (wrappedAwait) {
              resume(key === "return" ? "return" : "next", arg);
              return;
            }

            settle(result.done ? "return" : "normal", arg);
          }, function (err) {
            resume("throw", err);
          });
        } catch (err) {
          settle("throw", err);
        }
      }

      function settle(type, value) {
        switch (type) {
          case "return":
            front.resolve({
              value: value,
              done: true
            });
            break;

          case "throw":
            front.reject(value);
            break;

          default:
            front.resolve({
              value: value,
              done: false
            });
            break;
        }

        front = front.next;

        if (front) {
          resume(front.key, front.arg);
        } else {
          back = null;
        }
      }

      this._invoke = send;

      if (typeof gen.return !== "function") {
        this.return = undefined;
      }
    }

    _AsyncGenerator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () {
      return this;
    };

    _AsyncGenerator.prototype.next = function (arg) {
      return this._invoke("next", arg);
    };

    _AsyncGenerator.prototype.throw = function (arg) {
      return this._invoke("throw", arg);
    };

    _AsyncGenerator.prototype.return = function (arg) {
      return this._invoke("return", arg);
    };

    function _wrapAsyncGenerator(fn) {
      return function () {
        return new _AsyncGenerator(fn.apply(this, arguments));
      };
    }

    function _awaitAsyncGenerator(value) {
      return new _AwaitValue(value);
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    const VERSION$1 = "12.0.5";

    function webhooks(appOctokit, options // Explict return type for better debugability and performance,
    // see https://github.com/octokit/app.js/pull/201
    ) {
      return new webhooks$1.Webhooks({
        secret: options.secret,
        transform: async event => {
          if (!("installation" in event.payload) || typeof event.payload.installation !== "object") {
            const octokit = new appOctokit.constructor({
              authStrategy: authUnauthenticated.createUnauthenticatedAuth,
              auth: {
                reason: `"installation" key missing in webhook event payload`
              }
            });
            return _objectSpread2(_objectSpread2({}, event), {}, {
              octokit: octokit
            });
          }

          const installationId = event.payload.installation.id;
          const octokit = await appOctokit.auth({
            type: "installation",
            installationId,

            factory(auth) {
              return new auth.octokit.constructor(_objectSpread2(_objectSpread2({}, auth.octokitOptions), {}, {
                authStrategy: authApp.createAppAuth
              }, {
                auth: _objectSpread2(_objectSpread2({}, auth), {}, {
                  installationId
                })
              }));
            }

          });
          return _objectSpread2(_objectSpread2({}, event), {}, {
            octokit: octokit
          });
        }
      });
    }

    async function getInstallationOctokit(app, installationId) {
      return app.octokit.auth({
        type: "installation",
        installationId: installationId,

        factory(auth) {
          const options = _objectSpread2(_objectSpread2({}, auth.octokitOptions), {}, {
            authStrategy: authApp.createAppAuth
          }, {
            auth: _objectSpread2(_objectSpread2({}, auth), {}, {
              installationId: installationId
            })
          });

          return new auth.octokit.constructor(options);
        }

      });
    }

    function eachInstallationFactory(app) {
      return Object.assign(eachInstallation.bind(null, app), {
        iterator: eachInstallationIterator.bind(null, app)
      });
    }
    async function eachInstallation(app, callback) {
      const i = eachInstallationIterator(app)[Symbol.asyncIterator]();
      let result = await i.next();

      while (!result.done) {
        await callback(result.value);
        result = await i.next();
      }
    }
    function eachInstallationIterator(app) {
      return {
        [Symbol.asyncIterator]() {
          return _wrapAsyncGenerator(function* () {
            const iterator = pluginPaginateRest.composePaginateRest.iterator(app.octokit, "GET /app/installations");
            var _iteratorAbruptCompletion = false;
            var _didIteratorError = false;

            var _iteratorError;

            try {
              for (var _iterator = _asyncIterator(iterator), _step; _iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next())).done; _iteratorAbruptCompletion = false) {
                const {
                  data: installations
                } = _step.value;

                for (const installation of installations) {
                  const installationOctokit = yield _awaitAsyncGenerator(getInstallationOctokit(app, installation.id));
                  yield {
                    octokit: installationOctokit,
                    installation
                  };
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (_iteratorAbruptCompletion && _iterator.return != null) {
                  yield _awaitAsyncGenerator(_iterator.return());
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          })();
        }

      };
    }

    function eachRepositoryFactory(app) {
      return Object.assign(eachRepository.bind(null, app), {
        iterator: eachRepositoryIterator.bind(null, app)
      });
    }
    async function eachRepository(app, queryOrCallback, callback) {
      const i = eachRepositoryIterator(app, callback ? queryOrCallback : undefined)[Symbol.asyncIterator]();
      let result = await i.next();

      while (!result.done) {
        if (callback) {
          await callback(result.value);
        } else {
          await queryOrCallback(result.value);
        }

        result = await i.next();
      }
    }

    function singleInstallationIterator(app, installationId) {
      return {
        [Symbol.asyncIterator]() {
          return _wrapAsyncGenerator(function* () {
            yield {
              octokit: yield _awaitAsyncGenerator(app.getInstallationOctokit(installationId))
            };
          })();
        }

      };
    }

    function eachRepositoryIterator(app, query) {
      return {
        [Symbol.asyncIterator]() {
          return _wrapAsyncGenerator(function* () {
            const iterator = query ? singleInstallationIterator(app, query.installationId) : app.eachInstallation.iterator();
            var _iteratorAbruptCompletion = false;
            var _didIteratorError = false;

            var _iteratorError;

            try {
              for (var _iterator = _asyncIterator(iterator), _step; _iteratorAbruptCompletion = !(_step = yield _awaitAsyncGenerator(_iterator.next())).done; _iteratorAbruptCompletion = false) {
                const {
                  octokit
                } = _step.value;
                const repositoriesIterator = pluginPaginateRest.composePaginateRest.iterator(octokit, "GET /installation/repositories");
                var _iteratorAbruptCompletion2 = false;
                var _didIteratorError2 = false;

                var _iteratorError2;

                try {
                  for (var _iterator2 = _asyncIterator(repositoriesIterator), _step2; _iteratorAbruptCompletion2 = !(_step2 = yield _awaitAsyncGenerator(_iterator2.next())).done; _iteratorAbruptCompletion2 = false) {
                    const {
                      data: repositories
                    } = _step2.value;

                    for (const repository of repositories) {
                      yield {
                        octokit: octokit,
                        repository
                      };
                    }
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (_iteratorAbruptCompletion2 && _iterator2.return != null) {
                      yield _awaitAsyncGenerator(_iterator2.return());
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (_iteratorAbruptCompletion && _iterator.return != null) {
                  yield _awaitAsyncGenerator(_iterator.return());
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          })();
        }

      };
    }

    class App$1 {
      constructor(options) {
        const Octokit = options.Octokit || core.Octokit;
        const authOptions = Object.assign({
          appId: options.appId,
          privateKey: options.privateKey
        }, options.oauth ? {
          clientId: options.oauth.clientId,
          clientSecret: options.oauth.clientSecret
        } : {});
        this.octokit = new Octokit({
          authStrategy: authApp.createAppAuth,
          auth: authOptions,
          log: options.log
        });
        this.log = Object.assign({
          debug: () => {},
          info: () => {},
          warn: console.warn.bind(console),
          error: console.error.bind(console)
        }, options.log); // set app.webhooks depending on whether "webhooks" option has been passed

        if (options.webhooks) {
          // @ts-expect-error TODO: figure this out
          this.webhooks = webhooks(this.octokit, options.webhooks);
        } else {
          Object.defineProperty(this, "webhooks", {
            get() {
              throw new Error("[@octokit/app] webhooks option not set");
            }

          });
        } // set app.oauth depending on whether "oauth" option has been passed


        if (options.oauth) {
          this.oauth = new distNode.OAuthApp(_objectSpread2(_objectSpread2({}, options.oauth), {}, {
            clientType: "github-app",
            Octokit
          }));
        } else {
          Object.defineProperty(this, "oauth", {
            get() {
              throw new Error("[@octokit/app] oauth.clientId / oauth.clientSecret options are not set");
            }

          });
        }

        this.getInstallationOctokit = getInstallationOctokit.bind(null, this);
        this.eachInstallation = eachInstallationFactory(this);
        this.eachRepository = eachRepositoryFactory(this);
      }

      static defaults(defaults) {
        const AppWithDefaults = class extends this {
          constructor(...args) {
            super(_objectSpread2(_objectSpread2({}, defaults), args[0]));
          }

        };
        return AppWithDefaults;
      }

    }
    App$1.VERSION = VERSION$1;

    var App_1 = App$1;

    const VERSION = "1.7.1";

    const Octokit = Octokit$1.plugin(restEndpointMethods, paginateRest, retry
    // throttling
    ).defaults({
        userAgent: `octokit-rest.js/${VERSION}`,
        throttle: {
            onRateLimit,
            onAbuseLimit,
        },
    });
    // istanbul ignore next no need to test internals of the throttle plugin
    function onRateLimit(retryAfter, options, octokit) {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
        if (options.request.retryCount === 0) {
            // only retries once
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
        }
    }
    // istanbul ignore next no need to test internals of the throttle plugin
    function onAbuseLimit(retryAfter, options, octokit) {
        octokit.log.warn(`Abuse detected for request ${options.method} ${options.url}`);
        if (options.request.retryCount === 0) {
            // only retries once
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
        }
    }

    App_1.defaults({ Octokit });
    OAuthApp_1.defaults({ Octokit });

    async function getAccessToken(code) {
        const res = await fetch(`https://2dl08ocvy5.execute-api.us-east-1.amazonaws.com/github_login?code=${code}`);
        const json = await res.json();
        const authParams = Object.fromEntries(new URLSearchParams(json).entries());
        return authParams.access_token;
    }
    function rmQueryParam(key) {
        const params = new URLSearchParams(location.search);
        params.delete(key);
        const url = `${location.pathname}?${params.toString()}`;
        console.log(url);
        history.pushState({}, "", url);
    }
    function getParams() {
        return Object.fromEntries(new URLSearchParams(location.search).entries());
    }
    async function login() {
        const params = getParams();
        if (params.code) {
            rmQueryParam('code');
            localStorage.setItem("access_token", await getAccessToken(params.code));
        }
        const access_token = localStorage.getItem("access_token");
        if (!access_token) {
            return;
        }
        return new Octokit({ auth: access_token });
    }
    async function getUser(octokit) {
        if (!octokit) {
            return;
        }
        const { data: { name }, } = await octokit.request("GET /user");
        return name;
    }
    function loadGist(octokit, gistId) {
        if (!octokit) {
            return;
        }
        return octokit.request("GET /gists/" + gistId);
    }
    // async function save() {
    //     const res = await octokit.rest.gists.create({
    //         description: "https://KidKidKod.com",
    //         public: true,
    //         files: {
    //             "app.md": {
    //                 content: markdown,
    //             },
    //             "app.kidkidkod": {
    //                 content: jar.toString(),
    //             },
    //         },
    //     });
    //     console.log(res);
    // }

    var showdown = createCommonjsModule(function (module) {
    (function(){
    /**
     * Created by Tivie on 13-07-2015.
     */

    function getDefaultOpts (simple) {

      var defaultOptions = {
        omitExtraWLInCodeBlocks: {
          defaultValue: false,
          describe: 'Omit the default extra whiteline added to code blocks',
          type: 'boolean'
        },
        noHeaderId: {
          defaultValue: false,
          describe: 'Turn on/off generated header id',
          type: 'boolean'
        },
        prefixHeaderId: {
          defaultValue: false,
          describe: 'Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic \'section-\' prefix',
          type: 'string'
        },
        rawPrefixHeaderId: {
          defaultValue: false,
          describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
          type: 'boolean'
        },
        ghCompatibleHeaderId: {
          defaultValue: false,
          describe: 'Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)',
          type: 'boolean'
        },
        rawHeaderId: {
          defaultValue: false,
          describe: 'Remove only spaces, \' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids',
          type: 'boolean'
        },
        headerLevelStart: {
          defaultValue: false,
          describe: 'The header blocks level start',
          type: 'integer'
        },
        parseImgDimensions: {
          defaultValue: false,
          describe: 'Turn on/off image dimension parsing',
          type: 'boolean'
        },
        simplifiedAutoLink: {
          defaultValue: false,
          describe: 'Turn on/off GFM autolink style',
          type: 'boolean'
        },
        excludeTrailingPunctuationFromURLs: {
          defaultValue: false,
          describe: 'Excludes trailing punctuation from links generated with autoLinking',
          type: 'boolean'
        },
        literalMidWordUnderscores: {
          defaultValue: false,
          describe: 'Parse midword underscores as literal underscores',
          type: 'boolean'
        },
        literalMidWordAsterisks: {
          defaultValue: false,
          describe: 'Parse midword asterisks as literal asterisks',
          type: 'boolean'
        },
        strikethrough: {
          defaultValue: false,
          describe: 'Turn on/off strikethrough support',
          type: 'boolean'
        },
        tables: {
          defaultValue: false,
          describe: 'Turn on/off tables support',
          type: 'boolean'
        },
        tablesHeaderId: {
          defaultValue: false,
          describe: 'Add an id to table headers',
          type: 'boolean'
        },
        ghCodeBlocks: {
          defaultValue: true,
          describe: 'Turn on/off GFM fenced code blocks support',
          type: 'boolean'
        },
        tasklists: {
          defaultValue: false,
          describe: 'Turn on/off GFM tasklist support',
          type: 'boolean'
        },
        smoothLivePreview: {
          defaultValue: false,
          describe: 'Prevents weird effects in live previews due to incomplete input',
          type: 'boolean'
        },
        smartIndentationFix: {
          defaultValue: false,
          description: 'Tries to smartly fix indentation in es6 strings',
          type: 'boolean'
        },
        disableForced4SpacesIndentedSublists: {
          defaultValue: false,
          description: 'Disables the requirement of indenting nested sublists by 4 spaces',
          type: 'boolean'
        },
        simpleLineBreaks: {
          defaultValue: false,
          description: 'Parses simple line breaks as <br> (GFM Style)',
          type: 'boolean'
        },
        requireSpaceBeforeHeadingText: {
          defaultValue: false,
          description: 'Makes adding a space between `#` and the header text mandatory (GFM Style)',
          type: 'boolean'
        },
        ghMentions: {
          defaultValue: false,
          description: 'Enables github @mentions',
          type: 'boolean'
        },
        ghMentionsLink: {
          defaultValue: 'https://github.com/{u}',
          description: 'Changes the link generated by @mentions. Only applies if ghMentions option is enabled.',
          type: 'string'
        },
        encodeEmails: {
          defaultValue: true,
          description: 'Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities',
          type: 'boolean'
        },
        openLinksInNewWindow: {
          defaultValue: false,
          description: 'Open all links in new windows',
          type: 'boolean'
        },
        backslashEscapesHTMLTags: {
          defaultValue: false,
          description: 'Support for HTML Tag escaping. ex: \<div>foo\</div>',
          type: 'boolean'
        },
        emoji: {
          defaultValue: false,
          description: 'Enable emoji support. Ex: `this is a :smile: emoji`',
          type: 'boolean'
        },
        underline: {
          defaultValue: false,
          description: 'Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`',
          type: 'boolean'
        },
        completeHTMLDocument: {
          defaultValue: false,
          description: 'Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags',
          type: 'boolean'
        },
        metadata: {
          defaultValue: false,
          description: 'Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).',
          type: 'boolean'
        },
        splitAdjacentBlockquotes: {
          defaultValue: false,
          description: 'Split adjacent blockquote blocks',
          type: 'boolean'
        }
      };
      if (simple === false) {
        return JSON.parse(JSON.stringify(defaultOptions));
      }
      var ret = {};
      for (var opt in defaultOptions) {
        if (defaultOptions.hasOwnProperty(opt)) {
          ret[opt] = defaultOptions[opt].defaultValue;
        }
      }
      return ret;
    }

    function allOptionsOn () {
      var options = getDefaultOpts(true),
          ret = {};
      for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
          ret[opt] = true;
        }
      }
      return ret;
    }

    /**
     * Created by Tivie on 06-01-2015.
     */

    // Private properties
    var showdown = {},
        parsers = {},
        extensions = {},
        globalOptions = getDefaultOpts(true),
        setFlavor = 'vanilla',
        flavor = {
          github: {
            omitExtraWLInCodeBlocks:              true,
            simplifiedAutoLink:                   true,
            excludeTrailingPunctuationFromURLs:   true,
            literalMidWordUnderscores:            true,
            strikethrough:                        true,
            tables:                               true,
            tablesHeaderId:                       true,
            ghCodeBlocks:                         true,
            tasklists:                            true,
            disableForced4SpacesIndentedSublists: true,
            simpleLineBreaks:                     true,
            requireSpaceBeforeHeadingText:        true,
            ghCompatibleHeaderId:                 true,
            ghMentions:                           true,
            backslashEscapesHTMLTags:             true,
            emoji:                                true,
            splitAdjacentBlockquotes:             true
          },
          original: {
            noHeaderId:                           true,
            ghCodeBlocks:                         false
          },
          ghost: {
            omitExtraWLInCodeBlocks:              true,
            parseImgDimensions:                   true,
            simplifiedAutoLink:                   true,
            excludeTrailingPunctuationFromURLs:   true,
            literalMidWordUnderscores:            true,
            strikethrough:                        true,
            tables:                               true,
            tablesHeaderId:                       true,
            ghCodeBlocks:                         true,
            tasklists:                            true,
            smoothLivePreview:                    true,
            simpleLineBreaks:                     true,
            requireSpaceBeforeHeadingText:        true,
            ghMentions:                           false,
            encodeEmails:                         true
          },
          vanilla: getDefaultOpts(true),
          allOn: allOptionsOn()
        };

    /**
     * helper namespace
     * @type {{}}
     */
    showdown.helper = {};

    /**
     * TODO LEGACY SUPPORT CODE
     * @type {{}}
     */
    showdown.extensions = {};

    /**
     * Set a global option
     * @static
     * @param {string} key
     * @param {*} value
     * @returns {showdown}
     */
    showdown.setOption = function (key, value) {
      globalOptions[key] = value;
      return this;
    };

    /**
     * Get a global option
     * @static
     * @param {string} key
     * @returns {*}
     */
    showdown.getOption = function (key) {
      return globalOptions[key];
    };

    /**
     * Get the global options
     * @static
     * @returns {{}}
     */
    showdown.getOptions = function () {
      return globalOptions;
    };

    /**
     * Reset global options to the default values
     * @static
     */
    showdown.resetOptions = function () {
      globalOptions = getDefaultOpts(true);
    };

    /**
     * Set the flavor showdown should use as default
     * @param {string} name
     */
    showdown.setFlavor = function (name) {
      if (!flavor.hasOwnProperty(name)) {
        throw Error(name + ' flavor was not found');
      }
      showdown.resetOptions();
      var preset = flavor[name];
      setFlavor = name;
      for (var option in preset) {
        if (preset.hasOwnProperty(option)) {
          globalOptions[option] = preset[option];
        }
      }
    };

    /**
     * Get the currently set flavor
     * @returns {string}
     */
    showdown.getFlavor = function () {
      return setFlavor;
    };

    /**
     * Get the options of a specified flavor. Returns undefined if the flavor was not found
     * @param {string} name Name of the flavor
     * @returns {{}|undefined}
     */
    showdown.getFlavorOptions = function (name) {
      if (flavor.hasOwnProperty(name)) {
        return flavor[name];
      }
    };

    /**
     * Get the default options
     * @static
     * @param {boolean} [simple=true]
     * @returns {{}}
     */
    showdown.getDefaultOptions = function (simple) {
      return getDefaultOpts(simple);
    };

    /**
     * Get or set a subParser
     *
     * subParser(name)       - Get a registered subParser
     * subParser(name, func) - Register a subParser
     * @static
     * @param {string} name
     * @param {function} [func]
     * @returns {*}
     */
    showdown.subParser = function (name, func) {
      if (showdown.helper.isString(name)) {
        if (typeof func !== 'undefined') {
          parsers[name] = func;
        } else {
          if (parsers.hasOwnProperty(name)) {
            return parsers[name];
          } else {
            throw Error('SubParser named ' + name + ' not registered!');
          }
        }
      }
    };

    /**
     * Gets or registers an extension
     * @static
     * @param {string} name
     * @param {object|function=} ext
     * @returns {*}
     */
    showdown.extension = function (name, ext) {

      if (!showdown.helper.isString(name)) {
        throw Error('Extension \'name\' must be a string');
      }

      name = showdown.helper.stdExtName(name);

      // Getter
      if (showdown.helper.isUndefined(ext)) {
        if (!extensions.hasOwnProperty(name)) {
          throw Error('Extension named ' + name + ' is not registered!');
        }
        return extensions[name];

        // Setter
      } else {
        // Expand extension if it's wrapped in a function
        if (typeof ext === 'function') {
          ext = ext();
        }

        // Ensure extension is an array
        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }

        var validExtension = validate(ext, name);

        if (validExtension.valid) {
          extensions[name] = ext;
        } else {
          throw Error(validExtension.error);
        }
      }
    };

    /**
     * Gets all extensions registered
     * @returns {{}}
     */
    showdown.getAllExtensions = function () {
      return extensions;
    };

    /**
     * Remove an extension
     * @param {string} name
     */
    showdown.removeExtension = function (name) {
      delete extensions[name];
    };

    /**
     * Removes all extensions
     */
    showdown.resetExtensions = function () {
      extensions = {};
    };

    /**
     * Validate extension
     * @param {array} extension
     * @param {string} name
     * @returns {{valid: boolean, error: string}}
     */
    function validate (extension, name) {

      var errMsg = (name) ? 'Error in ' + name + ' extension->' : 'Error in unnamed extension',
          ret = {
            valid: true,
            error: ''
          };

      if (!showdown.helper.isArray(extension)) {
        extension = [extension];
      }

      for (var i = 0; i < extension.length; ++i) {
        var baseMsg = errMsg + ' sub-extension ' + i + ': ',
            ext = extension[i];
        if (typeof ext !== 'object') {
          ret.valid = false;
          ret.error = baseMsg + 'must be an object, but ' + typeof ext + ' given';
          return ret;
        }

        if (!showdown.helper.isString(ext.type)) {
          ret.valid = false;
          ret.error = baseMsg + 'property "type" must be a string, but ' + typeof ext.type + ' given';
          return ret;
        }

        var type = ext.type = ext.type.toLowerCase();

        // normalize extension type
        if (type === 'language') {
          type = ext.type = 'lang';
        }

        if (type === 'html') {
          type = ext.type = 'output';
        }

        if (type !== 'lang' && type !== 'output' && type !== 'listener') {
          ret.valid = false;
          ret.error = baseMsg + 'type ' + type + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"';
          return ret;
        }

        if (type === 'listener') {
          if (showdown.helper.isUndefined(ext.listeners)) {
            ret.valid = false;
            ret.error = baseMsg + '. Extensions of type "listener" must have a property called "listeners"';
            return ret;
          }
        } else {
          if (showdown.helper.isUndefined(ext.filter) && showdown.helper.isUndefined(ext.regex)) {
            ret.valid = false;
            ret.error = baseMsg + type + ' extensions must define either a "regex" property or a "filter" method';
            return ret;
          }
        }

        if (ext.listeners) {
          if (typeof ext.listeners !== 'object') {
            ret.valid = false;
            ret.error = baseMsg + '"listeners" property must be an object but ' + typeof ext.listeners + ' given';
            return ret;
          }
          for (var ln in ext.listeners) {
            if (ext.listeners.hasOwnProperty(ln)) {
              if (typeof ext.listeners[ln] !== 'function') {
                ret.valid = false;
                ret.error = baseMsg + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + ln +
                  ' must be a function but ' + typeof ext.listeners[ln] + ' given';
                return ret;
              }
            }
          }
        }

        if (ext.filter) {
          if (typeof ext.filter !== 'function') {
            ret.valid = false;
            ret.error = baseMsg + '"filter" must be a function, but ' + typeof ext.filter + ' given';
            return ret;
          }
        } else if (ext.regex) {
          if (showdown.helper.isString(ext.regex)) {
            ext.regex = new RegExp(ext.regex, 'g');
          }
          if (!(ext.regex instanceof RegExp)) {
            ret.valid = false;
            ret.error = baseMsg + '"regex" property must either be a string or a RegExp object, but ' + typeof ext.regex + ' given';
            return ret;
          }
          if (showdown.helper.isUndefined(ext.replace)) {
            ret.valid = false;
            ret.error = baseMsg + '"regex" extensions must implement a replace string or function';
            return ret;
          }
        }
      }
      return ret;
    }

    /**
     * Validate extension
     * @param {object} ext
     * @returns {boolean}
     */
    showdown.validateExtension = function (ext) {

      var validateExtension = validate(ext, null);
      if (!validateExtension.valid) {
        console.warn(validateExtension.error);
        return false;
      }
      return true;
    };

    /**
     * showdownjs helper functions
     */

    if (!showdown.hasOwnProperty('helper')) {
      showdown.helper = {};
    }

    /**
     * Check if var is string
     * @static
     * @param {string} a
     * @returns {boolean}
     */
    showdown.helper.isString = function (a) {
      return (typeof a === 'string' || a instanceof String);
    };

    /**
     * Check if var is a function
     * @static
     * @param {*} a
     * @returns {boolean}
     */
    showdown.helper.isFunction = function (a) {
      var getType = {};
      return a && getType.toString.call(a) === '[object Function]';
    };

    /**
     * isArray helper function
     * @static
     * @param {*} a
     * @returns {boolean}
     */
    showdown.helper.isArray = function (a) {
      return Array.isArray(a);
    };

    /**
     * Check if value is undefined
     * @static
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     */
    showdown.helper.isUndefined = function (value) {
      return typeof value === 'undefined';
    };

    /**
     * ForEach helper function
     * Iterates over Arrays and Objects (own properties only)
     * @static
     * @param {*} obj
     * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
     */
    showdown.helper.forEach = function (obj, callback) {
      // check if obj is defined
      if (showdown.helper.isUndefined(obj)) {
        throw new Error('obj param is required');
      }

      if (showdown.helper.isUndefined(callback)) {
        throw new Error('callback param is required');
      }

      if (!showdown.helper.isFunction(callback)) {
        throw new Error('callback param must be a function/closure');
      }

      if (typeof obj.forEach === 'function') {
        obj.forEach(callback);
      } else if (showdown.helper.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          callback(obj[i], i, obj);
        }
      } else if (typeof (obj) === 'object') {
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            callback(obj[prop], prop, obj);
          }
        }
      } else {
        throw new Error('obj does not seem to be an array or an iterable object');
      }
    };

    /**
     * Standardidize extension name
     * @static
     * @param {string} s extension name
     * @returns {string}
     */
    showdown.helper.stdExtName = function (s) {
      return s.replace(/[_?*+\/\\.^-]/g, '').replace(/\s/g, '').toLowerCase();
    };

    function escapeCharactersCallback (wholeMatch, m1) {
      var charCodeToEscape = m1.charCodeAt(0);
      return '¨E' + charCodeToEscape + 'E';
    }

    /**
     * Callback used to escape characters when passing through String.replace
     * @static
     * @param {string} wholeMatch
     * @param {string} m1
     * @returns {string}
     */
    showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

    /**
     * Escape characters in a string
     * @static
     * @param {string} text
     * @param {string} charsToEscape
     * @param {boolean} afterBackslash
     * @returns {XML|string|void|*}
     */
    showdown.helper.escapeCharacters = function (text, charsToEscape, afterBackslash) {
      // First we have to escape the escape characters so that
      // we can build a character class out of them
      var regexString = '([' + charsToEscape.replace(/([\[\]\\])/g, '\\$1') + '])';

      if (afterBackslash) {
        regexString = '\\\\' + regexString;
      }

      var regex = new RegExp(regexString, 'g');
      text = text.replace(regex, escapeCharactersCallback);

      return text;
    };

    /**
     * Unescape HTML entities
     * @param txt
     * @returns {string}
     */
    showdown.helper.unescapeHTMLEntities = function (txt) {

      return txt
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    };

    var rgxFindMatchPos = function (str, left, right, flags) {
      var f = flags || '',
          g = f.indexOf('g') > -1,
          x = new RegExp(left + '|' + right, 'g' + f.replace(/g/g, '')),
          l = new RegExp(left, f.replace(/g/g, '')),
          pos = [],
          t, s, m, start, end;

      do {
        t = 0;
        while ((m = x.exec(str))) {
          if (l.test(m[0])) {
            if (!(t++)) {
              s = x.lastIndex;
              start = s - m[0].length;
            }
          } else if (t) {
            if (!--t) {
              end = m.index + m[0].length;
              var obj = {
                left: {start: start, end: s},
                match: {start: s, end: m.index},
                right: {start: m.index, end: end},
                wholeMatch: {start: start, end: end}
              };
              pos.push(obj);
              if (!g) {
                return pos;
              }
            }
          }
        }
      } while (t && (x.lastIndex = s));

      return pos;
    };

    /**
     * matchRecursiveRegExp
     *
     * (c) 2007 Steven Levithan <stevenlevithan.com>
     * MIT License
     *
     * Accepts a string to search, a left and right format delimiter
     * as regex patterns, and optional regex flags. Returns an array
     * of matches, allowing nested instances of left/right delimiters.
     * Use the "g" flag to return all matches, otherwise only the
     * first is returned. Be careful to ensure that the left and
     * right format delimiters produce mutually exclusive matches.
     * Backreferences are not supported within the right delimiter
     * due to how it is internally combined with the left delimiter.
     * When matching strings whose format delimiters are unbalanced
     * to the left or right, the output is intentionally as a
     * conventional regex library with recursion support would
     * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
     * "<" and ">" as the delimiters (both strings contain a single,
     * balanced instance of "<x>").
     *
     * examples:
     * matchRecursiveRegExp("test", "\\(", "\\)")
     * returns: []
     * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
     * returns: ["t<<e>><s>", ""]
     * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
     * returns: ["test"]
     */
    showdown.helper.matchRecursiveRegExp = function (str, left, right, flags) {

      var matchPos = rgxFindMatchPos (str, left, right, flags),
          results = [];

      for (var i = 0; i < matchPos.length; ++i) {
        results.push([
          str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
          str.slice(matchPos[i].match.start, matchPos[i].match.end),
          str.slice(matchPos[i].left.start, matchPos[i].left.end),
          str.slice(matchPos[i].right.start, matchPos[i].right.end)
        ]);
      }
      return results;
    };

    /**
     *
     * @param {string} str
     * @param {string|function} replacement
     * @param {string} left
     * @param {string} right
     * @param {string} flags
     * @returns {string}
     */
    showdown.helper.replaceRecursiveRegExp = function (str, replacement, left, right, flags) {

      if (!showdown.helper.isFunction(replacement)) {
        var repStr = replacement;
        replacement = function () {
          return repStr;
        };
      }

      var matchPos = rgxFindMatchPos(str, left, right, flags),
          finalStr = str,
          lng = matchPos.length;

      if (lng > 0) {
        var bits = [];
        if (matchPos[0].wholeMatch.start !== 0) {
          bits.push(str.slice(0, matchPos[0].wholeMatch.start));
        }
        for (var i = 0; i < lng; ++i) {
          bits.push(
            replacement(
              str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
              str.slice(matchPos[i].match.start, matchPos[i].match.end),
              str.slice(matchPos[i].left.start, matchPos[i].left.end),
              str.slice(matchPos[i].right.start, matchPos[i].right.end)
            )
          );
          if (i < lng - 1) {
            bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
          }
        }
        if (matchPos[lng - 1].wholeMatch.end < str.length) {
          bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
        }
        finalStr = bits.join('');
      }
      return finalStr;
    };

    /**
     * Returns the index within the passed String object of the first occurrence of the specified regex,
     * starting the search at fromIndex. Returns -1 if the value is not found.
     *
     * @param {string} str string to search
     * @param {RegExp} regex Regular expression to search
     * @param {int} [fromIndex = 0] Index to start the search
     * @returns {Number}
     * @throws InvalidArgumentError
     */
    showdown.helper.regexIndexOf = function (str, regex, fromIndex) {
      if (!showdown.helper.isString(str)) {
        throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
      }
      if (regex instanceof RegExp === false) {
        throw 'InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp';
      }
      var indexOf = str.substring(fromIndex || 0).search(regex);
      return (indexOf >= 0) ? (indexOf + (fromIndex || 0)) : indexOf;
    };

    /**
     * Splits the passed string object at the defined index, and returns an array composed of the two substrings
     * @param {string} str string to split
     * @param {int} index index to split string at
     * @returns {[string,string]}
     * @throws InvalidArgumentError
     */
    showdown.helper.splitAtIndex = function (str, index) {
      if (!showdown.helper.isString(str)) {
        throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
      }
      return [str.substring(0, index), str.substring(index)];
    };

    /**
     * Obfuscate an e-mail address through the use of Character Entities,
     * transforming ASCII characters into their equivalent decimal or hex entities.
     *
     * Since it has a random component, subsequent calls to this function produce different results
     *
     * @param {string} mail
     * @returns {string}
     */
    showdown.helper.encodeEmailAddress = function (mail) {
      var encode = [
        function (ch) {
          return '&#' + ch.charCodeAt(0) + ';';
        },
        function (ch) {
          return '&#x' + ch.charCodeAt(0).toString(16) + ';';
        },
        function (ch) {
          return ch;
        }
      ];

      mail = mail.replace(/./g, function (ch) {
        if (ch === '@') {
          // this *must* be encoded. I insist.
          ch = encode[Math.floor(Math.random() * 2)](ch);
        } else {
          var r = Math.random();
          // roughly 10% raw, 45% hex, 45% dec
          ch = (
            r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch)
          );
        }
        return ch;
      });

      return mail;
    };

    /**
     *
     * @param str
     * @param targetLength
     * @param padString
     * @returns {string}
     */
    showdown.helper.padEnd = function padEnd (str, targetLength, padString) {
      /*jshint bitwise: false*/
      // eslint-disable-next-line space-infix-ops
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      /*jshint bitwise: true*/
      padString = String(padString || ' ');
      if (str.length > targetLength) {
        return String(str);
      } else {
        targetLength = targetLength - str.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }
        return String(str) + padString.slice(0,targetLength);
      }
    };

    /**
     * POLYFILLS
     */
    // use this instead of builtin is undefined for IE8 compatibility
    if (typeof console === 'undefined') {
      console = {
        warn: function (msg) {
          alert(msg);
        },
        log: function (msg) {
          alert(msg);
        },
        error: function (msg) {
          throw msg;
        }
      };
    }

    /**
     * Common regexes.
     * We declare some common regexes to improve performance
     */
    showdown.helper.regexes = {
      asteriskDashAndColon: /([*_:~])/g
    };

    /**
     * EMOJIS LIST
     */
    showdown.helper.emojis = {
      '+1':'\ud83d\udc4d',
      '-1':'\ud83d\udc4e',
      '100':'\ud83d\udcaf',
      '1234':'\ud83d\udd22',
      '1st_place_medal':'\ud83e\udd47',
      '2nd_place_medal':'\ud83e\udd48',
      '3rd_place_medal':'\ud83e\udd49',
      '8ball':'\ud83c\udfb1',
      'a':'\ud83c\udd70\ufe0f',
      'ab':'\ud83c\udd8e',
      'abc':'\ud83d\udd24',
      'abcd':'\ud83d\udd21',
      'accept':'\ud83c\ude51',
      'aerial_tramway':'\ud83d\udea1',
      'airplane':'\u2708\ufe0f',
      'alarm_clock':'\u23f0',
      'alembic':'\u2697\ufe0f',
      'alien':'\ud83d\udc7d',
      'ambulance':'\ud83d\ude91',
      'amphora':'\ud83c\udffa',
      'anchor':'\u2693\ufe0f',
      'angel':'\ud83d\udc7c',
      'anger':'\ud83d\udca2',
      'angry':'\ud83d\ude20',
      'anguished':'\ud83d\ude27',
      'ant':'\ud83d\udc1c',
      'apple':'\ud83c\udf4e',
      'aquarius':'\u2652\ufe0f',
      'aries':'\u2648\ufe0f',
      'arrow_backward':'\u25c0\ufe0f',
      'arrow_double_down':'\u23ec',
      'arrow_double_up':'\u23eb',
      'arrow_down':'\u2b07\ufe0f',
      'arrow_down_small':'\ud83d\udd3d',
      'arrow_forward':'\u25b6\ufe0f',
      'arrow_heading_down':'\u2935\ufe0f',
      'arrow_heading_up':'\u2934\ufe0f',
      'arrow_left':'\u2b05\ufe0f',
      'arrow_lower_left':'\u2199\ufe0f',
      'arrow_lower_right':'\u2198\ufe0f',
      'arrow_right':'\u27a1\ufe0f',
      'arrow_right_hook':'\u21aa\ufe0f',
      'arrow_up':'\u2b06\ufe0f',
      'arrow_up_down':'\u2195\ufe0f',
      'arrow_up_small':'\ud83d\udd3c',
      'arrow_upper_left':'\u2196\ufe0f',
      'arrow_upper_right':'\u2197\ufe0f',
      'arrows_clockwise':'\ud83d\udd03',
      'arrows_counterclockwise':'\ud83d\udd04',
      'art':'\ud83c\udfa8',
      'articulated_lorry':'\ud83d\ude9b',
      'artificial_satellite':'\ud83d\udef0',
      'astonished':'\ud83d\ude32',
      'athletic_shoe':'\ud83d\udc5f',
      'atm':'\ud83c\udfe7',
      'atom_symbol':'\u269b\ufe0f',
      'avocado':'\ud83e\udd51',
      'b':'\ud83c\udd71\ufe0f',
      'baby':'\ud83d\udc76',
      'baby_bottle':'\ud83c\udf7c',
      'baby_chick':'\ud83d\udc24',
      'baby_symbol':'\ud83d\udebc',
      'back':'\ud83d\udd19',
      'bacon':'\ud83e\udd53',
      'badminton':'\ud83c\udff8',
      'baggage_claim':'\ud83d\udec4',
      'baguette_bread':'\ud83e\udd56',
      'balance_scale':'\u2696\ufe0f',
      'balloon':'\ud83c\udf88',
      'ballot_box':'\ud83d\uddf3',
      'ballot_box_with_check':'\u2611\ufe0f',
      'bamboo':'\ud83c\udf8d',
      'banana':'\ud83c\udf4c',
      'bangbang':'\u203c\ufe0f',
      'bank':'\ud83c\udfe6',
      'bar_chart':'\ud83d\udcca',
      'barber':'\ud83d\udc88',
      'baseball':'\u26be\ufe0f',
      'basketball':'\ud83c\udfc0',
      'basketball_man':'\u26f9\ufe0f',
      'basketball_woman':'\u26f9\ufe0f&zwj;\u2640\ufe0f',
      'bat':'\ud83e\udd87',
      'bath':'\ud83d\udec0',
      'bathtub':'\ud83d\udec1',
      'battery':'\ud83d\udd0b',
      'beach_umbrella':'\ud83c\udfd6',
      'bear':'\ud83d\udc3b',
      'bed':'\ud83d\udecf',
      'bee':'\ud83d\udc1d',
      'beer':'\ud83c\udf7a',
      'beers':'\ud83c\udf7b',
      'beetle':'\ud83d\udc1e',
      'beginner':'\ud83d\udd30',
      'bell':'\ud83d\udd14',
      'bellhop_bell':'\ud83d\udece',
      'bento':'\ud83c\udf71',
      'biking_man':'\ud83d\udeb4',
      'bike':'\ud83d\udeb2',
      'biking_woman':'\ud83d\udeb4&zwj;\u2640\ufe0f',
      'bikini':'\ud83d\udc59',
      'biohazard':'\u2623\ufe0f',
      'bird':'\ud83d\udc26',
      'birthday':'\ud83c\udf82',
      'black_circle':'\u26ab\ufe0f',
      'black_flag':'\ud83c\udff4',
      'black_heart':'\ud83d\udda4',
      'black_joker':'\ud83c\udccf',
      'black_large_square':'\u2b1b\ufe0f',
      'black_medium_small_square':'\u25fe\ufe0f',
      'black_medium_square':'\u25fc\ufe0f',
      'black_nib':'\u2712\ufe0f',
      'black_small_square':'\u25aa\ufe0f',
      'black_square_button':'\ud83d\udd32',
      'blonde_man':'\ud83d\udc71',
      'blonde_woman':'\ud83d\udc71&zwj;\u2640\ufe0f',
      'blossom':'\ud83c\udf3c',
      'blowfish':'\ud83d\udc21',
      'blue_book':'\ud83d\udcd8',
      'blue_car':'\ud83d\ude99',
      'blue_heart':'\ud83d\udc99',
      'blush':'\ud83d\ude0a',
      'boar':'\ud83d\udc17',
      'boat':'\u26f5\ufe0f',
      'bomb':'\ud83d\udca3',
      'book':'\ud83d\udcd6',
      'bookmark':'\ud83d\udd16',
      'bookmark_tabs':'\ud83d\udcd1',
      'books':'\ud83d\udcda',
      'boom':'\ud83d\udca5',
      'boot':'\ud83d\udc62',
      'bouquet':'\ud83d\udc90',
      'bowing_man':'\ud83d\ude47',
      'bow_and_arrow':'\ud83c\udff9',
      'bowing_woman':'\ud83d\ude47&zwj;\u2640\ufe0f',
      'bowling':'\ud83c\udfb3',
      'boxing_glove':'\ud83e\udd4a',
      'boy':'\ud83d\udc66',
      'bread':'\ud83c\udf5e',
      'bride_with_veil':'\ud83d\udc70',
      'bridge_at_night':'\ud83c\udf09',
      'briefcase':'\ud83d\udcbc',
      'broken_heart':'\ud83d\udc94',
      'bug':'\ud83d\udc1b',
      'building_construction':'\ud83c\udfd7',
      'bulb':'\ud83d\udca1',
      'bullettrain_front':'\ud83d\ude85',
      'bullettrain_side':'\ud83d\ude84',
      'burrito':'\ud83c\udf2f',
      'bus':'\ud83d\ude8c',
      'business_suit_levitating':'\ud83d\udd74',
      'busstop':'\ud83d\ude8f',
      'bust_in_silhouette':'\ud83d\udc64',
      'busts_in_silhouette':'\ud83d\udc65',
      'butterfly':'\ud83e\udd8b',
      'cactus':'\ud83c\udf35',
      'cake':'\ud83c\udf70',
      'calendar':'\ud83d\udcc6',
      'call_me_hand':'\ud83e\udd19',
      'calling':'\ud83d\udcf2',
      'camel':'\ud83d\udc2b',
      'camera':'\ud83d\udcf7',
      'camera_flash':'\ud83d\udcf8',
      'camping':'\ud83c\udfd5',
      'cancer':'\u264b\ufe0f',
      'candle':'\ud83d\udd6f',
      'candy':'\ud83c\udf6c',
      'canoe':'\ud83d\udef6',
      'capital_abcd':'\ud83d\udd20',
      'capricorn':'\u2651\ufe0f',
      'car':'\ud83d\ude97',
      'card_file_box':'\ud83d\uddc3',
      'card_index':'\ud83d\udcc7',
      'card_index_dividers':'\ud83d\uddc2',
      'carousel_horse':'\ud83c\udfa0',
      'carrot':'\ud83e\udd55',
      'cat':'\ud83d\udc31',
      'cat2':'\ud83d\udc08',
      'cd':'\ud83d\udcbf',
      'chains':'\u26d3',
      'champagne':'\ud83c\udf7e',
      'chart':'\ud83d\udcb9',
      'chart_with_downwards_trend':'\ud83d\udcc9',
      'chart_with_upwards_trend':'\ud83d\udcc8',
      'checkered_flag':'\ud83c\udfc1',
      'cheese':'\ud83e\uddc0',
      'cherries':'\ud83c\udf52',
      'cherry_blossom':'\ud83c\udf38',
      'chestnut':'\ud83c\udf30',
      'chicken':'\ud83d\udc14',
      'children_crossing':'\ud83d\udeb8',
      'chipmunk':'\ud83d\udc3f',
      'chocolate_bar':'\ud83c\udf6b',
      'christmas_tree':'\ud83c\udf84',
      'church':'\u26ea\ufe0f',
      'cinema':'\ud83c\udfa6',
      'circus_tent':'\ud83c\udfaa',
      'city_sunrise':'\ud83c\udf07',
      'city_sunset':'\ud83c\udf06',
      'cityscape':'\ud83c\udfd9',
      'cl':'\ud83c\udd91',
      'clamp':'\ud83d\udddc',
      'clap':'\ud83d\udc4f',
      'clapper':'\ud83c\udfac',
      'classical_building':'\ud83c\udfdb',
      'clinking_glasses':'\ud83e\udd42',
      'clipboard':'\ud83d\udccb',
      'clock1':'\ud83d\udd50',
      'clock10':'\ud83d\udd59',
      'clock1030':'\ud83d\udd65',
      'clock11':'\ud83d\udd5a',
      'clock1130':'\ud83d\udd66',
      'clock12':'\ud83d\udd5b',
      'clock1230':'\ud83d\udd67',
      'clock130':'\ud83d\udd5c',
      'clock2':'\ud83d\udd51',
      'clock230':'\ud83d\udd5d',
      'clock3':'\ud83d\udd52',
      'clock330':'\ud83d\udd5e',
      'clock4':'\ud83d\udd53',
      'clock430':'\ud83d\udd5f',
      'clock5':'\ud83d\udd54',
      'clock530':'\ud83d\udd60',
      'clock6':'\ud83d\udd55',
      'clock630':'\ud83d\udd61',
      'clock7':'\ud83d\udd56',
      'clock730':'\ud83d\udd62',
      'clock8':'\ud83d\udd57',
      'clock830':'\ud83d\udd63',
      'clock9':'\ud83d\udd58',
      'clock930':'\ud83d\udd64',
      'closed_book':'\ud83d\udcd5',
      'closed_lock_with_key':'\ud83d\udd10',
      'closed_umbrella':'\ud83c\udf02',
      'cloud':'\u2601\ufe0f',
      'cloud_with_lightning':'\ud83c\udf29',
      'cloud_with_lightning_and_rain':'\u26c8',
      'cloud_with_rain':'\ud83c\udf27',
      'cloud_with_snow':'\ud83c\udf28',
      'clown_face':'\ud83e\udd21',
      'clubs':'\u2663\ufe0f',
      'cocktail':'\ud83c\udf78',
      'coffee':'\u2615\ufe0f',
      'coffin':'\u26b0\ufe0f',
      'cold_sweat':'\ud83d\ude30',
      'comet':'\u2604\ufe0f',
      'computer':'\ud83d\udcbb',
      'computer_mouse':'\ud83d\uddb1',
      'confetti_ball':'\ud83c\udf8a',
      'confounded':'\ud83d\ude16',
      'confused':'\ud83d\ude15',
      'congratulations':'\u3297\ufe0f',
      'construction':'\ud83d\udea7',
      'construction_worker_man':'\ud83d\udc77',
      'construction_worker_woman':'\ud83d\udc77&zwj;\u2640\ufe0f',
      'control_knobs':'\ud83c\udf9b',
      'convenience_store':'\ud83c\udfea',
      'cookie':'\ud83c\udf6a',
      'cool':'\ud83c\udd92',
      'policeman':'\ud83d\udc6e',
      'copyright':'\u00a9\ufe0f',
      'corn':'\ud83c\udf3d',
      'couch_and_lamp':'\ud83d\udecb',
      'couple':'\ud83d\udc6b',
      'couple_with_heart_woman_man':'\ud83d\udc91',
      'couple_with_heart_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc68',
      'couple_with_heart_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc69',
      'couplekiss_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc68',
      'couplekiss_man_woman':'\ud83d\udc8f',
      'couplekiss_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc69',
      'cow':'\ud83d\udc2e',
      'cow2':'\ud83d\udc04',
      'cowboy_hat_face':'\ud83e\udd20',
      'crab':'\ud83e\udd80',
      'crayon':'\ud83d\udd8d',
      'credit_card':'\ud83d\udcb3',
      'crescent_moon':'\ud83c\udf19',
      'cricket':'\ud83c\udfcf',
      'crocodile':'\ud83d\udc0a',
      'croissant':'\ud83e\udd50',
      'crossed_fingers':'\ud83e\udd1e',
      'crossed_flags':'\ud83c\udf8c',
      'crossed_swords':'\u2694\ufe0f',
      'crown':'\ud83d\udc51',
      'cry':'\ud83d\ude22',
      'crying_cat_face':'\ud83d\ude3f',
      'crystal_ball':'\ud83d\udd2e',
      'cucumber':'\ud83e\udd52',
      'cupid':'\ud83d\udc98',
      'curly_loop':'\u27b0',
      'currency_exchange':'\ud83d\udcb1',
      'curry':'\ud83c\udf5b',
      'custard':'\ud83c\udf6e',
      'customs':'\ud83d\udec3',
      'cyclone':'\ud83c\udf00',
      'dagger':'\ud83d\udde1',
      'dancer':'\ud83d\udc83',
      'dancing_women':'\ud83d\udc6f',
      'dancing_men':'\ud83d\udc6f&zwj;\u2642\ufe0f',
      'dango':'\ud83c\udf61',
      'dark_sunglasses':'\ud83d\udd76',
      'dart':'\ud83c\udfaf',
      'dash':'\ud83d\udca8',
      'date':'\ud83d\udcc5',
      'deciduous_tree':'\ud83c\udf33',
      'deer':'\ud83e\udd8c',
      'department_store':'\ud83c\udfec',
      'derelict_house':'\ud83c\udfda',
      'desert':'\ud83c\udfdc',
      'desert_island':'\ud83c\udfdd',
      'desktop_computer':'\ud83d\udda5',
      'male_detective':'\ud83d\udd75\ufe0f',
      'diamond_shape_with_a_dot_inside':'\ud83d\udca0',
      'diamonds':'\u2666\ufe0f',
      'disappointed':'\ud83d\ude1e',
      'disappointed_relieved':'\ud83d\ude25',
      'dizzy':'\ud83d\udcab',
      'dizzy_face':'\ud83d\ude35',
      'do_not_litter':'\ud83d\udeaf',
      'dog':'\ud83d\udc36',
      'dog2':'\ud83d\udc15',
      'dollar':'\ud83d\udcb5',
      'dolls':'\ud83c\udf8e',
      'dolphin':'\ud83d\udc2c',
      'door':'\ud83d\udeaa',
      'doughnut':'\ud83c\udf69',
      'dove':'\ud83d\udd4a',
      'dragon':'\ud83d\udc09',
      'dragon_face':'\ud83d\udc32',
      'dress':'\ud83d\udc57',
      'dromedary_camel':'\ud83d\udc2a',
      'drooling_face':'\ud83e\udd24',
      'droplet':'\ud83d\udca7',
      'drum':'\ud83e\udd41',
      'duck':'\ud83e\udd86',
      'dvd':'\ud83d\udcc0',
      'e-mail':'\ud83d\udce7',
      'eagle':'\ud83e\udd85',
      'ear':'\ud83d\udc42',
      'ear_of_rice':'\ud83c\udf3e',
      'earth_africa':'\ud83c\udf0d',
      'earth_americas':'\ud83c\udf0e',
      'earth_asia':'\ud83c\udf0f',
      'egg':'\ud83e\udd5a',
      'eggplant':'\ud83c\udf46',
      'eight_pointed_black_star':'\u2734\ufe0f',
      'eight_spoked_asterisk':'\u2733\ufe0f',
      'electric_plug':'\ud83d\udd0c',
      'elephant':'\ud83d\udc18',
      'email':'\u2709\ufe0f',
      'end':'\ud83d\udd1a',
      'envelope_with_arrow':'\ud83d\udce9',
      'euro':'\ud83d\udcb6',
      'european_castle':'\ud83c\udff0',
      'european_post_office':'\ud83c\udfe4',
      'evergreen_tree':'\ud83c\udf32',
      'exclamation':'\u2757\ufe0f',
      'expressionless':'\ud83d\ude11',
      'eye':'\ud83d\udc41',
      'eye_speech_bubble':'\ud83d\udc41&zwj;\ud83d\udde8',
      'eyeglasses':'\ud83d\udc53',
      'eyes':'\ud83d\udc40',
      'face_with_head_bandage':'\ud83e\udd15',
      'face_with_thermometer':'\ud83e\udd12',
      'fist_oncoming':'\ud83d\udc4a',
      'factory':'\ud83c\udfed',
      'fallen_leaf':'\ud83c\udf42',
      'family_man_woman_boy':'\ud83d\udc6a',
      'family_man_boy':'\ud83d\udc68&zwj;\ud83d\udc66',
      'family_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_man_girl':'\ud83d\udc68&zwj;\ud83d\udc67',
      'family_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_man_man_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66',
      'family_man_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_man_man_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67',
      'family_man_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_man_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_man_woman_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_man_woman_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
      'family_man_woman_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_man_woman_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc66',
      'family_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc67',
      'family_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_woman_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66',
      'family_woman_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_woman_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
      'family_woman_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_woman_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'fast_forward':'\u23e9',
      'fax':'\ud83d\udce0',
      'fearful':'\ud83d\ude28',
      'feet':'\ud83d\udc3e',
      'female_detective':'\ud83d\udd75\ufe0f&zwj;\u2640\ufe0f',
      'ferris_wheel':'\ud83c\udfa1',
      'ferry':'\u26f4',
      'field_hockey':'\ud83c\udfd1',
      'file_cabinet':'\ud83d\uddc4',
      'file_folder':'\ud83d\udcc1',
      'film_projector':'\ud83d\udcfd',
      'film_strip':'\ud83c\udf9e',
      'fire':'\ud83d\udd25',
      'fire_engine':'\ud83d\ude92',
      'fireworks':'\ud83c\udf86',
      'first_quarter_moon':'\ud83c\udf13',
      'first_quarter_moon_with_face':'\ud83c\udf1b',
      'fish':'\ud83d\udc1f',
      'fish_cake':'\ud83c\udf65',
      'fishing_pole_and_fish':'\ud83c\udfa3',
      'fist_raised':'\u270a',
      'fist_left':'\ud83e\udd1b',
      'fist_right':'\ud83e\udd1c',
      'flags':'\ud83c\udf8f',
      'flashlight':'\ud83d\udd26',
      'fleur_de_lis':'\u269c\ufe0f',
      'flight_arrival':'\ud83d\udeec',
      'flight_departure':'\ud83d\udeeb',
      'floppy_disk':'\ud83d\udcbe',
      'flower_playing_cards':'\ud83c\udfb4',
      'flushed':'\ud83d\ude33',
      'fog':'\ud83c\udf2b',
      'foggy':'\ud83c\udf01',
      'football':'\ud83c\udfc8',
      'footprints':'\ud83d\udc63',
      'fork_and_knife':'\ud83c\udf74',
      'fountain':'\u26f2\ufe0f',
      'fountain_pen':'\ud83d\udd8b',
      'four_leaf_clover':'\ud83c\udf40',
      'fox_face':'\ud83e\udd8a',
      'framed_picture':'\ud83d\uddbc',
      'free':'\ud83c\udd93',
      'fried_egg':'\ud83c\udf73',
      'fried_shrimp':'\ud83c\udf64',
      'fries':'\ud83c\udf5f',
      'frog':'\ud83d\udc38',
      'frowning':'\ud83d\ude26',
      'frowning_face':'\u2639\ufe0f',
      'frowning_man':'\ud83d\ude4d&zwj;\u2642\ufe0f',
      'frowning_woman':'\ud83d\ude4d',
      'middle_finger':'\ud83d\udd95',
      'fuelpump':'\u26fd\ufe0f',
      'full_moon':'\ud83c\udf15',
      'full_moon_with_face':'\ud83c\udf1d',
      'funeral_urn':'\u26b1\ufe0f',
      'game_die':'\ud83c\udfb2',
      'gear':'\u2699\ufe0f',
      'gem':'\ud83d\udc8e',
      'gemini':'\u264a\ufe0f',
      'ghost':'\ud83d\udc7b',
      'gift':'\ud83c\udf81',
      'gift_heart':'\ud83d\udc9d',
      'girl':'\ud83d\udc67',
      'globe_with_meridians':'\ud83c\udf10',
      'goal_net':'\ud83e\udd45',
      'goat':'\ud83d\udc10',
      'golf':'\u26f3\ufe0f',
      'golfing_man':'\ud83c\udfcc\ufe0f',
      'golfing_woman':'\ud83c\udfcc\ufe0f&zwj;\u2640\ufe0f',
      'gorilla':'\ud83e\udd8d',
      'grapes':'\ud83c\udf47',
      'green_apple':'\ud83c\udf4f',
      'green_book':'\ud83d\udcd7',
      'green_heart':'\ud83d\udc9a',
      'green_salad':'\ud83e\udd57',
      'grey_exclamation':'\u2755',
      'grey_question':'\u2754',
      'grimacing':'\ud83d\ude2c',
      'grin':'\ud83d\ude01',
      'grinning':'\ud83d\ude00',
      'guardsman':'\ud83d\udc82',
      'guardswoman':'\ud83d\udc82&zwj;\u2640\ufe0f',
      'guitar':'\ud83c\udfb8',
      'gun':'\ud83d\udd2b',
      'haircut_woman':'\ud83d\udc87',
      'haircut_man':'\ud83d\udc87&zwj;\u2642\ufe0f',
      'hamburger':'\ud83c\udf54',
      'hammer':'\ud83d\udd28',
      'hammer_and_pick':'\u2692',
      'hammer_and_wrench':'\ud83d\udee0',
      'hamster':'\ud83d\udc39',
      'hand':'\u270b',
      'handbag':'\ud83d\udc5c',
      'handshake':'\ud83e\udd1d',
      'hankey':'\ud83d\udca9',
      'hatched_chick':'\ud83d\udc25',
      'hatching_chick':'\ud83d\udc23',
      'headphones':'\ud83c\udfa7',
      'hear_no_evil':'\ud83d\ude49',
      'heart':'\u2764\ufe0f',
      'heart_decoration':'\ud83d\udc9f',
      'heart_eyes':'\ud83d\ude0d',
      'heart_eyes_cat':'\ud83d\ude3b',
      'heartbeat':'\ud83d\udc93',
      'heartpulse':'\ud83d\udc97',
      'hearts':'\u2665\ufe0f',
      'heavy_check_mark':'\u2714\ufe0f',
      'heavy_division_sign':'\u2797',
      'heavy_dollar_sign':'\ud83d\udcb2',
      'heavy_heart_exclamation':'\u2763\ufe0f',
      'heavy_minus_sign':'\u2796',
      'heavy_multiplication_x':'\u2716\ufe0f',
      'heavy_plus_sign':'\u2795',
      'helicopter':'\ud83d\ude81',
      'herb':'\ud83c\udf3f',
      'hibiscus':'\ud83c\udf3a',
      'high_brightness':'\ud83d\udd06',
      'high_heel':'\ud83d\udc60',
      'hocho':'\ud83d\udd2a',
      'hole':'\ud83d\udd73',
      'honey_pot':'\ud83c\udf6f',
      'horse':'\ud83d\udc34',
      'horse_racing':'\ud83c\udfc7',
      'hospital':'\ud83c\udfe5',
      'hot_pepper':'\ud83c\udf36',
      'hotdog':'\ud83c\udf2d',
      'hotel':'\ud83c\udfe8',
      'hotsprings':'\u2668\ufe0f',
      'hourglass':'\u231b\ufe0f',
      'hourglass_flowing_sand':'\u23f3',
      'house':'\ud83c\udfe0',
      'house_with_garden':'\ud83c\udfe1',
      'houses':'\ud83c\udfd8',
      'hugs':'\ud83e\udd17',
      'hushed':'\ud83d\ude2f',
      'ice_cream':'\ud83c\udf68',
      'ice_hockey':'\ud83c\udfd2',
      'ice_skate':'\u26f8',
      'icecream':'\ud83c\udf66',
      'id':'\ud83c\udd94',
      'ideograph_advantage':'\ud83c\ude50',
      'imp':'\ud83d\udc7f',
      'inbox_tray':'\ud83d\udce5',
      'incoming_envelope':'\ud83d\udce8',
      'tipping_hand_woman':'\ud83d\udc81',
      'information_source':'\u2139\ufe0f',
      'innocent':'\ud83d\ude07',
      'interrobang':'\u2049\ufe0f',
      'iphone':'\ud83d\udcf1',
      'izakaya_lantern':'\ud83c\udfee',
      'jack_o_lantern':'\ud83c\udf83',
      'japan':'\ud83d\uddfe',
      'japanese_castle':'\ud83c\udfef',
      'japanese_goblin':'\ud83d\udc7a',
      'japanese_ogre':'\ud83d\udc79',
      'jeans':'\ud83d\udc56',
      'joy':'\ud83d\ude02',
      'joy_cat':'\ud83d\ude39',
      'joystick':'\ud83d\udd79',
      'kaaba':'\ud83d\udd4b',
      'key':'\ud83d\udd11',
      'keyboard':'\u2328\ufe0f',
      'keycap_ten':'\ud83d\udd1f',
      'kick_scooter':'\ud83d\udef4',
      'kimono':'\ud83d\udc58',
      'kiss':'\ud83d\udc8b',
      'kissing':'\ud83d\ude17',
      'kissing_cat':'\ud83d\ude3d',
      'kissing_closed_eyes':'\ud83d\ude1a',
      'kissing_heart':'\ud83d\ude18',
      'kissing_smiling_eyes':'\ud83d\ude19',
      'kiwi_fruit':'\ud83e\udd5d',
      'koala':'\ud83d\udc28',
      'koko':'\ud83c\ude01',
      'label':'\ud83c\udff7',
      'large_blue_circle':'\ud83d\udd35',
      'large_blue_diamond':'\ud83d\udd37',
      'large_orange_diamond':'\ud83d\udd36',
      'last_quarter_moon':'\ud83c\udf17',
      'last_quarter_moon_with_face':'\ud83c\udf1c',
      'latin_cross':'\u271d\ufe0f',
      'laughing':'\ud83d\ude06',
      'leaves':'\ud83c\udf43',
      'ledger':'\ud83d\udcd2',
      'left_luggage':'\ud83d\udec5',
      'left_right_arrow':'\u2194\ufe0f',
      'leftwards_arrow_with_hook':'\u21a9\ufe0f',
      'lemon':'\ud83c\udf4b',
      'leo':'\u264c\ufe0f',
      'leopard':'\ud83d\udc06',
      'level_slider':'\ud83c\udf9a',
      'libra':'\u264e\ufe0f',
      'light_rail':'\ud83d\ude88',
      'link':'\ud83d\udd17',
      'lion':'\ud83e\udd81',
      'lips':'\ud83d\udc44',
      'lipstick':'\ud83d\udc84',
      'lizard':'\ud83e\udd8e',
      'lock':'\ud83d\udd12',
      'lock_with_ink_pen':'\ud83d\udd0f',
      'lollipop':'\ud83c\udf6d',
      'loop':'\u27bf',
      'loud_sound':'\ud83d\udd0a',
      'loudspeaker':'\ud83d\udce2',
      'love_hotel':'\ud83c\udfe9',
      'love_letter':'\ud83d\udc8c',
      'low_brightness':'\ud83d\udd05',
      'lying_face':'\ud83e\udd25',
      'm':'\u24c2\ufe0f',
      'mag':'\ud83d\udd0d',
      'mag_right':'\ud83d\udd0e',
      'mahjong':'\ud83c\udc04\ufe0f',
      'mailbox':'\ud83d\udceb',
      'mailbox_closed':'\ud83d\udcea',
      'mailbox_with_mail':'\ud83d\udcec',
      'mailbox_with_no_mail':'\ud83d\udced',
      'man':'\ud83d\udc68',
      'man_artist':'\ud83d\udc68&zwj;\ud83c\udfa8',
      'man_astronaut':'\ud83d\udc68&zwj;\ud83d\ude80',
      'man_cartwheeling':'\ud83e\udd38&zwj;\u2642\ufe0f',
      'man_cook':'\ud83d\udc68&zwj;\ud83c\udf73',
      'man_dancing':'\ud83d\udd7a',
      'man_facepalming':'\ud83e\udd26&zwj;\u2642\ufe0f',
      'man_factory_worker':'\ud83d\udc68&zwj;\ud83c\udfed',
      'man_farmer':'\ud83d\udc68&zwj;\ud83c\udf3e',
      'man_firefighter':'\ud83d\udc68&zwj;\ud83d\ude92',
      'man_health_worker':'\ud83d\udc68&zwj;\u2695\ufe0f',
      'man_in_tuxedo':'\ud83e\udd35',
      'man_judge':'\ud83d\udc68&zwj;\u2696\ufe0f',
      'man_juggling':'\ud83e\udd39&zwj;\u2642\ufe0f',
      'man_mechanic':'\ud83d\udc68&zwj;\ud83d\udd27',
      'man_office_worker':'\ud83d\udc68&zwj;\ud83d\udcbc',
      'man_pilot':'\ud83d\udc68&zwj;\u2708\ufe0f',
      'man_playing_handball':'\ud83e\udd3e&zwj;\u2642\ufe0f',
      'man_playing_water_polo':'\ud83e\udd3d&zwj;\u2642\ufe0f',
      'man_scientist':'\ud83d\udc68&zwj;\ud83d\udd2c',
      'man_shrugging':'\ud83e\udd37&zwj;\u2642\ufe0f',
      'man_singer':'\ud83d\udc68&zwj;\ud83c\udfa4',
      'man_student':'\ud83d\udc68&zwj;\ud83c\udf93',
      'man_teacher':'\ud83d\udc68&zwj;\ud83c\udfeb',
      'man_technologist':'\ud83d\udc68&zwj;\ud83d\udcbb',
      'man_with_gua_pi_mao':'\ud83d\udc72',
      'man_with_turban':'\ud83d\udc73',
      'tangerine':'\ud83c\udf4a',
      'mans_shoe':'\ud83d\udc5e',
      'mantelpiece_clock':'\ud83d\udd70',
      'maple_leaf':'\ud83c\udf41',
      'martial_arts_uniform':'\ud83e\udd4b',
      'mask':'\ud83d\ude37',
      'massage_woman':'\ud83d\udc86',
      'massage_man':'\ud83d\udc86&zwj;\u2642\ufe0f',
      'meat_on_bone':'\ud83c\udf56',
      'medal_military':'\ud83c\udf96',
      'medal_sports':'\ud83c\udfc5',
      'mega':'\ud83d\udce3',
      'melon':'\ud83c\udf48',
      'memo':'\ud83d\udcdd',
      'men_wrestling':'\ud83e\udd3c&zwj;\u2642\ufe0f',
      'menorah':'\ud83d\udd4e',
      'mens':'\ud83d\udeb9',
      'metal':'\ud83e\udd18',
      'metro':'\ud83d\ude87',
      'microphone':'\ud83c\udfa4',
      'microscope':'\ud83d\udd2c',
      'milk_glass':'\ud83e\udd5b',
      'milky_way':'\ud83c\udf0c',
      'minibus':'\ud83d\ude90',
      'minidisc':'\ud83d\udcbd',
      'mobile_phone_off':'\ud83d\udcf4',
      'money_mouth_face':'\ud83e\udd11',
      'money_with_wings':'\ud83d\udcb8',
      'moneybag':'\ud83d\udcb0',
      'monkey':'\ud83d\udc12',
      'monkey_face':'\ud83d\udc35',
      'monorail':'\ud83d\ude9d',
      'moon':'\ud83c\udf14',
      'mortar_board':'\ud83c\udf93',
      'mosque':'\ud83d\udd4c',
      'motor_boat':'\ud83d\udee5',
      'motor_scooter':'\ud83d\udef5',
      'motorcycle':'\ud83c\udfcd',
      'motorway':'\ud83d\udee3',
      'mount_fuji':'\ud83d\uddfb',
      'mountain':'\u26f0',
      'mountain_biking_man':'\ud83d\udeb5',
      'mountain_biking_woman':'\ud83d\udeb5&zwj;\u2640\ufe0f',
      'mountain_cableway':'\ud83d\udea0',
      'mountain_railway':'\ud83d\ude9e',
      'mountain_snow':'\ud83c\udfd4',
      'mouse':'\ud83d\udc2d',
      'mouse2':'\ud83d\udc01',
      'movie_camera':'\ud83c\udfa5',
      'moyai':'\ud83d\uddff',
      'mrs_claus':'\ud83e\udd36',
      'muscle':'\ud83d\udcaa',
      'mushroom':'\ud83c\udf44',
      'musical_keyboard':'\ud83c\udfb9',
      'musical_note':'\ud83c\udfb5',
      'musical_score':'\ud83c\udfbc',
      'mute':'\ud83d\udd07',
      'nail_care':'\ud83d\udc85',
      'name_badge':'\ud83d\udcdb',
      'national_park':'\ud83c\udfde',
      'nauseated_face':'\ud83e\udd22',
      'necktie':'\ud83d\udc54',
      'negative_squared_cross_mark':'\u274e',
      'nerd_face':'\ud83e\udd13',
      'neutral_face':'\ud83d\ude10',
      'new':'\ud83c\udd95',
      'new_moon':'\ud83c\udf11',
      'new_moon_with_face':'\ud83c\udf1a',
      'newspaper':'\ud83d\udcf0',
      'newspaper_roll':'\ud83d\uddde',
      'next_track_button':'\u23ed',
      'ng':'\ud83c\udd96',
      'no_good_man':'\ud83d\ude45&zwj;\u2642\ufe0f',
      'no_good_woman':'\ud83d\ude45',
      'night_with_stars':'\ud83c\udf03',
      'no_bell':'\ud83d\udd15',
      'no_bicycles':'\ud83d\udeb3',
      'no_entry':'\u26d4\ufe0f',
      'no_entry_sign':'\ud83d\udeab',
      'no_mobile_phones':'\ud83d\udcf5',
      'no_mouth':'\ud83d\ude36',
      'no_pedestrians':'\ud83d\udeb7',
      'no_smoking':'\ud83d\udead',
      'non-potable_water':'\ud83d\udeb1',
      'nose':'\ud83d\udc43',
      'notebook':'\ud83d\udcd3',
      'notebook_with_decorative_cover':'\ud83d\udcd4',
      'notes':'\ud83c\udfb6',
      'nut_and_bolt':'\ud83d\udd29',
      'o':'\u2b55\ufe0f',
      'o2':'\ud83c\udd7e\ufe0f',
      'ocean':'\ud83c\udf0a',
      'octopus':'\ud83d\udc19',
      'oden':'\ud83c\udf62',
      'office':'\ud83c\udfe2',
      'oil_drum':'\ud83d\udee2',
      'ok':'\ud83c\udd97',
      'ok_hand':'\ud83d\udc4c',
      'ok_man':'\ud83d\ude46&zwj;\u2642\ufe0f',
      'ok_woman':'\ud83d\ude46',
      'old_key':'\ud83d\udddd',
      'older_man':'\ud83d\udc74',
      'older_woman':'\ud83d\udc75',
      'om':'\ud83d\udd49',
      'on':'\ud83d\udd1b',
      'oncoming_automobile':'\ud83d\ude98',
      'oncoming_bus':'\ud83d\ude8d',
      'oncoming_police_car':'\ud83d\ude94',
      'oncoming_taxi':'\ud83d\ude96',
      'open_file_folder':'\ud83d\udcc2',
      'open_hands':'\ud83d\udc50',
      'open_mouth':'\ud83d\ude2e',
      'open_umbrella':'\u2602\ufe0f',
      'ophiuchus':'\u26ce',
      'orange_book':'\ud83d\udcd9',
      'orthodox_cross':'\u2626\ufe0f',
      'outbox_tray':'\ud83d\udce4',
      'owl':'\ud83e\udd89',
      'ox':'\ud83d\udc02',
      'package':'\ud83d\udce6',
      'page_facing_up':'\ud83d\udcc4',
      'page_with_curl':'\ud83d\udcc3',
      'pager':'\ud83d\udcdf',
      'paintbrush':'\ud83d\udd8c',
      'palm_tree':'\ud83c\udf34',
      'pancakes':'\ud83e\udd5e',
      'panda_face':'\ud83d\udc3c',
      'paperclip':'\ud83d\udcce',
      'paperclips':'\ud83d\udd87',
      'parasol_on_ground':'\u26f1',
      'parking':'\ud83c\udd7f\ufe0f',
      'part_alternation_mark':'\u303d\ufe0f',
      'partly_sunny':'\u26c5\ufe0f',
      'passenger_ship':'\ud83d\udef3',
      'passport_control':'\ud83d\udec2',
      'pause_button':'\u23f8',
      'peace_symbol':'\u262e\ufe0f',
      'peach':'\ud83c\udf51',
      'peanuts':'\ud83e\udd5c',
      'pear':'\ud83c\udf50',
      'pen':'\ud83d\udd8a',
      'pencil2':'\u270f\ufe0f',
      'penguin':'\ud83d\udc27',
      'pensive':'\ud83d\ude14',
      'performing_arts':'\ud83c\udfad',
      'persevere':'\ud83d\ude23',
      'person_fencing':'\ud83e\udd3a',
      'pouting_woman':'\ud83d\ude4e',
      'phone':'\u260e\ufe0f',
      'pick':'\u26cf',
      'pig':'\ud83d\udc37',
      'pig2':'\ud83d\udc16',
      'pig_nose':'\ud83d\udc3d',
      'pill':'\ud83d\udc8a',
      'pineapple':'\ud83c\udf4d',
      'ping_pong':'\ud83c\udfd3',
      'pisces':'\u2653\ufe0f',
      'pizza':'\ud83c\udf55',
      'place_of_worship':'\ud83d\uded0',
      'plate_with_cutlery':'\ud83c\udf7d',
      'play_or_pause_button':'\u23ef',
      'point_down':'\ud83d\udc47',
      'point_left':'\ud83d\udc48',
      'point_right':'\ud83d\udc49',
      'point_up':'\u261d\ufe0f',
      'point_up_2':'\ud83d\udc46',
      'police_car':'\ud83d\ude93',
      'policewoman':'\ud83d\udc6e&zwj;\u2640\ufe0f',
      'poodle':'\ud83d\udc29',
      'popcorn':'\ud83c\udf7f',
      'post_office':'\ud83c\udfe3',
      'postal_horn':'\ud83d\udcef',
      'postbox':'\ud83d\udcee',
      'potable_water':'\ud83d\udeb0',
      'potato':'\ud83e\udd54',
      'pouch':'\ud83d\udc5d',
      'poultry_leg':'\ud83c\udf57',
      'pound':'\ud83d\udcb7',
      'rage':'\ud83d\ude21',
      'pouting_cat':'\ud83d\ude3e',
      'pouting_man':'\ud83d\ude4e&zwj;\u2642\ufe0f',
      'pray':'\ud83d\ude4f',
      'prayer_beads':'\ud83d\udcff',
      'pregnant_woman':'\ud83e\udd30',
      'previous_track_button':'\u23ee',
      'prince':'\ud83e\udd34',
      'princess':'\ud83d\udc78',
      'printer':'\ud83d\udda8',
      'purple_heart':'\ud83d\udc9c',
      'purse':'\ud83d\udc5b',
      'pushpin':'\ud83d\udccc',
      'put_litter_in_its_place':'\ud83d\udeae',
      'question':'\u2753',
      'rabbit':'\ud83d\udc30',
      'rabbit2':'\ud83d\udc07',
      'racehorse':'\ud83d\udc0e',
      'racing_car':'\ud83c\udfce',
      'radio':'\ud83d\udcfb',
      'radio_button':'\ud83d\udd18',
      'radioactive':'\u2622\ufe0f',
      'railway_car':'\ud83d\ude83',
      'railway_track':'\ud83d\udee4',
      'rainbow':'\ud83c\udf08',
      'rainbow_flag':'\ud83c\udff3\ufe0f&zwj;\ud83c\udf08',
      'raised_back_of_hand':'\ud83e\udd1a',
      'raised_hand_with_fingers_splayed':'\ud83d\udd90',
      'raised_hands':'\ud83d\ude4c',
      'raising_hand_woman':'\ud83d\ude4b',
      'raising_hand_man':'\ud83d\ude4b&zwj;\u2642\ufe0f',
      'ram':'\ud83d\udc0f',
      'ramen':'\ud83c\udf5c',
      'rat':'\ud83d\udc00',
      'record_button':'\u23fa',
      'recycle':'\u267b\ufe0f',
      'red_circle':'\ud83d\udd34',
      'registered':'\u00ae\ufe0f',
      'relaxed':'\u263a\ufe0f',
      'relieved':'\ud83d\ude0c',
      'reminder_ribbon':'\ud83c\udf97',
      'repeat':'\ud83d\udd01',
      'repeat_one':'\ud83d\udd02',
      'rescue_worker_helmet':'\u26d1',
      'restroom':'\ud83d\udebb',
      'revolving_hearts':'\ud83d\udc9e',
      'rewind':'\u23ea',
      'rhinoceros':'\ud83e\udd8f',
      'ribbon':'\ud83c\udf80',
      'rice':'\ud83c\udf5a',
      'rice_ball':'\ud83c\udf59',
      'rice_cracker':'\ud83c\udf58',
      'rice_scene':'\ud83c\udf91',
      'right_anger_bubble':'\ud83d\uddef',
      'ring':'\ud83d\udc8d',
      'robot':'\ud83e\udd16',
      'rocket':'\ud83d\ude80',
      'rofl':'\ud83e\udd23',
      'roll_eyes':'\ud83d\ude44',
      'roller_coaster':'\ud83c\udfa2',
      'rooster':'\ud83d\udc13',
      'rose':'\ud83c\udf39',
      'rosette':'\ud83c\udff5',
      'rotating_light':'\ud83d\udea8',
      'round_pushpin':'\ud83d\udccd',
      'rowing_man':'\ud83d\udea3',
      'rowing_woman':'\ud83d\udea3&zwj;\u2640\ufe0f',
      'rugby_football':'\ud83c\udfc9',
      'running_man':'\ud83c\udfc3',
      'running_shirt_with_sash':'\ud83c\udfbd',
      'running_woman':'\ud83c\udfc3&zwj;\u2640\ufe0f',
      'sa':'\ud83c\ude02\ufe0f',
      'sagittarius':'\u2650\ufe0f',
      'sake':'\ud83c\udf76',
      'sandal':'\ud83d\udc61',
      'santa':'\ud83c\udf85',
      'satellite':'\ud83d\udce1',
      'saxophone':'\ud83c\udfb7',
      'school':'\ud83c\udfeb',
      'school_satchel':'\ud83c\udf92',
      'scissors':'\u2702\ufe0f',
      'scorpion':'\ud83e\udd82',
      'scorpius':'\u264f\ufe0f',
      'scream':'\ud83d\ude31',
      'scream_cat':'\ud83d\ude40',
      'scroll':'\ud83d\udcdc',
      'seat':'\ud83d\udcba',
      'secret':'\u3299\ufe0f',
      'see_no_evil':'\ud83d\ude48',
      'seedling':'\ud83c\udf31',
      'selfie':'\ud83e\udd33',
      'shallow_pan_of_food':'\ud83e\udd58',
      'shamrock':'\u2618\ufe0f',
      'shark':'\ud83e\udd88',
      'shaved_ice':'\ud83c\udf67',
      'sheep':'\ud83d\udc11',
      'shell':'\ud83d\udc1a',
      'shield':'\ud83d\udee1',
      'shinto_shrine':'\u26e9',
      'ship':'\ud83d\udea2',
      'shirt':'\ud83d\udc55',
      'shopping':'\ud83d\udecd',
      'shopping_cart':'\ud83d\uded2',
      'shower':'\ud83d\udebf',
      'shrimp':'\ud83e\udd90',
      'signal_strength':'\ud83d\udcf6',
      'six_pointed_star':'\ud83d\udd2f',
      'ski':'\ud83c\udfbf',
      'skier':'\u26f7',
      'skull':'\ud83d\udc80',
      'skull_and_crossbones':'\u2620\ufe0f',
      'sleeping':'\ud83d\ude34',
      'sleeping_bed':'\ud83d\udecc',
      'sleepy':'\ud83d\ude2a',
      'slightly_frowning_face':'\ud83d\ude41',
      'slightly_smiling_face':'\ud83d\ude42',
      'slot_machine':'\ud83c\udfb0',
      'small_airplane':'\ud83d\udee9',
      'small_blue_diamond':'\ud83d\udd39',
      'small_orange_diamond':'\ud83d\udd38',
      'small_red_triangle':'\ud83d\udd3a',
      'small_red_triangle_down':'\ud83d\udd3b',
      'smile':'\ud83d\ude04',
      'smile_cat':'\ud83d\ude38',
      'smiley':'\ud83d\ude03',
      'smiley_cat':'\ud83d\ude3a',
      'smiling_imp':'\ud83d\ude08',
      'smirk':'\ud83d\ude0f',
      'smirk_cat':'\ud83d\ude3c',
      'smoking':'\ud83d\udeac',
      'snail':'\ud83d\udc0c',
      'snake':'\ud83d\udc0d',
      'sneezing_face':'\ud83e\udd27',
      'snowboarder':'\ud83c\udfc2',
      'snowflake':'\u2744\ufe0f',
      'snowman':'\u26c4\ufe0f',
      'snowman_with_snow':'\u2603\ufe0f',
      'sob':'\ud83d\ude2d',
      'soccer':'\u26bd\ufe0f',
      'soon':'\ud83d\udd1c',
      'sos':'\ud83c\udd98',
      'sound':'\ud83d\udd09',
      'space_invader':'\ud83d\udc7e',
      'spades':'\u2660\ufe0f',
      'spaghetti':'\ud83c\udf5d',
      'sparkle':'\u2747\ufe0f',
      'sparkler':'\ud83c\udf87',
      'sparkles':'\u2728',
      'sparkling_heart':'\ud83d\udc96',
      'speak_no_evil':'\ud83d\ude4a',
      'speaker':'\ud83d\udd08',
      'speaking_head':'\ud83d\udde3',
      'speech_balloon':'\ud83d\udcac',
      'speedboat':'\ud83d\udea4',
      'spider':'\ud83d\udd77',
      'spider_web':'\ud83d\udd78',
      'spiral_calendar':'\ud83d\uddd3',
      'spiral_notepad':'\ud83d\uddd2',
      'spoon':'\ud83e\udd44',
      'squid':'\ud83e\udd91',
      'stadium':'\ud83c\udfdf',
      'star':'\u2b50\ufe0f',
      'star2':'\ud83c\udf1f',
      'star_and_crescent':'\u262a\ufe0f',
      'star_of_david':'\u2721\ufe0f',
      'stars':'\ud83c\udf20',
      'station':'\ud83d\ude89',
      'statue_of_liberty':'\ud83d\uddfd',
      'steam_locomotive':'\ud83d\ude82',
      'stew':'\ud83c\udf72',
      'stop_button':'\u23f9',
      'stop_sign':'\ud83d\uded1',
      'stopwatch':'\u23f1',
      'straight_ruler':'\ud83d\udccf',
      'strawberry':'\ud83c\udf53',
      'stuck_out_tongue':'\ud83d\ude1b',
      'stuck_out_tongue_closed_eyes':'\ud83d\ude1d',
      'stuck_out_tongue_winking_eye':'\ud83d\ude1c',
      'studio_microphone':'\ud83c\udf99',
      'stuffed_flatbread':'\ud83e\udd59',
      'sun_behind_large_cloud':'\ud83c\udf25',
      'sun_behind_rain_cloud':'\ud83c\udf26',
      'sun_behind_small_cloud':'\ud83c\udf24',
      'sun_with_face':'\ud83c\udf1e',
      'sunflower':'\ud83c\udf3b',
      'sunglasses':'\ud83d\ude0e',
      'sunny':'\u2600\ufe0f',
      'sunrise':'\ud83c\udf05',
      'sunrise_over_mountains':'\ud83c\udf04',
      'surfing_man':'\ud83c\udfc4',
      'surfing_woman':'\ud83c\udfc4&zwj;\u2640\ufe0f',
      'sushi':'\ud83c\udf63',
      'suspension_railway':'\ud83d\ude9f',
      'sweat':'\ud83d\ude13',
      'sweat_drops':'\ud83d\udca6',
      'sweat_smile':'\ud83d\ude05',
      'sweet_potato':'\ud83c\udf60',
      'swimming_man':'\ud83c\udfca',
      'swimming_woman':'\ud83c\udfca&zwj;\u2640\ufe0f',
      'symbols':'\ud83d\udd23',
      'synagogue':'\ud83d\udd4d',
      'syringe':'\ud83d\udc89',
      'taco':'\ud83c\udf2e',
      'tada':'\ud83c\udf89',
      'tanabata_tree':'\ud83c\udf8b',
      'taurus':'\u2649\ufe0f',
      'taxi':'\ud83d\ude95',
      'tea':'\ud83c\udf75',
      'telephone_receiver':'\ud83d\udcde',
      'telescope':'\ud83d\udd2d',
      'tennis':'\ud83c\udfbe',
      'tent':'\u26fa\ufe0f',
      'thermometer':'\ud83c\udf21',
      'thinking':'\ud83e\udd14',
      'thought_balloon':'\ud83d\udcad',
      'ticket':'\ud83c\udfab',
      'tickets':'\ud83c\udf9f',
      'tiger':'\ud83d\udc2f',
      'tiger2':'\ud83d\udc05',
      'timer_clock':'\u23f2',
      'tipping_hand_man':'\ud83d\udc81&zwj;\u2642\ufe0f',
      'tired_face':'\ud83d\ude2b',
      'tm':'\u2122\ufe0f',
      'toilet':'\ud83d\udebd',
      'tokyo_tower':'\ud83d\uddfc',
      'tomato':'\ud83c\udf45',
      'tongue':'\ud83d\udc45',
      'top':'\ud83d\udd1d',
      'tophat':'\ud83c\udfa9',
      'tornado':'\ud83c\udf2a',
      'trackball':'\ud83d\uddb2',
      'tractor':'\ud83d\ude9c',
      'traffic_light':'\ud83d\udea5',
      'train':'\ud83d\ude8b',
      'train2':'\ud83d\ude86',
      'tram':'\ud83d\ude8a',
      'triangular_flag_on_post':'\ud83d\udea9',
      'triangular_ruler':'\ud83d\udcd0',
      'trident':'\ud83d\udd31',
      'triumph':'\ud83d\ude24',
      'trolleybus':'\ud83d\ude8e',
      'trophy':'\ud83c\udfc6',
      'tropical_drink':'\ud83c\udf79',
      'tropical_fish':'\ud83d\udc20',
      'truck':'\ud83d\ude9a',
      'trumpet':'\ud83c\udfba',
      'tulip':'\ud83c\udf37',
      'tumbler_glass':'\ud83e\udd43',
      'turkey':'\ud83e\udd83',
      'turtle':'\ud83d\udc22',
      'tv':'\ud83d\udcfa',
      'twisted_rightwards_arrows':'\ud83d\udd00',
      'two_hearts':'\ud83d\udc95',
      'two_men_holding_hands':'\ud83d\udc6c',
      'two_women_holding_hands':'\ud83d\udc6d',
      'u5272':'\ud83c\ude39',
      'u5408':'\ud83c\ude34',
      'u55b6':'\ud83c\ude3a',
      'u6307':'\ud83c\ude2f\ufe0f',
      'u6708':'\ud83c\ude37\ufe0f',
      'u6709':'\ud83c\ude36',
      'u6e80':'\ud83c\ude35',
      'u7121':'\ud83c\ude1a\ufe0f',
      'u7533':'\ud83c\ude38',
      'u7981':'\ud83c\ude32',
      'u7a7a':'\ud83c\ude33',
      'umbrella':'\u2614\ufe0f',
      'unamused':'\ud83d\ude12',
      'underage':'\ud83d\udd1e',
      'unicorn':'\ud83e\udd84',
      'unlock':'\ud83d\udd13',
      'up':'\ud83c\udd99',
      'upside_down_face':'\ud83d\ude43',
      'v':'\u270c\ufe0f',
      'vertical_traffic_light':'\ud83d\udea6',
      'vhs':'\ud83d\udcfc',
      'vibration_mode':'\ud83d\udcf3',
      'video_camera':'\ud83d\udcf9',
      'video_game':'\ud83c\udfae',
      'violin':'\ud83c\udfbb',
      'virgo':'\u264d\ufe0f',
      'volcano':'\ud83c\udf0b',
      'volleyball':'\ud83c\udfd0',
      'vs':'\ud83c\udd9a',
      'vulcan_salute':'\ud83d\udd96',
      'walking_man':'\ud83d\udeb6',
      'walking_woman':'\ud83d\udeb6&zwj;\u2640\ufe0f',
      'waning_crescent_moon':'\ud83c\udf18',
      'waning_gibbous_moon':'\ud83c\udf16',
      'warning':'\u26a0\ufe0f',
      'wastebasket':'\ud83d\uddd1',
      'watch':'\u231a\ufe0f',
      'water_buffalo':'\ud83d\udc03',
      'watermelon':'\ud83c\udf49',
      'wave':'\ud83d\udc4b',
      'wavy_dash':'\u3030\ufe0f',
      'waxing_crescent_moon':'\ud83c\udf12',
      'wc':'\ud83d\udebe',
      'weary':'\ud83d\ude29',
      'wedding':'\ud83d\udc92',
      'weight_lifting_man':'\ud83c\udfcb\ufe0f',
      'weight_lifting_woman':'\ud83c\udfcb\ufe0f&zwj;\u2640\ufe0f',
      'whale':'\ud83d\udc33',
      'whale2':'\ud83d\udc0b',
      'wheel_of_dharma':'\u2638\ufe0f',
      'wheelchair':'\u267f\ufe0f',
      'white_check_mark':'\u2705',
      'white_circle':'\u26aa\ufe0f',
      'white_flag':'\ud83c\udff3\ufe0f',
      'white_flower':'\ud83d\udcae',
      'white_large_square':'\u2b1c\ufe0f',
      'white_medium_small_square':'\u25fd\ufe0f',
      'white_medium_square':'\u25fb\ufe0f',
      'white_small_square':'\u25ab\ufe0f',
      'white_square_button':'\ud83d\udd33',
      'wilted_flower':'\ud83e\udd40',
      'wind_chime':'\ud83c\udf90',
      'wind_face':'\ud83c\udf2c',
      'wine_glass':'\ud83c\udf77',
      'wink':'\ud83d\ude09',
      'wolf':'\ud83d\udc3a',
      'woman':'\ud83d\udc69',
      'woman_artist':'\ud83d\udc69&zwj;\ud83c\udfa8',
      'woman_astronaut':'\ud83d\udc69&zwj;\ud83d\ude80',
      'woman_cartwheeling':'\ud83e\udd38&zwj;\u2640\ufe0f',
      'woman_cook':'\ud83d\udc69&zwj;\ud83c\udf73',
      'woman_facepalming':'\ud83e\udd26&zwj;\u2640\ufe0f',
      'woman_factory_worker':'\ud83d\udc69&zwj;\ud83c\udfed',
      'woman_farmer':'\ud83d\udc69&zwj;\ud83c\udf3e',
      'woman_firefighter':'\ud83d\udc69&zwj;\ud83d\ude92',
      'woman_health_worker':'\ud83d\udc69&zwj;\u2695\ufe0f',
      'woman_judge':'\ud83d\udc69&zwj;\u2696\ufe0f',
      'woman_juggling':'\ud83e\udd39&zwj;\u2640\ufe0f',
      'woman_mechanic':'\ud83d\udc69&zwj;\ud83d\udd27',
      'woman_office_worker':'\ud83d\udc69&zwj;\ud83d\udcbc',
      'woman_pilot':'\ud83d\udc69&zwj;\u2708\ufe0f',
      'woman_playing_handball':'\ud83e\udd3e&zwj;\u2640\ufe0f',
      'woman_playing_water_polo':'\ud83e\udd3d&zwj;\u2640\ufe0f',
      'woman_scientist':'\ud83d\udc69&zwj;\ud83d\udd2c',
      'woman_shrugging':'\ud83e\udd37&zwj;\u2640\ufe0f',
      'woman_singer':'\ud83d\udc69&zwj;\ud83c\udfa4',
      'woman_student':'\ud83d\udc69&zwj;\ud83c\udf93',
      'woman_teacher':'\ud83d\udc69&zwj;\ud83c\udfeb',
      'woman_technologist':'\ud83d\udc69&zwj;\ud83d\udcbb',
      'woman_with_turban':'\ud83d\udc73&zwj;\u2640\ufe0f',
      'womans_clothes':'\ud83d\udc5a',
      'womans_hat':'\ud83d\udc52',
      'women_wrestling':'\ud83e\udd3c&zwj;\u2640\ufe0f',
      'womens':'\ud83d\udeba',
      'world_map':'\ud83d\uddfa',
      'worried':'\ud83d\ude1f',
      'wrench':'\ud83d\udd27',
      'writing_hand':'\u270d\ufe0f',
      'x':'\u274c',
      'yellow_heart':'\ud83d\udc9b',
      'yen':'\ud83d\udcb4',
      'yin_yang':'\u262f\ufe0f',
      'yum':'\ud83d\ude0b',
      'zap':'\u26a1\ufe0f',
      'zipper_mouth_face':'\ud83e\udd10',
      'zzz':'\ud83d\udca4',

      /* special emojis :P */
      'octocat':  '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
      'showdown': '<span style="font-family: \'Anonymous Pro\', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>'
    };

    /**
     * Created by Estevao on 31-05-2015.
     */

    /**
     * Showdown Converter class
     * @class
     * @param {object} [converterOptions]
     * @returns {Converter}
     */
    showdown.Converter = function (converterOptions) {

      var
          /**
           * Options used by this converter
           * @private
           * @type {{}}
           */
          options = {},

          /**
           * Language extensions used by this converter
           * @private
           * @type {Array}
           */
          langExtensions = [],

          /**
           * Output modifiers extensions used by this converter
           * @private
           * @type {Array}
           */
          outputModifiers = [],

          /**
           * Event listeners
           * @private
           * @type {{}}
           */
          listeners = {},

          /**
           * The flavor set in this converter
           */
          setConvFlavor = setFlavor,

          /**
           * Metadata of the document
           * @type {{parsed: {}, raw: string, format: string}}
           */
          metadata = {
            parsed: {},
            raw: '',
            format: ''
          };

      _constructor();

      /**
       * Converter constructor
       * @private
       */
      function _constructor () {
        converterOptions = converterOptions || {};

        for (var gOpt in globalOptions) {
          if (globalOptions.hasOwnProperty(gOpt)) {
            options[gOpt] = globalOptions[gOpt];
          }
        }

        // Merge options
        if (typeof converterOptions === 'object') {
          for (var opt in converterOptions) {
            if (converterOptions.hasOwnProperty(opt)) {
              options[opt] = converterOptions[opt];
            }
          }
        } else {
          throw Error('Converter expects the passed parameter to be an object, but ' + typeof converterOptions +
          ' was passed instead.');
        }

        if (options.extensions) {
          showdown.helper.forEach(options.extensions, _parseExtension);
        }
      }

      /**
       * Parse extension
       * @param {*} ext
       * @param {string} [name='']
       * @private
       */
      function _parseExtension (ext, name) {

        name = name || null;
        // If it's a string, the extension was previously loaded
        if (showdown.helper.isString(ext)) {
          ext = showdown.helper.stdExtName(ext);
          name = ext;

          // LEGACY_SUPPORT CODE
          if (showdown.extensions[ext]) {
            console.warn('DEPRECATION WARNING: ' + ext + ' is an old extension that uses a deprecated loading method.' +
              'Please inform the developer that the extension should be updated!');
            legacyExtensionLoading(showdown.extensions[ext], ext);
            return;
            // END LEGACY SUPPORT CODE

          } else if (!showdown.helper.isUndefined(extensions[ext])) {
            ext = extensions[ext];

          } else {
            throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
          }
        }

        if (typeof ext === 'function') {
          ext = ext();
        }

        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }

        var validExt = validate(ext, name);
        if (!validExt.valid) {
          throw Error(validExt.error);
        }

        for (var i = 0; i < ext.length; ++i) {
          switch (ext[i].type) {

            case 'lang':
              langExtensions.push(ext[i]);
              break;

            case 'output':
              outputModifiers.push(ext[i]);
              break;
          }
          if (ext[i].hasOwnProperty('listeners')) {
            for (var ln in ext[i].listeners) {
              if (ext[i].listeners.hasOwnProperty(ln)) {
                listen(ln, ext[i].listeners[ln]);
              }
            }
          }
        }

      }

      /**
       * LEGACY_SUPPORT
       * @param {*} ext
       * @param {string} name
       */
      function legacyExtensionLoading (ext, name) {
        if (typeof ext === 'function') {
          ext = ext(new showdown.Converter());
        }
        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }
        var valid = validate(ext, name);

        if (!valid.valid) {
          throw Error(valid.error);
        }

        for (var i = 0; i < ext.length; ++i) {
          switch (ext[i].type) {
            case 'lang':
              langExtensions.push(ext[i]);
              break;
            case 'output':
              outputModifiers.push(ext[i]);
              break;
            default:// should never reach here
              throw Error('Extension loader error: Type unrecognized!!!');
          }
        }
      }

      /**
       * Listen to an event
       * @param {string} name
       * @param {function} callback
       */
      function listen (name, callback) {
        if (!showdown.helper.isString(name)) {
          throw Error('Invalid argument in converter.listen() method: name must be a string, but ' + typeof name + ' given');
        }

        if (typeof callback !== 'function') {
          throw Error('Invalid argument in converter.listen() method: callback must be a function, but ' + typeof callback + ' given');
        }

        if (!listeners.hasOwnProperty(name)) {
          listeners[name] = [];
        }
        listeners[name].push(callback);
      }

      function rTrimInputText (text) {
        var rsp = text.match(/^\s*/)[0].length,
            rgx = new RegExp('^\\s{0,' + rsp + '}', 'gm');
        return text.replace(rgx, '');
      }

      /**
       * Dispatch an event
       * @private
       * @param {string} evtName Event name
       * @param {string} text Text
       * @param {{}} options Converter Options
       * @param {{}} globals
       * @returns {string}
       */
      this._dispatch = function dispatch (evtName, text, options, globals) {
        if (listeners.hasOwnProperty(evtName)) {
          for (var ei = 0; ei < listeners[evtName].length; ++ei) {
            var nText = listeners[evtName][ei](evtName, text, this, options, globals);
            if (nText && typeof nText !== 'undefined') {
              text = nText;
            }
          }
        }
        return text;
      };

      /**
       * Listen to an event
       * @param {string} name
       * @param {function} callback
       * @returns {showdown.Converter}
       */
      this.listen = function (name, callback) {
        listen(name, callback);
        return this;
      };

      /**
       * Converts a markdown string into HTML
       * @param {string} text
       * @returns {*}
       */
      this.makeHtml = function (text) {
        //check if text is not falsy
        if (!text) {
          return text;
        }

        var globals = {
          gHtmlBlocks:     [],
          gHtmlMdBlocks:   [],
          gHtmlSpans:      [],
          gUrls:           {},
          gTitles:         {},
          gDimensions:     {},
          gListLevel:      0,
          hashLinkCounts:  {},
          langExtensions:  langExtensions,
          outputModifiers: outputModifiers,
          converter:       this,
          ghCodeBlocks:    [],
          metadata: {
            parsed: {},
            raw: '',
            format: ''
          }
        };

        // This lets us use ¨ trema as an escape char to avoid md5 hashes
        // The choice of character is arbitrary; anything that isn't
        // magic in Markdown will work.
        text = text.replace(/¨/g, '¨T');

        // Replace $ with ¨D
        // RegExp interprets $ as a special character
        // when it's in a replacement string
        text = text.replace(/\$/g, '¨D');

        // Standardize line endings
        text = text.replace(/\r\n/g, '\n'); // DOS to Unix
        text = text.replace(/\r/g, '\n'); // Mac to Unix

        // Stardardize line spaces
        text = text.replace(/\u00A0/g, '&nbsp;');

        if (options.smartIndentationFix) {
          text = rTrimInputText(text);
        }

        // Make sure text begins and ends with a couple of newlines:
        text = '\n\n' + text + '\n\n';

        // detab
        text = showdown.subParser('detab')(text, options, globals);

        /**
         * Strip any lines consisting only of spaces and tabs.
         * This makes subsequent regexs easier to write, because we can
         * match consecutive blank lines with /\n+/ instead of something
         * contorted like /[ \t]*\n+/
         */
        text = text.replace(/^[ \t]+$/mg, '');

        //run languageExtensions
        showdown.helper.forEach(langExtensions, function (ext) {
          text = showdown.subParser('runExtension')(ext, text, options, globals);
        });

        // run the sub parsers
        text = showdown.subParser('metadata')(text, options, globals);
        text = showdown.subParser('hashPreCodeTags')(text, options, globals);
        text = showdown.subParser('githubCodeBlocks')(text, options, globals);
        text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
        text = showdown.subParser('hashCodeTags')(text, options, globals);
        text = showdown.subParser('stripLinkDefinitions')(text, options, globals);
        text = showdown.subParser('blockGamut')(text, options, globals);
        text = showdown.subParser('unhashHTMLSpans')(text, options, globals);
        text = showdown.subParser('unescapeSpecialChars')(text, options, globals);

        // attacklab: Restore dollar signs
        text = text.replace(/¨D/g, '$$');

        // attacklab: Restore tremas
        text = text.replace(/¨T/g, '¨');

        // render a complete html document instead of a partial if the option is enabled
        text = showdown.subParser('completeHTMLDocument')(text, options, globals);

        // Run output modifiers
        showdown.helper.forEach(outputModifiers, function (ext) {
          text = showdown.subParser('runExtension')(ext, text, options, globals);
        });

        // update metadata
        metadata = globals.metadata;
        return text;
      };

      /**
       * Converts an HTML string into a markdown string
       * @param src
       * @param [HTMLParser] A WHATWG DOM and HTML parser, such as JSDOM. If none is supplied, window.document will be used.
       * @returns {string}
       */
      this.makeMarkdown = this.makeMd = function (src, HTMLParser) {

        // replace \r\n with \n
        src = src.replace(/\r\n/g, '\n');
        src = src.replace(/\r/g, '\n'); // old macs

        // due to an edge case, we need to find this: > <
        // to prevent removing of non silent white spaces
        // ex: <em>this is</em> <strong>sparta</strong>
        src = src.replace(/>[ \t]+</, '>¨NBSP;<');

        if (!HTMLParser) {
          if (window && window.document) {
            HTMLParser = window.document;
          } else {
            throw new Error('HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM');
          }
        }

        var doc = HTMLParser.createElement('div');
        doc.innerHTML = src;

        var globals = {
          preList: substitutePreCodeTags(doc)
        };

        // remove all newlines and collapse spaces
        clean(doc);

        // some stuff, like accidental reference links must now be escaped
        // TODO
        // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

        var nodes = doc.childNodes,
            mdDoc = '';

        for (var i = 0; i < nodes.length; i++) {
          mdDoc += showdown.subParser('makeMarkdown.node')(nodes[i], globals);
        }

        function clean (node) {
          for (var n = 0; n < node.childNodes.length; ++n) {
            var child = node.childNodes[n];
            if (child.nodeType === 3) {
              if (!/\S/.test(child.nodeValue)) {
                node.removeChild(child);
                --n;
              } else {
                child.nodeValue = child.nodeValue.split('\n').join(' ');
                child.nodeValue = child.nodeValue.replace(/(\s)+/g, '$1');
              }
            } else if (child.nodeType === 1) {
              clean(child);
            }
          }
        }

        // find all pre tags and replace contents with placeholder
        // we need this so that we can remove all indentation from html
        // to ease up parsing
        function substitutePreCodeTags (doc) {

          var pres = doc.querySelectorAll('pre'),
              presPH = [];

          for (var i = 0; i < pres.length; ++i) {

            if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === 'code') {
              var content = pres[i].firstChild.innerHTML.trim(),
                  language = pres[i].firstChild.getAttribute('data-language') || '';

              // if data-language attribute is not defined, then we look for class language-*
              if (language === '') {
                var classes = pres[i].firstChild.className.split(' ');
                for (var c = 0; c < classes.length; ++c) {
                  var matches = classes[c].match(/^language-(.+)$/);
                  if (matches !== null) {
                    language = matches[1];
                    break;
                  }
                }
              }

              // unescape html entities in content
              content = showdown.helper.unescapeHTMLEntities(content);

              presPH.push(content);
              pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
            } else {
              presPH.push(pres[i].innerHTML);
              pres[i].innerHTML = '';
              pres[i].setAttribute('prenum', i.toString());
            }
          }
          return presPH;
        }

        return mdDoc;
      };

      /**
       * Set an option of this Converter instance
       * @param {string} key
       * @param {*} value
       */
      this.setOption = function (key, value) {
        options[key] = value;
      };

      /**
       * Get the option of this Converter instance
       * @param {string} key
       * @returns {*}
       */
      this.getOption = function (key) {
        return options[key];
      };

      /**
       * Get the options of this Converter instance
       * @returns {{}}
       */
      this.getOptions = function () {
        return options;
      };

      /**
       * Add extension to THIS converter
       * @param {{}} extension
       * @param {string} [name=null]
       */
      this.addExtension = function (extension, name) {
        name = name || null;
        _parseExtension(extension, name);
      };

      /**
       * Use a global registered extension with THIS converter
       * @param {string} extensionName Name of the previously registered extension
       */
      this.useExtension = function (extensionName) {
        _parseExtension(extensionName);
      };

      /**
       * Set the flavor THIS converter should use
       * @param {string} name
       */
      this.setFlavor = function (name) {
        if (!flavor.hasOwnProperty(name)) {
          throw Error(name + ' flavor was not found');
        }
        var preset = flavor[name];
        setConvFlavor = name;
        for (var option in preset) {
          if (preset.hasOwnProperty(option)) {
            options[option] = preset[option];
          }
        }
      };

      /**
       * Get the currently set flavor of this converter
       * @returns {string}
       */
      this.getFlavor = function () {
        return setConvFlavor;
      };

      /**
       * Remove an extension from THIS converter.
       * Note: This is a costly operation. It's better to initialize a new converter
       * and specify the extensions you wish to use
       * @param {Array} extension
       */
      this.removeExtension = function (extension) {
        if (!showdown.helper.isArray(extension)) {
          extension = [extension];
        }
        for (var a = 0; a < extension.length; ++a) {
          var ext = extension[a];
          for (var i = 0; i < langExtensions.length; ++i) {
            if (langExtensions[i] === ext) {
              langExtensions[i].splice(i, 1);
            }
          }
          for (var ii = 0; ii < outputModifiers.length; ++i) {
            if (outputModifiers[ii] === ext) {
              outputModifiers[ii].splice(i, 1);
            }
          }
        }
      };

      /**
       * Get all extension of THIS converter
       * @returns {{language: Array, output: Array}}
       */
      this.getAllExtensions = function () {
        return {
          language: langExtensions,
          output: outputModifiers
        };
      };

      /**
       * Get the metadata of the previously parsed document
       * @param raw
       * @returns {string|{}}
       */
      this.getMetadata = function (raw) {
        if (raw) {
          return metadata.raw;
        } else {
          return metadata.parsed;
        }
      };

      /**
       * Get the metadata format of the previously parsed document
       * @returns {string}
       */
      this.getMetadataFormat = function () {
        return metadata.format;
      };

      /**
       * Private: set a single key, value metadata pair
       * @param {string} key
       * @param {string} value
       */
      this._setMetadataPair = function (key, value) {
        metadata.parsed[key] = value;
      };

      /**
       * Private: set metadata format
       * @param {string} format
       */
      this._setMetadataFormat = function (format) {
        metadata.format = format;
      };

      /**
       * Private: set metadata raw text
       * @param {string} raw
       */
      this._setMetadataRaw = function (raw) {
        metadata.raw = raw;
      };
    };

    /**
     * Turn Markdown link shortcuts into XHTML <a> tags.
     */
    showdown.subParser('anchors', function (text, options, globals) {

      text = globals.converter._dispatch('anchors.before', text, options, globals);

      var writeAnchorTag = function (wholeMatch, linkText, linkId, url, m5, m6, title) {
        if (showdown.helper.isUndefined(title)) {
          title = '';
        }
        linkId = linkId.toLowerCase();

        // Special case for explicit empty url
        if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
          url = '';
        } else if (!url) {
          if (!linkId) {
            // lower-case and turn embedded newlines into spaces
            linkId = linkText.toLowerCase().replace(/ ?\n/g, ' ');
          }
          url = '#' + linkId;

          if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
            url = globals.gUrls[linkId];
            if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
              title = globals.gTitles[linkId];
            }
          } else {
            return wholeMatch;
          }
        }

        //url = showdown.helper.escapeCharacters(url, '*_', false); // replaced line to improve performance
        url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);

        var result = '<a href="' + url + '"';

        if (title !== '' && title !== null) {
          title = title.replace(/"/g, '&quot;');
          //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
          title = title.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          result += ' title="' + title + '"';
        }

        // optionLinksInNewWindow only applies
        // to external links. Hash links (#) open in same page
        if (options.openLinksInNewWindow && !/^#/.test(url)) {
          // escaped _
          result += ' rel="noopener noreferrer" target="¨E95Eblank"';
        }

        result += '>' + linkText + '</a>';

        return result;
      };

      // First, handle reference-style links: [link text] [id]
      text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, writeAnchorTag);

      // Next, inline-style links: [link text](url "optional title")
      // cases with crazy urls like ./image/cat1).png
      text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
        writeAnchorTag);

      // normal cases
      text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
        writeAnchorTag);

      // handle reference-style shortcuts: [link text]
      // These must come last in case you've also got [link test][1]
      // or [link test](/foo)
      text = text.replace(/\[([^\[\]]+)]()()()()()/g, writeAnchorTag);

      // Lastly handle GithubMentions if option is enabled
      if (options.ghMentions) {
        text = text.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gmi, function (wm, st, escape, mentions, username) {
          if (escape === '\\') {
            return st + mentions;
          }

          //check if options.ghMentionsLink is a string
          if (!showdown.helper.isString(options.ghMentionsLink)) {
            throw new Error('ghMentionsLink option must be a string');
          }
          var lnk = options.ghMentionsLink.replace(/\{u}/g, username),
              target = '';
          if (options.openLinksInNewWindow) {
            target = ' rel="noopener noreferrer" target="¨E95Eblank"';
          }
          return st + '<a href="' + lnk + '"' + target + '>' + mentions + '</a>';
        });
      }

      text = globals.converter._dispatch('anchors.after', text, options, globals);
      return text;
    });

    // url allowed chars [a-z\d_.~:/?#[]@!$&'()*+,;=-]

    var simpleURLRegex  = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi,
        simpleURLRegex2 = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi,
        delimUrlRegex   = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi,
        simpleMailRegex = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi,
        delimMailRegex  = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,

        replaceLink = function (options) {
          return function (wm, leadingMagicChars, link, m2, m3, trailingPunctuation, trailingMagicChars) {
            link = link.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
            var lnkTxt = link,
                append = '',
                target = '',
                lmc    = leadingMagicChars || '',
                tmc    = trailingMagicChars || '';
            if (/^www\./i.test(link)) {
              link = link.replace(/^www\./i, 'http://www.');
            }
            if (options.excludeTrailingPunctuationFromURLs && trailingPunctuation) {
              append = trailingPunctuation;
            }
            if (options.openLinksInNewWindow) {
              target = ' rel="noopener noreferrer" target="¨E95Eblank"';
            }
            return lmc + '<a href="' + link + '"' + target + '>' + lnkTxt + '</a>' + append + tmc;
          };
        },

        replaceMail = function (options, globals) {
          return function (wholeMatch, b, mail) {
            var href = 'mailto:';
            b = b || '';
            mail = showdown.subParser('unescapeSpecialChars')(mail, options, globals);
            if (options.encodeEmails) {
              href = showdown.helper.encodeEmailAddress(href + mail);
              mail = showdown.helper.encodeEmailAddress(mail);
            } else {
              href = href + mail;
            }
            return b + '<a href="' + href + '">' + mail + '</a>';
          };
        };

    showdown.subParser('autoLinks', function (text, options, globals) {

      text = globals.converter._dispatch('autoLinks.before', text, options, globals);

      text = text.replace(delimUrlRegex, replaceLink(options));
      text = text.replace(delimMailRegex, replaceMail(options, globals));

      text = globals.converter._dispatch('autoLinks.after', text, options, globals);

      return text;
    });

    showdown.subParser('simplifiedAutoLinks', function (text, options, globals) {

      if (!options.simplifiedAutoLink) {
        return text;
      }

      text = globals.converter._dispatch('simplifiedAutoLinks.before', text, options, globals);

      if (options.excludeTrailingPunctuationFromURLs) {
        text = text.replace(simpleURLRegex2, replaceLink(options));
      } else {
        text = text.replace(simpleURLRegex, replaceLink(options));
      }
      text = text.replace(simpleMailRegex, replaceMail(options, globals));

      text = globals.converter._dispatch('simplifiedAutoLinks.after', text, options, globals);

      return text;
    });

    /**
     * These are all the transformations that form block-level
     * tags like paragraphs, headers, and list items.
     */
    showdown.subParser('blockGamut', function (text, options, globals) {

      text = globals.converter._dispatch('blockGamut.before', text, options, globals);

      // we parse blockquotes first so that we can have headings and hrs
      // inside blockquotes
      text = showdown.subParser('blockQuotes')(text, options, globals);
      text = showdown.subParser('headers')(text, options, globals);

      // Do Horizontal Rules:
      text = showdown.subParser('horizontalRule')(text, options, globals);

      text = showdown.subParser('lists')(text, options, globals);
      text = showdown.subParser('codeBlocks')(text, options, globals);
      text = showdown.subParser('tables')(text, options, globals);

      // We already ran _HashHTMLBlocks() before, in Markdown(), but that
      // was to escape raw HTML in the original Markdown source. This time,
      // we're escaping the markup we've just created, so that we don't wrap
      // <p> tags around block-level tags.
      text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
      text = showdown.subParser('paragraphs')(text, options, globals);

      text = globals.converter._dispatch('blockGamut.after', text, options, globals);

      return text;
    });

    showdown.subParser('blockQuotes', function (text, options, globals) {

      text = globals.converter._dispatch('blockQuotes.before', text, options, globals);

      // add a couple extra lines after the text and endtext mark
      text = text + '\n\n';

      var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

      if (options.splitAdjacentBlockquotes) {
        rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
      }

      text = text.replace(rgx, function (bq) {
        // attacklab: hack around Konqueror 3.5.4 bug:
        // "----------bug".replace(/^-/g,"") == "bug"
        bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting

        // attacklab: clean up hack
        bq = bq.replace(/¨0/g, '');

        bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
        bq = showdown.subParser('githubCodeBlocks')(bq, options, globals);
        bq = showdown.subParser('blockGamut')(bq, options, globals); // recurse

        bq = bq.replace(/(^|\n)/g, '$1  ');
        // These leading spaces screw with <pre> content, so we need to fix that:
        bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
          var pre = m1;
          // attacklab: hack around Konqueror 3.5.4 bug:
          pre = pre.replace(/^  /mg, '¨0');
          pre = pre.replace(/¨0/g, '');
          return pre;
        });

        return showdown.subParser('hashBlock')('<blockquote>\n' + bq + '\n</blockquote>', options, globals);
      });

      text = globals.converter._dispatch('blockQuotes.after', text, options, globals);
      return text;
    });

    /**
     * Process Markdown `<pre><code>` blocks.
     */
    showdown.subParser('codeBlocks', function (text, options, globals) {

      text = globals.converter._dispatch('codeBlocks.before', text, options, globals);

      // sentinel workarounds for lack of \A and \Z, safari\khtml bug
      text += '¨0';

      var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
      text = text.replace(pattern, function (wholeMatch, m1, m2) {
        var codeblock = m1,
            nextChar = m2,
            end = '\n';

        codeblock = showdown.subParser('outdent')(codeblock, options, globals);
        codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
        codeblock = showdown.subParser('detab')(codeblock, options, globals);
        codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
        codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

        if (options.omitExtraWLInCodeBlocks) {
          end = '';
        }

        codeblock = '<pre><code>' + codeblock + end + '</code></pre>';

        return showdown.subParser('hashBlock')(codeblock, options, globals) + nextChar;
      });

      // strip sentinel
      text = text.replace(/¨0/, '');

      text = globals.converter._dispatch('codeBlocks.after', text, options, globals);
      return text;
    });

    /**
     *
     *   *  Backtick quotes are used for <code></code> spans.
     *
     *   *  You can use multiple backticks as the delimiters if you want to
     *     include literal backticks in the code span. So, this input:
     *
     *         Just type ``foo `bar` baz`` at the prompt.
     *
     *       Will translate to:
     *
     *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
     *
     *    There's no arbitrary limit to the number of backticks you
     *    can use as delimters. If you need three consecutive backticks
     *    in your code, use four for delimiters, etc.
     *
     *  *  You can use spaces to get literal backticks at the edges:
     *
     *         ... type `` `bar` `` ...
     *
     *       Turns to:
     *
     *         ... type <code>`bar`</code> ...
     */
    showdown.subParser('codeSpans', function (text, options, globals) {

      text = globals.converter._dispatch('codeSpans.before', text, options, globals);

      if (typeof text === 'undefined') {
        text = '';
      }
      text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
        function (wholeMatch, m1, m2, m3) {
          var c = m3;
          c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
          c = c.replace(/[ \t]*$/g, '');	// trailing whitespace
          c = showdown.subParser('encodeCode')(c, options, globals);
          c = m1 + '<code>' + c + '</code>';
          c = showdown.subParser('hashHTMLSpans')(c, options, globals);
          return c;
        }
      );

      text = globals.converter._dispatch('codeSpans.after', text, options, globals);
      return text;
    });

    /**
     * Create a full HTML document from the processed markdown
     */
    showdown.subParser('completeHTMLDocument', function (text, options, globals) {

      if (!options.completeHTMLDocument) {
        return text;
      }

      text = globals.converter._dispatch('completeHTMLDocument.before', text, options, globals);

      var doctype = 'html',
          doctypeParsed = '<!DOCTYPE HTML>\n',
          title = '',
          charset = '<meta charset="utf-8">\n',
          lang = '',
          metadata = '';

      if (typeof globals.metadata.parsed.doctype !== 'undefined') {
        doctypeParsed = '<!DOCTYPE ' +  globals.metadata.parsed.doctype + '>\n';
        doctype = globals.metadata.parsed.doctype.toString().toLowerCase();
        if (doctype === 'html' || doctype === 'html5') {
          charset = '<meta charset="utf-8">';
        }
      }

      for (var meta in globals.metadata.parsed) {
        if (globals.metadata.parsed.hasOwnProperty(meta)) {
          switch (meta.toLowerCase()) {
            case 'doctype':
              break;

            case 'title':
              title = '<title>' +  globals.metadata.parsed.title + '</title>\n';
              break;

            case 'charset':
              if (doctype === 'html' || doctype === 'html5') {
                charset = '<meta charset="' + globals.metadata.parsed.charset + '">\n';
              } else {
                charset = '<meta name="charset" content="' + globals.metadata.parsed.charset + '">\n';
              }
              break;

            case 'language':
            case 'lang':
              lang = ' lang="' + globals.metadata.parsed[meta] + '"';
              metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
              break;

            default:
              metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
          }
        }
      }

      text = doctypeParsed + '<html' + lang + '>\n<head>\n' + title + charset + metadata + '</head>\n<body>\n' + text.trim() + '\n</body>\n</html>';

      text = globals.converter._dispatch('completeHTMLDocument.after', text, options, globals);
      return text;
    });

    /**
     * Convert all tabs to spaces
     */
    showdown.subParser('detab', function (text, options, globals) {
      text = globals.converter._dispatch('detab.before', text, options, globals);

      // expand first n-1 tabs
      text = text.replace(/\t(?=\t)/g, '    '); // g_tab_width

      // replace the nth with two sentinels
      text = text.replace(/\t/g, '¨A¨B');

      // use the sentinel to anchor our regex so it doesn't explode
      text = text.replace(/¨B(.+?)¨A/g, function (wholeMatch, m1) {
        var leadingText = m1,
            numSpaces = 4 - leadingText.length % 4;  // g_tab_width

        // there *must* be a better way to do this:
        for (var i = 0; i < numSpaces; i++) {
          leadingText += ' ';
        }

        return leadingText;
      });

      // clean up sentinels
      text = text.replace(/¨A/g, '    ');  // g_tab_width
      text = text.replace(/¨B/g, '');

      text = globals.converter._dispatch('detab.after', text, options, globals);
      return text;
    });

    showdown.subParser('ellipsis', function (text, options, globals) {

      text = globals.converter._dispatch('ellipsis.before', text, options, globals);

      text = text.replace(/\.\.\./g, '…');

      text = globals.converter._dispatch('ellipsis.after', text, options, globals);

      return text;
    });

    /**
     * Turn emoji codes into emojis
     *
     * List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
     */
    showdown.subParser('emoji', function (text, options, globals) {

      if (!options.emoji) {
        return text;
      }

      text = globals.converter._dispatch('emoji.before', text, options, globals);

      var emojiRgx = /:([\S]+?):/g;

      text = text.replace(emojiRgx, function (wm, emojiCode) {
        if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
          return showdown.helper.emojis[emojiCode];
        }
        return wm;
      });

      text = globals.converter._dispatch('emoji.after', text, options, globals);

      return text;
    });

    /**
     * Smart processing for ampersands and angle brackets that need to be encoded.
     */
    showdown.subParser('encodeAmpsAndAngles', function (text, options, globals) {
      text = globals.converter._dispatch('encodeAmpsAndAngles.before', text, options, globals);

      // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
      // http://bumppo.net/projects/amputator/
      text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;');

      // Encode naked <'s
      text = text.replace(/<(?![a-z\/?$!])/gi, '&lt;');

      // Encode <
      text = text.replace(/</g, '&lt;');

      // Encode >
      text = text.replace(/>/g, '&gt;');

      text = globals.converter._dispatch('encodeAmpsAndAngles.after', text, options, globals);
      return text;
    });

    /**
     * Returns the string, with after processing the following backslash escape sequences.
     *
     * attacklab: The polite way to do this is with the new escapeCharacters() function:
     *
     *    text = escapeCharacters(text,"\\",true);
     *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
     *
     * ...but we're sidestepping its use of the (slow) RegExp constructor
     * as an optimization for Firefox.  This function gets called a LOT.
     */
    showdown.subParser('encodeBackslashEscapes', function (text, options, globals) {
      text = globals.converter._dispatch('encodeBackslashEscapes.before', text, options, globals);

      text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
      text = text.replace(/\\([`*_{}\[\]()>#+.!~=|-])/g, showdown.helper.escapeCharactersCallback);

      text = globals.converter._dispatch('encodeBackslashEscapes.after', text, options, globals);
      return text;
    });

    /**
     * Encode/escape certain characters inside Markdown code runs.
     * The point is that in code, these characters are literals,
     * and lose their special Markdown meanings.
     */
    showdown.subParser('encodeCode', function (text, options, globals) {

      text = globals.converter._dispatch('encodeCode.before', text, options, globals);

      // Encode all ampersands; HTML entities are not
      // entities within a Markdown code span.
      text = text
        .replace(/&/g, '&amp;')
      // Do the angle bracket song and dance:
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      // Now, escape characters that are magic in Markdown:
        .replace(/([*_{}\[\]\\=~-])/g, showdown.helper.escapeCharactersCallback);

      text = globals.converter._dispatch('encodeCode.after', text, options, globals);
      return text;
    });

    /**
     * Within tags -- meaning between < and > -- encode [\ ` * _ ~ =] so they
     * don't conflict with their use in Markdown for code, italics and strong.
     */
    showdown.subParser('escapeSpecialCharsWithinTagAttributes', function (text, options, globals) {
      text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.before', text, options, globals);

      // Build a regex to find HTML tags.
      var tags     = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,
          comments = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;

      text = text.replace(tags, function (wholeMatch) {
        return wholeMatch
          .replace(/(.)<\/?code>(?=.)/g, '$1`')
          .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
      });

      text = text.replace(comments, function (wholeMatch) {
        return wholeMatch
          .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
      });

      text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.after', text, options, globals);
      return text;
    });

    /**
     * Handle github codeblocks prior to running HashHTML so that
     * HTML contained within the codeblock gets escaped properly
     * Example:
     * ```ruby
     *     def hello_world(x)
     *       puts "Hello, #{x}"
     *     end
     * ```
     */
    showdown.subParser('githubCodeBlocks', function (text, options, globals) {

      // early exit if option is not enabled
      if (!options.ghCodeBlocks) {
        return text;
      }

      text = globals.converter._dispatch('githubCodeBlocks.before', text, options, globals);

      text += '¨0';

      text = text.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function (wholeMatch, delim, language, codeblock) {
        var end = (options.omitExtraWLInCodeBlocks) ? '' : '\n';

        // First parse the github code block
        codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
        codeblock = showdown.subParser('detab')(codeblock, options, globals);
        codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
        codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

        codeblock = '<pre><code' + (language ? ' class="' + language + ' language-' + language + '"' : '') + '>' + codeblock + end + '</code></pre>';

        codeblock = showdown.subParser('hashBlock')(codeblock, options, globals);

        // Since GHCodeblocks can be false positives, we need to
        // store the primitive text and the parsed text in a global var,
        // and then return a token
        return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
      });

      // attacklab: strip sentinel
      text = text.replace(/¨0/, '');

      return globals.converter._dispatch('githubCodeBlocks.after', text, options, globals);
    });

    showdown.subParser('hashBlock', function (text, options, globals) {
      text = globals.converter._dispatch('hashBlock.before', text, options, globals);
      text = text.replace(/(^\n+|\n+$)/g, '');
      text = '\n\n¨K' + (globals.gHtmlBlocks.push(text) - 1) + 'K\n\n';
      text = globals.converter._dispatch('hashBlock.after', text, options, globals);
      return text;
    });

    /**
     * Hash and escape <code> elements that should not be parsed as markdown
     */
    showdown.subParser('hashCodeTags', function (text, options, globals) {
      text = globals.converter._dispatch('hashCodeTags.before', text, options, globals);

      var repFunc = function (wholeMatch, match, left, right) {
        var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
        return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
      };

      // Hash naked <code>
      text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '<code\\b[^>]*>', '</code>', 'gim');

      text = globals.converter._dispatch('hashCodeTags.after', text, options, globals);
      return text;
    });

    showdown.subParser('hashElement', function (text, options, globals) {

      return function (wholeMatch, m1) {
        var blockText = m1;

        // Undo double lines
        blockText = blockText.replace(/\n\n/g, '\n');
        blockText = blockText.replace(/^\n/, '');

        // strip trailing blank lines
        blockText = blockText.replace(/\n+$/g, '');

        // Replace the element text with a marker ("¨KxK" where x is its key)
        blockText = '\n\n¨K' + (globals.gHtmlBlocks.push(blockText) - 1) + 'K\n\n';

        return blockText;
      };
    });

    showdown.subParser('hashHTMLBlocks', function (text, options, globals) {
      text = globals.converter._dispatch('hashHTMLBlocks.before', text, options, globals);

      var blockTags = [
            'pre',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'table',
            'dl',
            'ol',
            'ul',
            'script',
            'noscript',
            'form',
            'fieldset',
            'iframe',
            'math',
            'style',
            'section',
            'header',
            'footer',
            'nav',
            'article',
            'aside',
            'address',
            'audio',
            'canvas',
            'figure',
            'hgroup',
            'output',
            'video',
            'p'
          ],
          repFunc = function (wholeMatch, match, left, right) {
            var txt = wholeMatch;
            // check if this html element is marked as markdown
            // if so, it's contents should be parsed as markdown
            if (left.search(/\bmarkdown\b/) !== -1) {
              txt = left + globals.converter.makeHtml(match) + right;
            }
            return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
          };

      if (options.backslashEscapesHTMLTags) {
        // encode backslash escaped HTML tags
        text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
          return '&lt;' + inside + '&gt;';
        });
      }

      // hash HTML Blocks
      for (var i = 0; i < blockTags.length; ++i) {

        var opTagPos,
            rgx1     = new RegExp('^ {0,3}(<' + blockTags[i] + '\\b[^>]*>)', 'im'),
            patLeft  = '<' + blockTags[i] + '\\b[^>]*>',
            patRight = '</' + blockTags[i] + '>';
        // 1. Look for the first position of the first opening HTML tag in the text
        while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {

          // if the HTML tag is \ escaped, we need to escape it and break


          //2. Split the text in that position
          var subTexts = showdown.helper.splitAtIndex(text, opTagPos),
              //3. Match recursively
              newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, 'im');

          // prevent an infinite loop
          if (newSubText1 === subTexts[1]) {
            break;
          }
          text = subTexts[0].concat(newSubText1);
        }
      }
      // HR SPECIAL CASE
      text = text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
        showdown.subParser('hashElement')(text, options, globals));

      // Special case for standalone HTML comments
      text = showdown.helper.replaceRecursiveRegExp(text, function (txt) {
        return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
      }, '^ {0,3}<!--', '-->', 'gm');

      // PHP and ASP-style processor instructions (<?...?> and <%...%>)
      text = text.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
        showdown.subParser('hashElement')(text, options, globals));

      text = globals.converter._dispatch('hashHTMLBlocks.after', text, options, globals);
      return text;
    });

    /**
     * Hash span elements that should not be parsed as markdown
     */
    showdown.subParser('hashHTMLSpans', function (text, options, globals) {
      text = globals.converter._dispatch('hashHTMLSpans.before', text, options, globals);

      function hashHTMLSpan (html) {
        return '¨C' + (globals.gHtmlSpans.push(html) - 1) + 'C';
      }

      // Hash Self Closing tags
      text = text.replace(/<[^>]+?\/>/gi, function (wm) {
        return hashHTMLSpan(wm);
      });

      // Hash tags without properties
      text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
        return hashHTMLSpan(wm);
      });

      // Hash tags with properties
      text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
        return hashHTMLSpan(wm);
      });

      // Hash self closing tags without />
      text = text.replace(/<[^>]+?>/gi, function (wm) {
        return hashHTMLSpan(wm);
      });

      /*showdown.helper.matchRecursiveRegExp(text, '<code\\b[^>]*>', '</code>', 'gi');*/

      text = globals.converter._dispatch('hashHTMLSpans.after', text, options, globals);
      return text;
    });

    /**
     * Unhash HTML spans
     */
    showdown.subParser('unhashHTMLSpans', function (text, options, globals) {
      text = globals.converter._dispatch('unhashHTMLSpans.before', text, options, globals);

      for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
        var repText = globals.gHtmlSpans[i],
            // limiter to prevent infinite loop (assume 10 as limit for recurse)
            limit = 0;

        while (/¨C(\d+)C/.test(repText)) {
          var num = RegExp.$1;
          repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
          if (limit === 10) {
            console.error('maximum nesting of 10 spans reached!!!');
            break;
          }
          ++limit;
        }
        text = text.replace('¨C' + i + 'C', repText);
      }

      text = globals.converter._dispatch('unhashHTMLSpans.after', text, options, globals);
      return text;
    });

    /**
     * Hash and escape <pre><code> elements that should not be parsed as markdown
     */
    showdown.subParser('hashPreCodeTags', function (text, options, globals) {
      text = globals.converter._dispatch('hashPreCodeTags.before', text, options, globals);

      var repFunc = function (wholeMatch, match, left, right) {
        // encode html entities
        var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
        return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
      };

      // Hash <pre><code>
      text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>', '^ {0,3}</code>\\s*</pre>', 'gim');

      text = globals.converter._dispatch('hashPreCodeTags.after', text, options, globals);
      return text;
    });

    showdown.subParser('headers', function (text, options, globals) {

      text = globals.converter._dispatch('headers.before', text, options, globals);

      var headerLevelStart = (isNaN(parseInt(options.headerLevelStart))) ? 1 : parseInt(options.headerLevelStart),

          // Set text-style headers:
          //	Header 1
          //	========
          //
          //	Header 2
          //	--------
          //
          setextRegexH1 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
          setextRegexH2 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;

      text = text.replace(setextRegexH1, function (wholeMatch, m1) {

        var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
            hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
            hLevel = headerLevelStart,
            hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
        return showdown.subParser('hashBlock')(hashBlock, options, globals);
      });

      text = text.replace(setextRegexH2, function (matchFound, m1) {
        var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
            hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
            hLevel = headerLevelStart + 1,
            hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
        return showdown.subParser('hashBlock')(hashBlock, options, globals);
      });

      // atx-style headers:
      //  # Header 1
      //  ## Header 2
      //  ## Header 2 with closing hashes ##
      //  ...
      //  ###### Header 6
      //
      var atxStyle = (options.requireSpaceBeforeHeadingText) ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;

      text = text.replace(atxStyle, function (wholeMatch, m1, m2) {
        var hText = m2;
        if (options.customizedHeaderId) {
          hText = m2.replace(/\s?\{([^{]+?)}\s*$/, '');
        }

        var span = showdown.subParser('spanGamut')(hText, options, globals),
            hID = (options.noHeaderId) ? '' : ' id="' + headerId(m2) + '"',
            hLevel = headerLevelStart - 1 + m1.length,
            header = '<h' + hLevel + hID + '>' + span + '</h' + hLevel + '>';

        return showdown.subParser('hashBlock')(header, options, globals);
      });

      function headerId (m) {
        var title,
            prefix;

        // It is separate from other options to allow combining prefix and customized
        if (options.customizedHeaderId) {
          var match = m.match(/\{([^{]+?)}\s*$/);
          if (match && match[1]) {
            m = match[1];
          }
        }

        title = m;

        // Prefix id to prevent causing inadvertent pre-existing style matches.
        if (showdown.helper.isString(options.prefixHeaderId)) {
          prefix = options.prefixHeaderId;
        } else if (options.prefixHeaderId === true) {
          prefix = 'section-';
        } else {
          prefix = '';
        }

        if (!options.rawPrefixHeaderId) {
          title = prefix + title;
        }

        if (options.ghCompatibleHeaderId) {
          title = title
            .replace(/ /g, '-')
            // replace previously escaped chars (&, ¨ and $)
            .replace(/&amp;/g, '')
            .replace(/¨T/g, '')
            .replace(/¨D/g, '')
            // replace rest of the chars (&~$ are repeated as they might have been escaped)
            // borrowed from github's redcarpet (some they should produce similar results)
            .replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, '')
            .toLowerCase();
        } else if (options.rawHeaderId) {
          title = title
            .replace(/ /g, '-')
            // replace previously escaped chars (&, ¨ and $)
            .replace(/&amp;/g, '&')
            .replace(/¨T/g, '¨')
            .replace(/¨D/g, '$')
            // replace " and '
            .replace(/["']/g, '-')
            .toLowerCase();
        } else {
          title = title
            .replace(/[^\w]/g, '')
            .toLowerCase();
        }

        if (options.rawPrefixHeaderId) {
          title = prefix + title;
        }

        if (globals.hashLinkCounts[title]) {
          title = title + '-' + (globals.hashLinkCounts[title]++);
        } else {
          globals.hashLinkCounts[title] = 1;
        }
        return title;
      }

      text = globals.converter._dispatch('headers.after', text, options, globals);
      return text;
    });

    /**
     * Turn Markdown link shortcuts into XHTML <a> tags.
     */
    showdown.subParser('horizontalRule', function (text, options, globals) {
      text = globals.converter._dispatch('horizontalRule.before', text, options, globals);

      var key = showdown.subParser('hashBlock')('<hr />', options, globals);
      text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
      text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
      text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

      text = globals.converter._dispatch('horizontalRule.after', text, options, globals);
      return text;
    });

    /**
     * Turn Markdown image shortcuts into <img> tags.
     */
    showdown.subParser('images', function (text, options, globals) {

      text = globals.converter._dispatch('images.before', text, options, globals);

      var inlineRegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
          crazyRegExp       = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,
          base64RegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
          referenceRegExp   = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,
          refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;

      function writeImageTagBase64 (wholeMatch, altText, linkId, url, width, height, m5, title) {
        url = url.replace(/\s/g, '');
        return writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title);
      }

      function writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title) {

        var gUrls   = globals.gUrls,
            gTitles = globals.gTitles,
            gDims   = globals.gDimensions;

        linkId = linkId.toLowerCase();

        if (!title) {
          title = '';
        }
        // Special case for explicit empty url
        if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
          url = '';

        } else if (url === '' || url === null) {
          if (linkId === '' || linkId === null) {
            // lower-case and turn embedded newlines into spaces
            linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
          }
          url = '#' + linkId;

          if (!showdown.helper.isUndefined(gUrls[linkId])) {
            url = gUrls[linkId];
            if (!showdown.helper.isUndefined(gTitles[linkId])) {
              title = gTitles[linkId];
            }
            if (!showdown.helper.isUndefined(gDims[linkId])) {
              width = gDims[linkId].width;
              height = gDims[linkId].height;
            }
          } else {
            return wholeMatch;
          }
        }

        altText = altText
          .replace(/"/g, '&quot;')
        //altText = showdown.helper.escapeCharacters(altText, '*_', false);
          .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
        //url = showdown.helper.escapeCharacters(url, '*_', false);
        url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
        var result = '<img src="' + url + '" alt="' + altText + '"';

        if (title && showdown.helper.isString(title)) {
          title = title
            .replace(/"/g, '&quot;')
          //title = showdown.helper.escapeCharacters(title, '*_', false);
            .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          result += ' title="' + title + '"';
        }

        if (width && height) {
          width  = (width === '*') ? 'auto' : width;
          height = (height === '*') ? 'auto' : height;

          result += ' width="' + width + '"';
          result += ' height="' + height + '"';
        }

        result += ' />';

        return result;
      }

      // First, handle reference-style labeled images: ![alt text][id]
      text = text.replace(referenceRegExp, writeImageTag);

      // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")

      // base64 encoded images
      text = text.replace(base64RegExp, writeImageTagBase64);

      // cases with crazy urls like ./image/cat1).png
      text = text.replace(crazyRegExp, writeImageTag);

      // normal cases
      text = text.replace(inlineRegExp, writeImageTag);

      // handle reference-style shortcuts: ![img text]
      text = text.replace(refShortcutRegExp, writeImageTag);

      text = globals.converter._dispatch('images.after', text, options, globals);
      return text;
    });

    showdown.subParser('italicsAndBold', function (text, options, globals) {

      text = globals.converter._dispatch('italicsAndBold.before', text, options, globals);

      // it's faster to have 3 separate regexes for each case than have just one
      // because of backtracing, in some cases, it could lead to an exponential effect
      // called "catastrophic backtrace". Ominous!

      function parseInside (txt, left, right) {
        /*
        if (options.simplifiedAutoLink) {
          txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
        }
        */
        return left + txt + right;
      }

      // Parse underscores
      if (options.literalMidWordUnderscores) {
        text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
          return parseInside (txt, '<strong><em>', '</em></strong>');
        });
        text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
          return parseInside (txt, '<strong>', '</strong>');
        });
        text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function (wm, txt) {
          return parseInside (txt, '<em>', '</em>');
        });
      } else {
        text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
        });
        text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
        });
        text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
          // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
          return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
        });
      }

      // Now parse asterisks
      if (options.literalMidWordAsterisks) {
        text = text.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function (wm, lead, txt) {
          return parseInside (txt, lead + '<strong><em>', '</em></strong>');
        });
        text = text.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function (wm, lead, txt) {
          return parseInside (txt, lead + '<strong>', '</strong>');
        });
        text = text.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function (wm, lead, txt) {
          return parseInside (txt, lead + '<em>', '</em>');
        });
      } else {
        text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
        });
        text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
        });
        text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function (wm, m) {
          // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
          return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
        });
      }


      text = globals.converter._dispatch('italicsAndBold.after', text, options, globals);
      return text;
    });

    /**
     * Form HTML ordered (numbered) and unordered (bulleted) lists.
     */
    showdown.subParser('lists', function (text, options, globals) {

      /**
       * Process the contents of a single ordered or unordered list, splitting it
       * into individual list items.
       * @param {string} listStr
       * @param {boolean} trimTrailing
       * @returns {string}
       */
      function processListItems (listStr, trimTrailing) {
        // The $g_list_level global keeps track of when we're inside a list.
        // Each time we enter a list, we increment it; when we leave a list,
        // we decrement. If it's zero, we're not in a list anymore.
        //
        // We do this because when we're not inside a list, we want to treat
        // something like this:
        //
        //    I recommend upgrading to version
        //    8. Oops, now this line is treated
        //    as a sub-list.
        //
        // As a single paragraph, despite the fact that the second line starts
        // with a digit-period-space sequence.
        //
        // Whereas when we're inside a list (or sub-list), that line will be
        // treated as the start of a sub-list. What a kludge, huh? This is
        // an aspect of Markdown's syntax that's hard to parse perfectly
        // without resorting to mind-reading. Perhaps the solution is to
        // change the syntax rules such that sub-lists must start with a
        // starting cardinal number; e.g. "1." or "a.".
        globals.gListLevel++;

        // trim trailing blank lines:
        listStr = listStr.replace(/\n{2,}$/, '\n');

        // attacklab: add sentinel to emulate \z
        listStr += '¨0';

        var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,
            isParagraphed = (/\n[ \t]*\n(?!¨0)/.test(listStr));

        // Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
        // which is a syntax breaking change
        // activating this option reverts to old behavior
        if (options.disableForced4SpacesIndentedSublists) {
          rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
        }

        listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
          checked = (checked && checked.trim() !== '');

          var item = showdown.subParser('outdent')(m4, options, globals),
              bulletStyle = '';

          // Support for github tasklists
          if (taskbtn && options.tasklists) {
            bulletStyle = ' class="task-list-item" style="list-style-type: none;"';
            item = item.replace(/^[ \t]*\[(x|X| )?]/m, function () {
              var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
              if (checked) {
                otp += ' checked';
              }
              otp += '>';
              return otp;
            });
          }

          // ISSUE #312
          // This input: - - - a
          // causes trouble to the parser, since it interprets it as:
          // <ul><li><li><li>a</li></li></li></ul>
          // instead of:
          // <ul><li>- - a</li></ul>
          // So, to prevent it, we will put a marker (¨A)in the beginning of the line
          // Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
          item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function (wm2) {
            return '¨A' + wm2;
          });

          // m1 - Leading line or
          // Has a double return (multi paragraph) or
          // Has sublist
          if (m1 || (item.search(/\n{2,}/) > -1)) {
            item = showdown.subParser('githubCodeBlocks')(item, options, globals);
            item = showdown.subParser('blockGamut')(item, options, globals);
          } else {
            // Recursion for sub-lists:
            item = showdown.subParser('lists')(item, options, globals);
            item = item.replace(/\n$/, ''); // chomp(item)
            item = showdown.subParser('hashHTMLBlocks')(item, options, globals);

            // Colapse double linebreaks
            item = item.replace(/\n\n+/g, '\n\n');
            if (isParagraphed) {
              item = showdown.subParser('paragraphs')(item, options, globals);
            } else {
              item = showdown.subParser('spanGamut')(item, options, globals);
            }
          }

          // now we need to remove the marker (¨A)
          item = item.replace('¨A', '');
          // we can finally wrap the line in list item tags
          item =  '<li' + bulletStyle + '>' + item + '</li>\n';

          return item;
        });

        // attacklab: strip sentinel
        listStr = listStr.replace(/¨0/g, '');

        globals.gListLevel--;

        if (trimTrailing) {
          listStr = listStr.replace(/\s+$/, '');
        }

        return listStr;
      }

      function styleStartNumber (list, listType) {
        // check if ol and starts by a number different than 1
        if (listType === 'ol') {
          var res = list.match(/^ *(\d+)\./);
          if (res && res[1] !== '1') {
            return ' start="' + res[1] + '"';
          }
        }
        return '';
      }

      /**
       * Check and parse consecutive lists (better fix for issue #142)
       * @param {string} list
       * @param {string} listType
       * @param {boolean} trimTrailing
       * @returns {string}
       */
      function parseConsecutiveLists (list, listType, trimTrailing) {
        // check if we caught 2 or more consecutive lists by mistake
        // we use the counterRgx, meaning if listType is UL we look for OL and vice versa
        var olRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm,
            ulRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm,
            counterRxg = (listType === 'ul') ? olRgx : ulRgx,
            result = '';

        if (list.search(counterRxg) !== -1) {
          (function parseCL (txt) {
            var pos = txt.search(counterRxg),
                style = styleStartNumber(list, listType);
            if (pos !== -1) {
              // slice
              result += '\n\n<' + listType + style + '>\n' + processListItems(txt.slice(0, pos), !!trimTrailing) + '</' + listType + '>\n';

              // invert counterType and listType
              listType = (listType === 'ul') ? 'ol' : 'ul';
              counterRxg = (listType === 'ul') ? olRgx : ulRgx;

              //recurse
              parseCL(txt.slice(pos));
            } else {
              result += '\n\n<' + listType + style + '>\n' + processListItems(txt, !!trimTrailing) + '</' + listType + '>\n';
            }
          })(list);
        } else {
          var style = styleStartNumber(list, listType);
          result = '\n\n<' + listType + style + '>\n' + processListItems(list, !!trimTrailing) + '</' + listType + '>\n';
        }

        return result;
      }

      /** Start of list parsing **/
      text = globals.converter._dispatch('lists.before', text, options, globals);
      // add sentinel to hack around khtml/safari bug:
      // http://bugs.webkit.org/show_bug.cgi?id=11231
      text += '¨0';

      if (globals.gListLevel) {
        text = text.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
          function (wholeMatch, list, m2) {
            var listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
            return parseConsecutiveLists(list, listType, true);
          }
        );
      } else {
        text = text.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
          function (wholeMatch, m1, list, m3) {
            var listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
            return parseConsecutiveLists(list, listType, false);
          }
        );
      }

      // strip sentinel
      text = text.replace(/¨0/, '');
      text = globals.converter._dispatch('lists.after', text, options, globals);
      return text;
    });

    /**
     * Parse metadata at the top of the document
     */
    showdown.subParser('metadata', function (text, options, globals) {

      if (!options.metadata) {
        return text;
      }

      text = globals.converter._dispatch('metadata.before', text, options, globals);

      function parseMetadataContents (content) {
        // raw is raw so it's not changed in any way
        globals.metadata.raw = content;

        // escape chars forbidden in html attributes
        // double quotes
        content = content
          // ampersand first
          .replace(/&/g, '&amp;')
          // double quotes
          .replace(/"/g, '&quot;');

        content = content.replace(/\n {4}/g, ' ');
        content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function (wm, key, value) {
          globals.metadata.parsed[key] = value;
          return '';
        });
      }

      text = text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function (wholematch, format, content) {
        parseMetadataContents(content);
        return '¨M';
      });

      text = text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function (wholematch, format, content) {
        if (format) {
          globals.metadata.format = format;
        }
        parseMetadataContents(content);
        return '¨M';
      });

      text = text.replace(/¨M/g, '');

      text = globals.converter._dispatch('metadata.after', text, options, globals);
      return text;
    });

    /**
     * Remove one level of line-leading tabs or spaces
     */
    showdown.subParser('outdent', function (text, options, globals) {
      text = globals.converter._dispatch('outdent.before', text, options, globals);

      // attacklab: hack around Konqueror 3.5.4 bug:
      // "----------bug".replace(/^-/g,"") == "bug"
      text = text.replace(/^(\t|[ ]{1,4})/gm, '¨0'); // attacklab: g_tab_width

      // attacklab: clean up hack
      text = text.replace(/¨0/g, '');

      text = globals.converter._dispatch('outdent.after', text, options, globals);
      return text;
    });

    /**
     *
     */
    showdown.subParser('paragraphs', function (text, options, globals) {

      text = globals.converter._dispatch('paragraphs.before', text, options, globals);
      // Strip leading and trailing lines:
      text = text.replace(/^\n+/g, '');
      text = text.replace(/\n+$/g, '');

      var grafs = text.split(/\n{2,}/g),
          grafsOut = [],
          end = grafs.length; // Wrap <p> tags

      for (var i = 0; i < end; i++) {
        var str = grafs[i];
        // if this is an HTML marker, copy it
        if (str.search(/¨(K|G)(\d+)\1/g) >= 0) {
          grafsOut.push(str);

        // test for presence of characters to prevent empty lines being parsed
        // as paragraphs (resulting in undesired extra empty paragraphs)
        } else if (str.search(/\S/) >= 0) {
          str = showdown.subParser('spanGamut')(str, options, globals);
          str = str.replace(/^([ \t]*)/g, '<p>');
          str += '</p>';
          grafsOut.push(str);
        }
      }

      /** Unhashify HTML blocks */
      end = grafsOut.length;
      for (i = 0; i < end; i++) {
        var blockText = '',
            grafsOutIt = grafsOut[i],
            codeFlag = false;
        // if this is a marker for an html block...
        // use RegExp.test instead of string.search because of QML bug
        while (/¨(K|G)(\d+)\1/.test(grafsOutIt)) {
          var delim = RegExp.$1,
              num   = RegExp.$2;

          if (delim === 'K') {
            blockText = globals.gHtmlBlocks[num];
          } else {
            // we need to check if ghBlock is a false positive
            if (codeFlag) {
              // use encoded version of all text
              blockText = showdown.subParser('encodeCode')(globals.ghCodeBlocks[num].text, options, globals);
            } else {
              blockText = globals.ghCodeBlocks[num].codeblock;
            }
          }
          blockText = blockText.replace(/\$/g, '$$$$'); // Escape any dollar signs

          grafsOutIt = grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, blockText);
          // Check if grafsOutIt is a pre->code
          if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
            codeFlag = true;
          }
        }
        grafsOut[i] = grafsOutIt;
      }
      text = grafsOut.join('\n');
      // Strip leading and trailing lines:
      text = text.replace(/^\n+/g, '');
      text = text.replace(/\n+$/g, '');
      return globals.converter._dispatch('paragraphs.after', text, options, globals);
    });

    /**
     * Run extension
     */
    showdown.subParser('runExtension', function (ext, text, options, globals) {

      if (ext.filter) {
        text = ext.filter(text, globals.converter, options);

      } else if (ext.regex) {
        // TODO remove this when old extension loading mechanism is deprecated
        var re = ext.regex;
        if (!(re instanceof RegExp)) {
          re = new RegExp(re, 'g');
        }
        text = text.replace(re, ext.replace);
      }

      return text;
    });

    /**
     * These are all the transformations that occur *within* block-level
     * tags like paragraphs, headers, and list items.
     */
    showdown.subParser('spanGamut', function (text, options, globals) {

      text = globals.converter._dispatch('spanGamut.before', text, options, globals);
      text = showdown.subParser('codeSpans')(text, options, globals);
      text = showdown.subParser('escapeSpecialCharsWithinTagAttributes')(text, options, globals);
      text = showdown.subParser('encodeBackslashEscapes')(text, options, globals);

      // Process anchor and image tags. Images must come first,
      // because ![foo][f] looks like an anchor.
      text = showdown.subParser('images')(text, options, globals);
      text = showdown.subParser('anchors')(text, options, globals);

      // Make links out of things like `<http://example.com/>`
      // Must come after anchors, because you can use < and >
      // delimiters in inline links like [this](<url>).
      text = showdown.subParser('autoLinks')(text, options, globals);
      text = showdown.subParser('simplifiedAutoLinks')(text, options, globals);
      text = showdown.subParser('emoji')(text, options, globals);
      text = showdown.subParser('underline')(text, options, globals);
      text = showdown.subParser('italicsAndBold')(text, options, globals);
      text = showdown.subParser('strikethrough')(text, options, globals);
      text = showdown.subParser('ellipsis')(text, options, globals);

      // we need to hash HTML tags inside spans
      text = showdown.subParser('hashHTMLSpans')(text, options, globals);

      // now we encode amps and angles
      text = showdown.subParser('encodeAmpsAndAngles')(text, options, globals);

      // Do hard breaks
      if (options.simpleLineBreaks) {
        // GFM style hard breaks
        // only add line breaks if the text does not contain a block (special case for lists)
        if (!/\n\n¨K/.test(text)) {
          text = text.replace(/\n+/g, '<br />\n');
        }
      } else {
        // Vanilla hard breaks
        text = text.replace(/  +\n/g, '<br />\n');
      }

      text = globals.converter._dispatch('spanGamut.after', text, options, globals);
      return text;
    });

    showdown.subParser('strikethrough', function (text, options, globals) {

      function parseInside (txt) {
        if (options.simplifiedAutoLink) {
          txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
        }
        return '<del>' + txt + '</del>';
      }

      if (options.strikethrough) {
        text = globals.converter._dispatch('strikethrough.before', text, options, globals);
        text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function (wm, txt) { return parseInside(txt); });
        text = globals.converter._dispatch('strikethrough.after', text, options, globals);
      }

      return text;
    });

    /**
     * Strips link definitions from text, stores the URLs and titles in
     * hash references.
     * Link defs are in the form: ^[id]: url "optional title"
     */
    showdown.subParser('stripLinkDefinitions', function (text, options, globals) {

      var regex       = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,
          base64Regex = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;

      // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
      text += '¨0';

      var replaceFunc = function (wholeMatch, linkId, url, width, height, blankLines, title) {
        linkId = linkId.toLowerCase();
        if (url.match(/^data:.+?\/.+?;base64,/)) {
          // remove newlines
          globals.gUrls[linkId] = url.replace(/\s/g, '');
        } else {
          globals.gUrls[linkId] = showdown.subParser('encodeAmpsAndAngles')(url, options, globals);  // Link IDs are case-insensitive
        }

        if (blankLines) {
          // Oops, found blank lines, so it's not a title.
          // Put back the parenthetical statement we stole.
          return blankLines + title;

        } else {
          if (title) {
            globals.gTitles[linkId] = title.replace(/"|'/g, '&quot;');
          }
          if (options.parseImgDimensions && width && height) {
            globals.gDimensions[linkId] = {
              width:  width,
              height: height
            };
          }
        }
        // Completely remove the definition from the text
        return '';
      };

      // first we try to find base64 link references
      text = text.replace(base64Regex, replaceFunc);

      text = text.replace(regex, replaceFunc);

      // attacklab: strip sentinel
      text = text.replace(/¨0/, '');

      return text;
    });

    showdown.subParser('tables', function (text, options, globals) {

      if (!options.tables) {
        return text;
      }

      var tableRgx       = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,
          //singeColTblRgx = /^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n(?: {0,3}\|.+\|\n)+(?:\n\n|¨0)/gm;
          singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;

      function parseStyles (sLine) {
        if (/^:[ \t]*--*$/.test(sLine)) {
          return ' style="text-align:left;"';
        } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
          return ' style="text-align:right;"';
        } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
          return ' style="text-align:center;"';
        } else {
          return '';
        }
      }

      function parseHeaders (header, style) {
        var id = '';
        header = header.trim();
        // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
        if (options.tablesHeaderId || options.tableHeaderId) {
          id = ' id="' + header.replace(/ /g, '_').toLowerCase() + '"';
        }
        header = showdown.subParser('spanGamut')(header, options, globals);

        return '<th' + id + style + '>' + header + '</th>\n';
      }

      function parseCells (cell, style) {
        var subText = showdown.subParser('spanGamut')(cell, options, globals);
        return '<td' + style + '>' + subText + '</td>\n';
      }

      function buildTable (headers, cells) {
        var tb = '<table>\n<thead>\n<tr>\n',
            tblLgn = headers.length;

        for (var i = 0; i < tblLgn; ++i) {
          tb += headers[i];
        }
        tb += '</tr>\n</thead>\n<tbody>\n';

        for (i = 0; i < cells.length; ++i) {
          tb += '<tr>\n';
          for (var ii = 0; ii < tblLgn; ++ii) {
            tb += cells[i][ii];
          }
          tb += '</tr>\n';
        }
        tb += '</tbody>\n</table>\n';
        return tb;
      }

      function parseTable (rawTable) {
        var i, tableLines = rawTable.split('\n');

        for (i = 0; i < tableLines.length; ++i) {
          // strip wrong first and last column if wrapped tables are used
          if (/^ {0,3}\|/.test(tableLines[i])) {
            tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, '');
          }
          if (/\|[ \t]*$/.test(tableLines[i])) {
            tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, '');
          }
          // parse code spans first, but we only support one line code spans
          tableLines[i] = showdown.subParser('codeSpans')(tableLines[i], options, globals);
        }

        var rawHeaders = tableLines[0].split('|').map(function (s) { return s.trim();}),
            rawStyles = tableLines[1].split('|').map(function (s) { return s.trim();}),
            rawCells = [],
            headers = [],
            styles = [],
            cells = [];

        tableLines.shift();
        tableLines.shift();

        for (i = 0; i < tableLines.length; ++i) {
          if (tableLines[i].trim() === '') {
            continue;
          }
          rawCells.push(
            tableLines[i]
              .split('|')
              .map(function (s) {
                return s.trim();
              })
          );
        }

        if (rawHeaders.length < rawStyles.length) {
          return rawTable;
        }

        for (i = 0; i < rawStyles.length; ++i) {
          styles.push(parseStyles(rawStyles[i]));
        }

        for (i = 0; i < rawHeaders.length; ++i) {
          if (showdown.helper.isUndefined(styles[i])) {
            styles[i] = '';
          }
          headers.push(parseHeaders(rawHeaders[i], styles[i]));
        }

        for (i = 0; i < rawCells.length; ++i) {
          var row = [];
          for (var ii = 0; ii < headers.length; ++ii) {
            if (showdown.helper.isUndefined(rawCells[i][ii])) ;
            row.push(parseCells(rawCells[i][ii], styles[ii]));
          }
          cells.push(row);
        }

        return buildTable(headers, cells);
      }

      text = globals.converter._dispatch('tables.before', text, options, globals);

      // find escaped pipe characters
      text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

      // parse multi column tables
      text = text.replace(tableRgx, parseTable);

      // parse one column tables
      text = text.replace(singeColTblRgx, parseTable);

      text = globals.converter._dispatch('tables.after', text, options, globals);

      return text;
    });

    showdown.subParser('underline', function (text, options, globals) {

      if (!options.underline) {
        return text;
      }

      text = globals.converter._dispatch('underline.before', text, options, globals);

      if (options.literalMidWordUnderscores) {
        text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
          return '<u>' + txt + '</u>';
        });
        text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
          return '<u>' + txt + '</u>';
        });
      } else {
        text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
          return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
        });
        text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
          return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
        });
      }

      // escape remaining underscores to prevent them being parsed by italic and bold
      text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);

      text = globals.converter._dispatch('underline.after', text, options, globals);

      return text;
    });

    /**
     * Swap back in all the special characters we've hidden.
     */
    showdown.subParser('unescapeSpecialChars', function (text, options, globals) {
      text = globals.converter._dispatch('unescapeSpecialChars.before', text, options, globals);

      text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
        var charCodeToReplace = parseInt(m1);
        return String.fromCharCode(charCodeToReplace);
      });

      text = globals.converter._dispatch('unescapeSpecialChars.after', text, options, globals);
      return text;
    });

    showdown.subParser('makeMarkdown.blockquote', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        var children = node.childNodes,
            childrenLength = children.length;

        for (var i = 0; i < childrenLength; ++i) {
          var innerTxt = showdown.subParser('makeMarkdown.node')(children[i], globals);

          if (innerTxt === '') {
            continue;
          }
          txt += innerTxt;
        }
      }
      // cleanup
      txt = txt.trim();
      txt = '> ' + txt.split('\n').join('\n> ');
      return txt;
    });

    showdown.subParser('makeMarkdown.codeBlock', function (node, globals) {

      var lang = node.getAttribute('language'),
          num  = node.getAttribute('precodenum');
      return '```' + lang + '\n' + globals.preList[num] + '\n```';
    });

    showdown.subParser('makeMarkdown.codeSpan', function (node) {

      return '`' + node.innerHTML + '`';
    });

    showdown.subParser('makeMarkdown.emphasis', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        txt += '*';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '*';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.header', function (node, globals, headerLevel) {

      var headerMark = new Array(headerLevel + 1).join('#'),
          txt = '';

      if (node.hasChildNodes()) {
        txt = headerMark + ' ';
        var children = node.childNodes,
            childrenLength = children.length;

        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.hr', function () {

      return '---';
    });

    showdown.subParser('makeMarkdown.image', function (node) {

      var txt = '';
      if (node.hasAttribute('src')) {
        txt += '![' + node.getAttribute('alt') + '](';
        txt += '<' + node.getAttribute('src') + '>';
        if (node.hasAttribute('width') && node.hasAttribute('height')) {
          txt += ' =' + node.getAttribute('width') + 'x' + node.getAttribute('height');
        }

        if (node.hasAttribute('title')) {
          txt += ' "' + node.getAttribute('title') + '"';
        }
        txt += ')';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.links', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes() && node.hasAttribute('href')) {
        var children = node.childNodes,
            childrenLength = children.length;
        txt = '[';
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '](';
        txt += '<' + node.getAttribute('href') + '>';
        if (node.hasAttribute('title')) {
          txt += ' "' + node.getAttribute('title') + '"';
        }
        txt += ')';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.list', function (node, globals, type) {

      var txt = '';
      if (!node.hasChildNodes()) {
        return '';
      }
      var listItems       = node.childNodes,
          listItemsLenght = listItems.length,
          listNum = node.getAttribute('start') || 1;

      for (var i = 0; i < listItemsLenght; ++i) {
        if (typeof listItems[i].tagName === 'undefined' || listItems[i].tagName.toLowerCase() !== 'li') {
          continue;
        }

        // define the bullet to use in list
        var bullet = '';
        if (type === 'ol') {
          bullet = listNum.toString() + '. ';
        } else {
          bullet = '- ';
        }

        // parse list item
        txt += bullet + showdown.subParser('makeMarkdown.listItem')(listItems[i], globals);
        ++listNum;
      }

      // add comment at the end to prevent consecutive lists to be parsed as one
      txt += '\n<!-- -->\n';
      return txt.trim();
    });

    showdown.subParser('makeMarkdown.listItem', function (node, globals) {

      var listItemTxt = '';

      var children = node.childNodes,
          childrenLenght = children.length;

      for (var i = 0; i < childrenLenght; ++i) {
        listItemTxt += showdown.subParser('makeMarkdown.node')(children[i], globals);
      }
      // if it's only one liner, we need to add a newline at the end
      if (!/\n$/.test(listItemTxt)) {
        listItemTxt += '\n';
      } else {
        // it's multiparagraph, so we need to indent
        listItemTxt = listItemTxt
          .split('\n')
          .join('\n    ')
          .replace(/^ {4}$/gm, '')
          .replace(/\n\n+/g, '\n\n');
      }

      return listItemTxt;
    });



    showdown.subParser('makeMarkdown.node', function (node, globals, spansOnly) {

      spansOnly = spansOnly || false;

      var txt = '';

      // edge case of text without wrapper paragraph
      if (node.nodeType === 3) {
        return showdown.subParser('makeMarkdown.txt')(node, globals);
      }

      // HTML comment
      if (node.nodeType === 8) {
        return '<!--' + node.data + '-->\n\n';
      }

      // process only node elements
      if (node.nodeType !== 1) {
        return '';
      }

      var tagName = node.tagName.toLowerCase();

      switch (tagName) {

        //
        // BLOCKS
        //
        case 'h1':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 1) + '\n\n'; }
          break;
        case 'h2':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 2) + '\n\n'; }
          break;
        case 'h3':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 3) + '\n\n'; }
          break;
        case 'h4':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 4) + '\n\n'; }
          break;
        case 'h5':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 5) + '\n\n'; }
          break;
        case 'h6':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 6) + '\n\n'; }
          break;

        case 'p':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.paragraph')(node, globals) + '\n\n'; }
          break;

        case 'blockquote':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.blockquote')(node, globals) + '\n\n'; }
          break;

        case 'hr':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.hr')(node, globals) + '\n\n'; }
          break;

        case 'ol':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ol') + '\n\n'; }
          break;

        case 'ul':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ul') + '\n\n'; }
          break;

        case 'precode':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.codeBlock')(node, globals) + '\n\n'; }
          break;

        case 'pre':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.pre')(node, globals) + '\n\n'; }
          break;

        case 'table':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.table')(node, globals) + '\n\n'; }
          break;

        //
        // SPANS
        //
        case 'code':
          txt = showdown.subParser('makeMarkdown.codeSpan')(node, globals);
          break;

        case 'em':
        case 'i':
          txt = showdown.subParser('makeMarkdown.emphasis')(node, globals);
          break;

        case 'strong':
        case 'b':
          txt = showdown.subParser('makeMarkdown.strong')(node, globals);
          break;

        case 'del':
          txt = showdown.subParser('makeMarkdown.strikethrough')(node, globals);
          break;

        case 'a':
          txt = showdown.subParser('makeMarkdown.links')(node, globals);
          break;

        case 'img':
          txt = showdown.subParser('makeMarkdown.image')(node, globals);
          break;

        default:
          txt = node.outerHTML + '\n\n';
      }

      // common normalization
      // TODO eventually

      return txt;
    });

    showdown.subParser('makeMarkdown.paragraph', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
      }

      // some text normalization
      txt = txt.trim();

      return txt;
    });

    showdown.subParser('makeMarkdown.pre', function (node, globals) {

      var num  = node.getAttribute('prenum');
      return '<pre>' + globals.preList[num] + '</pre>';
    });

    showdown.subParser('makeMarkdown.strikethrough', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        txt += '~~';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '~~';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.strong', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        txt += '**';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '**';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.table', function (node, globals) {

      var txt = '',
          tableArray = [[], []],
          headings   = node.querySelectorAll('thead>tr>th'),
          rows       = node.querySelectorAll('tbody>tr'),
          i, ii;
      for (i = 0; i < headings.length; ++i) {
        var headContent = showdown.subParser('makeMarkdown.tableCell')(headings[i], globals),
            allign = '---';

        if (headings[i].hasAttribute('style')) {
          var style = headings[i].getAttribute('style').toLowerCase().replace(/\s/g, '');
          switch (style) {
            case 'text-align:left;':
              allign = ':---';
              break;
            case 'text-align:right;':
              allign = '---:';
              break;
            case 'text-align:center;':
              allign = ':---:';
              break;
          }
        }
        tableArray[0][i] = headContent.trim();
        tableArray[1][i] = allign;
      }

      for (i = 0; i < rows.length; ++i) {
        var r = tableArray.push([]) - 1,
            cols = rows[i].getElementsByTagName('td');

        for (ii = 0; ii < headings.length; ++ii) {
          var cellContent = ' ';
          if (typeof cols[ii] !== 'undefined') {
            cellContent = showdown.subParser('makeMarkdown.tableCell')(cols[ii], globals);
          }
          tableArray[r].push(cellContent);
        }
      }

      var cellSpacesCount = 3;
      for (i = 0; i < tableArray.length; ++i) {
        for (ii = 0; ii < tableArray[i].length; ++ii) {
          var strLen = tableArray[i][ii].length;
          if (strLen > cellSpacesCount) {
            cellSpacesCount = strLen;
          }
        }
      }

      for (i = 0; i < tableArray.length; ++i) {
        for (ii = 0; ii < tableArray[i].length; ++ii) {
          if (i === 1) {
            if (tableArray[i][ii].slice(-1) === ':') {
              tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(-1), cellSpacesCount - 1, '-') + ':';
            } else {
              tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, '-');
            }
          } else {
            tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
          }
        }
        txt += '| ' + tableArray[i].join(' | ') + ' |\n';
      }

      return txt.trim();
    });

    showdown.subParser('makeMarkdown.tableCell', function (node, globals) {

      var txt = '';
      if (!node.hasChildNodes()) {
        return '';
      }
      var children = node.childNodes,
          childrenLength = children.length;

      for (var i = 0; i < childrenLength; ++i) {
        txt += showdown.subParser('makeMarkdown.node')(children[i], globals, true);
      }
      return txt.trim();
    });

    showdown.subParser('makeMarkdown.txt', function (node) {

      var txt = node.nodeValue;

      // multiple spaces are collapsed
      txt = txt.replace(/ +/g, ' ');

      // replace the custom ¨NBSP; with a space
      txt = txt.replace(/¨NBSP;/g, ' ');

      // ", <, > and & should replace escaped html entities
      txt = showdown.helper.unescapeHTMLEntities(txt);

      // escape markdown magic characters
      // emphasis, strong and strikethrough - can appear everywhere
      // we also escape pipe (|) because of tables
      // and escape ` because of code blocks and spans
      txt = txt.replace(/([*_~|`])/g, '\\$1');

      // escape > because of blockquotes
      txt = txt.replace(/^(\s*)>/g, '\\$1>');

      // hash character, only troublesome at the beginning of a line because of headers
      txt = txt.replace(/^#/gm, '\\#');

      // horizontal rules
      txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, '$1\\$2$3');

      // dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
      txt = txt.replace(/^( {0,3}\d+)\./gm, '$1\\.');

      // +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
      txt = txt.replace(/^( {0,3})([+-])/gm, '$1\\$2');

      // images and links, ] followed by ( is problematic, so we escape it
      txt = txt.replace(/]([\s]*)\(/g, '\\]$1\\(');

      // reference URIs must also be escaped
      txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, '\\[$1]:');

      return txt;
    });

    var root = this;

    // AMD Loader
    if (module.exports) {
      module.exports = showdown;

    // Regular Browser loader
    } else {
      root.showdown = showdown;
    }
    }).call(commonjsGlobal);


    });

    var showdown$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        'default': showdown
    }, [showdown]));

    /* src/App.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (93:2) {:else}
    function create_else_block(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "התחבר";
    			attr_dev(a, "href", "https://github.com/login/oauth/authorize?scope:gist&client_id=b22b1c742cd6f94f2a1e");
    			attr_dev(a, "class", "svelte-jvj935");
    			add_location(a, file, 93, 3, 2542);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(93:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (91:2) {#if user}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*user*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*user*/ 4) set_data_dev(t, /*user*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:2) {#if user}",
    		ctx
    	});

    	return block;
    }

    // (109:2) {#each [...Array(16).keys()] as i}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*i*/ ctx[17] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "data-color", /*i*/ ctx[17]);
    			attr_dev(div, "class", "svelte-jvj935");
    			add_location(div, file, 109, 3, 2881);
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
    		source: "(109:2) {#each [...Array(16).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div3;
    	let div2;
    	let t3;
    	let board0;
    	let t4;
    	let div4;
    	let t5;
    	let div6;
    	let div5;
    	let t6;
    	let board1;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	board0 = new Board({
    			props: { board: /*target*/ ctx[0] },
    			$$inline: true
    		});

    	let each_value = [...Array(16).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	board1 = new Board({
    			props: { board: /*board*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*status*/ ctx[4]);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t3 = space();
    			create_component(board0.$$.fragment);
    			t4 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t6 = space();
    			create_component(board1.$$.fragment);
    			attr_dev(div0, "class", "status svelte-jvj935");
    			add_location(div0, file, 89, 2, 2471);
    			attr_dev(div1, "class", "menu svelte-jvj935");
    			add_location(div1, file, 88, 1, 2450);
    			attr_dev(div2, "id", "description");
    			attr_dev(div2, "contenteditable", "false");
    			attr_dev(div2, "class", "svelte-jvj935");
    			if (/*description*/ ctx[3] === void 0) add_render_callback(() => /*div2_input_handler*/ ctx[5].call(div2));
    			add_location(div2, file, 100, 2, 2695);
    			attr_dev(div3, "class", "row svelte-jvj935");
    			add_location(div3, file, 99, 1, 2675);
    			attr_dev(div4, "class", "colors svelte-jvj935");
    			add_location(div4, file, 107, 1, 2820);
    			attr_dev(div5, "id", "editor");
    			attr_dev(div5, "class", "svelte-jvj935");
    			add_location(div5, file, 115, 2, 2959);
    			attr_dev(div6, "class", "row svelte-jvj935");
    			add_location(div6, file, 114, 1, 2939);
    			attr_dev(main, "dir", "rtl");
    			attr_dev(main, "class", "svelte-jvj935");
    			add_location(main, file, 87, 0, 2432);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if_block.m(div1, null);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			append_dev(div3, div2);

    			if (/*description*/ ctx[3] !== void 0) {
    				div2.innerHTML = /*description*/ ctx[3];
    			}

    			append_dev(div3, t3);
    			mount_component(board0, div3, null);
    			append_dev(main, t4);
    			append_dev(main, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(main, t5);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			append_dev(div6, t6);
    			mount_component(board1, div6, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "input", /*div2_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*status*/ 16) set_data_dev(t0, /*status*/ ctx[4]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}

    			if (dirty & /*description*/ 8 && /*description*/ ctx[3] !== div2.innerHTML) {
    				div2.innerHTML = /*description*/ ctx[3];
    			}

    			const board0_changes = {};
    			if (dirty & /*target*/ 1) board0_changes.board = /*target*/ ctx[0];
    			board0.$set(board0_changes);

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
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const board1_changes = {};
    			if (dirty & /*board*/ 2) board1_changes.board = /*board*/ ctx[1];
    			board1.$set(board1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board0.$$.fragment, local);
    			transition_in(board1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board0.$$.fragment, local);
    			transition_out(board1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			destroy_component(board0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(board1);
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

    const n = 16;
    const tutorial = "b28898ea969349781ff75853716d0978";

    function sleep(ms) {
    	
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const mdConverter = new showdown.Converter();
    	const yay = new Audio("yay.mp3");
    	let target = Array.from(Array(n), () => new Array(n));
    	let board = Array.from(Array(n), () => new Array(n));
    	let octokit;
    	let user;
    	let description;
    	let solution;
    	let status = "😒";

    	async function init() {
    		octokit = await login();
    		$$invalidate(2, user = await getUser(octokit));
    		const { data: { files } } = await loadGist(octokit, tutorial);
    		$$invalidate(3, description = mdConverter.makeHtml(files["kidkidkod.md"].content));
    		solution = files["kidkidkod.app"].content;
    		console.log(solution);
    		$$invalidate(0, target = exec(target)(solution));
    	}

    	init();
    	const lexer = getLexer(true, KW_HEBREW);

    	function token(text, kind) {
    		if (kind === K.WS) {
    			return document.createTextNode(text);
    		} else {
    			const e = document.createElement("t");
    			e.innerText = text;
    			e.setAttribute("kind", kind.toString());
    			return e;
    		}
    	}

    	const color = board => (i, j, v) => {
    		if (0 <= i && i < n && 0 <= j && j < n) {
    			board[i][j] = v;
    		}

    		return 0;
    	};

    	const exec = board => code => {
    		board.forEach(row => row.fill(0));

    		const host = {
    			vars: {},
    			funcs: { צבע: color(board), נמנם: sleep }
    		};

    		const prog = parse$1(code, { host, lexer: getLexer(false, KW_HEBREW) });
    		prog.forEach(s => s.eval());
    		return board;
    	};

    	function updateBoard(code) {
    		$$invalidate(1, board = exec(board)(code));

    		if (JSON.stringify(board) === JSON.stringify(target)) {
    			$$invalidate(4, status = "😍");
    			yay.play();
    		}
    	}

    	const highlight = editor => {
    		const code = editor.textContent;
    		const div = document.createElement("div");
    		let tokens = lexer.parse(code);

    		while (tokens) {
    			div.appendChild(token(tokens.text, tokens.kind));
    			tokens = tokens.next;
    		}

    		editor.innerHTML = div.innerHTML;
    	};

    	addEventListener("DOMContentLoaded", () => {
    		const jar = CodeJar(document.getElementById("editor"), highlight, { tab: "  ", indentOn: /.*:$/ });
    		jar.onUpdate(updateBoard);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function div2_input_handler() {
    		description = this.innerHTML;
    		$$invalidate(3, description);
    	}

    	$$self.$capture_state = () => ({
    		CodeJar,
    		Board,
    		getLexer,
    		K,
    		KW_HEBREW,
    		parse: parse$1,
    		getUser,
    		loadGist,
    		login,
    		showdown: showdown$1,
    		n,
    		tutorial,
    		mdConverter,
    		yay,
    		target,
    		board,
    		octokit,
    		user,
    		description,
    		solution,
    		status,
    		init,
    		lexer,
    		token,
    		sleep,
    		color,
    		exec,
    		updateBoard,
    		highlight
    	});

    	$$self.$inject_state = $$props => {
    		if ('target' in $$props) $$invalidate(0, target = $$props.target);
    		if ('board' in $$props) $$invalidate(1, board = $$props.board);
    		if ('octokit' in $$props) octokit = $$props.octokit;
    		if ('user' in $$props) $$invalidate(2, user = $$props.user);
    		if ('description' in $$props) $$invalidate(3, description = $$props.description);
    		if ('solution' in $$props) solution = $$props.solution;
    		if ('status' in $$props) $$invalidate(4, status = $$props.status);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [target, board, user, description, status, div2_input_handler];
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
