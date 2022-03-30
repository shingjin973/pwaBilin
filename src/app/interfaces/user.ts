export interface User {
    _id?: string;
    uid?: string;
    email?: string;
    name?: string;
    phone?: string;
    phoneVerified?: boolean;
    password?: string;
    date?: Date;
    type?: UserType;
    auto_id?: number;
    balance?: number;
    wechat?: string;
    facebook?: string;
    classin?: string;
    profile_picture?: string;
    free_balance?:number;
    promotor?:boolean;
    promotorRate?:number;
    promoter_id?:number;
}

export interface Teacher extends User {
    introduction?: string;
    introduction_ch?: string;
    courses_offering?: number;
    status?: TeacherStatus;
    zoomId?: string;
    resume?: string;
    school?: string;
}

export interface Student extends User {
    children?: Kid[];
};

export interface Kid {
    _id?: string;
    name?: string;
    age?: number;
}

export enum UserType {
    Teacher = 1,
    Student = 2,
    UnApprovedTeacher = 3,
    SchoolAdmin = 4,
    SuperAdmin = 5
}

export enum StudentGroupSize {
    Private = 1,
    Group = 2
}

export enum TeacherStatus {
    Bronze = 1,
    Silver = 2,
    Gold = 3
}
