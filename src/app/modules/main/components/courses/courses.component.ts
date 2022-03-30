import {DataService} from 'src/app/services/data.service';
import {BreadCrumb} from './../../../../interfaces/main';
import {ActivatedRoute} from '@angular/router';
import {State, View} from './../../../../interfaces/enums';
import {FormControl} from '@angular/forms';
import {Lesson} from './../../../../interfaces/course';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';


import * as _ from 'lodash';

declare var $: any;

enum CourseTabs {
    All = 1,
    Chinese = 2,
    English = 3,
    Spanish = 4,
    Japanese = 5

}

@Component({
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
    coinwallet: string[] = ['wallet1', 'wallet2'];
    selectedwallet = this.coinwallet[0];

    View = View;
    _lessons: any[];
    lessons: any[];
    categories: any[];
    courseMainHeight = 0;
    currentPage = 1;
    totalItemsPerPage = 18;

    viewState: View = View.Grid;

    breadcrumbs: BreadCrumb[] = [{
        link: 'Home',
        url: ['/']
    }, {
        link: 'Courses'
    }];

    searchForm: any;

    CourseTabs = CourseTabs;
    currentTab = CourseTabs.All;
    currentCategory = '';
    search_key = '';


    constructor(
        private data: DataService,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }

    async ngOnInit() {
        const {queryParams: params} = this.route.snapshot;

        // begin: if url has queryParams, set them to the variables
        this.search_key = params && params.search_key ? params.search_key : '';
        this.searchForm = new FormControl(this.search_key);
        this.currentCategory = params && params.search_category ? params.search_category : '';
        this.currentTab = params && params.search_tab ? params.search_tab : CourseTabs.All;       
   
        // end:

        await this.getCourses();
        this.getCategories();

        this.searchForm.valueChanges.subscribe(async (search_key) => {
            this.search_key = search_key;            
            this.currentPage =1;
            const queryParams = {
                search_tab: this.currentTab,
                search_category: this.currentCategory,
                search_key: this.search_key                
            };
            this.changeUrl(queryParams);
            this.filter();

        });

        this.route.params.subscribe(async (p) => {
            if (p.page) {
                this.currentPage = p.page;
            } 
        });
    }

    async selectCategory(categoryName) {
        this.currentCategory = categoryName;    
        this.currentPage =1;
        const queryParams = {
            search_tab: this.currentTab,
            search_category: this.currentCategory,
            search_key: this.search_key           
        };
        this.changeUrl(queryParams);
        this.filter();
    }

    clickTab(tab) {
        this.currentTab = tab;        
        this.currentPage =1;
        const queryParams = {
            search_tab: this.currentTab,
            search_category: this.currentCategory,
            search_key: this.search_key          
        };
      
        this.changeUrl(queryParams);
        this.filter();
    }

    async getCourses() {
        this.data.getLessons().subscribe((res) => {
            if (res && res.data) {
                let show_lessons = res.data.filter(item=>{  //filter the classes should show on front end
                    if(item.show_on_front == undefined){
                        return item
                    }
                    else{
                        return item.show_on_front == true;
                    }                    
                });
                show_lessons.forEach(course_ele => {
                    var upcoming_sessions = course_ele.sessions.filter(item => {
                        return item.state == State.Active;
                    });
                    var upcoming_sessions_sorted = upcoming_sessions.sort((a, b) => <any>new Date(a.startTime) - <any>new Date(b.startTime));
                    course_ele.next_on_session = upcoming_sessions_sorted[0];
                });
            
                this._lessons = show_lessons;
                this.lessons = this._lessons;

                this.filter();
            }
        });
    }

    getCategories() {
        this.data.getCategories().subscribe((res) => {
            if (res && res.data) {
                this.categories = res.data;
                this.categories.map(item => {
                    if (item.name.toLowerCase() == 'all' && this.currentCategory == '') {
                        this.currentCategory = item.name;
                    }
                });
            }
        });
    }
  

    filter() {
        // if (this.route.snapshot.queryParams) {
        //     const {queryParams: params} = this.route.snapshot;
        //     let data = this._lessons;
        //     if (params.l) {
        //         data = _.filter(data, (v) => _.lowerCase(v.course.language) === _.lowerCase(params.l));
        //     }
        //     if (params.c) {
        //         data = _.filter(data, (v) => _.lowerCase(v.course.category) === _.lowerCase(params.c));
        //     }
        //     if (params.s) {
        //         const s = _.replace(params.s, '>=', '');
        //
        //         if (!Number.isNaN(parseInt(s))) {
        //             if (parseInt(s) === 1) {
        //                 data = _.filter(data, (v) => v.course.max_students === 1);
        //             } else if (parseInt(s) === 2) {
        //                 data = _.filter(data, (v) => v.course.max_students >= 2);
        //             }
        //         }
        //     }
        //     this.lessons = data;
        // }

        if (this.search_key != "") {
            // const previous_course_search_key = localStorage.getItem('course_search_key');
            if (this.currentTab == this.CourseTabs.All) {
                this.lessons = _.filter(this._lessons, (i) => i.course &&
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
            else if (this.currentTab == this.CourseTabs.Chinese) {
                var temp_lessons = _.filter(this._lessons, (v) => v.course.language == 'Chinese');
                this.lessons = _.filter(temp_lessons, (i) => i.course &&
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
            else if (this.currentTab == this.CourseTabs.English) {
                var temp_lessons = _.filter(this._lessons, (v) => v.course.language == 'English');
                this.lessons = _.filter(temp_lessons, (i) => i.course &&
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
            else if (this.currentTab == this.CourseTabs.Spanish) {
                var temp_lessons = _.filter(this._lessons, (v) => v.course.language == 'Spanish');
                this.lessons = _.filter(temp_lessons, (i) => i.course &&
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
            else if (this.currentTab == this.CourseTabs.Japanese) {
                var temp_lessons = _.filter(this._lessons, (v) => v.course.language == 'Japanese');
                this.lessons = _.filter(temp_lessons, (i) => i.course &&
                    (i.course.topic && String.prototype.search.call(i.course.topic, new RegExp(this.search_key, 'i')) !== -1) ||
                    (i.course.topic_ch && String.prototype.search.call(i.course.topic_ch, new RegExp(this.search_key, 'i')) !== -1));
            }
        } else {
            if (this.currentTab == this.CourseTabs.All) {
                this.lessons = this._lessons;
            }
            else if (this.currentTab == this.CourseTabs.Chinese) {
                this.lessons = _.filter(this._lessons, (v) => v.course.language == 'Chinese');
            }
            else if (this.currentTab == this.CourseTabs.English) {
                this.lessons = _.filter(this._lessons, (v) => v.course.language == 'English');
            }
            else if (this.currentTab == this.CourseTabs.Spanish) {
                this.lessons = _.filter(this._lessons, (v) => v.course.language == 'Spanish');
            }
            else if (this.currentTab == this.CourseTabs.Japanese) {
                this.lessons = _.filter(this._lessons, (v) => v.course.language == 'Japanese');
            }
        }
        if (this.currentCategory != '') {
            if (this.currentTab == this.CourseTabs.All) {
                if (this.currentCategory.toLowerCase() == "all") {
                    this.lessons = this.lessons;
                } else {
                    this.lessons = _.filter(this.lessons, (v) => v.course.category == this.currentCategory);
                }
            }
            else if (this.currentTab == this.CourseTabs.Chinese) {
                var temp_lessons = _.filter(this.lessons, (v) => v.course.language == 'Chinese');
                if (this.currentCategory.toLowerCase() == "all") {
                    this.lessons = temp_lessons;
                } else {
                    this.lessons = _.filter(temp_lessons, (v) => v.course.category == this.currentCategory);
                }
            }
            else if (this.currentTab == this.CourseTabs.English) {
                var temp_lessons = _.filter(this.lessons, (v) => v.course.language == 'English');
                if (this.currentCategory.toLowerCase() == "all") {
                    this.lessons = temp_lessons;
                } else {
                    this.lessons = _.filter(temp_lessons, (v) => v.course.category == this.currentCategory);
                }
            }
            else if (this.currentTab == this.CourseTabs.Spanish) {
                var temp_lessons = _.filter(this.lessons, (v) => v.course.language == 'Spanish');
                if (this.currentCategory.toLowerCase() == "all") {
                    this.lessons = temp_lessons;
                } else {
                    this.lessons = _.filter(temp_lessons, (v) => v.course.category == this.currentCategory);
                }
            }
            else if (this.currentTab == this.CourseTabs.Japanese) {
                var temp_lessons = _.filter(this.lessons, (v) => v.course.language == 'Japanese');
                if (this.currentCategory.toLowerCase() == "all") {
                    this.lessons = temp_lessons;
                } else {
                    this.lessons = _.filter(temp_lessons, (v) => v.course.category == this.currentCategory);
                }
            }
        }
    }

    navigate(route) {
        this.router.navigate(route);
    }

    changeUrl(queryParams) {
        // this.location.replaceState(url);
        this.router.navigate(['/courses/1'],
            {
                queryParams: queryParams,
            });
    }
    paginate(page_index){
        // this.currentPage = page_index;
        const queryParams = {
            search_tab: this.currentTab,
            search_category: this.currentCategory,
            search_key: this.search_key           
        };
        this.router.navigate(['/courses/'+page_index],
        {
            queryParams: queryParams,
        });   
    }
}
