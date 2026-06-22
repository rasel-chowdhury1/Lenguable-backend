import { UserModel } from "./user.model";

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate({
      path: "teacher",
      populate: [{ path: "availabilities" }, { path: "bookings" }],
    })
    .populate({
      path: "student",
      populate: [
        {
          path: "booking",
          populate: {
            path: "teacherId",
            select: "name email",
          },
        },
        { path: "packages" },
        {
          // payment is on student, not on user
          path: "payment",
          select: "amount currency status paidAt packageId stripeSessionId",
          populate: { path: "packageId", select: "name price credits" },
        },
      ],
    })
    .select("-password");

  return user;
};

export const UserServices = {
  getMe,
};
