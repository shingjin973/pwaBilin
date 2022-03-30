import { DataService } from "../../../../../services/data.service";
import { BreadCrumb } from "../../../../../interfaces/main";
import { ReviewType } from "../../../../../interfaces/enums";
import { AuthService } from "../../../../../services/auth.service";
import { Student } from "../../../../../interfaces/user";
import { ActivatedRoute, Router } from "@angular/router";
import { Bundle, Lesson } from "../../../../../interfaces/course";
import { Component, OnInit } from "@angular/core";
import { Teacher } from "src/app/interfaces/user";
import { BehaviorSubject } from "rxjs";

import * as _ from "lodash";

enum Tabs {
  Lessons = 1,
  Reviews = 2,
}

@Component({
  templateUrl: "./teacher.component.html",
  styleUrls: ["./teacher.component.scss"],
})
export class TeacherComponent implements OnInit {
  Tabs = Tabs;
  ReviewType = ReviewType;

  lessons: any;
  bundles: Bundle[];

  currentTab = Tabs.Lessons;

  teacher: Teacher;
  user: Student;

  breadcrumbs: BreadCrumb[] = [
    {
      link: "Home",
      url: ["/"],
    },
    {
      link: "Teachers",
      url: ["/teachers"],
    },
  ];

  canLeaveReviewSubject = new BehaviorSubject(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private data: DataService
  ) {}

  getNumberOfSessions = () =>
    this.lessons && this.lessons.length
      ? _.reduce(
          this.lessons,
          (sum, v: Lesson) => (sum += v.sessions.length),
          0
        )
      : 0;

  ngOnInit() {
    this.route.params.subscribe(async (p) => {
      if (p.teacherid) {
        this.user = (await this.auth.getUser()) as Student;
        this.getData(p.teacherid);
      } else {
        this.router.navigate(["/teachers"]);
      }
    });
  }

  getData(teacherid: string) {
    this.data.getUser(teacherid).subscribe((res) => {
      if (res && res.data) {
        this.teacher = res.data;

        this.getLessons();
        this.getPresales();

        this.canLeaveReview();

        this.breadcrumbs.length = 2;
        this.breadcrumbs.push({
          link: this.teacher.name,
        });
      }
    });
  }

  getLessons() {
    this.data
      .getLessons(undefined, {
        teacher_id: this.teacher._id,
      })
      .subscribe((res) => {
        if (res && res.data) {
          this.lessons = []; 
          res.data.forEach((course_ele) => {
            course_ele.startTime = "";
            let upcoming_sessions = course_ele.sessions.filter((item) => {
              //get the upcomming sessions
              return item.state == 1;
            });
            if (upcoming_sessions.length > 0) {
              let upcoming_sessions_sorted = upcoming_sessions.sort(function (a,b) {
                return  +new Date(a.startTime) - +new Date(b.startTime);
              });
              course_ele.startTime = upcoming_sessions_sorted[0].startTime; // get first upcomming session's start time
              this.lessons.push(course_ele);
            }
          });      
        }
      });
  }
  getPresales() {
    this.data
      .getBundles(undefined, {
        teacher_id: this.teacher._id,
      })
      .subscribe((res) => {
        if (res && res.data) {
          this.bundles = res.data.filter((item) => {
            return item.max_students_per_session > 0;
          });
        }
      });
  }
  /**
   * Functions checks if user is allowed to leave a review
   */
  canLeaveReviewObservable = () => this.canLeaveReviewSubject.asObservable();

  async canLeaveReview() {
    if (!this.user) {
      this.canLeaveReviewSubject.next(false);
      return;
    }

    this.data
      .getReviews({ from: this.user._id, to: this.user._id })
      .subscribe((res) => {
        if (res && res.data) {
          this.canLeaveReviewSubject.next(!res.data.length);
        }
      });
  }
}
