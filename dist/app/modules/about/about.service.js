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
exports.AboutServices = void 0;
const about_model_1 = require("./about.model");
const createAbout = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.create(payload);
    return result;
});
const getAllAbout = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.find();
    return result;
});
const getAboutById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.findById(id);
    return result;
});
const updateAbout = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteAbout = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield about_model_1.About.findByIdAndDelete(id);
    return result;
});
exports.AboutServices = {
    createAbout,
    getAllAbout,
    getAboutById,
    updateAbout,
    deleteAbout,
};
