import { describe, expect, test } from "bun:test";
import { canAccessLesson } from "./product-access";

describe("canAccessLesson", () => {
	test("allows an explicitly free lesson in a paid course", () => {
		expect(
			canAccessLesson({ lessonIsFree: true, hasCourseAccess: false, courseIsFree: false }),
		).toBe(true);
	});

	test("allows purchased and free-course lessons", () => {
		expect(
			canAccessLesson({ lessonIsFree: false, hasCourseAccess: true, courseIsFree: false }),
		).toBe(true);
		expect(
			canAccessLesson({ lessonIsFree: false, hasCourseAccess: false, courseIsFree: true }),
		).toBe(true);
	});

	test("blocks a paid lesson without course access", () => {
		expect(
			canAccessLesson({ lessonIsFree: false, hasCourseAccess: false, courseIsFree: false }),
		).toBe(false);
	});
});
