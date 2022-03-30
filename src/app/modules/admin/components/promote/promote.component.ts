import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "./../../../../services/auth.service";
import { Course } from "./../../../../interfaces/course";
import { DataService } from "src/app/services/data.service";
import * as _ from "lodash";
import { MatDialog } from "@angular/material";
import { SearchComponent } from "../../../shared/components/search/search.component";
import { FileSystemFileEntry, UploadEvent } from "ngx-file-drop";
import * as uuid from "uuid/v1";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

enum Fields {
  Topic = "topic",
}
@Component({
  selector: 'ngbd-modal-content',
  templateUrl: "./modal.component.html",   
  styles: [`
   .modal-body{
     text-align:center
   }   
`]
})
export class NgbdModalContent {
  @Input() src;

  constructor(public activeModal: NgbActiveModal) {}
}

@Component({
  selector: "app-promote",
  templateUrl: "./promote.component.html",
  styleUrls: ["./promote.component.sass"],
})
export class PromoteComponent implements OnInit {
  user;

  _data: Course[];
  data: Course[];

  pager = {
    currentPage: 1,
    totalPages: 0,
    pages: [],
    totals: 0,
  };
  pagination_pages = [];
  has_previous_five_page = false;
  has_next_five_page = false;
  is_first_load = 1;

  currentPage = 1;
  totalItemsPerPage = 20;
  currentFilter = {
    field: "",
    value: "",
  };

  constructor(
    private db: DataService,
    private auth: AuthService,
    private dialog: MatDialog,
    private Data: DataService,
    private modalService: NgbModal
  ) {}

  async ngOnInit() {
    this.auth.getUser2().subscribe((user: any) => {
      this.user = user;
      this.getData(1);
    });
  }
  public dropped(event: UploadEvent, courseId) {
    try {
      const droppedFile = event.files[0];

      if (!droppedFile || !droppedFile.fileEntry.isFile) {
        return;
      }
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

      fileEntry.file(async (file: File) => {
        if (_.startsWith(file.type, "image")) {
          let key = uuid();

          key = `${key}.${_.last(_.split(file.name, "."))}`;         

          const res = await this.Data.presignS3File(key, file.type).toPromise();

          if (!res || !res.AWSurl || !res.AWSurl_ch) {
              throw Error('Something went wrong.');
          }

          await this.Data.uploadS3File(res.AWSurl, file).toPromise();
          await this.Data.uploadS3File(res.AWSurl_ch, file).toPromise();
          var pictureData = {
            promoter_picture: "",
          };
          pictureData.promoter_picture = key;          
          await this.Data.updateCoursePromoterPicture(
            courseId,
            pictureData
          ).subscribe((res) => {
            if (res) {    
              this.data = _.map(this.data, (v) =>
                v._id === courseId ? { ...v, promoter_picture: key } : v
              );
            }
          });
      
        }
      });

    } catch ({ message }) {
      console.log(message);
    }
  }
  getData(page, search_key = this.currentFilter) {
    const query: any = {
      orderBy: "date",
    };

    if (this.user.adminSchool) {
      query.school = this.user.adminSchool["_id"];
    }

    this.currentPage = page;
    this.db
      .getCoursesByPaginate(query, this.is_first_load, page, search_key)
      .subscribe((res) => {
        this._data = res.data;
        this.data = this._data;

        if (this.is_first_load === 1) {
          this.pager = res.pager;
          this.is_first_load = 0;
        }
        this.makePages(page, this.pager);
      });
  }

  makePages(page, pager) {
    var pages = [];
    var start_page = 1;
    var end_page = 5;

    if (parseInt(page) >= 3) {
      start_page = parseInt(page) - 2;
      // BEGIN: calculate end_page
      if (parseInt(page) + 2 <= parseInt(pager.pages[pager.pages.length - 1])) {
        end_page = parseInt(page) + 2;
        this.has_next_five_page = true;
      } else {
        end_page = pager.pages[pager.pages.length - 1];
        this.has_next_five_page = false;
      }
      // END:
    } else {
      if (parseInt(pager.pages[pager.pages.length - 1]) <= 5) {
        end_page = parseInt(pager.pages[pager.pages.length - 1]);
        this.has_next_five_page = false;
      } else {
        end_page = 5;
        this.has_next_five_page = true;
      }
    }
    if (start_page > 1) {
      this.has_previous_five_page = true;
    } else {
      this.has_previous_five_page = false;
    }
    for (let i = start_page; i <= end_page; i++) {
      pages.push(i);
    }
    this.pagination_pages = pages;
  }

  search() {
    const ref = this.dialog.open(SearchComponent, {
      width: "600px",
      data: [
        {
          key: Fields.Topic,
          value: "Topic",
        },
      ],
    });
    ref.beforeClose().subscribe((filter) => {
      if (filter) {
        this.currentFilter = filter;
        this.is_first_load = 1;
        this.getData(1, filter);
      }
    });
  }

  open_picture(src) {
    var NgbModalOptions ={
      size:'lg'
    }
    const modalRef = this.modalService.open(NgbdModalContent,{size: 'lg'});
    modalRef.componentInstance.src = src;
  }

  clearSearch() {
    this.currentFilter = {
      field: "",
      value: "",
    };
    this.is_first_load = 1;
    this.getData(1, this.currentFilter);
  }

  filter(filter?: any) {
    this.currentFilter = filter;

    if (!filter) {
      this.data = this._data;
      return;
    }

    const { field, value } = filter;
 

    switch (field) {
      case Fields.Topic: {
        const regex = new RegExp(value, "i");
        this.data = _.filter(this._data, (v) => regex.test(v.topic));
        break;
      }
      default: {
        this.data = this._data;
      }
    }
  }
}
