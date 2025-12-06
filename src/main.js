import ProfilePresenter from "./presenter/profile-presenter.js";
import CoursesModel from "./model/courses-model.js";
import UserModel from "./model/user-model.js";
import ApiService from "./framework/api-service.js";


const END_POINT = 'https://692db100e5f67cd80a4c92ec.mockapi.io';


const bodyElement = document.querySelector('body');

// Создаем сервис API
const apiService = new ApiService(END_POINT);

// Передаем API сервис в модель
const coursesModel = new CoursesModel(apiService);
const userModel = new UserModel();

const profilePresenter = new ProfilePresenter(bodyElement, coursesModel, userModel);


coursesModel.init()
    .then(() => {
        profilePresenter.init();
    });