import {HomepageSettings} from './../../../../interfaces/settings';
import {DataService} from 'src/app/services/data.service';
import {Bundle, Lesson} from './../../../../interfaces/course';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {State} from 'src/app/interfaces/enums';
import * as _ from 'lodash';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {environment} from "../../../../../environments/environment";

declare var $: any;

enum Tabs {
    Recommended = 1,
    Free = 2,
    ChineseInstructed = 3,
    EnglishInstructed = 4,
    Spanish = 5,
    Japanese = 6,
    All = 7
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
    isLoaded = true;
    initial_window_size = 0;

    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 3,
        // slidesToShow: ($(window).width()) < 600 ? 1.5 : 4,
        // slidesToScroll: ($(window).width()) < 600 ? 1 : 3,
        dots: true,
        prevArrow: false,
        nextArrow: false,
        infinite: false
    };
    // slideConfig = {'slidesToShow': 4, 'slidesToScroll': 4};
    searchForm: FormGroup;
    enrollForm: FormGroup;

    upcomingSession: any;
    featuredSession: any;
    categories: string[];

    title: string;

    social: any;

    _promotions: any[];
    promotions: any[];
    all_lessons: any[];
    _all_lessons: any[];

    free_promotions: any[];
    chinese_promotions: any[];
    english_promotions: any[];
    spanish_promotions: any[];
    japanese_promotions: any[];

    total_courses_cnt = 0;

    temp_empty_promotions: any[];
    hs: HomepageSettings = {};

    showFeaturedSession = false;

    divHeight = $(window).height() < 737 ? ($(window).height() < 500 ? 550 : $(window).height()) : 900;
    paddingTop = ($(window).height() - $('.header').height()) < 500 ? 100 : 150;

    Tabs = Tabs;
    currentTab = Tabs.Recommended;

    features: any[];
    testimonials: any[];
    partners: any[];

    transformCount = 0;
    previous_transformCount = 0;
    _bundles: Bundle[];
    bundles: Bundle[];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private toastr: ToastrService,
        private data: DataService
    ) {
        this.searchForm = this.fb.group({
            c: new FormControl(''),
            s: new FormControl(''),
            l: new FormControl('')
        });

        this.enrollForm = this.fb.group({
            name: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email])
        });
    }

    ngOnInit() {
        this.data.getUpcomingLesson().subscribe((res) => {
            if (res && res.data) {
                this.upcomingSession = res.data;

                this.getHomepageSettings();
            }
        });
        this.data.getFeatureTeachersForHome(4).subscribe((res) => {
            if (res && res.data) {
                this.features = res.data;            
            }
        });

        this.data.getLessons().subscribe((res) => {
            if (res && res.data) {
                this.total_courses_cnt = res.data.length;
                this.all_lessons = res.data;
                this._all_lessons = res.data;

            }
        });

        this.data.getTestimonialForHome().subscribe((res) => {
            if (res && res.data) {
                this.testimonials = res.data;
            }
        });
        this.data.getPartnersForHome().subscribe((res) => {
            if (res && res.data) {
                this.partners = res.data;
            }
        });
        this.updateSlidesToShow($(window).width())
        this.getFeatureBundles()
    }

    getFeatureBundles() {
        this.data.getFeatureBundles().subscribe((res) => {
            if (res && res.data) {
                this._bundles = _.filter(res.data, (v) => v.number_of_bundles * v.max_students_per_session - v.enrollment[0].length > 0);
                this.bundles = this._bundles.slice(0, 4);
            }
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        var window_width = event.target.innerWidth;
        this.updateSlidesToShow(window_width);
    }

    updateSlidesToShow(width: number) {
        if (width != this.initial_window_size) {
            this.initial_window_size = width;
            this.isLoaded = false;
            if (width > 1200 && width < 1350) {
                this.slideConfig.slidesToShow = 3.5;
                this.slideConfig.slidesToScroll = 3;
            }
            else if (width > 1000 && width < 1201) {
                this.slideConfig.slidesToShow = 3;
                this.slideConfig.slidesToScroll = 2;
            }
            else if (width > 850 && width < 1001) {
                this.slideConfig.slidesToShow = 2.5;
                this.slideConfig.slidesToScroll = 1;
            }
            else if (width > 700 && width < 851) {
                this.slideConfig.slidesToShow = 2;
                this.slideConfig.slidesToScroll = 1;
            }
            else if (width > 610 && width < 701) {
                this.slideConfig.slidesToShow = 1.7;
                this.slideConfig.slidesToScroll = 1;
            }
            else if (width > 520 && width < 611) {
                this.slideConfig.slidesToShow = 1.5;
                this.slideConfig.slidesToScroll = 1;
            }
            else if (width > 470 && width < 521) {
                this.slideConfig.slidesToShow = 1.3;
                this.slideConfig.slidesToScroll = 1;
            }
            else if (width > 440 && width < 470) {
                this.slideConfig.slidesToShow = 1.2;
                this.slideConfig.slidesToScroll = 1;
            }
            else if (width < 441) {
                this.slideConfig.slidesToShow = 1.1;
                this.slideConfig.slidesToScroll = 1;
            }
            else {
                this.slideConfig.slidesToShow = 4;
                this.slideConfig.slidesToScroll = 3;
            }
            this.transformCount = 0;
            setTimeout(() => this.isLoaded = true, 500);
        }
    }

    submit() {
        this.router.navigate(['/courses'], {
            queryParams: this.searchForm.value
        });
    }

    navigate(url) {
        this.router.navigate([url]);
    }

    async getHomepageSettings() {
        this.data.getSettings('configs').subscribe((res) => {
            if (res && res.data) {
                const hs = res.data;

                this.categories = hs.categories;

                if (environment.locale === 'zh' && hs.title_ch && hs.title_ch != "") {
                    this.title = hs.title_ch;
                } else {
                    this.title = hs.title;
                }
                this.social = hs.social;

                this.data.getAllPromotions().subscribe((res) => {
                    if (res && res.data) {
                        res.data.forEach(course_ele => {
                            var upcoming_sessions = course_ele.sessions.filter(item => {
                                return item.state == State.Active;
                            });
                            var upcoming_sessions_sorted = upcoming_sessions.sort((a, b) => <any>new Date(a.startTime) - <any>new Date(b.startTime));
                            course_ele.next_on_session = upcoming_sessions_sorted[0];
                        });
                        this.promotions = res.data;
                        this._promotions = res.data;
                    }
                });

                this.data.getFeatured().subscribe(async (res) => {
                    if (res) {
                        this.featuredSession = res.data;

                        if (this.featuredSession) {
                            this.featuredSession.attendees = (await this.data.getEnrollments({
                                state: State.Active,
                                session: this.featuredSession.session._id
                            }).pipe(map(res => res.data.length)));

                            this.featuredSession.daysLeft = {
                                number: _.first(_.split(moment(this.featuredSession.session.startTime).toNow(true), ' ')),
                                word: _.last(_.split(moment(this.featuredSession.session.startTime).toNow(true), ' '))
                            };
                        }
                    }
                });
            }
        });
    }

    truncateText(text: string, index, ellipsis) {
        var renderTo = document.getElementById('testimonial-block-with-text' + index);
        //Get height that a single character would take in this dom
        this.setDomText('A', renderTo);
        var lineHeight = renderTo.clientHeight || renderTo.scrollHeight;
        //Now set input text to renderTo
        this.setDomText(text, renderTo);
        //prevDiff and finalDiff hold the (scrollHeight-clientHeight) value
        var prevDiff = null;
        var finalDiff = renderTo.scrollHeight - renderTo.clientHeight;

        //diffCount maintains the number of times the prevDiff and finalDiff have remained equal.
        // This is needed to avoid condition where some text is truncated but the clientheight and scrollheight remains the same
        var diffCount = 0;

        //Ensuring that (scrollheight-clientHeight) difference is greater than zero and the diffCount has not increased to 2 to avoid any uncertain circumstances
        // such as scrollHeight always remaining greater than clientHeight
        // 2 is only an estimate
        while (finalDiff > 0 && diffCount != 2) {
            // get current text
            var txt = this.getDomText(renderTo);
            //Get total height of the current text
            var txtHeight = renderTo.scrollHeight;

            // Possible number of lines given the dom client height and lineHeight
            var numOfPossibleLines = Math.floor(renderTo.clientHeight / lineHeight);
            // The current actual number of lines
            var numOfTxtLines = Math.ceil(txtHeight / lineHeight);
            // Get the approximate text in a single line of this dom
            var approxTxtInALine = Math.floor(txt.length / numOfTxtLines);
            // numOfCharsToTruncate = approximate number of chars in a line * number of lines to truncate
            var numOfCharsToTruncate = approxTxtInALine * (numOfTxtLines - numOfPossibleLines);
            //Truncate text
            var newInnerText = txt.substr(0, txt.length - numOfCharsToTruncate);
            // append ellipsis to the end if not false
            if (ellipsis !== false) {
                newInnerText = newInnerText + '...';
            }
            //Finally replace dom text with new shortened text
            this.setDomText(newInnerText, renderTo);
            prevDiff = finalDiff;
            finalDiff = renderTo.scrollHeight - renderTo.clientHeight;
            if (finalDiff == prevDiff) {
                diffCount++;
            }
        }
        this.setDomText(newInnerText || text, renderTo);
    }

    /**
     * Sets the text in the Dom
     * {String}text
     * {dom Element} renderTo
     */
    setDomText(text, renderTo) {
        if (renderTo.textContent) {
            renderTo.textContent = text;
        }
        else {
            renderTo.innerText = text;
        }
    };

    /**
     * Gets textContent/innerText of dom
     * {dom Element} renderTo
     * @returns {String} text
     */
    getDomText(renderTo) {
        return (renderTo.textContent || renderTo.innerText);
    };

    enroll() {
        try {
            if (this.enrollForm.invalid) {
                throw Error('Form is invalid.');
            }

            const {value} = this.enrollForm;

            this.router.navigate(['/authentication/signup'], {
                queryParams: {
                    name: value.name,
                    email: value.email,
                    type: 'student'
                }
            });

        } catch ({message}) {
            this.toastr.error(message);
        }
    }

    clickTab(tab) {
        this.currentTab = tab;
        this.transformCount = 0;
        if (this.currentTab == Tabs.Recommended) {
            this.promotions = this._promotions;
            this.free_promotions = this.temp_empty_promotions;
            this.chinese_promotions = this.temp_empty_promotions;
            this.english_promotions = this.temp_empty_promotions;
            this.all_lessons = this.temp_empty_promotions;
            this.japanese_promotions = this.temp_empty_promotions;
            this.spanish_promotions = this.temp_empty_promotions;
        }
        else if (this.currentTab == Tabs.Free) {
            this.promotions = this.temp_empty_promotions;
            this.free_promotions = _.filter(this._promotions, (v) => v.credits_per_session == 0);
            this.chinese_promotions = this.temp_empty_promotions;
            this.english_promotions = this.temp_empty_promotions;
            this.all_lessons = this.temp_empty_promotions;
            this.japanese_promotions = this.temp_empty_promotions;
            this.spanish_promotions = this.temp_empty_promotions;

        }
        else if (this.currentTab == Tabs.ChineseInstructed) {
            this.promotions = this.temp_empty_promotions;
            this.free_promotions = this.temp_empty_promotions;
            this.chinese_promotions = _.filter(this._promotions, (v) => v.course.language == 'Chinese');
            this.english_promotions = this.temp_empty_promotions;
            this.japanese_promotions = this.temp_empty_promotions;
            this.spanish_promotions = this.temp_empty_promotions;
            this.all_lessons = this.temp_empty_promotions;

        }
        else if (this.currentTab == Tabs.EnglishInstructed) {
            this.promotions = this.temp_empty_promotions;
            this.free_promotions = this.temp_empty_promotions;
            this.chinese_promotions = this.temp_empty_promotions;
            this.english_promotions = _.filter(this._promotions, (v) => v.course.language == 'English');
            this.japanese_promotions = this.temp_empty_promotions;
            this.spanish_promotions = this.temp_empty_promotions;
            this.all_lessons = this.temp_empty_promotions;

        }
        else if (this.currentTab == Tabs.Spanish) {
            this.promotions = this.temp_empty_promotions;
            this.free_promotions = this.temp_empty_promotions;
            this.spanish_promotions = _.filter(this._promotions, (v) => v.course.language == 'Spanish');
            this.english_promotions = this.temp_empty_promotions;
            this.chinese_promotions = this.temp_empty_promotions;
            this.japanese_promotions = this.temp_empty_promotions;
            this.all_lessons = this.temp_empty_promotions;

        }
        else if (this.currentTab == Tabs.Japanese) {
            this.promotions = this.temp_empty_promotions;
            this.free_promotions = this.temp_empty_promotions;
            this.chinese_promotions = this.temp_empty_promotions;
            this.japanese_promotions = _.filter(this._promotions, (v) => v.course.language == 'Japanese');
            this.english_promotions = this.temp_empty_promotions;
            this.spanish_promotions = this.temp_empty_promotions;
            this.all_lessons = this.temp_empty_promotions;

        }
        else if (this.currentTab == Tabs.All) {
            this.all_lessons = this._all_lessons;
            this.promotions = this.temp_empty_promotions;
            this.free_promotions = this.temp_empty_promotions;
            this.chinese_promotions = this.temp_empty_promotions;
            this.english_promotions = this.temp_empty_promotions;
            this.japanese_promotions = this.temp_empty_promotions;
            this.spanish_promotions = this.temp_empty_promotions;
        }
    }

    slickInit(e) {
        var slickSlider = $('ngx-slick-carousel');
        slickSlider.find('ul.slick-dots li').each(function (index) {
            $(this).addClass('dot-index-' + index);
        });
        slickSlider.find('ul.slick-dots').css('transform', 'translateX(0)');
        slickSlider.find('ul.slick-dots li').eq(3).addClass('n-small-1');
    }

    breakpoint(e) {
        console.log('breakpoint');
    }

    afterChange(e) {       
        var slickSlider = $('ngx-slick-carousel');
        var transformCount = this.transformCount;
        if (transformCount != this.previous_transformCount) {
            slickSlider.find('ul.slick-dots li').each(function () {
                $(this).css('transform', 'translateX(' + transformCount + 'px)');
                if ($(this).hasClass('n-small-1') || $(this).hasClass('p-small-1')) {
                    $(this).css('transform', 'translateX(' + transformCount + 'px) scale(0.5)');
                }
                if ($(this).hasClass('slick-active')) {
                    $(this).css('transform', 'translateX(' + transformCount + 'px) scale(1.3)');
                }
                if ($(this).hasClass('n-small-1') && $(this).hasClass('slick-active')) {
                    $(this).css('transform', 'translateX(' + transformCount + 'px) scale(1.3)');
                }
            });
        }

    }

    beforeChange(e) {      
        var slickSlider = $('ngx-slick-carousel');
        var maxDots = 4;
        var transformXInterval = 30;
        var totalCount = slickSlider.find('ul.slick-dots li').length;

        if (totalCount > maxDots) {
            // var currentSlide = ($(window).width()) < 600 ? e.currentSlide : parseInt(e.currentSlide) / this.slideConfig.slidesToScroll;
            // var nextSlide = ($(window).width()) < 600 ? e.nextSlide : parseInt(e.nextSlide) / this.slideConfig.slidesToScroll;
            var currentSlide = parseInt(e.currentSlide) / this.slideConfig.slidesToScroll;
            var nextSlide = parseInt(e.nextSlide) / this.slideConfig.slidesToScroll;

            if (nextSlide > currentSlide) {
                if (slickSlider.find('ul.slick-dots li.dot-index-' + nextSlide).hasClass('n-small-1')) {
                    if (!slickSlider.find('ul.slick-dots li:last-child').hasClass('n-small-1')) {
                        this.previous_transformCount = this.transformCount;
                        this.transformCount = this.transformCount - transformXInterval;
                        slickSlider.find('ul.slick-dots li.dot-index-' + nextSlide).removeClass('n-small-1');
                        const nextSlidePlusOne = nextSlide + 1;
                        slickSlider.find('ul.slick-dots li.dot-index-' + nextSlidePlusOne).addClass('n-small-1');
                        var pPointer = nextSlide - 2;
                        var pPointerMinusOne = pPointer - 1;
                        slickSlider.find('ul.slick-dots li').eq(pPointerMinusOne).removeClass('p-small-1');
                        slickSlider.find('ul.slick-dots li').eq(pPointer).addClass('p-small-1');
                    }
                }
            }
            else {
                if (slickSlider.find('ul.slick-dots li.dot-index-' + nextSlide).hasClass('p-small-1')) {
                    if (!slickSlider.find('ul.slick-dots li:first-child').hasClass('p-small-1')) {
                        this.previous_transformCount = this.transformCount;
                        this.transformCount = this.transformCount + transformXInterval;
                        slickSlider.find('ul.slick-dots li.dot-index-' + nextSlide).removeClass('p-small-1');
                        const nextSlidePlusOne = nextSlide - 1;
                        slickSlider.find('ul.slick-dots li.dot-index-' + nextSlidePlusOne).addClass('p-small-1');
                        var nPointer = nextSlide + 2;
                        var nPointerMinusOne = nPointer + 1;
                        slickSlider.find('ul.slick-dots li').eq(nPointerMinusOne).removeClass('n-small-1');
                        slickSlider.find('ul.slick-dots li').eq(nPointer).addClass('n-small-1');
                    }
                }
            }
        }
    }

    isValidTime(time) {
        return moment('1970-01-01' + time).isValid();
    }


    make_date_string(date_array) {
        if (date_array.length > 1) {
            return date_array[0].date;
        } else {
            return _.map(date_array, v => v.date).join(', ');
        }
    }
}
