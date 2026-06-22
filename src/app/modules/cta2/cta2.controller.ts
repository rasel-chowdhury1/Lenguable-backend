import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CTA2Service } from "./cta2.service";

const createCTA2 = catchAsync(async (req, res) => {
  const result = await CTA2Service.createCTA2(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "CTA2 created successfully",
    data: result,
  });
});

const getCTA2 = catchAsync(async (req, res) => {
  const result = await CTA2Service.getCTA2();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CTA2 fetched successfully",
    data: result,
  });
});

const updateCTA2 = catchAsync(async (req, res) => {
  const result = await CTA2Service.updateCTA2(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CTA2 updated successfully",
    data: result,
  });
});

const deleteCTA2 = catchAsync(async (req, res) => {
  const result = await CTA2Service.deleteCTA2(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "CTA2 deleted successfully",
    data: result,
  });
});

export const CTA2Controller = {
  createCTA2,
  getCTA2,
  updateCTA2,
  deleteCTA2,
};
