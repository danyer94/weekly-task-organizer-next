"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var app_1 = require("firebase/app");
var database_1 = require("firebase/database");
var envPath = path.resolve(process.cwd(), ".env.production");
if (!fs.existsSync(envPath)) {
    console.error(".env.production file not found");
    process.exit(1);
}
var envResult = dotenv.config({ path: envPath });
if (envResult.error) {
    console.error("Error loading .env.production:", envResult.error);
    process.exit(1);
}
var firebaseDbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
if (!firebaseDbUrl) {
    console.error("NEXT_PUBLIC_FIREBASE_DATABASE_URL not found in .env.production");
    process.exit(1);
}
var firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: firebaseDbUrl,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
var app = (0, app_1.initializeApp)(firebaseConfig);
var database = (0, database_1.getDatabase)(app);
var createTaskId = function () {
    var key = (0, database_1.push)((0, database_1.ref)(database, "meta/taskIds")).key;
    if (key) {
        return key;
    }
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return "task_".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 8));
};
var ensureIdsForTasksByDay = function (tasksByDay) {
    if (!tasksByDay || typeof tasksByDay !== "object" || Array.isArray(tasksByDay)) {
        return { updated: false, data: tasksByDay, updatedCount: 0 };
    }
    var updated = false;
    var updatedCount = 0;
    var next = {};
    var _loop_1 = function (day, list) {
        if (!Array.isArray(list)) {
            next[day] = list;
            return "continue";
        }
        var dayUpdated = false;
        var nextList = list.map(function (task) {
            if (!task || typeof task !== "object") {
                return task;
            }
            var id = task.id;
            if (typeof id === "string" && id.trim() !== "") {
                return task;
            }
            dayUpdated = true;
            updatedCount += 1;
            return __assign(__assign({}, task), { id: createTaskId() });
        });
        if (dayUpdated) {
            updated = true;
        }
        next[day] = nextList;
    };
    for (var _i = 0, _a = Object.entries(tasksByDay); _i < _a.length; _i++) {
        var _b = _a[_i], day = _b[0], list = _b[1];
        _loop_1(day, list);
    }
    return { updated: updated, data: updated ? next : tasksByDay, updatedCount: updatedCount };
};
var backfillWeeks = function () { return __awaiter(void 0, void 0, void 0, function () {
    var weeksSnapshot, weeksData, updatedWeeks, updatedTasks, _i, _a, _b, year, weeks, _c, _d, _e, week, tasksByDay, _f, updated, data, updatedCount;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0: return [4 /*yield*/, (0, database_1.get)((0, database_1.ref)(database, "weeks"))];
            case 1:
                weeksSnapshot = _g.sent();
                if (!weeksSnapshot.exists()) {
                    console.log("No weeks data found.");
                    return [2 /*return*/, { updatedWeeks: 0, updatedTasks: 0 }];
                }
                weeksData = weeksSnapshot.val();
                updatedWeeks = 0;
                updatedTasks = 0;
                _i = 0, _a = Object.entries(weeksData);
                _g.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                _b = _a[_i], year = _b[0], weeks = _b[1];
                if (!weeks || typeof weeks !== "object") {
                    return [3 /*break*/, 6];
                }
                _c = 0, _d = Object.entries(weeks);
                _g.label = 3;
            case 3:
                if (!(_c < _d.length)) return [3 /*break*/, 6];
                _e = _d[_c], week = _e[0], tasksByDay = _e[1];
                _f = ensureIdsForTasksByDay(tasksByDay), updated = _f.updated, data = _f.data, updatedCount = _f.updatedCount;
                if (!updated) {
                    return [3 /*break*/, 5];
                }
                return [4 /*yield*/, (0, database_1.set)((0, database_1.ref)(database, "weeks/".concat(year, "/").concat(week)), data)];
            case 4:
                _g.sent();
                updatedWeeks += 1;
                updatedTasks += updatedCount;
                console.log("Updated weeks/".concat(year, "/").concat(week, " (").concat(updatedCount, " task(s))."));
                _g.label = 5;
            case 5:
                _c++;
                return [3 /*break*/, 3];
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7: return [2 /*return*/, { updatedWeeks: updatedWeeks, updatedTasks: updatedTasks }];
        }
    });
}); };
var backfillLegacyTasks = function () { return __awaiter(void 0, void 0, void 0, function () {
    var tasksSnapshot, _a, updated, data, updatedCount;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, database_1.get)((0, database_1.ref)(database, "tasks"))];
            case 1:
                tasksSnapshot = _b.sent();
                if (!tasksSnapshot.exists()) {
                    return [2 /*return*/, { updated: false, updatedTasks: 0 }];
                }
                _a = ensureIdsForTasksByDay(tasksSnapshot.val()), updated = _a.updated, data = _a.data, updatedCount = _a.updatedCount;
                if (!updated) {
                    return [2 /*return*/, { updated: false, updatedTasks: 0 }];
                }
                return [4 /*yield*/, (0, database_1.set)((0, database_1.ref)(database, "tasks"), data)];
            case 2:
                _b.sent();
                console.log("Updated tasks root (".concat(updatedCount, " task(s))."));
                return [2 /*return*/, { updated: true, updatedTasks: updatedCount }];
        }
    });
}); };
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var weeksResult, legacyResult, totalTasks, totalWeeks, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, backfillWeeks()];
            case 1:
                weeksResult = _a.sent();
                return [4 /*yield*/, backfillLegacyTasks()];
            case 2:
                legacyResult = _a.sent();
                totalTasks = weeksResult.updatedTasks + legacyResult.updatedTasks;
                totalWeeks = weeksResult.updatedWeeks;
                console.log("Done. Updated ".concat(totalTasks, " task(s) across ").concat(totalWeeks, " week node(s)."));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Failed to backfill task ids:", error_1);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
run();
