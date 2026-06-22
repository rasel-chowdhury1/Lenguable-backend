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
exports.HowItWorksServices = void 0;
const howItWorks_model_1 = require("./howItWorks.model");
const createHowItWorks = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_model_1.HowItWorks.create(payload);
    return result;
});
const getAllHowItWorks = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_model_1.HowItWorks.find();
    return result;
});
const getHowItWorksById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_model_1.HowItWorks.findById(id);
    return result;
});
const updateHowItWorks = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_model_1.HowItWorks.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteHowItWorks = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield howItWorks_model_1.HowItWorks.findByIdAndDelete(id);
    return result;
});
exports.HowItWorksServices = {
    createHowItWorks,
    getAllHowItWorks,
    getHowItWorksById,
    updateHowItWorks,
    deleteHowItWorks,
};
