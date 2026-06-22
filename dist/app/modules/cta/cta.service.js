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
exports.CTAService = void 0;
const cta_model_1 = require("./cta.model");
const createCTA = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta_model_1.CTA.create(payload);
});
const getCTA = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta_model_1.CTA.findOne();
});
const updateCTA = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta_model_1.CTA.findByIdAndUpdate(id, payload, { new: true });
});
const deleteCTA = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield cta_model_1.CTA.findByIdAndDelete(id);
});
exports.CTAService = {
    createCTA,
    getCTA,
    updateCTA,
    deleteCTA,
};
