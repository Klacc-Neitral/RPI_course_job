import { render, RenderPosition } from "../framework/render.js";
import HeaderView from "../view/header-view.js";
import FooterView from "../view/footer-view.js";
import ProfileContainerView from "../view/profile-container-view.js";
import TabNavigationView from "../view/tab-navigation-view.js";
import UserInfoView from "../view/user-info-view.js";
import MyCoursesContainerView from "../view/my-courses-container-view.js";
import MyCourseCardView from "../view/my-course-card-view.js";
import AllCoursesContainerView from "../view/all-courses-container-view.js";
import AllCourseCardView from "../view/all-course-card-view.js";
import EditModalView from "../view/edit-modal-view.js";
import FilterView from "../view/filter-view.js";
import SearchInputView from "../view/search-input-view.js";
import CourseContentPresenter from "./course-content-presenter.js";

export default class ProfilePresenter {
    #bodyContainer = null;
    #coursesModel = null;
    #userModel = null;

    #profileContainerComponent = new ProfileContainerView();
    #tabNavigationComponent = new TabNavigationView();
    #courseContentPresenter = null;
    
    // Компоненты "Мои курсы"
    #myCoursesContainerComponent = new MyCoursesContainerView();
    #filterComponent = null;

    // Компоненты "Все курсы"
    #allCoursesContainerComponent = new AllCoursesContainerView();
    #allCoursesSearchComponent = null; // Компонент поиска для всех курсов
    
    #userInfoComponent = null;
    #modalComponent = null;

    // Состояние
    #currentSearchQuery = ''; // Поиск в "Моих курсах"
    #allCoursesSearchQuery = ''; // Поиск во "Всех курсах"
    
