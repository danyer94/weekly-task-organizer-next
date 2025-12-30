"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var database_1 = require("firebase/database");
var app_1 = require("firebase/app");
// Load .env.production variables
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
// Assuming the Firebase path variable is called NEXT_PUBLIC_FIREBASE_DATABASE_URL
var firebaseDbPath = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
if (!firebaseDbPath) {
  console.error(
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL not found in .env.production"
  );
  process.exit(1);
}
console.log("Firebase database path from .env.production:", firebaseDbPath);
var firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
var app = (0, app_1.initializeApp)(firebaseConfig);
var database = (0, database_1.getDatabase)(app);
/**
 * Función para renombrar un nodo en Firebase Realtime Database.
 * @param oldNodePath La ruta del nodo actual que deseas renombrar.
 * @param newNodePath La nueva ruta y nombre para el nodo.
 * @returns Una Promesa que se resuelve cuando la operación se completa.
 */
function renameNode(oldNodePath, newNodePath) {
  return __awaiter(this, void 0, void 0, function () {
    var oldRef, newRef, snapshot, dataToRename, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          oldRef = (0, database_1.ref)(database, oldNodePath);
          newRef = (0, database_1.ref)(database, newNodePath);
          _a.label = 1;
        case 1:
          _a.trys.push([1, 7, , 8]);
          return [4 /*yield*/, (0, database_1.get)(oldRef)];
        case 2:
          snapshot = _a.sent();
          if (!snapshot.exists()) return [3 /*break*/, 5];
          dataToRename = snapshot.val();
          console.log(
            "Datos le\u00EDdos de '".concat(oldNodePath, "':"),
            dataToRename
          );
          // 2. Escribir esos datos en la nueva ubicación
          return [4 /*yield*/, (0, database_1.set)(newRef, dataToRename)];
        case 3:
          // 2. Escribir esos datos en la nueva ubicación
          _a.sent();
          console.log("Datos escritos en '".concat(newNodePath, "'."));
          // 3. Eliminar el nodo original
          return [4 /*yield*/, (0, database_1.remove)(oldRef)];
        case 4:
          // 3. Eliminar el nodo original
          _a.sent();
          console.log("Nodo original '".concat(oldNodePath, "' eliminado."));
          console.log(
            "Nodo renombrado de '"
              .concat(oldNodePath, "' a '")
              .concat(newNodePath, "' exitosamente.")
          );
          return [3 /*break*/, 6];
        case 5:
          console.warn(
            "El nodo original '".concat(oldNodePath, "' no existe.")
          );
          _a.label = 6;
        case 6:
          return [3 /*break*/, 8];
        case 7:
          error_1 = _a.sent();
          console.error("Error al renombrar el nodo:", error_1);
          throw error_1; // Propagar el error para manejo externo
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
renameNode("weeks/2025", "weeks/2026");
