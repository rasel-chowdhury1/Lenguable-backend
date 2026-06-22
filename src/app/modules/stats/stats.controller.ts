import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { StatsService } from "./stats.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getOverviewStats = catchAsync(async (req: Request, res: Response) => {
  const period = (req.query.period as "weekly" | "monthly" | "all") ?? "weekly";

  const data = await StatsService.getOverviewStats(period);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Overview stats fetched successfully",
    data,
  });
});


const getWeeklyFinancials = catchAsync(async (req: Request, res: Response) => {
  const weeks = parseInt((req.query.weeks as string) ?? "4", 10);

  const data = await StatsService.getWeeklyFinancials(weeks);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Weekly financials fetched successfully",
    data,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const period = (req.query.period as "weekly" | "monthly" | "all") ?? "weekly";
  const weeks = parseInt((req.query.weeks as string) ?? "4", 10);

  const data = await StatsService.getDashboardStats(period, weeks);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data,
  });
});

export const StatsController = {
  getOverviewStats,
  getWeeklyFinancials,
  getDashboardStats,
};