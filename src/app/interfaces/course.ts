import {State} from './enums';
import {User, Student, Teacher} from './user';

export interface Course {
    _id?: string;
    state?: State;
    topic?: string;
    topic_ch?: string;
    description?: string;
    description_ch?: string;    
    default_sessions?: string[];    
    min_age?: number;
    max_age?: number;
    language?: string;
    language_skill?: number;
    skill?: string;
    skill_level?: number;     
    auto_id?: number;
    category?: string;
    thumbnail?: string;
    school_id?: string;
    material?: string;
    provider?: 'zoom' | 'classin';
    promoter_picture?:string;
}

export interface Lesson {
    _id?: string;
    subtitle?: string;
    subtitle_ch?: string;
    state?: State;
    sessions?: Session[];
    credits_per_session?: number;   
    teacher_id?: string;
    teacher?: User;
    course_id?: string;
    course?: Course;
    auto_id?: number;
    students_enrolled?: number;
    show_on_front?:Boolean;
    session_duration?: string;
    total_sessions?: number;
    max_students?: number;
}

export interface Bundle {
    _id?: string;
    teacher_id?: string;
    teacher?: User;
    course_id?: string;
    course?: Course;
    auto_id?: number;
    bundle_title?: string;
    bundle_title_ch?: string;
    number_of_sessions?: number;
    session_length?: string;
    min_students_per_session?: number;
    max_students_per_session?: number;
    tuition?: number;
    date_time?: any;
    number_of_bundles?: number;
    cancel_policy?: string;
    is_feature?: boolean;
}

export interface Enrollment {
    _id?: string;
    student?: string | Student;
    student_family?: string;
    teacher?: string | Teacher;
    course?: string | Course;
    lesson?: string | Lesson;
    session?: string | Session;
    session_auto_id?: number;
    date?: Date;
    state?: State;
    auto_id?: number;

    student_family_name?: string;
    student_name?: string;
    teacher_name?: string;
    course_name?: string;
}
export interface BundleEnrollment {
    _id?: string;
    student?: string | Student;
    student_family?: string;
    teacher?: string | Teacher;
    course?: string | Course;
    bundle?: string | Bundle;
    date?: Date;
    state?: State;
    auto_id?: number;

    student_family_name?: string;
    student_name?: string;
    teacher_name?: string;
    course_name?: string;
}
export interface Session {
    _id?: string;
    auto_id?: number;
    state?: State;
    zoomUrl?: string;
    zoomId?: string;
    zoomPassword?: string;
    notes?: string;
    startTime?: Date | string;
    endTime?: Date | string;
    attendees?: number;
    subject?: string;
    subject_ch?: string;
    materials?: Material[];
}

export interface Material {
    _id?: string;
    auto_id?: number;
    url?: string;
    description?: string;
    date?: Date;

    shareable?: boolean;
    uploaded_by?: string | User;
}

export interface Drawing {
    _id?: string;
    auto_id?: number;
    url?: string;
    description?: string;
    author?: string;
    date?: Date;

    course_id?: string;
    lesson_id?: string;
    session_id?: string;
    uploaded_by?: string;
}

export interface DrawingComment {
    _id?: string;
    name?: string;
    message?: string;
    date?: Date;
}
