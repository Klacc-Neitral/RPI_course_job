import { USER_DATA } from "../mock/user.js";

export default class UserModel {
    #user = USER_DATA;

    getUser() {
        return this.#user;
    }
}