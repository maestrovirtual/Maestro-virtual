import type { Course, Event, Prisma } from "@prisma/client";

export type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: {
    course: true;
    event: true;
  };
}>;

export type EnrolledCourseItem = {
  enrollmentId: string;
  enrolledAt: string;
  course: Course;
};

export type EnrolledEventItem = {
  enrollmentId: string;
  enrolledAt: string;
  event: Event;
};

