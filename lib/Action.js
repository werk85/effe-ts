"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unionize_1 = require("unionize");
exports.withPayload = () => unionize_1.ofType();
exports.create = (record) => unionize_1.unionize(record, { tag: 'type', value: 'payload' });
//# sourceMappingURL=Action.js.map