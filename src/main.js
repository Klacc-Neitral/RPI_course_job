import ProfilePresenter from "./presenter/profile-presenter.js";
import CoursesModel from "./model/courses-model.js";
import UserModel from "./model/user-model.js";

const bodyElement = document.querySelector('body');

const coursesModel = new CoursesModel();
const userModel = new UserModel();

const profilePresenter = new ProfilePresenter(bodyElement, coursesModel, userModel);

profilePresenter.init();