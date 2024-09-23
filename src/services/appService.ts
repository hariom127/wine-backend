import { AppConstant } from "../constant";

export class AppService {
    /**
     * static function is function which no need to call throw an instace of class
     * we can call it directly ex. Password.toHash()
     * */

    static capitalizeFirstLetter(string: string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    static escapeSpecialCharacter(str: string) {
        return str.replace(AppConstant.REGEX.SEARCH, "\\$&");
    };
}
