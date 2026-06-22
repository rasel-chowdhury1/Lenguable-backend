"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTA2Service = void 0;
const cta2_model_1 = require("./cta2.model");
const createCTA2 = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta2_model_1.CTA2.create(payload);
});
const getCTA2 = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta2_model_1.CTA2.find();
});
const updateCTA2 = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta2_model_1.CTA2.findByIdAndUpdate(id, payload, {
        new: true,
    });
});
const deleteCTA2 = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta2_model_1.CTA2.findByIdAndDelete(id);
});
exports.CTA2Service = {
    createCTA2,
    getCTA2,
    updateCTA2,
    deleteCTA2,
};
