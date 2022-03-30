import { DataService } from "../../../../../services/data.service";
import { BreadCrumb } from "../../../../../interfaces/main";
import { ReviewType } from "../../../../../interfaces/enums";
import { AuthService } from "../../../../../services/auth.service";
import { Student, Kid } from "../../../../../interfaces/user";
import { Lesson, Enrollment, Session } from "../../../../../interfaces/course";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import * as _ from "lodash";
import swal from "sweetalert2";
import { BehaviorSubject, Observable } from "rxjs";
import { State } from "src/app/interfaces/enums";
import { environment } from "../../../../../../environments/environment";
import QrCodeWithLogo from "qrcode-with-logos";
import mergeImages from "merge-images";
import { TestBed } from "@angular/core/testing";
import { HttpClient, HttpClientJsonpModule } from "@angular/common/http";

enum Tabs {
  Upcoming = 1,
  Completed = 2,
}

@Component({
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.scss"],
})
export class CourseComponent implements OnInit {
  // @Output("parentFun") parentFun: EventEmitter<any> = new EventEmitter();

  State = State;
  isSchoolAdmin$: Observable<any>;
  isTeacher = false;
  isLoadingEnrollAll = false;
  isCancelingEnrollments = false;
  enrollments_ids_to_cancel = [];
  Tabs = Tabs;
  ReviewType = ReviewType;
  canLeaveReviewSubject = new BehaviorSubject(false);
  lesson: Lesson;
  upcoming_counter = 0;
  completed_counter = 0;
  upcoming_sessions_to_show = [];
  completed_sessions_to_show = [];
  upcoming_sessions: any[];
  completed_sessions: any[];
  relatedLessons: Lesson[];
  attendees: any;
  enrollments: any[];
  myEnrollments: any[];
  currentTab = Tabs.Upcoming;
  user: Student;
  breadcrumbs: BreadCrumb[] = [
    {
      link: "Home",
      url: ["/"],
    },
    {
      link: "Courses",
      url: ["/courses"],
    },
  ];
  us_link: string;
  china_link: string;
  courseId: string;
  lessonId: string;
  showmodal = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService,
    private data: DataService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.isSchoolAdmin$ = this.auth.isSchoolAdmin();
    this.route.params.subscribe(async (p) => {
      if (p.courseid && p.lessonid) {
        this.courseId = p.courseid;
        this.lessonId = p.lessonid;
        await this.getData(p.courseid, p.lessonid);
        this.user = (await this.auth.getUser()) as Student;
      } else {
        this.router.navigate(["/courses"]);
      }
    });
  }
  downUs() {
    const that = this;
    this.us_link =
      "https://bilin.academy/en/authentication/signup?promoterId=" +
      this.user.promoter_id +
      "?courseId=" +
      this.courseId +
      "?lessonId=" +
      this.lessonId;
    let qrcode_us = new QrCodeWithLogo({
      content: this.us_link,
      width: 161,
      image: document.getElementById("us_image") as HTMLImageElement,
      logo: {
        src: "assets/img/logo.png",
        logoSize: 0.2,
        logoRadius: 3,
        borderRadius: 3,
        borderColor: "#289c00",
      },
      nodeQrCodeOptions: {
        margin: 0,
        color: {
          dark: "#289c00",
          light: "#ffffff",
        },
      },
    });
    qrcode_us.toImage();
    setTimeout(() => {
      var QRImage = document.getElementById("us_image") as HTMLImageElement;
      var backGroundImage = document.getElementById(
        "haibao"
      ) as HTMLImageElement;
      this.getBase64ImageFromUrl(
        backGroundImage.src,
        function (backGroundbase64Image) {
          mergeImages([
            { src: backGroundbase64Image, x: 0, y: 0 },
            { src: QRImage.src, x: 30, y: 961 },
          ]).then((res) => {
            const blobData = that.convertBase64ToBlobData(res.replace('data:image/png;base64,', ''));
            const a = document.createElement('a');
            const blob = new Blob([blobData], { type: 'jpg/png' });
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = 'promoteUS.png';
            a.click();
          });
        }
      );
    }, 1000);
  }
  downCn() {
    const that = this;
    this.china_link =
      "https://www.bilinacademy.cn/ch/authentication/signup?promoterId=" +
      this.user.promoter_id +
      "?courseId=" +
      this.courseId +
      "?lessonId=" +
      this.lessonId;
    let qrcode_cn = new QrCodeWithLogo({
      content: this.china_link,
      width: 161,
      image: document.getElementById("ch_image") as HTMLImageElement,
      logo: {
        src: "assets/img/logo.png",
        logoSize: 0.2,
        logoRadius: 3,
        borderRadius: 3,
        borderColor: "#289c00",
      },
      nodeQrCodeOptions: {
        margin: 0,
        color: {
          dark: "#289c00",
          light: "#ffffff",
        },
      },
    });
    qrcode_cn.toImage();
    setTimeout(() => {
      var QRImage = document.getElementById("ch_image") as HTMLImageElement;
      var backGroundImage = document.getElementById(
        "haibao"
      ) as HTMLImageElement;
      this.getBase64ImageFromUrl(
        backGroundImage.src,
        function (backGroundbase64Image) {
          mergeImages([
            { src: backGroundbase64Image, x: 0, y: 0 },
            { src: QRImage.src, x: 30, y: 961 },
          ]).then((res) => {
            const blobData = that.convertBase64ToBlobData(res.replace('data:image/png;base64,', ''));
            const a = document.createElement('a');
            const blob = new Blob([blobData], { type: 'jpg/png' });
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = 'promoteCN.png';
            a.click();
          });
        }
      );
    }, 1000);
  }
  closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
  }
  convertBase64ToBlobData(base64Data: string, contentType: string = 'image/png', sliceSize = 512) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  showUs() {
    this.us_link =
      "https://bilin.academy/en/authentication/signup?promoterId=" +
      // "http://test.bilin.academy/en/authentication/signup?promoterId=" +
      // "http://localhost:4200/authentication/signup?promoterId=" +
      this.user.promoter_id +
      "&courseId=" +
      this.courseId +
      "&lessonId=" +
      this.lessonId;
    let qrcode_us = new QrCodeWithLogo({
      content: this.us_link,
      width: 161,
      image: document.getElementById("us_image") as HTMLImageElement,
      logo: {
        src: "assets/img/logo.png",
        logoSize: 0.2,
        logoRadius: 3,
        borderRadius: 3,
        borderColor: "#289c00",
      },
      nodeQrCodeOptions: {
        margin: 0,
        color: {
          dark: "#289c00",
          light: "#ffffff",
        },
      },
    });
    qrcode_us.toImage();
    setTimeout(() => {
      var QRImage = document.getElementById("us_image") as HTMLImageElement;
      var promoteImage = document.getElementById(
        "promoteImage"
      ) as HTMLImageElement;
      var backGroundImage = document.getElementById(
        "haibao"
      ) as HTMLImageElement;
      this.getBase64ImageFromUrl(
        backGroundImage.src,
        function (backGroundbase64Image) {
          mergeImages([
            { src: backGroundbase64Image, x: 0, y: 0 },
            { src: QRImage.src, x: 30, y: 961 },
          ]).then((res) => {
            promoteImage.src = res;
            var modal = document.getElementById("myModal");
            modal.style.display = "block";

          });
        }
      );
    }, 1000);
  }
  showCn() {
    this.china_link =
      "https://www.bilinacademy.cn/ch/authentication/signup?promoterId=" +
      this.user.promoter_id +
      "?courseId=" +
      this.courseId +
      "?lessonId=" +
      this.lessonId;
    let qrcode_cn = new QrCodeWithLogo({
      content: this.china_link,
      width: 161,
      image: document.getElementById("ch_image") as HTMLImageElement,
      logo: {
        src: "assets/img/logo.png",
        logoSize: 0.2,
        logoRadius: 3,
        borderRadius: 3,
        borderColor: "#289c00",
      },
      nodeQrCodeOptions: {
        margin: 0,
        color: {
          dark: "#289c00",
          light: "#ffffff",
        },
      },
    });
    qrcode_cn.toImage();
    // test(ee){
    //   console.log('xxxxxxxx')
    // }
    setTimeout(() => {
      var QRImage = document.getElementById("ch_image") as HTMLImageElement;
      var promoteImage = document.getElementById(
        "promoteImage"
      ) as HTMLImageElement;
      var backGroundImage = document.getElementById(
        "haibao"
      ) as HTMLImageElement;
      this.getBase64ImageFromUrl(
        backGroundImage.src,
        function (backGroundbase64Image) {
          mergeImages([
            { src: backGroundbase64Image, x: 0, y: 0 },
            { src: QRImage.src, x: 30, y: 961 },
          ]).then((res) => {
            promoteImage.src = res;
            var modal = document.getElementById("myModal");
            modal.style.display = "block";
          });
        }
      );
    }, 1000);
  }
  // getBase64ImageFromUrl(url, callback) {
  //   let params={}
  //   this.http.get(url).subscribe(data=>{
  //     console.log(data);
  //   })
  //   return;
  //   var xhr = new XMLHttpRequest();
  //   xhr.onload = function () {
  //     var reader = new FileReader();
  //     reader.onloadend = function () {
  //       callback(reader.result);
  //     };
  //     reader.readAsDataURL(xhr.response);
  //   };
  //   xhr.open("GET", url, true);
  //   xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  //   xhr.responseType = "blob";
  //   xhr.send();
  // }
  getBase64ImageFromUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.responseType = "blob";
    xhr.send();
  }

  showMoreDataUpcoming() {
    for (
      let i = this.upcoming_counter;
      i < this.upcoming_sessions.length;
      i++
    ) {
      this.upcoming_sessions_to_show.push(this.upcoming_sessions[i]);
      this.upcoming_counter++;
      if (this.upcoming_counter % 5 == 0) break;
    }
  }

  lessDataUpcoming() {
    this.upcoming_counter = 0;
    this.upcoming_sessions_to_show = [];
    this.showMoreDataUpcoming();
  }

  showMoreDataCompleted() {
    for (
      let i = this.completed_counter;
      i < this.completed_sessions.length;
      i++
    ) {
      this.completed_sessions_to_show.push(this.completed_sessions[i]);
      this.completed_counter++;
      if (this.completed_counter % 5 == 0) break;
    }
  }

  lessDataCompleted() {
    this.completed_counter = 0;
    this.completed_sessions_to_show = [];
    this.showMoreDataCompleted();
  }

  async getData(courseid: string, lessonid: string) {
    this.data.getLesson(courseid, lessonid).subscribe((res) => {
      if (res && res.data) {
        this.lesson = res.data;
        this.breadcrumbs.length = 2;
        this.breadcrumbs.push({
          link: this.lesson.course.topic,
        });

        this.upcoming_sessions = _.filter(
          this.lesson.sessions,
          (v) => v.state === State.Active
        );
        this.upcoming_sessions.sort(
          (a, b) => <any>new Date(a.startTime) - <any>new Date(b.startTime)
        );
        this.completed_sessions = _.filter(
          this.lesson.sessions,
          (v) => v.state === State.Completed
        );
        this.completed_sessions.sort(
          (a, b) => <any>new Date(a.startTime) - <any>new Date(b.startTime)
        );

        this.isTeacher = this.user && this.lesson.teacher_id === this.user._id;
        this.getRelatedLessons();
        this.getEnrollments();
        this.canLeaveReview();
        this.showMoreDataUpcoming();
        this.showMoreDataCompleted();

        this.upcoming_sessions.forEach((session) => {
          var options = {
            timeZoneName: "long",
          };
          var jan = new Date(0, 1);
          var jul = new Date(6, 1);

          if (environment.locale === "zh") {
            var timezone_to_start_session = new Date(
              session.startTime
            ).toLocaleDateString("zh-CN", options);
            var comma_separated_date = timezone_to_start_session.split(" ");
          } else {
            var timezone_to_start_session = new Date(
              session.startTime
            ).toLocaleDateString("en-US", options);
            var comma_separated_date = timezone_to_start_session.split(", ");
          }
          session.timezone_to_start_session = comma_separated_date[1];
        });

        this.completed_sessions.forEach((session) => {
          var options = {
            timeZoneName: "long",
          };
          if (environment.locale === "zh") {
            var timezone_to_start_session = new Date(
              session.startTime
            ).toLocaleDateString("zh-CN", options);
            var comma_separated_date = timezone_to_start_session.split(" ");
          } else {
            var timezone_to_start_session = new Date(
              session.startTime
            ).toLocaleDateString("en-US", options);
            var comma_separated_date = timezone_to_start_session.split(", ");
          }
          session.timezone_to_start_session = comma_separated_date[1];

        });
      }
    });
  }

  getEnrollments() {
    this.data
      .getEnrollments({
        course: this.lesson.course_id,
        lesson: this.lesson._id,
        teacher: this.lesson.teacher_id,
      })
      .subscribe((res) => {
        if (res && res.data) {
          const data = _.filter(res.data, (v) => v.state !== State.Canceled);
          this.attendees = {};

          for (let i of _.map(this.lesson.sessions, (v) => v._id)) {
            Object.defineProperty(this.attendees, i, {
              writable: true,
              enumerable: true,
              value: 0,
            });
          }
          for (let i of data) {
            this.attendees[i.session] += 1;
          }

          this.enrollments = data;
          // this.myEnrollments = this.user ? _.map(_.filter(data, (i) => this.user && i.student_family === this.user._id), (v) => v.session) : [];
          this.myEnrollments = this.user
            ? _.map(
              _.filter(
                data,
                (i) => this.user && i.student_family === this.user._id
              )
            )
            : [];
        }
      });
  }

  checkEnrollmentsHasSession(session_id) {
    let index = this.myEnrollments.findIndex((x) => x.session === session_id);
    return index;
  }

  getEnrollmentIDOfSession(session_id) {
    // let enrollment = _.filter(this.myEnrollments, (i) => i.session === session_id);
    let enrollment_id = _.map(
      _.filter(this.myEnrollments, (i) => i.session === session_id),
      (v) => v._id
    );
    if (enrollment_id) {
      return enrollment_id;
    } else {
      return "";
    }
  }

  async getRelatedLessons() {
    this.data
      .getLessons("", {
        limit: 3,
      })
      .subscribe((res) => {
        if (res && res.data) {
          res.data.forEach((course_ele) => {
            var upcoming_sessions = course_ele.sessions.filter((item) => {
              return item.state == State.Active;
            });
            var upcoming_sessions_sorted = upcoming_sessions.sort(
              (a, b) => <any>new Date(a.startTime) - <any>new Date(b.startTime)
            );
            course_ele.next_on_session = upcoming_sessions_sorted[0];
          });
          this.relatedLessons = res.data;
        }
      });
  }

  async cancelEnrollments() {
    swal
      .fire({
        title: "Are you sure to cancel?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      })
      .then((result) => {
        if (result.value) {
          this.isCancelingEnrollments = true;
          this.data
            .cancelEnrollments({
              ids: this.enrollments_ids_to_cancel,
            })
            .subscribe((res) => {
              if (res && res.status == 200) {
                // this.toastr.success(res.message);
                this.enrollments_ids_to_cancel = [];
                this.isCancelingEnrollments = false;
                this.getData(this.lesson.course_id, this.lesson._id);
              } else {
                this.isCancelingEnrollments = false;
              }
            });
        }
      });
  }

  async addEnrollmentToCancel(e, enrollment_id) {

    if (e.target.checked) {
      // if enrollments_ids_to_cancel doesn't include enrollment_id
      if (this.enrollments_ids_to_cancel.indexOf(enrollment_id) === -1) {
        this.enrollments_ids_to_cancel.push(enrollment_id);
      }
    } else {
      const index: number =
        this.enrollments_ids_to_cancel.indexOf(enrollment_id);
      this.enrollments_ids_to_cancel.splice(index, 1);
    }
  }

  async enrollAll() {
    try {
      if (!this.user) {
        this.router.navigate(["/authentication/signin"], {
          queryParams: {
            redirect_url: this.route.snapshot.url.join("%2F"),
          },
        });
        return;
      }

      const inputOptions = {};

      for (let i of this.user.children) {
        Object.defineProperty(inputOptions, i._id, {
          value: `${i.name} - ${i.age}`,
          writable: true,
          enumerable: true,
        });
      }

      if (!_.size(inputOptions)) {
        throw Error("Something went wrong.");
      }

      const { value: studentId, dismiss } = await swal.fire({
        title: "Enrolling",
        text: "Please select children to enroll.",
        input: "select",
        inputOptions: inputOptions,
        inputPlaceholder: "Select children",
        showCancelButton: true,
        inputValidator: (value) => {
          return value ? "" : "You need to select something.";
        },
      });

      if (!studentId || dismiss) {
        return;
      }
      // get session Ids the student enrolled before
      const studentsSessions = _.map(
        _.filter(this.enrollments, (v) => v.student === studentId),
        (v) => v.session
      );
      // get the session Ids the student not enrolled yet
      const sessionsToEnroll = _.filter(
        _.map(this.upcoming_sessions, (v) => v._id),
        (v) => _.indexOf(studentsSessions, v) === -1
      );

      if (sessionsToEnroll.length === 0) {
        swal.fire(
          "Oops..",
          "Student's currently enrolled to all sessions",
          "error"
        );
        return;
      }

      if (this.user.phoneVerified === false) {
        swal
          .fire({
            type: "error",
            title: "Oops",
            text: "Please verify your phone number first.",
            confirmButtonText: "Verify",
            showCancelButton: true,
          })
          .then(({ value }) => {
            if (value) {
              this.router.navigate(["/profile"], {
                queryParams: { verifyMobile: true },
              });
            }
          });

        return;
      }


      if (
        typeof this.user.balance !== "number" ||
        this.user.balance <
        this.lesson.credits_per_session * sessionsToEnroll.length
      ) {
        swal
          .fire({
            type: "info",
            title: "Oops",
            text: "You don't have enough credits. Do you want to buy more credits?",
            showCancelButton: true,
            confirmButtonText: "Buy more",
          })
          .then(({ value }) => {
            if (value) {
              this.router.navigate(["/profile/balance"]);
            }
          });
        return;
      }

      this.isLoadingEnrollAll = true;

      await this.data
        .addEnrollments({
          student: [studentId],
          student_family: this.user._id,
          course: this.lesson.course_id,
          lesson: this.lesson._id,
          session: sessionsToEnroll,
          teacher_name: this.lesson.teacher.name,
        })
        .toPromise();

      await swal.fire(
        `Great!`,
        `Student has been enrolled to ${sessionsToEnroll.length} sessions.`,
        "success"
      );

      this.getData(this.lesson.course_id, this.lesson._id);
    } catch ({ message }) {
      this.toastr.error(message);
    } finally {
      this.isLoadingEnrollAll = false;
    }
  }

  async enroll(session_id: string) {
    try {
      const { min_age, max_age } = this.lesson.course;
      if (!this.user) {
        this.router.navigate(["/authentication/signin"], {
          queryParams: {
            redirect_url: this.route.snapshot.url.join("%2F"),
          },
        });
        return;
      }

      if (this.user.phoneVerified === false) {
        swal
          .fire({
            type: "error",
            title: "Oops",
            text: "Please verify your phone number first.",
            confirmButtonText: "Verify",
            showCancelButton: true,
          })
          .then(({ value }) => {
            if (value) {
              this.router.navigate(["/profile"], {
                queryParams: { verifyMobile: true },
              });
            }
          });

        return;
      }
      let user_balance = 0;
      if (this.user.balance) {
        user_balance = this.user.balance;
      }

      if (user_balance < this.lesson.credits_per_session) {
        swal
          .fire({
            type: "info",
            title: "Oops",
            text: "You don't have enough credits. Do you want to buy more credits?",
            showCancelButton: true,
            confirmButtonText: "Buy more",
          })
          .then(({ value }) => {
            if (value) {
              this.router.navigateByUrl("/profile/balance");
            }
          });
        return;
      }

      if (this.user.children.length === 0) {
        swal
          .fire({
            title: "",
            text: "Add a child/participant to jon the class",
            confirmButtonText: "Ok",
            showCancelButton: true,
          })
          .then(({ value }) => {
            if (value) {
              swal
                .mixin({
                  input: "text",
                  confirmButtonText: "Next &rarr;",
                  showCancelButton: true,
                  progressSteps: ["1", "2"],
                })
                .queue([
                  {
                    title: "Child name",
                    text: "Please enter child's name",
                    inputValidator: (v) => {
                      if (!v) {
                        return "Please enter child's name";
                      }
                    },
                  },
                  {
                    title: "Child age",
                    text: "Please enter child's age",
                    confirmButtonText: "Submit",
                    inputValidator: (v) => {
                      if (
                        !(
                          !Number.isNaN(parseInt(v)) &&
                          parseInt(v) >= 1 &&
                          parseInt(v) <= 100
                        )
                      ) {
                        return "Please enter correct age";
                      }
                    },
                    preConfirm: (v) => parseInt(v),
                  },
                ])
                .then(({ value }) => {
                  if (value && value.length === 2) {
                    if (!(value[1] >= min_age && value[1] <= max_age)) {
                      swal.fire(
                        "Oops..",
                        `Child's age is not eligible for this course.`,
                        "error"
                      );
                      return;
                    } else {
                      const user: Student = this.user;
                      const children = _.concat(user.children, [
                        { name: value[0], age: value[1] },
                      ]);
                      this.data
                        .updateUser({ children })
                        .subscribe(({ status, data: user }) => {
                          if (status === 200) {
                            this.user = user;
                            for (let i of this.user.children) {
                              if (i.name == value[0] && i.age == value[1]) {
                                this.data
                                  .addEnrollments({
                                    student: [i._id],
                                    student_family: this.user._id,
                                    course: this.lesson.course_id,
                                    lesson: this.lesson._id,
                                    // session: session_id,
                                    session: [session_id],
                                    teacher_name: this.lesson.teacher.name,
                                  })
                                  .subscribe((res) => {
                                    if (res && res.status == 200) {
                                      this.toastr.success(
                                        'Please go to my account to view your classes"',
                                        "Enrolled Successfully!",
                                        {
                                          timeOut: 5000,
                                        }
                                      );
                                      this.getData(
                                        this.lesson.course_id,
                                        this.lesson._id
                                      );
                                    } else {
                                      this.toastr.error("Error in enrolling");
                                    }
                                  });
                              }
                            }
                          } else {
                            this.toastr.error("Error in adding the child");
                          }
                        });
                    }
                  }
                });
            }
          });
        return;
      }
      const inputOptions = {};

      for (let i of this.user.children) {
        if (
          _.find(this.enrollments, {
            session: session_id,
            student: i._id,
          })
        ) {
          continue;
        }

        Object.defineProperty(inputOptions, i._id, {
          value: `${i.name} - ${i.age}`,
          writable: true,
          enumerable: true,
        });
      }

      if (!_.size(inputOptions)) {
        swal.fire({
          type: "info",
          title: "Enrolling",
          text: "All students are currently enrolled!",
        });
        return;
      }

      swal
        .fire({
          title: "Enrolling",
          text: "Please select children to enroll.",
          input: "select",
          inputOptions: inputOptions,
          inputPlaceholder: "Select children",
          showCancelButton: true,
          inputValidator: (value) => {
            return value ? "" : "You need to select something.";
          },
        })
        .then(async (res) => {
          if (res.value) {
            const { age: student_age } = _.find(this.user.children, {
              _id: res.value,
            }) as Kid;
            if (!(student_age >= min_age && student_age <= max_age)) {
              swal.fire(
                "Oops..",
                `Child's age is not eligible for this course.`,
                "error"
              );
              return;
            }

            this.data
              .addEnrollments({
                student: [res.value],
                student_family: this.user._id,
                course: this.lesson.course_id,
                lesson: this.lesson._id,
                // session: session_id,
                session: [session_id],
                teacher_name: this.lesson.teacher.name,
              })
              .subscribe((res) => {
                if (res && res.status == 200) {
                  this.toastr.success(
                    'Please go to my account to view your classes"',
                    "Enrolled Successfully!",
                    {
                      timeOut: 5000,
                    }
                  );
                  this.getData(this.lesson.course_id, this.lesson._id);
                } else {
                  this.toastr.error("Error in enrolling");
                }
              });
          }
        });
    } catch (e) {
      this.toastr.error(e.message);
    }
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
      .getReviews({ from: this.user._id, to: this.lesson._id })
      .subscribe((res) => {
        if (res && res.data) {
          this.canLeaveReviewSubject.next(!res.data.length);
        }
      });
  }
}
