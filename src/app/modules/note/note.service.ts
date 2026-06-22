import { INote } from "./note.interface";
import { Note } from "./note.model";
import { UserModel } from "../user/user.model";
import { StudentModel } from "../student/student.model";
import { BookingModel } from "../booking/booking.model";
import { LessonModel } from "../lesson/lesson.model";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";

// existing

const createNote = async (payload: INote) => {
  const result = await Note.create(payload);
  return result;
};

const getAllNotes = async () => {
  return await Note.find()
    .populate("studentId", "name email")
    .populate("teacherId", "name email");
};

const getNotesByStudent = async (studentId: string) => {
  return await Note.find({ studentId }).populate("teacherId", "name email");
};

const LEVEL_ORDER = ["A0", "A1", "A2", "B1", "B2", "C1"];

// const getMyStudents = async (userId: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
//   }

//   const bookings = await BookingModel.find({}).populate(
//     "studentId",
//     "name email interests aboutMe unlockedLessons",
//   );

//   const studentMap = new Map();
//   for (const booking of bookings) {
//     const student = booking.studentId as any;
//     if (!student) continue;

//     const studentKey = student._id.toString();

//     if (!studentMap.has(studentKey)) {
//       // Get all unlocked lessons to find highest level
//       const unlockedLessons = await LessonModel.find({
//         _id: { $in: student.unlockedLessons || [] },
//       }).select("level");

//       const highestLevel = unlockedLessons.reduce(
//         (highest: string, lesson: any) => {
//           const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
//           const highestIdx = LEVEL_ORDER.indexOf(highest);
//           return lessonIdx > highestIdx ? lesson.level : highest;
//         },
//         "A0",
//       );

//       studentMap.set(studentKey, {
//         _id: student._id,
//         name: student.name,
//         email: student.email,
//         unlockedLessons: student.unlockedLessons || [],
//         lessonsCompleted: 0,
//         currentLevel: highestLevel,
//       });
//     }

//     if (booking.teacherJoined === true) {
//       const existing = studentMap.get(studentKey);
//       existing.lessonsCompleted += 1;
//     }
//   }

//   return Array.from(studentMap.values());
// };

const getMyStudents = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const allStudents = await StudentModel.find().select(
    "name email unlockedLessons totalCompletedClasses",
  );

  const result = await Promise.all(
    allStudents.map(async (student: any) => {
      const unlockedLessons = await LessonModel.find({
        _id: { $in: student.unlockedLessons || [] },
      }).select("level");

      const highestLevel = unlockedLessons.reduce(
        (highest: string, lesson: any) => {
          const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
          const highestIdx = LEVEL_ORDER.indexOf(highest);
          return lessonIdx > highestIdx ? lesson.level : highest;
        },
        "A0",
      );

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        unlockedLessons: student.unlockedLessons || [],
        lessonsCompleted: student.totalCompletedClasses ?? 0,
        currentLevel: highestLevel,
      };
    }),
  );

  return result;
};

// const getMyStudents = async (userId: string) => {
//   const user = await UserModel.findById(userId);
//   if (!user || !user.teacher) {
//     throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
//   }

//   // Query ALL students directly, not via bookings
//   const allStudents = await StudentModel.find().select(
//     "name email unlockedLessons"
//   );

//   const result = await Promise.all(
//     allStudents.map(async (student: any) => {
//       // Get highest unlocked level
//       const unlockedLessons = await LessonModel.find({
//         _id: { $in: student.unlockedLessons || [] },
//       }).select("level");

//       const highestLevel = unlockedLessons.reduce(
//         (highest: string, lesson: any) => {
//           const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
//           const highestIdx = LEVEL_ORDER.indexOf(highest);
//           return lessonIdx > highestIdx ? lesson.level : highest;
//         },
//         "A0"
//       );

//       // Count completed lessons from bookings
//       const completedCount = await BookingModel.countDocuments({
//         studentId: student._id,
//         teacherJoined: true,
//       });

//       return {
//         _id: student._id,
//         name: student.name,
//         email: student.email,
//         unlockedLessons: student.unlockedLessons || [],
//         lessonsCompleted: completedCount,
//         currentLevel: highestLevel,
//       };
//     })
//   );

//   return result;
// };

const getAllStudents = async () => {
  const allStudents = await StudentModel.find().select(
    "name email unlockedLessons",
  );

  const result = await Promise.all(
    allStudents.map(async (student: any) => {
      const unlockedLessons = await LessonModel.find({
        _id: { $in: student.unlockedLessons || [] },
      }).select("level");

      const highestLevel = unlockedLessons.reduce(
        (highest: string, lesson: any) => {
          const lessonIdx = LEVEL_ORDER.indexOf(lesson.level);
          const highestIdx = LEVEL_ORDER.indexOf(highest);
          return lessonIdx > highestIdx ? lesson.level : highest;
        },
        "A0",
      );

      const lessonsCompleted = await BookingModel.countDocuments({
        studentId: student._id,
        teacherJoined: true,
      });

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        unlockedLessons: student.unlockedLessons || [],
        lessonsCompleted,
        currentLevel: highestLevel,
      };
    }),
  );

  return result;
};

// Teacher: toggle unlock/lock a lesson for a student
const unlockLesson = async (
  userId: string,
  studentId: string,
  lessonId: string,
) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const student = await StudentModel.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const lesson = await LessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError(httpStatus.NOT_FOUND, "Lesson not found");
  }

  const alreadyUnlocked = (student.unlockedLessons || [])
    .map((id: any) => id.toString())
    .includes(lessonId);

  const updatedStudent = await StudentModel.findByIdAndUpdate(
    studentId,
    alreadyUnlocked
      ? { $pull: { unlockedLessons: lessonId } }
      : { $addToSet: { unlockedLessons: lessonId } },
    { new: true },
  );

  return {
    unlockedLessons: updatedStudent?.unlockedLessons || [],
    action: alreadyUnlocked ? "locked" : "unlocked",
    lessonTitle: lesson.title,
  };
};

// Teacher: get all lessons with unlock status for a specific student
const getLessonsForStudent = async (userId: string, studentId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.teacher) {
    throw new AppError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  const student = await StudentModel.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const allLessons = await LessonModel.find().sort({ level: 1 });
  const unlockedIds = (student.unlockedLessons || []).map((id: any) =>
    id.toString(),
  );

  return allLessons.map((lesson) => ({
    _id: lesson._id,
    title: lesson.title,
    level: lesson.level,
    isLock: !unlockedIds.includes(lesson._id.toString()),
  }));
};

// Student: get all lessons — locked ones have content/exercises hidden
const getMyLessons = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const student = await StudentModel.findById(user.student);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, "Student not found");
  }

  const allLessons = await LessonModel.find().sort({ level: 1 });
  const unlockedIds = (student.unlockedLessons || []).map((id: any) =>
    id.toString(),
  );

  return allLessons.map((lesson) => {
    const isUnlocked = unlockedIds.includes(lesson._id.toString());
    return {
      _id: lesson._id,
      title: lesson.title,
      level: lesson.level,
      file: isUnlocked ? lesson.file : null,
      exercises: isUnlocked ? lesson.exercises : null,
      isLock: !isUnlocked,
    };
  });
};

export const NoteService = {
  createNote,
  getAllNotes,
  getNotesByStudent,
  getMyStudents,
  getAllStudents,
  unlockLesson,
  getLessonsForStudent,
  getMyLessons,
};
