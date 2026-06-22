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
exports.HeroServices = void 0;
const hero_model_1 = require("./hero.model");
const createHero = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield hero_model_1.Hero.create(payload);
    return result;
});
const getHero = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield hero_model_1.Hero.findOne();
    return result;
});
const updateHero = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield hero_model_1.Hero.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteHero = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield hero_model_1.Hero.findByIdAndDelete(id);
    return result;
});
exports.HeroServices = {
    createHero,
    getHero,
    updateHero,
    deleteHero,
};
