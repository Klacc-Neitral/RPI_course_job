export default class CoursesModel {
    #apiService = null;
    #courses = []; 
    #materials = []; // Здесь будем хранить все страницы всех курсов

    constructor(apiService) {
        this.#apiService = apiService;
    }

    async init() {
        try {
            // Скачиваем параллельно и курсы, и материалы
            const [courses, materials] = await Promise.all([
                this.#apiService.courses,
                this.#apiService.materials
            ]);

            this.#courses = courses;
            this.#materials = materials;
            
        } catch(err) {
            this.#courses = [];
            this.#materials = [];
            console.error('Ошибка загрузки данных:', err);
        }
    }

    getMyCourses() {
        return this.#courses.filter(course => course.isEnrolled === true);
    }

    getAllCourses() {
        return this.#courses.filter(course => course.isEnrolled === false);
    }

    // ИЗМЕНЕНО: Собираем контент для конкретного курса
    getCourseContent(courseTitle) {
        // Фильтруем массив материалов. 
        // Ищем те записи, где course_name совпадает с названием текущего курса
        const content = this.#materials.filter(item => item.course_name === courseTitle);

        // Сортируем по номеру страницы (чтобы 1 шла перед 2)
        content.sort((a, b) => a.pageNumber - b.pageNumber);

        if (content.length > 0) {
            return content;
        } else {
            return [{
                pageTitle: "Нет материалов", 
                text: "Материалы для этого курса еще не добавлены.", 
                pageNumber: 1
            }];
        }
    }

    // Остальные методы (enroll, remove, update) остаются без изменений, 
    // так как они работают только с массивом COURSES
    async enrollCourse(courseTitle) {
        const course = this.#courses.find(c => c.title === courseTitle);
        if (course) {
            course.isEnrolled = true;
            course.percent = 0; 
            course.action = "Начать";
            try { await this.#apiService.updateCourse(course); } catch (err) {}
        }
    }

    async removeCourse(courseTitle) {
        const course = this.#courses.find(c => c.title === courseTitle);
        if (course) {
            course.isEnrolled = false;
            course.percent = 0;
            try { await this.#apiService.updateCourse(course); } catch (err) {}
        }
    }

    async updateCourseProgress(courseTitle, newPercent) {
        const course = this.#courses.find(c => c.title === courseTitle);
        if (course) {
            course.percent = newPercent;
            if (newPercent === 100) course.action = 'Завершено';
            else if (newPercent > 0) course.action = 'Продолжить';
            else course.action = 'Начать';
            try { await this.#apiService.updateCourse(course); } catch (err) {}
        }
    }
}