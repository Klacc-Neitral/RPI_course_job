import { AbstractComponent } from "../framework/view/abstract-component.js";

// ... (функция createUserInfoTemplate остается без изменений) ...
function createUserInfoTemplate(user) {
    return (
        `<section class="profile-details">
            <div class="profile-avatar">
                <h2>Аватар профиля</h2>
                <img src="${user.avatar}" alt="Аватар" class="avatar-image">
                <button class="btn btn-avatar">Выбрать аватар</button>
            </div>

            <form class="profile-form">
                <h2>Личные данные</h2>
                <div class="form-group">
                    <label>Логин</label>
                    <input type="text" value="${user.login}" disabled>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${user.email}" disabled>
                </div>
                <div class="form-group">
                    <label>Имя</label>
                    <input type="text" value="${user.name}" disabled>
                </div>
                <div class="form-group">
                    <label>Фамилия</label>
                    <input type="text" value="${user.surname}" disabled>
                </div>
                <button type="button" class="btn btn-save" id="openModalBtn">Изменить</button>
            </form>
        </section>`
    );
}

export default class UserInfoView extends AbstractComponent {
    #user = null;
    // ВАЖНО: Добавляем это
    _callback = {};

    constructor(user) {
        super();
        this.#user = user;
    }

    get template() {
        return createUserInfoTemplate(this.#user);
    }

    setEditClickHandler(callback) {
        this._callback.editClick = callback;
        this.element.querySelector('#openModalBtn').addEventListener('click', (evt) => {
            evt.preventDefault();
            this._callback.editClick();
        });
    }
}