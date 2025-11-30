import { MY_COURSES, ALL_COURSES } from "../mock/courses.js";
import { COURSE_CONTENTS } from "../mock/course-content.js"; 

export default class CoursesModel {
    #myCourses = [...MY_COURSES];
    #allCourses = [...ALL_COURSES];
    #courseContents = COURSE_CONTENTS; 

    getMyCourses() {
        return this.#myCourses;
    }

    getAllCourses() {
        return this.#allCourses;
    }


    getCourseContent(courseTitle) {

        return this.#courseContents[courseTitle] || this.#courseContents['default'];
    }

    removeCourse(courseTitle) {
        this.#myCourses = this.#myCourses.filter(course => course.title !== courseTitle);
    }

    enrollCourse(courseTitle) {
        const courseToEnroll = this.#allCourses.find(c => c.title === courseTitle);
        if (courseToEnroll) {
            const isAlreadyEnrolled = this.#myCourses.some(c => c.title === courseTitle);
            if (!isAlreadyEnrolled) {
                const newMyCourse = {
                    title: courseToEnroll.title,
                    percent: 0,
                    img: "./img/Rectangle 42.png",
                    action: "Начать"
                };
                this.#myCourses.push(newMyCourse);
            }
        }
    }

    updateCourseProgress(courseTitle, newPercent) {
        const course = this.#myCourses.find(c => c.title === courseTitle);
        if (course) {
            course.percent = newPercent;
            if (newPercent === 100) {
                 course.action = 'Завершено';
            } else if (newPercent > 0) {
                 course.action = 'Продолжить';
            } else {
                 course.action = 'Начать';
            }
        }
    }
}