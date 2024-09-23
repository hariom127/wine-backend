declare namespace UserInterface {

    export interface IUser {
        firstName: string;
        lastName: string;
        email: string;
        countryCode: string;
        mobile: string;
        password: string;
        gender: string;
        profileImg?: string;
        city: string;
        state: string;
        pincode: string;
    }

    export interface IUserLogin {
        email: string;
        password: string;
    }
}