    #currentFilters = {
        started: false,
        notStarted: false
    };

    constructor(bodyContainer, coursesModel, userModel) {
        this.#bodyContainer = bodyContainer;
        this.#coursesModel = coursesModel;
        this.#userModel = userModel;
    }

    init() {
        this.#renderHeader();
        this.#renderProfileLayout();
        this.#renderFooter();
    }

    #renderHeader() {
        render(new HeaderView(), this.#bodyContainer, RenderPosition.AFTERBEGIN);
    }

    #renderFooter() {
        render(new FooterView(), this.#bodyContainer, RenderPosition.BEFOREEND);
    }

    #renderProfileLayout() {
        render(this.#profileContainerComponent, this.#bodyContainer);

        const cardContainer = this.#profileContainerComponent.cardContainer;
        render(this.#tabNavigationComponent, cardContainer, RenderPosition.AFTERBEGIN);

        this.#tabNavigationComponent.setTabClickHandler((tabName) => {
            this.#switchTab(tabName);
        });

        // Инициализация поиска для "Моих курсов"
        this.#filterComponent = new FilterView();
        this.#filterComponent.setSearchInputHandler((query) => {
            this.#currentSearchQuery = query.toLowerCase();
            this.#renderMyCoursesList();
        });
        this.#filterComponent.setFilterChangeHandler((filters) => {
            this.#currentFilters = filters;
            this.#renderMyCoursesList();
        });

        // Инициализация поиска для "Всех курсов"
        this.#allCoursesSearchComponent = new SearchInputView();
        this.#allCoursesSearchComponent.setSearchHandler((query) => {
            this.#allCoursesSearchQuery = query.toLowerCase();
            this.#renderAllCoursesList(); // Перерисовываем список
        });

        this.#renderMyCoursesTab();
    }

    #clearContent() {
        this.#profileContainerComponent.contentContainer.innerHTML = '';
        this.#myCoursesContainerComponent.element.innerHTML = '';
        
        const allCoursesList = this.#allCoursesContainerComponent.getListContainer();
        if(allCoursesList) allCoursesList.innerHTML = '';
    }

    // --- МОИ КУРСЫ ---

    #renderMyCoursesTab() {
        this.#clearContent();
        const contentContainer = this.#profileContainerComponent.contentContainer;
        const user = this.#userModel.getUser();

        this.#userInfoComponent = new UserInfoView(user);
        this.#userInfoComponent.setEditClickHandler(() => this.#openModal());
        render(this.#userInfoComponent, contentContainer);

        render(this.#filterComponent, contentContainer);
        render(this.#myCoursesContainerComponent, contentContainer);
        
        this.#renderMyCoursesList();
    }

#renderMyCoursesList() {
    this.#myCoursesContainerComponent.element.innerHTML = '';
    let courses = this.#coursesModel.getMyCourses();

    if (this.#currentSearchQuery) {
        courses = courses.filter(course => 
            course.title.toLowerCase().includes(this.#currentSearchQuery)
        );
    }

    const { started, notStarted } = this.#currentFilters;
    if (started || notStarted) {
        courses = courses.filter(course => {
            const isStarted = course.percent > 0;
            const isNotStarted = course.percent === 0;
            if (started && isStarted) return true;
            if (notStarted && isNotStarted) return true;
            return false;
        });
    }

    if (courses.length === 0) {
        this.#myCoursesContainerComponent.element.innerHTML = 
            '<p style="color: white; padding: 20px; grid-column: 1/-1; text-align: center;">Курсы не найдены.</p>';
    } else {
        courses.forEach(course => {
            // !!! courseCard определена внутри цикла
            const courseCard = new MyCourseCardView(course); 
            
            // Обработчик удаления
            courseCard.setDeleteClickHandler((courseTitle) => {
                this.#handleDeleteCourse(courseTitle);
            });
            
            // !!! ИСПРАВЛЕНИЕ: Обработчик действия должен быть внутри цикла
            courseCard.setCourseActionClickHandler((courseData) => {
                this.#handleCourseAction(courseData);
            });
            
            render(courseCard, this.#myCoursesContainerComponent.element);
        }); 
        // Здесь нет кода, использующего courseCard
    }
}

    // --- ВСЕ КУРСЫ ---

    #renderAllCoursesTab() {
        this.#clearContent();
        const contentContainer = this.#profileContainerComponent.contentContainer;

        render(this.#allCoursesContainerComponent, contentContainer);
        

        const listContainer = this.#allCoursesContainerComponent.getListContainer();
  
        render(this.#allCoursesSearchComponent, listContainer, RenderPosition.BEFOREBEGIN);


        this.#renderAllCoursesList();
    }

    #renderAllCoursesList() {
        const listContainer = this.#allCoursesContainerComponent.getListContainer();
        listContainer.innerHTML = '';

        let allCourses = this.#coursesModel.getAllCourses();

      
        if (this.#allCoursesSearchQuery) {
            allCourses = allCourses.filter(course => 
                course.title.toLowerCase().includes(this.#allCoursesSearchQuery)
            );
        }

        if (allCourses.length === 0) {
            listContainer.innerHTML = '<p style="color: white; padding: 20px; text-align: center;">Ничего не найдено.</p>';
        } else {
            allCourses.forEach(course => {
                const courseCard = new AllCourseCardView(course);
                courseCard.setEnrollClickHandler((courseTitle) => {
                    this.#handleEnrollCourse(courseTitle);
                });
                render(courseCard, listContainer);
            });
        }
    }

   

    #switchTab(tabName) {
        if (tabName === 'my-courses') {
            this.#renderMyCoursesTab();
        } else if (tabName === 'all-courses') {
            this.#renderAllCoursesTab();
        }
    }

    #handleDeleteCourse(courseTitle) {
        this.#coursesModel.removeCourse(courseTitle);
        this.#renderMyCoursesList();
    }

    #handleEnrollCourse(courseTitle) {
        this.#coursesModel.enrollCourse(courseTitle);
    }

    #openModal() {
        const user = this.#userModel.getUser();
        this.#modalComponent = new EditModalView(user);
        this.#modalComponent.setCloseClickHandler(() => this.#closeModal());
        this.#modalComponent.setFormSubmitHandler(() => this.#closeModal());
        render(this.#modalComponent, this.#bodyContainer);
    }

    #closeModal() {
        this.#modalComponent.element.remove();
        this.#modalComponent.removeElement();
        this.#modalComponent = null;
    }
    #handleCourseAction(courseData) {
       
        this.#profileContainerComponent.element.style.display = 'none';

       
        this.#courseContentPresenter = new CourseContentPresenter(
            this.#bodyContainer,
            this.#coursesModel,
            courseData
        );
        
        
        this.#courseContentPresenter.init(this.#handleBackToProfile);
    }

    #handleBackToProfile = () => {
        this.#profileContainerComponent.element.style.display = 'block';

        this.#courseContentPresenter = null;

        this.#renderMyCoursesList();
    };
}